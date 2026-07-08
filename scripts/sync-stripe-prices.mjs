import Stripe from 'stripe'

// Configuration
const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090'
const ADMIN_EMAIL = process.argv[2] || process.env.PB_ADMIN_EMAIL || 'admin@instantgrow.net'
const ADMIN_PASS = process.argv[3] || process.env.PB_ADMIN_PASSWORD || 'Admin@2025!'
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY

if (!STRIPE_SECRET_KEY) {
  console.error('\n❌ Error: STRIPE_SECRET_KEY environment variable is not set.\n')
  process.exit(1)
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2023-10-16', // Match standard Stripe API version
})

// ---------------------------------------------------------------------------
// PocketBase Auth Helper
// ---------------------------------------------------------------------------

async function getAdminToken() {
  console.log(`🔐 Authenticating to PocketBase admin API at ${PB_URL}...`)
  
  // 1. Try superusers auth
  let res = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASS }),
  })
  
  if (res.ok) {
    const data = await res.json()
    return data.token
  }
  
  // 2. Try legacy admin auth
  res = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASS }),
  })
  
  if (res.ok) {
    const data = await res.json()
    return data.token
  }
  
  const errText = await res.text()
  throw new Error(`Admin authentication failed: ${res.status} ${errText}`)
}

// ---------------------------------------------------------------------------
// Main Synchronizer Logic
// ---------------------------------------------------------------------------

async function syncServices(token) {
  console.log('\n⚙️ Fetching services collection from database...')
  const res = await fetch(`${PB_URL}/api/collections/services/records?perPage=200`, {
    headers: { Authorization: token },
  })
  
  if (!res.ok) {
    throw new Error(`Failed to fetch services: ${res.statusText}`)
  }
  
  const data = await res.json()
  const services = data.items || []
  
  console.log(`🔍 Found ${services.length} services to verify with Stripe.`)
  
  for (const service of services) {
    // Only sync paid services
    const price = Number(service.price || 0)
    if (price <= 0) {
      console.log(`⚪ Skipping free service: ${service.title_en} ($${price})`)
      continue
    }
    
    let stripeProductId = service.stripe_product_id || ''
    let stripePriceId = service.stripe_price_id || ''
    let needUpdate = false
    
    console.log(`\n💼 Syncing: "${service.title_en}" (price: $${price})`)
    
    // 1. Resolve Stripe Product
    if (stripeProductId) {
      try {
        const prod = await stripe.products.retrieve(stripeProductId)
        // If details differ, update product on Stripe
        if (prod.name !== service.title_en || prod.description !== service.description_en) {
          console.log(`🔄 Updating product details on Stripe for: ${stripeProductId}`)
          await stripe.products.update(stripeProductId, {
            name: service.title_en,
            description: service.description_en || undefined,
          })
        }
      } catch (err) {
        console.warn(`⚠️ Stored product ID ${stripeProductId} not found on Stripe. Re-creating...`)
        stripeProductId = ''
      }
    }
    
    if (!stripeProductId) {
      console.log(`🌱 Creating new Stripe Product for: "${service.title_en}"`)
      const prod = await stripe.products.create({
        name: service.title_en,
        description: service.description_en || undefined,
        metadata: {
          service_id: service.id,
        },
      })
      stripeProductId = prod.id
      needUpdate = true
    }
    
    // 2. Resolve Stripe Price
    let priceIsValid = false
    if (stripePriceId) {
      try {
        const priceObj = await stripe.prices.retrieve(stripePriceId)
        // Verify price amount matches database
        if (priceObj.unit_amount === Math.round(price * 100) && priceObj.active) {
          priceIsValid = true
        } else {
          console.log(`💰 Stripe price mismatch ($${(priceObj.unit_amount || 0) / 100} vs $${price}). Creating new price...`)
          // Archive old price
          await stripe.prices.update(stripePriceId, { active: false })
        }
      } catch (err) {
        console.warn(`⚠️ Stored price ID ${stripePriceId} not found on Stripe. Re-creating...`)
      }
    }
    
    if (!priceIsValid) {
      console.log(`🌱 Creating new Stripe Price of $${price} for Product: ${stripeProductId}`)
      const priceObj = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: Math.round(price * 100),
        currency: 'usd',
      })
      stripePriceId = priceObj.id
      needUpdate = true
    }
    
    // 3. Update PocketBase record if values changed
    if (needUpdate || service.stripe_product_id !== stripeProductId || service.stripe_price_id !== stripePriceId) {
      console.log(`💾 Updating PocketBase service record: ${service.id}`)
      const updateRes = await fetch(`${PB_URL}/api/collections/services/records/${service.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({
          stripe_product_id: stripeProductId,
          stripe_price_id: stripePriceId,
        }),
      })
      if (!updateRes.ok) {
        const errText = await updateRes.text()
        console.error(`❌ Failed to update service ${service.id}: ${updateRes.status} ${errText}`)
      } else {
        console.log(`✅ Synced: ${stripeProductId} / ${stripePriceId}`)
      }
    } else {
      console.log(`✅ Already synchronized: ${stripeProductId} / ${stripePriceId}`)
    }
  }
}

async function syncPricingConfig(token) {
  console.log('\n⚙️ Fetching pricing_config collection from database...')
  const res = await fetch(`${PB_URL}/api/collections/pricing_config/records?perPage=50`, {
    headers: { Authorization: token },
  })
  
  if (!res.ok) {
    throw new Error(`Failed to fetch pricing config: ${res.statusText}`)
  }
  
  const data = await res.json()
  const configs = data.items || []
  
  console.log(`🔍 Found ${configs.length} formation plans to verify with Stripe.`)
  
  for (const config of configs) {
    const price = Number(config.price || 0)
    const planName = `${config.region.toUpperCase()} Company Formation (${config.plan.toUpperCase()} Plan)`
    
    let stripeProductId = config.stripe_product_id || ''
    let stripePriceId = config.stripe_price_id || ''
    let needUpdate = false
    
    console.log(`\n📦 Plan: "${planName}" (price: $${price})`)
    
    // 1. Resolve Stripe Product
    if (stripeProductId) {
      try {
        const prod = await stripe.products.retrieve(stripeProductId)
        if (prod.name !== planName) {
          console.log(`🔄 Updating product details on Stripe for: ${stripeProductId}`)
          await stripe.products.update(stripeProductId, { name: planName })
        }
      } catch (err) {
        console.warn(`⚠️ Stored product ID ${stripeProductId} not found on Stripe. Re-creating...`)
        stripeProductId = ''
      }
    }
    
    if (!stripeProductId) {
      console.log(`🌱 Creating new Stripe Product for: "${planName}"`)
      const prod = await stripe.products.create({
        name: planName,
        metadata: {
          pricing_config_id: config.id,
          region: config.region,
          plan: config.plan,
        },
      })
      stripeProductId = prod.id
      needUpdate = true
    }
    
    // 2. Resolve Stripe Price
    let priceIsValid = false
    if (stripePriceId) {
      try {
        const priceObj = await stripe.prices.retrieve(stripePriceId)
        if (priceObj.unit_amount === Math.round(price * 100) && priceObj.active) {
          priceIsValid = true
        } else {
          console.log(`💰 Stripe price mismatch ($${(priceObj.unit_amount || 0) / 100} vs $${price}). Creating new price...`)
          await stripe.prices.update(stripePriceId, { active: false })
        }
      } catch (err) {
        console.warn(`⚠️ Stored price ID ${stripePriceId} not found on Stripe. Re-creating...`)
      }
    }
    
    if (!priceIsValid) {
      console.log(`🌱 Creating new Stripe Price of $${price} for Product: ${stripeProductId}`)
      const priceObj = await stripe.prices.create({
        product: stripeProductId,
        unit_amount: Math.round(price * 100),
        currency: 'usd',
      })
      stripePriceId = priceObj.id
      needUpdate = true
    }
    
    // 3. Update PocketBase record if values changed
    if (needUpdate || config.stripe_product_id !== stripeProductId || config.stripe_price_id !== stripePriceId) {
      console.log(`💾 Updating PocketBase pricing_config record: ${config.id}`)
      const updateRes = await fetch(`${PB_URL}/api/collections/pricing_config/records/${config.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: token,
        },
        body: JSON.stringify({
          stripe_product_id: stripeProductId,
          stripe_price_id: stripePriceId,
        }),
      })
      if (!updateRes.ok) {
        const errText = await updateRes.text()
        console.error(`❌ Failed to update pricing config ${config.id}: ${updateRes.status} ${errText}`)
      } else {
        console.log(`✅ Synced: ${stripeProductId} / ${stripePriceId}`)
      }
    } else {
      console.log(`✅ Already synchronized: ${stripeProductId} / ${stripePriceId}`)
    }
  }
}

// ---------------------------------------------------------------------------
// Main Execution
// ---------------------------------------------------------------------------

async function main() {
  try {
    const token = await getAdminToken()
    await syncServices(token)
    await syncPricingConfig(token)
    console.log('\n🏆 Stripe Synchronization Completed Successfully!\n')
  } catch (err) {
    console.error('\n❌ Seeding failed:', err.message)
    process.exit(1)
  }
}

main()

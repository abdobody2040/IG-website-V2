const fs = require('fs')
const path = require('path')

// Load .env.local manually since this script runs as a separate node process
const envPath = path.resolve(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8')
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=')
      if (eqIdx > 0) {
        const key = trimmed.slice(0, eqIdx).trim()
        const val = trimmed.slice(eqIdx + 1).trim()
        if (!process.env[key]) process.env[key] = val
      }
    }
  })
}

const SITE_URL = process.env.VITE_APP_URL || 'https://instantgrow.net'
const PB_URL = process.env.VITE_PB_URL || 'http://127.0.0.1:8090'

async function fetchRecords(collectionName) {
  const url = `${PB_URL}/api/collections/${collectionName}/records?filter=published%3Dtrue&fields=slug,updated&perPage=500`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP error ${res.status} fetching ${collectionName}`)
  const json = await res.json()
  return json.items || []
}

function copyStaticAssets(distDir, publicDir) {
  const assets = ['sitemap.xml', 'logo.png', 'logo.webp', 'og-image.png', 'favicon.ico', 'robots.txt']
  assets.forEach(file => {
    const src = path.join(publicDir, file)
    const dest = path.join(distDir, file)
    if (fs.existsSync(src)) {
      fs.copyFileSync(src, dest)
    }
  })
}

async function main() {
  const distDir = path.resolve(__dirname, '..', 'dist')
  const publicDir = path.resolve(__dirname, '..', 'public')
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true })

  // Always copy static public files (sitemap.xml, logo.webp, etc.) first
  copyStaticAssets(distDir, publicDir)

  try {
    const [blogs, seoPages] = await Promise.all([
      fetchRecords('blogs'),
      fetchRecords('countries_seo_pages'),
    ])

    const urls = []
    const add = (loc, priority, changefreq, lastmod) => {
      urls.push(`  <url>\n    <loc>${loc}</loc>\n    <priority>${priority}</priority>\n    <changefreq>${changefreq}</changefreq>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`)
    }

    add(`${SITE_URL}/`, '1.0', 'weekly')
    add(`${SITE_URL}/services`, '0.9', 'weekly')
    add(`${SITE_URL}/us-company`, '0.9', 'weekly')
    add(`${SITE_URL}/us-company/wyoming`, '0.85', 'weekly')
    add(`${SITE_URL}/us-company/delaware`, '0.85', 'weekly')
    add(`${SITE_URL}/blog`, '0.8', 'weekly')
    add(`${SITE_URL}/contact`, '0.6', 'monthly')
    add(`${SITE_URL}/privacy-policy`, '0.4', 'monthly')
    add(`${SITE_URL}/terms`, '0.4', 'monthly')
    add(`${SITE_URL}/refund-policy`, '0.4', 'monthly')
    add(`${SITE_URL}/disclaimer`, '0.4', 'monthly')
    add(`${SITE_URL}/accessibility`, '0.4', 'monthly')
    add(`${SITE_URL}/kyc-aml`, '0.4', 'monthly')
    add(`${SITE_URL}/form-llc`, '0.75', 'monthly')

    blogs.forEach(b => add(`${SITE_URL}/blog/${b.slug}`, '0.7', 'monthly', b.updated?.split('T')[0]))
    seoPages.forEach(s => add(`${SITE_URL}/us-company/${s.slug}`, '0.9', 'monthly', s.updated?.split('T')[0]))

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), xml, 'utf-8')
    console.log(`sitemap.xml generated with ${urls.length} URLs`)
  } catch (err) {
    console.log(`ℹ️ PocketBase offline — copied static public/sitemap.xml to dist/sitemap.xml`)
  }
}

main().catch(err => {
  console.warn('⚠️ Warning during sitemap generation:', err.message || err)
  process.exit(0)
})

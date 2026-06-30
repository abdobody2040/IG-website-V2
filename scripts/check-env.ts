/**
 * Check required environment variables are set.
 * Run: npx tsx scripts/check-env.ts
 */

const requiredClientVars = [
  'VITE_SUPABASE_URL',
  'VITE_SUPABASE_ANON_KEY',
]

const optionalClientVars = [
  'VITE_CHECKOUT_ENDPOINT',
  'VITE_R2_UPLOAD_ENDPOINT',
  'VITE_EMAIL_ENDPOINT',
  'VITE_TURNSTILE_SITE_KEY',
  'VITE_CONTACT_ENDPOINT',
  'VITE_DELETE_USER_ENDPOINT',
]

let hasError = false

console.log('\n🔍 Checking environment variables...\n')

for (const key of requiredClientVars) {
  if (!import.meta.env[key]) {
    console.error(`❌ MISSING: ${key} is required`)
    hasError = true
  } else {
    console.log(`✅ ${key} is set`)
  }
}

for (const key of optionalClientVars) {
  if (!import.meta.env[key]) {
    console.log(`⚠️  ${key} is not set (optional - feature will be disabled)`)
  } else {
    console.log(`✅ ${key} is set`)
  }
}

if (hasError) {
  console.error('\n❌ Some required environment variables are missing.\n')
  process.exit(1)
} else {
  console.log('\n✅ All required environment variables are set.\n')
}

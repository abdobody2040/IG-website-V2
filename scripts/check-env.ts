import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Load env files manually since this runs as a Node script outside Vite
const loadEnvFile = (filePath: string) => {
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, 'utf-8')
    content.split('\n').forEach((line: string) => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const eqIdx = trimmed.indexOf('=')
        if (eqIdx > 0) {
          const key = trimmed.slice(0, eqIdx).trim()
          let val = trimmed.slice(eqIdx + 1).trim()
          // Strip surrounding quotes if present
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1)
          }
          if (!process.env[key]) {
            process.env[key] = val
          }
        }
      }
    })
  }
}

const rootDir = path.resolve(__dirname, '..')
loadEnvFile(path.join(rootDir, '.env'))
loadEnvFile(path.join(rootDir, '.env.local'))

const requiredClientVars = [
  'VITE_PB_URL',
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
  if (!process.env[key]) {
    console.error(`❌ MISSING: ${key} is required`)
    hasError = true
  } else {
    console.log(`✅ ${key} is set`)
  }
}

for (const key of optionalClientVars) {
  if (!process.env[key]) {
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

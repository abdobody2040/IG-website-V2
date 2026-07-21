/**
 * Verify CSS variables exist in both index.css and tailwind.config.cjs
 * Run: node scripts/check-css-variables.js
 */
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const indexCss = fs.readFileSync(path.join(__dirname, '..', 'src', 'index.css'), 'utf-8')
const tailwindConfig = fs.readFileSync(path.join(__dirname, '..', 'tailwind.config.cjs'), 'utf-8')

// Extract CSS variable names from index.css :root block
const rootBlock = indexCss.match(/:root\s*\{([^}]+)\}/)?.[1] || ''
const cssVars = [...rootBlock.matchAll(/--([\w-]+)\s*:/g)].map(m => m[1])

// Extract Tailwind references (e.g., 'hsl(var(--primary))')
const tailwindRefs = [...tailwindConfig.matchAll(/var\(--([\w-]+)\)/g)].map(m => m[1])

const missingInCss = tailwindRefs.filter(ref => !cssVars.includes(ref) && !ref.startsWith('radix'))

if (missingInCss.length > 0) {
  console.error('❌ CSS variables referenced in Tailwind but missing from :root:', missingInCss)
  process.exit(1)
}

console.log('✅ All CSS variables are consistent between index.css and tailwind.config.cjs')

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

const SITE_URL = 'https://www.instantgrow-llc.com'
const PB_URL = process.env.VITE_PB_URL || 'http://127.0.0.1:8090'

async function fetchRecords(collectionName) {
  const url = `${PB_URL}/api/collections/${collectionName}/records?filter=published%3Dtrue&fields=slug,updated&perPage=500`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP error ${res.status} fetching ${collectionName}`)
  const json = await res.json()
  return json.items || []
}

async function main() {
  const [blogs, seoPages] = await Promise.all([
    fetchRecords('blogs'),
    fetchRecords('countries_seo_pages'),
  ])

  const urls = []
  const add = (loc, priority, changefreq, lastmod) => {
    urls.push(`  <url>\n    <loc>${loc}</loc>\n    <priority>${priority}</priority>\n    <changefreq>${changefreq}</changefreq>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`)
  }

  add(`${SITE_URL}/`, '1.0', 'weekly')
  add(`${SITE_URL}/blog`, '0.8', 'weekly')
  add(`${SITE_URL}/contact`, '0.6', 'monthly')

  blogs.forEach(b => add(`${SITE_URL}/blog/${b.slug}`, '0.7', 'monthly', b.updated?.split('T')[0]))
  seoPages.forEach(s => add(`${SITE_URL}/us-company/${s.slug}`, '0.9', 'monthly', s.updated?.split('T')[0]))

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`

  const distDir = path.resolve(__dirname, '..', 'dist')
  if (!fs.existsSync(distDir)) fs.mkdirSync(distDir, { recursive: true })
  fs.writeFileSync(path.join(distDir, 'sitemap.xml'), xml, 'utf-8')
  console.log(`sitemap.xml generated with ${urls.length} URLs`)
}

main().catch(err => {
  console.warn('⚠️ Warning: sitemap.xml generation skipped (PocketBase offline):', err.message || err)
  process.exit(0)
})

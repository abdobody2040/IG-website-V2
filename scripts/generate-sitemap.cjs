const fs = require('fs')
const path = require('path')

const SITE_URL = process.env.VITE_APP_URL || 'https://instantgrow.net'

// Master list of static routes with realistic, accurate lastmod dates
const STATIC_ROUTES = [
  { path: '/', lastmod: '2026-09-20' },
  { path: '/services', lastmod: '2026-09-20' },
  { path: '/about', lastmod: '2026-09-20' },
  { path: '/team', lastmod: '2026-09-20' },
  { path: '/how-we-work', lastmod: '2026-09-20' },
  { path: '/contact', lastmod: '2026-09-20' },
  { path: '/us-company', lastmod: '2026-09-20' },
  { path: '/us-company/wyoming', lastmod: '2026-09-20' },
  { path: '/us-company/delaware', lastmod: '2026-09-20' },
  { path: '/form-llc', lastmod: '2026-09-20' },
  // 12 MENA Country Pages
  { path: '/form-llc/egypt', lastmod: '2026-09-20' },
  { path: '/form-llc/saudi-arabia', lastmod: '2026-09-20' },
  { path: '/form-llc/uae', lastmod: '2026-09-20' },
  { path: '/form-llc/jordan', lastmod: '2026-09-20' },
  { path: '/form-llc/kuwait', lastmod: '2026-09-20' },
  { path: '/form-llc/qatar', lastmod: '2026-09-20' },
  { path: '/form-llc/oman', lastmod: '2026-09-20' },
  { path: '/form-llc/bahrain', lastmod: '2026-09-20' },
  { path: '/form-llc/iraq', lastmod: '2026-09-20' },
  { path: '/form-llc/morocco', lastmod: '2026-09-20' },
  { path: '/form-llc/turkey', lastmod: '2026-09-20' },
  { path: '/form-llc/pakistan', lastmod: '2026-09-20' },
  // Blog index
  { path: '/blog', lastmod: '2026-09-20' },
  // Legal & compliance
  { path: '/privacy-policy', lastmod: '2026-09-20' },
  { path: '/terms-of-service', lastmod: '2026-09-20' },
  { path: '/refund-policy', lastmod: '2026-09-20' },
  { path: '/legal-disclaimer', lastmod: '2026-09-20' },
  { path: '/accessibility', lastmod: '2026-09-20' },
  { path: '/kyc-aml', lastmod: '2026-09-20' },
]

// Blog posts catalog from src/data/blogsData.ts
const BLOG_POSTS = [
  { slug: 'why-stripe-doesnt-work-your-country', lastmod: '2026-08-15' },
  { slug: 'how-to-open-us-llc-3-steps', lastmod: '2026-08-15' },
  { slug: '5-biggest-mistakes-new-llc-owners', lastmod: '2026-08-15' },
  { slug: 'best-us-bank-accounts-non-residents', lastmod: '2026-08-15' },
  { slug: 'how-to-receive-usd-payments-legally', lastmod: '2026-08-15' },
  { slug: 'why-global-founders-win-bigger', lastmod: '2026-08-15' },
  { slug: 'why-freelancers-stay-stuck', lastmod: '2026-08-15' },
  { slug: '10-us-llc-myths-debunked', lastmod: '2026-08-15' },
  { slug: 'scale-business-1k-to-10k', lastmod: '2026-08-15' },
  { slug: 'freedom-equation-us-llc-changes-your-life', lastmod: '2026-08-15' },
  { slug: 'how-to-form-llc-delaware-2025', lastmod: '2026-08-15' },
  { slug: 'wyoming-llc-vs-delaware-llc', lastmod: '2026-08-15' },
  { slug: 'non-us-residents-us-business-bank-account-2025', lastmod: '2026-08-15' },
  { slug: 'what-is-ein-why-llc-needs-one', lastmod: '2026-08-15' },
  { slug: 'single-member-vs-multi-member-llc', lastmod: '2026-08-15' },
  { slug: 'how-to-maintain-llc-annual-requirements', lastmod: '2026-08-15' },
]

function generateSitemapXml() {
  const urls = []

  STATIC_ROUTES.forEach(route => {
    urls.push(`  <url>\n    <loc>${SITE_URL}${route.path}</loc>\n    <lastmod>${route.lastmod}</lastmod>\n  </url>`)
  })

  BLOG_POSTS.forEach(post => {
    urls.push(`  <url>\n    <loc>${SITE_URL}/blog/${post.slug}</loc>\n    <lastmod>${post.lastmod}</lastmod>\n  </url>`)
  })

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}

function main() {
  const distDir = path.resolve(__dirname, '..', 'dist')
  const publicDir = path.resolve(__dirname, '..', 'public')

  const xml = generateSitemapXml()

  // Write to public/sitemap.xml (source)
  fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), xml, 'utf-8')
  console.log('✅ Generated public/sitemap.xml without changefreq/priority, with true lastmod and all routes')

  // If dist exists, also write to dist/sitemap.xml
  if (fs.existsSync(distDir)) {
    fs.writeFileSync(path.join(distDir, 'sitemap.xml'), xml, 'utf-8')
    console.log('✅ Copied to dist/sitemap.xml')
  }
}

main()

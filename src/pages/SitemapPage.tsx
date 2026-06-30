import { useEffect } from 'react'
import { pb } from '../lib/pocketbase'

const SITE_URL = 'https://www.instantgrow-llc.com'

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

export default function SitemapPage() {
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      const [blogsRes, seoRes] = await Promise.all([
        pb.collection('blogs').getList(1, 500, { filter: 'published = true', fields: 'slug,updated' }),
        pb.collection('countries_seo_pages').getList(1, 500, { filter: 'published = true', fields: 'slug,updated' }),
      ])
      if (cancelled) return

      const urls: string[] = []
      const add = (loc: string, priority: string, changefreq: string, lastmod?: string) => {
        const safeLoc = escapeXml(loc)
        urls.push(`  <url>\n    <loc>${safeLoc}</loc>\n    <priority>${priority}</priority>\n    <changefreq>${changefreq}</changefreq>${lastmod ? `\n    <lastmod>${lastmod}</lastmod>` : ''}\n  </url>`)
      }

      add(`${SITE_URL}/`, '1.0', 'weekly')
      add(`${SITE_URL}/blog`, '0.8', 'weekly')
      add(`${SITE_URL}/contact`, '0.6', 'monthly')

      for (const b of (blogsRes.items || [])) {
        add(`${SITE_URL}/blog/${b.slug}`, '0.7', 'monthly', b.updated?.split('T')[0])
      }
      for (const s of (seoRes.items || [])) {
        add(`${SITE_URL}/us-company/${s.slug}`, '0.9', 'monthly', s.updated?.split('T')[0])
      }

      const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>`
      document.open()
      document.write(xml)
      document.close()
    })()
    return () => { cancelled = true }
  }, [])

  return null
}

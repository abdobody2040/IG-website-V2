import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { chromium } from '@playwright/test'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const PB_URL = process.env.PB_URL || 'http://127.0.0.1:8090'
const ADMIN_EMAIL = process.env.PB_ADMIN_EMAIL || 'admin@instantgrow.net'
const ADMIN_PASS = process.env.PB_ADMIN_PASSWORD || 'Admin@2025!'

const outputDir = path.join(__dirname, '../public/og')
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true })
}

// Read logo.png as Base64 to inline it in the HTML templates
const logoPath = path.join(__dirname, '../public/logo.png')
let logoDataUrl = ''
try {
  const logoBase64 = fs.readFileSync(logoPath).toString('base64')
  logoDataUrl = `data:image/png;base64,${logoBase64}`
} catch (err) {
  console.warn('⚠️ logo.png not found, falling back to text logo', err.message)
}

// ---------------------------------------------------------------------------
// HTML Templates for OG Card
// ---------------------------------------------------------------------------

function getHtmlTemplate({ title, category, excerpt, isAr, logoUrl }) {
  const dir = isAr ? 'rtl' : 'ltr'
  const fontLink = isAr
    ? '<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;800&family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">'
    : '<link href="https://fonts.googleapis.com/css2?family=Sora:wght@400;600;700;800&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">'
  const bodyFont = isAr ? "'Tajawal', sans-serif" : "'Inter', sans-serif"
  const headingFont = isAr ? "'Cairo', sans-serif" : "'Sora', sans-serif"

  return `
<!DOCTYPE html>
<html lang="${isAr ? 'ar' : 'en'}" dir="${dir}">
<head>
  <meta charset="UTF-8">
  ${fontLink}
  <style>
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    body {
      width: 1200px;
      height: 630px;
      background-color: #0b0f19;
      font-family: ${bodyFont};
      color: #f8fafc;
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 80px;
    }
    .glow-bg {
      position: absolute;
      top: -150px;
      right: -150px;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(26, 86, 255, 0.15) 0%, rgba(26, 86, 255, 0) 70%);
      pointer-events: none;
      z-index: 1;
    }
    .glow-bg-left {
      position: absolute;
      bottom: -200px;
      left: -200px;
      width: 600px;
      height: 600px;
      background: radial-gradient(circle, rgba(99, 102, 241, 0.1) 0%, rgba(99, 102, 241, 0) 70%);
      pointer-events: none;
      z-index: 1;
    }
    .grid-lines {
      position: absolute;
      inset: 0;
      background-image: linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px);
      background-size: 60px 60px;
      pointer-events: none;
      z-index: 2;
    }
    .content {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 28px;
      max-width: 1040px;
      ${isAr ? 'text-align: right;' : ''}
    }
    .tag {
      display: inline-flex;
      align-items: center;
      padding: 6px 18px;
      border-radius: 9999px;
      background-color: rgba(26, 86, 255, 0.12);
      border: 1px solid rgba(26, 86, 255, 0.25);
      color: #5c8dff;
      font-size: 15px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      width: fit-content;
    }
    .title {
      font-family: ${headingFont};
      font-size: ${isAr ? '56px' : '52px'};
      font-weight: 800;
      line-height: 1.25;
      color: #ffffff;
      letter-spacing: ${isAr ? '0' : '-1px'};
    }
    .excerpt {
      font-size: 20px;
      line-height: 1.6;
      color: #94a3b8;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
      max-height: 64px;
    }
    .footer {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-top: 1px solid rgba(255, 255, 255, 0.06);
      padding-top: 30px;
      flex-direction: ${isAr ? 'row-reverse' : 'row'};
    }
    .logo-img {
      height: 40px;
      width: auto;
    }
    .logo-text {
      font-family: 'Sora', sans-serif;
      font-size: 24px;
      font-weight: 800;
      color: #ffffff;
    }
    .domain {
      font-family: 'Sora', sans-serif;
      font-size: 19px;
      font-weight: 700;
      color: #64748b;
    }
    .domain span {
      color: #1a56ff;
    }
  </style>
</head>
<body>
  <div class="glow-bg"></div>
  <div class="glow-bg-left"></div>
  <div class="grid-lines"></div>

  <div class="content">
    <div class="tag">${category}</div>
    <h1 class="title">${title}</h1>
    <p class="excerpt">${excerpt}</p>
  </div>

  <div class="footer">
    ${logoUrl ? `<img src="${logoUrl}" class="logo-img" />` : '<div class="logo-text">Instant Grow</div>'}
    <div class="domain">instantgrow<span>.net</span></div>
  </div>
</body>
</html>
  `
}

// ---------------------------------------------------------------------------
// PocketBase Auth Helper
// ---------------------------------------------------------------------------

async function getAdminToken() {
  console.log(`🔐 Logging into PocketBase superuser/admin at ${PB_URL}...`)
  // 1. Try superuser
  let res = await fetch(`${PB_URL}/api/collections/_superusers/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASS }),
  })
  if (res.ok) {
    const data = await res.json()
    return data.token
  }
  // 2. Try legacy admin
  res = await fetch(`${PB_URL}/api/admins/auth-with-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identity: ADMIN_EMAIL, password: ADMIN_PASS }),
  })
  if (res.ok) {
    const data = await res.json()
    return data.token
  }
  throw new Error(`Auth failed: ${res.status}`)
}

// ---------------------------------------------------------------------------
// Main generation routine
// ---------------------------------------------------------------------------

async function main() {
  let token = ''
  try {
    token = await getAdminToken()
  } catch (err) {
    console.warn('⚠️ PocketBase connection or authentication failed. Skipping OG image generation (normal for CI/CD environments).', err.message)
    process.exit(0)
  }

  // 1. Fetch Blog Posts
  console.log('📚 Fetching blog posts...')
  const blogsRes = await fetch(`${PB_URL}/api/collections/blogs/records?perPage=200`, {
    headers: { Authorization: token },
  })
  const blogsData = await blogsRes.json()
  const blogs = blogsData.items || []

  // 2. Fetch SEO Country Pages
  console.log('🌍 Fetching country guides...')
  const seoRes = await fetch(`${PB_URL}/api/collections/countries_seo_pages/records?perPage=200`, {
    headers: { Authorization: token },
  })
  const seoData = await seoRes.json()
  const countryPages = seoData.items || []

  console.log(`🚀 Launching Playwright browser to generate ${blogs.length * 2 + countryPages.length * 2} images...`)
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1200, height: 630 })

  // Helper function to screenshot template
  const generateImg = async ({ title, category, excerpt, isAr, fileName }) => {
    const html = getHtmlTemplate({ title, category, excerpt, isAr, logoUrl: logoDataUrl })
    await page.setContent(html)
    // Wait for external web fonts to fully render
    await page.evaluate(() => document.fonts.ready)
    const filePath = path.join(outputDir, fileName)
    await page.screenshot({ path: filePath, type: 'png' })
    console.log(`✅ Saved: ${fileName}`)
  }

  // 3. Generate OG images for Blogs (EN and AR)
  for (const b of blogs) {
    if (!b.slug) {
      console.log(`⚠️ Skipping blog post without slug (ID: ${b.id})`)
      continue
    }
    const tag = b.tags && b.tags[0] ? b.tags[0] : 'Blog'
    // EN cover
    await generateImg({
      title: b.title,
      category: tag,
      excerpt: b.excerpt || '',
      isAr: false,
      fileName: `blog-${b.slug}-en.png`,
    })
    // AR cover
    await generateImg({
      title: b.title_ar || b.title,
      category: tag === 'Blog' ? 'مدونة' : tag,
      excerpt: b.excerpt_ar || b.excerpt || '',
      isAr: true,
      fileName: `blog-${b.slug}-ar.png`,
    })
  }

  // 4. Generate OG images for Country Guides (EN and AR)
  for (const c of countryPages) {
    if (!c.slug) {
      console.log(`⚠️ Skipping country page without slug (ID: ${c.id})`)
      continue
    }
    // EN cover
    await generateImg({
      title: `Form a US Company from ${c.country_name}`,
      category: 'Country Guide',
      excerpt: `Complete step-by-step formation, bank account opening, and U.S. tax guide for entrepreneurs residing in ${c.country_name}.`,
      isAr: false,
      fileName: `seo-${c.slug}-en.png`,
    })
    // AR cover
    const arCountry = c.country_name === 'Egypt' ? 'مصر'
                    : c.country_name === 'Saudi Arabia' ? 'السعودية'
                    : c.country_name === 'UAE' ? 'الإمارات'
                    : c.country_name === 'Morocco' ? 'المغرب'
                    : c.country_name
    await generateImg({
      title: `تأسيس شركة أمريكية من ${arCountry}`,
      category: 'دليل الدول',
      excerpt: `دليل كامل لتأسيس شركة LLC، فتح حساب بنكي أمريكي، والحصول على الرقم الضريبي EIN لرواد الأعمال في ${arCountry}.`,
      isAr: true,
      fileName: `seo-${c.slug}-ar.png`,
    })
  }

  await browser.close()
  console.log('🎉 Done! All OG images successfully pre-rendered in public/og/.')
}

main().catch((err) => {
  console.error('❌ Execution failed:', err)
  process.exit(1)
})

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { chromium } from '@playwright/test'
import { BLOGS_CATALOG } from '../src/data/blogsData.ts'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
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
// Theme configurations per category
// ---------------------------------------------------------------------------
const THEMES = {
  payments: {
    accent: '#10B981',
    accentGlow: 'rgba(16, 185, 129, 0.25)',
    gradient: 'linear-gradient(135deg, #10B981 0%, #1A56FF 100%)',
    tagBg: 'rgba(16, 185, 129, 0.15)',
    tagBorder: 'rgba(16, 185, 129, 0.35)',
    tagColor: '#34D399',
    icon: '💳',
    metric1: { en: 'Stripe Ready', ar: 'تفعيل سترايب', val: '100%' },
    metric2: { en: 'Supported Nations', ar: 'دولة مدعومة', val: '150+' },
    metric3: { en: 'USD Payouts', ar: 'استلام بالدولار', val: 'Direct' },
  },
  formation: {
    accent: '#1A56FF',
    accentGlow: 'rgba(26, 86, 255, 0.3)',
    gradient: 'linear-gradient(135deg, #1A56FF 0%, #00D4FF 100%)',
    tagBg: 'rgba(26, 86, 255, 0.15)',
    tagBorder: 'rgba(26, 86, 255, 0.35)',
    tagColor: '#60A5FA',
    icon: '🏛️',
    metric1: { en: 'Filing Speed', ar: 'سرعة التأسيس', val: '24-48h' },
    metric2: { en: 'Remote Setup', ar: 'عن بُعد 100%', val: 'Online' },
    metric3: { en: 'Limited Liability', ar: 'حماية قانونية', val: 'Full' },
  },
  banking: {
    accent: '#6366F1',
    accentGlow: 'rgba(99, 102, 241, 0.3)',
    gradient: 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
    tagBg: 'rgba(99, 102, 241, 0.15)',
    tagBorder: 'rgba(99, 102, 241, 0.35)',
    tagColor: '#A5B4FC',
    icon: '🏦',
    metric1: { en: 'FDIC Insured', ar: 'تأمين فيدرالي', val: 'Up to $5M' },
    metric2: { en: 'Monthly Fees', ar: 'رسوم شهرية', val: '$0 / mo' },
    metric3: { en: 'Debit Cards', ar: 'بطاقات ائتمانية', val: 'Virtual+Physical' },
  },
  tax: {
    accent: '#F59E0B',
    accentGlow: 'rgba(245, 158, 11, 0.25)',
    gradient: 'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
    tagBg: 'rgba(245, 158, 11, 0.15)',
    tagBorder: 'rgba(245, 158, 11, 0.35)',
    tagColor: '#FCD34D',
    icon: '📄',
    metric1: { en: 'IRS Official EIN', ar: 'رقم ضريبي رسمي', val: 'Included' },
    metric2: { en: 'US State Tax', ar: 'ضريبة ولاية', val: '$0 (WY)' },
    metric3: { en: 'Non-Resident', ar: 'لغير المقيمين', val: '100% Legal' },
  },
  growth: {
    accent: '#8B5CF6',
    accentGlow: 'rgba(139, 92, 246, 0.3)',
    gradient: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
    tagBg: 'rgba(139, 92, 246, 0.15)',
    tagBorder: 'rgba(139, 92, 246, 0.35)',
    tagColor: '#C4B5FD',
    icon: '🚀',
    metric1: { en: 'Revenue Scale', ar: 'مضاعفة الأرباح', val: '10X Global' },
    metric2: { en: 'Global Trust', ar: 'ثقة العملاء', val: 'Top Tier' },
    metric3: { en: 'Payment Access', ar: 'بوابات الدفع', val: 'Worldwide' },
  },
  compliance: {
    accent: '#06B6D4',
    accentGlow: 'rgba(6, 182, 212, 0.25)',
    gradient: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
    tagBg: 'rgba(6, 182, 212, 0.15)',
    tagBorder: 'rgba(6, 182, 212, 0.35)',
    tagColor: '#67E8F9',
    icon: '🛡️',
    metric1: { en: 'Good Standing', ar: 'وضع قانوني سليم', val: 'Active' },
    metric2: { en: 'Agent Service', ar: 'وكيل مسجل', val: 'Year 1 Free' },
    metric3: { en: 'Annual Report', ar: 'تقارير سنوية', val: 'Managed' },
  },
}

function getHtmlTemplate({ title, category, excerpt, isAr, tag, themeKey, readTime, logoUrl }) {
  const t = THEMES[themeKey] || THEMES.formation
  const dir = isAr ? 'rtl' : 'ltr'
  const fontLink = isAr
    ? '<link href="https://fonts.googleapis.com/css2?family=Cairo:wght@600;700;800;900&family=Tajawal:wght@500;700;800&display=swap" rel="stylesheet">'
    : '<link href="https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet">'
  const bodyFont = isAr ? "'Tajawal', sans-serif" : "'Inter', sans-serif"
  const headingFont = isAr ? "'Cairo', sans-serif" : "'Sora', sans-serif"

  return `
<!DOCTYPE html>
<html lang="${isAr ? 'ar' : 'en'}" dir="ltr">
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
      background-color: #060911;
      font-family: ${bodyFont};
      color: #F8FAFC;
      overflow: hidden;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      padding: 44px 52px;
    }
    
    /* Dynamic Mesh Lighting */
    .glow-primary {
      position: absolute;
      top: -100px;
      right: -100px;
      width: 650px;
      height: 650px;
      background: radial-gradient(circle, ${t.accentGlow} 0%, rgba(26, 86, 255, 0.08) 50%, transparent 75%);
      pointer-events: none;
      z-index: 1;
    }
    .glow-bottom {
      position: absolute;
      bottom: -150px;
      left: -100px;
      width: 550px;
      height: 550px;
      background: radial-gradient(circle, rgba(26, 86, 255, 0.15) 0%, transparent 70%);
      pointer-events: none;
      z-index: 1;
    }
    .grid-lines {
      position: absolute;
      inset: 0;
      background-image: 
        linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px),
        linear-gradient(90deg, rgba(255,255,255,0.02) 1px, transparent 1px);
      background-size: 48px 48px;
      pointer-events: none;
      z-index: 2;
    }
    .ambient-card {
      position: absolute;
      inset: 18px;
      border-radius: 28px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      background: radial-gradient(100% 100% at 50% 0%, rgba(255, 255, 255, 0.02) 0%, rgba(15, 23, 42, 0.2) 100%);
      pointer-events: none;
      z-index: 3;
    }

    /* Top Brand Bar */
    .header-bar {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-bottom: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    }
    .brand-wrap {
      display: flex;
      align-items: center;
      gap: 14px;
    }
    .logo-img {
      height: 38px;
      width: auto;
      filter: drop-shadow(0 4px 12px rgba(26,86,255,0.4));
    }
    .brand-text {
      display: flex;
      flex-direction: column;
    }
    .brand-title {
      font-family: 'Sora', sans-serif;
      font-size: 19px;
      font-weight: 800;
      color: #FFFFFF;
      letter-spacing: -0.02em;
    }
    .brand-subtitle {
      font-size: 10px;
      font-weight: 700;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.1em;
    }
    .header-badge {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 7px 16px;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 100px;
      font-size: 12px;
      font-weight: 700;
      color: #E2E8F0;
      letter-spacing: 0.02em;
    }
    .badge-dot {
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: ${t.accent};
      box-shadow: 0 0 10px ${t.accent};
    }

    /* Main Content Area */
    .main-grid {
      position: relative;
      z-index: 10;
      display: flex;
      flex-direction: ${isAr ? 'row-reverse' : 'row'};
      justify-content: space-between;
      align-items: center;
      gap: 36px;
      margin: auto 0;
      width: 100%;
    }
    .content-col {
      flex: 1;
      min-width: 0;
      display: flex;
      flex-direction: column;
      gap: 16px;
      direction: ${isAr ? 'rtl' : 'ltr'};
      text-align: ${isAr ? 'right' : 'left'};
    }
    .tag-row {
      display: flex;
      align-items: center;
      gap: 12px;
      ${isAr ? 'flex-direction: row-reverse; justify-content: flex-end;' : ''}
    }
    .category-pill {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      padding: 6px 16px;
      border-radius: 100px;
      background: ${t.tagBg};
      border: 1px solid ${t.tagBorder};
      color: ${t.tagColor};
      font-size: 13px;
      font-weight: 800;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .read-time-pill {
      font-size: 13px;
      color: #64748B;
      font-weight: 600;
    }
    .hero-title {
      font-family: ${headingFont};
      font-size: ${isAr ? '36px' : '36px'};
      font-weight: 800;
      line-height: 1.28;
      color: #FFFFFF;
      letter-spacing: ${isAr ? '0' : '-0.02em'};
      text-shadow: 0 4px 20px rgba(0,0,0,0.5);
      word-wrap: break-word;
    }
    .hero-excerpt {
      font-size: ${isAr ? '17px' : '16px'};
      line-height: 1.55;
      color: #94A3B8;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    /* Right Hologram Glass Card */
    .hologram-card {
      width: 320px;
      flex-shrink: 0;
      background: rgba(15, 23, 42, 0.7);
      backdrop-filter: blur(24px);
      border: 1px solid rgba(255, 255, 255, 0.12);
      border-radius: 20px;
      padding: 22px;
      display: flex;
      flex-direction: column;
      gap: 14px;
      box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.1);
      position: relative;
    }
    .card-top-icon {
      width: 52px;
      height: 52px;
      border-radius: 14px;
      background: ${t.gradient};
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 26px;
      box-shadow: 0 8px 24px ${t.accentGlow};
      margin-bottom: 4px;
    }
    .stat-row {
      display: flex;
      flex-direction: column;
      gap: 3px;
      padding: 10px 14px;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 12px;
    }
    .stat-val {
      font-family: 'Sora', sans-serif;
      font-size: 18px;
      font-weight: 800;
      color: #FFFFFF;
    }
    .stat-label {
      font-size: 11px;
      font-weight: 600;
      color: #94A3B8;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* Bottom Trust & SEO Footer */
    .footer-bar {
      position: relative;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding-top: 20px;
      border-top: 1px solid rgba(255, 255, 255, 0.08);
      flex-direction: ${isAr ? 'row-reverse' : 'row'};
    }
    .trustpilot-badge {
      display: flex;
      align-items: center;
      gap: 10px;
    }
    .stars {
      color: #00B67A;
      font-size: 17px;
      letter-spacing: 2px;
    }
    .trust-text {
      font-size: 13px;
      font-weight: 600;
      color: #CBD5E1;
    }
    .trust-rating {
      font-weight: 800;
      color: #FFFFFF;
    }
    .domain-badge {
      font-family: 'Sora', sans-serif;
      font-size: 15px;
      font-weight: 700;
      color: #64748B;
    }
    .domain-badge span {
      color: #1A56FF;
    }
  </style>
</head>
<body>
  <div class="glow-primary"></div>
  <div class="glow-bottom"></div>
  <div class="grid-lines"></div>
  <div class="ambient-card"></div>

  <!-- Header -->
  <div class="header-bar">
    <div class="brand-wrap">
      ${logoUrl ? `<img src="${logoUrl}" class="logo-img" />` : '<div class="brand-title">Instant Grow</div>'}
      <div class="brand-text">
        <div class="brand-title">Instant Grow</div>
        <div class="brand-subtitle">Global Formation Platform</div>
      </div>
    </div>
    <div class="header-badge">
      <div class="badge-dot"></div>
      ${isAr ? 'دليل المؤسسين المعتمد ٢٠٢٦' : 'VERIFIED FOUNDER GUIDE 2026'}
    </div>
  </div>

  <!-- Main Grid -->
  <div class="main-grid">
    <div class="content-col">
      <div class="tag-row">
        <div class="category-pill">
          <span>${t.icon}</span>
          <span>${tag}</span>
        </div>
        <div class="read-time-pill">${readTime}</div>
      </div>
      <h1 class="hero-title">${title}</h1>
      <p class="hero-excerpt">${excerpt}</p>
    </div>

    <!-- Hologram Glass Card -->
    <div class="hologram-card">
      <div class="card-top-icon">${t.icon}</div>
      <div class="stat-row">
        <div class="stat-val">${t.metric1.val}</div>
        <div class="stat-label">${isAr ? t.metric1.ar : t.metric1.en}</div>
      </div>
      <div class="stat-row">
        <div class="stat-val">${t.metric2.val}</div>
        <div class="stat-label">${isAr ? t.metric2.ar : t.metric2.en}</div>
      </div>
      <div class="stat-row">
        <div class="stat-val">${t.metric3.val}</div>
        <div class="stat-label">${isAr ? t.metric3.ar : t.metric3.en}</div>
      </div>
    </div>
  </div>

  <!-- Footer -->
  <div class="footer-bar">
    <div class="trustpilot-badge">
      <span class="stars">★★★★★</span>
      <span class="trust-text"><span class="trust-rating">4.9/5</span> ${isAr ? 'تقييم أكثر من 2,500+ مؤسس' : 'Rated by 2,500+ Founders'}</span>
    </div>
    <div class="domain-badge">instantgrow<span>.net/blog</span></div>
  </div>
</body>
</html>
  `
}

async function main() {
  console.log(`🚀 Starting Playwright rendering for ${BLOGS_CATALOG.length * 2} unique branded blog cover images...`)
  const browser = await chromium.launch({ headless: true })
  const page = await browser.newPage()
  await page.setViewportSize({ width: 1200, height: 630 })

  let count = 0

  for (const blog of BLOGS_CATALOG) {
    const theme = blog.categoryTheme || 'formation'
    const tagEn = blog.tags?.[0] || 'LLC Guide'
    const tagAr = blog.badgeAr?.replace(/^[^\s]+\s*/, '') || blog.tags?.[0] || 'دليل الشركات'

    // 1. English Cover
    const enHtml = getHtmlTemplate({
      title: blog.title,
      category: tagEn,
      excerpt: blog.excerpt || '',
      isAr: false,
      tag: tagEn,
      themeKey: theme,
      readTime: blog.readTime || '6 min read',
      logoUrl: logoDataUrl,
    })
    await page.setContent(enHtml)
    await page.evaluate(() => document.fonts.ready)
    const enPath = path.join(outputDir, `blog-${blog.slug}-en.png`)
    await page.screenshot({ path: enPath, type: 'png' })
    console.log(`✅ [${++count}/${BLOGS_CATALOG.length * 2}] Generated: blog-${blog.slug}-en.png`)

    // 2. Arabic Cover
    const arHtml = getHtmlTemplate({
      title: blog.titleAr || blog.title,
      category: tagAr,
      excerpt: blog.excerptAr || blog.excerpt || '',
      isAr: true,
      tag: tagAr,
      themeKey: theme,
      readTime: blog.readTimeAr || '٦ دقائق قراءة',
      logoUrl: logoDataUrl,
    })
    await page.setContent(arHtml)
    await page.evaluate(() => document.fonts.ready)
    const arPath = path.join(outputDir, `blog-${blog.slug}-ar.png`)
    await page.screenshot({ path: arPath, type: 'png' })
    console.log(`✅ [${++count}/${BLOGS_CATALOG.length * 2}] Generated: blog-${blog.slug}-ar.png`)
  }

  await browser.close()
  console.log(`\n🎉 Successfully generated all ${count} unique high-res branded blog images in public/og/!`)
}

main().catch((err) => {
  console.error('❌ Generation error:', err)
  process.exit(1)
})

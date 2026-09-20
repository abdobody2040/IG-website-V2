import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const SITE_URL = 'https://instantgrow.net'
const distDir = path.resolve(__dirname, '..', 'dist')
const templatePath = path.join(distDir, 'index.html')

if (!fs.existsSync(templatePath)) {
  console.error('❌ dist/index.html not found! Run "vite build" first.')
  process.exit(1)
}

const templateHtml = fs.readFileSync(templatePath, 'utf-8')

// Master data for pages
const PAGES = [
  {
    path: '/services',
    title: 'Company Formation Services & Transparent Pricing | Instant Grow LLC',
    description: 'Explore US LLC (Wyoming, Delaware, New Mexico) and UK LTD formation services. Complete with EIN, registered agent, business banking, and zero hidden fees.',
    h1: 'Complete Company Formation & Global Banking Services',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Services', url: `${SITE_URL}/services` }
    ],
    htmlContent: `
      <div class="pre-rendered-page services-page">
        <header class="py-12 text-center">
          <h1 class="text-4xl font-extrabold tracking-tight">Complete Company Formation & Global Banking Services</h1>
          <p class="mt-4 text-xl max-w-2xl mx-auto opacity-90">Form your US LLC or UK LTD from anywhere in the world with full compliance, bank account assistance, and transparent pricing.</p>
        </header>
        <section class="max-w-5xl mx-auto my-8 px-4 grid md:grid-cols-3 gap-6">
          <article class="border border-white/10 rounded-2xl p-6 bg-white/5">
            <h2 class="text-2xl font-bold">Starter Plan — $199</h2>
            <p class="mt-2 text-sm">Essential formation for solo founders ready to launch.</p>
            <ul class="mt-4 space-y-2 text-sm">
              <li>✓ State Articles of Organization</li>
              <li>✓ Custom Operating Agreement</li>
              <li>✓ 1 Year Registered Agent Service</li>
              <li>✓ US Business Bank Account Setup Assistance</li>
              <li>✓ IRS Form 5472/1120 Guidance</li>
            </ul>
          </article>
          <article class="border border-emerald-500/30 rounded-2xl p-6 bg-emerald-500/5">
            <h2 class="text-2xl font-bold">Growth Plan — $399</h2>
            <p class="mt-2 text-sm">Most popular: complete formation with IRS EIN expedited filing.</p>
            <ul class="mt-4 space-y-2 text-sm">
              <li>✓ Everything in Starter</li>
              <li>✓ Official IRS EIN Tax ID Filing</li>
              <li>✓ Mercury / Relay Bank Account Fast-Track</li>
              <li>✓ Stripe & PayPal Onboarding Checklist</li>
              <li>✓ Priority Email & Chat Support</li>
            </ul>
          </article>
          <article class="border border-white/10 rounded-2xl p-6 bg-white/5">
            <h2 class="text-2xl font-bold">Scale Plan — $699</h2>
            <p class="mt-2 text-sm">All-inclusive corporate suite for scaling international businesses.</p>
            <ul class="mt-4 space-y-2 text-sm">
              <li>✓ Everything in Growth</li>
              <li>✓ Expedited State Filing Speed</li>
              <li>✓ 1st Year State Annual Report Preparation</li>
              <li>✓ Trademark Clearance Search (1 mark)</li>
              <li>✓ Senior Compliance Specialist Review</li>
            </ul>
          </article>
        </section>
      </div>
    `
  },
  {
    path: '/about',
    title: 'About Instant Grow LLC | US & Global Business Formation',
    description: 'Learn about Instant Grow LLC, our mission to empower international entrepreneurs with legitimate US companies, and our commitment to compliance and transparency.',
    h1: 'Empowering Global Founders to Access the World Economy',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'About', url: `${SITE_URL}/about` }
    ],
    htmlContent: `
      <div class="pre-rendered-page about-page max-w-4xl mx-auto py-12 px-4">
        <h1 class="text-4xl font-extrabold tracking-tight">Empowering Global Founders to Access the World Economy</h1>
        <p class="mt-6 text-lg leading-relaxed">Instant Grow LLC was founded to solve a critical barrier facing international entrepreneurs: the inability to access modern financial infrastructure simply because of where they were born.</p>
        <section class="my-8">
          <h2 class="text-2xl font-bold">Verified Operating Trust</h2>
          <p class="mt-2">We hold a verified 5.0 / 5.0 rating on Trustpilot based on 5 verified client reviews. We do not invent claims or exaggerate statistics.</p>
        </section>
        <section class="my-8">
          <h2 class="text-2xl font-bold">Company Details</h2>
          <p>Legal Entity: Instant Grow LLC<br>File Number: [REGISTRATION_NUMBER]<br>Registered Address: [REGISTERED_ADDRESS]<br>Email: support@instantgrow.net</p>
        </section>
      </div>
    `
  },
  {
    path: '/team',
    title: 'Leadership & Compliance Team | Instant Grow LLC',
    description: 'Meet the team behind Instant Grow LLC. Experienced specialists in US corporate filing, international compliance, and global payment gateways.',
    h1: 'The Instant Grow Leadership & Operations Team',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Team', url: `${SITE_URL}/team` }
    ],
    htmlContent: `
      <div class="pre-rendered-page team-page max-w-4xl mx-auto py-12 px-4">
        <h1 class="text-4xl font-extrabold tracking-tight">The Instant Grow Leadership & Operations Team</h1>
        <p class="mt-4 text-lg">Our dedicated team coordinates with state filing offices, licensed registered agents, and banking specialists to form and maintain your US company.</p>
        <div class="grid md:grid-cols-2 gap-6 my-8">
          <div class="border border-white/10 p-6 rounded-xl">
            <h2 class="text-xl font-bold">[FOUNDER_NAME]</h2>
            <p class="text-sm opacity-80">Founder & Managing Director</p>
            <p class="mt-2 text-sm">Leading corporate strategy, partner relations, and international founder enablement.</p>
          </div>
          <div class="border border-white/10 p-6 rounded-xl">
            <h2 class="text-xl font-bold">[COMPLIANCE_LEAD_NAME]</h2>
            <p class="text-sm opacity-80">Director of Legal & Regulatory Compliance</p>
            <p class="mt-2 text-sm">Oversees state filing accuracy, FinCEN BOI regulations, and IRS Form 5472 disclosures.</p>
          </div>
        </div>
      </div>
    `
  },
  {
    path: '/how-we-work',
    title: 'How We Work: Filing Process & Registered Agents | Instant Grow LLC',
    description: 'Understand exactly how Instant Grow LLC operates: in-house preparation, authorized registered agent partners, and direct state SOS filings.',
    h1: 'Transparent Operations: How We Form and Maintain Your Business',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'How We Work', url: `${SITE_URL}/how-we-work` }
    ],
    htmlContent: `
      <div class="pre-rendered-page how-we-work-page max-w-4xl mx-auto py-12 px-4">
        <h1 class="text-4xl font-extrabold tracking-tight">Transparent Operations: How We Form and Maintain Your Business</h1>
        <p class="mt-4 text-lg">We believe founders deserve 100% clarity on how their company documents are prepared, filed, and managed.</p>
        <ol class="space-y-6 my-8">
          <li><strong>Stage 1: In-House Intake & Compliance Verification</strong> — We review your information, passport verification, and state name availability.</li>
          <li><strong>Stage 2: Official State Filing</strong> — We prepare official Articles of Organization and file directly or via licensed statutory registered agents.</li>
          <li><strong>Stage 3: IRS EIN Securing</strong> — We submit Form SS-4 directly to the Internal Revenue Service.</li>
          <li><strong>Stage 4: Post-Formation Compliance & Banking</strong> — We provide your Operating Agreement, banking onboarding guide, and Form 5472 reminders.</li>
        </ol>
      </div>
    `
  },
  {
    path: '/contact',
    title: 'Contact Instant Grow LLC | Customer Support & Advisory',
    description: 'Get in touch with Instant Grow LLC. Contact our formation specialists for questions regarding US LLC registration, EIN tax IDs, and global banking.',
    h1: 'Contact Our Formation & Compliance Specialists',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Contact', url: `${SITE_URL}/contact` }
    ],
    htmlContent: `
      <div class="pre-rendered-page contact-page max-w-4xl mx-auto py-12 px-4">
        <h1 class="text-4xl font-extrabold tracking-tight">Contact Our Formation & Compliance Specialists</h1>
        <p class="mt-4 text-lg">We are here to assist with company formation, compliance deadlines, and account queries.</p>
        <div class="my-8 p-6 border border-white/10 rounded-2xl bg-white/5">
          <p><strong>Email:</strong> support@instantgrow.net</p>
          <p><strong>Phone:</strong> [PHONE]</p>
          <p><strong>Entity:</strong> Instant Grow LLC</p>
          <p><strong>Registered Address:</strong> [REGISTERED_ADDRESS]</p>
          <p class="mt-4 text-sm opacity-80">Official Facebook: <a href="https://www.facebook.com/Instant.grow.net" class="underline">facebook.com/Instant.grow.net</a></p>
        </div>
      </div>
    `
  },
  {
    path: '/us-company',
    title: 'US LLC Formation for Non-Residents (2026 Guide) | Instant Grow LLC',
    description: 'Form a 100% legally compliant US LLC from anywhere in the world. Compare Wyoming vs Delaware, understand IRS Form 5472 requirements, and open US bank accounts.',
    h1: 'US LLC Formation for International Founders',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'US Company', url: `${SITE_URL}/us-company` }
    ],
    htmlContent: `
      <div class="pre-rendered-page us-company-page max-w-4xl mx-auto py-12 px-4">
        <h1 class="text-4xl font-extrabold tracking-tight">US LLC Formation for International Founders</h1>
        <p class="mt-4 text-lg">You do not need to be a US citizen, hold a green card, or visit the United States to own 100% of a US Limited Liability Company.</p>
        <section class="my-8">
          <h2 class="text-2xl font-bold">Mandatory Post-Formation IRS Compliance</h2>
          <p class="mt-2">Foreign-owned single-member LLCs are classified as disregarded entities for US tax purposes. Under IRS regulations (Section 6038A), every foreign-owned US LLC must file <strong>Form 5472 with a pro-forma Form 1120</strong> annually. The statutory IRS penalty for failing to file or late filing is <strong>$25,000 per violation</strong>.</p>
        </section>
      </div>
    `
  },
  {
    path: '/us-company/wyoming',
    title: 'Form a Wyoming LLC for Non-Residents | Lowest Fees & Privacy',
    description: 'Wyoming is the #1 state for digital businesses, e-commerce, and international founders. $60 annual report fee, zero state income tax, and owner privacy protection.',
    h1: 'Wyoming LLC Formation: Privacy, Low Fees & Protection',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'US Company', url: `${SITE_URL}/us-company` },
      { name: 'Wyoming', url: `${SITE_URL}/us-company/wyoming` }
    ],
    htmlContent: `
      <div class="pre-rendered-page wyoming-page max-w-4xl mx-auto py-12 px-4">
        <h1 class="text-4xl font-extrabold tracking-tight">Wyoming LLC Formation: Privacy, Low Fees & Protection</h1>
        <p class="mt-4 text-lg">Wyoming created the LLC structure in 1977 and remains the gold standard for bootstrapped, digital, and international founders.</p>
        <ul class="my-6 space-y-2">
          <li>✓ State Filing Fee: $102 (one-time state statutory fee)</li>
          <li>✓ Annual Report License Tax: $60/year (lowest in the US)</li>
          <li>✓ 0% State Corporate Income Tax</li>
          <li>✓ Strict Charging Order Protection and Member Privacy</li>
        </ul>
      </div>
    `
  },
  {
    path: '/us-company/delaware',
    title: 'Form a Delaware LLC for Non-Residents | Investor Benchmark',
    description: 'Delaware LLC formation for venture-backed startups and international enterprises. Benefit from the Delaware Court of Chancery and global investor familiarity.',
    h1: 'Delaware LLC Formation: The Global Corporate Standard',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'US Company', url: `${SITE_URL}/us-company` },
      { name: 'Delaware', url: `${SITE_URL}/us-company/delaware` }
    ],
    htmlContent: `
      <div class="pre-rendered-page delaware-page max-w-4xl mx-auto py-12 px-4">
        <h1 class="text-4xl font-extrabold tracking-tight">Delaware LLC Formation: The Global Corporate Standard</h1>
        <p class="mt-4 text-lg">Delaware is the corporate jurisdiction of choice for over 65% of Fortune 500 companies and venture capital investors.</p>
        <ul class="my-6 space-y-2">
          <li>✓ State Filing Fee: $140 statutory state fee</li>
          <li>✓ Delaware Annual Franchise Tax: $300/year (due June 1st annually)</li>
          <li>✓ Specialized Court of Chancery with business judges</li>
          <li>✓ Global recognition by tech accelerators and VC funds</li>
        </ul>
      </div>
    `
  },
  {
    path: '/form-llc',
    title: 'Form a US LLC from MENA & Emerging Markets | Country Directory',
    description: 'Choose your country to view specialized guides for forming a US LLC, overcoming local banking limits, accepting international payments, and IRS compliance.',
    h1: 'Form a US LLC From Your Country',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Form LLC', url: `${SITE_URL}/form-llc` }
    ],
    htmlContent: `
      <div class="pre-rendered-page form-llc-index max-w-4xl mx-auto py-12 px-4">
        <h1 class="text-4xl font-extrabold tracking-tight">Form a US LLC From Your Country</h1>
        <p class="mt-4 text-lg">Select your country below to see local banking insights, currency exchange details, and step-by-step guides tailored to your jurisdiction.</p>
      </div>
    `
  },
  // Legal pages
  {
    path: '/privacy-policy',
    title: 'Privacy Policy | Instant Grow LLC',
    description: 'Instant Grow LLC Privacy Policy. Learn how we collect, handle, and protect your personal and corporate information in accordance with international standards.',
    h1: 'Privacy Policy',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Privacy Policy', url: `${SITE_URL}/privacy-policy` }
    ],
    htmlContent: '<div class="max-w-4xl mx-auto py-12 px-4"><h1 class="text-3xl font-bold">Privacy Policy</h1><p class="mt-4">Last updated: 2026-09-20. Instant Grow LLC is committed to protecting your privacy and confidential formation records.</p></div>'
  },
  {
    path: '/terms-of-service',
    title: 'Terms of Service | Instant Grow LLC',
    description: 'Terms of Service for Instant Grow LLC. Review our service scope, payment terms, registered agent responsibilities, and client obligations.',
    h1: 'Terms of Service',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Terms of Service', url: `${SITE_URL}/terms-of-service` }
    ],
    htmlContent: '<div class="max-w-4xl mx-auto py-12 px-4"><h1 class="text-3xl font-bold">Terms of Service</h1><p class="mt-4">Last updated: 2026-09-20. These Terms of Service govern your use of Instant Grow LLC formation and corporate maintenance services.</p></div>'
  },
  {
    path: '/refund-policy',
    title: 'Refund Policy | Instant Grow LLC',
    description: 'Refund and cancellation policy of Instant Grow LLC. Clear rules regarding government state fees, order processing, and administrative charges.',
    h1: 'Refund Policy',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Refund Policy', url: `${SITE_URL}/refund-policy` }
    ],
    htmlContent: '<div class="max-w-4xl mx-auto py-12 px-4"><h1 class="text-3xl font-bold">Refund Policy</h1><p class="mt-4">Last updated: 2026-09-20. Due to the statutory nature of state filings, government filing fees cannot be refunded once submitted to the Secretary of State.</p></div>'
  },
  {
    path: '/legal-disclaimer',
    title: 'Legal & Tax Disclaimer | Instant Grow LLC',
    description: 'Important legal disclaimer: Instant Grow LLC is a corporate formation filing service and is not an attorney, law firm, CPA, or tax advisor.',
    h1: 'Legal & Tax Disclaimer',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Legal Disclaimer', url: `${SITE_URL}/legal-disclaimer` }
    ],
    htmlContent: '<div class="max-w-4xl mx-auto py-12 px-4"><h1 class="text-3xl font-bold">Legal & Tax Disclaimer</h1><p class="mt-4">Instant Grow LLC is a document preparation and corporate filing service. We do not provide legal, tax, or investment advice. Always consult a qualified US attorney or CPA for specific legal and tax matters.</p></div>'
  },
  {
    path: '/accessibility',
    title: 'Accessibility Statement | Instant Grow LLC',
    description: 'Instant Grow LLC is committed to digital accessibility and ensuring our website conforms to WCAG 2.1 Level AA standards.',
    h1: 'Accessibility Statement',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Accessibility', url: `${SITE_URL}/accessibility` }
    ],
    htmlContent: '<div class="max-w-4xl mx-auto py-12 px-4"><h1 class="text-3xl font-bold">Accessibility Statement</h1><p class="mt-4">We are committed to providing a website that is accessible to the widest possible audience, regardless of technology or ability.</p></div>'
  },
  {
    path: '/kyc-aml',
    title: 'KYC & AML Compliance Policy | Instant Grow LLC',
    description: 'Our Anti-Money Laundering (AML) and Know Your Customer (KYC) policies and compliance procedures under US and international legal standards.',
    h1: 'KYC & AML Compliance Policy',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'KYC & AML Policy', url: `${SITE_URL}/kyc-aml` }
    ],
    htmlContent: '<div class="max-w-4xl mx-auto py-12 px-4"><h1 class="text-3xl font-bold">KYC & AML Compliance Policy</h1><p class="mt-4">Instant Grow LLC strictly adheres to US and international regulations to prevent money laundering and terrorist financing.</p></div>'
  },
  {
    path: '/blog',
    title: 'International Business & Formation Blog | Instant Grow LLC',
    description: 'Actionable guides on US LLC formation, Stripe payment gateways, international business banking, IRS compliance, and global scaling for founders.',
    h1: 'International Business & LLC Formation Insights',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Blog', url: `${SITE_URL}/blog` }
    ],
    htmlContent: `
      <div class="pre-rendered-page blog-index max-w-4xl mx-auto py-12 px-4">
        <h1 class="text-4xl font-extrabold tracking-tight">International Business & LLC Formation Insights</h1>
        <p class="mt-4 text-lg">In-depth guides on remote US company formation, Stripe integration, international business banking, and IRS compliance.</p>
      </div>
    `
  }
]

// 12 Country datasets
const COUNTRIES = [
  {
    slug: 'egypt',
    nameEn: 'Egypt',
    nameAr: 'مصر',
    titleEn: 'Form a US LLC from Egypt (2026 Guide) | Overcome FX & Stripe Limits',
    titleAr: 'تأسيس شركة أمريكية في مصر (دليل 2026) | حل مشكلة سترايب والعملة الصعبة',
    descEn: 'Step-by-step guide for Egyptian freelancers, agencies, and e-commerce founders to form a US LLC, open an FDIC-insured USD bank account, and legally accept Stripe.',
    descAr: 'دليل شامل لرواد الأعمال والمستقلين في مصر لتأسيس شركة أمريكية LLC، فتح حساب بنكي بالدولار، وتفعيل بوابة سترايب وسحب الأرباح بسهولة وبشكل قانوني.',
    currencyDetails: 'EGP limits and credit card monthly caps (often $50-$250) prevent scaling without a USD business account.',
    currencyDetailsAr: 'القيود المفروضة على بطاقات الخصم والائتمان بالجنيه المصري تمنع تمويل الإعلانات والاشتراكات. الشركة الأمريكية تمنحك بطاقات Visa/Mastercard تجارية بالدولار بدون حدود.',
    faqQ1En: 'Can I open an LLC with only an Egyptian passport?',
    faqA1En: 'Yes, 100%. US law permits non-US residents to form an LLC with a valid Egyptian passport. No US visa, SSN, or US visit is required.',
    faqQ1Ar: 'هل يمكنني تأسيس الشركة بجواز السفر المصري فقط؟',
    faqA1Ar: 'نعم بكل تأكيد. يسمح القانون الأمريكي بتأسيس شركة LLC بجواز سفر مصري ساري المفعول بدون الحاجة لفيزا أو سفر أو رقم ضمان اجتماعي SSN.'
  },
  {
    slug: 'saudi-arabia',
    nameEn: 'Saudi Arabia',
    nameAr: 'السعودية',
    titleEn: 'Form a US LLC from Saudi Arabia | Global Trade & Stripe Access',
    titleAr: 'تأسيس شركة أمريكية من السعودية | التوسع العالمي وتفعيل سترايب',
    descEn: 'Form a US LLC from KSA for dropshipping, SaaS, and global consulting. Access US banking, Stripe, and protect your personal assets.',
    descAr: 'أسس شركتك الأمريكية من المملكة العربية السعودية للتجارة الإلكترونية وتطوير البرمجيات. احصل على حساب بنكي أمريكي وبوابة سترايب متوافقة مع الأنظمة العالمية.',
    currencyDetails: 'Smooth SAR transfers via Wise, Relay, or Mercury to manage international clients and SaaS revenue.',
    currencyDetailsAr: 'سلاسة تامة في إدارة الإيرادات بالدولار وتوزيعها محلياً أو عالمياً مع حماية كاملة للمسؤولية القانونية.',
    faqQ1En: 'Why choose a US LLC over a local Saudi CR for international selling?',
    faqA1En: 'A US LLC enables global Stripe processing in 135+ currencies and seamless integration with Shopify, Amazon US, and US venture capital.',
    faqQ1Ar: 'لماذا يفضل رواد الأعمال في السعودية تأسيس LLC بجانب السجل التجاري؟',
    faqA1Ar: 'تمنحك الشركة الأمريكية القدرة على قبول المدفوعات العالمية عبر سترايب بـ 135+ عملة، والارتباط بأسواق أمازون الأمريكية والشركات العالمية بدون عوائق.'
  },
  {
    slug: 'uae',
    nameEn: 'United Arab Emirates',
    nameAr: 'الإمارات',
    titleEn: 'Form a US LLC from the UAE | Dual US-UAE Structure & Stripe',
    titleAr: 'تأسيس شركة أمريكية من الإمارات | هيكلة مزدوجة وتوسيع الأعمال عالمياً',
    descEn: 'Combine your UAE operations with a US LLC. Note: UAE corporate tax is 9% federal (0% only on Qualifying Free Zone Income). Access US clients and Stripe.',
    descAr: 'اربط أعمالك في الإمارات بشركة أمريكية. ملاحظة ضريبية: تطبق الإمارات ضريبة دخل بنسبة 9% (و0% فقط للدخل المؤهل في المناطق الحرة).',
    currencyDetails: 'AED to USD peg makes US LLC operating friction-free for international agency retainers and cross-border tech sales.',
    currencyDetailsAr: 'ربط الدرهم بالدولار يسهل إدارة التدفقات النقدية واستقبال العوائد الاستثمارية والعقود الدولية.',
    faqQ1En: 'How does US taxation work alongside UAE Corporate Tax?',
    faqA1En: 'Single-member US LLCs owned by non-residents pay 0% US federal tax if ETBUS is not triggered. In the UAE, federal corporate tax is 9% on taxable income exceeding AED 375,000 (0% applies solely to Qualifying Free Zone Persons).',
    faqQ1Ar: 'كيف تترابط الضرائب الأمريكية مع ضريبة الشركات في الإمارات؟',
    faqA1Ar: 'تخضع الشركة الأمريكية الفردية لضريبة 0% في أمريكا لغير المقيمين ما لم يكن هناك وجود فعلي (ETBUS). في الإمارات، تطبق ضريبة 9% على الأرباح التي تزيد عن 375 ألف درهم (و0% فقط للكيانات المؤهلة داخل المناطق الحرة).'
  },
  {
    slug: 'jordan',
    nameEn: 'Jordan',
    nameAr: 'الأردن',
    titleEn: 'Form a US LLC from Jordan | Tech Startups & Stripe Processing',
    titleAr: 'تأسيس شركة أمريكية من الأردن | رواد الأعمال التقنيون وحلول سترايب',
    descEn: 'Overcome local payment gateway restrictions in Amman. Form a Wyoming or Delaware LLC, receive foreign remittances, and invoice global clients.',
    descAr: 'تجاوز قيود بوابات الدفع المحلية في الأردن. أسس شركة وايومنغ أو ديلاوير، واستقبل الحوالات بالدولار من عملائك الدوليين عبر سترايب وميركوري.',
    currencyDetails: 'Jordanian Dinars are strictly monitored for business imports; a US LLC provides sovereign USD banking.',
    currencyDetailsAr: 'الحساب البنكي التجاري بالدولار يحميك من قيود بوابات الدفع المحلية ويسمح لك بالتعاقد المباشر مع عملاء الخليج وأمريكا.',
    faqQ1En: 'Can Jordanian developers bill Silicon Valley clients with a US LLC?',
    faqA1En: 'Yes, enterprise clients prefer paying domestic US ACH transfers to an LLC rather than international SWIFT wires to personal accounts.',
    faqQ1Ar: 'هل يمكن للمبرمجين الأردنيين التعاقد مع شركات أمريكية عبر LLC؟',
    faqA1Ar: 'نعم، تفضل الشركات الأمريكية تحويل الأموال محلياً عبر ACH لحساب شركة مسجلة بدلاً من إرسال حوالات دولية لحسابات أفراد.'
  },
  {
    slug: 'kuwait',
    nameEn: 'Kuwait',
    nameAr: 'الكويت',
    titleEn: 'Form a US LLC from Kuwait | E-Commerce & Global Investment',
    titleAr: 'تأسيس شركة أمريكية من الكويت | التجارة الإلكترونية والاستثمار العالمي',
    descEn: 'Register a US LLC from Kuwait for Amazon FBA, Shopify global stores, and cross-border consulting with full liability protection.',
    descAr: 'سجل شركة أمريكية من الكويت لإدارة مبيعات أمازون، متاجر شوبيفاي العالمية، والخدمات الرقمية مع حماية الأصول واستقبال المدفوعات بالدولار.',
    currencyDetails: 'Seamless USD banking integration with KWD capital deployment.',
    currencyDetailsAr: 'تكامل سريع بين رأس المال بالدينار الكويتي وحسابات التشغيل العالمية بالدولار الأمريكي.',
    faqQ1En: 'Which state is recommended for Kuwaiti founders: Wyoming or Delaware?',
    faqA1En: 'Wyoming is recommended for digital businesses and e-commerce ($60/yr renewal); Delaware is recommended if raising US institutional venture capital.',
    faqQ1Ar: 'أيهما أفضل لرواد الأعمال في الكويت: وايومنغ أم ديلاوير؟',
    faqA1Ar: 'وايومنغ هي الخيار الأمثل للمتاجر والخدمات الرقمية ($60 سنوياً)؛ أما ديلاوير فهي الأنسب في حال البحث عن استثمارات من صناديق رأس المال الجريء.'
  },
  {
    slug: 'qatar',
    nameEn: 'Qatar',
    nameAr: 'قطر',
    titleEn: 'Form a US LLC from Qatar | Cross-Border Commerce & Stripe',
    titleAr: 'تأسيس شركة أمريكية من قطر | التجارة الدولية وبوابات الدفع',
    descEn: 'Launch your US corporate vehicle from Doha. Access global Stripe checkout, Mercury/Relay business banking, and maintain active good standing.',
    descAr: 'أطلق شركتك الأمريكية من الدوحة. احصل على بوابة دفع سترايب عالمية، حساب بنكي في ميركوري أو ريلاي، واحمِ علامتك التجارية عالمياً.',
    currencyDetails: 'Stable QAR peg ensures predictable USD liquidity for international transactions.',
    currencyDetailsAr: 'استقرار سعر الصرف يتيح إدارة سلسة للتدفقات النقدية الدولية وتمويل الحملات الإعلانية العالمية.',
    faqQ1En: 'Can a Qatari citizen or resident own 100% of a US company?',
    faqA1En: 'Yes, 100% foreign ownership is fully protected under US corporate law.',
    faqQ1Ar: 'هل يحق للمواطن أو المقيم في قطر امتلاك الشركة الأمريكية بنسبة 100%؟',
    faqA1Ar: 'نعم، يتيح القانون الأمريكي الملكية الأجنبية الكاملة بنسبة 100% بدون اشتراط شريك محلي.'
  },
  {
    slug: 'oman',
    nameEn: 'Oman',
    nameAr: 'سلطنة عمان',
    titleEn: 'Form a US LLC from Oman | Expand Globally with Stripe & US Banking',
    titleAr: 'تأسيس شركة أمريكية من سلطنة عمان | التوسع التجاري وحلول الدفع الدولية',
    descEn: 'Empowering Omani entrepreneurs to scale internationally. Form a US LLC, bypass local gateway friction, and receive client wires in USD.',
    descAr: 'تمكين رواد الأعمال في سلطنة عمان من الانطلاق عالمياً. أسس شركة LLC، تجاوز صعوبات بوابات الدفع، واستقبل مدفوعاتك بالدولار.',
    currencyDetails: 'Direct USD account operations eliminate costly double-conversion fees for Omani founders.',
    currencyDetailsAr: 'تجنب رسوم التحويل المزدوج للعملات واستقبل أرباحك مباشرة في حساب بنكي تجاري أمريكي معتمد.',
    faqQ1En: 'How long does it take to form a US LLC from Oman?',
    faqA1En: 'State formation takes 2-3 business days. IRS EIN processing for non-residents without an SSN typically takes 3-6 weeks via SS-4 fax submission.',
    faqQ1Ar: 'كم يستغرق تأسيس الشركة الأمريكية من سلطنة عمان؟',
    faqA1Ar: 'يستغرق تسجيل الشركة بالولاية 2-3 أيام عمل. أما إصدار الرقم الضريبي الفيدرالي EIN لغير حاملي SSN فيستغرق عادة من 3 إلى 6 أسابيع عبر مصلحة الضرائب IRS.'
  },
  {
    slug: 'bahrain',
    nameEn: 'Bahrain',
    nameAr: 'البحرين',
    titleEn: 'Form a US LLC from Bahrain | Fintech & E-Commerce Expansion',
    titleAr: 'تأسيس شركة أمريكية من البحرين | رواد التقنية المالية والمتاجر الإلكترونية',
    descEn: 'Register your US legal presence from Manama. Link Stripe, issue corporate debit cards, and scale your digital products across global markets.',
    descAr: 'سجل حضورك القانوني في أمريكا من المنامة. اربط متجرك بسترايب، أصدر بطاقات بنكية تجارية، ووسع نطاق منتجاتك الرقمية عالمياً.',
    currencyDetails: 'BHD fixed exchange rate pairs perfectly with US corporate banking structures.',
    currencyDetailsAr: 'تكامل كامل بين التدفقات النقدية بالدينار البحريني والحسابات التجارية الأمريكية لتسهيل التعاقدات الدولية.',
    faqQ1En: 'Does Instant Grow provide a registered agent in Wyoming/Delaware?',
    faqA1En: 'Yes, 1 full year of statutory registered agent service is included in all formation packages.',
    faqQ1Ar: 'هل توفر Instant Grow خدمة الوكيل المسجل في وايومنغ أو ديلاوير؟',
    faqA1Ar: 'نعم، تتضمن جميع باقات التأسيس خدمة الوكيل المسجل المعتمد لمدة سنة كاملة مجاناً.'
  },
  {
    slug: 'iraq',
    nameEn: 'Iraq',
    nameAr: 'العراق',
    titleEn: 'Form a US LLC from Iraq | The Legal Fix for Stripe & Global Banking',
    titleAr: 'تأسيس شركة أمريكية من العراق | الحل القانوني لبوابات الدفع والبنوك العالمية',
    descEn: 'Bypass payment isolation. Iraqi freelancers and agencies use a legitimate US LLC to open FDIC-insured bank accounts and process international cards.',
    descAr: 'تغلب على عزلة بوابات الدفع. يستعين رواد الأعمال في العراق بشركة LLC أمريكية لفتح حسابات بنكية موثقة واستقبال المدفوعات بالدولار.',
    currencyDetails: 'Strict local banking rules make international card checkout impossible locally; a US entity provides full global payment capabilities.',
    currencyDetailsAr: 'صعوبة بوابات الدفع المحلية تجعل الشركة الأمريكية الحل القانوني الوحيد لاستقبال أموال العملاء الدوليين وتفعيل سترايب.',
    faqQ1En: 'Can Iraqi citizens be approved for a US business bank account?',
    faqA1En: 'Yes, digital partner banks like Mercury and Relay accept Iraqi passport holders with a valid LLC, EIN, and operational business website.',
    faqQ1Ar: 'هل يتم قبول جواز السفر العراقي في البنوك الرقمية الأمريكية؟',
    faqA1Ar: 'نعم، تقبل البنوك الرقمية مثل ميركوري وريلاي أصحاب الجوازات العراقية عند تقديم مستندات الشركة الرسمية ورقم EIN وموقع إلكتروني يوضح النشاط.'
  },
  {
    slug: 'morocco',
    nameEn: 'Morocco',
    nameAr: 'المغرب',
    titleEn: 'Form a US LLC from Morocco | Bypass Dotation Caps & Stripe Bans',
    titleAr: 'تأسيس شركة أمريكية من المغرب | حل قيود مكتب الصرف وتفعيل سترايب',
    descEn: 'Moroccan digital dotation caps (100,000 DH/yr) suffocate growth. A US LLC provides an uncapped USD bank account, virtual cards, and Stripe.',
    descAr: 'تجاوز سقف مخصصات التجارة الإلكترونية لمكتب الصرف (100 ألف درهم سنوياً). تمنحك الشركة الأمريكية حساباً بنكياً بالدولار وبطاقات تجارية غير محدودة.',
    currencyDetails: 'Office des Changes constraints are solved by operating a registered US entity with revenues collected directly in USD.',
    currencyDetailsAr: 'العمل من خلال شركة أمريكية يجنبك قيود التحويل وسقوف بطاقات الائتمان المحلية، مما يتيح لك تمويل حملاتك الإعلانية وسحب أرباحك بحرية.',
    faqQ1En: 'How does an LLC help with Moroccan e-commerce dotation limits?',
    faqA1En: 'A US LLC opens an FDIC-insured US account with unlimited commercial debit cards funded by your sales, independent of Moroccan personal exchange caps.',
    faqQ1Ar: 'كيف تحل الشركة الأمريكية مشكلة سقف الدفع الإلكتروني في المغرب؟',
    faqA1Ar: 'توفر لك الشركة الأمريكية بطاقات خصم تجارية أمريكية مرتبطة برصيد مبيعاتك بالدولار، مما يتيح لك الدفع للإعلانات والاشتراكات بدون أي سقف سنوي.'
  },
  {
    slug: 'turkey',
    nameEn: 'Turkey',
    nameAr: 'تركيا',
    titleEn: 'Form a US LLC from Turkey | The Definitive PayPal & Stripe Solution',
    titleAr: 'تأسيس شركة أمريكية من تركيا | الحل النهائي لحظر بايبال وسترايب',
    descEn: 'PayPal and Stripe are blocked for Turkish entities. Form a US LLC to legally operate US Stripe, US PayPal, and hedge against Lira volatility.',
    descAr: 'حظر بايبال وسترايب للشركات التركية يقف عائقاً أمام أعمالك. أسس شركة أمريكية للحصول على بايبال وسترايب أمريكيين وحماية أموالك بالدولار.',
    currencyDetails: 'Hedge against Turkish Lira volatility by maintaining corporate reserves in USD at US financial institutions.',
    currencyDetailsAr: 'احمِ أعمالك وأرباحك من تقلبات الليرة التركية عبر الاحتفاظ بأرصدتك بالدولار في بنوك أمريكية مؤمنة.',
    faqQ1En: 'Can I legally operate US PayPal and Stripe from Turkey?',
    faqA1En: 'Yes. When formed, your US LLC is a domestic US corporate entity entitled to US banking, Stripe processing, and US PayPal merchant accounts.',
    faqQ1Ar: 'هل تشغيل بايبال وسترايب الأمريكي من تركيا قانوني؟',
    faqA1Ar: 'نعم قانوني 100%. الشركة الأمريكية هي كيان تجاري أمريكي معتمد يحق له فتح حسابات مصرفية وربط بوابات الدفع الأمريكية رسمياً.'
  },
  {
    slug: 'pakistan',
    nameEn: 'Pakistan',
    nameAr: 'باكستان',
    titleEn: 'Form a US LLC from Pakistan | Enable Stripe & Amazon FBA',
    titleAr: 'تأسيس شركة أمريكية من باكستان | تفعيل سترايب وأمازون FBA',
    descEn: 'Overcome the absence of native Stripe and PayPal in Pakistan. Pakistani founders use our US LLC formation service to scale globally and receive USD directly.',
    descAr: 'تغلب على غياب سترايب وبايبال في باكستان. يستعين رواد الأعمال بشركة LLC أمريكية لاستقبال مستحقاتهم بالدولار والتوسع في التجارة الإلكترونية.',
    currencyDetails: 'Direct USD receipts via ACH/wire eliminate heavy local intermediary markups and wire clearance delays.',
    currencyDetailsAr: 'استقبال مباشر للمدفوعات بالدولار وتسهيل التحويل لحسابات محلية عبر Payoneer أو Wise بأفضل أسعار صرف.',
    faqQ1En: 'Can Pakistani IT exporters use an LLC to sign international contracts?',
    faqA1En: 'Yes, international clients trust US legal entities for intellectual property protection, SLA agreements, and direct domestic ACH bank transfers.',
    faqQ1Ar: 'هل تساعد الشركة الأمريكية شركات البرمجة والخدمات في باكستان؟',
    faqA1Ar: 'نعم، تعطي الشركة الأمريكية موثوقية عالية للعملاء في أمريكا وأوروبا وتتيح لهم الدفع مباشرة عبر بطاقات الائتمان والحسابات البنكية الأمريكية.'
  }
]

// Blog Posts list
const BLOG_POSTS = [
  {
    slug: 'why-stripe-doesnt-work-your-country',
    title: "Why Stripe Doesn't Work in Your Country (And the One Fix)",
    description: 'Stripe powers the global economy, but its 46-country limit excludes 150+ nations. Discover how international founders legally access Stripe with a US LLC.',
    h1: "Why Stripe Doesn't Work in Your Country (And the One Legal Fix)",
    publishDate: '2026-07-18',
    author: 'Instant Grow Advisory Team'
  },
  {
    slug: 'how-to-open-us-llc-3-steps',
    title: 'How to Open a US LLC in 3 Steps (From Any Country)',
    description: 'Form a legal US company from anywhere in the world in 3 business days. No US visa, no travel, and no US partner required.',
    h1: 'How to Open a US LLC in 3 Steps (From Any Country)',
    publishDate: '2026-07-18',
    author: 'Instant Grow Advisory Team'
  },
  {
    slug: '5-biggest-mistakes-new-llc-owners',
    title: '5 Biggest Mistakes New LLC Owners Make (And How to Avoid Them)',
    description: 'Avoid costly compliance errors: IRS Form 5472 penalties, state franchise tax surprises, and personal fund co-mingling.',
    h1: '5 Biggest Mistakes New LLC Owners Make (And How to Avoid Them)',
    publishDate: '2026-07-18',
    author: 'Instant Grow Legal Team'
  },
  {
    slug: 'best-us-bank-accounts-non-residents',
    title: 'Best US Bank Accounts for Non-Residents (2026 Comparison)',
    description: 'Comprehensive review and comparison of Mercury, Relay, Wise Business, and fintech options for international entrepreneurs.',
    h1: 'Best US Bank Accounts for Non-Residents (2026 Comparison)',
    publishDate: '2026-07-18',
    author: 'Instant Grow Banking Specialists'
  },
  {
    slug: 'how-to-receive-usd-payments-legally',
    title: 'How to Receive USD Payments Legally From Any Country',
    description: 'Stop losing 5-10% to intermediaries. Learn the official method to invoice international clients and receive USD directly into your US account.',
    h1: 'How to Receive USD Payments Legally From Any Country',
    publishDate: '2026-07-18',
    author: 'Instant Grow Finance Team'
  },
  {
    slug: 'why-global-founders-win-bigger',
    title: 'Why Global Founders Win Bigger (And How You Can Too)',
    description: 'The geo-arbitrage advantage: earning in strong currency (USD) while building from high-efficiency international hubs.',
    h1: 'Why Global Founders Win Bigger (And How You Can Too)',
    publishDate: '2026-07-18',
    author: 'Instant Grow Growth Team'
  },
  {
    slug: 'why-freelancers-stay-stuck',
    title: 'Why Freelancers Stay Stuck (And How to Escape With an LLC)',
    description: 'Transition from $20 freelance gigs to $5,000 corporate retainers by transforming your solo identity into a trusted US corporate brand.',
    h1: 'Why Freelancers Stay Stuck (And How to Escape With an LLC)',
    publishDate: '2026-07-18',
    author: 'Instant Grow Advisory Team'
  },
  {
    slug: '10-us-llc-myths-debunked',
    title: '10 US LLC Myths Debunked (What International Founders Must Know)',
    description: 'Do you need a green card? Do you have to pay 30% US income tax? We debunk the 10 biggest misconceptions holding international founders back.',
    h1: '10 US LLC Myths Debunked (What International Founders Must Know)',
    publishDate: '2026-07-18',
    author: 'Instant Grow Legal Team'
  },
  {
    slug: 'scale-business-1k-to-10k',
    title: 'How to Scale Your Business From $1K to $10K/Month With a US LLC',
    description: 'The exact playbook used by e-commerce, SaaS, and agency founders to scale revenue 10X by opening up Western markets and seamless checkout.',
    h1: 'How to Scale Your Business From $1K to $10K/Month With a US LLC',
    publishDate: '2026-07-18',
    author: 'Instant Grow Growth Advisory'
  },
  {
    slug: 'freedom-equation-us-llc-changes-your-life',
    title: 'The Freedom Equation: How a US LLC Changes Your Entrepreneurial Life',
    description: 'Global banking, sovereign asset protection, and zero currency conversion restrictions give you complete geographical and financial autonomy.',
    h1: 'The Freedom Equation: How a US LLC Changes Your Entrepreneurial Life',
    publishDate: '2026-07-18',
    author: 'Instant Grow Editorial'
  },
  {
    slug: 'how-to-form-llc-delaware-2025',
    title: 'How to Form an LLC in Delaware: Complete 2026 Guide',
    description: 'Delaware is the global gold standard for business incorporation. Learn why over 60% of Fortune 500 companies choose Delaware and how to form yours remotely.',
    h1: 'How to Form an LLC in Delaware: Complete 2026 Guide',
    publishDate: '2026-07-18',
    author: 'Instant Grow Legal Team'
  },
  {
    slug: 'wyoming-llc-vs-delaware-llc',
    title: 'Wyoming LLC vs Delaware LLC: Which Is Better for Your Business?',
    description: 'Choosing between Wyoming and Delaware? We break down costs, privacy, taxes, and asset protection so you make the optimal decision for your company.',
    h1: 'Wyoming LLC vs Delaware LLC: Which Is Better for Your Business?',
    publishDate: '2026-07-18',
    author: 'Instant Grow Advisory Team'
  },
  {
    slug: 'non-us-residents-us-business-bank-account-2025',
    title: 'How Non-US Residents Can Open a US Business Bank Account in 2026',
    description: 'A practical step-by-step guide for international entrepreneurs to open an FDIC-insured US business bank account without traveling to the United States.',
    h1: 'How Non-US Residents Can Open a US Business Bank Account in 2026',
    publishDate: '2026-07-18',
    author: 'Instant Grow Banking Specialists'
  },
  {
    slug: 'what-is-ein-why-llc-needs-one',
    title: 'What Is an EIN and Why Does Your LLC Need One?',
    description: 'An EIN (Employer Identification Number) from the IRS is mandatory for opening US bank accounts and running Stripe. Here is how it works.',
    h1: 'What Is an EIN and Why Does Your LLC Need One?',
    publishDate: '2026-07-18',
    author: 'Instant Grow Tax Advisory'
  },
  {
    slug: 'single-member-vs-multi-member-llc',
    title: 'Single-Member LLC vs Multi-Member LLC: Key Differences',
    description: 'Are you launching alone or with co-founders? Understand how ownership structure impacts pass-through taxation, management, and liability protection.',
    h1: 'Single-Member LLC vs Multi-Member LLC: Key Differences',
    publishDate: '2026-07-18',
    author: 'Instant Grow Legal Team'
  },
  {
    slug: 'how-to-maintain-llc-annual-requirements',
    title: 'How to Maintain Your LLC: Annual Requirements Checklist',
    description: 'Forming your LLC is just step one. Maintain continuous good standing with this annual state filing, registered agent, and tax compliance checklist.',
    h1: 'How to Maintain Your LLC: Annual Requirements Checklist',
    publishDate: '2026-07-18',
    author: 'Instant Grow Compliance Team'
  }
]

// Helper to assemble static HTML
function prerenderFile({
  routePath,
  title,
  description,
  h1,
  breadcrumbs = [],
  schema = null,
  bodyContent = '',
  isRtl = false,
  lang = 'en'
}) {
  const fullUrl = `${SITE_URL}${routePath}`

  let html = templateHtml

  // Update html lang & dir
  html = html.replace(/<html lang="[^"]*"/, `<html lang="${lang}"${isRtl ? ' dir="rtl"' : ' dir="ltr"'}`)

  // Update Title
  html = html.replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)

  // Update Meta Description
  html = html.replace(/<meta name="description" content="[\s\S]*?" \/>/, `<meta name="description" content="${description}" />`)

  // Update Canonical
  html = html.replace(/<link rel="canonical" href="[\s\S]*?" \/>/, `<link rel="canonical" href="${fullUrl}" />`)

  // Update Open Graph tags
  html = html.replace(/<meta property="og:title" content="[\s\S]*?" \/>/, `<meta property="og:title" content="${title}" />`)
  html = html.replace(/<meta property="og:description" content="[\s\S]*?" \/>/, `<meta property="og:description" content="${description}" />`)
  html = html.replace(/<meta property="og:url" content="[\s\S]*?" \/>/, `<meta property="og:url" content="${fullUrl}" />`)

  // Update Twitter Card tags
  html = html.replace(/<meta name="twitter:title" content="[\s\S]*?" \/>/, `<meta name="twitter:title" content="${title}" />`)
  html = html.replace(/<meta name="twitter:description" content="[\s\S]*?" \/>/, `<meta name="twitter:description" content="${description}" />`)

  // Add hreflang tags if not present
  const hreflangTags = `
    <link rel="alternate" hreflang="en" href="${fullUrl}" />
    <link rel="alternate" hreflang="ar" href="${fullUrl}?lang=ar" />
    <link rel="alternate" hreflang="x-default" href="${fullUrl}" />
  `
  html = html.replace('<!-- ── Canonical ───────────────────────────────────────────────────────── -->', `<!-- ── Hreflang Alternates ───────────────────────────────────────────── -->${hreflangTags}\n    <!-- ── Canonical ───────────────────────────────────────────────────────── -->`)

  // Build breadcrumb schema
  const breadcrumbSchema = breadcrumbs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': breadcrumbs.map((bc, idx) => ({
      '@type': 'ListItem',
      'position': idx + 1,
      'name': bc.name,
      'item': bc.url
    }))
  } : null

  // Inject route schemas before </head>
  const schemaScripts = []
  if (breadcrumbSchema) {
    schemaScripts.push(`<script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>`)
  }
  if (schema) {
    schemaScripts.push(`<script type="application/ld+json">${JSON.stringify(schema)}</script>`)
  }
  if (schemaScripts.length > 0) {
    html = html.replace('</head>', `  ${schemaScripts.join('\n  ')}\n</head>`)
  }

  // Pre-render content inside <div id="root">
  const cleanBody = `
    <div id="ssr-container" class="min-h-screen bg-[#070b14] text-white flex flex-col font-sans">
      <nav class="border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <a href="/" class="flex items-center gap-2 font-bold text-xl text-emerald-400">
          <img src="/logo.webp" alt="Instant Grow Logo" class="w-8 h-8 rounded-full" />
          <span>Instant Grow</span>
        </a>
        <div class="hidden md:flex items-center gap-6 text-sm">
          <a href="/services" class="hover:text-emerald-400">Services</a>
          <a href="/us-company" class="hover:text-emerald-400">US Company</a>
          <a href="/about" class="hover:text-emerald-400">About</a>
          <a href="/team" class="hover:text-emerald-400">Team</a>
          <a href="/how-we-work" class="hover:text-emerald-400">How We Work</a>
          <a href="/blog" class="hover:text-emerald-400">Blog</a>
          <a href="/contact" class="hover:text-emerald-400">Contact</a>
        </div>
      </nav>
      <main class="flex-1">
        ${bodyContent}
      </main>
      <footer class="border-t border-white/10 bg-slate-950/80 px-6 py-8 text-xs text-slate-400 text-center">
        <p>© ${new Date().getFullYear()} Instant Grow LLC. All rights reserved. Registered Address: [REGISTERED_ADDRESS].</p>
        <p class="mt-2">Security Notice: Beware of imitation websites (e.g. instantgrow.org, instantgrow.cc). Instant Grow LLC operates strictly on instantgrow.net.</p>
        <div class="mt-4 flex flex-wrap justify-center gap-4 text-slate-300">
          <a href="/terms-of-service" class="hover:underline">Terms of Service</a>
          <a href="/privacy-policy" class="hover:underline">Privacy Policy</a>
          <a href="/refund-policy" class="hover:underline">Refund Policy</a>
          <a href="/legal-disclaimer" class="hover:underline">Legal Disclaimer</a>
          <a href="/team" class="hover:underline">Team</a>
          <a href="/how-we-work" class="hover:underline">How We Work</a>
        </div>
      </footer>
    </div>
  `

  html = html.replace('<div id="root"></div>', `<div id="root">${cleanBody}</div>`)

  // Save to dist/<route>/index.html
  const targetDir = path.join(distDir, routePath.replace(/^\//, ''))
  fs.mkdirSync(targetDir, { recursive: true })
  fs.writeFileSync(path.join(targetDir, 'index.html'), html, 'utf-8')
}

// Generate all pages
console.log('🚀 Pre-rendering static HTML pages for instant SEO delivery...')

// 1. Core pages
PAGES.forEach(p => {
  prerenderFile({
    routePath: p.path,
    title: p.title,
    description: p.description,
    h1: p.h1,
    breadcrumbs: p.breadcrumbs,
    bodyContent: p.htmlContent
  })
})
console.log(`✅ Pre-rendered ${PAGES.length} core pages`)

// 2. 12 Country pages (both English and Arabic versions)
COUNTRIES.forEach(c => {
  // English version
  const countryPath = `/form-llc/${c.slug}`
  const enContent = `
    <div class="pre-rendered-page country-page max-w-4xl mx-auto py-12 px-4">
      <header class="text-center py-6">
        <span class="text-xs uppercase tracking-widest text-emerald-400 font-semibold">Specialized Formation Guide</span>
        <h1 class="text-4xl font-extrabold tracking-tight mt-2">${c.titleEn.split('|')[0].trim()}</h1>
        <p class="mt-4 text-lg text-slate-300">${c.descEn}</p>
      </header>

      <div class="my-8 p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
        <h2 class="text-2xl font-bold">Local Banking & Payment Reality in ${c.nameEn}</h2>
        <p class="text-slate-300 leading-relaxed">${c.currencyDetails}</p>
        <p class="text-sm text-emerald-400 font-medium">✓ Solution: Form a US LLC to open an FDIC-insured USD bank account (Mercury/Relay) and activate full Stripe payment processing.</p>
      </div>

      <div class="my-8 p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
        <h2 class="text-2xl font-bold">Frequently Asked Questions for Founders in ${c.nameEn}</h2>
        <div class="space-y-4">
          <div>
            <h3 class="font-semibold text-lg text-white">${c.faqQ1En}</h3>
            <p class="text-slate-300 mt-1">${c.faqA1En}</p>
          </div>
          <div>
            <h3 class="font-semibold text-lg text-white">What mandatory IRS filings are required each year?</h3>
            <p class="text-slate-300 mt-1">Foreign-owned single-member LLCs must file IRS Form 5472 and pro-forma Form 1120 annually. The statutory penalty for failing to file is $25,000.</p>
          </div>
        </div>
      </div>

      <div class="my-8 text-center">
        <a href="/order?country=${c.slug}" class="inline-block bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-8 py-4 rounded-xl shadow-lg transition">Form Your US LLC from ${c.nameEn}</a>
      </div>
    </div>
  `

  const countrySchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    'name': `US LLC Formation Service for ${c.nameEn} Founders`,
    'provider': {
      '@type': 'Organization',
      'name': 'Instant Grow LLC',
      'url': SITE_URL
    },
    'areaServed': c.nameEn,
    'description': c.descEn
  }

  prerenderFile({
    routePath: countryPath,
    title: c.titleEn,
    description: c.descEn,
    h1: c.titleEn.split('|')[0].trim(),
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Form LLC', url: `${SITE_URL}/form-llc` },
      { name: c.nameEn, url: `${SITE_URL}${countryPath}` }
    ],
    schema: countrySchema,
    bodyContent: enContent
  })
})
console.log(`✅ Pre-rendered 12 country pages`)

// 3. Blog posts
BLOG_POSTS.forEach(b => {
  const blogPath = `/blog/${b.slug}`
  const blogContent = `
    <article class="pre-rendered-page blog-post max-w-3xl mx-auto py-12 px-4">
      <header class="mb-8">
        <div class="flex items-center gap-3 text-xs text-emerald-400 font-semibold uppercase tracking-wider mb-2">
          <span>By ${b.author}</span>
          <span>•</span>
          <time datetime="${b.publishDate}">${b.publishDate}</time>
        </div>
        <h1 class="text-3xl sm:text-4xl font-extrabold tracking-tight">${b.h1}</h1>
        <p class="mt-4 text-lg text-slate-300 leading-relaxed">${b.description}</p>
      </header>

      <div class="prose prose-invert max-w-none text-slate-300 space-y-4">
        <p>Forming and running a remote US business is the single most powerful unlock for international entrepreneurs today. With the proper corporate structure, banking relationships, and tax compliance, founders anywhere in the world can compete on a level playing field.</p>
        <p>For complete details and personalized guidance on establishing your US entity, explore our <a href="/services" class="text-emerald-400 underline">formation services</a> or speak with our team directly.</p>
      </div>

      <div class="my-8 p-6 rounded-2xl bg-white/5 border border-white/10 text-center">
        <h3 class="text-xl font-bold">Ready to Launch Your US Entity?</h3>
        <p class="text-sm text-slate-300 mt-2">Get your LLC filed in Wyoming or Delaware with EIN, registered agent, and US banking support.</p>
        <a href="/order" class="mt-4 inline-block bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold px-6 py-3 rounded-xl transition">Start Formation Now</a>
      </div>
    </article>
  `

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': b.h1,
    'description': b.description,
    'datePublished': b.publishDate,
    'author': {
      '@type': 'Organization',
      'name': b.author
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'Instant Grow LLC',
      'logo': {
        '@type': 'ImageObject',
        'url': `${SITE_URL}/logo.png`
      }
    }
  }

  prerenderFile({
    routePath: blogPath,
    title: `${b.title} | Instant Grow LLC`,
    description: b.description,
    h1: b.h1,
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Blog', url: `${SITE_URL}/blog` },
      { name: b.title, url: `${SITE_URL}${blogPath}` }
    ],
    schema: blogSchema,
    bodyContent: blogContent
  })
})
console.log(`✅ Pre-rendered ${BLOG_POSTS.length} blog posts`)

console.log('🎉 Pre-rendering complete! All routes will now be directly served by Apache with unique Title, Meta Description, H1, Canonical, and Schema!')

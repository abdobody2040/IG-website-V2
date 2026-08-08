export interface CategoryInfo {
  dbName: string
  label_en: string
  label_ar: string
  icon: string
  desc_en: string
  desc_ar: string
  startingPrice: string
  startingPriceAr: string
}

export const CATEGORY_MAP: Record<string, CategoryInfo> = {
  'business-formation': {
    dbName: 'Business Formation',
    label_en: 'Business Formation',
    label_ar: 'تأسيس الشركات',
    icon: 'Building2',
    desc_en: 'Launch your UK LTD, US LLC, or UAE company globally.',
    desc_ar: 'أسس شركتك في بريطانيا، أمريكا، أو الإمارات بكل سهولة.',
    startingPrice: '$149',
    startingPriceAr: '149 دولار'
  },
  'government-compliance': {
    dbName: 'Government & Compliance',
    label_en: 'Government & Compliance',
    label_ar: 'الامتثال والشؤون الحكومية',
    icon: 'Shield',
    desc_en: 'EIN, registered agents, BOI reporting, and annual filings.',
    desc_ar: 'الرقم الضريبي EIN، الوكيل المسجل، وإقرارات ملكية المستفيد السنوية.',
    startingPrice: '$79',
    startingPriceAr: '79 دولار'
  },
  'banking-payments': {
    dbName: 'Banking & Payments',
    label_en: 'Banking & Payments',
    label_ar: 'الحسابات البنكية والدفع',
    icon: 'CreditCard',
    desc_en: 'Setup business accounts with Mercury, Wise, Stripe, and PayPal.',
    desc_ar: 'تفعيل حسابات ميركوري ووايز وبوابات دفع سترايب وباي بال.',
    startingPrice: '$129',
    startingPriceAr: '129 دولار'
  },
  'legal-documents': {
    dbName: 'Legal Documents',
    label_en: 'Legal Documents',
    label_ar: 'المستندات القانونية',
    icon: 'FileText',
    desc_en: 'Draft custom contracts, NDAs, and corporate resolutions.',
    desc_ar: 'صياغة العقود التجارية الخاصة، اتفاقيات عدم الإفصاح والقرارات.',
    startingPrice: '$49',
    startingPriceAr: '49 دولار'
  },
  'branding': {
    dbName: 'Branding',
    label_en: 'Branding & Design',
    label_ar: 'الهوية البصرية والتصميم',
    icon: 'Palette',
    desc_en: 'Logo design, brand guidelines, and social media kits.',
    desc_ar: 'تصميم الشعارات، أدلة استخدام العلامة، وحزم التواصل الاجتماعي.',
    startingPrice: '$49',
    startingPriceAr: '49 دولار'
  },
  'websites': {
    dbName: 'Websites',
    label_en: 'Websites & E-Commerce',
    label_ar: 'الم مواقع والمتاجر الإلكترونية',
    icon: 'Laptop',
    desc_en: 'Custom landing pages, Shopify stores, and SaaS websites.',
    desc_ar: 'تصميم صفحات الهبوط، متاجر شوبيفاي، وم مواقع البرمجيات المخصصة.',
    startingPrice: '$29',
    startingPriceAr: '29 دولار'
  },
  'marketing': {
    dbName: 'Marketing',
    label_en: 'Marketing & Ads',
    label_ar: 'التسويق والإعلانات',
    icon: 'TrendingUp',
    desc_en: 'Google Ads, Meta campaigns, SEO, and growth strategies.',
    desc_ar: 'إعلانات جوجل وميتا الممولة، تحسين السيو، وإستراتيجيات النمو.',
    startingPrice: '$149',
    startingPriceAr: '149 دولار'
  },
  'content': {
    dbName: 'Content',
    label_en: 'Content & Copywriting',
    label_ar: 'صناعة المحتوى والكتابة',
    icon: 'BookOpen',
    desc_en: 'Copywriting, blog posts, video editing, and motion graphics.',
    desc_ar: 'كتابة النصوص الإعلانية، المقالات، مونتاج الفيديو والموشن جرافيك.',
    startingPrice: '$79',
    startingPriceAr: '79 دولار'
  },
  'ai-automation': {
    dbName: 'AI Automation',
    label_en: 'AI Automation & Agents',
    label_ar: 'أتمتة الذكاء الاصطناعي',
    icon: 'Bot',
    desc_en: 'AI customer support, WhatsApp agents, and voice call automation.',
    desc_ar: 'روبوتات خدمة العملاء، مساعد واتساب، وأتمتة المكالمات الصوتية.',
    startingPrice: '$149',
    startingPriceAr: '149 دولار'
  },
  'software': {
    dbName: 'Software',
    label_en: 'Software & Integrations',
    label_ar: 'البرمجيات والربط التقني',
    icon: 'Code',
    desc_en: 'CRM setup, ERP deployment, custom portals, and apps.',
    desc_ar: 'تنصيب أنظمة CRM وERP، وتطوير بوابات العملاء والتطبيقات.',
    startingPrice: '$249',
    startingPriceAr: '249 دولار'
  },
  'business-consulting': {
    dbName: 'Business Consulting',
    label_en: 'Business Consulting',
    label_ar: 'الاستشارات وإستراتيجيات الأعمال',
    icon: 'BarChart3',
    desc_en: 'Market research, competitor analysis, and pitch decks.',
    desc_ar: 'دراسات وأبحاث السوق، تحليل المنافسين، وعروض المستثمرين.',
    startingPrice: '$149',
    startingPriceAr: '149 دولار'
  },
  'education': {
    dbName: 'Education',
    label_en: 'Education & Templates',
    label_ar: 'التعليم والملفات الجاهزة',
    icon: 'GraduationCap',
    desc_en: 'Business templates bundles, SOP libraries, and guides.',
    desc_ar: 'حزم قوالب ونماذج العمل، مكتبة إجراءات التشغيل، والأدلة.',
    startingPrice: '$19',
    startingPriceAr: '19 دولار'
  },
  // Aliases for user navigation convenience
  'banking-finance': {
    dbName: 'Banking & Payments',
    label_en: 'Banking & Finance',
    label_ar: 'الحسابات البنكية والتمويل',
    icon: 'Landmark',
    desc_en: 'Setup business accounts with Mercury, Wise, Stripe, and PayPal.',
    desc_ar: 'تفعيل حسابات ميركوري ووايز وبوابات دفع سترايب وباي بال.',
    startingPrice: '$129',
    startingPriceAr: '129 دولار'
  },
  'payment-processing': {
    dbName: 'Banking & Payments',
    label_en: 'Payment Processing',
    label_ar: 'بوابات وحلول الدفع',
    icon: 'CreditCard',
    desc_en: 'Stripe, PayPal, and merchant payment gateway solutions.',
    desc_ar: 'حلول وإعداد بوابات الدفع الإلكتروني سترايب وباي بال.',
    startingPrice: '$129',
    startingPriceAr: '129 دولار'
  },
  'tax-accounting': {
    dbName: 'Government & Compliance',
    label_en: 'Tax & Compliance Support',
    label_ar: 'الامتثال والاستشارات الضريبية',
    icon: 'Shield',
    desc_en: 'EIN, tax filings, and ongoing compliance support.',
    desc_ar: 'الرقم الضريبي EIN، التقارير الضريبية، ودعم الامتثال المستمر.',
    startingPrice: '$79',
    startingPriceAr: '79 دولار'
  }
}

export const getCategorySlug = (categoryDbName?: string): string => {
  if (!categoryDbName) return 'business-formation'
  const entry = Object.entries(CATEGORY_MAP).find(([_, value]) => value.dbName === categoryDbName)
  return entry ? entry[0] : 'business-formation'
}

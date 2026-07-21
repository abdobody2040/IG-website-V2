import { useState, useEffect } from 'react'
import * as Icons from 'lucide-react'
import { Search, Loader2, ArrowRight, SlidersHorizontal, RotateCcw, Check, Star, Sparkles, Clock, Globe } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useLang } from '../i18n/LanguageContext'
import { setPageMeta, getCanonical } from '../lib/seo'
import { useServices } from '../hooks/useServices'
import { motion, AnimatePresence } from 'framer-motion'
import { SERVICES_EXTENDED_DATA } from '../data/servicesExtendedData'

export const CATEGORY_MAP: Record<string, {
  dbName: string
  label_en: string
  label_ar: string
  icon: string
  desc_en: string
  desc_ar: string
  startingPrice: string
  startingPriceAr: string
}> = {
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
    label_ar: 'المواقع والمتاجر الإلكترونية',
    icon: 'Laptop',
    desc_en: 'Custom landing pages, Shopify stores, and SaaS websites.',
    desc_ar: 'تصميم صفحات الهبوط، متاجر شوبيفاي، ومواقع البرمجيات المخصصة.',
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
  }
}

export const getCategorySlug = (categoryDbName?: string): string => {
  if (!categoryDbName) return 'business-formation'
  const entry = Object.entries(CATEGORY_MAP).find(([_, value]) => value.dbName === categoryDbName)
  return entry ? entry[0] : 'business-formation'
}

export default function ServicesPage() {
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const { services, loading } = useServices()

  // State
  const [viewMode, setViewMode] = useState<'categories' | 'directory'>('categories')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedCountries, setSelectedCountries] = useState<string[]>([])
  const [priceType, setPriceType] = useState<'all' | 'one-time' | 'subscription'>('all')
  const [selectedStages, setSelectedStages] = useState<string[]>([])
  const [showPopular, setShowPopular] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showAi, setShowAi] = useState(false)
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  useEffect(() => {
    setPageMeta({
      title: isAr ? 'دليل الخدمات الشامل | Instant Grow' : 'Complete Services Directory | Instant Grow',
      description: isAr
        ? 'تصفح خدماتنا المتكاملة لتأسيس وتنمية أعمالك العالمية. نوفر حلول التأسيس والامتثال والتمويل والبرمجيات وأتمتة الذكاء الاصطناعي.'
        : 'Explore our complete catalog of premium business launch and growth services—from company formation and compliance to custom websites, marketing, and AI automation.',
      canonical: getCanonical('/services'),
    })
  }, [isAr])

  // Helper to toggle multi-selects
  const toggleFilter = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, val: string) => {
    setViewMode('directory')
    if (list.includes(val)) {
      setList(list.filter(x => x !== val))
    } else {
      setList([...list, val])
    }
  }

  const resetFilters = () => {
    setSelectedCategories([])
    setSelectedCountries([])
    setPriceType('all')
    setSelectedStages([])
    setShowPopular(false)
    setShowNew(false)
    setShowAi(false)
    setSearchQuery('')
  }

  // Filter logic
  const activeServices = services.filter(s => s.active && s.category !== 'State Fees')

  const filteredServices = activeServices.filter(svc => {
    const extended = SERVICES_EXTENDED_DATA[svc.id]

    // Search query match
    if (searchQuery.trim() !== '') {
      const query = searchQuery.toLowerCase()
      const title = (isAr ? svc.title_ar : svc.title_en).toLowerCase()
      const desc = (isAr ? svc.description_ar : svc.description_en).toLowerCase()
      if (!title.includes(query) && !desc.includes(query)) return false
    }

    // Category filter match
    if (selectedCategories.length > 0) {
      if (!svc.category || !selectedCategories.includes(svc.category)) return false
    }

    // Country filter match
    if (selectedCountries.length > 0) {
      const country = extended?.country ?? 'Global'
      if (!selectedCountries.includes(country)) return false
    }

    // Price Type match
    if (priceType !== 'all') {
      const isSub = extended?.isSubscription ?? (svc.period_en.toLowerCase().includes('month') || svc.period_en.toLowerCase().includes('year'))
      if (priceType === 'subscription' && !isSub) return false
      if (priceType === 'one-time' && isSub) return false
    }

    // Business Stage match
    if (selectedStages.length > 0) {
      const stage = extended?.businessStage ?? 'Formation'
      if (!selectedStages.includes(stage)) return false
    }

    // Badges match
    if (showPopular && !extended?.isPopular) return false
    if (showNew && !extended?.isNew) return false
    if (showAi && !extended?.isAiPowered) return false

    return true
  })

  // List of all active filters count
  const activeFiltersCount = 
    selectedCategories.length + 
    selectedCountries.length + 
    (priceType !== 'all' ? 1 : 0) + 
    selectedStages.length + 
    (showPopular ? 1 : 0) + 
    (showNew ? 1 : 0) + 
    (showAi ? 1 : 0)

  // Watch search query and switch mode
  const handleSearchChange = (val: string) => {
    setSearchQuery(val)
    if (val.trim() !== '') {
      setViewMode('directory')
    }
  }

  const countries = ['US', 'UK', 'UAE', 'Oman', 'Global']
  const stages = ['Idea', 'Formation', 'Compliance', 'Operations', 'Growth', 'Scaling']

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col relative overflow-hidden text-slate-800">
      {/* Background blobs */}
      <div className="absolute top-[-10%] left-[-20%] w-[50%] h-[50%] rounded-full bg-blue-400/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <Navbar />

      {/* Hero Header */}
      <section className="pt-32 pb-14 relative text-center border-b border-slate-100 bg-white">
        <div className="max-w-[900px] mx-auto px-5">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-[#2563EB] text-xs sm:text-sm font-bold uppercase tracking-widest bg-blue-50 border border-blue-100/50 px-4 py-1.5 rounded-full mb-5"
          >
            {isAr ? 'منصة خدمات تنمية وإطلاق المشاريع الأولى' : 'THE GLOBAL BUSINESS LAUNCH & GROWTH PLATFORM'}
          </motion.span>
          
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0F172A] mb-5 leading-tight"
            style={{ fontFamily: 'Sora, Inter, sans-serif' }}
          >
            {isAr ? 'دليل الخدمات الشامل' : 'Services Directory'}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-base sm:text-lg max-w-2xl mx-auto mb-8 leading-relaxed font-medium"
          >
            {isAr
              ? 'تصفح أكثر من 80 خدمة احترافية مصممة خصيصاً لمساعدتك في تأسيس عملك التجاري، وإدارته، والتسويق له، وأتمتته بالكامل بالذكاء الاصطناعي.'
              : 'Browse over 80 professional services engineered to help you launch, run, market, and fully automate your business with artificial intelligence.'}
          </motion.p>

          {/* Search bar */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="max-w-xl mx-auto relative z-30"
          >
            <div className="relative group">
              <Search className={`absolute ${isAr ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#2563EB] transition-colors`} size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={e => handleSearchChange(e.target.value)}
                placeholder={isAr ? 'ابحث عن أي خدمة (مثل: تأسيس، متجر، ذكاء اصطناعي)...' : 'Search any service (e.g. LLC, Store, Chatbot)...'}
                className={`w-full ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 bg-slate-50 hover:bg-white border border-slate-200 focus:bg-white shadow-sm rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all font-semibold text-slate-800 placeholder-slate-400`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className={`absolute ${isAr ? 'left-4' : 'right-4'} top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 font-bold text-xs`}
                >
                  {isAr ? 'مسح' : 'Clear'}
                </button>
              )}
            </div>
          </motion.div>

          {/* Directory Toggle Tabs */}
          <div className="flex items-center justify-center mt-10">
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center gap-1 border border-slate-200/50">
              <button
                onClick={() => setViewMode('categories')}
                className={`px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all ${viewMode === 'categories' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {isAr ? 'استعراض الأقسام' : 'Browse Categories'}
              </button>
              <button
                onClick={() => setViewMode('directory')}
                className={`px-6 py-2.5 rounded-xl text-xs font-extrabold transition-all ${viewMode === 'directory' ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
              >
                {isAr ? 'الدليل التفصيلي المباشر' : 'All Services Directory'}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Section */}
      <section className="flex-1 max-w-[1280px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-20">
        
        {/* VIEW 1: CATEGORIES GRID */}
        {viewMode === 'categories' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {Object.entries(CATEGORY_MAP).map(([slug, cat], index) => {
              const IconComponent = (Icons as any)[cat.icon] || Icons.HelpCircle
              const label = isAr ? cat.label_ar : cat.label_en
              const desc = isAr ? cat.desc_ar : cat.desc_en
              
              const count = loading ? 0 : activeServices.filter(s => s.category === cat.dbName).length
              const countStr = isAr ? `${count} خدمة` : `${count} Services`
              const price = isAr ? cat.startingPriceAr : cat.startingPrice
              
              return (
                <motion.div
                  key={slug}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                  className="group relative bg-white border border-slate-200/60 rounded-3xl p-7 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-blue-500/20 hover:-translate-y-1.5 transition-all duration-300"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5 text-blue-600 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform duration-300">
                      <IconComponent size={24} className="text-[#2563EB]" />
                    </div>

                    <h3 className="text-lg font-extrabold text-slate-900 mb-2 group-hover:text-[#2563EB] transition-colors" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
                      {label}
                    </h3>
                    <p className="text-slate-500 text-xs sm:text-sm leading-relaxed mb-6 font-semibold">
                      {desc}
                    </p>
                  </div>

                  <div>
                    <div className="flex items-center justify-between border-t border-slate-100 pt-4 mb-4 text-[11px] text-slate-400 font-bold">
                      <span>{countStr}</span>
                      <span className="text-[#2563EB]">
                        {isAr ? 'تبدأ من ' : 'Starting from '}
                        <span className="text-xs font-black">{price}</span>
                      </span>
                    </div>

                    <a
                      href={`/services/${slug}`}
                      className="w-full flex items-center justify-center gap-1.5 py-3 px-4 rounded-xl bg-slate-50 hover:bg-[#2563EB] text-slate-700 hover:text-white border border-slate-200/40 hover:border-transparent text-xs font-bold transition-all duration-200"
                    >
                      <span>{isAr ? 'عرض القسم' : 'Explore Category'}</span>
                      <Icons.ArrowRight size={12} className={isAr ? 'rotate-180' : ''} />
                    </a>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}

        {/* VIEW 2: INTERACTIVE DIRECTORY */}
        {viewMode === 'directory' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
            
            {/* Sidebar Filters (Desktop) */}
            <aside className="lg:col-span-1 hidden lg:block bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h3 className="text-sm font-bold text-slate-955 flex items-center gap-1.5">
                  <SlidersHorizontal size={16} className="text-slate-500" />
                  {isAr ? 'تصفية النتائج' : 'Filter Catalog'}
                </h3>
                {activeFiltersCount > 0 && (
                  <button
                    onClick={resetFilters}
                    className="text-[10px] font-bold text-[#2563EB] hover:text-blue-700 flex items-center gap-1"
                  >
                    <RotateCcw size={10} />
                    {isAr ? 'إعادة تعيين' : 'Reset'}
                  </button>
                )}
              </div>

              {/* Category Filter */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{isAr ? 'الأقسام الرئيسية' : 'Categories'}</h4>
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                  {Object.values(CATEGORY_MAP).map(cat => {
                    const isChecked = selectedCategories.includes(cat.dbName)
                    return (
                      <label key={cat.dbName} className="flex items-center gap-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFilter(selectedCategories, setSelectedCategories, cat.dbName)}
                          className="rounded text-[#2563EB] focus:ring-blue-500 border-slate-300 w-4 h-4"
                        />
                        <span>{isAr ? cat.label_ar : cat.label_en}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Country Filter */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{isAr ? 'الدولة المستهدفة' : 'Target Country'}</h4>
                <div className="space-y-2">
                  {countries.map(c => {
                    const isChecked = selectedCountries.includes(c)
                    return (
                      <label key={c} className="flex items-center gap-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFilter(selectedCountries, setSelectedCountries, c)}
                          className="rounded text-[#2563EB] focus:ring-blue-500 border-slate-300 w-4 h-4"
                        />
                        <span>{c === 'Global' ? (isAr ? 'عالمي / مستقل' : 'Global / Independent') : c}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Price Type */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{isAr ? 'نوع الدفع' : 'Payment Flow'}</h4>
                <div className="grid grid-cols-3 gap-1 bg-slate-50 p-1 rounded-xl border border-slate-200/50">
                  {(['all', 'one-time', 'subscription'] as const).map(type => (
                    <button
                      key={type}
                      onClick={() => setPriceType(type)}
                      className={`py-1.5 px-2 rounded-lg text-[10px] font-bold transition-all ${
                        priceType === type
                          ? 'bg-white text-blue-600 shadow-sm border border-slate-200/20'
                          : 'text-slate-500 hover:text-slate-800'
                      }`}
                    >
                      {type === 'all' ? (isAr ? 'الكل' : 'All') : type === 'one-time' ? (isAr ? 'مرة واحدة' : 'One-time') : (isAr ? 'شهري' : 'Monthly')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Business Stage */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{isAr ? 'مرحلة المشروع' : 'Business Stage'}</h4>
                <div className="space-y-2">
                  {stages.map(s => {
                    const isChecked = selectedStages.includes(s)
                    return (
                      <label key={s} className="flex items-center gap-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => toggleFilter(selectedStages, setSelectedStages, s)}
                          className="rounded text-[#2563EB] focus:ring-blue-500 border-slate-300 w-4 h-4"
                        />
                        <span>{s}</span>
                      </label>
                    )
                  })}
                </div>
              </div>

              {/* Flags / Badges */}
              <div className="space-y-3 pt-4 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">{isAr ? 'خيارات إضافية' : 'Quick Tags'}</h4>
                <div className="space-y-2.5">
                  <label className="flex items-center gap-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPopular}
                      onChange={e => setShowPopular(e.target.checked)}
                      className="rounded text-[#2563EB] focus:ring-blue-500 border-slate-300 w-4 h-4"
                    />
                    <span className="flex items-center gap-1">
                      <Star size={12} className="text-amber-500 fill-amber-500" />
                      {isAr ? 'الأكثر طلباً' : 'Popular'}
                    </span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showNew}
                      onChange={e => setShowNew(e.target.checked)}
                      className="rounded text-[#2563EB] focus:ring-blue-500 border-slate-300 w-4 h-4"
                    />
                    <span className="flex items-center gap-1">
                      <Sparkles size={12} className="text-emerald-500 fill-emerald-500" />
                      {isAr ? 'خدمات جديدة' : 'New Released'}
                    </span>
                  </label>
                  <label className="flex items-center gap-2.5 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showAi}
                      onChange={e => setShowAi(e.target.checked)}
                      className="rounded text-[#2563EB] focus:ring-blue-500 border-slate-300 w-4 h-4"
                    />
                    <span className="flex items-center gap-1">
                      <BotIcon size={12} className="text-purple-500" />
                      {isAr ? 'مدعوم بالذكاء الاصطناعي' : 'AI Powered'}
                    </span>
                  </label>
                </div>
              </div>
            </aside>

            {/* Mobile Filters Toggle Button */}
            <div className="lg:hidden w-full flex items-center justify-between bg-white border border-slate-200/50 p-4 rounded-2xl shadow-sm mb-2">
              <span className="text-xs font-bold text-slate-500">
                {isAr ? `تم العثور على ${filteredServices.length} خدمة` : `Found ${filteredServices.length} services`}
              </span>
              <button
                onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                className="flex items-center gap-1.5 px-4 py-2 bg-blue-50 hover:bg-blue-100/80 text-blue-600 text-xs font-extrabold rounded-xl border border-blue-200/20 transition-colors"
              >
                <SlidersHorizontal size={14} />
                {isAr ? 'تصفية وبحث' : 'Filters'}
              </button>
            </div>

            {/* Mobile Filters Panel (Collapsible) */}
            <AnimatePresence>
              {mobileFiltersOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="lg:hidden w-full bg-white border border-slate-200 p-5 rounded-2xl space-y-4 shadow-md overflow-hidden"
                >
                  {/* Category Filter */}
                  <div className="space-y-2">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase">{isAr ? 'الأقسام' : 'Categories'}</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.values(CATEGORY_MAP).map(cat => {
                        const isChecked = selectedCategories.includes(cat.dbName)
                        return (
                          <button
                            key={cat.dbName}
                            onClick={() => toggleFilter(selectedCategories, setSelectedCategories, cat.dbName)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold border transition-all ${
                              isChecked
                                ? 'bg-blue-55 bg-blue-50 text-blue-600 border-blue-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200/60'
                            }`}
                          >
                            {isAr ? cat.label_ar : cat.label_en}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Country Filter */}
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase">{isAr ? 'الدولة' : 'Country'}</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {countries.map(c => {
                        const isChecked = selectedCountries.includes(c)
                        return (
                          <button
                            key={c}
                            onClick={() => toggleFilter(selectedCountries, setSelectedCountries, c)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold border transition-all ${
                              isChecked
                                ? 'bg-blue-55 bg-blue-50 text-blue-600 border-blue-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200/60'
                            }`}
                          >
                            {c === 'Global' ? (isAr ? 'عالمي' : 'Global') : c}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Business Stage */}
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase">{isAr ? 'مرحلة المشروع' : 'Stage'}</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {stages.map(s => {
                        const isChecked = selectedStages.includes(s)
                        return (
                          <button
                            key={s}
                            onClick={() => toggleFilter(selectedStages, setSelectedStages, s)}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold border transition-all ${
                              isChecked
                                ? 'bg-blue-55 bg-blue-50 text-blue-600 border-blue-200'
                                : 'bg-slate-50 text-slate-600 border-slate-200/60'
                            }`}
                          >
                            {s}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  {/* Quick Tags */}
                  <div className="space-y-2 border-t border-slate-100 pt-3">
                    <h4 className="text-[11px] font-bold text-slate-400 uppercase">{isAr ? 'خيارات إضافية' : 'Quick Tags'}</h4>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowPopular(!showPopular)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold border flex items-center gap-1 transition-all ${
                          showPopular
                            ? 'bg-blue-55 bg-blue-50 text-blue-600 border-blue-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200/60'
                        }`}
                      >
                        <Star size={10} className="fill-amber-400 text-amber-400" />
                        {isAr ? 'الشائع' : 'Popular'}
                      </button>
                      <button
                        onClick={() => setShowNew(!showNew)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold border flex items-center gap-1 transition-all ${
                          showNew
                            ? 'bg-blue-55 bg-blue-50 text-blue-600 border-blue-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200/60'
                        }`}
                      >
                        <Sparkles size={10} className="text-emerald-500" />
                        {isAr ? 'جديد' : 'New'}
                      </button>
                      <button
                        onClick={() => setShowAi(!showAi)}
                        className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold border flex items-center gap-1 transition-all ${
                          showAi
                            ? 'bg-blue-55 bg-blue-50 text-blue-600 border-blue-200'
                            : 'bg-slate-50 text-slate-600 border-slate-200/60'
                        }`}
                      >
                        <BotIcon size={10} className="text-purple-500" />
                        {isAr ? 'ذكاء اصطناعي' : 'AI'}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-3 border-t border-slate-100">
                    <button
                      onClick={resetFilters}
                      className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
                    >
                      {isAr ? 'إعادة تعيين الكل' : 'Reset All'}
                    </button>
                    <button
                      onClick={() => setMobileFiltersOpen(false)}
                      className="flex-1 py-2.5 bg-blue-600 text-white text-xs font-bold rounded-xl transition-all"
                    >
                      {isAr ? 'تطبيق الفلاتر' : 'Apply Filters'}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Catalog Grid Area */}
            <div className="lg:col-span-3 space-y-6">
              
              {/* Directory Header Meta */}
              <div className="hidden lg:flex items-center justify-between border-b border-slate-200/60 pb-3">
                <span className="text-xs font-bold text-slate-400">
                  {isAr ? `وجدنا ${filteredServices.length} خدمة` : `Showing ${filteredServices.length} services`}
                </span>
                <span className="text-[10px] text-slate-400 font-extrabold">
                  {activeFiltersCount > 0 ? (
                    <span className="text-blue-600">
                      {isAr ? `${activeFiltersCount} فلتر نشط` : `${activeFiltersCount} active filters`}
                    </span>
                  ) : (
                    (isAr ? 'يعرض جميع الخدمات' : 'Displaying complete catalog')
                  )}
                </span>
              </div>

              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3 bg-white border border-slate-200/50 rounded-3xl">
                  <Loader2 className="animate-spin text-[#2563EB]" size={32} />
                  <span className="text-slate-500 text-sm font-semibold">{isAr ? 'جاري تحميل الخدمات...' : 'Loading services...'}</span>
                </div>
              ) : filteredServices.length === 0 ? (
                <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-16 text-center">
                  <Icons.AlertCircle size={44} className="text-slate-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-slate-900 mb-1">
                    {isAr ? 'لا توجد نتائج مطابقة' : 'No Matching Services'}
                  </h3>
                  <p className="text-slate-400 text-xs font-semibold mb-6 max-w-sm mx-auto">
                    {isAr
                      ? 'جرب كتابة مصطلح بحث مختلف أو قم بإلغاء بعض الفلاتر النشطة.'
                      : 'Try typing a different keyword or reset active filters to view all services.'}
                  </p>
                  <button
                    onClick={resetFilters}
                    className="py-2.5 px-6 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-600 text-xs font-extrabold border border-blue-200/20 transition-all"
                  >
                    {isAr ? 'إعادة تعيين كافة الفلاتر' : 'Reset All Filters'}
                  </button>
                </div>
              ) : (
                <motion.div
                  layout
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                >
                  <AnimatePresence>
                    {filteredServices.map(svc => {
                      const IconComponent = (Icons as any)[svc.icon] || Icons.HelpCircle
                      const extended = SERVICES_EXTENDED_DATA[svc.id]
                      const title = isAr ? svc.title_ar : svc.title_en
                      const desc = isAr ? svc.description_ar : svc.description_en
                      const period = isAr ? svc.period_ar : svc.period_en
                      const slug = getCategorySlug(svc.category)

                      const country = extended?.country ?? 'Global'
                      const isAi = extended?.isAiPowered
                      const isNewSvc = extended?.isNew
                      const isPopularSvc = extended?.isPopular
                      const deliveryDays = extended?.estimatedDeliveryDays ?? 3

                      return (
                        <motion.div
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.2 }}
                          key={svc.id}
                          className="group bg-white border border-slate-200/60 rounded-3xl p-6 shadow-sm hover:shadow-lg hover:border-blue-500/20 transition-all duration-300 flex flex-col justify-between"
                        >
                          <div>
                            {/* Card tags */}
                            <div className="flex items-center gap-1 mb-4 flex-wrap">
                              {isPopularSvc && (
                                <span className="bg-amber-50 text-amber-700 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                  <Star size={8} className="fill-amber-400 text-amber-400" />
                                  {isAr ? 'شائع' : 'Popular'}
                                </span>
                              )}
                              {isNewSvc && (
                                <span className="bg-emerald-50 text-emerald-700 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                  <Sparkles size={8} className="text-emerald-500" />
                                  {isAr ? 'جديد' : 'New'}
                                </span>
                              )}
                              {isAi && (
                                <span className="bg-purple-50 text-purple-700 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                                  <BotIcon size={8} className="text-purple-500" />
                                  {isAr ? 'ذكاء اصطناعي' : 'AI'}
                                </span>
                              )}
                              <span className="bg-slate-100 text-slate-500 text-[9px] font-extrabold px-2 py-0.5 rounded-full flex items-center gap-0.5 ml-auto">
                                <Globe size={8} />
                                {country}
                              </span>
                            </div>

                            {/* Title & Icon */}
                            <div className="flex items-start gap-3.5 mb-3">
                              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform duration-300">
                                <IconComponent size={20} />
                              </div>
                              <h4 className="text-sm sm:text-base font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                                {title}
                              </h4>
                            </div>

                            {/* Description */}
                            <p className="text-slate-500 text-xs leading-relaxed line-clamp-3 font-semibold mb-4">
                              {desc}
                            </p>
                          </div>

                          <div className="space-y-4">
                            {/* Features preview */}
                            {extended?.starterFeatures && extended.starterFeatures.length > 0 && (
                              <div className="space-y-1.5 border-t border-slate-100 pt-3">
                                {extended.starterFeatures.slice(0, 2).map((feat, i) => (
                                  <div key={i} className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold">
                                    <Check size={10} className="text-emerald-500 stroke-[3]" />
                                    <span className="truncate">{feat}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Price and Action */}
                            <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-xs font-bold">
                              <div>
                                <span className="text-[10px] text-slate-400 block mb-0.5">{isAr ? 'تبدأ من' : 'Starting From'}</span>
                                <span className="text-sm font-black text-blue-600">
                                  {svc.price > 0 ? `$${svc.price}` : (isAr ? 'مشمول' : 'Included')}
                                </span>
                                {svc.price > 0 && (
                                  <span className="text-[9px] font-semibold text-slate-400 ml-1">/ {period}</span>
                                )}
                              </div>

                              <div className="text-right">
                                <span className="text-[9px] text-slate-400 flex items-center gap-1 mb-1 font-bold justify-end">
                                  <Clock size={10} />
                                  {deliveryDays} {isAr ? 'أيام تسليم' : 'days delivery'}
                                </span>
                                <a
                                  href={`/services/${slug}/${svc.id}`}
                                  className="inline-flex items-center gap-1 text-[10px] font-extrabold text-[#2563EB] hover:text-blue-700 transition-all"
                                >
                                  {isAr ? 'عرض الباقات' : 'View Plans'}
                                  <ArrowRight size={10} className={isAr ? 'rotate-180' : ''} />
                                </a>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )
                    })}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>

          </div>
        )}

      </section>

      <Footer />
    </div>
  )
}

function BotIcon({ size = 16, className = '' }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  )
}

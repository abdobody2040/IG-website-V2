import { useState, useEffect } from 'react'
import * as Icons from 'lucide-react'
import { Search, Loader2, ArrowRight } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useLang } from '../i18n/LanguageContext'
import { setPageMeta, getCanonical } from '../lib/seo'
import { useServices } from '../hooks/useServices'
import { motion, AnimatePresence } from 'framer-motion'

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
  'company-formation': {
    dbName: 'Company Formation',
    label_en: 'Company Formation',
    label_ar: 'تأسيس الشركات',
    icon: 'Building2',
    desc_en: 'Launch your business anywhere in the world.',
    desc_ar: 'ابدأ عملك التجاري في أي مكان في العالم.',
    startingPrice: '$149',
    startingPriceAr: '149 دولار'
  },
  'compliance': {
    dbName: 'Compliance & Legal',
    label_en: 'Compliance & Legal',
    label_ar: 'الامتثال والشؤون القانونية',
    icon: 'Scale',
    desc_en: 'Keep your business compliant and legal.',
    desc_ar: 'حافظ على توافق شركتك قانونياً والتزامها المستمر.',
    startingPrice: '$39',
    startingPriceAr: '39 دولار'
  },
  'international-documents': {
    dbName: 'International Documents',
    label_en: 'International Documents',
    label_ar: 'الوثائق الدولية',
    icon: 'Globe',
    desc_en: 'Legalize and authenticate documents globally.',
    desc_ar: 'توثيق وتصديق المستندات والوثائق على مستوى عالمي.',
    startingPrice: '$45',
    startingPriceAr: '45 دولار'
  },
  'digital': {
    dbName: 'Digital Services',
    label_en: 'Digital Services',
    label_ar: 'الخدمات الرقمية',
    icon: 'Laptop',
    desc_en: 'Web design, development, email, and AI solutions.',
    desc_ar: 'تصميم وتطوير المواقع والبريد الإلكتروني وحلول الذكاء الاصطناعي.',
    startingPrice: '$29',
    startingPriceAr: '29 دولار'
  },
  'marketing': {
    dbName: 'Marketing & Growth',
    label_en: 'Marketing & Growth',
    label_ar: 'التسويق والنمو',
    icon: 'TrendingUp',
    desc_en: 'SEO, ads, content, and growth consulting.',
    desc_ar: 'تحسين محركات البحث، الإعلانات الممولة، وإستراتيجيات النمو والانتشار.',
    startingPrice: '$199',
    startingPriceAr: '199 دولار'
  },
  'creative': {
    dbName: 'Creative Services',
    label_en: 'Creative Services',
    label_ar: 'الخدمات الإبداعية',
    icon: 'Paintbrush',
    desc_en: 'Branding, logo, graphics, video, and design.',
    desc_ar: 'الهوية البصرية، تصميم الشعارات، الجرافيكس والمونتاج الاحترافي.',
    startingPrice: '$49',
    startingPriceAr: '49 دولار'
  },
  'consulting': {
    dbName: 'Business Consulting',
    label_en: 'Business Consulting',
    label_ar: 'الاستشارات التجارية',
    icon: 'BarChart3',
    desc_en: 'Market research, analysis, and business strategy.',
    desc_ar: 'دراسات السوق والتحليل المالي وإستراتيجيات التوسع.',
    startingPrice: '$99',
    startingPriceAr: '99 دولار'
  },
  'resources': {
    dbName: 'Digital Products',
    label_en: 'Templates & Resources',
    label_ar: 'القوالب والموارد',
    icon: 'BookOpen',
    desc_en: 'Contracts, guides, and courses for founders.',
    desc_ar: 'عقود جاهزة، أدلة إرشادية، ودورات تدريبية لرواد الأعمال.',
    startingPrice: 'Free',
    startingPriceAr: 'مجاناً'
  }
}

export const getCategorySlug = (categoryDbName?: string): string => {
  if (!categoryDbName) return 'company-formation'
  const entry = Object.entries(CATEGORY_MAP).find(([_, value]) => value.dbName === categoryDbName)
  return entry ? entry[0] : 'company-formation'
}

export default function ServicesPage() {
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const { services, loading } = useServices()
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    setPageMeta({
      title: isAr ? 'الخدمات المهنية والحلول | Instant Grow' : 'Professional Business Services | Instant Grow',
      description: isAr
        ? 'اكتشف خدماتنا الاحترافية - بدءًا من تأسيس الشركات والامتثال القانوني إلى حلول الويب والتسويق والأتمتة.'
        : 'Explore our premium standalone services—from company formation and compliance to web development, marketing, and AI automation.',
      canonical: getCanonical('/services'),
    })
  }, [isAr])

  const activeServices = services.filter(s => s.active)

  // Filter services for search results
  const searchedServices = searchQuery.trim() === ''
    ? []
    : activeServices.filter(svc => {
        const query = searchQuery.toLowerCase()
        const title = (isAr ? svc.title_ar : svc.title_en).toLowerCase()
        const desc = (isAr ? svc.description_ar : svc.description_en).toLowerCase()
        return title.includes(query) || desc.includes(query)
      })

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col relative overflow-hidden">
      {/* Decorative gradients */}
      <div className="absolute top-[-10%] left-[-20%] w-[50%] h-[50%] rounded-full bg-blue-400/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-500/5 blur-[120px] pointer-events-none" />

      <Navbar />

      {/* Hero Section */}
      <section className="pt-36 pb-20 relative text-center">
        <div className="max-w-[800px] mx-auto px-5">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block text-[#2563EB] text-xs sm:text-sm font-bold uppercase tracking-widest bg-blue-50 border border-blue-100/50 px-4 py-1.5 rounded-full mb-5"
          >
            {isAr ? 'منصة الخدمات المتكاملة' : 'ALL-IN-ONE SERVICES PLATFORM'}
          </motion.span>
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#0F172A] mb-5 leading-tight"
            style={{ fontFamily: 'Sora, Inter, sans-serif' }}
          >
            {isAr ? 'خدمات الأعمال الاحترافية' : 'Professional Business Services'}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-slate-500 text-base sm:text-lg lg:text-xl max-w-2xl mx-auto mb-10 leading-relaxed font-medium"
          >
            {isAr
              ? 'كل ما يحتاجه عملك — بدءًا من تأسيس الشركة والامتثال القانوني إلى التسويق وتصميم المواقع وأتمتة الذالاء الاصطناعي والتوسع العالمي.'
              : 'Everything your business needs—from company formation and legal compliance to marketing, websites, AI automation, and international expansion.'}
          </motion.p>

          {/* Search Bar Container */}
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
                onChange={e => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'ابحث عن أي خدمة...' : 'Search any service...'}
                className={`w-full ${isAr ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-4 bg-white border border-slate-200 shadow-sm rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all font-semibold text-slate-800 placeholder-slate-400`}
              />
            </div>

            {/* Search Results Dropdown */}
            <AnimatePresence>
              {searchQuery.trim() !== '' && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute left-0 right-0 mt-2 bg-white rounded-2xl border border-slate-100 shadow-[0_20px_50px_rgba(15,23,42,0.12)] max-h-[350px] overflow-y-auto text-left z-50 p-2 custom-scrollbar"
                >
                  {loading ? (
                    <div className="flex items-center justify-center py-10 gap-2">
                      <Loader2 className="animate-spin text-[#2563EB]" size={18} />
                      <span className="text-xs text-slate-400 font-bold">{isAr ? 'جاري البحث...' : 'Searching...'}</span>
                    </div>
                  ) : searchedServices.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 text-xs font-bold">
                      {isAr ? 'لم نجد أي خدمات تطابق بحثك' : 'No matching services found'}
                    </div>
                  ) : (
                    searchedServices.map(svc => {
                      const IconComponent = (Icons as any)[svc.icon] || Icons.HelpCircle
                      const title = isAr ? svc.title_ar : svc.title_en
                      const desc = isAr ? svc.description_ar : svc.description_en
                      const slug = getCategorySlug(svc.category)
                      return (
                        <a
                          key={svc.id}
                          href={`/services/${slug}/${svc.id}`}
                          className="flex items-center gap-3.5 p-3 rounded-xl hover:bg-slate-50 group transition-all duration-200"
                        >
                          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform">
                            <IconComponent size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-slate-800 text-[13px] font-bold group-hover:text-[#2563EB] transition-colors truncate">
                              {title}
                            </h4>
                            <p className="text-slate-400 text-[11px] font-medium truncate">
                              {desc}
                            </p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <span className="text-[12px] font-bold text-[#2563EB] block">
                              {svc.price > 0 ? `$${svc.price}` : (isAr ? 'مشمول' : 'Included')}
                            </span>
                            {svc.price > 0 && (
                              <span className="text-[10px] text-slate-400 font-semibold block">
                                {isAr ? svc.period_ar : svc.period_en}
                              </span>
                            )}
                          </div>
                        </a>
                      )
                    })
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Categories Grid Section */}
      <section className="flex-1 max-w-[1280px] w-full mx-auto px-5 sm:px-8 lg:px-10 pb-28 relative z-25">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {Object.entries(CATEGORY_MAP).map(([slug, cat], index) => {
            const IconComponent = (Icons as any)[cat.icon] || Icons.HelpCircle
            const label = isAr ? cat.label_ar : cat.label_en
            const desc = isAr ? cat.desc_ar : cat.desc_en
            
            // Calculate dynamic counts and min prices if loaded
            const count = loading ? 0 : activeServices.filter(s => s.category === cat.dbName).length
            const countStr = isAr ? `${count} خدمة` : `${count} Services`
            const price = isAr ? cat.startingPriceAr : cat.startingPrice
            
            return (
              <motion.div
                key={slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative bg-white/70 backdrop-blur-md border border-slate-200/50 rounded-[24px] p-8 flex flex-col justify-between shadow-[0_8px_30px_rgb(0,0,0,0.02)] hover:shadow-[0_20px_50px_rgba(37,99,235,0.06)] hover:border-blue-500/20 hover:-translate-y-1.5 transition-all duration-300"
              >
                <div>
                  {/* Glassmorphic Blue Icon */}
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/5 text-blue-600 flex items-center justify-center flex-shrink-0 mb-6 group-hover:scale-110 transition-transform duration-300">
                    <IconComponent size={28} className="text-[#2563EB]" />
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-[#2563EB] transition-colors" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
                    {label}
                  </h3>
                  <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                    {desc}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between border-t border-slate-100 pt-5 mb-5 text-xs text-slate-400 font-bold">
                    <span>{countStr}</span>
                    <span className="text-[#2563EB]">
                      {isAr ? 'تبدأ من ' : 'Starting from '}
                      <span className="text-sm font-extrabold">{price}</span>
                    </span>
                  </div>

                  <a
                    href={`/services/${slug}`}
                    className="w-full flex items-center justify-center gap-1.5 py-3.5 px-4 rounded-xl bg-slate-50 hover:bg-[#2563EB] text-slate-700 hover:text-white border border-slate-200/40 hover:border-transparent text-xs font-bold transition-all duration-200"
                  >
                    <span>{isAr ? 'عرض الخدمات' : 'View Services'}</span>
                    <ArrowRight size={13} className={`${isAr ? 'rotate-180' : ''}`} />
                  </a>
                </div>
              </motion.div>
            )
          })}
        </div>
      </section>

      <Footer />
    </div>
  )
}

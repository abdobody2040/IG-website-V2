import { useState, useEffect } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import * as Icons from 'lucide-react'
import { ChevronRight, ChevronLeft, Loader2, ArrowRight, ShieldCheck, Clock, Award } from 'lucide-react'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useLang } from '../i18n/LanguageContext'
import { setPageMeta, injectBreadcrumb, getCanonical } from '../lib/seo'
import { useServices, ServiceRecord } from '../hooks/useServices'
import { CATEGORY_MAP } from './ServicesPage'
import PublicOrderModal from '../components/PublicOrderModal'

// Helper to determine service timeline dynamically
export const getServiceTimeline = (serviceId: string, isAr: boolean): string => {
  const timelines: Record<string, { en: string; ar: string }> = {
    'usllc': { en: '3-5 business days', ar: '3-5 أيام عمل' },
    'ukltd': { en: '24 hours', ar: '24 ساعة' },
    'uaecompany': { en: '5-7 business days', ar: '5-7 أيام عمل' },
    'ein': { en: '2-3 business days', ar: '2-3 أيام عمل' },
    'regagent': { en: 'Instant setup', ar: 'إعداد فوري' },
    'busaddress': { en: 'Instant setup', ar: 'إعداد فوري' },
    'anncompliance': { en: 'Annual filing', ar: 'إيداع سنوي' },
    'idverification': { en: '1-2 hours', ar: '1-2 ساعة' },
    'apostille': { en: '4-7 business days', ar: '4-7 أيام عمل' },
    'embassy': { en: '7-10 business days', ar: '7-10 أيام عمل' },
    'websitedesign': { en: '7-10 business days', ar: '7-10 أيام عمل' },
    'landingpages': { en: '3-5 business days', ar: '3-5 أيام عمل' },
    'shopifystore': { en: '7-12 business days', ar: '7-12 أيام عمل' },
    'businessemail': { en: '24 hours', ar: '24 ساعة' },
    'hosting': { en: 'Instant', ar: 'فوري' },
    'aiautomation': { en: '10-14 business days', ar: '10-14 أيام عمل' },
  }
  
  const matchKey = Object.keys(timelines).find(k => serviceId.toLowerCase().includes(k))
  if (matchKey && timelines[matchKey]) {
    return isAr ? timelines[matchKey].ar : timelines[matchKey].en
  }
  return isAr ? '2-4 أيام عمل' : '2-4 business days'
}

export default function ServiceCategoryPage() {
  const { categorySlug } = useParams({ from: '/services/$categorySlug' })
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const { services, loading } = useServices()
  const [selectedService, setSelectedService] = useState<ServiceRecord | null>(null)

  const category = CATEGORY_MAP[categorySlug]
  
  // Keep window scrolled to top on page load/change
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [categorySlug])

  useEffect(() => {
    if (!category) return
    const catLabel = isAr ? category.label_ar : category.label_en
    const catDesc = isAr ? category.desc_ar : category.desc_en
    
    setPageMeta({
      title: `${catLabel} | Instant Grow`,
      description: catDesc,
      canonical: getCanonical(`/services/${categorySlug}`),
    })

    injectBreadcrumb([
      { name: isAr ? 'الرئيسية' : 'Home', url: getCanonical('/') },
      { name: isAr ? 'الخدمات' : 'Services', url: getCanonical('/services') },
      { name: catLabel, url: getCanonical(`/services/${categorySlug}`) },
    ])
  }, [category, isAr, categorySlug])

  if (!category) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center py-20">
          <h2 className="text-xl font-bold text-slate-800 mb-2">Category Not Found</h2>
          <Link to="/services" className="text-[#2563EB] hover:underline font-bold">Back to Services</Link>
        </div>
        <Footer />
      </div>
    )
  }

  const categoryServices = services.filter(s => s.category === category.dbName && s.active)

  // Find Featured service (Popular/Recommended or first item)
  const featuredService = categoryServices.find(s => 
    s.badge_en?.toLowerCase().includes('popular') || 
    s.badge_en?.toLowerCase().includes('recommended') ||
    s.badge_en?.toLowerCase().includes('best')
  ) || categoryServices[0]

  const otherServices = categoryServices.filter(s => s.id !== featuredService?.id)
  const CategoryIcon = (Icons as any)[category.icon] || Icons.HelpCircle

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans flex flex-col">
      <Navbar />

      {/* Main Container */}
      <main className="flex-1 max-w-[1280px] w-full mx-auto px-5 sm:px-8 lg:px-10 pt-32 pb-24">
        
        {/* Breadcrumbs */}
        <div className={`flex items-center gap-1.5 text-xs font-semibold text-slate-400 mb-6 ${isAr ? 'flex-row-reverse' : ''}`}>
          <Link to="/" className="hover:text-[#2563EB] transition-colors">{isAr ? 'الرئيسية' : 'Home'}</Link>
          {isAr ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
          <Link to="/services" className="hover:text-[#2563EB] transition-colors">{isAr ? 'الخدمات' : 'Services'}</Link>
          {isAr ? <ChevronLeft size={12} /> : <ChevronRight size={12} />}
          <span className="text-[#2563EB]">{isAr ? category.label_ar : category.label_en}</span>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
          
          {/* Sticky Sidebar */}
          <aside className="lg:col-span-1 hidden lg:block">
            <div className="sticky top-28 bg-white border border-slate-200/50 rounded-3xl p-5 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-1">
              <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest px-3 mb-4">
                {isAr ? 'أقسام الخدمات' : 'Service Categories'}
              </h3>
              {Object.entries(CATEGORY_MAP).map(([slug, cat]) => {
                const SidebarIcon = (Icons as any)[cat.icon] || Icons.HelpCircle
                const isActive = categorySlug === slug
                return (
                  <Link
                    key={slug}
                    to="/services/$categorySlug"
                    params={{ categorySlug: slug }}
                    className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-xl text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-55 bg-blue-50 text-[#2563EB]'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <SidebarIcon size={16} className={isActive ? 'text-[#2563EB]' : 'text-slate-400'} />
                    <span>{isAr ? cat.label_ar : cat.label_en}</span>
                  </Link>
                )
              })}
            </div>
          </aside>

          {/* Category Content */}
          <div className="lg:col-span-3 space-y-10">
            
            {/* Category Header Card */}
            <div className={`bg-gradient-to-br from-[#0A0F1D] to-[#121A2E] text-white rounded-[32px] p-8 sm:p-12 relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl`}>
              <div className="absolute inset-0 opacity-[0.02] pointer-events-none"
                style={{
                  backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
                  backgroundSize: '30px 30px',
                }}
              />
              <div className="relative z-10 flex-1 space-y-3">
                <span className="inline-flex items-center gap-1.5 text-blue-400 text-xs font-extrabold uppercase tracking-widest bg-blue-500/10 border border-blue-500/20 px-3 py-1 rounded-full">
                  <CategoryIcon size={12} />
                  {isAr ? 'القسم' : 'Category'}
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
                  {isAr ? category.label_ar : category.label_en}
                </h1>
                <p className="text-slate-400 text-sm sm:text-base leading-relaxed max-w-xl">
                  {isAr ? category.desc_ar : category.desc_en}
                </p>
              </div>
              <div className="w-20 h-20 rounded-3xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 z-10">
                <CategoryIcon size={40} className="text-blue-400" />
              </div>
            </div>

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <Loader2 className="animate-spin text-[#2563EB]" size={32} />
                <span className="text-slate-500 text-sm">{isAr ? 'جاري تحميل الخدمات...' : 'Loading services...'}</span>
              </div>
            ) : categoryServices.length === 0 ? (
              <div className="bg-white rounded-3xl border border-slate-200/60 shadow-sm p-16 text-center">
                <Icons.AlertCircle size={48} className="text-slate-300 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-slate-900 mb-1">
                  {isAr ? 'لا توجد خدمات متاحة' : 'No Services Available'}
                </h3>
                <p className="text-slate-500 text-sm">
                  {isAr ? 'يرجى مراجعة الموقع لاحقاً أو الاتصال بالدعم.' : 'Please check back later or contact support.'}
                </p>
              </div>
            ) : (
              <>
                {/* Featured Service (Most Popular) */}
                {featuredService && (
                  <div className="bg-white border-2 border-blue-500/30 rounded-[28px] p-8 shadow-[0_12px_40px_rgba(37,99,235,0.04)] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 bg-[#2563EB] text-white text-[10px] font-extrabold px-5 py-1.5 rounded-bl-2xl uppercase tracking-wider flex items-center gap-1 shadow-sm">
                      <Award size={12} />
                      {isAr ? 'الأكثر طلباً' : 'Most Popular'}
                    </div>

                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-slate-100 pb-6 mb-6">
                      <div className="space-y-2">
                        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                          {(() => {
                            const SvcIcon = (Icons as any)[featuredService.icon] || Icons.HelpCircle
                            return <SvcIcon size={24} />
                          })()}
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900 pt-2" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
                          {isAr ? featuredService.title_ar : featuredService.title_en}
                        </h2>
                      </div>
                      <div className="flex items-baseline gap-1 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-3 shrink-0">
                        <span className="text-3xl font-extrabold text-[#2563EB]">
                          {featuredService.price > 0 ? `$${featuredService.price}` : (isAr ? 'مشمول' : 'Included')}
                        </span>
                        {featuredService.price > 0 && (
                          <span className="text-xs text-slate-400 font-semibold">/ {isAr ? featuredService.period_ar : featuredService.period_en}</span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-5">
                      <p className="text-slate-550 text-slate-600 text-sm sm:text-base leading-relaxed">
                        {isAr ? featuredService.description_ar : featuredService.description_en}
                      </p>
                      
                      {featuredService.detail_en && (
                        <div className="bg-slate-50 border border-slate-200/50 rounded-2xl p-4 flex items-start gap-3">
                          <ShieldCheck size={18} className="text-blue-500 mt-0.5 shrink-0" />
                          <p className="text-xs sm:text-sm text-slate-500 font-medium">
                            {isAr ? featuredService.detail_ar : featuredService.detail_en}
                          </p>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row gap-3 pt-2">
                        <button
                          onClick={() => setSelectedService(featuredService)}
                          className="flex-1 py-3.5 px-6 rounded-xl bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/15 transition-all"
                        >
                          {isAr ? 'اطلب الخدمة الآن' : 'Order Now'}
                          <ArrowRight size={15} className={isAr ? 'rotate-180' : ''} />
                        </button>
                        <Link
                          to="/services/$categorySlug/$serviceSlug"
                          params={{ categorySlug, serviceSlug: featuredService.id }}
                          className="py-3.5 px-6 rounded-xl border border-slate-250 hover:bg-slate-50 text-slate-700 text-sm font-bold flex items-center justify-center gap-1.5 transition-colors"
                        >
                          {isAr ? 'تفاصيل الخدمة' : 'Learn More'}
                        </Link>
                      </div>
                    </div>
                  </div>
                )}

                {/* Subcategory Grid */}
                {otherServices.length > 0 && (
                  <div className="space-y-6">
                    <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
                      {isAr ? 'خدمات إضافية في هذا القسم' : 'Additional Services'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {otherServices.map(svc => {
                        const SvcIcon = (Icons as any)[svc.icon] || Icons.HelpCircle
                        const title = isAr ? svc.title_ar : svc.title_en
                        const desc = isAr ? svc.description_ar : svc.description_en
                        const period = isAr ? svc.period_ar : svc.period_en
                        const timeline = getServiceTimeline(svc.id, isAr)
                        
                        return (
                          <div
                            key={svc.id}
                            className="bg-white border border-slate-200/60 rounded-3xl p-6 flex flex-col justify-between shadow-[0_4px_20px_rgba(15,23,42,0.01)] hover:shadow-lg hover:border-blue-500/20 transition-all duration-300 group"
                          >
                            <div className="space-y-4">
                              <div className="flex items-start justify-between">
                                <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200">
                                  <SvcIcon size={20} />
                                </div>
                                <div className="text-right">
                                  <span className="text-lg font-extrabold text-blue-600 block">
                                    {svc.price > 0 ? `$${svc.price}` : (isAr ? 'مشمول' : 'Included')}
                                  </span>
                                  {svc.price > 0 && (
                                    <span className="text-[10px] text-slate-400 font-semibold block">/ {period}</span>
                                  )}
                                </div>
                              </div>

                              <div className="space-y-1">
                                <h4 className="font-bold text-slate-900 text-base" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
                                  {title}
                                </h4>
                                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-3">
                                  {desc}
                                </p>
                              </div>
                            </div>

                            <div className="mt-6 pt-4 border-t border-slate-50">
                              <div className="flex items-center gap-1.5 text-[11px] text-slate-400 font-bold mb-4">
                                <Clock size={12} className="text-slate-400" />
                                <span>{isAr ? 'المدة المتوقعة:' : 'Estimated Timeline:'} {timeline}</span>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  onClick={() => setSelectedService(svc)}
                                  className="flex-1 py-2.5 px-3 rounded-lg bg-[#2563EB] hover:bg-[#1d4ed8] text-white text-xs font-bold transition-colors"
                                >
                                  {isAr ? 'اطلب الآن' : 'Order Now'}
                                </button>
                                <Link
                                  to="/services/$categorySlug/$serviceSlug"
                                  params={{ categorySlug, serviceSlug: svc.id }}
                                  className="py-2.5 px-3 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-650 hover:text-slate-900 text-xs font-bold text-center transition-colors"
                                >
                                  {isAr ? 'التفاصيل' : 'Learn More'}
                                </Link>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      {/* Public Order Modal */}
      {selectedService && (
        <PublicOrderModal
          service={selectedService}
          isAr={isAr}
          onClose={() => setSelectedService(null)}
        />
      )}

      <Footer />
    </div>
  )
}

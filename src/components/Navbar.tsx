import { useState, useRef, useEffect } from 'react'
import { Menu, X, Globe, Calendar, ChevronDown, LogIn, ChevronRight, ChevronLeft } from 'lucide-react'
import * as Icons from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'
import { useServices } from '../hooks/useServices'
import { getCategorySlug } from '../pages/ServicesPage'

const CAL_BASE = 'https://cal.com/instant-grow-llc'

const CATEGORIES = [
  { id: 'Compliance & Legal', label_en: 'Compliance & Legal', label_ar: 'الامتثال والشؤون القانونية' },
  { id: 'International Documents', label_en: 'International Documents', label_ar: 'الوثائق الدولية' },
  { id: 'Digital Services', label_en: 'Digital Services', label_ar: 'الخدمات الرقمية' },
  { id: 'Marketing & Growth', label_en: 'Marketing & Growth', label_ar: 'التسويق والنمو' },
  { id: 'Creative Services', label_en: 'Creative Services', label_ar: 'الخدمات الإبداعية' },
  { id: 'Business Consulting', label_en: 'Business Consulting', label_ar: 'الاستشارات التجارية' },
  { id: 'Digital Products', label_en: 'Digital Products', label_ar: 'المنتجات الرقمية' },
]

const staticServicesData = [
  // Compliance & Legal
  {
    id: 's1',
    title_en: 'US LLC Formation',
    title_ar: 'تأسيس شركة LLC أمريكية',
    category: 'Compliance & Legal',
    price: 229,
    period_en: 'one-time',
    period_ar: 'مرة واحدة',
    active: true,
    icon: 'Building2'
  },
  {
    id: 's2',
    title_en: 'UK LTD Formation',
    title_ar: 'تأسيس شركة LTD بريطانية',
    category: 'Compliance & Legal',
    price: 99,
    period_en: 'one-time',
    period_ar: 'مرة واحدة',
    active: true,
    icon: 'Building'
  },
  {
    id: 's3',
    title_en: 'EIN Application',
    title_ar: 'الرقم الضريبي الفيدرالي EIN',
    category: 'Compliance & Legal',
    price: 99,
    period_en: 'one-time',
    period_ar: 'مرة واحدة',
    active: true,
    icon: 'FileText'
  },
  {
    id: 's4',
    title_en: 'Registered Agent',
    title_ar: 'الوكيل المسجل',
    category: 'Compliance & Legal',
    price: 99,
    period_en: 'year',
    period_ar: 'سنوياً',
    active: true,
    icon: 'Shield'
  },
  // International Documents
  {
    id: 's5',
    title_en: 'US ITIN Application',
    title_ar: 'رقم تعريف دافع الضرائب ITIN',
    category: 'International Documents',
    price: 199,
    period_en: 'one-time',
    period_ar: 'مرة واحدة',
    active: true,
    icon: 'FileCheck'
  },
  {
    id: 's6',
    title_en: 'Certificate of Good Standing',
    title_ar: 'شهادة الوضع القائم الجيد',
    category: 'International Documents',
    price: 149,
    period_en: 'one-time',
    period_ar: 'مرة واحدة',
    active: true,
    icon: 'Award'
  },
  // Digital Services
  {
    id: 's7',
    title_en: 'US Phone Number',
    title_ar: 'رقم هاتف أمريكي افتراضي',
    category: 'Digital Services',
    price: 49,
    period_en: 'year',
    period_ar: 'سنوياً',
    active: true,
    icon: 'Phone'
  },
  {
    id: 's8',
    title_en: 'US Mailing Address',
    title_ar: 'عنوان بريدي أمريكي حقيقي',
    category: 'Digital Services',
    price: 99,
    period_en: 'year',
    period_ar: 'سنوياً',
    active: true,
    icon: 'Mail'
  },
  // Digital Products
  {
    id: 's9',
    title_en: 'Operating Agreement Template',
    title_ar: 'نموذج اتفاقية التشغيل',
    category: 'Digital Products',
    price: 0,
    period_en: 'free',
    period_ar: 'مجاناً',
    active: true,
    icon: 'FileCode'
  },
  // Business Consulting
  {
    id: 's10',
    title_en: 'Tax Consultation (30 min)',
    title_ar: 'استشارة ضريبية (30 دقيقة)',
    category: 'Business Consulting',
    price: 99,
    period_en: 'session',
    period_ar: 'جلسة',
    active: true,
    icon: 'HelpCircle'
  }
]

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [bookOpen, setBookOpen] = useState(false)
  const [mobileBookOpen, setMobileBookOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeHash, setActiveHash] = useState('')
  const [isServicesHovered, setIsServicesHovered] = useState(false)
  const [hoveredCategory, setHoveredCategory] = useState('Compliance & Legal')
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false)
  const [mobileExpandedCategory, setMobileExpandedCategory] = useState<string | null>(null)
  
  const bookRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const { t, lang, toggleLang } = useLang()
  const n = t.nav
  const isAr = lang === 'ar'

  const { services } = useServices()
  const activeServices = services.length > 0 ? services.filter(s => s.active) : staticServicesData

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bookRef.current && !bookRef.current.contains(e.target as Node)) {
        setBookOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  // Keep track of active section hash
  useEffect(() => {
    const handleHashChange = () => {
      setActiveHash(window.location.hash || window.location.pathname)
    }
    window.addEventListener('hashchange', handleHashChange)
    handleHashChange() // Initial check
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  // Header scroll shadow and background blur
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`
    } else {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
    return () => {
      document.body.style.overflow = ''
      document.body.style.paddingRight = ''
    }
  }, [mobileOpen])

  // ESC closes mobile menu
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Simple Focus Trap within mobile overlay
  useEffect(() => {
    if (!mobileOpen) return
    const container = mobileMenuRef.current
    if (!container) return

    const focusable = container.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    if (focusable.length === 0) return

    const first = focusable[0] as HTMLElement
    const last = focusable[focusable.length - 1] as HTMLElement

    const handleTab = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      if (e.shiftKey) {
        if (document.activeElement === first) {
          last.focus()
          e.preventDefault()
        }
      } else {
        if (document.activeElement === last) {
          first.focus()
          e.preventDefault()
        }
      }
    }

    container.addEventListener('keydown', handleTab)
    first.focus()
    return () => container.removeEventListener('keydown', handleTab)
  }, [mobileOpen])

  const menuItems = [
    { label: n.features, href: '/#features' },
    { label: n.pricing, href: '/#pricing' },
    { label: n.services, href: '/services' },
    { label: n.faq, href: '/#faq' },
    { label: n.blog, href: '/blog' }
  ]

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? 'bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-[0_2px_12px_rgba(0,0,0,0.03)]'
            : 'bg-transparent border-b border-transparent'
        }`}
      >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex items-center justify-between h-[80px]">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img src="/logo.png" alt="Instant Grow" className="h-11 sm:h-14 w-auto object-contain" />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {menuItems.map(item => {
              const isServices = item.href === '/services'
              const active = activeHash === item.href
              
              if (isServices) {
                return (
                  <div
                    key={item.href}
                    className="relative py-7"
                    onMouseEnter={() => setIsServicesHovered(true)}
                    onMouseLeave={() => setIsServicesHovered(false)}
                  >
                    <a
                      href={item.href}
                      className={`text-[15px] font-semibold transition-all duration-200 flex items-center gap-1 ${
                        active || isServicesHovered ? 'text-[#2563EB]' : 'text-slate-500 hover:text-[#0F172A]'
                      }`}
                    >
                      {item.label}
                      <ChevronDown size={14} className={`transition-transform duration-200 ${isServicesHovered ? 'rotate-180 text-[#2563EB]' : 'text-slate-400'}`} />
                    </a>

                    {/* Desktop Services Mega Dropdown */}
                    <AnimatePresence>
                      {isServicesHovered && (
                        <motion.div
                          initial={{ opacity: 0, y: 10, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 10, scale: 0.95 }}
                          transition={{ duration: 0.2, ease: 'easeOut' }}
                          className={`absolute top-[70px] ${isAr ? 'right-1/2 translate-x-1/2' : 'left-1/2 -translate-x-1/2'} w-[680px] bg-white border border-slate-200/60 rounded-[24px] shadow-[0_20px_50px_rgba(0,0,0,0.12)] p-5 flex text-slate-800 z-50`}
                          onMouseEnter={() => setIsServicesHovered(true)}
                          onMouseLeave={() => setIsServicesHovered(false)}
                        >
                          {/* Categories Column */}
                          <div className={`w-[260px] ${isAr ? 'border-l pl-3' : 'border-r pr-3'} border-slate-100 flex flex-col gap-1 flex-shrink-0`}>
                            {CATEGORIES.map(cat => {
                              const isActive = hoveredCategory === cat.id
                              const label = isAr ? cat.label_ar : cat.label_en
                              return (
                                <div
                                  key={cat.id}
                                  onMouseEnter={() => setHoveredCategory(cat.id)}
                                  className={`flex items-center justify-between px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 ${
                                    isActive
                                      ? 'bg-blue-50 text-blue-600 font-bold shadow-[0_2px_8px_rgba(37,99,235,0.04)]'
                                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-semibold'
                                  }`}
                                >
                                  <span className="text-[13px]">{label}</span>
                                  {isActive && (
                                    isAr ? <ChevronLeft size={14} className="text-blue-600" /> : <ChevronRight size={14} className="text-blue-600" />
                                  )}
                                </div>
                              )
                            })}
                          </div>

                          {/* Services Column */}
                          <div className={`flex-1 ${isAr ? 'pr-3' : 'pl-3'} flex flex-col gap-1 max-h-[380px] overflow-y-auto custom-scrollbar`}>
                            {activeServices.filter(s => s.category === hoveredCategory).map(svc => {
                              const IconComponent = (Icons as any)[svc.icon] || Icons.HelpCircle
                              const title = isAr ? svc.title_ar : svc.title_en
                              const period = isAr ? svc.period_ar : svc.period_en
                              const priceStr = svc.price > 0 ? `$${svc.price}` : (isAr ? 'مشمول' : 'Included')
                              
                              const categorySlug = getCategorySlug(svc.category)
                              return (
                                <a
                                  key={svc.id}
                                  href={`/services/${categorySlug}/${svc.id}`}
                                  onClick={() => setIsServicesHovered(false)}
                                  className="flex items-center gap-3.5 p-3 rounded-2xl hover:bg-slate-50 group transition-all duration-200"
                                >
                                  <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                                    <IconComponent size={18} />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <h4 className="text-slate-800 text-[13.5px] font-bold group-hover:text-blue-600 transition-colors truncate">
                                      {title}
                                    </h4>
                                    <span className="text-slate-400 text-[11px] font-medium block">
                                      {priceStr} {svc.price > 0 && `/ ${period}`}
                                    </span>
                                  </div>
                                </a>
                              )
                            })}
                            {activeServices.filter(s => s.category === hoveredCategory).length === 0 && (
                              <div className="flex flex-col items-center justify-center py-20 text-slate-400 text-xs">
                                <span>{isAr ? 'لا توجد خدمات في هذا القسم حالياً' : 'No services in this category yet'}</span>
                              </div>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                )
              }
              
              return (
                <a
                  key={item.href}
                  href={item.href}
                  className={`text-[15px] font-semibold transition-all duration-200 ${
                    active ? 'text-[#2563EB]' : 'text-slate-500 hover:text-[#0F172A]'
                  }`}
                >
                  {item.label}
                </a>
              )
            })}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-5">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 text-base font-semibold text-slate-400 hover:text-slate-700 transition-colors px-2 py-1.5"
            >
              <Globe size={16} />
              <span>{lang === 'en' ? 'العربية' : 'EN'}</span>
            </button>
            <a href="/auth/login" className="text-base font-semibold text-slate-400 hover:text-slate-700 transition-colors">
              {n.login}
            </a>
            <div className="relative" ref={bookRef}>
              <button
                onClick={() => setBookOpen(o => !o)}
                className="flex items-center gap-1.5 text-base font-semibold text-slate-600 hover:text-slate-900 transition-colors px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              >
                <Calendar size={16} />
                {n.bookCall}
                <ChevronDown size={13} className={`transition-transform ${bookOpen ? 'rotate-180' : ''}`} />
              </button>
              {bookOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-50">
                  <a
                    href={`${CAL_BASE}/15min`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    onClick={() => setBookOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 text-xs font-bold">15</div>
                    <div>
                      <p className="font-semibold text-slate-800">{n.bookCall15}</p>
                      <p className="text-xs text-slate-400">{n.bookCall15Desc}</p>
                    </div>
                  </a>
                  <a
                    href={`${CAL_BASE}/30min`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    onClick={() => setBookOpen(false)}
                  >
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 text-xs font-bold">30</div>
                    <div>
                      <p className="font-semibold text-slate-800">{n.bookCall30}</p>
                      <p className="text-xs text-slate-400">{n.bookCall30Desc}</p>
                    </div>
                  </a>
                </div>
              )}
            </div>
            <a
              href="/order"
              className="shimmer-btn inline-flex items-center gap-1.5 bg-[#2563EB] text-white text-[15px] font-bold px-6 py-2.5 rounded-[16px] hover:bg-[#1d4ed8] transition-all shadow-[0_4px_16px_rgba(37,99,235,0.25)]"
            >
              {n.cta}
            </a>
          </div>

          {/* Mobile Actions (CTA on right, Hamburger next to it) */}
          <div className="flex md:hidden items-center gap-2 z-50">
            <a
              href={`${CAL_BASE}/15min`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1.5 text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl px-2.5 h-[40px] transition-colors"
              aria-label={n.bookCall}
            >
              <Calendar size={15} />
            </a>
            <a
              href="/order"
              className="bg-[#2563EB] text-white text-[13px] font-bold px-4 rounded-xl hover:bg-[#1d4ed8] transition-all shadow-sm flex items-center justify-center h-[40px]"
            >
              {n.cta}
            </a>
            <button
              className="text-slate-500 hover:text-slate-900 focus:outline-none flex items-center justify-center w-10 h-10 -mr-1"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-expanded={mobileOpen}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>
    </header>

      {/* Drawer Overlay for Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop filter */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />

            {/* Slide menu (Full-screen overlay on mobile) */}
            <motion.div
              ref={mobileMenuRef}
              initial={{ x: isAr ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: isAr ? '-100%' : '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className={`fixed top-0 bottom-0 ${
                isAr ? 'left-0' : 'right-0'
              } w-full bg-white shadow-2xl z-[9999] md:hidden flex flex-col`}
            >
              {/* Header inside drawer */}
              <div className="flex items-center justify-between px-6 h-[80px] border-b border-slate-100">
                <a href="/" onClick={() => setMobileOpen(false)}>
                  <img src="/logo.png" alt="Instant Grow" className="h-9 w-auto" />
                </a>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="text-slate-500 hover:text-slate-900 focus:outline-none flex items-center justify-center"
                  style={{ width: '48px', height: '48px' }}
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Drawer Links */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                <nav className="flex flex-col gap-2">
                  {menuItems.map(item => {
                    const isServices = item.href === '/services'
                    const active = activeHash === item.href
                    
                    if (isServices) {
                      return (
                        <div key={item.href} className="border-b border-slate-50">
                          <button
                            onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                            className="w-full flex items-center justify-between text-base font-semibold py-2 text-slate-600 hover:text-[#0F172A] focus:outline-none"
                          >
                            <span>{item.label}</span>
                            <ChevronDown
                              size={16}
                              className={`transition-transform duration-200 ${mobileServicesOpen ? 'rotate-180 text-[#2563EB]' : 'text-slate-400'}`}
                            />
                          </button>
                          <AnimatePresence>
                            {mobileServicesOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.2 }}
                                className="overflow-hidden bg-slate-50 rounded-xl mt-1 mb-3 p-2 space-y-1.5"
                              >
                                {CATEGORIES.map(cat => {
                                  const catLabel = isAr ? cat.label_ar : cat.label_en
                                  const catServices = activeServices.filter(s => s.category === cat.id)
                                  const isExpanded = mobileExpandedCategory === cat.id
                                  
                                  if (catServices.length === 0) return null
                                  
                                  return (
                                    <div key={cat.id} className="border-b border-slate-200/50 last:border-0 pb-1.5 last:pb-0">
                                      <button
                                        onClick={() => setMobileExpandedCategory(isExpanded ? null : cat.id)}
                                        className="w-full flex items-center justify-between text-[13px] font-bold py-1.5 text-slate-700 hover:text-slate-900 focus:outline-none"
                                      >
                                        <span>{catLabel}</span>
                                        <ChevronDown
                                          size={14}
                                          className={`transition-transform duration-200 ${isExpanded ? 'rotate-180 text-blue-500' : 'text-slate-400'}`}
                                        />
                                      </button>
                                      {isExpanded && (
                                        <div className="mt-1 space-y-1 pl-3 pr-3 border-l-2 border-slate-200">
                                          {catServices.map(svc => {
                                            const svcTitle = isAr ? svc.title_ar : svc.title_en
                                            const svcPeriod = isAr ? svc.period_ar : svc.period_en
                                            const svcPriceStr = svc.price > 0 ? `$${svc.price}` : (isAr ? 'مشمول' : 'Included')
                                            const categorySlug = getCategorySlug(svc.category)
                                            
                                            return (
                                              <a
                                                key={svc.id}
                                                href={`/services/${categorySlug}/${svc.id}`}
                                                onClick={() => {
                                                  setMobileOpen(false)
                                                  setMobileServicesOpen(false)
                                                }}
                                                className="block py-1 text-xs text-slate-500 hover:text-[#2563EB] transition-colors"
                                              >
                                                {svcTitle} <span className="text-slate-400 font-medium ml-1">({svcPriceStr} {svc.price > 0 && `/ ${svcPeriod}`})</span>
                                              </a>
                                            )
                                          })}
                                        </div>
                                      )}
                                    </div>
                                  )
                                })}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      )
                    }
                    
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`text-base font-semibold py-2 transition-colors border-b border-slate-50 flex items-center ${
                          active ? 'text-[#2563EB]' : 'text-slate-600 hover:text-[#0F172A]'
                        }`}
                      >
                        {item.label}
                      </a>
                    )
                  })}

                  {/* Accordion / Dropdown inside drawer for scheduling */}
                  <div className="border-b border-slate-50">
                    <button
                      onClick={() => setMobileBookOpen(!mobileBookOpen)}
                      className="w-full flex items-center justify-between text-base font-semibold py-2 text-slate-600 hover:text-[#0F172A] focus:outline-none"
                    >
                      <span className="flex items-center gap-2">
                        <Calendar size={18} className="text-slate-400" />
                        {n.bookCall}
                      </span>
                      <ChevronDown
                        size={16}
                        className={`transition-transform duration-200 ${mobileBookOpen ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <AnimatePresence>
                      {mobileBookOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden bg-slate-50 rounded-xl mt-1 mb-3"
                        >
                          <a
                            href={`${CAL_BASE}/15min`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-100/70 transition-colors"
                            onClick={() => setMobileOpen(false)}
                          >
                            <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 text-xs font-bold">15</div>
                            <div>
                              <p className="font-semibold text-slate-800">{n.bookCall15}</p>
                              <p className="text-xs text-slate-400">{n.bookCall15Desc}</p>
                            </div>
                          </a>
                          <a
                            href={`${CAL_BASE}/30min`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-100/70 transition-colors"
                            onClick={() => setMobileOpen(false)}
                          >
                            <div className="w-7 h-7 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 text-xs font-bold">30</div>
                            <div>
                              <p className="font-semibold text-slate-800">{n.bookCall30}</p>
                              <p className="text-xs text-slate-400">{n.bookCall30Desc}</p>
                            </div>
                          </a>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </nav>
              </div>

              {/* Bottom Actions inside drawer */}
              <div className="p-5 border-t border-slate-100 bg-slate-50 space-y-3">
                <button
                  onClick={toggleLang}
                  className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <Globe size={18} />
                  <span>{lang === 'en' ? 'العربية' : 'English'}</span>
                </button>
                <a
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-slate-600 bg-white border border-slate-200 py-2.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <LogIn size={18} className="text-slate-400" />
                  <span>{n.login}</span>
                </a>
                <a
                  href="/order"
                  onClick={() => setMobileOpen(false)}
                  className="w-full inline-flex items-center justify-center bg-[#2563EB] text-white text-sm font-bold py-3 rounded-[16px] hover:bg-[#1d4ed8] transition-all shadow-[0_4px_16px_rgba(37,99,235,0.2)] text-center"
                >
                  {n.cta}
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}

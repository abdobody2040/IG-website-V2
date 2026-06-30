import { useState, useRef, useEffect } from 'react'
import { Menu, X, Globe, Calendar, ChevronDown, LogIn } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import { motion, AnimatePresence } from 'framer-motion'

const CAL_BASE = 'https://cal.com/instant-grow-llc'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [bookOpen, setBookOpen] = useState(false)
  const [mobileBookOpen, setMobileBookOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [activeHash, setActiveHash] = useState('')
  const bookRef = useRef<HTMLDivElement>(null)
  const mobileMenuRef = useRef<HTMLDivElement>(null)
  const { t, lang, toggleLang } = useLang()
  const n = t.nav
  const isAr = lang === 'ar'

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
    { label: n.faq, href: '/#faq' },
    { label: n.blog, href: '/blog' }
  ]

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-white/80 backdrop-blur-md border-b border-slate-200/50 shadow-[0_2px_12px_rgba(0,0,0,0.03)]'
          : 'bg-transparent border-b border-transparent'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[80px]">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img src="/logo.png" alt="Instant Grow" className="h-9 sm:h-11 w-auto object-contain" />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            {menuItems.map(item => {
              const active = activeHash === item.href
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

          {/* Hamburger toggle button */}
          <button
            className="md:hidden p-2 text-slate-500 hover:text-slate-900 focus:outline-none z-50"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-expanded={mobileOpen}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

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

            {/* Slide menu */}
            <motion.div
              ref={mobileMenuRef}
              initial={{ x: isAr ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: isAr ? '-100%' : '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 220 }}
              className={`fixed top-0 bottom-0 ${
                isAr ? 'left-0' : 'right-0'
              } w-full max-w-[350px] bg-white shadow-2xl border-l border-slate-100 z-50 md:hidden flex flex-col`}
            >
              {/* Header inside drawer */}
              <div className="flex items-center justify-between px-6 h-[80px] border-b border-slate-100">
                <a href="/" onClick={() => setMobileOpen(false)}>
                  <img src="/logo.png" alt="Instant Grow" className="h-9 w-auto" />
                </a>
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 text-slate-500 hover:text-slate-900 focus:outline-none"
                  aria-label="Close menu"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Drawer Links */}
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                <nav className="flex flex-col gap-4">
                  {menuItems.map(item => {
                    const active = activeHash === item.href
                    return (
                      <a
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`text-lg font-semibold py-2.5 transition-colors border-b border-slate-50 flex items-center ${
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
                      className="w-full flex items-center justify-between text-lg font-semibold py-2.5 text-slate-600 hover:text-[#0F172A] focus:outline-none"
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
              <div className="p-6 border-t border-slate-100 bg-slate-50 space-y-4">
                <button
                  onClick={toggleLang}
                  className="w-full flex items-center justify-center gap-2 text-base font-semibold text-slate-600 bg-white border border-slate-200 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <Globe size={18} />
                  <span>{lang === 'en' ? 'العربية' : 'English'}</span>
                </button>
                <a
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="w-full flex items-center justify-center gap-2 text-base font-semibold text-slate-600 bg-white border border-slate-200 py-3 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <LogIn size={18} className="text-slate-400" />
                  <span>{n.login}</span>
                </a>
                <a
                  href="/order"
                  onClick={() => setMobileOpen(false)}
                  className="w-full inline-flex items-center justify-center bg-[#2563EB] text-white text-base font-bold py-3.5 rounded-[16px] hover:bg-[#1d4ed8] transition-all shadow-[0_4px_16px_rgba(37,99,235,0.2)] text-center"
                >
                  {n.cta}
                </a>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}

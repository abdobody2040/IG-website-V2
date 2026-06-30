import { useState, useRef, useEffect } from 'react'
import { Menu, X, Globe, Calendar, ChevronDown } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'

const CAL_BASE = 'https://cal.com/instant-grow-llc'

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const [bookOpen, setBookOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const bookRef = useRef<HTMLDivElement>(null)
  const { t, lang, toggleLang } = useLang()
  const n = t.nav

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (bookRef.current && !bookRef.current.contains(e.target as Node)) setBookOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-700 ${
        scrolled
          ? 'bg-white/75 backdrop-blur-2xl border-b border-slate-200/60 shadow-[0_4px_24px_-6px_rgba(0,0,0,0.06)]'
          : 'bg-transparent backdrop-blur-none border-b border-transparent'
      }`}
    >
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
        <div className="flex items-center justify-between h-[80px]">
          {/* Logo */}
          <a href="/" className="flex items-center">
            <img src="/logo.png" alt="Instant Grow" className="h-11 w-auto" />
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-10">
            <a href="/#features" className="text-[15px] font-semibold text-slate-500 hover:text-[#0F172A] transition-all duration-200 hover:scale-[1.03]">{n.features}</a>
            <a href="/#pricing" className="text-[15px] font-semibold text-slate-500 hover:text-[#0F172A] transition-all duration-200 hover:scale-[1.03]">{n.pricing}</a>
            <a href="/#faq" className="text-[15px] font-semibold text-slate-500 hover:text-[#0F172A] transition-all duration-200 hover:scale-[1.03]">{n.faq}</a>
            <a href="/blog" className="text-[15px] font-semibold text-slate-500 hover:text-[#0F172A] transition-all duration-200 hover:scale-[1.03]">{n.blog}</a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={toggleLang}
              className="flex items-center gap-1.5 text-base font-semibold text-slate-400 hover:text-slate-700 transition-colors px-2 py-1.5"
            >
              <Globe size={16} />
              <span>{lang === 'en' ? 'العربية' : 'EN'}</span>
            </button>
            <a href="/auth/login" className="text-base font-semibold text-slate-400 hover:text-slate-700 transition-colors">{n.login}</a>
            <div className="relative" ref={bookRef}>
              <button
                onClick={() => setBookOpen(o => !o)}
                className="flex items-center gap-1.5 text-base font-semibold text-slate-600 hover:text-slate-900 transition-colors px-4 py-3 rounded-xl border border-slate-200 hover:border-slate-300 hover:bg-slate-50"
              >
                <Calendar size={16} />
                {n.bookCall}
                <ChevronDown size={13} className={`transition-transform ${bookOpen ? 'rotate-180' : ''}`} />
              </button>
              {bookOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-xl border border-slate-200 shadow-xl py-1.5 z-50">
                  <a href={`${CAL_BASE}/15min`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    onClick={() => setBookOpen(false)}>
                    <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-500 text-xs font-bold">15</div>
                    <div>
                      <p className="font-semibold text-slate-800">{n.bookCall15}</p>
                      <p className="text-xs text-slate-400">{n.bookCall15Desc}</p>
                    </div>
                  </a>
                  <a href={`${CAL_BASE}/30min`} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 px-4 py-3 text-sm text-slate-600 hover:bg-slate-50 transition-colors"
                    onClick={() => setBookOpen(false)}>
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
              className="shimmer-btn inline-flex items-center gap-1.5 bg-[#2563EB] text-white text-[15px] font-bold px-6 py-3 rounded-[16px] hover:bg-[#1d4ed8] transition-all shadow-[0_4px_16px_rgba(37,99,235,0.25)] hover:shadow-[0_6px_24px_rgba(37,99,235,0.35)] hover:-translate-y-0.5"
            >
              {n.cta}
            </a>
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden text-slate-400 hover:text-slate-700"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className={`md:hidden border-t ${scrolled ? 'border-slate-200/50 bg-white/90 backdrop-blur-xl' : 'border-slate-200/20 bg-white/95 backdrop-blur-xl'} px-4 py-4 space-y-3`}>
          <a href="/#features" className="block text-base font-medium text-slate-600 py-2 hover:text-slate-900" onClick={() => setMobileOpen(false)}>{n.features}</a>
          <a href="/#pricing" className="block text-base font-medium text-slate-600 py-2 hover:text-slate-900" onClick={() => setMobileOpen(false)}>{n.pricing}</a>
          <a href="/#faq" className="block text-base font-medium text-slate-600 py-2 hover:text-slate-900" onClick={() => setMobileOpen(false)}>{n.faq}</a>
          <a href="/blog" className="block text-base font-medium text-slate-600 py-2 hover:text-slate-900" onClick={() => setMobileOpen(false)}>{n.blog}</a>
          <div className="flex flex-col gap-2 pt-2 border-t border-slate-200/50">
            <button
              onClick={() => { toggleLang(); setMobileOpen(false) }}
              className="flex items-center gap-2 text-base font-semibold text-slate-500 py-2"
            >
              <Globe size={16} />
              {lang === 'en' ? 'العربية' : 'English'}
            </button>
            <a href="/auth/login" className="text-base font-medium text-slate-600 py-2">{n.login}</a>
            <a href={`${CAL_BASE}/15min`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 text-base font-semibold text-indigo-600 py-2"
              onClick={() => setMobileOpen(false)}>
              <Calendar size={16} /> {n.bookCall}
            </a>
            <a href="/order" className="bg-gradient-to-r from-indigo-600 to-blue-600 text-white text-base font-semibold px-5 py-3.5 rounded-lg text-center">
              {n.cta}
            </a>
          </div>
        </div>
      )}
    </header>
  )
}

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Lang } from './translations'

interface LanguageContextType {
  lang: Lang
  t: (typeof translations)[Lang]
  toggleLang: () => void
  setLang: (lang: Lang) => void
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextType | null>(null)

// ── Language detection priority ──────────────────────────────────────────────
// 1. Saved user preference (localStorage 'ig-lang' or legacy 'ig_lang')
// 2. Browser language (navigator.language) — auto Arabic for ar-* locales
// 3. Fallback: English
function detectDefaultLang(): Lang {
  try {
    if (typeof localStorage !== 'undefined' && typeof localStorage.getItem === 'function') {
      const saved = localStorage.getItem('ig-lang') ?? localStorage.getItem('ig_lang')
      if (saved === 'ar' || saved === 'en') return saved
    }
  } catch { /* ignore */ }


  // Browser language detection — covers ar, ar-SA, ar-AE, ar-EG, ar-MA etc.
  const browserLang = navigator.language ?? navigator.languages?.[0] ?? ''
  if (browserLang.toLowerCase().startsWith('ar')) return 'ar'

  return 'en'
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detectDefaultLang)

  const isRTL = lang === 'ar'
  const t = translations[lang]

  useEffect(() => {
    // Persist to both keys so MenaCountryPage (ig_lang) stays in sync
    localStorage.setItem('ig-lang', lang)
    localStorage.setItem('ig_lang', lang)
    document.documentElement.lang = lang
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
  }, [lang, isRTL])

  const toggleLang = () => setLangState((prev) => (prev === 'en' ? 'ar' : 'en'))
  const setLang = (newLang: Lang) => setLangState(newLang)

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang, setLang, isRTL }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}

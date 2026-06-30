import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Lang } from './translations'

interface LanguageContextType {
  lang: Lang
  t: (typeof translations)[Lang]
  toggleLang: () => void
  isRTL: boolean
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    const saved = localStorage.getItem('ig-lang')
    return (saved === 'ar' || saved === 'en') ? saved : 'en'
  })

  const isRTL = lang === 'ar'
  const t = translations[lang]

  useEffect(() => {
    localStorage.setItem('ig-lang', lang)
    document.documentElement.lang = lang
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr'
  }, [lang, isRTL])

  const toggleLang = () => setLang((prev) => (prev === 'en' ? 'ar' : 'en'))

  return (
    <LanguageContext.Provider value={{ lang, t, toggleLang, isRTL }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error('useLang must be used within LanguageProvider')
  return ctx
}

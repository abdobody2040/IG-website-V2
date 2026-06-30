import { Link } from '@tanstack/react-router'
import { Globe, ArrowRight, Search, Loader2, CheckCircle } from 'lucide-react'
import { useSeoPages } from '../hooks/useSeoPages'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { useEffect, useState } from 'react'
import { setPageMeta, generateOrganizationSchema, injectJsonLd, getCanonical, injectBreadcrumb } from '../lib/seo'
import { useLang } from '../i18n/LanguageContext'

export default function SeoCountryListPage() {
  const { data: pages = [], isLoading } = useSeoPages(true)
  const [search, setSearch] = useState('')
  const { t, isRTL } = useLang()
  const s = t.seo.seoCountryList

  useEffect(() => {
    setPageMeta({
      title: s.title,
      description: s.description,
      keywords: s.keywords,
      canonical: getCanonical('/us-company'),
    })
    injectJsonLd(generateOrganizationSchema())
    injectBreadcrumb([
      { name: isRTL ? 'الرئيسية' : 'Home', url: getCanonical('/') },
      { name: isRTL ? 'تأسيس شركة أمريكية' : 'US Company Formation', url: getCanonical('/us-company') },
    ])
  }, [s, isRTL])

  const filtered = pages.filter(p =>
    !search || p.countryName.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-white font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />

      <section className="bg-gradient-to-b from-slate-50 to-white pt-24 pb-12 sm:pt-28 sm:pb-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">US LLC Formation by Country</h1>
          <p className="text-slate-500 text-sm sm:text-base max-w-2xl mx-auto mb-8">
            Everything you need to know about forming a US LLC from your country — including banking, taxes, and compliance.
          </p>
          <div className="relative max-w-md mx-auto">
            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search your country…"
              className="w-full pl-10 pr-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff] bg-white"
            />
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-[#1a56ff]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Globe size={48} className="text-slate-200 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 mb-1">No countries yet</h3>
            <p className="text-sm text-slate-500">{search ? 'Try a different search' : 'Country pages are being added.'}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(page => (
              <Link
                key={page.id}
                to="/us-company/$slug"
                params={{ slug: page.slug }}
                className="group bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-[#1a56ff]/20 transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#e8efff] text-[#1a56ff] flex items-center justify-center text-lg">
                    {page.countryCode.slice(0, 2)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-[#1a56ff] transition-colors">{page.countryName}</h3>
                    <p className="text-xs text-slate-400">{page.countryCode}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-500 line-clamp-2 mb-3">{page.metaDescription}</p>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <CheckCircle size={11} className="text-emerald-500" /> US LLC Guide
                  </span>
                  <span className="text-[#1a56ff] font-semibold flex items-center gap-1 group-hover:gap-2 transition-all">
                    View Guide <ArrowRight size={12} />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  )
}

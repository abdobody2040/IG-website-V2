import { useEffect } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowRight, Calendar, CheckCircle, ChevronRight, Loader2, MessageCircle, Globe, Banknote, FileText, HelpCircle, Star } from 'lucide-react'
import { useSeoPageBySlug } from '../hooks/useSeoPages'
import { setPageMeta, injectJsonLd, generateFaqSchema, generateOrganizationSchema, getCanonical, injectBreadcrumb } from '../lib/seo'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function SeoCountryPage() {
  const { slug } = useParams({ from: '/us-company/$slug' })
  const { data: page, isLoading, error } = useSeoPageBySlug(slug)

  useEffect(() => {
    if (!page) return
    setPageMeta({
      title: page.metaTitle,
      description: page.metaDescription,
      keywords: [page.mainKeyword, ...page.secondaryKeywords],
      canonical: getCanonical(`/us-company/${page.slug}`),
    })

    const faqs = (page.faqJson ?? []) as { question?: string; answer?: string }[]
    injectJsonLd({
      '@graph': [
        generateOrganizationSchema(),
        ...(faqs.length > 0 ? [generateFaqSchema(faqs as { question: string; answer: string }[])] : []),
        page.schemaJson,
      ].filter(Boolean),
    })

    injectBreadcrumb([
      { name: 'Home', url: getCanonical('/') },
      { name: 'US Company Formation', url: getCanonical('/us-company') },
      { name: page.countryName, url: getCanonical(`/us-company/${page.slug}`) },
    ])
  }, [page])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 size={24} className="animate-spin text-[#1a56ff]" />
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !page) {
    return (
      <div className="min-h-screen bg-white font-sans">
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-32 text-center">
          <FileText size={48} className="text-slate-200 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Page Not Found</h2>
          <p className="text-slate-500 text-sm mb-6">This page hasn't been published yet or doesn't exist.</p>
          <Link to="/" className="text-[#1a56ff] font-semibold hover:underline">Go Home</Link>
        </div>
        <Footer />
      </div>
    )
  }

  const faqs = (page.faqJson ?? []) as { question?: string; answer?: string }[]
  const benefits = (page.benefits ?? []) as { title?: string; desc?: string }[]
  const painPoints = (page.painPoints ?? []) as string[]

  return (
    <div className="min-h-screen bg-white font-sans">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#0a0f1e] via-[#0f1729] to-[#1a1f35] pt-24 pb-16 sm:pt-28 sm:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="absolute top-1/4 -left-20 w-72 h-72 bg-[#1a56ff]/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 rounded-full px-3 py-1 border border-emerald-500/20">
              {page.countryCode}
            </span>
            <span className="text-xs font-semibold text-blue-400 bg-blue-500/10 rounded-full px-3 py-1 border border-blue-500/20">
              US LLC Formation
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white leading-tight mb-4 max-w-3xl">
            {page.heroTitle}
          </h1>
          <p className="text-white/60 text-base sm:text-lg max-w-2xl mb-8 leading-relaxed">
            {page.heroDescription}
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/order?plan=us-premium"
              className="inline-flex items-center justify-center gap-2 bg-[#1a56ff] text-white font-semibold text-sm px-8 py-3.5 rounded-xl hover:bg-[#3a76ff] transition-all shadow-lg shadow-blue-500/20"
            >
              {page.ctaText} <ArrowRight size={16} />
            </a>
            <a
              href="https://cal.com/instant-grow-llc/30min"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 bg-white/10 text-white font-semibold text-sm px-8 py-3.5 rounded-xl border border-white/20 hover:bg-white/15 transition-all"
            >
              <Calendar size={16} /> Free Consultation
            </a>
          </div>
        </div>
      </section>

      {/* Pain points → Solution */}
      {painPoints.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div>
                <p className="text-[#1a56ff] text-sm font-semibold uppercase tracking-wider mb-2">Common Challenges</p>
                <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">
                  Why Founders from {page.countryName} Choose Us
                </h2>
                <p className="text-slate-500 text-sm mb-6">
                  We understand the specific hurdles entrepreneurs from {page.countryName} face when forming a US company.
                  From banking to taxes, we've got you covered.
                </p>
                <div className="space-y-3">
                  {painPoints.map((pp, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <CheckCircle size={14} className="text-green-500" />
                      </div>
                      <p className="text-sm text-slate-700">{pp}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-50 rounded-3xl p-8 border border-slate-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1a56ff]/10 flex items-center justify-center">
                    <Globe size={20} className="text-[#1a56ff]" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">US LLC for {page.countryName} Founders</p>
                    <p className="text-xs text-slate-400">Complete formation package</p>
                  </div>
                </div>
                <ul className="space-y-2 text-sm text-slate-600">
                  {benefits.slice(0, 5).map((b, i) => (
                    <li key={i} className="flex items-center gap-2">
                      <CheckCircle size={13} className="text-emerald-500 flex-shrink-0" />
                      {b.title || b.desc || ''}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Benefits */}
      {benefits.length > 0 && (
        <section className="py-16 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <p className="text-[#1a56ff] text-sm font-semibold uppercase tracking-wider mb-2">Benefits</p>
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">
                Why Open a US LLC from {page.countryName}?
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {benefits.map((b, i) => (
                <div key={i} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-md hover:border-[#1a56ff]/20 transition-all">
                  <div className="w-10 h-10 rounded-xl bg-[#e8efff] text-[#1a56ff] flex items-center justify-center mb-4">
                    <Star size={18} />
                  </div>
                  <h3 className="font-semibold text-slate-900 mb-2">{b.title || ''}</h3>
                  {b.desc && <p className="text-sm text-slate-500">{b.desc}</p>}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Banking */}
      {(page.bestBank || page.bankNotes) && (
        <section className="py-16 bg-white">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="bg-gradient-to-br from-emerald-50 to-white rounded-3xl border border-emerald-200 p-8 sm:p-10">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <Banknote size={20} className="text-emerald-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">Banking</p>
                  <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Best US Bank for {page.countryName} Founders</h2>
                </div>
              </div>
              {page.bestBank && (
                <p className="text-lg font-semibold text-slate-900 mb-3">Recommended: {page.bestBank}</p>
              )}
              {page.bankNotes && <p className="text-sm text-slate-600 leading-relaxed">{page.bankNotes}</p>}
            </div>
          </div>
        </section>
      )}

      {/* Taxes */}
      {page.taxNotes && (
        <section className="py-16 bg-slate-50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                <FileText size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Taxes</p>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Tax Considerations for {page.countryName} Entrepreneurs</h2>
              </div>
            </div>
            <p className="text-sm text-slate-600 leading-relaxed max-w-4xl">{page.taxNotes}</p>
          </div>
        </section>
      )}

      {/* FAQ */}
      {faqs.length > 0 && (
        <section className="py-16 bg-white">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="text-center mb-10">
              <HelpCircle size={20} className="text-[#1a56ff] mx-auto mb-2" />
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">Frequently Asked Questions</h2>
              <p className="text-slate-500 text-sm mt-1">Everything you need to know about forming a US LLC from {page.countryName}</p>
            </div>
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <details key={i} className="group bg-slate-50 rounded-xl border border-slate-200 [&_summary::-webkit-details-marker]:hidden">
                  <summary className="flex items-center justify-between px-5 py-4 cursor-pointer font-semibold text-sm text-slate-900 hover:text-[#1a56ff] transition-colors">
                    {faq.question || ''}
                    <ChevronRight size={16} className="text-slate-400 group-open:rotate-90 transition-transform flex-shrink-0" />
                  </summary>
                  <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed border-t border-slate-200 pt-3">
                    {(faq.answer || '').split('\n').map((line, j) => <p key={j} className="mb-2 last:mb-0">{line}</p>)}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-16 bg-[#0a0f1e] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0djItSDI0di0yaDEyek0zNiAyNHYySDI0di0yaDEyeiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">
            Ready to Form Your US LLC from {page.countryName}?
          </h2>
          <p className="text-white/60 text-sm mb-8 max-w-xl mx-auto">
            Join thousands of {page.countryName} entrepreneurs who've launched their US company with Instant Grow.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href="/order?plan=us-premium"
              className="inline-flex items-center gap-2 bg-[#1a56ff] text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-[#3a76ff] transition-all shadow-lg shadow-blue-500/20"
            >
              {page.ctaText} <ArrowRight size={16} />
            </a>
            <a
              href={`https://wa.me/13072898149`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-[#1fba58] transition-all"
            >
              <MessageCircle size={16} /> WhatsApp Us
            </a>
          </div>
        </div>
      </section>

      {/* Related links */}
      <section className="py-12 bg-slate-50 border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500">
            <span className="font-semibold text-slate-700">Related:</span>
            <Link to="/" className="text-[#1a56ff] hover:underline">Home</Link>
            <span className="text-slate-300">·</span>
            <Link to="/blog" className="text-[#1a56ff] hover:underline">Blog</Link>
            <span className="text-slate-300">·</span>
            <a href="/order" className="text-[#1a56ff] hover:underline">Order Now</a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

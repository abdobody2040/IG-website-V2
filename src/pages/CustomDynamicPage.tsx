import { useEffect } from 'react'
import DOMPurify from 'dompurify'
import { useParams } from '@tanstack/react-router'
import { useLang } from '../i18n/LanguageContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { setPageMeta, getCanonical } from '../lib/seo'
import { FileText, Loader2, AlertCircle } from 'lucide-react'
import { usePageContent } from '../hooks/usePageContent'

export default function CustomDynamicPage() {
  const { slug } = useParams({ from: '/p/$slug' })
  const { lang, isRTL } = useLang()
  const isAr = lang === 'ar'
  const { page, loading } = usePageContent(slug)

  const title = (page && page.active) ? (isAr ? page.title_ar : page.title_en) : 'Page Not Found'

  useEffect(() => {
    if (page && page.active) {
      setPageMeta({
        title: `${title} | Instant Grow`,
        description: isAr
          ? `${page.title_ar} - صفحة مخصصة من Instant Grow.`
          : `${page.title_en} - Custom page from Instant Grow.`,
        canonical: getCanonical(`/p/${slug}`),
      })
    }
  }, [page, title, isAr, slug])

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar />

      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 py-32">
          <Loader2 className="animate-spin text-[#1a56ff]" size={32} />
          <span className="text-slate-500 text-sm">{isAr ? 'جاري تحميل الصفحة...' : 'Loading page...'}</span>
        </div>
      ) : !page || !page.active ? (
        <div className="flex-1 max-w-md w-full mx-auto px-5 py-32 text-center flex flex-col items-center justify-center">
          <div className="w-16 h-16 rounded-full bg-red-50 text-red-600 flex items-center justify-center mb-4">
            <AlertCircle size={32} />
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {isAr ? 'الصفحة غير موجودة' : 'Page Not Found'}
          </h1>
          <p className="text-slate-500 text-sm mb-6">
            {isAr 
              ? 'عذراً، الصفحة التي تبحث عنها غير متوفرة أو تم إيقافها.' 
              : 'Sorry, the page you are looking for does not exist or has been deactivated.'}
          </p>
          <a
            href="/"
            className="bg-[#1a56ff] text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-blue-700 transition-colors"
          >
            {isAr ? 'العودة للرئيسية' : 'Go back home'}
          </a>
        </div>
      ) : (
        <>
          {/* Hero Header */}
          <section className="bg-[#0A0F1D] text-white pt-32 pb-20 relative overflow-hidden">
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
                backgroundSize: '40px 40px',
              }}
            />
            <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 relative z-10 text-center lg:text-left">
              <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
                <div>
                  <span className="inline-block text-blue-400 text-xs font-bold uppercase tracking-widest mb-3">
                    {isAr ? 'صفحة مخصصة' : 'Custom Page'}
                  </span>
                  <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
                    {title}
                  </h1>
                </div>
                <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
                  <FileText size={32} className="text-blue-400" />
                </div>
              </div>
            </div>
          </section>

          {/* Content */}
          <main className="flex-1 max-w-4xl w-full mx-auto px-5 sm:px-8 lg:px-10 py-16">
            <div className="bg-white rounded-[24px] border border-slate-200/80 p-8 sm:p-12 shadow-[0_4px_24px_rgba(15,23,42,0.02)]">
              <article className={`prose max-w-none text-slate-600 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
                <div
                  className="space-y-6"
                  style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                  dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize((isAr ? page.content_ar : page.content_en) || '') }}
                />
              </article>
            </div>
          </main>
        </>
      )}

      <Footer />
    </div>
  )
}

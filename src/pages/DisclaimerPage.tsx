import { useEffect } from 'react'
import DOMPurify from 'dompurify'
import { useLang } from '../i18n/LanguageContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { setPageMeta, getCanonical } from '../lib/seo'
import { AlertTriangle } from 'lucide-react'
import { usePageContent } from '../hooks/usePageContent'

export default function DisclaimerPage() {
  const { lang, isRTL } = useLang()
  const isAr = lang === 'ar'
  const { page } = usePageContent('legal-disclaimer')

  const title = (page && page.active) ? (isAr ? page.title_ar : page.title_en) : (isAr ? 'إخلاء المسؤولية القانونية' : 'Legal Disclaimer')

  useEffect(() => {
    setPageMeta({
      title: `${title} | Instant Grow`,
      description: isAr
        ? 'إخلاء المسؤولية القانونية لـ Instant Grow. نحن شركة خدمات تأسيس ولسنا مكتب محاماة.'
        : 'Legal Disclaimer for Instant Grow. Learn about the scope of our business formation services.',
      canonical: getCanonical('/legal-disclaimer'),
    })
  }, [isAr, title])

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <Navbar />

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
                {isAr ? 'قانوني' : 'Legal'}
              </span>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
                {title}
              </h1>
              <p className="text-slate-400 text-base sm:text-lg max-w-xl">
                {isAr
                  ? 'يرجى قراءة إخلاء المسؤولية هذا لفهم حدود خدماتنا.'
                  : 'Please read this disclaimer to understand the scope of our services.'}
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <AlertTriangle size={32} className="text-blue-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-5 sm:px-8 lg:px-10 py-16">
        <div className="bg-white rounded-[24px] border border-slate-200/80 p-8 sm:p-12 shadow-[0_4px_24px_rgba(15,23,42,0.02)]">
          <article className={`prose max-w-none text-slate-600 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
            {page && page.active && ((isAr ? page.content_ar : page.content_en)) ? (
              <div
                className="space-y-6"
                style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize((isAr ? page.content_ar : page.content_en) || '') }}
              />
            ) : isAr ? (
              <div className="space-y-8" style={{ direction: 'rtl' }}>
                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">1. ليس مكتب محاماة ولا يقدم استشارات قانونية</h2>
                  <p>إن شركة Instant Grow وموقعها الإلكتروني يقدمان خدمات تأسيس الشركات وإدارتها والامتثال الضريبي والدعم الإداري. نحن لسنا مكتب محاماة، وموظفونا وممثلو خدمة العملاء لدينا لا يقدمون استشارات قانونية أو ضريبية أو مالية.</p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">2. المعلومات لأغراض تثقيفية وإعلامية</h2>
                  <p>أي معلومات أو مقالات أو إرشادات متوفرة على هذا الموقع هي لأغراض المعرفة العامة والتثقيف فقط، ولا ينبغي اعتبارها بديلاً عن الاستشارات المهنية المتخصصة. يرجى دائماً مراجعة محامٍ مرخص أو مستشار ضريبي معتمد لمناقشة وضعك التجاري الخاص.</p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">3. المسؤولية عن القرارات التجارية</h2>
                  <p>يتحمل العميل المسؤولية الكاملة عن قراراته التجارية، بما في ذلك اختيار اسم الشركة، وولاية التأسيس، والأنشطة التجارية التي يمارسها. لا تتحمل Instant Grow أي مسؤولية عن أي أضرار أو غرامات أو خسائر مالية تنشأ عن عدم الالتزام باللوائح والأنظمة المحلية.</p>
                </section>
              </div>
            ) : (
              <div className="space-y-8">
                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">1. No Legal or Professional Relationship</h2>
                  <p>Instant Grow is a technology-enabled document filing and compliance service. We are not a law firm, accounting firm, or financial advisory, and our personnel are not acting as your attorneys or professional advisors. No attorney-client relationship is created by using our services.</p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">2. General Informational Purposes Only</h2>
                  <p>The materials, articles, and guides on this website are compiled for general informational and educational purposes only. They do not constitute specific legal, financial, or tax recommendations. Customers are advised to seek appropriate professional counsel for their individual situation.</p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">3. Customer Responsibility</h2>
                  <p>The customer retains full responsibility for all business decisions, compliance obligations, tax filings, and legal operations. Instant Grow is not liable for any state penalties, audit fees, or operational losses resulting from filing inaccuracy or failure to meet ongoing corporate compliance requirements.</p>
                </section>
              </div>
            )}
          </article>
        </div>
      </main>

      <Footer />
    </div>
  )
}

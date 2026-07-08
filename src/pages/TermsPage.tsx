import { useEffect } from 'react'
import DOMPurify from 'dompurify'
import { useLang } from '../i18n/LanguageContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { setPageMeta, getCanonical } from '../lib/seo'
import { FileText } from 'lucide-react'
import { usePageContent } from '../hooks/usePageContent'

export default function TermsPage() {
  const { lang, isRTL } = useLang()
  const isAr = lang === 'ar'
  const { page } = usePageContent('terms-of-service')

  const title = (page && page.active) ? (isAr ? page.title_ar : page.title_en) : (isAr ? 'شروط الخدمة' : 'Terms of Service')

  useEffect(() => {
    setPageMeta({
      title: `${title} | Instant Grow`,
      description: isAr
        ? 'شروط الخدمة والأحكام القانونية الخاصة بـ Instant Grow لتأسيس الشركات وإدارتها.'
        : 'Terms of Service for Instant Grow. Read the terms, conditions, and rules for using our company formation services.',
      canonical: getCanonical('/terms-of-service'),
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
                  ? 'آخر تحديث: 30 يونيو 2026. يرجى قراءة هذه الشروط بعناية.'
                  : 'Last Updated: June 30, 2026. Please read these terms carefully.'}
              </p>
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
            {page && page.active && ((isAr ? page.content_ar : page.content_en)) ? (
              <div
                className="space-y-6"
                style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize((isAr ? page.content_ar : page.content_en) || '') }}
              />
            ) : isAr ? (
              <div className="space-y-8" style={{ direction: 'rtl' }}>
                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">1. قبول الشروط</h2>
                  <p>باستخدامك لموقعنا والخدمات التي تقدمها Instant Grow، فإنك توافق على الالتزام بشروط الخدمة هذه وجميع القوانين واللوائح المعمول بها. إذا كنت لا توافق على أي من هذه الشروط، فلا يحق لك استخدام خدماتنا.</p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">2. خدمات التأسيس والوكيل المسجل</h2>
                  <p>تقوم Instant Grow بإعداد وتقديم مستندات التأسيس للجهات الحكومية المعنية بناءً على المعلومات المقدمة منك. أنت مسؤول بالكامل عن صحة ودقة جميع البيانات المقدمة. كما تشمل باقاتنا خدمات الوكيل المسجل، ويخضع تجديدها للرسوم السنوية المحددة في باقتك.</p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">3. الرسوم والدفع والتجديد</h2>
                  <p>تُدفع جميع الرسوم مقدماً لتغطية رسوم تقديم الطلبات الحكومية والخدمات المهنية. خدمات الوكيل المسجل والعناوين البريدية هي خدمات اشتراك سنوي تتجدد تلقائياً ما لم يتم إلغاؤها قبل تاريخ التجديد بـ 30 يوماً على الأقل.</p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">4. إخلاء مسؤولية قانونية</h2>
                  <p>Instant Grow ليست شركة محاماة ولا تقدم نصائح قانونية أو ضريبية. أي معلومات متوفرة على الموقع هي لأغراض إرشادية وتثقيفية فقط. للاستشارات القانونية أو الضريبية التفصيلية، يرجى مراجعة محاسب قانوني أو محامٍ متخصص.</p>
                </section>
              </div>
            ) : (
              <div className="space-y-8">
                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">1. Agreement to Terms</h2>
                  <p>By accessing our website and using the services provided by Instant Grow, you agree to be bound by these Terms of Service and all applicable laws and regulations. If you do not agree with any of these terms, you are prohibited from using our services.</p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">2. Formation Services & Registered Agent</h2>
                  <p>Instant Grow prepares and files formation documents with official registries based on information you provide. You are solely responsible for the accuracy of all submitted details. The registered agent and mailing address services are provided for the duration specified in your plan, subject to annual renewals.</p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">3. Fees, Billing & Auto-Renewal</h2>
                  <p>All service fees are paid upfront to cover government filing fees and administrative overhead. Registered agent, corporate address, and renewal services are billed on a recurring annual basis. Cancelation requests must be submitted at least 30 days prior to the renewal date.</p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">4. No Legal or Tax Advice</h2>
                  <p>Instant Grow is a business formation service, not a law firm or accounting firm. We do not provide legal, financial, or tax advice. Any materials or support interactions are for informational purposes only. Consult a qualified professional for complex legal or tax matters.</p>
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

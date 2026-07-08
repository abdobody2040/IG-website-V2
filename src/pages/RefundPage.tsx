import { useEffect } from 'react'
import DOMPurify from 'dompurify'
import { useLang } from '../i18n/LanguageContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { setPageMeta, getCanonical } from '../lib/seo'
import { RefreshCw } from 'lucide-react'
import { usePageContent } from '../hooks/usePageContent'

export default function RefundPage() {
  const { lang, isRTL } = useLang()
  const isAr = lang === 'ar'
  const { page } = usePageContent('refund-policy')

  const title = (page && page.active) ? (isAr ? page.title_ar : page.title_en) : (isAr ? 'سياسة الاسترداد' : 'Refund Policy')

  useEffect(() => {
    setPageMeta({
      title: `${title} | Instant Grow`,
      description: isAr
        ? 'سياسة الاسترداد وإلغاء الخدمات الخاصة بـ Instant Grow. نحن نضمن حقوق عملائنا بوضوح.'
        : 'Refund Policy for Instant Grow. Learn about our refund rules, cancelations, and guarantees.',
      canonical: getCanonical('/refund-policy'),
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
                  ? 'آخر تحديث: 30 يونيو 2026. يرجى مراجعة سياسة الاسترداد وضماننا.'
                  : 'Last Updated: June 30, 2026. Learn about our satisfaction guarantee.'}
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <RefreshCw size={32} className="text-blue-400" />
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
                  <h2 className="text-xl font-bold text-slate-800">1. ضمان استعادة الأموال</h2>
                  <p>نحن فخورون بتقديم ضمان استعادة الأموال بنسبة 100% لخدماتنا المهنية. إذا لم تكن راضياً عن خدمتنا، يمكنك طلب استرداد الأموال قبل تقديم المستندات رسمياً إلى الولاية أو الجهات الحكومية المختصة.</p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">2. الرسوم الحكومية غير القابلة للاسترداد</h2>
                  <p>بمجرد إرسال طلبك ودفع الرسوم الحكومية للولاية أو الجهة المعنية (مثل رسوم ولاية Wyoming أو Companies House في بريطانيا)، تصبح هذه الرسوم غير قابلة للاسترداد نهائياً لأنها تُدفع مباشرة للحكومة لتسجيل شركتك ولا يمكن استرجاعها.</p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">3. طلب الاسترداد وإلغاء الخدمة</h2>
                  <p>لطلب استرداد الأموال، يرجى التواصل مع فريق الدعم عبر البريد الإلكتروني (info@instantgrow.net) مع ذكر رقم الطلب وسبب الإلغاء. يتم معالجة طلبات الاسترداد المعتمدة خلال 5-7 أيام عمل وإعادتها إلى طريقة الدفع الأصلية.</p>
                </section>
              </div>
            ) : (
              <div className="space-y-8">
                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">1. Money-Back Guarantee</h2>
                  <p>We offer a 100% money-back guarantee on our professional service fees. If you wish to cancel your order, you must request a refund before your formation documents have been officially submitted to the state or relevant government registry.</p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">2. Non-Refundable Government Fees</h2>
                  <p>Once government filing fees have been paid to state departments or government registrars (such as Wyoming state fees or UK Companies House fees), they cannot be refunded, as these funds are disbursed directly to government entities and are non-recoverable.</p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">3. How to Request a Refund</h2>
                  <p>To request a refund or cancel your service, contact our support team via email at info@instantgrow.net with your order details and reason for cancellation. Approved refunds are processed within 5-7 business days to the original payment method.</p>
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

import { useEffect } from 'react'
import { useLang } from '../i18n/LanguageContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { setPageMeta, getCanonical } from '../lib/seo'
import { Key } from 'lucide-react'

export default function KycAmlPage() {
  const { lang, isRTL } = useLang()
  const isAr = lang === 'ar'

  useEffect(() => {
    setPageMeta({
      title: isAr ? 'سياسة اعرف عميلك ومكافحة غسيل الأموال | Instant Grow' : 'KYC / AML Policy | Instant Grow',
      description: isAr
        ? 'سياسة اعرف عميلك (KYC) ومكافحة غسيل الأموال (AML) الخاصة بـ Instant Grow. نحن نلتزم بالأنظمة واللوائح القانونية.'
        : 'KYC / AML Policy for Instant Grow. Learn how we verify customer identity and comply with anti-money laundering regulations.',
      canonical: getCanonical('/kyc-aml'),
    })
  }, [isAr])

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
                {isAr ? 'امتثال' : 'Compliance'}
              </span>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
                {isAr ? 'سياسة اعرف عميلك ومكافحة غسيل الأموال' : 'KYC / AML Policy'}
              </h1>
              <p className="text-slate-400 text-base sm:text-lg max-w-xl">
                {isAr
                  ? 'التزامنا بالتحقق من الهوية ومكافحة غسيل الأموال وتمويل الإرهاب.'
                  : 'Our commitment to customer identity verification and anti-money laundering regulations.'}
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Key size={32} className="text-blue-400" />
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-5 sm:px-8 lg:px-10 py-16">
        <div className="bg-white rounded-[24px] border border-slate-200/80 p-8 sm:p-12 shadow-[0_4px_24px_rgba(15,23,42,0.02)]">
          <article className={`prose max-w-none text-slate-600 leading-relaxed ${isRTL ? 'text-right' : 'text-left'}`}>
            {isAr ? (
              <div className="space-y-8" style={{ direction: 'rtl' }}>
                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">1. الغرض والالتزام بالامتثال</h2>
                  <p>تلتزم Instant Grow التزاماً كاملاً بالقوانين والأنظمة الدولية والمحلية لمكافحة غسيل الأموال (AML) وتمويل الإرهاب. نحن نطبق سياسة صارمة للتحقق من هوية العملاء (KYC) لضمان نزاهة الخدمات وتجنب الأنشطة غير القانونية.</p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">2. إجراءات التحقق من الهوية (KYC)</h2>
                  <p>يُطلب من جميع العملاء تقديم معلومات وهوية موثوقة قبل البدء في إجراءات تأسيس الشركة، وتشمل:</p>
                  <ul className="list-disc pr-6 space-y-2">
                    <li>نسخة واضحة من جواز سفر ساري المفعول أو وثيقة الهوية الوطنية.</li>
                    <li>إثبات للعنوان السكني (فاتورة خدمات حديثة أو كشف حساب بنكي).</li>
                    <li>معلومات الاتصال الموثوقة والتحقق من صحتها.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">3. مراقبة المعاملات والإبلاغ عن الأنشطة المشبوهة</h2>
                  <p>تحتفظ Instant Grow بالحق في مراقبة المعاملات ورفض تقديم الخدمات لأي فرد أو جهة تُدرج في قوائم الحظر أو العقوبات الدولية، أو يُشتبه في قيامها بأنشطة غير مشروعة أو غسيل أموال.</p>
                </section>
              </div>
            ) : (
              <div className="space-y-8">
                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">1. Regulatory Framework & Compliance</h2>
                  <p>Instant Grow is fully committed to preventing money laundering, financial fraud, and the financing of terrorism. We adhere strictly to national and international compliance regulations, including the USA PATRIOT Act and FinCEN guidelines.</p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">2. Customer Identification Program (KYC)</h2>
                  <p>To register a business entity, we are required by state and national regulations to verify the identity of the beneficial owners. Customers must provide the following documentation:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>A valid government-issued photo ID or passport.</li>
                    <li>Proof of physical residential address (utility bill or bank statement less than 3 months old).</li>
                    <li>Verified contact details and accurate ownership declarations.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">3. Sanctions Screening & Service Rejection</h2>
                  <p>We perform automated screening of all applicants against international sanctions lists (including OFAC, EU, and UK sanctions lists). Instant Grow reserves the right to reject service requests or suspend accounts that fail screening or present high compliance risks.</p>
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

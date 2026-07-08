import { useEffect } from 'react'
import DOMPurify from 'dompurify'
import { useLang } from '../i18n/LanguageContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { setPageMeta, getCanonical } from '../lib/seo'
import { Shield } from 'lucide-react'
import { usePageContent } from '../hooks/usePageContent'

export default function PrivacyPolicyPage() {
  const { lang, isRTL } = useLang()
  const isAr = lang === 'ar'
  const { page } = usePageContent('privacy-policy')

  const title = (page && page.active) ? (isAr ? page.title_ar : page.title_en) : (isAr ? 'سياسة الخصوصية' : 'Privacy Policy')

  useEffect(() => {
    setPageMeta({
      title: `${title} | Instant Grow`,
      description: isAr
        ? 'سياسة الخصوصية الخاصة بـ Instant Grow. نحن نحمي بياناتك الشخصية والتجارية بأعلى درجات الأمان.'
        : 'Privacy Policy for Instant Grow. Learn how we collect, use, and protect your personal and business data.',
      canonical: getCanonical('/privacy-policy'),
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
                  ? 'آخر تحديث: 30 يونيو 2026. يرجى قراءة سياسة الخصوصية بعناية.'
                  : 'Last Updated: June 30, 2026. Please read this policy carefully.'}
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Shield size={32} className="text-blue-400" />
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
                  <h2 className="text-xl font-bold text-slate-800">1. معلومات نجمعها</h2>
                  <p>نحن نجمع نوعين أساسيين من المعلومات من مستخدمي موقعنا:</p>
                  <ul className="list-disc pr-6 space-y-2">
                    <li><strong>المعلومات الشخصية:</strong> وتشمل الاسم الكامل، وعنوان البريد الإلكتروني، ورقم الهاتف، وتاريخ الميلاد، ومعلومات الهوية لإثبات الشخصية لتأسيس الشركات.</li>
                    <li><strong>بيانات الأعمال:</strong> وتشمل اسم الشركة المقترح، والغرض التجاري للشركة، ومعلومات الأعضاء، وتفاصيل الملكية.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">2. كيف نستخدم معلوماتك</h2>
                  <p>نستخدم معلوماتك لتقديم خدمات التأسيس، والامتثال للقوانين المعمول بها، والتواصل معك:</p>
                  <ul className="list-disc pr-6 space-y-2">
                    <li>لتسجيل شركتك مع الجهات الحكومية الرسمية (الولايات المتحدة أو المملكة المتحدة أو الإمارات أو عمان).</li>
                    <li>لتقديم طلب الحصول على رقم EIN أو UTR أو التراخيص الرسمية.</li>
                    <li>لإرسال تحديثات الطلب وتذكيرات الامتثال والتقارير السنوية.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">3. حماية البيانات والأمن</h2>
                  <p>نحن ننفذ مجموعة متنوعة من تدابير الأمان للحفاظ على سلامة معلوماتك الشخصية. يتم إرسال جميع المعلومات الحساسة عبر تقنية Secure Socket Layer (SSL) وتشفيرها في قاعدة بياناتنا للوصول إليها فقط من قبل الأشخاص المصرح لهم والملتزمين بسرية المعلومات.</p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">4. مشاركة المعلومات مع أطراف ثالثة</h2>
                  <p>نحن لا نبيع أو نتاجر أو ننقل معلوماتك الشخصية إلى أطراف خارجية، باستثناء الجهات الحكومية الرسمية والوكلاء المسجلين الذين يساعدوننا في تشغيل موقعنا وتأسيس شركتك، طالما وافقت هذه الأطراف على الحفاظ على سرية هذه المعلومات.</p>
                </section>
              </div>
            ) : (
              <div className="space-y-8">
                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">1. Information We Collect</h2>
                  <p>We collect personal and business information when you use our services to form a company:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li><strong>Personal Information:</strong> Full name, email address, phone number, date of birth, and identity documentation required for compliance.</li>
                    <li><strong>Business Information:</strong> Proposed company name, business purpose, structure, member details, and ownership percentages.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">2. How We Use Your Information</h2>
                  <p>We use the collected information for the following purposes:</p>
                  <ul className="list-disc pl-6 space-y-2">
                    <li>Filing incorporation documents with official state or government registries.</li>
                    <li>Obtaining Employer Identification Numbers (EIN) or other tax identifiers.</li>
                    <li>Providing compliance tracking, annual filings, and account management.</li>
                  </ul>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">3. Data Security and Retention</h2>
                  <p>We implement strict administrative, technical, and physical safeguards to protect your personal and business data. All communications are encrypted via SSL, and access to customer data is strictly restricted to authorized compliance personnel.</p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">4. Third-Party Disclosures</h2>
                  <p>We do not sell, trade, or transfer your personal information to outside parties. This excludes trusted government agencies, registered agents, and filing partners who assist us in conducting our business and incorporating your company.</p>
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

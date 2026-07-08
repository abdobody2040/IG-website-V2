import { useEffect } from 'react'
import DOMPurify from 'dompurify'
import { useLang } from '../i18n/LanguageContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { setPageMeta, getCanonical } from '../lib/seo'
import { Eye } from 'lucide-react'
import { usePageContent } from '../hooks/usePageContent'

export default function AccessibilityPage() {
  const { lang, isRTL } = useLang()
  const isAr = lang === 'ar'
  const { page } = usePageContent('accessibility')

  const title = (page && page.active) ? (isAr ? page.title_ar : page.title_en) : (isAr ? 'إمكانية الوصول' : 'Accessibility Statement')

  useEffect(() => {
    setPageMeta({
      title: `${title} | Instant Grow`,
      description: isAr
        ? 'بيان إمكانية الوصول الخاص بـ Instant Grow. نحن نسعى لتوفير تجربة مستخدم شاملة وسهلة للجميع.'
        : 'Accessibility Statement for Instant Grow. Learn about our commitment to web accessibility and inclusivity.',
      canonical: getCanonical('/accessibility'),
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
                {isAr ? 'بيان' : 'Statement'}
              </span>
              <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
                {title}
              </h1>
              <p className="text-slate-400 text-base sm:text-lg max-w-xl">
                {isAr
                  ? 'التزامنا بتوفير موقع إلكتروني شامل ومتاح لجميع المستخدمين.'
                  : 'Our commitment to providing an inclusive and accessible digital experience.'}
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
              <Eye size={32} className="text-blue-400" />
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
                  <h2 className="text-xl font-bold text-slate-800">1. التزامنا الشامل</h2>
                  <p>تلتزم Instant Grow بتسهيل استخدام موقعها الإلكتروني وخدماتها لجميع فئات المجتمع، بما في ذلك الأشخاص ذوو الاحتياجات الخاصة. نحن نعمل باستمرار على تحسين تجربة المستخدم وتطبيق معايير إمكانية الوصول ذات الصلة.</p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">2. المعايير المتبعة</h2>
                  <p>نحن نعمل على مطابقة موقعنا مع إرشادات الوصول إلى محتوى الويب (WCAG 2.1) المستوى AA. تشمل هذه الإرشادات تحسين التباين، ودعم قوارئ الشاشة، وتوفير تنقل سهل عبر لوحة المفاتيح.</p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">3. اتصل بنا لملاحظاتك</h2>
                  <p>إذا واجهت أي صعوبة في استخدام موقعنا أو كان لديك اقتراح لتحسين تجربة إمكانية الوصول، يسعدنا تواصلك معنا مباشرة عبر البريد الإلكتروني (info@instantgrow.net) لنتمكن من تقديم المساعدة وتلبية احتياجاتك.</p>
                </section>
              </div>
            ) : (
              <div className="space-y-8">
                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">1. Commitment to Inclusion</h2>
                  <p>Instant Grow is dedicated to ensuring that our digital services, platform, and information are accessible to everyone, including individuals with disabilities. We strive to provide a user-friendly experience that respects digital accessibility principles.</p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">2. Standards & Guidelines</h2>
                  <p>We actively benchmark our platform against the Web Content Accessibility Guidelines (WCAG 2.1) Level AA. This includes regular audits of visual contrast, keyboard navigation flow, content semantic structure, and ARIA attributes for screen readers.</p>
                </section>

                <section className="space-y-3">
                  <h2 className="text-xl font-bold text-slate-800">3. Feedback & Contact</h2>
                  <p>If you encounter any accessibility barriers on our website, or wish to suggest improvements, please reach out to us at info@instantgrow.net. We will work to resolve the issue and provide the information you need through alternative formats.</p>
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

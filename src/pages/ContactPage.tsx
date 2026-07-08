import { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Mail, Phone, MessageSquare, MapPin, ArrowRight, CheckCircle, Loader2 } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import TurnstileWidget from '../components/TurnstileWidget'
import { pb } from '../lib/pocketbase'
import { sendContactNotificationEmail } from '../hooks/useEmailNotifications'
import toast from 'react-hot-toast'
import { setPageMeta, injectJsonLd, injectBreadcrumb, getCanonical } from '../lib/seo'


const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined
const CONTACT_ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined
const CONTACT_COOLDOWN_MS = 60_000 // 1 minute minimum between submissions

function checkContactCooldown(): boolean {
  try {
    const last = localStorage.getItem('contact_last_submit')
    if (last && Date.now() - Number(last) < CONTACT_COOLDOWN_MS) return false
  } catch {}
  return true
}

function setContactCooldown() {
  try { localStorage.setItem('contact_last_submit', String(Date.now())) } catch {}
}

interface ContactForm {
  name: string
  email: string
  phone?: string
  subject: string
  message: string
}

const SUBJECTS = [
  'US LLC Formation',
  'UK LTD Formation',
  'EIN / Tax ID',
  'Banking Setup',
  'Order Status',
  'Compliance / Annual Report',
  'General Inquiry',
  'Other',
]

export default function ContactPage() {
  const { lang, t, isRTL } = useLang()
  const isAr = lang === 'ar'
  const s = t.seo.contact
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [captchaToken, setCaptchaToken] = useState<string | null>(null)

  useEffect(() => {
    setPageMeta({
      title: s.title,
      description: s.description,
      keywords: s.keywords,
      canonical: getCanonical('/contact'),
    })
    injectJsonLd({
      '@context': 'https://schema.org',
      '@type': 'ContactPage',
      'name': s.title,
      'description': s.description,
      'url': getCanonical('/contact'),
    })
    injectBreadcrumb([
      { name: isRTL ? 'الرئيسية' : 'Home', url: getCanonical('/') },
      { name: isRTL ? 'تواصل معنا' : 'Contact Us', url: getCanonical('/contact') },
    ])
  }, [s, isRTL])

  const { register, handleSubmit, formState: { errors }, reset } = useForm<ContactForm>()

  const handleCaptchaVerify = useCallback((token: string) => setCaptchaToken(token), [])
  const handleCaptchaExpire = useCallback(() => setCaptchaToken(null), [])

  const onSubmit = async (data: ContactForm) => {
    if (TURNSTILE_SITE_KEY && !captchaToken) {
      toast.error(isAr ? 'يرجى إكمال التحقق أولاً' : 'Please complete the verification first.')
      return
    }
    if (!checkContactCooldown()) {
      toast.error(isAr ? 'يرجى الانتظار دقيقة قبل الإرسال مرة أخرى' : 'Please wait a minute before submitting again.')
      return
    }
    setContactCooldown()
    setSubmitting(true)
    try {
      if (CONTACT_ENDPOINT) {
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        // Pass auth token so the Worker can link the message to the user's account (B-009)
        if (pb.authStore.token) {
          headers['Authorization'] = `Bearer ${pb.authStore.token}`
        }
        const res = await fetch(CONTACT_ENDPOINT, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            name: data.name,
            email: data.email,
            subject: data.subject,
            message: data.message,
            captchaToken: captchaToken ?? undefined,
          }),
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error || 'Submit failed')
        }
      } else {
        await pb.collection('contact_messages').create({
          name: data.name,
          email: data.email,
          subject: data.subject,
          message: data.message,
        })
      }

      // Send email notifications — best-effort (may fail if user is unauthenticated)
      try {
        await sendContactNotificationEmail({
          fromName: data.name,
          fromEmail: data.email,
          subject: data.subject,
          message: data.message,
          phone: data.phone,
        })
      } catch (emailErr) {
        // Email notification failed but message was saved — don't block the user
        console.warn('Email notification failed (unauthenticated?):', emailErr)
      }

      setSubmitted(true)
      setCaptchaToken(null)
      reset()
    } catch (err) {
      console.error(err)
      toast.error(isAr ? 'حدث خطأ. يرجى المحاولة مرة أخرى.' : 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-white font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />


      {/* Hero */}
      <section className="pt-32 pb-16 bg-gradient-to-b from-[#f9fafb] to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-[#1a56ff] text-sm font-semibold uppercase tracking-wider mb-2">
            {isAr ? 'تواصل معنا' : 'Get in Touch'}
          </p>
          <h1 className="text-4xl sm:text-5xl font-bold text-[#0a0f1e] mb-4" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
            {isAr ? 'نحن هنا للمساعدة' : 'We\'re Here to Help'}
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            {isAr
              ? 'هل لديك سؤال حول تأسيس شركتك؟ فريقنا جاهز للإجابة على جميع استفساراتك.'
              : 'Have a question about forming your company? Our team is ready to answer all your questions.'}
          </p>
        </div>
      </section>

      {/* Contact grid */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-10">

            {/* Left — contact info */}
            <div className="space-y-6">
              <div className="bg-[#0a0f1e] rounded-2xl p-8 text-white">
                <h2 className="text-xl font-bold mb-6" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
                  {isAr ? 'معلومات الاتصال' : 'Contact Information'}
                </h2>
                <div className="space-y-5">
                  <a href="mailto:info@instantgrow.net" className="flex items-start gap-4 group">
                    <div className="w-10 h-10 bg-[#1a56ff]/20 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:bg-[#1a56ff]/40 transition-colors">
                      <Mail size={18} className="text-[#1a56ff]" />
                    </div>
                    <div>
                      <p className="text-white/50 text-xs mb-0.5">{isAr ? 'البريد الإلكتروني' : 'Email'}</p>
                      <p className="text-white font-medium text-sm">info@instantgrow.net</p>
                    </div>
                  </a>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#1a56ff]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MessageSquare size={18} className="text-[#1a56ff]" />
                    </div>
                    <div>
                      <p className="text-white/50 text-xs mb-0.5">{isAr ? 'واتساب' : 'WhatsApp'}</p>
                      <p className="text-white font-medium text-sm">{isAr ? 'متاح للباقة المميزة' : 'Available on Premium plans'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#1a56ff]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Phone size={18} className="text-[#1a56ff]" />
                    </div>
                    <div>
                      <p className="text-white/50 text-xs mb-0.5">{isAr ? 'المكالمة التأهيلية' : 'Onboarding Call'}</p>
                      <p className="text-white font-medium text-sm">{isAr ? 'مشمولة في الباقة المميزة' : 'Included in Premium plan'}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-[#1a56ff]/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <MapPin size={18} className="text-[#1a56ff]" />
                    </div>
                    <div>
                      <p className="text-white/50 text-xs mb-0.5">{isAr ? 'التوقيت' : 'Response Time'}</p>
                      <p className="text-white font-medium text-sm">{isAr ? 'خلال 1-2 يوم عمل' : 'Within 1-2 business days'}</p>
                    </div>
                  </div>
                </div>

                {/* Social */}
                <div className="mt-8 pt-6 border-t border-white/10">
                  <p className="text-white/40 text-xs mb-3">{isAr ? 'تابعنا' : 'Follow Us'}</p>
                  <a
                    href="https://www.facebook.com/profile.php?id=61577661225593"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 bg-white/10 hover:bg-[#1a56ff]/30 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                    </svg>
                    Facebook
                  </a>
                </div>
              </div>

              {/* FAQ quick link */}
              <div className="bg-[#eff6ff] rounded-2xl p-6 border border-[#1a56ff]/10">
                <h3 className="font-semibold text-[#0a0f1e] mb-2">{isAr ? 'الأسئلة الشائعة' : 'Common Questions?'}</h3>
                <p className="text-gray-500 text-sm mb-4">
                  {isAr ? 'تحقق من صفحة الأسئلة الشائعة للحصول على إجابات فورية.' : 'Check our FAQ page for instant answers.'}
                </p>
                <a href="/#faq" className="flex items-center gap-2 text-[#1a56ff] text-sm font-semibold hover:gap-3 transition-all">
                  {isAr ? 'عرض الأسئلة الشائعة' : 'View FAQ'} <ArrowRight size={15} />
                </a>
              </div>
            </div>

            {/* Right — contact form */}
            <div className="lg:col-span-2">
              {submitted ? (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-12 text-center h-full flex flex-col items-center justify-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle size={32} className="text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-[#0a0f1e] mb-2">
                    {isAr ? 'تم إرسال رسالتك!' : 'Message Sent!'}
                  </h3>
                  <p className="text-gray-500 max-w-md">
                    {isAr
                      ? 'شكراً لتواصلك معنا. سيرد فريقنا على بريدك الإلكتروني خلال 1-2 يوم عمل.'
                      : 'Thank you for reaching out. Our team will reply to your email within 1-2 business days.'}
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="mt-6 text-[#1a56ff] text-sm font-semibold hover:underline"
                  >
                    {isAr ? 'إرسال رسالة أخرى' : 'Send another message'}
                  </button>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
                  <h2 className="text-xl font-bold text-[#0a0f1e] mb-6">
                    {isAr ? 'أرسل لنا رسالة' : 'Send Us a Message'}
                  </h2>

                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          {isAr ? 'الاسم الكامل' : 'Full Name'} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          {...register('name', { required: true })}
                          placeholder={isAr ? 'أدخل اسمك' : 'Your full name'}
                          className={`w-full border rounded-xl px-4 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a56ff] focus:border-transparent transition-colors ${errors.name ? 'border-red-400' : 'border-slate-200'}`}
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{isAr ? 'هذا الحقل مطلوب' : 'This field is required'}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          {isAr ? 'البريد الإلكتروني' : 'Email Address'} <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="email"
                          {...register('email', { required: true })}
                          placeholder={isAr ? 'email@example.com' : 'email@example.com'}
                          className={`w-full border rounded-xl px-4 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a56ff] focus:border-transparent transition-colors ${errors.email ? 'border-red-400' : 'border-slate-200'}`}
                        />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{isAr ? 'البريد الإلكتروني مطلوب' : 'Email is required'}</p>}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          {isAr ? 'رقم الهاتف / واتساب' : 'Phone / WhatsApp'}
                        </label>
                        <input
                          type="tel"
                          {...register('phone')}
                          placeholder={isAr ? '+20 1XX XXX XXXX' : '+1 (555) 000-0000'}
                          className="w-full border border-slate-200 rounded-xl px-4 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a56ff] focus:border-transparent transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1.5">
                          {isAr ? 'الموضوع' : 'Subject'} <span className="text-red-500">*</span>
                        </label>
                        <select
                          {...register('subject', { required: true })}
                          className={`w-full border rounded-xl px-4 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a56ff] focus:border-transparent transition-colors ${errors.subject ? 'border-red-400' : 'border-slate-200'}`}
                        >
                          <option value="">{isAr ? 'اختر الموضوع' : 'Select a subject'}</option>
                          {SUBJECTS.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                        {errors.subject && <p className="text-red-500 text-xs mt-1">{isAr ? 'الرجاء اختيار الموضوع' : 'Please select a subject'}</p>}
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1.5">
                        {isAr ? 'الرسالة' : 'Message'} <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        rows={5}
                        {...register('message', { required: true, minLength: 10 })}
                        placeholder={isAr ? 'اكتب رسالتك هنا...' : 'Tell us how we can help...'}
                        className={`w-full border rounded-xl px-4 py-3 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a56ff] focus:border-transparent transition-colors resize-none ${errors.message ? 'border-red-400' : 'border-slate-200'}`}
                      />
                      {errors.message && <p className="text-red-500 text-xs mt-1">{isAr ? 'الرجاء كتابة رسالة (10 أحرف على الأقل)' : 'Please write a message (min 10 characters)'}</p>}
                    </div>

                    {TURNSTILE_SITE_KEY && (
                      <div className="flex justify-center">
                        <TurnstileWidget
                          siteKey={TURNSTILE_SITE_KEY}
                          onVerify={handleCaptchaVerify}
                          onExpire={handleCaptchaExpire}
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={submitting || (!!TURNSTILE_SITE_KEY && !captchaToken)}
                      className="w-full bg-[#1a56ff] text-white font-semibold py-3.5 rounded-xl hover:bg-[#3a76ff] transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <>
                          <Loader2 size={18} className="animate-spin" />
                          {isAr ? 'جارٍ الإرسال...' : 'Sending...'}
                        </>
                      ) : (
                        <>
                          {isAr ? 'إرسال الرسالة' : 'Send Message'}
                          <ArrowRight size={18} />
                        </>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

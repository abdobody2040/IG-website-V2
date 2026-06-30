import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import { useMagneticButton } from '../hooks/useMagneticButton'
import { usePricingConfig, resolvePrice } from '../hooks/usePricingConfig'

/* ─── US LLC plans ─────────────────────────────────────────────────────── */
const usBasicFeatures = [
  'Wyoming LLC formation',
  'Registered Agent – first year',
  'EIN (US Tax ID from IRS)',
  'All formation documents',
  'BOI report filing (free)',
  'US mailing address',
  'Stripe bank account guidance',
  'Email support',
]

const usPremiumFeatures = [
  'Everything in Basic',
  'Priority / fast processing',
  'Virtual US phone number',
  'Custom Operating Agreement',
  'Full Mercury/Relay account setup',
  'Stripe activation assistance',
  'WhatsApp + phone support',
  '30-min onboarding call',
  'Login credentials handover doc',
]

/* ─── UK LTD plans ─────────────────────────────────────────────────────── */
const ukBasicFeatures = [
  'UK LTD (Companies House)',
  'Registered office – first year',
  'Certificate of Incorporation',
  'All company documents',
  'Wise business account referral',
  'Stripe UK setup guidance',
  'Email support',
]

const ukPremiumFeatures = [
  'Everything in Basic',
  "Director's service address (privacy)",
  'Virtual UK phone number',
  'First Confirmation Statement',
  'Full Wise account setup',
  'Stripe UK activation assistance',
  'WhatsApp + phone support',
  '30-min onboarding call',
  'Login credentials handover doc',
]

/* ─── Arabic translations ───────────────────────────────────────────────── */
const usBasicFeaturesAr = [
  'تأسيس Wyoming LLC',
  'Registered Agent — أول سنة',
  'EIN (رقم ضريبي أمريكي من IRS)',
  'جميع مستندات التأسيس',
  'BOI report filing (مجاني)',
  'عنوان بريدي أمريكي',
  'إرشاد فتح حساب بنكي + Stripe',
  'دعم عبر البريد الإلكتروني',
]
const usPremiumFeaturesAr = [
  'كل ما في الأساسية',
  'معالجة أولوية / سريعة',
  'رقم هاتف أمريكي افتراضي',
  'عقد تشغيل (Operating Agreement) مخصص',
  'إعداد كامل لحساب Mercury/Relay',
  'مساعدة تفعيل Stripe',
  'دعم واتساب + هاتف',
  'مكالمة تأهيلية 30 دقيقة',
  'مستند تسليم بيانات الدخول الكامل',
]
const ukBasicFeaturesAr = [
  'تأسيس UK LTD (Companies House)',
  'عنوان مكتب مسجل — أول سنة',
  'شهادة التأسيس (Certificate of Incorporation)',
  'جميع مستندات الشركة',
  'إحالة حساب Wise للأعمال',
  'إرشاد إعداد Stripe UK',
  'دعم عبر البريد الإلكتروني',
]
const ukPremiumFeaturesAr = [
  'كل ما في الأساسية',
  'عنوان خدمة للمدير (خصوصية)',
  'رقم هاتف بريطاني افتراضي',
  'تقديم أول Confirmation Statement',
  'إعداد كامل لحساب Wise',
  'مساعدة تفعيل Stripe UK',
  'دعم واتساب + هاتف',
  'مكالمة تأهيلية 30 دقيقة',
  'مستند تسليم بيانات الدخول الكامل',
]

/* ─── Component ─────────────────────────────────────────────────────────── */
export default function Pricing() {
  const { t, lang } = useLang()
  const p = t.pricing
  const isAr = lang === 'ar'

  const [region, setRegion] = useState<'us' | 'uk'>('us')

  const basicMagnetic = useMagneticButton()
  const premiumMagnetic = useMagneticButton()

  /* ── DB-backed pricing (falls back to static PRICING_DATA) ── */
  const { pricing } = usePricingConfig()
  const basicRecord   = region === 'us' ? pricing.us.basic   : pricing.uk.basic
  const premiumRecord = region === 'us' ? pricing.us.premium : pricing.uk.premium

  const basicPriceNum   = resolvePrice(basicRecord,   region, 'basic')
  const premiumPriceNum = resolvePrice(premiumRecord, region, 'premium')
  const basicPrice   = `$${basicPriceNum}`
  const premiumPrice = `$${premiumPriceNum}`

  /* Choose feature lists: DB first, then static fallback based on language */
  const staticBasicFeatures   = region === 'us' ? (isAr ? usBasicFeaturesAr   : usBasicFeatures)   : (isAr ? ukBasicFeaturesAr   : ukBasicFeatures)
  const staticPremiumFeatures = region === 'us' ? (isAr ? usPremiumFeaturesAr : usPremiumFeatures) : (isAr ? ukPremiumFeaturesAr : ukPremiumFeatures)

  const basicFeatures   = (isAr ? basicRecord?.features_ar   : basicRecord?.features_en)?.length   ? (isAr ? basicRecord!.features_ar   : basicRecord!.features_en)   : staticBasicFeatures
  const premiumFeatures = (isAr ? premiumRecord?.features_ar : premiumRecord?.features_en)?.length ? (isAr ? premiumRecord!.features_ar : premiumRecord!.features_en) : staticPremiumFeatures

  const basicRenew   = region === 'us' ? '+ $99/yr registered office renewal' : '+ $89/yr registered office renewal'
  const premiumRenew = region === 'us' ? '+ $99/yr office + service address renewal' : '+ $99/yr office + service address renewal'
  const regionLabel  = region === 'us' ? 'United States · Wyoming LLC' : 'United Kingdom · Private Limited Company'

  const basicRenewAr   = region === 'us' ? '+ 0,300 ج.م/سنة تجديد الوكيل' : '+ $89/سنة تجديد المكتب'
  const premiumRenewAr = region === 'us' ? '+ 0,300 ج.م/سنة تجديد الوكيل + عنوان الخدمة' : '+ $99/سنة تجديد المكتب + عنوان الخدمة'

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
  }

  return (
    <section id="pricing" className="py-20 bg-[#f8f9fa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="text-center mb-4">
          <p className="text-sm font-semibold tracking-wider text-blue-500">{p.label}</p>
        </div>
        <h2
          className="text-4xl sm:text-5xl font-bold text-[#0a0a0f] text-center mb-4"
          style={{ fontFamily: 'Sora, Inter, sans-serif' }}
        >
          {p.heading}
        </h2>
        <p className="text-gray-500 text-center max-w-2xl mx-auto mb-10">
          {p.subheading}
        </p>

        {/* ── Region toggle (US / UK) ───────────────────────────────────── */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-white/80 backdrop-blur-sm border border-gray-200/80 shadow-sm rounded-2xl p-1 gap-1">
            <button
              onClick={() => setRegion('us')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                region === 'us'
                  ? 'bg-[#0a0a0f] text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span className="text-base">🇺🇸</span>
              {isAr ? 'شركة أمريكية LLC' : 'US LLC Company'}
            </button>
            <button
              onClick={() => setRegion('uk')}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                region === 'uk'
                  ? 'bg-[#0a0a0f] text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <span className="text-base">🇬🇧</span>
              {isAr ? 'شركة بريطانية LTD' : 'UK LTD Company'}
            </button>
          </div>
        </div>

        {/* Region subtitle */}
        <p className="text-center text-gray-400 text-sm mb-8">{regionLabel}</p>

        {/* ── Plans grid ───────────────────────────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">

          {/* Basic plan */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            onMouseMove={handleMouseMove}
            className="spotlight-card border-glow-card bg-white rounded-3xl border border-gray-200 p-8 shadow-sm hover:shadow-lg transition-shadow relative order-2 md:order-2"
          >
            <div className="mb-1 text-xs text-gray-400 font-medium">{regionLabel}</div>
            <h3
              className="text-2xl font-bold text-[#0a0a0f] mb-4"
              style={{ fontFamily: 'Sora, Inter, sans-serif' }}
            >
              {isAr ? 'الأساسية' : 'Basic'}
            </h3>

            <div className="mb-1">
              <span className="text-4xl font-extrabold text-[#0a0a0f]" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
                {basicPrice}
              </span>
              <span className="text-gray-400 text-sm ml-2">{isAr ? '/ دفعة واحدة' : '/ one-time'}</span>
            </div>
            <p className="text-xs text-gray-400 mb-6">{isAr ? basicRenewAr : basicRenew}</p>
            <p className="text-sm text-gray-500 mb-6">
              {isAr
                ? (region === 'us' ? 'كل ما تحتاجه لتأسيس شركتك الأمريكية' : 'كل ما تحتاجه لتأسيس شركتك البريطانية')
                : (region === 'us' ? 'Everything you need to launch your US company' : 'Everything you need to launch your UK company')}
            </p>

            <motion.a
              ref={basicMagnetic.ref}
              href={`/order?plan=${region}-basic`}
              onMouseMove={basicMagnetic.onMouseMove}
              onMouseLeave={basicMagnetic.onMouseLeave}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="block w-full border-2 border-blue-500 text-blue-600 text-center font-semibold py-3 rounded-xl hover:bg-blue-600 hover:text-white transition-colors mb-8"
              style={{ transition: 'box-shadow 0.3s ease' }}
            >
              {isAr ? 'ابدأ الآن' : 'Get Started'}
            </motion.a>

            <ul className="space-y-3">
              {basicFeatures.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm text-gray-600">
                  <Check size={16} className="text-[#1a56ff] flex-shrink-0 mt-0.5" />
                  {feature}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Premium plan */}
          <motion.div
            initial={{ y: 40, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            onMouseMove={handleMouseMove}
            className="spotlight-card border-glow-card bg-[#0a0a0f] rounded-3xl shadow-2xl relative order-1 md:order-1"
          >
            {/* Glow behind card */}
            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Most popular badge */}
            <div className="flex justify-center -mt-4 mb-0 relative z-10">
              <motion.span
                animate={{ boxShadow: ['0 0 0 0 rgba(59,130,246,0.4)', '0 0 0 12px rgba(59,130,246,0)', '0 0 0 0 rgba(59,130,246,0.4)'] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-semibold px-4 py-1.5 rounded-full shadow-lg"
              >
                {isAr ? 'الأكثر طلبًا' : 'Most Popular'}
              </motion.span>
            </div>

            <div className="px-8 pb-8 pt-4">
            <div className="mb-1 text-xs text-white/40 font-medium">{regionLabel}</div>
            <h3
              className="text-2xl font-bold text-white mb-4"
              style={{ fontFamily: 'Sora, Inter, sans-serif' }}
            >
              {isAr ? 'المميزة' : 'Premium'}
            </h3>

            <div className="mb-1">
              <span className="text-4xl font-extrabold text-white" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
                {premiumPrice}
              </span>
              <span className="text-white/40 text-sm ml-2">{isAr ? '/ دفعة واحدة' : '/ one-time'}</span>
              <span className="inline-block bg-emerald-500/10 text-emerald-400 text-xs font-semibold px-2.5 py-0.5 rounded-full ml-2">
                Save $120
              </span>
            </div>
            <p className="text-xs text-white/30 mb-6">{isAr ? premiumRenewAr : premiumRenew}</p>
            <p className="text-white/60 text-sm mb-6">
              {isAr ? 'الباقة الشاملة مع دعم كامل' : 'The complete package with full support'}
            </p>

            <motion.a
              ref={premiumMagnetic.ref}
              href={`/order?plan=${region}-premium`}
              onMouseMove={premiumMagnetic.onMouseMove}
              onMouseLeave={premiumMagnetic.onMouseLeave}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="block w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-center font-semibold py-3 rounded-xl hover:shadow-lg hover:shadow-blue-500/25 transition-all mb-8"
              style={{ transition: 'box-shadow 0.3s ease' }}
            >
              {isAr ? 'ابدأ الآن' : 'Get Started'}
            </motion.a>

            <ul className="space-y-3">
              {premiumFeatures.map((feature, i) => (
                <li key={i} className="flex items-start gap-3 text-sm">
                  <Check size={16} className={`flex-shrink-0 mt-0.5 ${i === 0 ? 'text-[#00d4ff]' : 'text-[#1a56ff]'}`} />
                  <span className={i === 0 ? 'text-white font-medium' : 'text-white/70'}>{feature}</span>
                </li>
              ))}
            </ul>
            </div>
          </motion.div>

        </div>

        {/* Bottom note */}
        <p className="text-center text-gray-400 text-sm mt-10">
          {isAr
            ? 'هل تحتاج مساعدة في الاختيار؟ '
            : 'Not sure which plan to pick? '}
          <a href="mailto:info@instantgrow.net" className="text-[#1a56ff] hover:underline font-medium">
            {isAr ? 'تواصل مع فريقنا ←' : 'Talk to our team →'}
          </a>
        </p>

      </div>
    </section>
  )
}

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Phone } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import { useMagneticButton } from '../hooks/useMagneticButton'
import { usePricingConfig, resolvePrice } from '../hooks/usePricingConfig'

/* ─── US LLC features ──────────────────────────────────────────────────────── */
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

/* ─── UK LTD features ──────────────────────────────────────────────────────── */
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

/* ─── UAE features ─────────────────────────────────────────────────────────── */
const uaeFeatures = [
  'UAE Freezone / Mainland company',
  'Business license included',
  'EID & visa assistance',
  'Corporate bank account',
  'Office address for 1 year',
  'PRO services support',
  'WhatsApp + phone support',
]

/* ─── Arabic features ─────────────────────────────────────────────────────── */
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
  'عقد تشغيل مخصص',
  'إعداد كامل لحساب Mercury/Relay',
  'مساعدة تفعيل Stripe',
  'دعم واتساب + هاتف',
  'مكالمة تأهيلية 30 دقيقة',
  'مستند تسليم بيانات الدخول',
]
const ukBasicFeaturesAr = [
  'تأسيس UK LTD (Companies House)',
  'عنوان مكتب مسجل — أول سنة',
  'شهادة التأسيس',
  'جميع مستندات الشركة',
  'إحالة حساب Wise للأعمال',
  'إرشاد إعداد Stripe UK',
  'دعم عبر البريد الإلكتروني',
]
const ukPremiumFeaturesAr = [
  'كل ما في الأساسية',
  'عنوان خدمة للمدير',
  'رقم هاتف بريطاني افتراضي',
  'تقديم أول Confirmation Statement',
  'إعداد كامل لحساب Wise',
  'مساعدة تفعيل Stripe UK',
  'دعم واتساب + هاتف',
  'مكالمة تأهيلية 30 دقيقة',
  'مستند تسليم بيانات الدخول',
]
const uaeFeaturesAr = [
  'تأسيس شركة في منطقة حرة أو البر الرئيسي',
  'رخصة تجارية مدمجة',
  'مساعدة في الهوية والتأشيرة',
  'حساب بنكي للشركة',
  'عنوان مكتب لمدة سنة',
  'خدمات PRO',
  'دعم واتساب + هاتف',
]

/* ─── Component ─────────────────────────────────────────────────────────────── */
export default function Pricing() {
  const { t, lang } = useLang()
  const p = t.pricing
  const isAr = lang === 'ar'

  const [region, setRegion] = useState<'us' | 'uk'>('us')

  const premiumMagnetic = useMagneticButton()

  /* ── DB-backed pricing ── */
  const { pricing } = usePricingConfig()
  const basicRecord = region === 'us' ? pricing.us.basic : pricing.uk.basic
  const premiumRecord = region === 'us' ? pricing.us.premium : pricing.uk.premium

  const basicPriceNum = resolvePrice(basicRecord, region, 'basic')
  const premiumPriceNum = resolvePrice(premiumRecord, region, 'premium')
  const basicPrice = `$${basicPriceNum}`
  const premiumPrice = `$${premiumPriceNum}`

  const staticBasicFeatures = region === 'us' ? (isAr ? usBasicFeaturesAr : usBasicFeatures) : (isAr ? ukBasicFeaturesAr : ukBasicFeatures)
  const staticPremiumFeatures = region === 'us' ? (isAr ? usPremiumFeaturesAr : usPremiumFeatures) : (isAr ? ukPremiumFeaturesAr : ukPremiumFeatures)

  const basicFeatures = (isAr ? basicRecord?.features_ar : basicRecord?.features_en)?.length
    ? (isAr ? basicRecord!.features_ar : basicRecord!.features_en)
    : staticBasicFeatures
  const premiumFeatures = (isAr ? premiumRecord?.features_ar : premiumRecord?.features_en)?.length
    ? (isAr ? premiumRecord!.features_ar : premiumRecord!.features_en)
    : staticPremiumFeatures

  const regionSubLabel = region === 'us' ? '🇺🇸 Wyoming LLC' : '🇬🇧 UK LTD'

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
  }

  return (
    <section id="pricing" className="ig-section bg-gradient-to-b from-white to-[#F8FAFC]">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">

        {/* Header */}
        <div className="text-center mb-12">
          <span className="ig-label">{p.label}</span>
          <h2
            className="text-4xl sm:text-[54px] font-bold text-[#0F172A] leading-tight tracking-tight mb-4"
            style={{ fontFamily: 'Sora, Inter, sans-serif' }}
          >
            {p.heading}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-slate-500 max-w-2xl mx-auto mb-10">
            {p.subheading}
          </p>

          {/* Region toggle */}
          <div className="flex justify-center">
            <div className="inline-flex bg-white border border-gray-200 shadow-sm rounded-[18px] p-1 gap-1">
              <button
                onClick={() => setRegion('us')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-[14px] text-sm font-semibold transition-all duration-200 ${
                  region === 'us'
                    ? 'bg-[#0F172A] text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <span>🇺🇸</span>
                {isAr ? 'شركة أمريكية LLC' : 'US LLC Company'}
              </button>
              <button
                onClick={() => setRegion('uk')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-[14px] text-sm font-semibold transition-all duration-200 ${
                  region === 'uk'
                    ? 'bg-[#0F172A] text-white shadow-md'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                <span>🇬🇧</span>
                {isAr ? 'شركة بريطانية LTD' : 'UK LTD Company'}
              </button>
            </div>
          </div>
        </div>

        {/* ── 3 Cards ───────────────────────────────────────────────────────── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch pt-6 pb-6">

          {/* Card 1: Basic */}
          <motion.div
            key={`basic-${region}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            onMouseMove={handleMouseMove}
            className="spotlight-card bg-white rounded-[24px] border border-gray-200 p-9 flex flex-col relative"
            style={{ boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}
          >
            <div className="text-xs text-slate-400 font-medium mb-2">{regionSubLabel}</div>
            <h3 className="text-xl font-bold text-[#0F172A] mb-4" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
              {isAr ? (region === 'us' ? 'LLC أمريكية — أساسية' : 'LTD بريطانية — أساسية') : (region === 'us' ? 'US LLC Formation' : 'UK LTD Formation')}
            </h3>
            <div className="mb-1 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-[#0F172A]" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
                {basicPrice}
              </span>
              <span className="text-slate-400 text-sm">{isAr ? '/ دفعة واحدة' : '/ one-time'}</span>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              {region === 'us' ? '+ $99/yr registered agent renewal' : '+ $89/yr registered office renewal'}
            </p>
            <p className="text-sm text-slate-500 mb-6">
              {isAr
                ? (region === 'us' ? 'كل ما تحتاجه لتأسيس شركتك الأمريكية' : 'كل ما تحتاجه لتأسيس شركتك البريطانية')
                : (region === 'us' ? 'Everything you need to launch your US company.' : 'Everything you need to launch your UK company.')}
            </p>
            <a
              href={`/order?plan=${region}-basic`}
              className="block w-full border-2 border-blue-500 text-blue-600 text-center font-semibold py-4 rounded-2xl hover:bg-blue-600 hover:text-white transition-all duration-200 mb-7 text-sm"
            >
              {isAr ? 'ابدأ الآن' : 'Get Started'}
            </a>
            <ul className="space-y-3.5 flex-1">
              {basicFeatures.map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <Check size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Card 2: Premium — FEATURED */}
          <motion.div
            key={`premium-${region}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative rounded-[24px] overflow-hidden flex flex-col"
            style={{
              transform: 'scale(1.08)',
              background: '#0F172A',
              boxShadow: '0 0 0 2px #2563EB, 0 35px 90px rgba(37,99,235,0.35), 0 0 50px rgba(37,99,235,0.25)',
              zIndex: 2,
            }}
          >
            {/* Glow blob */}
            <div className="absolute -top-24 -right-16 w-48 h-48 bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -left-12 w-36 h-36 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Most Popular badge */}
            <div className="flex justify-center pt-5 pb-0">
              <motion.span
                animate={{ boxShadow: ['0 0 0 0 rgba(59,130,246,0.4)', '0 0 0 12px rgba(59,130,246,0)', '0 0 0 0 rgba(59,130,246,0.4)'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg"
              >
                {isAr ? '✨ الأكثر طلبًا' : '✨ Most Popular'}
              </motion.span>
            </div>

            <div className="px-9 pb-9 pt-7 flex flex-col flex-1">
              <div className="text-xs text-white/40 font-medium mb-2">{regionSubLabel}</div>
              <h3 className="text-xl font-bold text-white mb-4" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
                {isAr ? (region === 'us' ? 'LLC أمريكية — مميزة' : 'LTD بريطانية — مميزة') : (region === 'us' ? 'US LLC Formation' : 'UK LTD Formation')}
                <span className="block text-blue-400 text-sm font-semibold mt-0.5">
                  {isAr ? 'المميزة' : 'Premium'}
                </span>
              </h3>

              <div className="mb-1 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-white" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
                  {premiumPrice}
                </span>
                <span className="text-white/40 text-sm">{isAr ? '/ دفعة واحدة' : '/ one-time'}</span>
                <span className="inline-block bg-emerald-500/15 text-emerald-400 text-[11px] font-bold px-2 py-0.5 rounded-full ml-1">
                  Save $120
                </span>
              </div>
              <p className="text-xs text-white/30 mb-5">
                {region === 'us' ? '+ $99/yr office + service address' : '+ $99/yr office + service address'}
              </p>
              <p className="text-white/60 text-sm mb-6">
                {isAr ? 'الباقة الشاملة مع دعم كامل' : 'The complete package with full support.'}
              </p>

              <motion.a
                ref={premiumMagnetic.ref}
                onMouseMove={premiumMagnetic.onMouseMove}
                onMouseLeave={premiumMagnetic.onMouseLeave}
                href={`/order?plan=${region}-premium`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="shimmer-btn block w-full bg-gradient-to-r from-blue-500 to-cyan-500 text-white text-center font-semibold py-4 rounded-2xl hover:shadow-lg hover:shadow-blue-500/30 transition-all duration-200 mb-7 text-sm"
              >
                {isAr ? 'ابدأ الآن' : 'Get Started'}
              </motion.a>

              <ul className="space-y-3.5 flex-1">
                {premiumFeatures.map((f, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm">
                    <Check size={15} className={`flex-shrink-0 mt-0.5 ${i === 0 ? 'text-cyan-400' : 'text-blue-400'}`} />
                    <span className={i === 0 ? 'text-white font-medium' : 'text-white/70'}>{f}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>

          {/* Card 3: UAE */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            onMouseMove={handleMouseMove}
            className="spotlight-card bg-white rounded-[24px] border border-gray-200 p-9 flex flex-col relative"
            style={{ boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}
          >
            <div className="text-xs text-slate-400 font-medium mb-2">🇦🇪 UAE Company</div>
            <h3 className="text-xl font-bold text-[#0F172A] mb-4" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
              {isAr ? 'تأسيس شركة في الإمارات' : 'UAE Company Setup'}
            </h3>
            <div className="mb-1 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-[#0F172A]" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
                $599
              </span>
              <span className="text-slate-400 text-sm">{isAr ? '/ دفعة واحدة' : '/ one-time'}</span>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              {isAr ? 'التجديد السنوي يعتمد على المنطقة' : 'Annual renewal varies by zone'}
            </p>
            <p className="text-sm text-slate-500 mb-6">
              {isAr ? 'أسس شركتك في الإمارات للوصول إلى أسواق الخليج.' : 'Launch your UAE company for Gulf market access.'}
            </p>

            <a
              href="https://cal.com/instant-grow-llc/15min"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full border-2 border-gray-200 text-slate-600 font-semibold py-4 rounded-2xl hover:border-blue-300 hover:text-blue-600 transition-all duration-200 mb-7 text-sm"
            >
              <Phone size={14} />
              {isAr ? 'احجز استشارة مجانية' : 'Book a Free Call'}
            </a>

            <ul className="space-y-2.5 flex-1">
              {(isAr ? uaeFeaturesAr : uaeFeatures).map((f, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600">
                  <Check size={15} className="text-amber-500 flex-shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>

            {/* Custom note */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <p className="text-xs text-slate-400 text-center">
                {isAr ? 'تحتاج شيئاً مخصصاً؟' : 'Need something custom?'}
                <a
                  href="https://cal.com/instant-grow-llc/15min"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:underline font-medium ml-1"
                >
                  {isAr ? 'تواصل معنا ←' : 'Talk to us →'}
                </a>
              </p>
            </div>
          </motion.div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-slate-400 text-sm mt-10">
          {isAr ? 'غير متأكد؟ ' : 'Not sure which plan? '}
          <a href="mailto:info@instantgrow.net" className="text-blue-500 hover:underline font-medium">
            {isAr ? 'تحدث مع فريقنا ←' : 'Talk to our team →'}
          </a>
        </p>
      </div>
    </section>
  )
}

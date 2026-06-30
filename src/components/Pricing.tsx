import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, Phone, Calendar } from 'lucide-react'
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
]

/* ─── UAE features ─────────────────────────────────────────────────────────── */
const uaeBasicFeatures = [
  'UAE Freezone company formation',
  'Business license for 1 year',
  'Virtual office address',
  'Pre-approval & name reservation',
  'Wise business bank guidance',
  'Email support',
]
const uaePremiumFeatures = [
  'Everything in Basic',
  'Mainland or premium Freezone company',
  'Investor visa & residency assistance',
  'Corporate bank account opening assistance',
  'Physical address / desk lease (1 year)',
  'PRO services support',
  'WhatsApp + phone support',
  '30-min onboarding call',
]

/* ─── Oman features ────────────────────────────────────────────────────────── */
const omanBasicFeatures = [
  'Oman SPC (Single Person Company)',
  'Commercial Register (CR) & tax card',
  'Chamber of Commerce registration',
  'Registered office address – 1 year',
  'Bank account application guidance',
  'Email support',
]
const omanPremiumFeatures = [
  'Everything in Basic',
  'Oman LLC (multiple shareholders)',
  'Investor visa & residency assistance',
  'Corporate bank account opening assistance',
  'Local office address setup',
  'Custom corporate bylaws (MoA)',
  'WhatsApp + phone support',
  '30-min onboarding call',
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
]
const uaeBasicFeaturesAr = [
  'تأسيس شركة منطقة حرة في الإمارات',
  'رخصة تجارية لمدة سنة',
  'عنوان مكتب افتراضي',
  'الموافقة المسبقة وحجز الاسم',
  'إرشاد فتح حساب بنكي للأعمال',
  'دعم عبر البريد الإلكتروني',
]
const uaePremiumFeaturesAr = [
  'كل ما في الباقة الأساسية',
  'تأسيس شركة بر رئيسي أو منطقة حرة مميزة',
  'مساعدة في تأشيرة المستثمر والإقامة',
  'مساعدة في فتح الحساب البنكي للشركة',
  'موقع مكتب حقيقي / عقد إيجار مكتب',
  'خدمات PRO معتمدة',
  'دعم واتساب + هاتف',
  'مكالمة تأهيلية 30 دقيقة',
]
const omanBasicFeaturesAr = [
  'تأسيس شركة الشخص الواحد (SPC) في عمان',
  'السجل التجاري والبطاقة الضريبية',
  'التسجيل في غرفة التجارة والصناعة',
  'عنوان مكتب مسجل — أول سنة',
  'إرشاد فتح حساب بنكي للشركة',
  'دعم عبر البريد الإلكتروني',
]
const omanPremiumFeaturesAr = [
  'كل ما في الباقة الأساسية',
  'تأسيس شركة ذات مسؤولية محدودة (LLC) بعمان',
  'مساعدة في تأشيرة المستثمر والإقامة',
  'مساعدة في فتح الحساب البنكي للشركة',
  'إعداد موقع مكتب حقيقي',
  'صياغة عقد التأسيس واللوائح التجارية',
  'دعم واتساب + هاتف',
  'مكالمة تأهيلية 30 دقيقة',
]

export default function Pricing() {
  const { t, lang } = useLang()
  const p = t.pricing
  const isAr = lang === 'ar'

  const [region, setRegion] = useState<'us' | 'uk' | 'uae' | 'oman'>('us')

  const premiumMagnetic = useMagneticButton()

  /* ── DB-backed pricing ── */
  const { pricing } = usePricingConfig()
  const basicRecord = pricing[region]?.basic ?? null
  const premiumRecord = pricing[region]?.premium ?? null

  const basicPriceNum = resolvePrice(basicRecord, region, 'basic')
  const premiumPriceNum = resolvePrice(premiumRecord, region, 'premium')
  const basicPrice = `$${basicPriceNum}`
  const premiumPrice = `$${premiumPriceNum}`

  const staticBasicFeatures =
    region === 'us'
      ? (isAr ? usBasicFeaturesAr : usBasicFeatures)
      : region === 'uk'
      ? (isAr ? ukBasicFeaturesAr : ukBasicFeatures)
      : region === 'uae'
      ? (isAr ? uaeBasicFeaturesAr : uaeBasicFeatures)
      : (isAr ? omanBasicFeaturesAr : omanBasicFeatures)

  const staticPremiumFeatures =
    region === 'us'
      ? (isAr ? usPremiumFeaturesAr : usPremiumFeatures)
      : region === 'uk'
      ? (isAr ? ukPremiumFeaturesAr : ukPremiumFeatures)
      : region === 'uae'
      ? (isAr ? uaePremiumFeaturesAr : uaePremiumFeatures)
      : (isAr ? omanPremiumFeaturesAr : omanPremiumFeatures)

  const basicFeatures = (isAr ? basicRecord?.features_ar : basicRecord?.features_en)?.length
    ? (isAr ? basicRecord!.features_ar : basicRecord!.features_en)
    : staticBasicFeatures
  const premiumFeatures = (isAr ? premiumRecord?.features_ar : premiumRecord?.features_en)?.length
    ? (isAr ? premiumRecord!.features_ar : premiumRecord!.features_en)
    : staticPremiumFeatures

  const regionSubLabel =
    region === 'us'
      ? (isAr ? 'شركة أمريكية LLC' : 'US LLC')
      : region === 'uk'
      ? (isAr ? 'شركة بريطانية LTD' : 'UK LTD')
      : region === 'uae'
      ? (isAr ? 'شركة إماراتية' : 'UAE Company')
      : (isAr ? 'شركة عمانية' : 'Oman Company')

  const basicTitle =
    region === 'us'
      ? (isAr ? 'تأسيس شركة LLC أمريكية' : 'US LLC Formation')
      : region === 'uk'
      ? (isAr ? 'تأسيس شركة LTD بريطانية' : 'UK LTD Formation')
      : region === 'uae'
      ? (isAr ? 'تأسيس منطقة حرة بالامارات' : 'UAE Freezone Setup')
      : (isAr ? 'تأسيس شركة الشخص الواحد بعمان' : 'Oman SPC Setup')

  const premiumTitle =
    region === 'us'
      ? (isAr ? 'باقة LLC أمريكية مميزة' : 'US LLC Premium')
      : region === 'uk'
      ? (isAr ? 'باقة LTD بريطانية مميزة' : 'UK LTD Premium')
      : region === 'uae'
      ? (isAr ? 'تأسيس بر رئيسي بالإمارات' : 'UAE Mainland Setup')
      : (isAr ? 'تأسيس شركة LLC بعمان' : 'Oman LLC Setup')

  const basicDesc =
    region === 'us'
      ? (isAr ? 'كل ما تحتاجه لتأسيس شركتك الأمريكية والبدء بالعمل.' : 'Everything you need to launch your US company.')
      : region === 'uk'
      ? (isAr ? 'كل ما تحتاجه لتأسيس شركتك البريطانية والبدء بالعمل.' : 'Everything you need to launch your UK company.')
      : region === 'uae'
      ? (isAr ? 'تأسيس كامل للشركة في منطقة حرة بالإمارات مع رخصة.' : 'Everything you need to launch your UAE Freezone company.')
      : (isAr ? 'تأسيس شركة الشخص الواحد في سلطنة عمان متكاملة.' : 'Everything you need to launch your Oman SPC company.')

  const premiumDesc =
    region === 'us'
      ? (isAr ? 'دعم متكامل يشمل الرقم الضريبي والعنوان الفعلي والحساب البنكي.' : 'Premium support with EIN, mailing address & bank setup.')
      : region === 'uk'
      ? (isAr ? 'دعم متكامل يشمل عنوان المدير والحساب البنكي وإرسال التقارير.' : 'Premium support with director privacy & bank setup.')
      : region === 'uae'
      ? (isAr ? 'دعم شامل لتأشيرة المستثمر والإقامة وفتح الحساب البنكي.' : 'Premium support with investor visa, residency & corporate bank.')
      : (isAr ? 'دعم شامل لتأسيس شركة ذات مسؤولية محدودة وعقد التأسيس.' : 'Premium support with LLC bylaws, investor visa & corporate bank.')

  const renewalText =
    region === 'us'
      ? (isAr ? '+ 99$/سنة تجديد الوكيل المسجل' : '+ $99/yr registered agent renewal')
      : region === 'uk'
      ? (isAr ? '+ 89$/سنة تجديد العنوان المسجل' : '+ $89/yr registered office renewal')
      : region === 'uae'
      ? (isAr ? '+ 120$/سنة خدمات تجديد الرخص' : '+ $120/yr license renewal assistance')
      : (isAr ? '+ 150$/سنة خدمات تجديد السجل' : '+ $150/yr registry renewal assistance')

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
          <h2
            className="text-4xl sm:text-[54px] font-bold text-[#0F172A] leading-tight tracking-tight mb-4"
            style={{ fontFamily: 'Sora, Inter, sans-serif' }}
          >
            {p.heading}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-slate-500 max-w-2xl mx-auto mb-10">
            {p.subheading}
          </p>

          {/* Region Tabs (US, UK, UAE, Oman) */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex flex-wrap justify-center bg-white border border-gray-200 shadow-sm rounded-[20px] p-1.5 gap-1.5 max-w-full">
              <button
                onClick={() => setRegion('us')}
                className={`flex items-center justify-center px-6 py-2.5 rounded-[15px] text-sm font-semibold transition-all duration-200 ${
                  region === 'us'
                    ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {isAr ? 'أمريكا LLC' : 'US LLC'}
              </button>
              <button
                onClick={() => setRegion('uk')}
                className={`flex items-center justify-center px-6 py-2.5 rounded-[15px] text-sm font-semibold transition-all duration-200 ${
                  region === 'uk'
                    ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {isAr ? 'بريطانيا LTD' : 'UK LTD'}
              </button>
              <button
                onClick={() => setRegion('uae')}
                className={`flex items-center justify-center px-6 py-2.5 rounded-[15px] text-sm font-semibold transition-all duration-200 ${
                  region === 'uae'
                    ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {isAr ? 'الإمارات' : 'UAE'}
              </button>
              <button
                onClick={() => setRegion('oman')}
                className={`flex items-center justify-center px-6 py-2.5 rounded-[15px] text-sm font-semibold transition-all duration-200 ${
                  region === 'oman'
                    ? 'bg-[#2563EB] text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                }`}
              >
                {isAr ? 'سلطنة عمان' : 'Oman'}
              </button>
            </div>
          </div>
        </div>

        {/* ── 3 Cards Grid ───────────────────────────────────────────────────── */}
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
              {basicTitle}
            </h3>
            <div className="mb-1 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-[#0F172A]" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
                {basicPrice}
              </span>
              <span className="text-slate-400 text-sm">{isAr ? '/ دفعة واحدة' : '/ one-time'}</span>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              {renewalText}
            </p>
            <p className="text-sm text-slate-500 mb-6">
              {basicDesc}
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
                {premiumTitle}
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
                {region === 'us' || region === 'uk' ? (isAr ? '+ 99$/سنة تجديد العنوان الفعلي' : '+ $99/yr office renewal') : (isAr ? '+ تجديد سنوي مرن' : '+ flexible annual renewal')}
              </p>
              <p className="text-white/60 text-sm mb-6">
                {premiumDesc}
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

          {/* Card 3: Consultation / Need Something Custom */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            onMouseMove={handleMouseMove}
            className="spotlight-card bg-white rounded-[24px] border border-gray-200 p-9 flex flex-col relative"
            style={{ boxShadow: '0 4px 24px rgba(15,23,42,0.06)' }}
          >
            <div className="text-xs text-slate-400 font-medium mb-2">{isAr ? '💬 استشارة مجانية' : '💬 Free Consultation'}</div>
            <h3 className="text-xl font-bold text-[#0F172A] mb-4" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
              {isAr ? 'هل تحتاج شيئاً مخصصاً؟' : 'Need Something Custom?'}
            </h3>
            <div className="mb-3 flex items-baseline gap-1">
              <span className="text-4xl font-extrabold text-[#0F172A]" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
                {isAr ? 'مخصص' : 'Tailored'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              {isAr ? 'حلول خاصة بالشركات والمشاريع الكبيرة' : 'Solutions tailored for startups & enterprises'}
            </p>
            <p className="text-sm text-slate-500 mb-8 leading-relaxed">
              {isAr
                ? 'تواصل مع خبراء التأسيس لدينا لمناقشة الهياكل الضريبية المعقدة أو المتطلبات الخاصة لعملك.'
                : 'Connect with our formation experts to discuss custom structures, tax compliance, or specific corporate needs.'}
            </p>

            <a
              href="https://cal.com/instant-grow-llc/15min"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full border-2 border-blue-500 text-blue-600 font-semibold py-4 rounded-2xl hover:bg-blue-50/50 hover:border-blue-600 transition-all duration-200 mb-7 text-sm"
            >
              <Phone size={14} className="shrink-0" />
              {isAr ? 'احجز استشارة مجانية' : 'Book a Free Call'}
            </a>

            <ul className="space-y-3 flex-1 text-slate-600 text-sm">
              <li className="flex items-center gap-2.5">
                <Check size={14} className="text-emerald-500" />
                {isAr ? 'مكالمة فيديو مجانية 15 دقيقة' : 'Free 15-minute video call'}
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={14} className="text-emerald-500" />
                {isAr ? 'تحليل هيكل الضرائب والرسوم' : 'Tax & fee structure analysis'}
              </li>
              <li className="flex items-center gap-2.5">
                <Check size={14} className="text-emerald-500" />
                {isAr ? 'تأسيس فروع الشركات الأجنبية' : 'Foreign subsidiary setup'}
              </li>
            </ul>
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

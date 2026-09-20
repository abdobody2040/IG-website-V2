import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, Phone, Info, ShieldAlert } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import { useMagneticButton } from '../hooks/useMagneticButton'
import { usePricingConfig, resolvePrice } from '../hooks/usePricingConfig'
import { injectJsonLd, generateProductSchema } from '../lib/seo'
import { MASTER_PRICING, MASTER_TIMELINES } from '../config/pricingMaster'

/* ─── US LLC features ──────────────────────────────────────────────────────── */
const usBasicFeatures = MASTER_PRICING.us.basic.inclusions
const usPremiumFeatures = MASTER_PRICING.us.premium.inclusions

/* ─── UK LTD features ──────────────────────────────────────────────────────── */
const ukBasicFeatures = MASTER_PRICING.uk.basic.inclusions
const ukPremiumFeatures = MASTER_PRICING.uk.premium.inclusions

/* ─── UAE features ─────────────────────────────────────────────────────────── */
const uaeBasicFeatures = MASTER_PRICING.uae.basic.inclusions
const uaePremiumFeatures = MASTER_PRICING.uae.premium.inclusions

/* ─── Oman features ────────────────────────────────────────────────────────── */
const omanBasicFeatures = MASTER_PRICING.oman.basic.inclusions
const omanPremiumFeatures = MASTER_PRICING.oman.premium.inclusions

/* ─── Arabic features ─────────────────────────────────────────────────────── */
const usBasicFeaturesAr = MASTER_PRICING.us.basic.inclusionsAr
const usPremiumFeaturesAr = MASTER_PRICING.us.premium.inclusionsAr
const ukBasicFeaturesAr = MASTER_PRICING.uk.basic.inclusionsAr
const ukPremiumFeaturesAr = MASTER_PRICING.uk.premium.inclusionsAr
const uaeBasicFeaturesAr = MASTER_PRICING.uae.basic.inclusionsAr
const uaePremiumFeaturesAr = MASTER_PRICING.uae.premium.inclusionsAr
const omanBasicFeaturesAr = MASTER_PRICING.oman.basic.inclusionsAr
const omanPremiumFeaturesAr = MASTER_PRICING.oman.premium.inclusionsAr


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

  useEffect(() => {
    const regionNames: Record<string, string> = {
      us: 'US LLC Formation',
      uk: 'UK LTD Formation',
      uae: 'UAE Freezone Formation',
      oman: 'Oman SPC Formation',
    }
    const name = regionNames[region] || 'Company Formation'
    const schema = {
      '@context': 'https://schema.org',
      '@graph': [
        generateProductSchema({
          name: `${name} — Basic Plan`,
          description: `Form your company with our Basic ${name} package.`,
          price: basicPriceNum,
          currency: 'USD',
        }),
        generateProductSchema({
          name: `${name} — Premium Plan`,
          description: `Priority ${name} package with full banking & compliance setup.`,
          price: premiumPriceNum,
          currency: 'USD',
        }),
      ],
    }
    injectJsonLd(schema)
  }, [region, basicPriceNum, premiumPriceNum])

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
      <div className="max-w-[1280px] mx-auto">

        {/* Header */}
        <div className="text-center mb-12">
          <h2
            className="ig-heading text-[#0F172A] mb-4"
          >
            {p.heading}
          </h2>
          <p className="ig-body text-slate-500 max-w-2xl mx-auto mb-10">
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto items-stretch pt-6 pb-6">

          {/* Card 1: Basic */}
          <motion.div
            key={`basic-${region}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            onMouseMove={handleMouseMove}
            className="spotlight-card bg-white rounded-[24px] border border-gray-200 p-6 sm:p-9 flex flex-col relative"
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

          <motion.div
            key={`premium-${region}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="relative rounded-[24px] overflow-hidden flex flex-col scale-100 lg:scale-[1.08] z-[1] lg:z-[2]"
            style={{
              background: '#0F172A',
              boxShadow: '0 0 0 2px #2563EB, 0 35px 90px rgba(37,99,235,0.35), 0 0 50px rgba(37,99,235,0.25)',
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

            <div className="px-6 pb-6 pt-5 sm:px-9 sm:pb-9 sm:pt-7 flex flex-col flex-1">
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
            key={`consultation-${region}`}
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            onMouseMove={handleMouseMove}
            className="spotlight-card bg-white rounded-[24px] border border-gray-200 p-6 sm:p-9 flex flex-col relative"
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

        {/* ── All-In Pricing & Statutory Fees Transparency Section ── */}
        <div className="mt-12 bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-sm">
          <div className="flex items-center gap-2.5 mb-4 text-[#0F172A]">
            <Info size={20} className="text-blue-600 shrink-0" />
            <h4 className="text-lg font-bold" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
              {isAr ? 'تفاصيل الرسوم الحكومية وتكاليف التجديد بشفافية' : 'All-In Fee Transparency & Statutory Costs'}
            </h4>
          </div>
          <p className="text-sm text-slate-500 mb-6">
            {isAr
              ? 'نحن نؤمن بالشفافية الكاملة بدون أي رسوم خفية. أدناه تفاصيل الرسوم الإلزامية التي تفرضها الجهات الحكومية ومواعيد تجديدها السنوية.'
              : 'We believe in 100% price transparency with zero hidden surprises. Below is the statutory breakdown of mandatory government fees and recurring renewal costs.'}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {MASTER_PRICING[region].governmentFees.map((gov, idx) => (
              <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 text-xs text-slate-600 space-y-2">
                <div className="font-bold text-slate-900 text-sm">{isAr ? gov.nameAr : gov.name}</div>
                <div>
                  <span className="font-semibold text-slate-700">{isAr ? 'رسوم التسجيل الأولى: ' : 'Initial Filing: '}</span>
                  {isAr ? gov.initialFeeAr : gov.initialFee}
                </div>
                <div>
                  <span className="font-semibold text-slate-700">{isAr ? 'رسوم التجديد السنوية: ' : 'Annual Renewal: '}</span>
                  {isAr ? gov.annualRenewalFeeAr : gov.annualRenewalFee}
                </div>
                <div className="text-slate-500 pt-1 border-t border-slate-200">
                  {isAr ? gov.deadlineInfoAr : gov.deadlineInfo}
                </div>
                <div className="pt-1">
                  <a href={gov.officialUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center gap-1 font-medium">
                    {isAr ? 'الموقع الرسمي للجهة الحكومية ↗' : 'Official Government Source ↗'}
                  </a>
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start gap-3 text-xs text-amber-900">
            <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">{isAr ? 'تنويه هام حول الجداول الزمنية: ' : 'Official Processing Timelines: '}</span>
              {isAr ? MASTER_TIMELINES.einNonResident.ar : MASTER_TIMELINES.einNonResident.en}
            </div>
          </div>
        </div>

        {/* Bottom note */}
        <p className="text-center text-slate-400 text-sm mt-10">
          {isAr ? 'غير متأكد من الولاية أو الباقة المناسبة؟ ' : 'Not sure which plan or jurisdiction fits your business? '}
          <a href="mailto:support@instantgrow.net" className="text-blue-500 hover:underline font-medium">
            {isAr ? 'تحدث مع فريقنا عبر support@instantgrow.net ←' : 'Contact our team at support@instantgrow.net →'}
          </a>
        </p>
      </div>
    </section>
  )
}

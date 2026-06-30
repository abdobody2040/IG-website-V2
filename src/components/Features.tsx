import { motion } from 'framer-motion'
import { Zap, Globe, Monitor, Shield, CreditCard, RefreshCw } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'

interface FeatureItem {
  Icon: LucideIcon
  color: string
  bg: string
  titleEn: string
  titleAr: string
  descEn: string
  descAr: string
}

const features: FeatureItem[] = [
  {
    Icon: Zap,
    color: '#F59E0B',
    bg: '#FFFBEB',
    titleEn: 'Fast Processing',
    titleAr: 'معالجة سريعة',
    descEn: 'Get started in 1–2 business days.',
    descAr: 'ابدأ خلال 1-2 يوم عمل.',
  },
  {
    Icon: Globe,
    color: '#2563EB',
    bg: '#EFF6FF',
    titleEn: 'Global Coverage',
    titleAr: 'تغطية عالمية',
    descEn: 'We support 50+ countries.',
    descAr: 'ندعم أكثر من 50 دولة.',
  },
  {
    Icon: Monitor,
    color: '#7C3AED',
    bg: '#F5F3FF',
    titleEn: '100% Online',
    titleAr: '100% إلكتروني',
    descEn: 'No paperwork, no hassle.',
    descAr: 'لا ورق، لا متاعب.',
  },
  {
    Icon: Shield,
    color: '#059669',
    bg: '#ECFDF5',
    titleEn: 'Secure & Reliable',
    titleAr: 'آمن وموثوق',
    descEn: 'Your data is safe with us.',
    descAr: 'بياناتك محفوظة معنا.',
  },
  {
    Icon: CreditCard,
    color: '#0284C7',
    bg: '#F0F9FF',
    titleEn: 'Stripe Verified',
    titleAr: 'معتمد من Stripe',
    descEn: 'Stripe-ready setup included.',
    descAr: 'إعداد Stripe مدمج.',
  },
  {
    Icon: RefreshCw,
    color: '#D97706',
    bg: '#FFFBEB',
    titleEn: 'Money-Back Guarantee',
    titleAr: 'ضمان استعادة المبلغ',
    descEn: "Not satisfied? We've got you covered.",
    descAr: 'غير راضٍ؟ نحن نعوضك.',
  },
]

const containerV = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}
const itemV = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] as const } },
}

export default function Features() {
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
  }

  return (
    <section id="features" className="ig-section bg-gradient-to-b from-[#F8FAFC] to-white">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">

        <div className="text-center mb-14">
          <h2
            className="text-4xl sm:text-[54px] font-bold text-[#0F172A] leading-tight tracking-tight mb-4"
            style={{ fontFamily: 'Sora, Inter, sans-serif' }}
          >
            {isAr ? 'لماذا يختار رواد الأعمال' : 'Why Entrepreneurs Choose'}
            <br />
            <span className="text-[#2563EB]">Instant Grow</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            {isAr
              ? 'كل ما تحتاجه للبدء والنمو في مكان واحد'
              : 'Everything you need to start and grow — in one place.'}
          </p>
        </div>

        {/* 6-card grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          variants={containerV}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {features.map((feat, i) => {
            const Icon = feat.Icon
            return (
              <motion.div
                key={i}
                variants={itemV}
                onMouseMove={handleMouseMove}
                className="spotlight-card group bg-white rounded-[24px] border border-gray-100 px-8 py-9 flex items-start gap-5 cursor-default"
                style={{
                  boxShadow: '0 4px 24px rgba(15,23,42,0.06)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
                }}
                whileHover={{
                  y: -6,
                  boxShadow: '0 20px 60px rgba(15,23,42,0.1)',
                  borderColor: 'rgba(37,99,235,0.18)',
                }}
              >
                {/* Icon */}
                <motion.div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: feat.bg }}
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 10 }}
                >
                  <Icon size={26} style={{ color: feat.color }} />
                </motion.div>

                {/* Text */}
                <div>
                  <h3
                    className="text-lg font-bold text-[#0F172A] mb-1.5"
                    style={{ fontFamily: 'Sora, Inter, sans-serif' }}
                  >
                    {isAr ? feat.titleAr : feat.titleEn}
                  </h3>
                  <p className="text-[15px] text-slate-500 leading-relaxed">
                    {isAr ? feat.descAr : feat.descEn}
                  </p>
                </div>
              </motion.div>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

import { motion } from 'framer-motion'
import { ArrowRight, Building2, Landmark, CreditCard, Shield, HeadphonesIcon } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'

const services = [
  {
    icon: Building2,
    color: '#2563EB',
    bg: '#EFF6FF',
    titleEn: 'Company Formation',
    titleAr: 'تأسيس الشركات',
    descEn: 'Form your US LLC, UK LTD & more in 50+ countries.',
    descAr: 'أسس شركتك الأمريكية أو البريطانية وأكثر.',
    href: '/order',
  },
  {
    icon: Landmark,
    color: '#7C3AED',
    bg: '#F5F3FF',
    titleEn: 'Business Banking',
    titleAr: 'الحساب البنكي التجاري',
    descEn: 'Open US business bank accounts remotely.',
    descAr: 'افتح حساباً بنكياً أمريكياً عن بُعد.',
    href: '/#pricing',
  },
  {
    icon: CreditCard,
    color: '#059669',
    bg: '#ECFDF5',
    titleEn: 'Payment Solutions',
    titleAr: 'حلول الدفع',
    descEn: 'Stripe, PayPal & merchant account setup.',
    descAr: 'إعداد Stripe وPayPal والحسابات التجارية.',
    href: '/#pricing',
  },
  {
    icon: Shield,
    color: '#D97706',
    bg: '#FFFBEB',
    titleEn: 'Compliance & EIN',
    titleAr: 'الامتثال والرقم الضريبي',
    descEn: 'EIN, tax compliance, and annual reports.',
    descAr: 'رقم EIN والامتثال الضريبي والتقارير السنوية.',
    href: '/#pricing',
  },
  {
    icon: HeadphonesIcon,
    color: '#0284C7',
    bg: '#F0F9FF',
    titleEn: 'Ongoing Support',
    titleAr: 'الدعم المستمر',
    descEn: 'Dedicated support to keep your business growing.',
    descAr: 'دعم متخصص لمتابعة نمو أعمالك.',
    href: '/#contact',
  },
]

const containerV = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}
const itemV = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] as const } },
}

export default function Services() {
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
  }

  return (
    <section id="services" className="ig-section bg-[#F8FAFC]">
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="text-center mb-14">
          <h2
            className="text-4xl sm:text-[54px] font-bold text-[#0F172A] leading-tight tracking-tight mb-4"
            style={{ fontFamily: 'Sora, Inter, sans-serif' }}
          >
            {isAr ? 'كل ما تحتاجه لإطلاق أعمالك' : 'Everything you need to launch'}
            <br />
            {isAr ? 'وتنمية أعمالك عالمياً' : 'and grow your business globally'}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            {isAr
              ? 'خدمات متكاملة من التأسيس إلى الامتثال المستمر'
              : 'From formation to ongoing compliance — we handle it all so you can focus on growth.'}
          </p>
        </div>

        {/* Cards grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6"
          variants={containerV}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {services.map((svc, i) => {
            const Icon = svc.icon
            return (
              <motion.a
                key={i}
                href={svc.href}
                variants={itemV}
                onMouseMove={handleMouseMove}
                className="spotlight-card group relative bg-white rounded-[24px] border border-gray-100 px-8 py-9 flex flex-col gap-5 cursor-pointer no-underline"
                style={{
                  boxShadow: '0 4px 24px rgba(15,23,42,0.06)',
                  transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
                }}
                whileHover={{
                  y: -8,
                  boxShadow: '0 24px 64px rgba(15,23,42,0.12)',
                  borderColor: 'rgba(37,99,235,0.2)',
                }}
              >
                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{ background: svc.bg }}
                >
                  <Icon size={26} style={{ color: svc.color }} />
                </div>

                {/* Text */}
                <div className="flex-1">
                  <h3 className="text-[18px] font-bold text-[#0F172A] mb-1.5" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
                    {isAr ? svc.titleAr : svc.titleEn}
                  </h3>
                  <p className="text-[15px] text-slate-500 leading-relaxed">
                    {isAr ? svc.descAr : svc.descEn}
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex items-center gap-1.5 text-blue-500 text-xs font-semibold">
                  <span className="group-hover:mr-1 transition-all duration-200">
                    {isAr ? 'اعرف أكثر' : 'Learn more'}
                  </span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                </div>

                {/* Hover border glow */}
                <div className="absolute inset-0 rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ boxShadow: 'inset 0 0 0 1.5px rgba(37,99,235,0.15)' }} />
              </motion.a>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

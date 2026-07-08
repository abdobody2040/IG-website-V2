import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import * as Icons from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import { useServices } from '../hooks/useServices'

const staticServices = [
  {
    icon: 'Building2',
    color: '#2563EB',
    bg_color: '#EFF6FF',
    title_en: 'Company Formation',
    title_ar: 'تأسيس الشركات',
    description_en: 'Form your US LLC, UK LTD & more in 50+ countries.',
    description_ar: 'أسس شركتك الأمريكية أو البريطانية وأكثر.',
    href: '/order',
  },
  {
    icon: 'Landmark',
    color: '#7C3AED',
    bg_color: '#F5F3FF',
    title_en: 'Business Banking',
    title_ar: 'الحساب البنكي التجاري',
    description_en: 'Open US business bank accounts remotely.',
    description_ar: 'افتح حساباً بنكياً أمريكياً عن بُعد.',
    href: '/#pricing',
  },
  {
    icon: 'CreditCard',
    color: '#059669',
    bg_color: '#ECFDF5',
    title_en: 'Payment Solutions',
    title_ar: 'حلول الدفع',
    description_en: 'Stripe, PayPal & merchant account setup.',
    description_ar: 'إعداد Stripe وPayPal والحسابات التجارية.',
    href: '/#pricing',
  },
  {
    icon: 'Shield',
    color: '#D97706',
    bg_color: '#FFFBEB',
    title_en: 'Compliance & EIN',
    title_ar: 'الامتثال والرقم الضريبي',
    description_en: 'EIN, tax compliance, and annual reports.',
    description_ar: 'رقم EIN والامتثال الضريبي والتقارير السنوية.',
    href: '/#pricing',
  },
  {
    icon: 'Headphones',
    color: '#0284C7',
    bg_color: '#F0F9FF',
    title_en: 'Ongoing Support',
    title_ar: 'الدعم المستمر',
    description_en: 'Dedicated support to keep your business growing.',
    description_ar: 'دعم متخصص لمتابعة نمو أعمالك.',
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
  const { services: dbServices } = useServices()

  const activeLanding = dbServices.filter(s => s.active && s.type === 'landing')
  const servicesToRender = activeLanding.length > 0 ? activeLanding : staticServices

  const handleMouseMove = (e: React.MouseEvent<HTMLElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    e.currentTarget.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`)
    e.currentTarget.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`)
  }

  return (
    <section id="services" className="ig-section bg-[#F8FAFC]">
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="text-center mb-10 sm:mb-14">
          <h2
            className="ig-heading text-[#0F172A] mb-4 animate-fade-in"
          >
            {isAr ? 'كل ما تحتاجه لإطلاق أعمالك' : 'Everything you need to launch'}
            <br />
            {isAr ? 'وتنمية أعمالك عالمياً' : 'and grow your business globally'}
          </h2>
          <p className="ig-body text-slate-500 max-w-2xl mx-auto">
            {isAr
              ? 'خدمات متكاملة من التأسيس إلى الامتثال المستمر'
              : 'From formation to ongoing compliance — we handle it all so you can focus on growth.'}
          </p>
        </div>

        {/* Cards grid */}
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6"
          variants={containerV}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-60px' }}
        >
          {servicesToRender.map((svc, i) => {
            const IconComponent = (Icons as any)[svc.icon] || Icons.HelpCircle
            return (
              <motion.a
                key={i}
                href={svc.href}
                variants={itemV}
                onMouseMove={handleMouseMove}
                className="spotlight-card group relative bg-white rounded-[20px] sm:rounded-[24px] border border-gray-100 px-5 py-6 sm:px-8 sm:py-9 flex flex-col gap-4 sm:gap-5 cursor-pointer no-underline"
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
                  className="w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                  style={{ background: svc.bg_color }}
                >
                  <IconComponent size={20} className="sm:hidden" style={{ color: svc.color }} />
                  <IconComponent size={26} className="hidden sm:block" style={{ color: svc.color }} />
                </div>

                {/* Text */}
                <div className="flex-1">
                  <h3 className="text-base sm:text-[18px] font-bold text-[#0F172A] mb-1.5" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
                    {isAr ? svc.title_ar : svc.title_en}
                  </h3>
                  <p className="text-[13px] sm:text-[15px] text-slate-500 leading-relaxed">
                    {isAr ? svc.description_ar : svc.description_en}
                  </p>
                </div>

                {/* Arrow */}
                <div className="flex items-center gap-1.5 text-blue-500 text-xs font-semibold mt-auto pt-2">
                  <span className="group-hover:mr-1 transition-all duration-200">
                    {isAr ? 'اعرف أكثر' : 'Learn more'}
                  </span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-200" />
                </div>

                {/* Hover border glow */}
                <div className="absolute inset-0 rounded-[20px] sm:rounded-[24px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ boxShadow: 'inset 0 0 0 1.5px rgba(37,99,235,0.15)' }} />
              </motion.a>
            )
          })}
        </motion.div>
      </div>
    </section>
  )
}

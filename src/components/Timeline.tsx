import { motion } from 'framer-motion'
import { FileText, Shield, Landmark, Check } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'

const timelineSteps = [
  {
    day: 'Day 1',
    dayAr: 'اليوم 1',
    label: 'Submit Your Info',
    labelAr: 'أرسل بياناتك',
    type: 'outlined',
    icon: 'file',
  },
  {
    day: 'Day 2',
    dayAr: 'اليوم 2',
    label: 'LLC Approved & Documents',
    labelAr: 'اعتماد الشركة والمستندات',
    type: 'filled',
    icon: 'check',
  },
  {
    day: 'Day 4',
    dayAr: 'اليوم 4',
    label: 'EIN Issued',
    labelAr: 'إصدار الرقم الضريبي',
    type: 'outlined',
    icon: 'shield',
  },
  {
    day: 'Day 6',
    dayAr: 'اليوم 6',
    label: 'Bank Account Assistance',
    labelAr: 'مساعدة فتح الحساب البنكي',
    type: 'outlined',
    icon: 'bank',
  },
  {
    day: 'Day 8',
    dayAr: 'اليوم 8',
    label: 'Stripe Account Ready',
    labelAr: 'حساب Stripe جاهز',
    type: 'filled',
    icon: 'stripe',
  },
]

export default function Timeline() {
  const { lang } = useLang()
  const isAr = lang === 'ar'

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case 'file':
        return <FileText className="w-6 h-6 text-[#1A56FF]" />
      case 'check':
        return <Check className="w-7 h-7 text-emerald-400 stroke-[3px]" />
      case 'shield':
        return (
          <div className="relative flex items-center justify-center">
            <Shield className="w-6 h-6 text-[#1A56FF]" />
            <span className="absolute text-[8px] text-[#1A56FF] font-bold pb-0.5">★</span>
          </div>
        )
      case 'bank':
        return <Landmark className="w-6 h-6 text-[#1A56FF]" />
      case 'stripe':
        return (
          <span className="text-white font-extrabold text-2xl select-none" style={{ fontFamily: 'system-ui, sans-serif' }}>
            S
          </span>
        )
      default:
        return null
    }
  }

  const lineStyle = isAr
    ? { right: '-40px', left: '10%' }
    : { left: '-40px', right: '10%' }

  return (
    <section id="timeline" className="ig-section bg-white py-20">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">

        <div className="text-center mb-16">
          <h2
            className="text-3xl sm:text-[42px] font-bold text-[#0F172A] leading-tight tracking-tight mb-3"
            style={{ fontFamily: 'Sora, Inter, sans-serif' }}
          >
            {isAr ? 'من البداية إلى النجاح في أيام معدودة' : 'From Start to Success in Just Days'}
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
            {isAr
              ? 'خط زمني بسيط لإطلاق عملك التجاري.'
              : 'A simple timeline to launch your business.'}
          </p>
        </div>

        {/* Mascot + Timeline row */}
        <div className="flex flex-col lg:flex-row items-center gap-14">

          {/* Mascot — left */}
          <motion.div
            className="hidden lg:flex flex-col items-center shrink-0 w-56 xl:w-64"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <motion.div
              animate={{ y: [-8, 6, -8] }}
              transition={{ duration: 5.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-full"
            >
              <img
                src="/mascot-timeline.png"
                alt="Instant Grow Mascot"
                className={`w-full h-auto drop-shadow-xl ${isAr ? 'scale-x-[-1]' : ''}`}
              />
            </motion.div>
          </motion.div>

          {/* Timeline steps */}
          <div className="flex-1 w-full relative">
            {/* Vertical connector line (mobile only) */}
            <div className="lg:hidden absolute left-[40px] rtl:left-auto rtl:right-[40px] top-[40px] bottom-[40px] border-l-2 border-dashed border-blue-200 z-0" />

            {/* Horizontal connector line (desktop only) */}
            <div
              className="hidden lg:block absolute top-[40px] h-0.5 border-t border-dashed border-blue-200 z-0"
              style={lineStyle}
            />

            {/* Steps */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-y-10 gap-x-6 relative z-10">
              {timelineSteps.map((step, i) => {
                const isFilled = step.type === 'filled'
                return (
                  <motion.div
                    key={i}
                    className="flex flex-row lg:flex-col items-center lg:items-center gap-5 lg:gap-4 lg:text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* Circle with icon */}
                    <div className="relative shrink-0">
                      <div
                        className={`w-20 h-20 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                          isFilled
                            ? 'bg-[#1A56FF] border-transparent shadow-[0_8px_30px_rgba(26,86,255,0.15)]'
                            : 'bg-white border-slate-100 shadow-[0_8px_30px_rgba(0,0,0,0.03)]'
                        }`}
                      >
                        {renderIcon(step.icon)}
                      </div>
                    </div>

                    {/* Text block */}
                    <div className="flex flex-col lg:items-center">
                      {/* Day Pill */}
                      <span className="inline-flex items-center justify-center bg-[#E8EDFF] text-[#1A56FF] font-bold text-xs px-3.5 py-1 rounded-full mb-2 w-fit">
                        {isAr ? step.dayAr : step.day}
                      </span>
                      {/* Label */}
                      <p className="text-sm font-bold text-[#0F172A] leading-snug max-w-[150px] lg:max-w-none">
                        {isAr ? step.labelAr : step.label}
                      </p>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

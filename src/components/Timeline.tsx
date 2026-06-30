import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { FileText, CheckCircle, Hash, Landmark, Zap } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import TransparentMascot from './TransparentMascot'

const timelineSteps = [
  {
    day: 'Day 1',
    dayAr: 'اليوم 1',
    label: 'Submit Your Info',
    labelAr: 'تقديم معلوماتك',
    icon: FileText,
    color: '#2563EB',
    bg: '#EFF6FF',
    done: true,
  },
  {
    day: 'Day 2',
    dayAr: 'اليوم 2',
    label: 'LLC Approved & Documents',
    labelAr: 'اعتماد الشركة والمستندات',
    icon: CheckCircle,
    color: '#7C3AED',
    bg: '#F5F3FF',
    done: true,
  },
  {
    day: 'Day 4',
    dayAr: 'اليوم 4',
    label: 'EIN Issued',
    labelAr: 'إصدار الرقم الضريبي',
    icon: Hash,
    color: '#059669',
    bg: '#ECFDF5',
    done: true,
  },
  {
    day: 'Day 6',
    dayAr: 'اليوم 6',
    label: 'Bank Account Assistance',
    labelAr: 'مساعدة فتح الحساب البنكي',
    icon: Landmark,
    color: '#D97706',
    bg: '#FFFBEB',
    done: false,
  },
  {
    day: 'Day 8',
    dayAr: 'اليوم 8',
    label: 'Stripe Account Ready',
    labelAr: 'حساب Stripe جاهز',
    icon: Zap,
    color: '#0284C7',
    bg: '#F0F9FF',
    done: false,
  },
]

export default function Timeline() {
  const { lang } = useLang()
  const isAr = lang === 'ar'
  const lineRef = useRef<HTMLDivElement>(null)
  const inView = useInView(lineRef, { once: true, margin: '-100px' })

  return (
    <section id="timeline" className="ig-section bg-white">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">

        <div className="text-center mb-14">
          <h2
            className="text-4xl sm:text-[54px] font-bold text-[#0F172A] leading-tight tracking-tight mb-4"
            style={{ fontFamily: 'Sora, Inter, sans-serif' }}
          >
            {isAr ? 'من البداية إلى النجاح في أيام' : 'From Start to Success in Just Days'}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-slate-500 max-w-xl mx-auto">
            {isAr
              ? 'خط زمني لإطلاق عملك التجاري'
              : 'A step-by-step timeline to launch your business'}
          </p>
        </div>

        {/* Mascot + Timeline row */}
        <div className="flex flex-col lg:flex-row items-center gap-14">

          {/* Mascot — left (increased by 20%) */}
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
              <TransparentMascot
                src="/mascot-timeline.png"
                alt="Instant Grow Mascot"
                className="w-full h-auto drop-shadow-xl"
              />
            </motion.div>
          </motion.div>

          {/* Timeline steps */}
          <div className="flex-1 relative">
            {/* Vertical connector line (mobile) */}
            <div className="lg:hidden absolute left-[27px] top-0 bottom-0 w-1 bg-gray-200" ref={lineRef}>
              <motion.div
                className="w-full rounded-full origin-top"
                style={{ background: 'linear-gradient(180deg, #2563EB, #7C3AED, #059669, #D97706, #0284C7)', height: '100%' }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: inView ? 1 : 0 }}
                transition={{ duration: 1.5, delay: 0.2, ease: 'easeOut' }}
              />
            </div>

            {/* Horizontal connector line (desktop) */}
            <div className="hidden lg:block absolute top-[28px] left-[28px] right-[28px] h-1 bg-gray-200" ref={lineRef}>
              <motion.div
                className="h-full rounded-full origin-left"
                style={{ background: 'linear-gradient(90deg, #2563EB, #7C3AED, #059669, #D97706, #0284C7)' }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: inView ? 1 : 0 }}
                transition={{ duration: 1.5, delay: 0.2, ease: 'easeOut' }}
              />
            </div>

            {/* Steps */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-6 relative z-10">
              {timelineSteps.map((step, i) => {
                const Icon = step.icon
                return (
                  <motion.div
                    key={i}
                    className="flex flex-row lg:flex-col items-start lg:items-center gap-5 lg:gap-4 lg:text-center"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  >
                    {/* Circle with icon */}
                    <div className="relative shrink-0">
                      <div
                        className="w-14 h-14 rounded-full flex items-center justify-center border-2"
                        style={{
                          background: step.done ? step.color : '#fff',
                          borderColor: step.color,
                        }}
                      >
                        <Icon size={22} color={step.done ? '#fff' : step.color} />
                      </div>
                      {/* Pulse ring for active */}
                      {i === 3 && (
                        <span className="absolute -inset-2 rounded-full border-2 opacity-35 animate-ping"
                          style={{ borderColor: step.color, animationDuration: '2s' }} />
                      )}
                    </div>

                    {/* Text */}
                    <div>
                      <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: step.color }}>
                        {isAr ? step.dayAr : step.day}
                      </p>
                      <p className="text-[15px] font-semibold text-[#0F172A] leading-snug">
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

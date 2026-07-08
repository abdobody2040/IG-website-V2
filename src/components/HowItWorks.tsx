import { motion } from 'framer-motion'
import { MousePointerClick, FileCheck, ShieldCheck, BadgeCheck, ChevronRight, ChevronLeft } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'

const stepIcons = [MousePointerClick, FileCheck, ShieldCheck, BadgeCheck]

export default function HowItWorks() {
  const { t, lang } = useLang()
  const h = t.howItWorks
  const isAr = lang === 'ar'
  const steps = h.steps.slice(0, 4)

  const arrowStyle = isAr
    ? { right: 'calc(50% + 48px + 12px)', left: 'auto' }
    : { left: 'calc(50% + 48px + 12px)', right: 'auto' }

  return (
    <section id="how-it-works" className="ig-section bg-white py-20">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">

        <div className="text-center mb-10 sm:mb-16">
          <h2
            className="text-[28px] sm:text-[38px] lg:text-[42px] font-bold text-[#0F172A] leading-tight tracking-tight mb-3"
            style={{ fontFamily: 'Sora, Inter, sans-serif' }}
          >
            {h.heading}
          </h2>
          <p className="text-sm sm:text-base text-slate-500 max-w-xl mx-auto">
            {h.subheading}
          </p>
        </div>

        {/* Steps + Mascot row */}
        <div className="flex flex-col lg:flex-row items-center lg:items-start gap-10 lg:gap-8">
          {/* Steps grid */}
          <div className="flex-1 w-full relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-y-8 sm:gap-y-12 gap-x-4 sm:gap-x-6 relative z-10">
              {steps.map((step, i) => {
                const Icon = stepIcons[i] ?? BadgeCheck
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="group flex flex-col items-center text-center relative"
                    whileHover={{ y: -4 }}
                  >
                    {/* Icon circle */}
                    <div className="w-16 h-16 sm:w-24 sm:h-24 rounded-full bg-white border border-slate-100 flex items-center justify-center mb-4 sm:mb-6 relative z-10 transition-all duration-300 group-hover:border-blue-200 group-hover:shadow-[0_12px_40px_rgba(26,86,255,0.06)] shadow-[0_8px_30px_rgba(0,0,0,0.03)]">
                      <Icon className="w-6 h-6 sm:w-9 sm:h-9 text-[#1A56FF]" />
                    </div>

                    {/* Step number badge & Title */}
                    <div className="flex items-center gap-2 mb-2 sm:mb-3">
                      <span className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#E8EDFF] text-[#1A56FF] font-bold text-[10px] sm:text-xs flex items-center justify-center shrink-0">
                        {i + 1}
                      </span>
                      <h3 className="text-sm sm:text-base font-bold text-[#0F172A]" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
                        {step.title}
                      </h3>
                    </div>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed max-w-[200px] sm:max-w-none lg:max-w-[200px]">
                      {step.description}
                    </p>

                    {/* Connector Arrow (desktop only) */}
                    {i < 3 && (
                      <div
                        className="hidden lg:flex absolute items-center w-[calc(100%-96px)]"
                        style={{
                          top: '48px', // center of the 96px circle
                          transform: 'translateY(-50%)',
                          ...arrowStyle,
                        }}
                      >
                        <div className="flex-1 border-t-2 border-dashed border-blue-200" />
                        {isAr ? (
                          <ChevronLeft size={14} className="text-blue-400 -mr-1 shrink-0" />
                        ) : (
                          <ChevronRight size={14} className="text-blue-400 -ml-1 shrink-0" />
                        )}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Mascot (leave as is) */}
          <motion.div
            className="hidden lg:flex items-end justify-center w-56 xl:w-64 shrink-0 self-end"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <motion.div
              animate={{ y: [-8, 6, -8] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-full"
            >
              <img
                src="/mascot-how-it-works.png"
                alt="Instant Grow Mascot"
                className="w-full h-auto drop-shadow-xl"
              />
            </motion.div>
          </motion.div>
        </div>

      </div>
    </section>
  )
}

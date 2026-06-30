import { motion, useInView } from 'framer-motion'
import { useRef } from 'react'
import { ArrowRight, MousePointer, FileText, Settings, CheckCircle } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'

const stepIcons = [MousePointer, FileText, Settings, CheckCircle]
const stepColors = ['#2563EB', '#7C3AED', '#059669', '#D97706']
const stepBgs = ['#EFF6FF', '#F5F3FF', '#ECFDF5', '#FFFBEB']

export default function HowItWorks() {
  const { t, lang } = useLang()
  const h = t.howItWorks
  const isAr = lang === 'ar'
  const steps = h.steps.slice(0, 4)
  const lineRef = useRef<HTMLDivElement>(null)
  const inView = useInView(lineRef, { once: true, margin: '-100px' })

  const stepTitlesEn = [
    'Choose Your Service',
    'Submit Your Info',
    'We Handle The Rest',
    "You're Ready!",
  ]
  const stepDescsEn = [
    'Select the service that fits your needs.',
    'We collect your information securely.',
    'Our experts process your application.',
    'Receive your documents and start your business.',
  ]

  return (
    <section id="how-it-works" className="ig-section bg-white">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">

        {/* Header */}
        <div className="text-center mb-16">
          <span className="ig-label">{h.label}</span>
          <h2
            className="text-4xl sm:text-[54px] font-bold text-[#0F172A] leading-tight tracking-tight mb-4"
            style={{ fontFamily: 'Sora, Inter, sans-serif' }}
          >
            {isAr ? 'كيف يعمل النظام' : 'How It Works'}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-slate-500 max-w-xl mx-auto">
            {isAr
              ? 'احصل على عملك وشغّله في 4 خطوات بسيطة'
              : 'Get your business up and running in 4 simple steps'}
          </p>
        </div>

        {/* Steps + Mascot row */}
        <div className="flex flex-col lg:flex-row items-start gap-12">
          {/* Steps grid */}
          <div className="flex-1 relative">
            {/* Animated connector line (desktop) */}
            <div ref={lineRef} className="hidden lg:block absolute top-[58px] left-[calc(12.5%+24px)] right-[calc(12.5%+24px)] h-1 bg-gray-100 z-0">
              <motion.div
                className="h-full rounded-full origin-left"
                style={{ background: 'linear-gradient(90deg, #2563EB, #7C3AED, #059669, #D97706)' }}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: inView ? 1 : 0 }}
                transition={{ duration: 1.2, delay: 0.3, ease: 'easeOut' }}
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
              {steps.map((step, i) => {
                const Icon = stepIcons[i] ?? CheckCircle
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: '-40px' }}
                    transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                    className="group bg-white rounded-[24px] border border-gray-100 px-8 py-9 flex flex-col items-center text-center relative"
                    style={{ boxShadow: '0 4px 24px rgba(15,23,42,0.06)', transition: 'transform 0.3s ease, box-shadow 0.3s ease' }}
                    whileHover={{ y: -6, boxShadow: '0 20px 60px rgba(15,23,42,0.1)' }}
                  >
                    {/* Step number badge */}
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-white text-base font-bold mb-5 shrink-0 relative z-10"
                      style={{ background: stepColors[i] }}
                    >
                      {`0${i + 1}`}
                    </div>

                    {/* Icon */}
                    <div
                      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                      style={{ background: stepBgs[i] }}
                    >
                      <Icon size={26} style={{ color: stepColors[i] }} />
                    </div>

                    <h3 className="text-base font-bold text-[#0F172A] mb-2.5" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
                      {isAr ? step.title : (stepTitlesEn[i] ?? step.title)}
                    </h3>
                    <p className="text-sm text-slate-500 leading-relaxed">
                      {isAr ? step.description : (stepDescsEn[i] ?? step.description)}
                    </p>

                    {/* Arrow (not last) */}
                    {i < steps.length - 1 && (
                      <div className="hidden lg:flex absolute -right-3 top-14 z-20 w-6 h-6 bg-white rounded-full border border-gray-100 items-center justify-center shadow-sm">
                        <ArrowRight size={12} className="text-slate-400" />
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>

          {/* Mascot — desktop only (increased by 20%) */}
          <motion.div
            className="hidden lg:flex items-end justify-center w-56 xl:w-64 shrink-0 self-end"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.7 }}
          >
            <motion.img
              src="/mascot.png"
              alt="Instant Grow Mascot"
              className="w-full h-auto drop-shadow-xl mix-blend-multiply"
              animate={{ y: [-8, 6, -8] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          </motion.div>
        </div>

        {/* CTA */}
        <motion.div
          className="flex justify-center mt-12"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
        >
          <a
            href="/order"
            className="shimmer-btn inline-flex items-center gap-2 bg-[#2563EB] text-white font-semibold text-base px-8 py-4 rounded-2xl hover:bg-[#1d4ed8] transition-all duration-200 shadow-[0_4px_24px_rgba(37,99,235,0.3)] hover:shadow-[0_8px_32px_rgba(37,99,235,0.4)] hover:-translate-y-0.5 group"
          >
            {isAr ? 'ابدأ الآن' : h.getStarted}
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

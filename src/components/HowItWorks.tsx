import { motion } from 'framer-motion'
import { ArrowRight, Search, FileCheck, Download, Zap, Shield, CheckCircle } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'

const stepIcons = [Search, FileCheck, Download]

const trustData = [
  { icon: Zap, label: 'Fast Filing', labelAr: 'تأسيس سريع' },
  { icon: Shield, label: 'Compliance Support', labelAr: 'دعم الامتثال' },
  { icon: CheckCircle, label: 'Expert Guidance', labelAr: 'إرشاد الخبراء' },
]

export default function HowItWorks() {
  const { t, lang } = useLang()
  const h = t.howItWorks
  const steps = h.steps.slice(0, 3)

  return (
    <section id="how-it-works" className="py-10 bg-[#f8f9fa]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-1">
          <span className="text-blue-500 text-xs font-semibold uppercase tracking-wider">
            {h.label}
          </span>
        </div>

        <h2
          className="text-2xl sm:text-3xl font-bold text-[#0a0a0f] text-center mb-6"
          style={{ fontFamily: 'Sora, Inter, sans-serif' }}
        >
          {h.heading}
        </h2>

        <div className="relative">
          <div className="hidden lg:block absolute top-[52px] left-[calc(16.66%+20px)] right-[calc(16.66%+20px)] h-px bg-gradient-to-r from-blue-200 via-blue-400 to-blue-200" />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 sm:gap-4">
            {steps.map((step, i) => {
              const Icon = stepIcons[i] || Search
              return (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 12 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  className="group relative bg-white rounded-2xl border border-gray-100 p-4 sm:p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="flex items-start gap-3 sm:gap-4">
                    <span className="inline-flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 text-white text-xs font-bold shrink-0 shadow-sm shadow-blue-200/40">
                      {`0${i + 1}`}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="w-6 h-6 rounded-md bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                          <Icon size={13} className="text-blue-500" />
                        </div>
                        <h3
                          className="text-sm sm:text-base font-bold text-[#0a0a0f] truncate"
                          style={{ fontFamily: 'Sora, Inter, sans-serif' }}
                        >
                          {step.title}
                        </h3>
                      </div>
                      <p className="text-gray-500 text-xs sm:text-sm leading-relaxed line-clamp-2">
                        {step.description}
                      </p>
                      <div className="mt-2">
                        <span className="text-[11px] font-medium text-blue-500 group-hover:text-blue-600 transition-colors">
                          Step {i + 1} &rarr;
                        </span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </div>

        {/* Trust indicators */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 mt-6"
        >
          {trustData.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-500">
              <item.icon size={13} className="text-emerald-500 shrink-0" />
              <span>{lang === 'ar' ? item.labelAr : item.label}</span>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="text-center mt-5"
        >
          <a
            href="/order?plan=us-premium"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all hover:shadow-lg hover:shadow-blue-500/25 group"
          >
            {h.getStarted}
            <ArrowRight size={15} className="group-hover:translate-x-0.5 transition-transform" />
          </a>
        </motion.div>
      </div>
    </section>
  )
}

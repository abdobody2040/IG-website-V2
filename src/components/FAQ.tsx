import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)
  const { t } = useLang()
  const f = t.faq

  return (
    <section id="faq" className="ig-section bg-white">
      <div className="max-w-[1000px] mx-auto">
        <h2
          className="text-[30px] sm:text-[42px] lg:text-[54px] font-bold text-[#0F172A] text-center mb-8 sm:mb-12 animate-fade-in"
          style={{ fontFamily: 'Sora, Inter, sans-serif' }}
        >
          {f.heading}
        </h2>

        <div className="space-y-4">
          {f.items.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 overflow-hidden shadow-sm hover:shadow-md hover:border-gray-300/60 transition-all duration-200"
            >
              <button
                className="w-full flex items-center justify-between px-5 py-4 sm:px-8 sm:py-6 text-left group"
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
              >
                <span className="text-sm sm:text-[17px] font-bold text-[#0F172A] pr-4 group-hover:text-blue-600 transition-colors">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.2 }}
                  className="shrink-0"
                >
                  <ChevronDown size={18} className="text-gray-400 sm:w-[22px] sm:h-[22px]" />
                </motion.div>
              </button>

              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="px-5 pb-4 sm:px-8 sm:pb-6">
                      <p className="text-slate-500 leading-relaxed text-xs sm:text-[15px]">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}

import { motion } from 'framer-motion'
import { Check, X } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'

const tableRows = [
  { feature: '100% Online Process', featureAr: 'عملية 100% إلكترونية',   ig: true,  others: false, diy: false },
  { feature: 'EIN Included',         featureAr: 'رقم EIN مدمج',           ig: true,  others: false, diy: false },
  { feature: 'US Business Address',  featureAr: 'عنوان أعمال أمريكي',     ig: true,  others: false, diy: false },
  { feature: 'Stripe Account Assistance', featureAr: 'مساعدة حساب Stripe', ig: true, others: false, diy: false },
  { feature: 'Dedicated Support',    featureAr: 'دعم مخصص',               ig: true,  others: true,  diy: false },
  { feature: 'Transparent Pricing',  featureAr: 'أسعار شفافة',            ig: true,  others: false, diy: false },
  { feature: 'Money-Back Guarantee', featureAr: 'ضمان استعادة المبلغ',    ig: true,  others: false, diy: false },
]

const cols = [
  { key: 'ig',     labelEn: 'Instant Grow', labelAr: 'إنستنت جرو', highlight: true },
  { key: 'others', labelEn: 'Others',       labelAr: 'الآخرون',    highlight: false },
  { key: 'diy',    labelEn: 'DIY Options',  labelAr: 'بالنفس',     highlight: false },
]

export default function ComparisonTable() {
  const { lang } = useLang()
  const isAr = lang === 'ar'

  return (
    <section id="comparison" className="ig-section bg-white">
      <div className="max-w-[1280px] mx-auto">

        {/* Header (Centered) */}
        <div className="text-center mb-16">
          <h2
            className="text-4xl sm:text-[54px] font-bold text-[#0F172A] leading-tight tracking-tight mb-4"
            style={{ fontFamily: 'Sora, Inter, sans-serif' }}
          >
            {isAr ? 'لماذا تختار' : 'Why Choose'} <span className="text-[#2563EB]">Instant Grow?</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-slate-500 max-w-2xl mx-auto leading-relaxed">
            {isAr
              ? 'مقارنة شفافة بين خدماتنا والخيارات الأخرى. نقدم لك أفضل قيمة مع أعلى مستوى من الدعم.'
              : 'A transparent comparison between our services and alternatives. We offer the best value with the highest level of support.'}
          </p>
        </div>

        {/* Desktop View (Table layout, hidden below md) */}
        <motion.div
          className="hidden md:block max-w-[1100px] mx-auto overflow-x-auto"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div
            className="w-full rounded-[24px] overflow-hidden border border-gray-100/80"
            style={{ boxShadow: '0 12px 40px rgba(15,23,42,0.06)', minWidth: 768 }}
          >
            {/* Header row */}
            <div className="grid grid-cols-[3fr_1fr_1fr_1fr] bg-slate-50 border-b border-gray-100">
              <div className="px-8 py-5.5 text-xs sm:text-sm font-bold text-slate-400 uppercase tracking-wider">
                {isAr ? 'الميزة' : 'Features'}
              </div>
              {cols.map((col) => (
                <div
                  key={col.key}
                  className={`px-6 py-5.5 text-center text-xs sm:text-sm font-extrabold uppercase tracking-wider relative ${
                    col.highlight
                      ? 'text-blue-600 bg-blue-50/20 border-x border-gray-100/50 shadow-[inset_0_2px_0_0_#2563EB]'
                      : 'text-slate-400'
                  }`}
                >
                  {isAr ? col.labelAr : col.labelEn}
                  {col.highlight && (
                    <div className="mt-1 flex justify-center">
                      <span className="inline-block bg-blue-500 text-white text-[9px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-widest leading-none">
                        Best
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Data rows */}
            {tableRows.map((row, i) => {
              const isLast = i === tableRows.length - 1
              return (
                <motion.div
                  key={i}
                  className="grid grid-cols-[3fr_1fr_1fr_1fr] border-b border-gray-50 group hover:bg-slate-50/40 transition-colors"
                  initial={{ opacity: 0, y: 8 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.04, duration: 0.4 }}
                >
                  {/* Feature name */}
                  <div className="px-8 py-5.5 text-sm sm:text-base text-slate-700 font-semibold flex items-center">
                    {isAr ? row.featureAr : row.feature}
                  </div>

                  {/* Instant Grow (strongly highlighted) */}
                  <div className={`px-6 py-5.5 flex justify-center items-center bg-blue-50/15 border-x border-gray-100/30 ${isLast ? 'rounded-b-none' : ''}`}>
                    {row.ig ? (
                      <div className="w-7 h-7 rounded-full bg-blue-500 flex items-center justify-center shrink-0 shadow-sm">
                        <Check size={15} className="text-white" strokeWidth={3} />
                      </div>
                    ) : (
                      <div className="w-7 h-7 rounded-full bg-red-100 flex items-center justify-center shrink-0 shadow-sm">
                        <X size={14} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </div>

                  {/* Others */}
                  <div className="px-6 py-5.5 flex justify-center items-center">
                    {row.others ? (
                      <div className="w-6.5 h-6.5 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Check size={14} className="text-emerald-600" strokeWidth={2.5} />
                      </div>
                    ) : (
                      <div className="w-6.5 h-6.5 rounded-full bg-red-100 flex items-center justify-center">
                        <X size={13} className="text-red-400" strokeWidth={2.5} />
                      </div>
                    )}
                  </div>

                  {/* DIY */}
                  <div className="px-6 py-5.5 flex justify-center items-center">
                    {row.diy ? (
                      <div className="w-6.5 h-6.5 rounded-full bg-emerald-100 flex items-center justify-center">
                        <Check size={14} className="text-emerald-600" strokeWidth={2.5} />
                      </div>
                    ) : (
                      <div className="w-6.5 h-6.5 rounded-full bg-red-100 flex items-center justify-center">
                        <X size={13} className="text-red-400" strokeWidth={2.5} />
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>

        {/* Mobile View (Responsive Cards, hidden on desktop/tablet md+) */}
        <div className="block md:hidden space-y-4">
          {tableRows.map((row, i) => (
            <div key={i} className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm space-y-3">
              <h3 className="font-bold text-slate-800 text-sm">{isAr ? row.featureAr : row.feature}</h3>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-50 text-center">
                <div className="flex flex-col items-center p-2 rounded-xl bg-blue-50/20 border border-blue-50/50">
                  <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider mb-1">
                    {isAr ? 'إنستنت جرو' : 'IG'}
                  </span>
                  {row.ig ? (
                    <Check size={16} className="text-blue-500" strokeWidth={3} />
                  ) : (
                    <X size={16} className="text-red-400" strokeWidth={3} />
                  )}
                </div>
                <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {isAr ? 'الآخرون' : 'Others'}
                  </span>
                  {row.others ? (
                    <Check size={16} className="text-emerald-500" strokeWidth={3} />
                  ) : (
                    <X size={16} className="text-red-400" strokeWidth={3} />
                  )}
                </div>
                <div className="flex flex-col items-center p-2 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    {isAr ? 'بنفسك' : 'DIY'}
                  </span>
                  {row.diy ? (
                    <Check size={16} className="text-emerald-500" strokeWidth={3} />
                  ) : (
                    <X size={16} className="text-red-400" strokeWidth={3} />
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

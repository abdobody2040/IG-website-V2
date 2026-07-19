import {
  Star,
  Users,
  Globe,
  ShieldCheck,
  Headphones,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Info
} from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'

// Top Metric Cards data
const metricCards = [
  {
    key: 'formed',
    valueEn: '1,000+',
    valueAr: '1,000+',
    labelEn: 'Businesses Formed',
    labelAr: 'شركة تم تأسيسها',
    Icon: Users,
  },
  {
    key: 'rating',
    valueEn: '4.9/5',
    valueAr: '4.9/5',
    labelEn: 'Average Customer Rating',
    labelAr: 'متوسط تقييم العملاء',
    Icon: Star,
  },
  {
    key: 'countries',
    valueEn: '100+',
    valueAr: '100+',
    labelEn: 'Countries Served',
    labelAr: 'دولة مخدومة',
    Icon: Globe,
  },
  {
    key: 'satisfaction',
    valueEn: '99%',
    valueAr: '99%',
    labelEn: 'Customer Satisfaction',
    labelAr: 'نسبة رضا العملاء',
    Icon: ShieldCheck,
  },
  {
    key: 'support',
    valueEn: '24/7',
    valueAr: '24/7',
    labelEn: 'Expert Support',
    labelAr: 'دعم فني متواصل',
    Icon: Headphones,
  },
]

// Comparison columns (competitors)
const columns = [
  { key: 'features', labelEn: 'Features', labelAr: 'الميزات' },
  {
    key: 'ig',
    labelEn: 'INSTANT GROW',
    labelAr: 'إنستنت جرو',
    highlight: true,
    badgeEn: 'BEST VALUE',
    badgeAr: 'الأفضل قيمة',
  },
  { key: 'doola', labelEn: 'DOOLA', labelAr: 'دولا' },
  { key: 'firstbase', labelEn: 'FIRSTBASE', labelAr: 'فيرست بيس' },
  { key: 'bizee', labelEn: 'BIZEE', labelAr: 'بيزي' },
  { key: 'northwest', labelEn: 'NORTHWEST REGISTERED AGENT', labelAr: 'نورث ويست' },
  { key: 'diy', labelEn: 'DIY (Do It Yourself)', labelAr: 'الخدمة الذاتية' },
]

// Cell value type interface
interface CellValue {
  type: 'included' | 'warning' | 'excluded' | 'text'
  textEn: string
  textAr: string
}

// Table row layout interface
interface RowData {
  featureEn: string
  featureAr: string
  values: Record<string, CellValue>
}

// Comparison Table Data
const tableRows: RowData[] = [
  {
    featureEn: 'LLC Formation',
    featureAr: 'تأسيس شركة LLC',
    values: {
      ig: { type: 'included', textEn: 'Included', textAr: 'مشمول' },
      doola: { type: 'included', textEn: 'Included', textAr: 'مشمول' },
      firstbase: { type: 'included', textEn: 'Included', textAr: 'مشمول' },
      bizee: { type: 'included', textEn: 'Included', textAr: 'مشمول' },
      northwest: { type: 'included', textEn: 'Included', textAr: 'مشمول' },
      diy: { type: 'included', textEn: 'Included', textAr: 'مشمول' },
    },
  },
  {
    featureEn: 'EIN Included',
    featureAr: 'رقم EIN مدمج',
    values: {
      ig: { type: 'included', textEn: 'Included', textAr: 'مشمول' },
      doola: { type: 'included', textEn: 'Included', textAr: 'مشمول' },
      firstbase: { type: 'included', textEn: 'Included', textAr: 'مشمول' },
      bizee: { type: 'warning', textEn: 'Higher Plan Required', textAr: 'يتطلب باقة أعلى' },
      northwest: { type: 'warning', textEn: '$50 (SSN) / $200 (Non-US)', textAr: '50$ (بوجود رقم ضمان) / 200$ (لغير الأمريكيين)' },
      diy: { type: 'excluded', textEn: 'Not Included', textAr: 'غير مشمول' },
    },
  },
  {
    featureEn: 'Registered Agent Service',
    featureAr: 'خدمة الوكيل المسجل',
    values: {
      ig: { type: 'included', textEn: 'Included (1 Year Free)', textAr: 'مشمول (السنة الأولى مجاناً)' },
      doola: { type: 'warning', textEn: 'Bundled in $297/yr subscription', textAr: 'مدمجة في اشتراك بقيمة 297$/سنة' },
      firstbase: { type: 'warning', textEn: '$299/yr', textAr: '299$ سنوياً' },
      bizee: { type: 'warning', textEn: '$119/yr after first year', textAr: '119$ سنوياً بعد السنة الأولى' },
      northwest: { type: 'included', textEn: 'Included (1 Year Free)', textAr: 'مشمول (السنة الأولى مجاناً)' },
      diy: { type: 'excluded', textEn: 'Not Included', textAr: 'غير مشمول' },
    },
  },
  {
    featureEn: 'US Business Address',
    featureAr: 'عنوان أعمال أمريكي',
    values: {
      ig: { type: 'included', textEn: 'Included', textAr: 'مشمول' },
      doola: { type: 'included', textEn: 'Included', textAr: 'مشمول' },
      firstbase: { type: 'warning', textEn: 'Not Included (Add-on $35/mo)', textAr: 'غير مضمنة (إضافة بـ 35$/شهرياً)' },
      bizee: { type: 'excluded', textEn: 'Not Included', textAr: 'غير مشمول' },
      northwest: { type: 'included', textEn: 'Privacy Address Included', textAr: 'عنوان الخصوصية مضمن' },
      diy: { type: 'excluded', textEn: 'Not Included', textAr: 'غير مشمول' },
    },
  },
  {
    featureEn: 'Bank Account Assistance (Mercury / Relay)',
    featureAr: 'مساعدة في الحساب البنكي',
    values: {
      ig: { type: 'included', textEn: 'Included', textAr: 'مشمول' },
      doola: { type: 'included', textEn: 'Included', textAr: 'مشمول' },
      firstbase: { type: 'included', textEn: 'Included', textAr: 'مشمول' },
      bizee: { type: 'warning', textEn: 'Available as Add-on', textAr: 'متاح كإضافة' },
      northwest: { type: 'excluded', textEn: 'Not Included', textAr: 'غير مشمول' },
      diy: { type: 'excluded', textEn: 'Not Included', textAr: 'غير مشمول' },
    },
  },
  {
    featureEn: 'Stripe Account Assistance',
    featureAr: 'مساعدة في حساب Stripe',
    values: {
      ig: { type: 'included', textEn: 'Included', textAr: 'مشمول' },
      doola: { type: 'included', textEn: 'Included', textAr: 'مشمول' },
      firstbase: { type: 'warning', textEn: 'Available as Add-on', textAr: 'متاح كإضافة' },
      bizee: { type: 'excluded', textEn: 'Not Included', textAr: 'غير مشمول' },
      northwest: { type: 'excluded', textEn: 'Not Included', textAr: 'غير مشمول' },
      diy: { type: 'excluded', textEn: 'Not Included', textAr: 'غير مشمول' },
    },
  },
  {
    featureEn: 'Personal Account Manager',
    featureAr: 'مدير حساب شخصي',
    values: {
      ig: { type: 'included', textEn: 'Included', textAr: 'مشمول' },
      doola: { type: 'excluded', textEn: 'Not Included (Only Premium)', textAr: 'غير مشمول (الباقة المميزة فقط)' },
      firstbase: { type: 'excluded', textEn: 'Not Included', textAr: 'غير مشمول' },
      bizee: { type: 'excluded', textEn: 'Not Included', textAr: 'غير مشمول' },
      northwest: { type: 'excluded', textEn: 'Not Included', textAr: 'غير مشمول' },
      diy: { type: 'excluded', textEn: 'Not Included', textAr: 'غير مشمول' },
    },
  },
  {
    featureEn: 'WhatsApp Support',
    featureAr: 'دعم عبر WhatsApp',
    values: {
      ig: { type: 'included', textEn: 'Included', textAr: 'مشمول' },
      doola: { type: 'excluded', textEn: 'Not Available', textAr: 'غير متوفر' },
      firstbase: { type: 'excluded', textEn: 'Not Available', textAr: 'غير متوفر' },
      bizee: { type: 'excluded', textEn: 'Not Available', textAr: 'غير متوفر' },
      northwest: { type: 'excluded', textEn: 'Not Available', textAr: 'غير متوفر' },
      diy: { type: 'excluded', textEn: 'Not Available', textAr: 'غير متوفر' },
    },
  },
  {
    featureEn: 'Transparent Pricing',
    featureAr: 'أسعار شفافة',
    values: {
      ig: { type: 'included', textEn: 'No Hidden Fees', textAr: 'لا رسوم خفية' },
      doola: { type: 'warning', textEn: 'Upsells & Add-ons', textAr: 'مبيعات إضافية وإضافات' },
      firstbase: { type: 'warning', textEn: 'Upsells & Add-ons', textAr: 'مبيعات إضافية وإضافات' },
      bizee: { type: 'warning', textEn: 'Upsells & Add-ons', textAr: 'مبيعات إضافية وإضافات' },
      northwest: { type: 'warning', textEn: 'Add-ons', textAr: 'إضافات' },
      diy: { type: 'included', textEn: 'No Hidden Fees', textAr: 'لا رسوم خفية' },
    },
  },
  {
    featureEn: 'Average Setup Time',
    featureAr: 'متوسط وقت التأسيس',
    values: {
      ig: { type: 'text', textEn: '1 Day', textAr: 'يوم واحد' },
      doola: { type: 'text', textEn: '2 – 5 Days', textAr: '2 – 5 أيام' },
      firstbase: { type: 'text', textEn: '2 – 5 Days', textAr: '2 – 5 أيام' },
      bizee: { type: 'text', textEn: '5 – 10 Days', textAr: '5 – 10 أيام' },
      northwest: { type: 'text', textEn: '3 – 7 Days', textAr: '3 – 7 أيام' },
      diy: { type: 'text', textEn: 'Weeks', textAr: 'أسابيع' },
    },
  },
  {
    featureEn: 'Money-Back Guarantee',
    featureAr: 'ضمان استعادة الأموال',
    values: {
      ig: { type: 'included', textEn: 'Your Company or Your Money Back Guaranteed', textAr: 'شركتك أو استرداد أموالك مضمونة' },
      doola: { type: 'warning', textEn: 'Guaranteed if filing error occurs', textAr: 'مضمونة في حال حدوث خطأ في التأسيس' },
      firstbase: { type: 'warning', textEn: '7-Day Guarantee (pre-filing)', textAr: 'ضمان 7 أيام (قبل التقديم)' },
      bizee: { type: 'warning', textEn: 'No Guarantee (restricted)', textAr: 'لا يوجد ضمان (مقيد)' },
      northwest: { type: 'warning', textEn: '90-Day Guarantee (pre-service)', textAr: 'ضمان 90 يوماً (قبل الخدمة)' },
      diy: { type: 'excluded', textEn: 'No Guarantee', textAr: 'بدون ضمان' },
    },
  },
]

export default function ComparisonTable() {
  const { lang } = useLang()
  const isAr = lang === 'ar'

  // Helper to render cell icon and text
  const renderCellContent = (val: CellValue, isHighlighted = false) => {
    const text = isAr ? val.textAr : val.textEn
    
    if (val.type === 'included') {
      return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center">
          <CheckCircle2 size={16} className="text-emerald-500 shrink-0" />
          <span className={`text-[13px] font-semibold ${isHighlighted ? 'text-blue-900' : 'text-slate-700'}`}>
            {text}
          </span>
        </div>
      )
    }

    if (val.type === 'warning') {
      return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center">
          <AlertTriangle size={16} className="text-amber-500 shrink-0" />
          <span className={`text-[13px] font-semibold ${isHighlighted ? 'text-blue-900' : 'text-slate-700'}`}>
            {text}
          </span>
        </div>
      )
    }

    if (val.type === 'excluded') {
      return (
        <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5 text-center">
          <XCircle size={16} className="text-red-500 shrink-0" />
          <span className={`text-[13px] font-semibold ${isHighlighted ? 'text-blue-900' : 'text-slate-700'}`}>
            {text}
          </span>
        </div>
      )
    }

    return (
      <span className={`text-[13px] font-semibold ${isHighlighted ? 'text-blue-900' : 'text-slate-700'}`}>
        {text}
      </span>
    )
  }

  return (
    <section id="comparison" className="ig-section bg-[#F8FAFC] !pt-8 lg:!pt-12">
      <div className="max-w-[1280px] mx-auto">
        
        {/* Top Badges & Heading */}
        <div className="text-center mb-10 sm:mb-12">
          <div className="inline-block bg-blue-50 text-blue-600 text-[10px] sm:text-xs font-bold px-3.5 py-1.5 rounded-full uppercase tracking-wider mb-3 sm:mb-4 border border-blue-100">
            {isAr ? 'قارن ووفر' : 'COMPARE & SAVE'}
          </div>
          <h2
            className="text-[30px] sm:text-[42px] lg:text-[54px] font-bold text-[#0F172A] leading-tight tracking-tight mb-3 sm:mb-4 animate-fade-in"
            style={{ fontFamily: 'Sora, Inter, sans-serif' }}
          >
            {isAr ? 'لماذا تختار' : 'Why Choose'}{' '}
            <span className="text-[#2563EB]">Instant Grow?</span>
          </h2>
          <p className="text-sm sm:text-base lg:text-xl text-slate-500 max-w-3xl mx-auto leading-relaxed">
            {isAr
              ? 'مقارنة حقيقية. قيمة حقيقية. كل ما تحتاجه لإطلاق وتنمية أعمالك في الولايات المتحدة.'
              : 'Real comparison. Real value. Everything you need to launch and grow your US business.'}
          </p>
        </div>

        {/* 5 Metrics Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 mb-12 sm:mb-16">
          {metricCards.map((card) => {
            const CardIcon = card.Icon
            return (
              <div
                key={card.key}
                className="bg-white border border-slate-100 rounded-[20px] p-4 sm:p-5 flex items-center gap-3.5 sm:gap-4 shadow-[0_4px_20px_rgba(0,0,0,0.02)] transition-all duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:translate-y-[-2px]"
              >
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 shrink-0">
                  <CardIcon size={20} className="sm:w-[22px] sm:h-[22px] stroke-[1.8]" />
                </div>
                <div>
                  <h4 className="text-base sm:text-lg lg:text-xl font-bold text-slate-800 leading-tight">
                    {isAr ? card.valueAr : card.valueEn}
                  </h4>
                  <p className="text-[10px] sm:text-xs font-semibold text-slate-400 mt-0.5 leading-tight">
                    {isAr ? card.labelAr : card.labelEn}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Swipe Helper for Mobile */}
        <div className="block md:hidden text-center mb-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-500 bg-blue-50/80 px-3 py-1.5 rounded-full border border-blue-100/50">
            {isAr ? '← اسحب لليمين واليسار لمشاهدة المقارنة كاملة →' : '← Swipe left/right to view full comparison →'}
          </span>
        </div>

        {/* Table layout with scroll prompt */}
        <div className="relative">
          <div className="absolute top-0 right-0 left-0 h-8 bg-gradient-to-b from-[#F8FAFC] to-transparent pointer-events-none z-10 md:hidden" />
          
          <div className="overflow-x-auto pb-6 scrollbar-thin scrollbar-thumb-slate-200">
            <div className="min-w-[1100px] px-1">
              <table className="w-full border-separate border-spacing-0">
                <thead>
                  <tr>
                    {columns.map((col, index) => {
                      const isFirst = index === 0
                      const isHighlighted = col.highlight
                      return (
                        <th
                          key={col.key}
                          className={`pb-6 text-center select-none ${
                            isFirst
                              ? 'text-start w-[240px] pr-4 py-3'
                              : isHighlighted
                              ? 'relative bg-blue-50/30 border-t-2 border-x-2 border-blue-500 rounded-t-2xl py-5 shadow-[0_-4px_20px_rgba(37,99,235,0.04)] px-4'
                              : 'text-slate-400 font-bold text-xs uppercase tracking-wider py-5 px-4'
                          }`}
                        >
                          {!isFirst && (
                            <div className="flex flex-col items-center gap-1.5">
                              <span
                                className={`text-[12px] font-extrabold uppercase tracking-wider ${
                                  isHighlighted ? 'text-blue-600 font-black' : 'text-slate-800'
                                }`}
                              >
                                {isAr ? col.labelAr : col.labelEn}
                              </span>
                              {isHighlighted && (
                                <span className="inline-block bg-blue-500 text-white text-[9px] font-extrabold px-3 py-1 rounded-full uppercase tracking-widest leading-none">
                                  {isAr ? col.badgeAr : col.badgeEn}
                                </span>
                              )}
                            </div>
                          )}
                          {isFirst && (
                            <span className="text-slate-400 font-extrabold text-xs uppercase tracking-wider">
                              {isAr ? col.labelAr : col.labelEn}
                            </span>
                          )}
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {tableRows.map((row, rowIndex) => {
                    const isLastRow = rowIndex === tableRows.length - 1
                    return (
                      <tr
                        key={rowIndex}
                        className="group hover:bg-slate-50/40 transition-colors"
                      >
                        {columns.map((col, colIndex) => {
                          const isFirst = colIndex === 0
                          const isHighlighted = col.highlight
                          const cellVal = row.values[col.key]

                          return (
                            <td
                              key={col.key}
                              className={`py-4 border-b border-slate-100 ${
                                isFirst
                                  ? 'text-start font-bold text-slate-800 text-[14px] pr-4'
                                  : isHighlighted
                                  ? `bg-blue-50/20 text-center border-x-2 border-blue-500 px-4 ${
                                      isLastRow ? 'border-b-2 rounded-b-2xl shadow-[0_10px_20px_rgba(37,99,235,0.04)]' : ''
                                    }`
                                  : 'text-center px-4'
                              }`}
                            >
                              {isFirst ? (
                                <div className="flex items-center gap-2">
                                  <span>{isAr ? row.featureAr : row.featureEn}</span>
                                </div>
                              ) : (
                                cellVal && renderCellContent(cellVal, isHighlighted)
                              )}
                            </td>
                          )
                        })}
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Legend & Disclaimer Row */}
        <div className="mt-8 flex flex-col md:flex-row items-center justify-between gap-6 border-t border-slate-100 pt-6">
          {/* Disclaimer Note */}
          <div className="flex items-start gap-2.5 max-w-2xl text-slate-400">
            <Info size={16} className="text-slate-300 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              {isAr
                ? 'مقارنة مبنية على معلومات متاحة علنياً من مواقع المنافسين اعتباراً من يوليو 2026. قد تختلف الميزات حسب الباقة وهي عرضة للتغيير.'
                : 'Comparison based on publicly available information from competitor websites as of July 2026. Features may vary by plan and are subject to change.'}
            </p>
          </div>

          {/* Legend Items */}
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 shrink-0">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-emerald-500" />
              <span className="text-xs font-semibold text-slate-500">
                {isAr ? 'مشمول' : 'Included'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle size={15} className="text-amber-500" />
              <span className="text-xs font-semibold text-slate-500">
                {isAr ? 'متاح كإضافة مدفوعة' : 'Available as Paid Add-on'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle size={15} className="text-red-500" />
              <span className="text-xs font-semibold text-slate-500">
                {isAr ? 'غير مشمول' : 'Not Included'}
              </span>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}

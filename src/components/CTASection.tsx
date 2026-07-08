import { ArrowRight, ArrowLeft, Check } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'

const CAL_BASE = 'https://cal.com/instant-grow-llc'

export default function CTASection() {
  const { t, lang } = useLang()
  const c = t.cta
  const isAr = lang === 'ar'

  const benefits = [
    { text: isAr ? '100% عبر الإنترنت' : '100% Online' },
    { text: isAr ? 'آمن وموثوق' : 'Secure & Reliable' },
    { text: isAr ? 'ضمان استعادة الأموال' : 'Money-Back Guarantee' },
  ]

  return (
    <section id="order" className="py-12 bg-gradient-to-r from-[#1A56FF] to-[#0A44E4] relative overflow-hidden">
      {/* Background overlay for smooth color */}
      <div className="absolute inset-0 bg-blue-600/10 pointer-events-none" />
      
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 relative z-10">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left: Mascot & Text */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 flex-1 text-center sm:text-left rtl:sm:text-right w-full">
            <img 
              src="/mascot-cta.png" 
              alt="Instant Grow Mascot" 
              className={`w-24 sm:w-32 lg:w-44 shrink-0 drop-shadow-[0_10px_25px_rgba(0,0,0,0.15)] ${isAr ? 'scale-x-[-1]' : ''}`} 
            />
            <div>
              <h2 
                className="text-[22px] sm:text-3xl lg:text-[34px] font-bold text-white leading-tight mb-2"
                style={{ fontFamily: 'Sora, Inter, sans-serif' }}
              >
                {c.heading}
              </h2>
              <p className="text-white/80 text-xs sm:text-base max-w-xl leading-relaxed">
                {c.subheading}
              </p>
            </div>
          </div>

          {/* Right: Buttons & Benefits */}
          <div className="flex flex-col items-center lg:items-end gap-4 shrink-0 w-full lg:w-auto">
            <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
              <a 
                href="/order?plan=us-premium" 
                className="bg-white text-[#1A56FF] hover:bg-slate-50 font-bold px-7 py-3 rounded-2xl transition-all duration-200 flex items-center justify-center gap-2 text-sm shadow-[0_8px_25px_rgba(0,0,0,0.08)] hover:-translate-y-0.5 w-full sm:w-auto min-h-[48px]"
              >
                {isAr ? 'أسس شركتك الآن' : 'Form My US LLC'}
                {isAr ? <ArrowLeft size={16} /> : <ArrowRight size={16} />}
              </a>
              <a 
                href={`${CAL_BASE}/15min`} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="border border-white/25 hover:border-white/40 hover:bg-white/5 text-white font-bold px-7 py-3 rounded-2xl transition-all duration-200 text-sm flex items-center justify-center hover:-translate-y-0.5 w-full sm:w-auto min-h-[48px]"
              >
                {isAr ? 'احجز مكالمة مجانية' : 'Book a Free Call'}
              </a>
            </div>
            
            {/* Benefits Row */}
            <div className="flex flex-wrap items-center justify-center lg:justify-end gap-x-5 gap-y-2 mt-1">
              {benefits.map((b, i) => (
                <span key={i} className="flex items-center gap-1.5 text-xs font-semibold text-white/95">
                  <div className="w-4 h-4 rounded-full bg-white/15 flex items-center justify-center shrink-0">
                    <Check size={10} className="text-white" strokeWidth={3.5} />
                  </div>
                  {b.text}
                </span>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  )
}

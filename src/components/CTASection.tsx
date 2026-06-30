import { ArrowRight, Calendar, CheckCircle, Phone } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLang } from '../i18n/LanguageContext'
import Particles from './effects/Particles'
import { useMagneticButton } from '../hooks/useMagneticButton'

const CAL_BASE = 'https://cal.com/instant-grow-llc'

export default function CTASection() {
  const { t, lang } = useLang()
  const c = t.cta
  const isAr = lang === 'ar'
  const magneticCta = useMagneticButton()

  const trustBadges = [
    { icon: CheckCircle, text: isAr ? 'ضمان استعادة المبلغ' : 'Money-Back Guarantee' },
    { icon: CheckCircle, text: isAr ? 'لا رسوم مخفية' : 'No Hidden Fees' },
    { icon: CheckCircle, text: isAr ? 'دعم على مدار الساعة' : '24/7 Support' },
  ]

  return (
    <section id="order" className="py-32 bg-[#0a0f1e] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Particles count={30} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl" />
        {/* Subtle grid */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '56px 56px',
          }}
        />
      </div>

      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">

          {/* Left content */}
          <motion.div
            className="flex-1 text-center lg:text-left"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="inline-block text-cyan-400 text-xs font-bold uppercase tracking-widest mb-4">
              {c.label}
            </span>

            <h2
              className="text-4xl sm:text-[52px] lg:text-[58px] xl:text-[64px] font-bold text-white leading-tight tracking-tight mb-5"
              style={{ fontFamily: 'Sora, Inter, sans-serif' }}
            >
              {c.heading}
            </h2>

            <p className="text-white/60 text-lg sm:text-xl mb-12 max-w-xl leading-relaxed">
              {c.subheading}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-4 mb-10">
              <motion.a
                ref={magneticCta.ref}
                href="/order?plan=us-premium"
                onMouseMove={magneticCta.onMouseMove}
                onMouseLeave={magneticCta.onMouseLeave}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="shimmer-btn inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-base px-10 py-5 rounded-[18px] hover:shadow-xl hover:shadow-blue-500/30 transition-all group"
              >
                {c.button}
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </motion.a>

              <a
                href={`${CAL_BASE}/15min`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/8 text-white font-semibold text-base px-9 py-5 rounded-[18px] border border-white/12 hover:bg-white/14 hover:border-white/20 transition-all backdrop-blur-sm group"
              >
                <Phone size={16} className="text-cyan-400" />
                {isAr ? 'احجز مكالمة مجانية' : 'Book a Free Call'}
              </a>
            </div>

            {/* Trust badges */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-5">
              {trustBadges.map((b, i) => (
                <span key={i} className="flex items-center gap-1.5 text-sm text-white/50">
                  <b.icon size={13} className="text-emerald-400 shrink-0" />
                  {b.text}
                </span>
              ))}
            </div>

            {/* Meeting divider */}
            <div className="flex items-center gap-4 mt-10 mb-6">
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
              <span className="text-white/30 text-xs font-semibold uppercase tracking-widest whitespace-nowrap">
                {c.meetingLabel}
              </span>
              <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">{c.meetingHeading}</h3>
            <p className="text-white/50 text-sm mb-6">{c.meetingDesc}</p>

            <div className="flex flex-col sm:flex-row items-center lg:items-start gap-3">
              <a
                href={`${CAL_BASE}/15min`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-white/6 text-white font-semibold text-sm px-6 py-3 rounded-xl border border-white/10 hover:bg-white/10 hover:border-emerald-400/40 transition-all group"
              >
                <Calendar size={14} className="text-emerald-400" />
                {c.meeting15}
              </a>
              <a
                href={`${CAL_BASE}/30min`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-500 text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-emerald-600 transition-all hover:shadow-lg hover:shadow-emerald-500/25 group"
              >
                <Calendar size={14} />
                {c.meeting30}
              </a>
            </div>

            <p className="text-white/30 text-xs mt-5">{c.note}</p>
          </motion.div>

          {/* Right — Mascot (increased by 20%) */}
          <motion.div
            className="hidden lg:flex items-end justify-center lg:w-[380px] xl:w-[450px] shrink-0 relative"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* Glow behind mascot */}
            <div className="absolute bottom-0 inset-x-0 h-48 bg-blue-500/10 rounded-full blur-3xl" />
            <motion.img
              src="/mascot.png"
              alt="Instant Grow Mascot"
              className="relative z-10 w-full h-auto drop-shadow-[0_20px_40px_rgba(37,99,235,0.25)] brightness-110"
              animate={{ y: [-8, 6, -8] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              onError={(e) => { e.currentTarget.style.display = 'none' }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  )
}

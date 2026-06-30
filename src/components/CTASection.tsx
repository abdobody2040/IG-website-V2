import { ArrowRight, Sparkles, Calendar } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLang } from '../i18n/LanguageContext'
import Particles from './effects/Particles'
import { useMagneticButton } from '../hooks/useMagneticButton'

const CAL_BASE = 'https://cal.com/instant-grow-llc'

export default function CTASection() {
  const { t } = useLang()
  const c = t.cta
  const magneticCta = useMagneticButton()

  return (
    <section id="order" className="py-24 bg-[#0a0a0f] relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <Particles count={30} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-blue-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/5 rounded-full blur-2xl" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-2xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full p-3">
              <Sparkles size={24} className="text-blue-400" />
            </div>
          </div>

          <p className="text-cyan-400 text-sm font-semibold uppercase tracking-wider mb-3">{c.label}</p>
          <h2
            className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
            style={{ fontFamily: 'Sora, Inter, sans-serif' }}
          >
            {c.heading}
          </h2>
          <p className="text-white/60 text-lg mb-10 max-w-2xl mx-auto leading-relaxed">
            {c.subheading}
          </p>

          <motion.a
            ref={magneticCta.ref}
            href="/order?plan=us-premium"
            onMouseMove={magneticCta.onMouseMove}
            onMouseLeave={magneticCta.onMouseLeave}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg px-10 py-4 rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all hover:shadow-2xl hover:shadow-blue-500/25 hover:-translate-y-0.5"
          >
            {c.button}
            <ArrowRight size={20} />
          </motion.a>

          <p className="text-white/40 text-sm mt-6 mb-14">
            {c.note}
          </p>
        </motion.div>

        {/* ── Meeting booking ── */}
        <div className="flex items-center gap-4 mb-8">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          <span className="text-white/30 text-xs font-semibold uppercase tracking-widest">{c.meetingLabel}</span>
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-white mb-3">{c.meetingHeading}</h3>
          <p className="text-white/60 text-sm mb-8 max-w-lg mx-auto">{c.meetingDesc}</p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href={`${CAL_BASE}/15min`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-white/5 text-white font-semibold text-sm px-7 py-3.5 rounded-xl border border-white/10 hover:bg-white/10 hover:border-emerald-400/50 transition-all group backdrop-blur-sm"
            >
              <Calendar size={16} className="text-emerald-400 group-hover:scale-110 transition-transform" />
              {c.meeting15}
            </a>
            <a
              href={`${CAL_BASE}/30min`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 bg-emerald-500 text-white font-semibold text-sm px-7 py-3.5 rounded-xl hover:bg-emerald-600 transition-all hover:shadow-lg hover:shadow-emerald-500/30 group"
            >
              <Calendar size={16} />
              {c.meeting30}
            </a>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

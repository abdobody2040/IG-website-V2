import { useRef } from 'react'
import { Star, ArrowRight, Building2, Globe, CheckCircle, ChevronRight, Clock, FileText } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLang } from '../i18n/LanguageContext'
import CountUp from './effects/CountUp'
import { useSiteContent } from '../hooks/useSiteContent'

export default function Hero() {
  const { t, lang } = useLang()
  const isAr = lang === 'ar'
  const h = t.hero
  const mockupRef = useRef<HTMLDivElement>(null)

  const { content } = useSiteContent()
  const val = (k: string) => isAr ? content[k]?.value_ar : content[k]?.value_en

  const trustItems = [
    val('hero_badge1') || h.badge1,
    val('hero_badge2') || h.badge2,
    val('hero_badge3') || h.badge3,
    val('hero_badge4') || h.badge4
  ]



  const ease = [0.16, 1, 0.3, 1] as any

  const containerV = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
  }
  const childV = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
  }
  const mockupV = {
    hidden: { opacity: 0, y: 60 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.9, delay: 0.6, ease } },
  }

  const activities = [
    { icon: CheckCircle, text: 'Articles of Organization filed', time: '2h ago', color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { icon: Clock, text: 'EIN application submitted', time: '1h ago', color: 'text-blue-500', bg: 'bg-blue-50' },
    { icon: FileText, text: 'Operating agreement pending', time: 'Now', color: 'text-amber-500', bg: 'bg-amber-50', pulse: true },
  ]

  return (
    <section
      className="relative min-h-screen flex items-center bg-[#F8FAFC] overflow-hidden"
    >
      {/* ── LAYER 5 — Subtle Grid Texture ── */}
      <div
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        style={{
          backgroundImage:
            'linear-gradient(rgba(99,102,241,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.04) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />

      {/* ── LAYER 3 — Soft Gradient Blobs ── */}
      <motion.div
        className="absolute top-[5%] left-[5%] w-[50%] h-[40%] rounded-full bg-gradient-to-tr from-blue-100/30 via-indigo-100/15 to-transparent blur-[100px] pointer-events-none"
        animate={{ x: ['0%', '3%', '-2%', '0%'], y: ['0%', '4%', '-1%', '0%'], scale: [1, 1.03, 0.98, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute bottom-[10%] right-[5%] w-[45%] h-[35%] rounded-full bg-gradient-to-bl from-sky-100/25 via-blue-100/15 to-transparent blur-[120px] pointer-events-none"
        animate={{ x: ['0%', '-4%', '2%', '0%'], y: ['0%', '-3%', '2%', '0%'], scale: [1, 1.04, 0.97, 1] }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute top-[40%] left-[30%] w-[30%] h-[25%] rounded-full bg-gradient-to-r from-cyan-100/15 to-transparent blur-[90px] pointer-events-none"
        animate={{ x: ['0%', '5%', '-3%', '0%'], y: ['0%', '-2%', '4%', '0%'] }}
        transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* ── LAYER 1 — Primary Organic Ribbon ── */}
      <motion.div
        className="absolute top-[5%] -left-[10%] w-[75%] h-[55%] pointer-events-none"
        style={{ filter: 'blur(85px)' }}
        animate={{
          x: ['0%', '5%', '-3%', '2%', '0%'],
          y: ['0%', '3%', '5%', '-2%', '0%'],
          scale: [1, 1.06, 0.94, 1.02, 1],
          rotate: [0, 3, -2, 1, 0],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          className="w-full h-full"
          style={{
            borderRadius: '42% 58% 35% 65% / 48% 35% 65% 52%',
            background:
              'linear-gradient(135deg, rgba(99,102,241,0.2) 0%, rgba(59,130,246,0.15) 40%, rgba(6,182,212,0.08) 70%, transparent 100%)',
          }}
        />
      </motion.div>

      {/* ── LAYER 2 — Secondary Ribbon ── */}
      <motion.div
        className="absolute bottom-[5%] -right-[5%] w-[65%] h-[42%] pointer-events-none"
        style={{ filter: 'blur(75px)' }}
        animate={{
          x: ['0%', '-4%', '6%', '-2%', '0%'],
          y: ['0%', '-3%', '2%', '4%', '0%'],
          scale: [1, 0.95, 1.05, 0.98, 1],
          rotate: [0, -2, 4, -1, 0],
        }}
        transition={{ duration: 28, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          className="w-full h-full"
          style={{
            borderRadius: '55% 45% 65% 35% / 40% 60% 40% 60%',
            background:
              'linear-gradient(225deg, rgba(6,182,212,0.12) 0%, rgba(59,130,246,0.1) 30%, rgba(99,102,241,0.05) 70%, transparent 100%)',
          }}
        />
      </motion.div>

      {/* Accent ribbon */}
      <motion.div
        className="absolute top-[50%] left-[35%] w-[40%] h-[30%] pointer-events-none"
        style={{ filter: 'blur(60px)' }}
        animate={{
          x: ['0%', '5%', '-2%', '3%', '0%'],
          y: ['0%', '-2%', '4%', '-1%', '0%'],
          scale: [1, 1.03, 0.97, 1.01, 1],
          rotate: [0, 1, -3, 2, 0],
        }}
        transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div
          className="w-full h-full"
          style={{
            borderRadius: '48% 52% 40% 60% / 55% 40% 60% 45%',
            background:
              'linear-gradient(180deg, rgba(99,102,241,0.08) 0%, rgba(6,182,212,0.06) 50%, transparent 100%)',
          }}
        />
      </motion.div>

      {/* ── LAYER 4 — Floating Particles ── */}
      {[
        { top: '18%', left: '8%', size: 'w-2 h-2', color: 'bg-indigo-300/20', dur: 7, delay: 0 },
        { top: '35%', right: '12%', size: 'w-[11px] h-[11px]', color: 'bg-blue-300/12', dur: 8.5, delay: 0.5 },
        { top: '55%', left: '5%', size: 'w-1.5 h-1.5', color: 'bg-sky-300/15', dur: 6, delay: 1 },
        { top: '70%', right: '15%', size: 'w-[9px] h-[9px]', color: 'bg-indigo-300/10', dur: 7.5, delay: 0.8 },
        { top: '25%', right: '30%', size: 'w-[6px] h-[6px]', color: 'bg-blue-300/12', dur: 6.5, delay: 1.2 },
        { top: '80%', left: '20%', size: 'w-2 h-2', color: 'bg-cyan-300/15', dur: 8, delay: 0.3 },
        { top: '45%', left: '45%', size: 'w-1 h-1', color: 'bg-indigo-300/15', dur: 5, delay: 2 },
        { top: '62%', left: '78%', size: 'w-[7px] h-[7px]', color: 'bg-blue-300/10', dur: 9, delay: 1.5 },
        { top: '12%', left: '50%', size: 'w-[5px] h-[5px]', color: 'bg-indigo-300/12', dur: 7.5, delay: 0.7 },
        { top: '48%', left: '15%', size: 'w-1 h-1', color: 'bg-cyan-300/12', dur: 6.5, delay: 1.8 },
      ].map((p, i) => (
        <motion.div
          key={i}
          className={`absolute ${p.size} rounded-full ${p.color} pointer-events-none`}
          style={{
            top: p.top,
            left: p.left,
            right: (p as any).right,
          }}
          animate={{ y: [0, -(12 + i * 2), 0], opacity: [0.12, 0.35, 0.12] }}
          transition={{ duration: p.dur, repeat: Infinity, ease: 'easeInOut', delay: p.delay }}
        />
      ))}

      {/* ── CONTENT ── */}
      <div
        className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 lg:pt-32 pb-0"
      >
        <motion.div
          className="max-w-3xl mx-auto text-center"
          variants={containerV}
          initial="hidden"
          animate="visible"
        >
          {/* Badge */}
          <motion.div variants={childV}>
            <span className="inline-flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-indigo-200/50 rounded-full px-4 py-1.5 text-sm font-medium text-indigo-600 shadow-sm">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {h.trustBadge}
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={childV}
            className="text-[40px] sm:text-5xl lg:text-[64px] font-bold leading-[1.08] mt-6 mb-5 text-slate-900 tracking-tight"
            style={{ fontFamily: 'Sora, Inter, sans-serif' }}
          >
            {val('hero_headline') || h.headline1}
          </motion.h1>

          {/* Description */}
          <motion.p
            variants={childV}
            className="text-base sm:text-lg text-slate-500 leading-relaxed max-w-[560px] mx-auto"
          >
            {val('hero_subheadline') || h.subheadline}
          </motion.p>

          {/* CTA Row */}
          <motion.div variants={childV} className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-10">
            <a
              href="/order"
              className="group relative w-full sm:w-auto bg-gradient-to-r from-indigo-600 via-blue-600 to-indigo-600 text-white font-semibold text-sm px-8 py-4 rounded-xl overflow-hidden transition-all duration-300 hover:-translate-y-0.5"
              style={{ boxShadow: '0 4px 20px rgba(99,102,241,0.25)' }}
            >
              <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_60%)] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 -translate-x-full group-hover:translate-x-full transition-all duration-700" />
              <span className="relative z-10 flex items-center gap-2">
                {val('hero_cta') || (isAr ? 'تأسيس شركتي' : 'Form My LLC')}
                <ArrowRight size={16} className={`group-hover:${isAr ? '-' : ''}translate-x-1 group-hover:-translate-y-0.5 transition-transform duration-300`} />
              </span>
            </a>
            <a
              href="#contact"
              className="group w-full sm:w-auto border border-slate-200 bg-white/70 backdrop-blur-sm text-slate-600 font-semibold text-sm px-7 py-4 rounded-xl hover:bg-white hover:border-slate-300 transition-all duration-300 text-center shadow-sm hover:shadow-md hover:-translate-y-0.5"
            >
              Book a Free Call
            </a>
          </motion.div>

          {/* Trust badges */}
          <motion.div variants={childV} className="flex flex-wrap justify-center gap-x-6 gap-y-1.5 mt-6">
            {trustItems.map((item, i) => (
              <span key={i} className="flex items-center gap-1.5 text-xs text-slate-400">
                <CheckCircle size={12} className="text-emerald-500/60" />
                {item}
              </span>
            ))}
          </motion.div>

          {/* Trust stats cards */}
          <motion.div variants={childV} className="flex items-center justify-center gap-3 sm:gap-5 mt-8">
            {[
              { icon: null, value: '4.9', suffix: '', decimals: 1, label: 'Rating', stars: true },
              { icon: Building2, value: '500', suffix: '+', decimals: 0, label: 'Businesses Formed' },
              { icon: Globe, value: '30', suffix: '+', decimals: 0, label: 'Countries Served' },
            ].map((item, i) => (
              <div
                key={i}
                className="group flex-1 max-w-[170px] rounded-2xl bg-white/70 backdrop-blur-md border border-white/60 p-4 text-center shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}
              >
                {item.stars ? (
                  <div className="flex justify-center gap-0.5 mb-1.5">
                    {[...Array(5)].map((_, j) => (
                      <Star key={j} size={12} className="fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                ) : item.icon ? (
                  <item.icon size={14} className="mx-auto text-slate-400 mb-1.5" />
                ) : null}
                <span className="block text-slate-900 text-base font-bold tabular-nums">
                  <CountUp end={parseFloat(item.value)} suffix={item.suffix} decimals={item.decimals} duration={2 + i * 0.3} />
                </span>
                <span className="block text-slate-400 text-[11px] mt-0.5 font-medium">{item.label}</span>
              </div>
            ))}
          </motion.div>
        </motion.div>

        {/* ── PRODUCT PREVIEW — Large Browser Mockup ── */}
        <motion.div
          variants={mockupV}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-40px' }}
          className="relative max-w-[1100px] mx-auto mt-16 mb-[-120px] z-20"
        >
          <motion.div
            ref={mockupRef}
            animate={{ y: [-8, 8, -8] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
            className="relative"
          >
            {/* Multi-layer glow */}
            <div className="absolute -inset-12 bg-gradient-to-b from-indigo-400/15 via-blue-400/8 to-transparent rounded-[32px] blur-[90px] pointer-events-none" />
            <div className="absolute -inset-8 bg-gradient-to-tr from-blue-400/8 to-indigo-400/5 rounded-[28px] blur-[70px] pointer-events-none" />
            <div className="absolute -inset-4 bg-gradient-to-br from-cyan-400/5 via-transparent to-transparent rounded-[24px] blur-[50px] pointer-events-none" />

            {/* Light reflection */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent pointer-events-none rounded-2xl z-10" />

            {/* Browser frame */}
            <div className="relative rounded-2xl overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3),0_0_0_1px_rgba(226,232,240,0.8)] bg-white">
              {/* Chrome */}
              <div className="bg-white border-b border-slate-100 px-4 sm:px-5 py-3.5 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
                </div>
                <div className="flex-1 bg-slate-50 rounded-lg h-7 flex items-center justify-center border border-slate-100 max-w-[360px] mx-auto">
                  <span className="text-[11px] text-slate-400 font-medium tracking-tight">instantgrow.app/dashboard</span>
                </div>
                <div className="w-[52px] hidden sm:block" />
              </div>

              {/* Dashboard */}
              <div className="bg-white">
                <div className="flex">
                  {/* Sidebar */}
                  <div className="hidden sm:flex flex-col w-52 lg:w-60 bg-slate-50/50 border-r border-slate-100 p-3 gap-0.5">
                    {['Dashboard', 'Company', 'Documents', 'Services', 'Messages', 'Settings'].map((item, i) => (
                      <div
                        key={item}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                          i === 0
                            ? 'bg-white text-slate-800 shadow-sm border border-slate-100'
                            : 'text-slate-400 hover:text-slate-600'
                        }`}
                      >
                        {i === 0 && <span className="w-1 h-1 rounded-full bg-indigo-500 shrink-0" />}
                        <span>{item}</span>
                        {i === 4 && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse shrink-0" />}
                      </div>
                    ))}
                    <div className="mt-auto pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium text-slate-400">
                        <img src="/favicon.svg" alt="Instant Grow Icon" className="w-4 h-4" />
                        Instant Grow
                      </div>
                    </div>

                  </div>

                  {/* Main area */}
                  <div className="flex-1 p-5 sm:p-6 lg:p-7">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-5">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-800">Dashboard</h3>
                        <p className="text-[11px] text-slate-400 mt-0.5">Welcome back, John</p>
                      </div>
                      <div className="flex items-center gap-1.5 bg-indigo-50 rounded-lg px-3 py-1.5 border border-indigo-100">
                        <span className="relative flex w-2 h-2">
                          <span className="absolute inset-0 rounded-full bg-emerald-400 animate-ping opacity-40" />
                          <span className="relative w-2 h-2 rounded-full bg-emerald-400" />
                        </span>
                        <span className="text-[11px] font-medium text-indigo-600">Active</span>
                      </div>
                    </div>

                    {/* Metric cards */}
                    <div className="grid grid-cols-3 gap-3 mb-5">
                      {[
                        { label: 'Formation', value: 'In Progress', color: 'bg-amber-400', width: '65%' },
                        { label: 'EIN Status', value: 'Completed', color: 'bg-emerald-400', width: '100%' },
                        { label: 'Documents', value: '3 of 5', color: 'bg-blue-400', width: '60%' },
                      ].map((m, i) => (
                        <div key={m.label} className="bg-slate-50 rounded-xl p-3.5 border border-slate-100">
                          <span className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">{m.label}</span>
                          <p className="text-xs font-semibold text-slate-800 mt-1">{m.value}</p>
                          <div className="mt-2.5 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              whileInView={{ width: m.width }}
                              viewport={{ once: true }}
                              transition={{ duration: 1.2, delay: 0.8 + i * 0.15, ease: 'easeOut' }}
                              className={`h-full rounded-full ${m.color}`}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Activity */}
                    <div className="bg-slate-50 rounded-xl border border-slate-100 p-4 sm:p-5">
                      <div className="flex items-center justify-between mb-3.5">
                        <span className="text-xs font-semibold text-slate-700">Recent Activity</span>
                        <span className="text-[10px] text-indigo-500 font-medium flex items-center gap-1 hover:gap-1.5 transition-all cursor-default">
                          View all <ChevronRight size={10} />
                        </span>
                      </div>
                      <div className="space-y-3">
                        {activities.map((row, i) => {
                          const Icon = row.icon
                          return (
                            <motion.div
                              key={i}
                              initial={{ opacity: 0, x: -8 }}
                              whileInView={{ opacity: 1, x: 0 }}
                              viewport={{ once: true }}
                              transition={{ delay: 1 + i * 0.15, duration: 0.4 }}
                              className="flex items-center gap-3 group/item"
                            >
                              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${row.bg} shrink-0`}>
                                <Icon size={13} className={row.color} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <span className="text-[11px] font-medium text-slate-700 block truncate">{row.text}</span>
                              </div>
                              <span className={`text-[10px] shrink-0 ${row.pulse ? 'text-amber-500 font-medium' : 'text-slate-400'}`}>
                                {row.pulse ? (
                                  <span className="flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-amber-400 animate-pulse" />
                                    {row.time}
                                  </span>
                                ) : row.time}
                              </span>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

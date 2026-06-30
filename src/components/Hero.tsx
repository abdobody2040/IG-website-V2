import { Star, ArrowRight, CheckCircle, Phone } from 'lucide-react'
import { motion } from 'framer-motion'
import { useLang } from '../i18n/LanguageContext'
import { useSiteContent } from '../hooks/useSiteContent'

/* ── Dotted world map SVG (simplified continent outlines as dot clusters) ── */
function WorldMapDots() {
  return (
    <svg
      viewBox="0 0 800 420"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute inset-0 w-full h-full"
      style={{ opacity: 0.12 }}
    >
      <defs>
        <pattern id="dots" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="2" cy="2" r="1.8" fill="#2563EB" />
        </pattern>
        <mask id="worldMask">
          {/* North America */}
          <ellipse cx="180" cy="160" rx="110" ry="80" fill="white" />
          <ellipse cx="220" cy="220" rx="70" ry="60" fill="white" />
          {/* South America */}
          <ellipse cx="240" cy="310" rx="55" ry="75" fill="white" />
          {/* Europe */}
          <ellipse cx="400" cy="130" rx="55" ry="55" fill="white" />
          {/* Africa */}
          <ellipse cx="410" cy="260" rx="60" ry="80" fill="white" />
          {/* Asia */}
          <ellipse cx="570" cy="150" rx="130" ry="90" fill="white" />
          {/* Southeast Asia */}
          <ellipse cx="640" cy="240" rx="60" ry="50" fill="white" />
          {/* Australia */}
          <ellipse cx="650" cy="330" rx="60" ry="40" fill="white" />
          {/* Greenland */}
          <ellipse cx="250" cy="70" rx="40" ry="30" fill="white" />
        </mask>
      </defs>
      <rect width="800" height="420" fill="url(#dots)" mask="url(#worldMask)" />
    </svg>
  )
}

/* ── Country Pin Card ─────────────────────────────────────────────────────── */
interface PinCardProps {
  flag: string
  country: string
  label: string
  style: React.CSSProperties
  delay?: number
}
function PinCard({ flag, country, label, style, delay = 0 }: PinCardProps) {
  return (
    <motion.div
      className="hidden sm:flex absolute bg-white rounded-2xl shadow-xl border border-gray-100/80 px-4 py-3 items-center gap-3 z-20"
      style={{ ...style, minWidth: 156 }}
      initial={{ opacity: 0, scale: 0.8, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 0.8 + delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Pulse dot */}
      <span className="relative flex shrink-0">
        <span className="absolute inset-0 rounded-full bg-blue-500 opacity-35 animate-ping" style={{ animationDuration: '2s' }} />
        <span className="w-2.5 h-2.5 rounded-full bg-blue-500 relative" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-bold text-slate-800 leading-none">{flag} {country}</p>
        <p className="text-[11px] text-slate-400 mt-1 truncate">{label}</p>
      </div>
    </motion.div>
  )
}

/* ── Floating Notification Card ───────────────────────────────────────────── */
interface NotifCardProps {
  icon: string
  title: string
  subtitle: string
  bgColor: string
  style: React.CSSProperties
  delay?: number
}
function NotifCard({ icon, title, subtitle, bgColor, style, delay = 0 }: NotifCardProps) {
  return (
    <motion.div
      className="hidden lg:flex absolute bg-white/95 backdrop-blur-md rounded-2xl border border-gray-100/90 px-4 py-3 z-30 items-center gap-3"
      style={{
        ...style,
        boxShadow: '0 12px 40px rgba(15,23,42,0.14)',
        minWidth: 200,
      }}
      initial={{ opacity: 0, scale: 0.85, y: 12 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ delay: 1 + delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-lg"
        style={{ background: bgColor }}
      >
        {icon}
      </div>
      <div>
        <p className="text-xs font-bold text-slate-800 leading-none">{title}</p>
        <p className="text-[11px] text-slate-400 mt-1">{subtitle}</p>
      </div>
    </motion.div>
  )
}

const ease = [0.16, 1, 0.3, 1] as const

const containerV = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}
const childV = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.65, ease } },
}

export default function Hero() {
  const { t, lang } = useLang()
  const isAr = lang === 'ar'
  const h = t.hero
  const { content } = useSiteContent()
  const val = (k: string) => isAr ? content[k]?.value_ar : content[k]?.value_en

  const trustBadges = [
    { icon: '🌐', text: '100% Online' },
    { icon: '🔒', text: 'Fast & Secure' },
    { icon: '👥', text: 'Trusted by 2,500+ Entrepreneurs' },
    { icon: '💰', text: 'Money-Back Guarantee' },
  ]

  const partnerLogos = [
    { name: 'stripe', text: 'stripe' },
    { name: 'paypal', text: 'PayPal' },
    { name: 'wise', text: '𝗐𝗂𝗌𝖾' },
    { name: 'brex', text: 'brex' },
    { name: 'mercury', text: 'mercury' },
    { name: 'shopify', text: 'Shopify' },
  ]

  return (
    <section className="relative bg-white overflow-hidden pt-24 pb-12 lg:pt-36 lg:pb-20 min-h-[auto] lg:min-h-[900px] flex flex-col justify-between">
      {/* Background gradient blobs */}
      <div className="absolute top-0 left-0 w-[700px] h-[600px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(37,99,235,0.08) 0%, transparent 70%)', filter: 'blur(50px)' }} />
      <div className="absolute top-0 right-0 w-[600px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 100% 0%, rgba(99,102,241,0.06) 0%, transparent 70%)', filter: 'blur(70px)' }} />

      {/* Subtle grid texture */}
      <div className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{ backgroundImage: 'linear-gradient(rgba(37,99,235,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.3) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />

      <div className="relative z-10 max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-8 pb-0">

          {/* ── LEFT COLUMN (55%) ─────────────────────────────────────────── */}
          <motion.div
            className="w-full lg:w-[55%] flex flex-col items-start text-left lg:pr-8 xl:pr-14"
            variants={containerV}
            initial="hidden"
            animate="visible"
          >
            {/* Top badge */}
            <motion.div variants={childV}>
              <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-xs font-semibold px-4 py-2 rounded-full mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                {isAr ? 'تأسيس LLC في 1-2 يوم عمل' : '#1 Online LLC Formation Service for Global Entrepreneurs'}
              </span>
            </motion.div>

            {/* H1 */}
            <motion.h1
              variants={childV}
              className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-[#0F172A] leading-[1.1] tracking-tight mb-6"
              style={{ fontFamily: 'Sora, Inter, sans-serif' }}
            >
              {val('hero_headline') || (
                <>
                  {isAr ? 'أطلق عملك' : 'Launch Your Business'}
                  <br />
                  {isAr ? 'من أي مكان في العالم' : 'From '}
                  {!isAr && (
                    <span className="text-[#2563EB]">Anywhere in the World</span>
                  )}
                </>
              )}
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={childV}
              className="text-base sm:text-lg lg:text-xl text-slate-500 leading-relaxed max-w-[580px] mb-8"
            >
              {val('hero_subheadline') || h.subheadline}
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={childV} className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto mb-8">
              <a
                href="/order"
                className="shimmer-btn group relative inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold text-base px-8 py-3.5 rounded-2xl transition-all duration-200 shadow-[0_4px_24px_rgba(37,99,235,0.35)] w-full sm:w-auto text-center"
              >
                {val('hero_cta') || (isAr ? 'تأسيس شركتي' : 'Form My LLC')}
                <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform duration-200 shrink-0" />
              </a>
              <a
                href="https://cal.com/instant-grow-llc/15min"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-slate-700 font-semibold text-base px-8 py-3.5 rounded-2xl hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200 shadow-sm w-full sm:w-auto text-center"
              >
                <Phone size={16} className="text-slate-400 shrink-0" />
                {isAr ? 'احجز مكالمة مجانية' : 'Book a Free Call'}
              </a>
            </motion.div>

            {/* Trust badges */}
            <motion.div variants={childV} className="flex flex-wrap gap-x-6 gap-y-2 mb-8">
              {trustBadges.map((b, i) => (
                <span key={i} className="flex items-center gap-1.5 text-sm text-slate-500 font-medium">
                  <CheckCircle size={14} className="text-emerald-500 shrink-0" />
                  {b.text}
                </span>
              ))}
            </motion.div>

            {/* Rating + Google review */}
            <motion.div variants={childV} className="flex flex-wrap items-center gap-4 mb-10">
              <div className="flex items-center gap-2">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={16} className="fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="text-base font-bold text-slate-800">4.9</span>
                <span className="text-xs text-slate-400">/ 5 from 500+ reviews</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <span className="text-slate-600 font-medium">⭐ Trustpilot</span>
                <span>·</span>
                <span className="text-emerald-600 font-semibold">Excellent</span>
              </div>
            </motion.div>

            {/* Partner logos */}
            <motion.div variants={childV} className="w-full">
              <p className="text-xs text-slate-400 font-medium mb-4 uppercase tracking-wider">
                {isAr ? 'موثوق من قِبل رواد الأعمال حول العالم' : 'Trusted by entrepreneurs worldwide'}
              </p>
              <div className="flex flex-wrap items-center gap-6">
                {partnerLogos.map((logo) => (
                  <span
                    key={logo.name}
                    className="text-slate-300 font-bold text-lg tracking-tight hover:text-slate-400 transition-colors"
                    style={{ fontFamily: logo.name === 'stripe' ? '"Helvetica Neue", sans-serif' : 'inherit' }}
                  >
                    {logo.text}
                  </span>
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* ── RIGHT COLUMN (45%) — World Map + Mascot + Country Pins ─────── */}
          <motion.div
            className="w-full lg:w-[45%] relative flex items-center justify-center h-[350px] sm:h-[450px] lg:h-[520px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.8 }}
          >
            {/* World map dots background */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="relative w-full h-full">
                <WorldMapDots />
              </div>
            </div>

            {/* Mascot — floating animation */}
            <motion.div
              className="relative z-10 w-[240px] sm:w-[320px] lg:w-[380px] xl:w-[420px] drop-shadow-[0_35px_50px_rgba(0,0,0,0.14)]"
              animate={{ y: [-12, 8, -12] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
            >
              <img
                src="/mascot-hero.png"
                alt="Instant Grow Mascot"
                className="w-full h-auto select-none"
              />
            </motion.div>

            {/* Country pin cards */}
            <PinCard flag="🇺🇸" country="USA" label="LLC Formation" style={{ top: '8%', left: '0%' }} delay={0} />
            <PinCard flag="🇬🇧" country="UK" label="LTD Company" style={{ top: '8%', right: '-4%' }} delay={0.15} />
            <PinCard flag="🇦🇪" country="UAE" label="Business Setup" style={{ bottom: '22%', left: '-2%' }} delay={0.3} />
            <PinCard flag="🇦🇺" country="Australia" label="Company Setup" style={{ bottom: '22%', right: '-4%' }} delay={0.45} />
          </motion.div>
        </div>

        {/* ── DASHBOARD MOCKUP — overlaps next section ────────────────────── */}
        <motion.div
          className="relative max-w-[1200px] mx-auto mt-12 md:mt-20 z-20 -mb-20 md:-mb-36 px-4 sm:px-6 lg:px-8"
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.9, ease }}
        >
          {/* Glow behind dashboard */}
          <div className="absolute -inset-10 rounded-[40px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(37,99,235,0.15) 0%, transparent 70%)', filter: 'blur(35px)' }} />

          {/* Browser frame */}
          <div
            className="relative bg-white overflow-hidden"
            style={{ borderRadius: 32, boxShadow: '0 60px 150px rgba(15,23,42,0.18), 0 0 0 1px rgba(229,231,235,0.8)' }}
          >
            {/* Chrome bar */}
            <div className="bg-white border-b border-gray-100 px-6 py-4.5 flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3.5 h-3.5 rounded-full bg-red-400/80" />
                <div className="w-3.5 h-3.5 rounded-full bg-amber-400/80" />
                <div className="w-3.5 h-3.5 rounded-full bg-emerald-400/80" />
              </div>
              <div className="flex-1 bg-slate-50 rounded-lg h-8.5 flex items-center justify-center border border-slate-100 max-w-[360px] mx-auto">
                <span className="text-xs text-slate-400 font-medium">app.instantgrow.net/dashboard</span>
              </div>
              <div className="w-14" />
            </div>

            {/* Dashboard body */}
            <div className="flex" style={{ minHeight: 340 }}>
              {/* Sidebar */}
              <div className="hidden sm:flex flex-col w-56 bg-[#0a0f1e] p-4 gap-1">
                <div className="flex items-center gap-2 px-3 py-3 mb-4">
                  <img src="/logo.png" alt="Instant Grow" className="h-7 w-auto brightness-0 invert" onError={() => {}} />
                </div>
                {['Dashboard', 'My Company', 'Documents', 'Compliance', 'Payments', 'Support'].map((item, i) => (
                  <div
                    key={item}
                    className={`flex items-center gap-3 px-3 py-3 rounded-xl text-xs font-semibold transition-colors ${
                      i === 0 ? 'bg-blue-600 text-white' : 'text-white/40 hover:text-white/70'
                    }`}
                  >
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="flex-1 bg-slate-50/30 p-6 sm:p-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs text-slate-400">Welcome back, John 👋</p>
                    <h3 className="text-base font-bold text-slate-800 mt-0.5">What's happening with your business</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs font-bold">J</div>
                  </div>
                </div>

                {/* Metric cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {[
                    { label: 'Formation Status', value: 'In Progress', color: 'bg-amber-400', w: '65%', chip: 'amber' },
                    { label: 'EIN Status', value: 'Completed', color: 'bg-emerald-400', w: '100%', chip: 'green' },
                    { label: 'Documents', value: '3 of 5', color: 'bg-blue-400', w: '60%', chip: 'blue' },
                    { label: 'Compliance', value: 'Up to date', color: 'bg-emerald-400', w: '100%', chip: 'green' },
                  ].map((m) => (
                    <div key={m.label} className="bg-white rounded-xl p-4 border border-gray-100 shadow-sm">
                      <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wide mb-1">{m.label}</p>
                      <p className="text-sm font-semibold text-slate-800">{m.value}</p>
                      <div className="mt-2.5 h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full rounded-full ${m.color}`} style={{ width: m.w }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Activity table */}
                <div className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-700">Recent Activity</span>
                    <span className="text-[11px] text-blue-500 font-medium cursor-pointer hover:underline">View all →</span>
                  </div>
                  <div className="space-y-3">
                    {[
                      { icon: '✅', text: 'LLC Formation Submitted', time: 'Completed', color: 'text-emerald-600' },
                      { icon: '🔄', text: 'EIN Application', time: 'In Review', color: 'text-amber-600' },
                      { icon: '📄', text: 'Operating Agreement', time: 'Pending', color: 'text-blue-600' },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <span className="text-base">{row.icon}</span>
                        <span className="flex-1 text-xs text-slate-600 font-medium">{row.text}</span>
                        <span className={`text-[11px] font-semibold ${row.color}`}>{row.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Floating notification cards */}
          <NotifCard
            icon="✅" title="EIN Approved"
            subtitle="Your tax ID has been successfully issued"
            bgColor="#ECFDF5"
            style={{ top: '15%', left: '-6%' }}
            delay={0.1}
          />
          <NotifCard
            icon="⚡" title="Stripe Connected"
            subtitle="Ready to accept payments"
            bgColor="#F5F3FF"
            style={{ bottom: '20%', left: '-4%' }}
            delay={0.3}
          />
          <NotifCard
            icon="🏦" title="Bank Account Ready"
            subtitle="Open US bank account remotely"
            bgColor="#EFF6FF"
            style={{ top: '15%', right: '-6%' }}
            delay={0.2}
          />
          <NotifCard
            icon="🛡️" title="Business Verified"
            subtitle="Your business is all set to go"
            bgColor="#ECFDF5"
            style={{ bottom: '20%', right: '-4%' }}
            delay={0.4}
          />
        </motion.div>
      </div>
    </section>
  )
}

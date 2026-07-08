import { useRef, useEffect, useState, useCallback } from 'react'
import { Star, ArrowRight, CheckCircle, Phone } from 'lucide-react'
import { motion, useMotionValue, useTransform } from 'framer-motion'
import { useLang } from '../i18n/LanguageContext'
import { useSiteContent } from '../hooks/useSiteContent'

/* ── Types ─────────────────────────────────────────────────────────────────── */
interface NodeDef { id: string; x: number; y: number; flagSrc: string; label: string; sub: string; color: string }
interface ArcDef  { from: string; to: string; cx: number; cy: number; dur: number }

/* ── SVG Viewbox ────────────────────────────────────────────────────────────── */
const VW = 900
const VH = 480

/* ── Map node positions (scaled to VW × VH) ───────────────────────────────── */
const NODES: NodeDef[] = [
  { id: 'usa', x: 105,  y: 195, flagSrc: 'https://flagcdn.com/w40/us.png', label: 'USA',  sub: 'LLC Formation',  color: '#2563EB' },
  { id: 'uk',  x: 390,  y: 100, flagSrc: 'https://flagcdn.com/w40/gb.png', label: 'UK',   sub: 'LTD Company',    color: '#7C3AED' },
  { id: 'uae', x: 580,  y: 205, flagSrc: 'https://flagcdn.com/w40/ae.png', label: 'UAE',  sub: 'Business Setup', color: '#059669' },
  { id: 'aus', x: 665,  y: 295, flagSrc: 'https://flagcdn.com/w40/om.png', label: 'Oman', sub: 'Company Setup',  color: '#DC2626' },
]

// Oman is SE of UAE on the Arabian Peninsula — positioned correctly relative to VW/VH
const ARCS: ArcDef[] = [
  { from: 'usa', to: 'uk',  cx: 245,  cy:  22, dur: 6.0 },
  { from: 'usa', to: 'uae', cx: 350,  cy:  28, dur: 7.5 },
  { from: 'usa', to: 'aus', cx: 400,  cy: 440, dur: 9.0 },
  { from: 'uk',  to: 'uae', cx: 490,  cy:  55, dur: 5.5 },
  { from: 'uk',  to: 'aus', cx: 540,  cy:  42, dur: 7.0 },
]

const nodePos = (id: string) => NODES.find(n => n.id === id)!

function arcPath(arc: ArcDef) {
  const f = nodePos(arc.from); const t = nodePos(arc.to)
  return `M${f.x},${f.y} Q${arc.cx},${arc.cy} ${t.x},${t.y}`
}


/* ── World Map Dots ─────────────────────────────────────────────────────────── */
function WorldDots() {
  // Generate dots only inside continental landmasses
  const landMasks = [
    // North America
    { cx: 110, cy: 130, rx: 125, ry: 90 },
    { cx: 130, cy: 220, rx: 82,  ry: 75 },
    { cx: 170, cy: 295, rx: 52,  ry: 38 },
    // South America
    { cx: 200, cy: 365, rx: 62,  ry: 85 },
    // Europe
    { cx: 400, cy: 118, rx: 72,  ry: 62 },
    // Africa
    { cx: 440, cy: 295, rx: 75,  ry: 105 },
    // Middle East
    { cx: 570, cy: 215, rx: 60,  ry: 55 },
    // Asia main
    { cx: 655, cy: 148, rx: 168, ry: 112 },
    // SE Asia
    { cx: 740, cy: 270, rx: 82,  ry: 68 },
    // Australia
    { cx: 815, cy: 362, rx: 85,  ry: 52 },
    // Greenland
    { cx: 300, cy: 52,  rx: 48,  ry: 40 },
    // Japan
    { cx: 850, cy: 165, rx: 28,  ry: 32 },
  ]

  const dots: { x: number; y: number }[] = []
  const STEP = 18
  for (let x = 10; x < VW; x += STEP) {
    for (let y = 10; y < VH; y += STEP) {
      for (const m of landMasks) {
        const dx = (x - m.cx) / m.rx
        const dy = (y - m.cy) / m.ry
        if (dx * dx + dy * dy <= 1) {
          dots.push({ x: x + (Math.random() - 0.5) * 4, y: y + (Math.random() - 0.5) * 4 })
          break
        }
      }
    }
  }

  return (
    <>
      {dots.map((d, i) => (
        <circle
          key={i}
          cx={d.x} cy={d.y} r={2.2}
          fill="#2563EB"
          opacity={0.18 + Math.random() * 0.12}
        />
      ))}
    </>
  )
}


/* ── Floating Card (HTML overlay above SVG) ───────────────────────────────── */
interface CardProps { node: NodeDef; highlighted: boolean }
function CountryCard({ node, highlighted }: CardProps) {
  const leftPct = (node.x / VW) * 100
  const topPct  = (node.y / VH) * 100

  return (
    <motion.div
      className="absolute z-30 flex items-center gap-2.5 bg-white/95 backdrop-blur-sm border border-white/80 rounded-2xl px-3 py-2.5 cursor-default"
      style={{
        left: `${leftPct}%`,
        top:  `${topPct}%`,
        transform: 'translate(-50%, -130%)',
        boxShadow: highlighted
          ? `0 4px 28px ${node.color}33, 0 1px 8px rgba(0,0,0,0.08)`
          : '0 4px 20px rgba(0,0,0,0.07), 0 1px 6px rgba(0,0,0,0.04)',
        minWidth: 140,
        border: highlighted ? `1px solid ${node.color}40` : '1px solid rgba(226,232,240,0.8)',
        transition: 'box-shadow 0.4s ease, border-color 0.4s ease',
      }}
      animate={{ y: [0, -7, 0] }}
      transition={{
        duration: 3.5 + NODES.indexOf(node) * 0.7,
        repeat: Infinity,
        ease: 'easeInOut',
        delay: NODES.indexOf(node) * 0.9,
      }}
      whileHover={{ scale: 1.05, y: -10 }}
    >
      <img
        src={node.flagSrc}
        alt={node.label}
        className="w-7 h-5 rounded object-cover shrink-0"
        style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.12)' }}
      />
      <div className="min-w-0">
        <p className="text-[13px] font-bold text-slate-800 leading-none">{node.label}</p>
        <p className="text-[11px] text-slate-500 mt-0.5 truncate">{node.sub}</p>
      </div>
      {highlighted && (
        <motion.div
          className="w-1.5 h-1.5 rounded-full ml-0.5 shrink-0"
          style={{ background: node.color }}
          animate={{ scale: [1, 1.8, 1], opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 0.7, repeat: Infinity }}
        />
      )}
    </motion.div>
  )
}

/* ── Main Global Network Map ─────────────────────────────────────────────── */
function GlobalNetworkMap({ isMobile = false }: { isMobile?: boolean }) {
  const containerRef = useRef<HTMLDivElement>(null)
  const mouseX = useMotionValue(0)
  const mouseY = useMotionValue(0)
  const rotateX = useTransform(mouseY, [-180, 180], [3, -3])
  const rotateY = useTransform(mouseX, [-180, 180], [-4, 4])

  const [pulseKey, setPulseKey] = useState(0)
  const [highlighted, setHighlighted] = useState<Set<string>>(new Set())
  const [activeArc, setActiveArc] = useState(-1)

  // Pulse + highlight cycle
  useEffect(() => {
    let i = 0
    const visibleArcs = isMobile ? ARCS.slice(0, 2) : ARCS
    const interval = setInterval(() => {
      if (visibleArcs.length === 0) return
      i = (i + 1) % visibleArcs.length
      setPulseKey(k => k + 1)
      setActiveArc(i)
      const arcObj = visibleArcs[i]
      if (!arcObj) return
      const f = nodePos(arcObj.from)
      const t = nodePos(arcObj.to)
      if (!f || !t) return
      setHighlighted(new Set([f.id, t.id]))
      setTimeout(() => { setHighlighted(new Set()); setActiveArc(-1) }, 3000)
    }, 3500)
    return () => clearInterval(interval)
  }, [isMobile])

  const handleMouse = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    mouseX.set(e.clientX - rect.left - rect.width / 2)
    mouseY.set(e.clientY - rect.top - rect.height / 2)
  }, [mouseX, mouseY])

  const resetMouse = useCallback(() => { mouseX.set(0); mouseY.set(0) }, [mouseX, mouseY])

  const visibleArcs = isMobile ? ARCS.slice(0, 2) : ARCS

  return (
    <div
      ref={containerRef}
      className="w-full h-full relative"
      onMouseMove={handleMouse}
      onMouseLeave={resetMouse}
      style={{ perspective: 1200 }}
    >
      {/* Ambient glow behind map */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse 75% 70% at 55% 50%, rgba(37,99,235,0.08) 0%, rgba(124,58,237,0.04) 50%, transparent 80%)',
          filter: 'blur(30px)',
        }}
      />

      <motion.div
        className="relative w-full h-full"
        style={{
          rotateX,
          rotateY,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
        }}
      >
        {/* SVG map layer */}
        <svg
          viewBox={`0 0 ${VW} ${VH}`}
          className="absolute inset-0 w-full h-full"
          style={{ overflow: 'visible' }}
          preserveAspectRatio="xMidYMid meet"
        >
          <defs>
            <filter id="arc-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="node-glow" x="-80%" y="-80%" width="360%" height="360%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <radialGradient id="bg-glow" cx="55%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#2563EB" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#2563EB" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Background glow */}
          <rect width={VW} height={VH} fill="url(#bg-glow)" />

          {/* World dots */}
          <WorldDots />

          {/* Connection arcs */}
          {visibleArcs.map((arc, i) => {
            const d = arcPath(arc)
            const isActive = activeArc === i
            const color = isActive ? NODES.find(n => n.id === arc.from)?.color ?? '#2563EB' : '#2563EB'
            // Approx path length for animation
            const f = nodePos(arc.from); const t = nodePos(arc.to)
            const dx = t.x - f.x; const dy = t.y - f.y
            const approxLen = Math.sqrt(dx*dx + dy*dy) * 1.4
            return (
              <g key={i}>
                {/* Glow layer */}
                <path
                  d={d} fill="none"
                  stroke={color}
                  strokeWidth={isActive ? 6 : 4}
                  opacity={isActive ? 0.15 : 0.06}
                  strokeLinecap="round"
                  filter="url(#arc-glow)"
                  style={{ transition: 'opacity 0.4s, stroke-width 0.4s' }}
                />
                {/* Dashed animated arc */}
                <path
                  d={d} fill="none"
                  stroke={color}
                  strokeWidth={isActive ? 2 : 1.6}
                  strokeLinecap="round"
                  strokeDasharray="10 7"
                  opacity={isActive ? 0.7 : 0.35}
                  style={{ transition: 'opacity 0.4s, stroke-width 0.4s' }}
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    from={`${approxLen}`}
                    to="0"
                    dur={`${arc.dur}s`}
                    repeatCount="indefinite"
                  />
                </path>
              </g>
            )
          })}

          {/* Travelling dots via animateMotion */}
          {visibleArcs.map((arc, i) => {
            const d = arcPath(arc)
            const nodeColor = NODES.find(n => n.id === arc.from)?.color ?? '#2563EB'
            return (
              <g key={`travel-${i}`}>
                <path id={`arc-path-${i}`} d={d} fill="none" stroke="none" />
                {/* Outer glow */}
                <circle r={7} fill={nodeColor} opacity={0.12}>
                  <animateMotion
                    dur={`${arc.dur}s`}
                    repeatCount="indefinite"
                    begin={`${i * 1.1}s`}
                    calcMode="spline"
                    keySplines="0.42 0 0.58 1"
                    keyTimes="0;1"
                  >
                    <mpath href={`#arc-path-${i}`} />
                  </animateMotion>
                </circle>
                {/* White dot */}
                <circle r={3.5} fill="white" stroke={nodeColor} strokeWidth={2}>
                  <animateMotion
                    dur={`${arc.dur}s`}
                    repeatCount="indefinite"
                    begin={`${i * 1.1}s`}
                    calcMode="spline"
                    keySplines="0.42 0 0.58 1"
                    keyTimes="0;1"
                  >
                    <mpath href={`#arc-path-${i}`} />
                  </animateMotion>
                </circle>
              </g>
            )
          })}

          {/* Node circles */}
          {NODES.map(node => {
            const isH = highlighted.has(node.id)
            return (
              <g key={node.id} filter="url(#node-glow)">
                {/* Outer pulse */}
                <motion.circle
                  cx={node.x} cy={node.y} r={18}
                  fill="none"
                  stroke={node.color}
                  strokeWidth={1.5}
                  opacity={isH ? 0.4 : 0.15}
                  animate={{ r: [14, 24, 14], opacity: isH ? [0.5, 0.1, 0.5] : [0.2, 0.05, 0.2] }}
                  transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: NODES.indexOf(node) * 0.4 }}
                  style={{ transition: 'opacity 0.4s' }}
                />
                {/* Middle ring */}
                <circle
                  cx={node.x} cy={node.y} r={11}
                  fill={`${node.color}18`}
                  stroke={node.color}
                  strokeWidth={1.8}
                />
                {/* Center dot */}
                <circle cx={node.x} cy={node.y} r={5} fill={node.color} />
                <circle cx={node.x} cy={node.y} r={2.5} fill="white" />
              </g>
            )
          })}

          {/* Pulse wave on active arc highlight */}
          {activeArc >= 0 && (() => {
            const activeArcObj = visibleArcs[activeArc]
            const srcNode = activeArcObj ? nodePos(activeArcObj.from) : null
            if (!srcNode) return null
            return (
              <motion.circle
                key={pulseKey}
                cx={srcNode.x}
                cy={srcNode.y}
                r={12}
                fill="none"
                stroke={srcNode.color}
                strokeWidth={2}
                initial={{ r: 12, opacity: 0.8 }}
                animate={{ r: 60, opacity: 0 }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
              />
            )
          })()}
        </svg>

        {/* Country cards as HTML overlay — positioned using same % math as SVG */}
        {!isMobile && (
          <div className="absolute inset-0" style={{ pointerEvents: 'none' }}>
            <div className="relative w-full h-full" style={{ pointerEvents: 'auto' }}>
              {NODES.map(node => (
                <CountryCard
                  key={node.id}
                  node={node}
                  highlighted={highlighted.has(node.id)}
                />
              ))}
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

/* ── Animation variants ───────────────────────────────────────────────────── */
const ease = [0.16, 1, 0.3, 1] as const

const containerV = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
}
const childV = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease } },
}

/* ── Hero ─────────────────────────────────────────────────────────────────── */
export default function Hero() {
  const { t, lang } = useLang()
  const isAr = lang === 'ar'
  const h = t.hero
  const { content } = useSiteContent()
  const val = (k: string) => isAr ? content[k]?.value_ar : content[k]?.value_en

  const trustBadges = [
    { text: '100% Online' },
    { text: 'Fast & Secure' },
    { text: 'Trusted by 2,500+ Entrepreneurs' },
    { text: 'Money-Back Guarantee' },
  ]

  return (
    <section className="relative bg-white overflow-hidden pt-20 pb-10 sm:pt-24 sm:pb-12 lg:pt-32 lg:pb-16 flex flex-col justify-center">
      {/* Background blobs — capped to prevent overflow */}
      <div
        className="absolute top-0 left-0 w-[min(650px,100vw)] h-[400px] sm:h-[550px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 0% 0%, rgba(37,99,235,0.07) 0%, transparent 70%)', filter: 'blur(70px)' }}
      />
      <div
        className="absolute top-0 right-0 w-[min(600px,100vw)] h-[350px] sm:h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at 100% 0%, rgba(99,102,241,0.05) 0%, transparent 70%)', filter: 'blur(90px)' }}
      />
      {/* Subtle grid */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: 'linear-gradient(rgba(37,99,235,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(37,99,235,0.5) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative z-10 max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-0">

          {/* ── LEFT COLUMN ──────────────────────────────────────────────── */}
          <motion.div
            className={`w-full lg:w-[52%] flex flex-col items-center text-center lg:pr-10 xl:pr-16 shrink-0 ${
              isAr
                ? 'lg:items-end lg:text-right lg:pl-10 xl:pl-16 lg:pr-0 lg:pl-0'
                : 'lg:items-start lg:text-left'
            }`}
            variants={containerV}
            initial="hidden"
            animate="visible"
          >
            {/* Badge */}
            <motion.div variants={childV}>
              <span className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-600 text-[11px] sm:text-xs font-semibold px-3 sm:px-4 py-2 rounded-full mb-5 sm:mb-6 max-w-[90vw] text-center">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse shrink-0" />
                {isAr ? 'تأسيس LLC في 1-2 يوم عمل' : '#1 Online LLC Formation Service for Global Entrepreneurs'}
              </span>
            </motion.div>

            {/* H1 — Mobile: 40px, Tablet: 56px, Desktop: 72px */}
            <motion.h1
              variants={childV}
              className="ig-hero-title text-[#0F172A] mb-5 sm:mb-6"
            >
              {val('hero_headline') || (
                <>
                  {isAr ? 'أطلق عملك' : 'Launch Your Business'}
                  <br />
                  {isAr ? 'من ' : 'From '}
                  <span className="text-[#2563EB]">
                    {isAr ? 'أي مكان في العالم' : 'Anywhere in the World'}
                  </span>
                </>
              )}
            </motion.h1>

            {/* Sub */}
            <motion.p
              variants={childV}
              className="ig-body text-slate-500 max-w-[540px] mb-7 sm:mb-8"
            >
              {val('hero_subheadline') || h.subheadline}
            </motion.p>

            {/* CTAs — Full-width stacked on mobile, row on sm+ */}
            <motion.div variants={childV} className="flex flex-col sm:flex-row items-stretch gap-3 sm:gap-4 w-full sm:w-auto mb-7 sm:mb-8">
              <a
                href="/order"
                className="group relative inline-flex items-center justify-center gap-2 bg-[#2563EB] hover:bg-[#1d4ed8] text-white font-semibold text-[15px] sm:text-base px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl transition-all duration-200 shadow-[0_4px_24px_rgba(37,99,235,0.32)] hover:shadow-[0_6px_32px_rgba(37,99,235,0.42)] w-full sm:w-auto text-center min-h-[48px]"
              >
                {val('hero_cta') || (isAr ? 'تأسيس شركتي' : 'Form My LLC')}
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform duration-200 shrink-0" />
              </a>
              <a
                href="https://cal.com/instant-grow-llc/15min"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 bg-white border border-gray-200 text-slate-700 font-semibold text-[15px] sm:text-base px-6 sm:px-8 py-3 sm:py-3.5 rounded-2xl hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200 shadow-sm w-full sm:w-auto text-center min-h-[48px]"
              >
                <Phone size={16} className="text-slate-400 shrink-0" />
                {isAr ? 'احجز مكالمة مجانية' : 'Book a Free Call'}
              </a>
            </motion.div>

            {/* Trust badges — 2 col on mobile */}
            <motion.div variants={childV} className="grid grid-cols-2 sm:flex sm:flex-wrap justify-center lg:justify-start gap-x-5 sm:gap-x-6 gap-y-3 mb-7 sm:mb-8 w-full">
              {trustBadges.map((b, i) => (
                <span key={i} className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-medium justify-center sm:justify-start">
                  <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                  {b.text}
                </span>
              ))}
            </motion.div>

            {/* Rating */}
            <motion.div variants={childV} className="flex flex-wrap items-center justify-center lg:justify-start gap-4 mb-8 sm:mb-0">
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

            {/* World Map for mobile viewports (centered single column) */}
            <div className="w-full mt-10 md:hidden relative max-w-lg mx-auto">
              <div className="w-full relative" style={{ aspectRatio: '900/480' }}>
                <GlobalNetworkMap isMobile={true} />
              </div>
              
              {/* Stacked country cards for mobile */}
              <div className="flex flex-wrap justify-center gap-3.5 mt-6">
                {NODES.map(node => (
                  <div
                    key={node.id}
                    className="flex items-center gap-2.5 bg-slate-50 border border-slate-200/60 rounded-2xl px-3.5 py-2 shadow-sm"
                  >
                    <img
                      src={node.flagSrc}
                      alt={node.label}
                      className="w-6 h-4 rounded object-cover shrink-0"
                    />
                    <div className="text-start">
                      <p className="text-xs font-bold text-slate-800 leading-none">{node.label}</p>
                      <p className="text-[10px] text-slate-400 mt-1">{node.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* ── RIGHT COLUMN — Global Network Visualization (desktop/tablet only) ───────────────── */}
          <motion.div
            className="hidden md:block w-full lg:w-[48%] relative"
            style={{ height: 'clamp(320px, 45vw, 560px)' }}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4, duration: 0.9, ease }}
          >
            <GlobalNetworkMap />
          </motion.div>

        </div>
      </div>
    </section>
  )
}

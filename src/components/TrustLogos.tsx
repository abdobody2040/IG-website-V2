import { motion } from 'framer-motion'

const logos = [
  { name: 'stripe', display: 'stripe', weight: '700', letterSpacing: '-0.02em' },
  { name: 'paypal', display: 'PayPal', weight: '700', letterSpacing: '0' },
  { name: 'wise', display: 'wise', weight: '700', letterSpacing: '-0.01em' },
  { name: 'brex', display: 'brex', weight: '700', letterSpacing: '-0.02em' },
  { name: 'mercury', display: 'mercury', weight: '600', letterSpacing: '-0.01em' },
  { name: 'shopify', display: 'Shopify', weight: '700', letterSpacing: '-0.01em' },
]

export default function TrustLogos() {
  // Repeat logos to guarantee wide coverage on all screens
  const baseLogos = [...logos, ...logos, ...logos, ...logos]

  return (
    <section className="bg-white border-y border-gray-100 py-6 sm:py-10 overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10">
        <motion.p
          className="text-center text-[11px] sm:text-[13px] font-semibold text-slate-400 uppercase tracking-widest mb-5 sm:mb-8"
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          Trusted by entrepreneurs worldwide
        </motion.p>
      </div>

      {/* Continuous marquee with explicit LTR container to prevent RTL gaps */}
      <div className="relative overflow-hidden w-full" style={{ direction: 'ltr' }}>
        {/* Fade edges */}
        <div
          className="absolute left-0 top-0 bottom-0 w-16 sm:w-32 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(90deg, white 0%, transparent 100%)' }}
        />
        <div
          className="absolute right-0 top-0 bottom-0 w-16 sm:w-32 z-10 pointer-events-none"
          style={{ background: 'linear-gradient(270deg, white 0%, transparent 100%)' }}
        />

        <div
          className="flex w-max"
          style={{
            animation: 'marquee 25s linear infinite',
            willChange: 'transform',
          }}
        >
          {/* Track Group 1 */}
          <div className="flex items-center gap-8 sm:gap-14 pr-8 sm:pr-14 shrink-0">
            {baseLogos.map((logo, i) => (
              <div
                key={`g1-${i}`}
                className="flex items-center justify-center shrink-0 opacity-35 hover:opacity-75 transition-opacity duration-300 cursor-default"
                style={{ minWidth: 60 }}
              >
                <span
                  className="text-[14px] sm:text-[18px]"
                  style={{
                    fontFamily: '"Sora", "Inter", -apple-system, sans-serif',
                    fontWeight: logo.weight,
                    letterSpacing: logo.letterSpacing,
                    color: '#0F172A',
                  }}
                >
                  {logo.display}
                </span>
              </div>
            ))}
          </div>

          {/* Track Group 2 (Identical duplicate for seamless 0-gap infinite loop) */}
          <div className="flex items-center gap-8 sm:gap-14 pr-8 sm:pr-14 shrink-0" aria-hidden="true">
            {baseLogos.map((logo, i) => (
              <div
                key={`g2-${i}`}
                className="flex items-center justify-center shrink-0 opacity-35 hover:opacity-75 transition-opacity duration-300 cursor-default"
                style={{ minWidth: 60 }}
              >
                <span
                  className="text-[14px] sm:text-[18px]"
                  style={{
                    fontFamily: '"Sora", "Inter", -apple-system, sans-serif',
                    fontWeight: logo.weight,
                    letterSpacing: logo.letterSpacing,
                    color: '#0F172A',
                  }}
                >
                  {logo.display}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}


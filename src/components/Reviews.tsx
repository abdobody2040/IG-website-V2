import { Star, ExternalLink, BadgeCheck } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import InfiniteMarquee from './effects/InfiniteMarquee'

const reviewMeta = [
  { name: 'Ahmed K.', initials: 'AK', company: 'Tech Founder, UAE', country: 'UAE', flag: '🇦🇪', color: '#2563EB', date: 'Mar 2026' },
  { name: 'Sara M.', initials: 'SM', company: 'E-commerce Owner, JO', country: 'Jordan', flag: '🇯🇴', color: '#7C3AED', date: 'Feb 2026' },
  { name: 'James T.', initials: 'JT', company: 'SaaS Founder, USA', country: 'USA', flag: '🇺🇸', color: '#059669', date: 'Jan 2026' },
  { name: 'Omar S.', initials: 'OS', company: 'Agency Owner, EG', country: 'Egypt', flag: '🇪🇬', color: '#D97706', date: 'Mar 2026' },
]

export default function Reviews() {
  const { t } = useLang()
  const r = t.reviews

  const ReviewCard = ({ review, i }: { review: { title: string; body: string }, i: number }) => {
    const meta = reviewMeta[i % reviewMeta.length]!
    return (
      <div
        className="w-[360px] flex-shrink-0 bg-white rounded-[24px] border border-gray-100 p-8 flex flex-col gap-5 group cursor-default"
        style={{
          boxShadow: '0 10px 30px rgba(15,23,42,0.08)',
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-4px)'
          e.currentTarget.style.boxShadow = '0 20px 60px rgba(15,23,42,0.12)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = '0 10px 30px rgba(15,23,42,0.08)'
        }}
      >
        {/* Stars */}
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, j) => (
            <Star key={j} size={16} className="fill-amber-400 text-amber-400" />
          ))}
        </div>

        {/* Quote title */}
        <h4 className="font-bold text-[#0F172A] text-base leading-snug">
          {review.title}
        </h4>

        {/* Body */}
        <p className="text-slate-500 text-sm leading-relaxed flex-1">
          {review.body}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0"
              style={{ background: meta.color }}
            >
              {meta.initials}
            </div>
            <div>
              <div className="flex items-center gap-1">
                <p className="text-sm font-semibold text-[#0F172A]">{meta.name}</p>
                <BadgeCheck size={13} className="text-blue-500 shrink-0" />
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {meta.flag} {meta.company}
              </p>
            </div>
          </div>
          {/* LinkedIn icon */}
          <a
            href="#"
            onClick={(e) => e.preventDefault()}
            className="text-[#0A66C2] hover:opacity-80 transition-opacity"
            aria-label="LinkedIn"
          >
            <ExternalLink size={15} />
          </a>
        </div>
      </div>
    )
  }

  return (
    <section id="reviews" className="ig-section bg-[#F8FAFC] overflow-hidden">
      <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 mb-14">
        {/* Header */}
        <div className="text-center">
          <h2
            className="text-4xl sm:text-[54px] font-bold text-[#0F172A] leading-tight tracking-tight mb-4"
            style={{ fontFamily: 'Sora, Inter, sans-serif' }}
          >
            {r.heading}
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-slate-500 max-w-xl mx-auto mb-8">{r.subheading}</p>

          {/* Rating summary */}
          <div className="flex flex-col items-center gap-2">
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} size={24} className="fill-[#00B67A] text-[#00B67A]" />
              ))}
            </div>
            <div className="flex items-center gap-3">
              <span className="text-2xl font-bold text-[#0F172A]">5.0</span>
              <span className="text-slate-400 text-sm">/ 5</span>
              <a
                href="https://www.trustpilot.com/review/instantgrow.net"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-slate-400 hover:text-blue-500 transition-colors"
              >
                {r.viewAll}
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Dual marquee */}
      <div className="space-y-6">
        <InfiniteMarquee duration={45}>
          {r.items.map((review, i) => (
            <ReviewCard key={i} review={review} i={i} />
          ))}
        </InfiniteMarquee>

        <InfiniteMarquee reverse duration={55}>
          {r.items.map((review, i) => (
            <ReviewCard key={i} review={review} i={(i + 2) % reviewMeta.length} />
          ))}
        </InfiniteMarquee>
      </div>

      {/* Trustpilot CTA */}
      <div className="text-center mt-10">
        <a
          href="https://www.trustpilot.com/review/instantgrow.net"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#00B67A] text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-[#00a56e] transition-colors shadow-[0_4px_16px_rgba(0,182,122,0.3)]"
        >
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => <Star key={i} size={10} className="fill-white text-white" />)}
          </div>
          {r.verified}
        </a>
      </div>
    </section>
  )
}

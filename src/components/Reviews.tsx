import { Star } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'
import InfiniteMarquee from './effects/InfiniteMarquee'

const reviewMeta = [
  { name: 'KK M', country: 'Egypt', date: 'Mar 6, 2026', initials: 'KK', company: 'TechCorp' },
  { name: 'El-Joudeh', country: 'United Kingdom', date: 'Mar 3, 2026', initials: 'EJ', company: 'Elite Services' },
  { name: 'Shahed Alkhateeb', country: 'Jordan', date: 'Feb 28, 2026', initials: 'SA', company: 'Alkhateeb Co.' },
  { name: 'Plantlyze Team', country: 'Egypt', date: 'Jan 25, 2026', initials: 'PT', company: 'Plantlyze' },
]

const avatarColors = ['#1a56ff', '#0a0f1e', '#059669', '#7C3AED']

export default function Reviews() {
  const { t } = useLang()
  const r = t.reviews

  return (
    <section id="reviews" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-4">
          <p className="text-sm font-semibold tracking-wider text-blue-500">{r.label}</p>
        </div>

        <h2 className="text-4xl sm:text-5xl font-bold text-[#0a0a0f] text-center mb-4">
          {r.heading}
        </h2>

        <p className="text-gray-500 text-center max-w-2xl mx-auto mb-6">
          {r.subheading}
        </p>

        <div className="flex flex-col items-center gap-2 mb-16">
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={28} className="fill-[#00B67A] text-[#00B67A]" />
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-[#0a0a0f]">5.0</span>
            <span className="text-gray-500 text-sm">/ 5</span>
            <a
              href="https://www.trustpilot.com/review/instantgrow.net"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-400 hover:text-blue-500 transition-colors ml-3"
            >
              {r.viewAll}
            </a>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <InfiniteMarquee duration={40}>
          {r.items.map((review, i) => (
            <div
              key={i}
              className="w-80 flex-shrink-0 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>

              <h4 className="font-semibold text-[#0a0a0f] text-sm mb-2 leading-snug">
                {review.title}
              </h4>

              <p className="text-gray-500 text-xs leading-relaxed mb-4">
                {review.body}
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: avatarColors[i % avatarColors.length] }}
                >
                  {reviewMeta[i]!.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0a0a0f]">{reviewMeta[i]!.name}</p>
                  <p className="text-xs text-gray-500 font-medium">{reviewMeta[i]!.company}</p>
                  <p className="text-xs text-gray-400">
                    {reviewMeta[i]!.country} &middot; {reviewMeta[i]!.date}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </InfiniteMarquee>

        <InfiniteMarquee reverse duration={50}>
          {r.items.map((review, i) => (
            <div
              key={i}
              className="w-80 flex-shrink-0 bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow p-6"
            >
              <div className="flex gap-0.5 mb-3">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={14} className="fill-amber-400 text-amber-400" />
                ))}
              </div>

              <h4 className="font-semibold text-[#0a0a0f] text-sm mb-2 leading-snug">
                {review.title}
              </h4>

              <p className="text-gray-500 text-xs leading-relaxed mb-4">
                {review.body}
              </p>

              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <div
                  className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
                  style={{ backgroundColor: avatarColors[i % avatarColors.length] }}
                >
                  {reviewMeta[i]!.initials}
                </div>
                <div>
                  <p className="text-sm font-medium text-[#0a0a0f]">{reviewMeta[i]!.name}</p>
                  <p className="text-xs text-gray-500 font-medium">{reviewMeta[i]!.company}</p>
                  <p className="text-xs text-gray-400">
                    {reviewMeta[i]!.country} &middot; {reviewMeta[i]!.date}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </InfiniteMarquee>
      </div>

      <div className="text-center mt-10">
        <a
          href="https://www.trustpilot.com/review/instantgrow.net"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-[#00B67A] text-white text-sm font-medium px-5 py-2.5 rounded-full hover:bg-[#00B67A]/90 transition-colors"
        >
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <Star key={i} size={10} className="fill-white text-white" />
            ))}
          </div>
          {r.verified}
        </a>
      </div>
    </section>
  )
}

import { useState, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  reverse?: boolean
  duration?: number
  gap?: string
  className?: string
}

export default function InfiniteMarquee({
  children,
  reverse = false,
  duration = 40,
  gap = 'gap-5 sm:gap-6',
  className = '',
}: Props) {
  const [isPaused, setIsPaused] = useState(false)

  return (
    <div
      className={`relative overflow-hidden w-full ${className}`}
      style={{ direction: 'ltr' }}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="flex w-max"
        style={{
          animationName: reverse ? 'marquee-reverse' : 'marquee',
          animationDuration: `${duration}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          animationPlayState: isPaused ? 'paused' : 'running',
          willChange: 'transform',
        }}
      >
        {/* Track Group 1 (3 repetitions of items for full-screen density) */}
        <div className={`flex items-center shrink-0 ${gap} pr-5 sm:pr-6`}>
          {children}
          {children}
          {children}
        </div>

        {/* Track Group 2 (Identical clone for seamless 0-gap loop) */}
        <div className={`flex items-center shrink-0 ${gap} pr-5 sm:pr-6`} aria-hidden="true">
          {children}
          {children}
          {children}
        </div>
      </div>
    </div>
  )
}

import { useState, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  reverse?: boolean
  duration?: number
}

export default function InfiniteMarquee({ children, reverse, duration = 40 }: Props) {
  const [isPaused, setIsPaused] = useState(false)

  return (
    <div
      className="relative overflow-hidden w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        className="flex gap-8 w-max"
        style={{
          animationName: reverse ? 'marquee-reverse' : 'marquee',
          animationDuration: `${duration}s`,
          animationTimingFunction: 'linear',
          animationIterationCount: 'infinite',
          animationPlayState: isPaused ? 'paused' : 'running',
        }}
      >
        {children}
        {children}
        {children}
        {children}
      </div>
    </div>
  )
}

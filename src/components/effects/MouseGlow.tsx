import { useEffect, useState } from 'react'

export default function MouseGlow() {
  const [pos, setPos] = useState({ x: -1000, y: -1000 })
  const [isDesktop, setIsDesktop] = useState(false)

  useEffect(() => {
    setIsDesktop(window.matchMedia('(pointer: fine)').matches)
    const handle = (e: MouseEvent) => setPos({ x: e.clientX, y: e.clientY })
    window.addEventListener('mousemove', handle, { passive: true })
    return () => window.removeEventListener('mousemove', handle)
  }, [])

  if (!isDesktop) return null

  return (
    <div className="pointer-events-none fixed inset-0 z-[9999]">
      <div
        className="absolute w-[700px] h-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: pos.x,
          top: pos.y,
          background: 'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)',
          transition: 'left 0.06s linear, top 0.06s linear',
        }}
      />
      {/* Secondary warmer glow */}
      <div
        className="absolute w-[400px] h-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full"
        style={{
          left: pos.x + 80,
          top: pos.y + 80,
          background: 'radial-gradient(circle, rgba(6,182,212,0.04) 0%, transparent 70%)',
          transition: 'left 0.1s linear, top 0.1s linear',
        }}
      />
    </div>
  )
}

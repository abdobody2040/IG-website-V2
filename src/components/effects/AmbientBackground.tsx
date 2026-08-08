// Pure CSS ambient background — zero JS runtime overhead
export default function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden hidden sm:block">
      <div
        className="absolute top-[10%] left-[10%] w-96 h-96 rounded-full bg-blue-500/10 blur-3xl"
        style={{ animation: 'ig-float 20s ease-in-out infinite' }}
      />
      <div
        className="absolute top-[60%] left-[70%] w-80 h-80 rounded-full bg-cyan-500/8 blur-3xl"
        style={{ animation: 'ig-float 25s ease-in-out infinite reverse' }}
      />
      <div
        className="absolute top-[80%] left-[50%] w-72 h-72 rounded-full bg-purple-500/8 blur-3xl"
        style={{ animation: 'ig-float 30s ease-in-out infinite 5s' }}
      />
    </div>
  )
}

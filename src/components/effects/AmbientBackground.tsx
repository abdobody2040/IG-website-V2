import { motion } from 'framer-motion'

const orbs = [
  { color: 'bg-blue-500/10', size: 'w-96 h-96', initial: { x: '10%', y: '20%' }, animate: { x: ['10%', '15%', '8%', '10%'], y: ['20%', '25%', '18%', '20%'] }, duration: 20 },
  { color: 'bg-cyan-500/8',  size: 'w-80 h-80', initial: { x: '70%', y: '60%' }, animate: { x: ['70%', '75%', '68%', '70%'], y: ['60%', '55%', '62%', '60%'] }, duration: 25 },
  { color: 'bg-purple-500/8', size: 'w-72 h-72', initial: { x: '50%', y: '80%' }, animate: { x: ['50%', '55%', '48%', '50%'], y: ['80%', '85%', '78%', '80%'] }, duration: 30 },
  { color: 'bg-white/5',     size: 'w-64 h-64', initial: { x: '80%', y: '10%' }, animate: { x: ['80%', '85%', '78%', '80%'], y: ['10%', '15%', '8%', '10%'] }, duration: 22 },
]

export default function AmbientBackground() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          className={`absolute rounded-full ${orb.color} ${orb.size} blur-3xl`}
          initial={orb.initial}
          animate={{
            x: orb.animate.x,
            y: orb.animate.y,
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  )
}

import { motion } from 'framer-motion'
import { Zap, Shield, FileText, ClipboardList, Bell, HeadphonesIcon } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { useLang } from '../i18n/LanguageContext'

const icons: LucideIcon[] = [Zap, Shield, FileText, ClipboardList, Bell, HeadphonesIcon]

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' as const } },
}

export default function Features() {
  const { t } = useLang()
  const f = t.features

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = (e.clientX - rect.left) / rect.width - 0.5
    const y = (e.clientY - rect.top) / rect.height - 0.5
    e.currentTarget.style.setProperty('--rotateX', `${y * -10}deg`)
    e.currentTarget.style.setProperty('--rotateY', `${x * 10}deg`)
  }

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty('--rotateX', '0deg')
    e.currentTarget.style.setProperty('--rotateY', '0deg')
  }

  const items = f.items.map((feature, index) => {
    const Icon = icons[index]!
    const isFeatured = index === 0

    return (
      <motion.div
        key={index}
        variants={itemVariants}
        className={`spotlight-card group relative rounded-2xl border bg-white transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 ${
          isFeatured
            ? 'md:col-span-2 md:row-span-2 bg-gradient-to-br from-blue-50/50 to-white border-blue-100/60 hover:border-blue-500/20'
            : 'border-gray-100 hover:border-blue-500/20'
        }`}
        style={{
          transform: 'perspective(800px) rotateX(var(--rotateX, 0deg)) rotateY(var(--rotateY, 0deg))',
          transition: 'transform 0.15s ease-out, box-shadow 0.3s ease, border-color 0.3s ease',
        }}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
      >
        <div className="relative z-10 p-6 h-full flex flex-col">
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: 'spring', stiffness: 400, damping: 10 }}
            className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center mb-4 group-hover:bg-blue-100 transition-colors"
          >
            <Icon size={20} className="text-blue-500" />
          </motion.div>
          <h3
            className="text-xl font-semibold text-[#0a0a0f] mb-2"
            style={{ fontFamily: 'Sora, Inter, sans-serif' }}
          >
            {feature.title}
          </h3>
          <p className="text-gray-500 leading-relaxed text-sm flex-1">
            {feature.description}
          </p>
        </div>
      </motion.div>
    )
  })

  return (
    <section id="features" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold tracking-wider text-blue-500 mb-4">{f.label}</p>
          <h2
            className="text-4xl sm:text-5xl font-bold text-[#0a0a0f] mb-4"
            style={{ fontFamily: 'Sora, Inter, sans-serif' }}
          >
            {f.heading}
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">{f.subheading}</p>
        </div>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-6xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
        >
          {items}
        </motion.div>
      </div>
    </section>
  )
}

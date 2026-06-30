import { Calendar, RefreshCw, Hash, FileEdit, Award, ArrowRight } from 'lucide-react'

const SERVICES = [
  {
    icon: Calendar,
    title: 'Annual Report Filing',
    price: '$149',
    period: 'per filing',
    description:
      'Stay compliant and avoid penalties. We handle your annual state report filing on time, every time.',
    badge: 'Most Popular',
  },
  {
    icon: RefreshCw,
    title: 'Registered Agent Renewal',
    price: '$99',
    period: 'per year',
    description:
      'Keep your registered agent service active to ensure you never miss important legal notices.',
    badge: null,
  },
  {
    icon: Hash,
    title: 'EIN Amendment',
    price: '$79',
    period: 'one-time',
    description:
      'Need to update your EIN information? We file the amendment with the IRS quickly and accurately.',
    badge: null,
  },
  {
    icon: FileEdit,
    title: 'Operating Agreement Update',
    price: '$49',
    period: 'per update',
    description:
    "Update your LLC's operating agreement to reflect ownership changes, new members, or policy updates.",
    badge: null,
  },
  {
    icon: Award,
    title: 'Certificate of Good Standing',
    price: '$79',
    period: 'per request',
    description:
      'Obtain an official Certificate of Good Standing from the state to prove your LLC is active and compliant.',
    badge: null,
  },
]

function ServiceCard({ icon: Icon, title, price, period, description, badge }: typeof SERVICES[0]) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md hover:border-[#1a56ff]/20 transition-all duration-200 group relative">
      {badge && (
        <span className="absolute top-4 right-4 bg-[#1a56ff] text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
          {badge}
        </span>
      )}
      <div className="w-12 h-12 rounded-xl bg-[#e8efff] text-[#1a56ff] flex items-center justify-center flex-shrink-0">
        <Icon size={22} />
      </div>
      <div className="flex-1">
        <h3 className="font-semibold text-gray-900 text-base" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
          {title}
        </h3>
        <div className="flex items-baseline gap-1 mt-1 mb-3">
          <span className="text-2xl font-bold text-[#1a56ff]">{price}</span>
          <span className="text-sm text-gray-400">{period}</span>
        </div>
        <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
      </div>
      <a
        href="mailto:info@instantgrow.net"
        className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border-2 border-[#1a56ff] text-[#1a56ff] text-sm font-semibold hover:bg-[#1a56ff] hover:text-white transition-all duration-200 group-hover:bg-[#1a56ff] group-hover:text-white"
      >
        Order Service
        <ArrowRight size={14} />
      </a>
    </div>
  )
}

export default function ServicesPage() {
  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
          Add-On Services
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Keep your LLC compliant and up to date with our professional services.
        </p>
      </div>

      {/* Info banner */}
      <div className="bg-[#e8efff] border border-[#1a56ff]/20 rounded-2xl p-4 flex gap-3 items-center mb-8">
        <div className="w-8 h-8 rounded-lg bg-[#1a56ff] flex items-center justify-center flex-shrink-0">
          <ArrowRight size={14} className="text-white" />
        </div>
        <p className="text-sm text-[#1a40b0]">
          Click <strong>"Order Service"</strong> to contact our team at{' '}
          <a href="mailto:info@instantgrow.net" className="font-semibold underline hover:no-underline">
            info@instantgrow.net
          </a>{' '}
          and we'll get you set up right away.
        </p>
      </div>

      {/* Services grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {SERVICES.map(svc => <ServiceCard key={svc.title} {...svc} />)}
      </div>
    </div>
  )
}

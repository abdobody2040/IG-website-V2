import { Building2, Hash, MapPin, Calendar, UserCheck, BadgeCheck, Clock } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useCompanies } from '../../hooks/useCompanies'
import type { Company } from '../../types/db'
import { formatDate } from './statusUtils'

function EmptyCompany() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-3xl bg-[#e8efff] flex items-center justify-center text-[#1a56ff] mb-5">
        <Building2 size={36} />
      </div>
      <h3 className="font-semibold text-gray-900 text-xl mb-2">No company yet</h3>
      <p className="text-gray-500 text-sm max-w-sm leading-relaxed">
        Your company details will appear here once your LLC is formed.
        Place an order to get started!
      </p>
    </div>
  )
}

function InfoCard({ icon: Icon, label, value, accent = false }: {
  icon: React.ElementType; label: string; value: string; accent?: boolean
}) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex items-start gap-4">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
        accent ? 'bg-[#e8efff] text-[#1a56ff]' : 'bg-gray-50 text-gray-400'
      }`}>
        <Icon size={18} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-base font-semibold text-gray-900 mt-1 truncate">{value || '—'}</p>
      </div>
    </div>
  )
}

function CompanyDetail({ company }: { company: Company }) {
  const statusColor = company.status === 'active'
    ? 'text-green-600 bg-green-50'
    : 'text-yellow-600 bg-yellow-50'

  return (
    <div className="space-y-6">
      {/* Company name hero */}
      <div className="bg-gradient-to-br from-[#0a0f1e] to-[#1a2040] rounded-2xl p-7 text-white">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-[#1a56ff] flex items-center justify-center font-bold text-white text-sm flex-shrink-0">
            {company.companyName?.[0] ?? 'C'}
          </div>
          <div>
            <h2 className="text-xl font-bold" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
              {company.companyName}
            </h2>
            <p className="text-white/50 text-sm">{company.companyType}</p>
          </div>
        </div>
        <span className={`mt-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {company.status ?? 'Active'}
        </span>
      </div>

      {/* Info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <InfoCard icon={Building2}  label="Company Name"      value={company.companyName}      accent />
        <InfoCard icon={MapPin}     label="State"             value={company.state} />
        <InfoCard icon={Hash}       label="EIN Number"        value={company.einNumber} />
        <InfoCard icon={Calendar}   label="Formation Date"    value={formatDate(company.formationDate)} />
        <InfoCard icon={UserCheck}  label="Registered Agent"  value={company.registeredAgent} />
        <InfoCard icon={BadgeCheck} label="Company Type"      value={company.companyType} />
        <InfoCard icon={Clock}      label="Member Since"      value={formatDate(company.createdAt)} />
      </div>
    </div>
  )
}

export default function CompanyPage() {
  const { user } = useAuth()
  const { companies, isLoading } = useCompanies(user?.id)

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto animate-fade-in">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
          My Company
        </h1>
        <p className="text-gray-500 text-sm mt-1">View your LLC formation details.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-[3px] border-[#1a56ff]/20 border-t-[#1a56ff] rounded-full animate-spin" />
        </div>
      ) : companies.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <EmptyCompany />
        </div>
      ) : (
        companies[0] && <CompanyDetail company={companies[0]} />
      )}
    </div>
  )
}

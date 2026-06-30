import { AlertCircle, Building2, Calendar, FileClock, Home, Mail, Phone, Plus, RefreshCw, User, Users } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import ClientLayout from './ClientLayout'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { useCompanies } from '../../hooks/useCompanies'
import { useAuth } from '../../hooks/useAuth'
import { useLang } from '../../i18n/LanguageContext'
import type { Company } from '../../types/db'

function useTranslations() {
  const { t } = useLang()
  const cp = t.client.companyPage
  const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    pending:   { label: cp.statusPending,  color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200' },
    active:    { label: cp.statusActive,   color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200' },
    completed: { label: cp.statusActive,   color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200' },
    cancelled: { label: cp.statusCancelled, color: 'text-red-700',   bg: 'bg-red-50',    border: 'border-red-200' },
  }
  const COMPLIANCE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
    not_started: { label: cp.complianceNotStarted, color: 'text-slate-700', bg: 'bg-slate-50', border: 'border-slate-200' },
    up_to_date:  { label: cp.complianceUpToDate,   color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
    due_soon:    { label: cp.complianceDueSoon,    color: 'text-amber-700', bg: 'bg-amber-50', border: 'border-amber-200' },
    overdue:     { label: cp.complianceOverdue,    color: 'text-red-700',   bg: 'bg-red-50',   border: 'border-red-200' },
    completed:   { label: cp.complianceCompleted,  color: 'text-green-700', bg: 'bg-green-50', border: 'border-green-200' },
  }
  return { t, cp, STATUS_CONFIG, COMPLIANCE_CONFIG }
}

function formatDate(date: string | null | undefined) {
  return date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Not set'
}

function dueTone(date: string | null | undefined) {
  if (!date) return 'text-slate-500'
  const due = new Date(date)
  const today = new Date()
  const days = Math.ceil((due.getTime() - today.getTime()) / 86_400_000)
  if (days < 0) return 'text-red-600'
  if (days <= 30) return 'text-amber-600'
  return 'text-slate-900'
}

function ComplianceCard({ company }: { company: Company }) {
  const { cp, COMPLIANCE_CONFIG } = useTranslations()
  const cfg = COMPLIANCE_CONFIG[company.complianceStatus] ?? COMPLIANCE_CONFIG['not_started']!
  const items = [
    { label: cp.companyRenewal, value: company.renewalDueDate, icon: RefreshCw },
    { label: cp.annualReport, value: company.annualReportDueDate, icon: FileClock },
    { label: cp.taxFiling, value: company.taxFilingDueDate, icon: Calendar },
    { label: cp.registeredAgent, value: company.registeredAgentRenewalDate, icon: User },
  ]

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-[#1a56ff]" />
          <h3 className="text-base font-semibold text-slate-900">{cp.renewalsCompliance}</h3>
        </div>
        <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
          {cfg.label}
        </span>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
        {items.map(item => {
          const Icon = item.icon
          return (
            <div key={item.label} className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center">
                  <Icon size={13} className="text-slate-500" />
                </div>
                <p className="text-xs text-slate-500">{item.label}</p>
              </div>
              <p className={`text-sm font-semibold ${dueTone(item.value)}`}>{formatDate(item.value)}</p>
            </div>
          )
        })}
      </div>
      {company.complianceNotes && (
        <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-start gap-2">
          <AlertCircle size={14} className="text-slate-400 mt-0.5" />
          <p className="text-xs text-slate-600">{company.complianceNotes}</p>
        </div>
      )}
    </div>
  )
}

function CompanyCard({ company, userEmail }: { company: Company; userEmail?: string }) {
  const { t, cp, STATUS_CONFIG } = useTranslations()
  const statusCfg = STATUS_CONFIG[company.status] ?? STATUS_CONFIG['pending']!
  const formationFmt = company.formationDate
    ? new Date(company.formationDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : 'March 29, 2026'

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
      <div className="grid grid-cols-4 border-b border-slate-100">
        {[
          { label: cp.serviceStatus, value: <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${statusCfg.bg} ${statusCfg.border} ${statusCfg.color}`}>{statusCfg.label} <span className="text-slate-400 font-normal cursor-default">\u00b7</span></span> },
          { label: cp.formationDate, value: formationFmt },
          { label: cp.einNumber, value: company.einNumber || cp.pending },
          { label: cp.entityType, value: company.companyType || 'LLC' },
        ].map(item => (
          <div key={item.label} className="px-5 py-4 border-r border-slate-100 last:border-r-0">
            <p className="text-xs text-slate-400 mb-1">{item.label}</p>
            <div className="text-sm font-semibold text-slate-900">{item.value}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 divide-x divide-slate-100">
        <div className="lg:col-span-2 p-5">
          <h3 className="text-base font-semibold text-slate-900 mb-4 flex items-center gap-2">
            <Building2 size={16} className="text-[#1a56ff]" />
            {t.client.companyInformation}
          </h3>

          <div className="grid grid-cols-2 gap-x-8 gap-y-4 mb-6">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">{cp.legalName}</p>
              <p className="text-sm font-semibold text-slate-900">{company.companyName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">{cp.registrationNumber}</p>
              <p className="text-sm font-semibold text-slate-900">{company.einNumber || cp.pending}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">{cp.stateFormation}</p>
              <p className="text-sm font-semibold text-[#1a56ff]">{company.state || '\u2014'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">{cp.numMembers}</p>
              <p className="text-sm font-semibold text-slate-900">1 Member</p>
            </div>
            <div className="col-span-2">
              <p className="text-xs text-slate-400 mb-0.5">{cp.businessPurpose}</p>
              <p className="text-sm font-semibold text-slate-500">{cp.notProvided}</p>
            </div>
          </div>

          <div className="border-t border-slate-100 pt-4">
            <h4 className="text-sm font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Users size={14} className="text-slate-400" />
              {cp.membersOfficers}
            </h4>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3">
              <div>
                <p className="text-xs text-slate-400 mb-0.5">{cp.managingMember}</p>
                <p className="text-sm font-semibold text-slate-900">{company.registeredAgent || 'Member'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400 mb-0.5">{cp.ownership}</p>
                <p className="text-sm font-semibold text-slate-900">100%</p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-5 bg-slate-50/50">
          <div className="mb-5">
            <h4 className="text-sm font-semibold text-slate-800 mb-3">{cp.contactInfo}</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <User size={11} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">{cp.primaryContact}</p>
                  <p className="text-sm font-semibold text-slate-900">{company.registeredAgent || 'Member'}</p>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Mail size={11} className="text-slate-400" />
                </div>
                <div className="flex items-start justify-between w-full gap-2">
                  <div>
                    <p className="text-[10px] text-slate-400">{cp.email}</p>
                    <p className="text-sm font-semibold text-slate-900 break-all">{userEmail ?? '\u2014'}</p>
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-2.5">
                <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Phone size={11} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400">{cp.phoneNumber}</p>
                  <p className="text-sm font-semibold text-slate-500">{cp.notProvided}</p>
                </div>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-slate-800 mb-3">{cp.address}</h4>
            <div className="flex items-start gap-2.5">
              <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Home size={11} className="text-slate-400" />
              </div>
              <div>
                <p className="text-[10px] text-slate-400">{cp.principalAddress}</p>
                <p className="text-sm font-semibold text-slate-500">{cp.notProvided}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  const { cp, t } = useTranslations()
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
      <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
        <Building2 size={30} className="text-[#1a56ff]" />
      </div>
      <h3 className="font-semibold text-slate-900 mb-1">{cp.noCompanyYet}</h3>
      <p className="text-slate-500 text-sm max-w-sm mx-auto mb-6">{cp.emptyDesc}</p>
      <a
        href="/order"
        className="inline-flex items-center gap-2 bg-[#1a56ff] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#3a76ff] transition-colors"
      >
        {t.client.startLLCFormation}
      </a>
    </div>
  )
}

export default function ClientCompanyPage() {
  const { t, cp } = useTranslations()
  const { user, isLoading: authLoading } = useRequireAuth()
  const { companies, isLoading } = useCompanies(user?.id)
  const { user: authUser } = useAuth()

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56ff]" />
      </div>
    )
  }

  return (
    <ClientLayout currentPath="/client/company" title={t.client.nav.myCompany}>
      <div className="max-w-4xl">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{cp.myCompanies}</h2>
            <p className="text-slate-500 text-sm mt-0.5">{cp.subtitle}</p>
          </div>
          <Link
            to="/order"
            className="inline-flex items-center gap-2 bg-[#1a56ff] text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-[#3a76ff] transition-colors flex-shrink-0"
          >
            <Plus size={15} />
            {cp.addCompany}
          </Link>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-[#1a56ff]" />
          </div>
        ) : companies.length === 0 ? (
          <EmptyState />
        ) : (
          companies.map(company => (
            <div key={company.id}>
              <ComplianceCard company={company} />
              <CompanyCard company={company} userEmail={authUser?.email} />
            </div>
          ))
        )}
      </div>
    </ClientLayout>
  )
}

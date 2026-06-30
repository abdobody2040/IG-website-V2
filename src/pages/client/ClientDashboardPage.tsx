import { ArrowRight, ShoppingBag, Building2, FileText, Zap, CheckCircle, Clock, AlertCircle, CreditCard, Mail, ShieldCheck } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import ClientLayout from './ClientLayout'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { useOrders } from '../../hooks/useOrders'
import { useCompanies } from '../../hooks/useCompanies'
import { useDocuments } from '../../hooks/useDocuments'
import { useComplianceReminders } from '../../hooks/useComplianceReminders'
import { useLang } from '../../i18n/LanguageContext'
import type { Order } from '../../types/db'

const STEP_ORDER: Record<string, number> = {
  pending: 0, in_review: 0, processing: 1,
  documents_filed: 2, ein_processing: 3, completed: 4, cancelled: -1,
}

const MAX_STEPS = 4

function CircularProgress({ pct, status }: { pct: number; status: string }) {
  const { t } = useLang()
  const r = 56
  const circ = 2 * Math.PI * r
  const offset = circ - (pct / 100) * circ
  const isCancelled = status === 'cancelled'
  const isComplete = status === 'completed'

  return (
    <div className="relative w-40 h-40 flex-shrink-0">
      <svg className="w-full h-full -rotate-90" viewBox="0 0 136 136">
        <circle cx="68" cy="68" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
        <circle
          cx="68" cy="68" r={r} fill="none"
          stroke={isCancelled ? '#ef4444' : isComplete ? '#22c55e' : '#1a56ff'}
          strokeWidth="10"
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-bold text-slate-900">{pct}%</span>
        <span className="text-xs text-slate-500 mt-0.5">{t.client.complete}</span>
      </div>
    </div>
  )
}

function PaymentBanner({ order }: { order: Order }) {
  const { t } = useLang()
  const isPending = order.status === 'pending'
  if (!isPending) return null
  return (
    <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 flex items-start gap-4">
      <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
        <AlertCircle size={20} className="text-amber-600" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-amber-900 text-sm">{t.client.paymentRequired}</h4>
        <p className="text-amber-700 text-xs mt-0.5">{t.client.paymentDesc}</p>
      </div>
      <a
        href="/order"
        className="flex-shrink-0 flex items-center gap-1.5 bg-amber-500 text-white text-xs font-semibold px-4 py-2 rounded-lg hover:bg-amber-600 transition-colors"
      >
        <CreditCard size={13} />
        {t.client.completePayment} · ${order.amount.toLocaleString()}
      </a>
    </div>
  )
}

function FormationProgressCard({ order, loading }: { order: Order | undefined; loading: boolean }) {
  const { t } = useLang()
  const stepIdx = order ? (STEP_ORDER[order.status] ?? 0) : 0

  const STEPS = [
    { key: 'pending',          label: t.client.orderReceived },
    { key: 'processing',       label: t.client.filing },
    { key: 'documents_filed',  label: t.client.docsFiled },
    { key: 'ein_processing',   label: t.client.ein },
    { key: 'completed',        label: t.client.completeStep },
  ]

  const STEP_IDX_MAP: Record<string, number> = {
    pending: 0, in_review: 0, processing: 1,
    documents_filed: 2, ein_processing: 3, completed: 4,
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <FileText size={15} className="text-[#1a56ff]" />
          <h3 className="font-semibold text-slate-900 text-sm">{t.client.formationProgress}</h3>
        </div>
        <span className="text-xs text-slate-400">{order ? t.client.llcFilingStatus : t.client.noActiveOrder}</span>
      </div>

      <div className="p-5">
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1a56ff]" />
          </div>
        ) : order ? (
          <div className="flex items-center gap-8">
            <CircularProgress pct={Math.round((stepIdx / MAX_STEPS) * 100)} status={order.status} />
            <div className="flex-1 space-y-3">
              {STEPS.map((step, idx) => {
                const stepI = STEP_IDX_MAP[step.key] ?? idx
                const done = stepIdx >= stepI
                return (
                  <div key={step.key} className="flex items-center gap-2.5">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                      done ? 'bg-[#1a56ff] border-[#1a56ff]' : 'border-slate-200 bg-white'
                    }`}>
                      {done && <CheckCircle size={12} className="text-white" strokeWidth={2.5} />}
                    </div>
                    <span className={`text-sm font-medium transition-colors ${done ? 'text-slate-900' : 'text-slate-400'}`}>
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <ShoppingBag size={32} className="text-slate-300 mx-auto mb-3" />
            <p className="text-sm text-slate-500 mb-4">{t.client.noActiveFormation}</p>
            <a href="/order" className="inline-flex items-center gap-2 bg-[#1a56ff] text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-[#1548d9] transition-colors">
              {t.client.startLLCFormation}
            </a>
          </div>
        )}
      </div>
    </div>
  )
}

function CompanyInfoCard({ order, loading }: { order: Order | undefined; loading: boolean }) {
  const { t } = useLang()
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-slate-100">
        <Building2 size={15} className="text-green-600" />
        <h3 className="font-semibold text-slate-900 text-sm">{t.client.companyInformation}</h3>
      </div>
      <div className="p-5">
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />)}
          </div>
        ) : order ? (
          <div className="space-y-4">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">{t.client.companyName}</p>
              <p className="text-sm font-semibold text-slate-900">{order.companyName}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">{t.client.formationState}</p>
              <p className="text-sm font-semibold text-[#1a56ff]">{order.companyState}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">{t.client.status}</p>
              <p className="text-sm font-semibold text-slate-700 capitalize">{order.status?.replace(/_/g, ' ')}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">{t.client.package}</p>
              <p className="text-sm font-semibold text-slate-700">{order.packageName}</p>
            </div>
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-slate-400">{t.client.noCompanyInfo}</p>
            <Link to="/client/orders" className="text-xs text-[#1a56ff] mt-2 inline-block hover:underline">{t.client.viewOrders}</Link>
          </div>
        )}
      </div>
    </div>
  )
}

function RenewalSnapshotCard({ companies }: { companies: ReturnType<typeof useCompanies>['companies'] }) {
  const { t } = useLang()
  const dates = companies.flatMap(company => [
    { label: t.client.companyRenewal, date: company.renewalDueDate, company: company.companyName },
    { label: t.client.annualReport, date: company.annualReportDueDate, company: company.companyName },
    { label: t.client.taxFiling, date: company.taxFilingDueDate, company: company.companyName },
    { label: t.client.registeredAgent, date: company.registeredAgentRenewalDate, company: company.companyName },
  ]).filter(item => item.date)
    .sort((a, b) => new Date(a.date!).getTime() - new Date(b.date!).getTime())

  const next = dates[0]

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center flex-shrink-0">
            <Clock size={19} className="text-[#1a56ff]" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 text-sm">{t.client.nextRenewal}</h3>
            {next ? (
              <p className="text-sm text-slate-600 mt-1">
                <span className="font-medium text-slate-900">{next.label}</span> for {next.company} is due on{' '}
                <span className="font-semibold text-[#1a56ff]">
                  {new Date(next.date!).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </p>
            ) : (
              <p className="text-sm text-slate-500 mt-1">{t.client.noRenewalDates}</p>
            )}
          </div>
        </div>
        <Link to="/client/company" className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a56ff] hover:underline">
          {t.client.viewCompany} <ArrowRight size={13} />
        </Link>
      </div>
    </div>
  )
}

export default function ClientDashboardPage() {
  const { t } = useLang()
  const { user, isLoading: authLoading } = useRequireAuth()
  const { orders, isLoading: ordersLoading } = useOrders(user?.id)
  const { companies } = useCompanies(user?.id)
  useDocuments(user?.id)
  const alerts = useComplianceReminders(companies)

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56ff]" />
      </div>
    )
  }

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'there'
  const latestOrder = orders[0]

  return (
    <ClientLayout currentPath="/client/dashboard" title={t.client.dashboard}>

      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900">{t.client.dashboardOverview}</h2>
        <p className="text-slate-500 text-sm mt-0.5">
          {latestOrder
            ? t.client.llcInProgress
            : t.client.welcomeBack.replace('{name}', displayName)}
        </p>
      </div>

      {latestOrder && <PaymentBanner order={latestOrder} />}

      {alerts.filter(a => a.urgency === 'overdue' || a.urgency === 'due_soon').length > 0 && (
        <div className="space-y-2 mb-6">
          {alerts.filter(a => a.urgency === 'overdue' || a.urgency === 'due_soon').map(alert => (
            <div key={`${alert.companyId}-${alert.label}`} className={`rounded-xl border p-4 flex items-start gap-3 ${
              alert.urgency === 'overdue'
                ? 'bg-red-50 border-red-200'
                : 'bg-amber-50 border-amber-200'
            }`}>
              <AlertCircle size={18} className={alert.urgency === 'overdue' ? 'text-red-500 flex-shrink-0 mt-0.5' : 'text-amber-500 flex-shrink-0 mt-0.5'} />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${alert.urgency === 'overdue' ? 'text-red-800' : 'text-amber-800'}`}>
                  {alert.urgency === 'overdue' ? t.client.overdue : t.client.dueSoon}
                </p>
                <p className={`text-xs mt-0.5 ${alert.urgency === 'overdue' ? 'text-red-600' : 'text-amber-600'}`}>
                  {alert.label} for <strong>{alert.companyName}</strong> — {alert.urgency === 'overdue'
                    ? t.client.overdueDays.replace('{days}', String(Math.abs(alert.daysUntil)))
                    : t.client.dueInDays.replace('{days}', String(alert.daysUntil))}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      <RenewalSnapshotCard companies={companies} />

      <div className="grid lg:grid-cols-3 gap-6 mb-6">
        <div className="lg:col-span-2">
          <FormationProgressCard order={latestOrder} loading={ordersLoading} />
        </div>
        <div>
          <CompanyInfoCard order={latestOrder} loading={ordersLoading} />
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-slate-700 mb-3">{t.client.quickAccess}</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: t.client.nav.payments,      href: '/client/payments',      icon: CreditCard,   color: 'text-green-600',  bg: 'bg-green-50' },
            { label: t.client.nav.myCompany,     href: '/client/company',       icon: Building2,    color: 'text-blue-600',   bg: 'bg-blue-50' },
            { label: t.client.nav.documents,     href: '/client/documents',     icon: FileText,     color: 'text-indigo-600', bg: 'bg-indigo-50' },
            { label: t.client.nav.mailInbox,     href: '/client/mail-inbox',    icon: Mail,         color: 'text-orange-500', bg: 'bg-orange-50' },
            { label: t.client.nav.services,      href: '/client/services',      icon: Zap,          color: 'text-amber-600',  bg: 'bg-amber-50' },
            { label: t.client.nav.verifications, href: '/client/verifications', icon: ShieldCheck,  color: 'text-purple-600', bg: 'bg-purple-50' },
          ].map(action => {
            const Icon = action.icon
            return (
              <Link
                key={action.href}
                to={action.href}
                className="flex flex-col items-center gap-2 p-4 bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#1a56ff]/30 transition-all group text-center"
              >
                <div className={`w-10 h-10 ${action.bg} rounded-xl flex items-center justify-center`}>
                  <Icon size={18} className={action.color} />
                </div>
                <span className="text-xs font-semibold text-slate-700 group-hover:text-slate-900 leading-tight">{action.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

    </ClientLayout>
  )
}

import { useState } from 'react'
import {
  Clock, CheckCircle, AlertCircle, Loader2, FileText,
  ChevronDown, ChevronUp, Building2, MapPin, Package, Calendar,
  Download, Hash, DollarSign, Upload
} from 'lucide-react'
import { Link } from '@tanstack/react-router'
import type { Order, Document, Company } from '../../types/db'
const STATUS_CONFIG: Record<string, {
  label: string; color: string; bg: string; border: string; icon: React.ElementType
}> = {
  pending:          { label: 'Pending Review',  color: 'text-amber-700',  bg: 'bg-amber-50',  border: 'border-amber-200',  icon: Clock },
  in_review:        { label: 'In Review',        color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200',   icon: Loader2 },
  processing:       { label: 'Processing',       color: 'text-blue-700',   bg: 'bg-blue-50',   border: 'border-blue-200',   icon: Loader2 },
  documents_filed:  { label: 'Documents Filed',  color: 'text-indigo-700', bg: 'bg-indigo-50', border: 'border-indigo-200', icon: FileText },
  ein_processing:   { label: 'EIN Processing',   color: 'text-purple-700', bg: 'bg-purple-50', border: 'border-purple-200', icon: Loader2 },
  completed:        { label: 'Completed',        color: 'text-green-700',  bg: 'bg-green-50',  border: 'border-green-200',  icon: CheckCircle },
  cancelled:        { label: 'Cancelled',        color: 'text-red-700',    bg: 'bg-red-50',    border: 'border-red-200',    icon: AlertCircle },
}

const PROGRESS_STEPS = [
  { key: 'pending',          label: 'Received' },
  { key: 'processing',       label: 'Filing' },
  { key: 'documents_filed',  label: 'Docs Filed' },
  { key: 'ein_processing',   label: 'EIN' },
  { key: 'completed',        label: 'Complete' },
]

const STEP_IDX_MAP: Record<string, number> = {
  pending: 0, in_review: 0,
  processing: 1, documents_filed: 2, ein_processing: 3, completed: 4, cancelled: -1,
}

const DOC_TYPE_LABELS: Record<string, string> = {
  articles_of_org:    'Articles of Organization',
  operating_agreement:'Operating Agreement',
  ein_letter:         'EIN Letter',
  banking_resolution: 'Banking Resolution',
  id_document:        'ID / Passport',
  proof_of_address:   'Proof of Address',
  other:              'Document',
}

const DOC_ICONS: Record<string, string> = {
  articles_of_org:    '📄',
  operating_agreement:'📋',
  ein_letter:         '🏦',
  banking_resolution: '💳',
  id_document:        '🪪',
  proof_of_address:   '🏠',
  other:              '📁',
}

function ProgressTracker({ status }: { status: string }) {
  const currentIdx = STEP_IDX_MAP[status] ?? 0
  return (
    <div className="flex items-center w-full">
      {PROGRESS_STEPS.map((step, i) => {
        const stepIdx = STEP_IDX_MAP[step.key] ?? i
        const done = currentIdx >= stepIdx
        const isLast = i === PROGRESS_STEPS.length - 1
        return (
          <div key={step.key} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 text-xs font-bold transition-all ${
                done ? 'bg-[#1a56ff] border-[#1a56ff] text-white' : 'border-slate-200 bg-white text-slate-400'
              }`}>
                {done ? '✓' : i + 1}
              </div>
              <span className={`text-[10px] font-medium whitespace-nowrap leading-none ${
                done ? 'text-[#1a56ff]' : 'text-slate-400'
              }`}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className={`flex-1 h-0.5 mx-1.5 mb-4 rounded-full transition-all ${
                currentIdx > stepIdx ? 'bg-[#1a56ff]' : 'bg-slate-200'
              }`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string | number }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-7 h-7 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={13} className="text-slate-400" />
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-sm font-semibold text-slate-800 mt-0.5">{String(value || '—')}</p>
      </div>
    </div>
  )
}

function OrderDetails({
  order, allDocuments, allCompanies
}: {
  order: Order
  allDocuments: Document[]
  allCompanies: Company[]
}) {
  const orderDocs = allDocuments.filter(d => d.orderId === order.id)
  const company = allCompanies.find(c => c.orderId === order.id)
  const readyDocs = orderDocs.filter(d => d.status === 'ready')

  return (
    <div className="px-5 pb-5 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-5">
      <div>
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 pt-3">Company Details</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          <DetailRow icon={Building2} label="Company Name" value={order.companyName} />
          <DetailRow icon={MapPin}    label="State"        value={order.companyState} />
          <DetailRow icon={Package}   label="Type"         value={order.companyType} />
          <DetailRow icon={Hash}      label="Package"      value={order.packageName} />
          <DetailRow icon={DollarSign} label="Amount"      value={`$${order.amount.toLocaleString()} ${order.currency?.toUpperCase()}`} />
          <DetailRow icon={Calendar}  label="Ordered"      value={new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} />
        </div>
      </div>

      {company && (
        <div className="bg-white border border-slate-200 rounded-xl p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Formation Info</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">EIN Number</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">{company.einNumber || 'Pending'}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Formation Date</p>
              <p className="text-sm font-bold text-slate-900 mt-0.5">
                {company.formationDate
                  ? new Date(company.formationDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  : 'Pending'}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] text-slate-400 uppercase tracking-wide font-semibold">Registered Agent</p>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">{company.registeredAgent || '—'}</p>
            </div>
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Documents
            {orderDocs.length > 0 && (
              <span className="ml-2 text-[10px] font-medium text-slate-400 normal-case">
                ({readyDocs.length}/{orderDocs.length} ready)
              </span>
            )}
          </p>
          <Link to="/client/documents" className="text-xs text-[#1a56ff] hover:underline flex items-center gap-1 font-medium">
            <Upload size={11} /> Upload
          </Link>
        </div>

        {orderDocs.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-5 text-center">
            <FileText size={24} className="text-slate-300 mx-auto mb-2" />
            <p className="text-sm text-slate-500 font-medium">No documents yet</p>
            <p className="text-xs text-slate-400 mt-0.5">Documents will appear here as your order is processed</p>
          </div>
        ) : (
          <div className="space-y-2">
            {orderDocs.map(doc => {
              const isReady = doc.status === 'ready'
              const label = DOC_TYPE_LABELS[doc.docType] ?? doc.name
              const emoji = DOC_ICONS[doc.docType] ?? '📁'
              return (
                <div key={doc.id} className="bg-white border border-slate-200 rounded-xl flex items-center gap-3 px-4 py-3 hover:border-[#1a56ff]/30 transition-colors">
                  <span className="text-base flex-shrink-0">{emoji}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">{doc.name || label}</p>
                    <p className="text-xs text-slate-400">{label}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
                      isReady ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'
                    }`}>
                      {isReady ? 'Ready' : 'Pending'}
                    </span>
                    {isReady && doc.fileUrl ? (
                      <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                        className="w-7 h-7 bg-[#1a56ff]/10 rounded-lg flex items-center justify-center text-[#1a56ff] hover:bg-[#1a56ff]/20 transition-colors" title="Download">
                        <Download size={13} />
                      </a>
                    ) : (
                      <div className="w-7 h-7 bg-slate-100 rounded-lg flex items-center justify-center text-slate-300">
                        <FileText size={13} />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {order.notes && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
          <p className="text-xs font-semibold text-amber-700 mb-1">Admin Note</p>
          <p className="text-sm text-amber-800">{order.notes}</p>
        </div>
      )}
    </div>
  )
}

export function OrderCard({
  order, allDocuments, allCompanies
}: {
  order: Order
  allDocuments: Document[]
  allCompanies: Company[]
}) {
  const [expanded, setExpanded] = useState(false)
  const cfg = STATUS_CONFIG[order.status] ?? {
    label: order.status, color: 'text-slate-700', bg: 'bg-slate-100', border: 'border-slate-200', icon: Clock,
  }
  const StatusIcon = cfg.icon
  const orderDocCount = allDocuments.filter(d => d.orderId === order.id).length

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between p-5 cursor-pointer select-none" onClick={() => setExpanded(e => !e)}>
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#1a56ff] to-[#3a76ff] flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
            {order.companyName.charAt(0).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-slate-900">{order.companyName}</h3>
              <span className="text-xs text-slate-400 font-mono">#{order.orderNumber}</span>
              {orderDocCount > 0 && (
                <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-full px-2 py-0.5 font-medium">
                  {orderDocCount} doc{orderDocCount !== 1 ? 's' : ''}
                </span>
              )}
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              {order.packageName} · {order.companyState} {order.companyType}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="font-bold text-slate-900">${order.amount.toLocaleString()}</p>
            <p className="text-xs text-slate-400">
              {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </p>
          </div>
          <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.bg} ${cfg.border} ${cfg.color}`}>
            <StatusIcon size={11} />
            {cfg.label}
          </span>
          {expanded ? <ChevronUp size={16} className="text-slate-400 flex-shrink-0" /> : <ChevronDown size={16} className="text-slate-400 flex-shrink-0" />}
        </div>
      </div>

      {order.status !== 'cancelled' && (
        <div className="px-5 pb-4 pt-1 bg-slate-50/50 border-t border-slate-100">
          <ProgressTracker status={order.status} />
        </div>
      )}

      {order.status === 'cancelled' && (
        <div className="mx-5 mb-4 bg-red-50 border border-red-100 rounded-lg px-4 py-2.5 flex items-center gap-2 text-red-600 text-sm">
          <AlertCircle size={14} />
          This order has been cancelled.
        </div>
      )}

      {expanded && (
        <OrderDetails order={order} allDocuments={allDocuments} allCompanies={allCompanies} />
      )}
    </div>
  )
}

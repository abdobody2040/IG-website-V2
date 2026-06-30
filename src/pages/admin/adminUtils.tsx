export const COMPANY_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'completed', label: 'Completed' },
]

export const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_review', label: 'In Review' },
  { value: 'processing', label: 'Processing' },
  { value: 'documents_filed', label: 'Documents Filed' },
  { value: 'ein_processing', label: 'EIN Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

export const PAYMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
]

export const COMPLIANCE_STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'up_to_date', label: 'Up to Date' },
  { value: 'due_soon', label: 'Due Soon' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'completed', label: 'Completed' },
]

export const DOC_TYPE_OPTIONS = [
  { value: 'articles_of_org', label: 'Articles of Organization' },
  { value: 'operating_agreement', label: 'Operating Agreement' },
  { value: 'ein_letter', label: 'EIN Letter' },
  { value: 'banking_resolution', label: 'Banking Resolution' },
  { value: 'id_document', label: 'ID / Passport' },
  { value: 'proof_of_address', label: 'Proof of Address' },
  { value: 'other', label: 'Other' },
]

export const DOC_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'ready', label: 'Ready' },
]

export const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  active: 'bg-green-100 text-green-700',
  completed: 'bg-green-100 text-green-700',
  suspended: 'bg-red-100 text-red-700',
  cancelled: 'bg-red-100 text-red-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-purple-100 text-purple-700',
  ready: 'bg-green-100 text-green-700',
}

export const COMPLIANCE_COLORS: Record<string, string> = {
  not_started: 'bg-slate-100 text-slate-600',
  up_to_date: 'bg-green-100 text-green-700',
  due_soon: 'bg-amber-100 text-amber-700',
  overdue: 'bg-red-100 text-red-700',
  completed: 'bg-green-100 text-green-700',
}

export const DOC_TYPE_COLORS: Record<string, string> = {
  articles_of_org: 'bg-blue-100 text-blue-700',
  operating_agreement: 'bg-purple-100 text-purple-700',
  ein_letter: 'bg-green-100 text-green-700',
  banking_resolution: 'bg-amber-100 text-amber-700',
  id_document: 'bg-cyan-100 text-cyan-700',
  proof_of_address: 'bg-pink-100 text-pink-700',
  other: 'bg-slate-100 text-slate-600',
}

export function renderBadge(label: string, color: string) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}>
      {label}
    </span>
  )
}

export function formatDate(date: string | null | undefined) {
  return date ? new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'
}

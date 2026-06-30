export type OrderStatus =
  | 'pending'
  | 'in_review'
  | 'processing'
  | 'documents_filed'
  | 'ein_processing'
  | 'completed'
  | 'cancelled'

interface BadgeStyle {
  bg: string
  text: string
  label: string
}

export function getStatusBadge(status: string): BadgeStyle {
  const map: Record<string, BadgeStyle> = {
    pending:          { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
    in_review:        { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'In Review' },
    processing:       { bg: 'bg-blue-100',   text: 'text-blue-700',   label: 'Processing' },
    documents_filed:  { bg: 'bg-indigo-100', text: 'text-indigo-700', label: 'Docs Filed' },
    ein_processing:   { bg: 'bg-purple-100', text: 'text-purple-700', label: 'EIN Processing' },
    completed:        { bg: 'bg-green-100',  text: 'text-green-700',  label: 'Completed' },
    cancelled:        { bg: 'bg-red-100',    text: 'text-red-700',    label: 'Cancelled' },
  }
  return map[status] ?? { bg: 'bg-gray-100', text: 'text-gray-600', label: status }
}

export function getDocStatusBadge(status: string): BadgeStyle {
  return status === 'ready'
    ? { bg: 'bg-green-100', text: 'text-green-700', label: 'Ready' }
    : { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' }
}

export function formatDate(iso: string): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

export function formatCurrency(amount: number, currency = 'USD'): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount)
}

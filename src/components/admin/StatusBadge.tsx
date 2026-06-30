interface StatusBadgeProps {
  status: string
}

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:           { label: 'Pending',          className: 'bg-yellow-100 text-yellow-800' },
  in_review:         { label: 'In Review',        className: 'bg-blue-100 text-blue-800' },
  processing:        { label: 'Processing',       className: 'bg-blue-100 text-blue-800' },
  documents_filed:   { label: 'Filed',            className: 'bg-indigo-100 text-indigo-800' },
  ein_processing:    { label: 'EIN Processing',   className: 'bg-purple-100 text-purple-800' },
  completed:         { label: 'Completed',        className: 'bg-green-100 text-green-800' },
  cancelled:         { label: 'Cancelled',        className: 'bg-red-100 text-red-800' },
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: 'bg-gray-100 text-gray-700' }
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.className}`}>
      {config.label}
    </span>
  )
}

export const STATUS_OPTIONS = [
  { value: 'pending',         label: 'Pending' },
  { value: 'in_review',       label: 'In Review' },
  { value: 'processing',      label: 'Processing' },
  { value: 'documents_filed', label: 'Documents Filed' },
  { value: 'ein_processing',  label: 'EIN Processing' },
  { value: 'completed',       label: 'Completed' },
  { value: 'cancelled',       label: 'Cancelled' },
]

const statusColors: Record<string, string> = {
  pending:         'bg-amber-50 text-amber-700 border-amber-200',
  in_review:       'bg-blue-50 text-blue-700 border-blue-200',
  processing:      'bg-blue-50 text-blue-700 border-blue-200',
  documents_filed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  ein_processing:  'bg-purple-50 text-purple-700 border-purple-200',
  completed:       'bg-green-50 text-green-700 border-green-200',
  cancelled:       'bg-red-50 text-red-700 border-red-200',
  active:          'bg-green-50 text-green-700 border-green-200',
  suspended:       'bg-red-50 text-red-700 border-red-200',
  paid:            'bg-green-50 text-green-700 border-green-200',
  failed:          'bg-red-50 text-red-700 border-red-200',
  refunded:        'bg-slate-100 text-slate-600 border-slate-200',
  ready:           'bg-green-50 text-green-700 border-green-200',
}

export function StatusBadge({ status }: { status: string }) {
  const cls = statusColors[status] ?? 'bg-slate-100 text-slate-600 border-slate-200'
  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full border ${cls}`}>
      {status.replace(/_/g, ' ')}
    </span>
  )
}

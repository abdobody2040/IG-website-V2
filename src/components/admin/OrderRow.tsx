import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import type { Order } from '../../types/db'

const STATUS_COLORS: Record<string, string> = {
  pending:         'bg-amber-50 text-amber-700 border-amber-200',
  in_review:       'bg-blue-50 text-blue-700 border-blue-200',
  processing:      'bg-blue-50 text-blue-700 border-blue-200',
  documents_filed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  ein_processing:  'bg-purple-50 text-purple-700 border-purple-200',
  completed:       'bg-green-50 text-green-700 border-green-200',
  cancelled:       'bg-red-50 text-red-700 border-red-200',
}

const STATUS_OPTIONS = [
  { value: 'pending',         label: 'Pending' },
  { value: 'in_review',       label: 'In Review' },
  { value: 'processing',      label: 'Processing' },
  { value: 'documents_filed', label: 'Documents Filed' },
  { value: 'ein_processing',  label: 'EIN Processing' },
  { value: 'completed',       label: 'Completed' },
  { value: 'cancelled',       label: 'Cancelled' },
]

interface Props {
  order: Order
  onStatusChange: (id: string, status: string) => Promise<void>
}

export function OrderRow({ order, onStatusChange }: Props) {
  const [editing, setEditing]   = useState(false)
  const [newStatus, setNew]     = useState(order.status)
  const [saving, setSaving]     = useState(false)

  const handleSave = async () => {
    if (newStatus === order.status) { setEditing(false); return }
    setSaving(true)
    await onStatusChange(order.id, newStatus)
    setSaving(false)
    setEditing(false)
  }

  const badgeClass = STATUS_COLORS[order.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'

  return (
    <tr className="hover:bg-slate-50 transition-colors border-b border-slate-100">
      <td className="px-5 py-3 font-mono text-xs text-slate-500">#{order.orderNumber}</td>
      <td className="px-5 py-3">
        <p className="font-medium text-slate-900">{order.companyName}</p>
        <p className="text-xs text-slate-400">{order.companyState} · {order.companyType}</p>
      </td>
      <td className="px-5 py-3 text-slate-600 text-sm">{order.packageName}</td>
      <td className="px-5 py-3 font-semibold text-slate-900">${order.amount.toLocaleString()}</td>
      <td className="px-5 py-3">
        {editing ? (
          <div className="flex items-center gap-2">
            <select
              value={newStatus}
              onChange={e => setNew(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-2 py-1 focus:outline-none focus:border-[#1a56ff]"
            >
              {STATUS_OPTIONS.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
            <button onClick={handleSave} disabled={saving} className="text-xs bg-[#1a56ff] text-white px-2 py-1 rounded font-semibold disabled:opacity-50">
              {saving ? '…' : 'Save'}
            </button>
            <button onClick={() => { setEditing(false); setNew(order.status) }} className="text-xs text-slate-500 hover:text-slate-800">
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setEditing(true)}
            className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border cursor-pointer hover:opacity-80 ${badgeClass}`}
          >
            {order.status.replace(/_/g, ' ')}
            <ChevronDown size={10} />
          </button>
        )}
      </td>
      <td className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">
        {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </td>
      <td className="px-5 py-3 text-xs text-slate-500 max-w-[120px] truncate">{order.notes || '—'}</td>
    </tr>
  )
}

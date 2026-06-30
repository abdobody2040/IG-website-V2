import { X, Package, MapPin, Calendar, DollarSign, Hash } from 'lucide-react'
import type { Order } from '../../types/db'
import StatusBadge from './StatusBadge'
import { formatDate, formatCurrency, getStatusBadge } from './statusUtils'

const STATUS_TIMELINE = [
  { key: 'pending',         label: 'Order Received' },
  { key: 'in_review',       label: 'Under Review' },
  { key: 'processing',      label: 'Processing' },
  { key: 'documents_filed', label: 'Documents Filed' },
  { key: 'ein_processing',  label: 'EIN Processing' },
  { key: 'completed',       label: 'Completed' },
]

const STATUS_ORDER = STATUS_TIMELINE.map(s => s.key)

interface Props {
  order: Order | null
  onClose: () => void
}

function DetailRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 flex-shrink-0 mt-0.5">
        <Icon size={14} />
      </div>
      <div>
        <p className="text-xs text-gray-400">{label}</p>
        <p className="text-sm font-medium text-gray-900 mt-0.5">{value || '—'}</p>
      </div>
    </div>
  )
}

export default function OrderDetailDrawer({ order, onClose }: Props) {
  if (!order) return null

  const currentIdx  = STATUS_ORDER.indexOf(order.status)
  const isCancelled = order.status === 'cancelled'

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col animate-slide-up overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div>
            <h2 className="font-semibold text-gray-900">Order #{order.orderNumber}</h2>
            <p className="text-xs text-gray-400 mt-0.5">{formatDate(order.createdAt)}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
          {/* Status */}
          <div className="flex items-center gap-3">
            <StatusBadge status={order.status} />
            <span className="text-sm text-gray-500">{formatCurrency(order.amount, order.currency)}</span>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4">
            <DetailRow icon={Package}  label="Package"  value={order.packageName} />
            <DetailRow icon={MapPin}   label="State"    value={order.companyState} />
            <DetailRow icon={Hash}     label="Company"  value={order.companyName} />
            <DetailRow icon={Calendar} label="Date"     value={formatDate(order.createdAt)} />
            <DetailRow icon={DollarSign} label="Amount" value={formatCurrency(order.amount, order.currency)} />
          </div>

          {order.notes && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">Notes</p>
              <p className="text-sm text-gray-700">{order.notes}</p>
            </div>
          )}

          {/* Timeline */}
          {!isCancelled && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-4">Order Progress</h3>
              <div className="space-y-0">
                {STATUS_TIMELINE.map(({ key, label }, idx) => {
                  const done    = currentIdx >= idx
                  const current = currentIdx === idx
                  const last    = idx === STATUS_TIMELINE.length - 1
                  const { bg, text } = getStatusBadge(key)
                  return (
                    <div key={key} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 border-2 transition-all ${
                          done
                            ? current
                              ? `${bg} ${text} border-current`
                              : 'bg-[#1a56ff] text-white border-[#1a56ff]'
                            : 'bg-white border-gray-200 text-gray-300'
                        }`}>
                          {done && !current ? '✓' : idx + 1}
                        </div>
                        {!last && (
                          <div className={`w-0.5 h-8 mt-1 ${done && currentIdx > idx ? 'bg-[#1a56ff]' : 'bg-gray-100'}`} />
                        )}
                      </div>
                      <div className="pb-6">
                        <p className={`text-sm font-medium leading-7 ${done ? 'text-gray-900' : 'text-gray-400'}`}>{label}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {isCancelled && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-sm text-red-600">
              This order has been cancelled.
            </div>
          )}
        </div>
      </div>
    </>
  )
}

import { useState, useMemo } from 'react'
import { CreditCard, Search, Edit2, Trash2, X, Loader2, Download } from 'lucide-react'
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal'
import { useQueryClient } from '@tanstack/react-query'
import { useAllPayments } from '../../hooks/useAdminData'
import { useRequireAdmin } from '../../hooks/useRequireAuth'
import { pb } from '../../lib/pocketbase'
import toast from 'react-hot-toast'
import { logAdminAction } from '../../hooks/useAdminAuditLog'
import { useExportCsv } from '../../hooks/useExportCsv'

const PAYMENT_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
]

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  paid: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  refunded: 'bg-slate-100 text-slate-600',
}

interface Payment {
  id: string
  userId: string
  orderId: string
  invoiceId: string
  service: string
  amount: number
  currency: string
  status: string
  stripePaymentId: string
  notes?: string
  createdAt: string
  updatedAt: string
}

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] ?? 'bg-slate-100 text-slate-600'
  const label = PAYMENT_STATUS_OPTIONS.find(o => o.value === status)?.label ?? status
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  )
}

// ── Edit Payment Modal ────────────────────────────────────────────
function EditPaymentModal({
  payment,
  onClose,
  onSaved,
}: {
  payment: Payment
  onClose: () => void
  onSaved: () => void
}) {
  const [service, setService] = useState(payment.service || '')
  const [amount, setAmount] = useState(String(payment.amount ?? ''))
  const [status, setStatus] = useState(payment.status || 'pending')
  const [notes, setNotes] = useState(payment.notes || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await pb.collection('payments').update(payment.id, {
        service,
        amount: parseFloat(amount) || 0,
        status,
        notes,
      })
      logAdminAction({ action: 'update', tableName: 'payments', recordId: payment.id });
      toast.success('Payment updated successfully')
      onSaved()
    } catch {
      toast.error('Failed to update payment')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <div>
            <h2 className="font-semibold text-slate-900">Edit Payment</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {payment.invoiceId ? `Invoice: ${payment.invoiceId}` : payment.id.slice(0, 16) + '…'}
            </p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Service</label>
            <input
              value={service}
              onChange={e => setService(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white"
              placeholder="Service name"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Amount</label>
              <input
                value={amount}
                onChange={e => setAmount(e.target.value)}
                type="number"
                min="0"
                step="0.01"
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white"
              >
                {PAYMENT_STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white resize-none"
              placeholder="Internal notes about this payment…"
            />
          </div>

          {/* Read-only info */}
          <div className="p-3 bg-slate-50 rounded-lg space-y-1.5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">System Fields (read-only)</p>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Payment ID</span>
              <span className="text-slate-700 font-mono">{payment.id.slice(0, 16)}…</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Invoice ID</span>
              <span className="text-slate-700 font-mono">{payment.invoiceId || '—'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Stripe ID</span>
              <span className="text-slate-700 font-mono text-right">{payment.stripePaymentId ? `${payment.stripePaymentId.slice(0, 20)}…` : '—'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">User ID</span>
              <span className="text-slate-700 font-mono">{payment.userId ? `${payment.userId.slice(0, 16)}…` : '—'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Currency</span>
              <span className="text-slate-700">{payment.currency || '—'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Created</span>
              <span className="text-slate-700">{new Date(payment.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-6 py-4 border-t border-slate-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 text-sm rounded-lg bg-[#1a56ff] text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {saving && <Loader2 size={13} className="animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────
export default function AdminPaymentsPage() {
  const { isLoading: authLoading } = useRequireAdmin()
  const { payments, isLoading } = useAllPayments()
  const queryClient = useQueryClient()
  const { exportCsv } = useExportCsv()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const filtered = useMemo(() => {
    return (payments as Payment[]).filter(p => {
      const q = search.toLowerCase()
      const matchSearch = !search ||
        p.service?.toLowerCase().includes(q) ||
        p.invoiceId?.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'all' || p.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [payments, search, statusFilter])

  if (authLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56ff]" /></div>

  const handleDelete = async () => {
    if (!deletingPayment) return
    setDeleteLoading(true)
    try {
      await pb.collection('payments').delete(deletingPayment.id)
      logAdminAction({ action: 'delete', tableName: 'payments', recordId: deletingPayment.id });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] })
      toast.success('Payment deleted')
      setDeletingPayment(null)
    } catch {
      toast.error('Failed to delete payment')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleSaved = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] })
    setEditingPayment(null)
  }

  const totalRevenue = (payments as Payment[])
    .filter(p => p.status === 'paid')
    .reduce((sum, p) => sum + (p.amount || 0), 0)

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-0.5">
          <CreditCard className="h-5 w-5 text-[#1a56ff]" />
          <h2 className="text-xl font-bold text-slate-900">All Payments</h2>
          <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full">{payments.length}</span>
        </div>
        <p className="text-slate-500 text-sm mt-0.5">Manage payment records and transaction details</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Total Payments', value: payments.length, color: 'text-slate-900' },
          { label: 'Paid', value: (payments as Payment[]).filter(p => p.status === 'paid').length, color: 'text-green-600' },
          { label: 'Pending', value: (payments as Payment[]).filter(p => p.status === 'pending').length, color: 'text-amber-600' },
          { label: 'Revenue (paid)', value: `$${totalRevenue.toLocaleString()}`, color: 'text-[#1a56ff]' },
        ].map(stat => (
          <div key={stat.label} className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-3">
            <p className="text-xs text-slate-500 mb-1">{stat.label}</p>
            <p className={`text-lg font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by service or invoice ID"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff] bg-white w-72"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff] bg-white"
        >
          <option value="all">All Statuses</option>
          {PAYMENT_STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="py-2 text-sm text-slate-500">{filtered.length} payment{filtered.length !== 1 ? 's' : ''}</span>
        <button
          onClick={() => exportCsv(
            (filtered as Payment[]).map(p => ({
              invoiceId: p.invoiceId, service: p.service, amount: p.amount,
              currency: p.currency, status: p.status, stripePaymentId: p.stripePaymentId,
              notes: p.notes ?? '', createdAt: p.createdAt,
            })),
            'payments_export',
            { invoiceId: 'Invoice', service: 'Service', amount: 'Amount', currency: 'Currency', status: 'Status', stripePaymentId: 'Stripe ID', notes: 'Notes', createdAt: 'Date' }
          )}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Download size={13} />
          Export CSV
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center gap-3 py-12 justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1a56ff]" />
          <span className="text-slate-500 text-sm">Loading payments…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <CreditCard size={36} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No payments found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[950px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500 uppercase">
                  {['Invoice ID', 'Service', 'Amount', 'Currency', 'Status', 'User ID', 'Stripe ID', 'Created', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(payment => (
                  <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">
                      {payment.invoiceId || '—'}
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{payment.service || '—'}</p>
                    </td>
                    <td className="px-5 py-3 font-semibold text-slate-900">
                      ${(payment.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-5 py-3 text-slate-600 text-xs">{payment.currency || 'USD'}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={payment.status} />
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs font-mono">
                      {payment.userId ? `${payment.userId.slice(0, 10)}…` : '—'}
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs font-mono">
                      {payment.stripePaymentId ? `${payment.stripePaymentId.slice(0, 14)}…` : '—'}
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(payment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingPayment(payment)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button
                          onClick={() => setDeletingPayment(payment)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingPayment && (
        <EditPaymentModal
          payment={editingPayment}
          onClose={() => setEditingPayment(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Delete Confirm */}
      {deletingPayment && (
        <DeleteConfirmModal
          title="Delete Payment"
          itemName={deletingPayment.service || deletingPayment.invoiceId}
          onConfirm={handleDelete}
          onClose={() => setDeletingPayment(null)}
          loading={deleteLoading}
        />
      )}
    </>
  )
}

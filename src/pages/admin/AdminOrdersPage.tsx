import { useState } from 'react'
import { ShoppingBag, Search, Edit2, Trash2, X, Loader2, Clock, Download } from 'lucide-react'
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal'
import { useQueryClient } from '@tanstack/react-query'
import { useOrders } from '../../hooks/useAdminData'
import { useRequireAdmin } from '../../hooks/useRequireAuth'
import { pb } from '../../lib/pocketbase'
import toast from 'react-hot-toast'
import type { Order } from '../../types/db'
import { logAdminAction } from '../../hooks/useAdminAuditLog'
import { useExportCsv } from '../../hooks/useExportCsv'
import { Skeleton } from '../../components/ui/Skeleton'

const ORDER_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'in_review', label: 'In Review' },
  { value: 'processing', label: 'Processing' },
  { value: 'documents_filed', label: 'Documents Filed' },
  { value: 'ein_processing', label: 'EIN Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
]

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  in_review: 'bg-blue-100 text-blue-700',
  processing: 'bg-blue-100 text-blue-700',
  documents_filed: 'bg-indigo-100 text-indigo-700',
  ein_processing: 'bg-purple-100 text-purple-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] ?? 'bg-slate-100 text-slate-600'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {ORDER_STATUS_OPTIONS.find(o => o.value === status)?.label ?? status.replace(/_/g, ' ')}
    </span>
  )
}

// ── Edit Order Modal ─────────────────────────────────────────────
function EditOrderModal({
  order,
  onClose,
  onSaved,
}: {
  order: Order
  onClose: () => void
  onSaved: () => void
}) {
  const [companyName, setCompanyName] = useState(order.companyName || '')
  const [companyState, setCompanyState] = useState(order.companyState || '')
  const [companyType, setCompanyType] = useState(order.companyType || 'LLC')
  const [packageName, setPackageName] = useState(order.packageName || '')
  const [amount, setAmount] = useState(String(order.amount ?? ''))
  const [currency, setCurrency] = useState(order.currency || 'USD')
  const [status, setStatus] = useState(order.status || 'pending')
  const [notes, setNotes] = useState(order.notes || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const prevStatus = order.status
      await pb.collection('orders').update(order.id, {
        company_name: companyName,
        company_state: companyState,
        company_type: companyType,
        package_name: packageName,
        amount: parseFloat(amount) || 0,
        currency,
        status,
        notes,
      })
      logAdminAction({ action: 'update', tableName: 'orders', recordId: order.id });

      if (prevStatus !== status) {
        logAdminAction({
          action: 'update',
          tableName: 'orders',
          recordId: order.id,
          details: { message: `Status changed from ${prevStatus} to ${status} by admin` },
        })

        // Fire webhook to Make/Zapier
        const webhookUrl = import.meta.env.VITE_ORDER_WEBHOOK_URL
        if (webhookUrl) {
          try {
            await fetch(webhookUrl, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                event: 'order.status.updated',
                orderId: order.id,
                status,
                orderNumber: order.orderNumber,
                companyName,
                timestamp: new Date().toISOString()
              })
            })
          } catch (err) {
            console.error('Failed to trigger order webhook', err)
          }
        }
      }

      toast.success('Order updated successfully')
      onSaved()
    } catch {
      toast.error('Failed to update order')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <div>
            <h2 className="font-semibold text-slate-900">Edit Order</h2>
            <p className="text-xs text-slate-500 mt-0.5">#{order.orderNumber}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Company Name</label>
              <input
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">State</label>
              <input
                value={companyState}
                onChange={e => setCompanyState(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Company Type</label>
              <select
                value={companyType}
                onChange={e => setCompanyType(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white"
              >
                <option value="LLC">LLC</option>
                <option value="LTD">LTD</option>
                <option value="C-Corp">C-Corp</option>
                <option value="S-Corp">S-Corp</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Package</label>
              <input
                value={packageName}
                onChange={e => setPackageName(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white"
              />
            </div>
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
              <label className="block text-xs font-medium text-slate-600 mb-1">Currency</label>
              <select
                value={currency}
                onChange={e => setCurrency(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white"
              >
                <option value="USD">USD</option>
                <option value="EUR">EUR</option>
                <option value="GBP">GBP</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white"
            >
              {ORDER_STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              rows={3}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white resize-none"
              placeholder="Internal notes…"
            />
          </div>

          {/* Status History Section */}
          <div className="border border-slate-200 rounded-lg p-3">
            <div className="flex items-center gap-1.5 mb-2">
              <Clock size={13} className="text-slate-400" />
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide">Status History</p>
            </div>
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Created</span>
                <span className="text-slate-700">{new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Last Updated</span>
                <span className="text-slate-700">{new Date(order.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Current Status</span>
                <StatusBadge status={order.status} />
              </div>
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
export default function AdminOrdersPage() {
  const { isLoading: authLoading } = useRequireAdmin()
  const queryClient = useQueryClient()

  const { exportCsv } = useExportCsv()

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const { data, isLoading } = useOrders({ page, perPage: 20, search, status: statusFilter })
  const filtered = data?.items || []
  const totalPages = data?.totalPages || 1
  const totalItems = data?.totalItems || 0

  if (authLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56ff]" /></div>

  const handleDelete = async () => {
    if (!deletingOrder) return
    setDeleteLoading(true)
    try {
      await pb.collection('orders').delete(deletingOrder.id)
      logAdminAction({ action: 'delete', tableName: 'orders', recordId: deletingOrder.id });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      toast.success('Order deleted')
      setDeletingOrder(null)
    } catch {
      toast.error('Failed to delete order')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleSaved = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
    setEditingOrder(null)
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-0.5">
          <ShoppingBag className="h-5 w-5 text-[#1a56ff]" />
          <h2 className="text-xl font-bold text-slate-900">All Orders</h2>
          <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full">{totalItems}</span>
        </div>
        <p className="text-slate-500 text-sm mt-0.5">Manage and update LLC formation orders</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search company or order #"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff] bg-white w-64"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff] bg-white"
        >
          <option value="all">All Statuses</option>
          {ORDER_STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="py-2 text-sm text-slate-500">{filtered.length} order{filtered.length !== 1 ? 's' : ''}</span>
        <button
          onClick={() => exportCsv(
            filtered.map(o => ({
              orderNumber: o.orderNumber, packageName: o.packageName, companyName: o.companyName,
              status: o.status, amount: o.amount, currency: o.currency,
              customerName: o.customerName ?? '', customerEmail: o.customerEmail ?? '',
              createdAt: o.createdAt,
            })),
            'orders_export',
            { orderNumber: 'Order #', packageName: 'Package', companyName: 'Company', status: 'Status', amount: 'Amount', currency: 'Currency', customerName: 'Customer', customerEmail: 'Email', createdAt: 'Date' }
          )}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Download size={13} />
          Export CSV
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left"><Skeleton className="h-4 w-16" /></th>
                <th className="px-5 py-3 text-left"><Skeleton className="h-4 w-24" /></th>
                <th className="px-5 py-3 text-left"><Skeleton className="h-4 w-20" /></th>
                <th className="px-5 py-3 text-left"><Skeleton className="h-4 w-16" /></th>
                <th className="px-5 py-3 text-left"><Skeleton className="h-4 w-20" /></th>
                <th className="px-5 py-3 text-left"><Skeleton className="h-4 w-16" /></th>
                <th className="px-5 py-3 text-left"><Skeleton className="h-4 w-24" /></th>
                <th className="px-5 py-3 text-left"><Skeleton className="h-4 w-20" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5].map(i => (
                <tr key={i}>
                  <td className="px-5 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-5 py-3">
                    <Skeleton className="h-4 w-32 mb-1" />
                    <Skeleton className="h-3 w-24" />
                  </td>
                  <td className="px-5 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-5 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-5 py-3"><Skeleton className="h-6 w-24 rounded-full" /></td>
                  <td className="px-5 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-5 py-3"><Skeleton className="h-4 w-32" /></td>
                  <td className="px-5 py-3"><Skeleton className="h-8 w-32" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <ShoppingBag size={36} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No orders found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500 uppercase">
                  {['Order #', 'Company', 'Package', 'Amount', 'Status', 'Date', 'Notes', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">#{order.orderNumber}</td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{order.companyName}</p>
                      <p className="text-xs text-slate-400">{order.companyState} · {order.companyType}</p>
                    </td>
                    <td className="px-5 py-3 text-slate-600">{order.packageName}</td>
                    <td className="px-5 py-3 font-semibold text-slate-900">${(order.amount || 0).toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500 max-w-[120px] truncate">{order.notes || '—'}</td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingOrder(order)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button
                          onClick={() => setDeletingOrder(order)}
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
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
              <span className="text-sm text-slate-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm border border-slate-200 rounded-md bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-sm border border-slate-200 rounded-md bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {editingOrder && (
        <EditOrderModal
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Delete Confirm */}
      {deletingOrder && (
        <DeleteConfirmModal
          title="Delete Order"
          itemName={deletingOrder.companyName}
          onConfirm={handleDelete}
          onClose={() => setDeletingOrder(null)}
          loading={deleteLoading}
        />
      )}
    </>
  )
}

import { useState, useMemo } from 'react'
import {
  CreditCard, Search, Edit2, Trash2, X, Loader2, Download,
  TrendingUp, Calendar, Users, ShoppingBag, Printer, FileSpreadsheet,
  DollarSign, AlertCircle, FileText, Receipt,
  ArrowUpRight, BarChart3, ChevronRight
} from 'lucide-react'
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
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  paid: 'bg-green-50 text-green-700 border-green-200',
  failed: 'bg-red-50 text-red-700 border-red-200',
  refunded: 'bg-slate-100 text-slate-600 border-slate-200',
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
  stripeSessionId: string
  stripePaymentIntentId: string
  stripeChargeId: string
  stripeCustomerId: string
  stripeInvoiceId: string
  stripePriceId: string
  stripeProductId: string
  customerName: string
  customerEmail: string
  companyName: string
  customerCountry: string
  invoiceUrl: string
  receiptUrl: string
}

function StatusBadge({ status }: { status: string }) {
  const cls = STATUS_COLORS[status] ?? 'bg-slate-100 text-slate-600 border-slate-200'
  const label = PAYMENT_STATUS_OPTIONS.find(o => o.value === status)?.label ?? status
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${cls}`}>
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
              <label className="block text-xs font-medium text-slate-600 mb-1">Amount (USD)</label>
              <input
                value={amount}
                onChange={e => setAmount(e.target.value)}
                type="number"
                min="0"
                step="0.01"
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white font-semibold text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white font-medium text-slate-800"
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
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Stripe & Customer Fields</p>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Customer Name</span>
              <span className="text-slate-700 font-semibold">{payment.customerName || '—'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Customer Email</span>
              <span className="text-slate-700">{payment.customerEmail || '—'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Company</span>
              <span className="text-slate-700">{payment.companyName || '—'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Stripe Customer ID</span>
              <span className="text-slate-700 font-mono">{payment.stripeCustomerId || '—'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Stripe Payment ID</span>
              <span className="text-slate-700 font-mono">{payment.stripePaymentId || '—'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Stripe Invoice ID</span>
              <span className="text-slate-700 font-mono">{payment.stripeInvoiceId || '—'}</span>
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

export default function AdminPaymentsPage() {
  const { isLoading: authLoading } = useRequireAdmin()
  const { payments = [], isLoading } = useAllPayments()
  const queryClient = useQueryClient()
  const { exportCsv } = useExportCsv()

  const [activeTab, setActiveTab] = useState<'payments' | 'customers'>('payments')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState('all')
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // Redirection/External link helper
  const openStripeDashboard = (paymentId: string) => {
    if (!paymentId) return
    window.open(`https://dashboard.stripe.com/payments/${paymentId}`, '_blank')
  }

  // 1. KPI Calculations (strictly USD)
  const stats = useMemo(() => {
    const pArray = payments as Payment[]
    const now = new Date()
    const todayStr = now.toLocaleDateString()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()

    let totalRev = 0
    let todayRev = 0
    let monthlyRev = 0
    let pendingCount = 0
    let failedCount = 0
    let refundCount = 0
    let refundAmount = 0

    pArray.forEach(p => {
      const pDate = new Date(p.createdAt)
      const pAmount = p.amount || 0

      if (p.status === 'paid') {
        totalRev += pAmount
        if (pDate.toLocaleDateString() === todayStr) {
          todayRev += pAmount
        }
        if (pDate.getMonth() === currentMonth && pDate.getFullYear() === currentYear) {
          monthlyRev += pAmount
        }
      } else if (p.status === 'pending') {
        pendingCount++
      } else if (p.status === 'failed') {
        failedCount++
      } else if (p.status === 'refunded') {
        refundCount++
        refundAmount += pAmount
      }
    })

    return {
      totalRevenue: totalRev,
      todayRevenue: todayRev,
      monthlyRevenue: monthlyRev,
      pendingPayments: pendingCount,
      failedPayments: failedCount,
      refundsCount: refundCount,
      refundsAmount: refundAmount,
    }
  }, [payments])

  // 2. Top Services Breakdown
  const topServices = useMemo(() => {
    const servicesMap: Record<string, { count: number; total: number }> = {}
    ;(payments as Payment[]).forEach(p => {
      if (p.status !== 'paid') return
      const svc = p.service || 'LLC Formation'
      if (!servicesMap[svc]) {
        servicesMap[svc] = { count: 0, total: 0 }
      }
      servicesMap[svc].count++
      servicesMap[svc].total += p.amount || 0
    })

    return Object.entries(servicesMap)
      .map(([name, data]) => ({ name, count: data.count, total: data.total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 5)
  }, [payments])

  // 3. Customer List & Top Customers
  const customerList = useMemo(() => {
    const custMap: Record<string, { name: string; email: string; country: string; company: string; count: number; spent: number }> = {}
    ;(payments as Payment[]).forEach(p => {
      const email = p.customerEmail || p.userId || 'unknown@client.com'
      if (!custMap[email]) {
        custMap[email] = {
          name: p.customerName || 'Client Name',
          email,
          country: p.customerCountry || 'N/A',
          company: p.companyName || 'N/A',
          count: 0,
          spent: 0,
        }
      }
      custMap[email].count++
      if (p.status === 'paid') {
        custMap[email].spent += p.amount || 0
      }
    })

    return Object.values(custMap).sort((a, b) => b.spent - a.spent)
  }, [payments])

  // 4. Filtering Logic
  const filteredPayments = useMemo(() => {
    const now = new Date()
    return (payments as Payment[]).filter(p => {
      const q = search.toLowerCase()
      const matchesSearch = !search ||
        p.service?.toLowerCase().includes(q) ||
        p.invoiceId?.toLowerCase().includes(q) ||
        p.customerName?.toLowerCase().includes(q) ||
        p.customerEmail?.toLowerCase().includes(q) ||
        p.companyName?.toLowerCase().includes(q)

      const matchesStatus = statusFilter === 'all' || p.status === statusFilter

      // Date Range Filter
      const pDate = new Date(p.createdAt)
      let matchesDate = true
      if (dateFilter === 'today') {
        matchesDate = pDate.toLocaleDateString() === now.toLocaleDateString()
      } else if (dateFilter === '7days') {
        const diff = now.getTime() - pDate.getTime()
        matchesDate = diff <= 7 * 24 * 60 * 60 * 1000
      } else if (dateFilter === '30days') {
        const diff = now.getTime() - pDate.getTime()
        matchesDate = diff <= 30 * 24 * 60 * 60 * 1000
      } else if (dateFilter === 'month') {
        matchesDate = pDate.getMonth() === now.getMonth() && pDate.getFullYear() === now.getFullYear()
      }

      return matchesSearch && matchesStatus && matchesDate
    })
  }, [payments, search, statusFilter, dateFilter])

  const filteredCustomers = useMemo(() => {
    if (activeTab !== 'customers') return []
    return customerList.filter(c => {
      const q = search.toLowerCase()
      return !search ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.company.toLowerCase().includes(q) ||
        c.country.toLowerCase().includes(q)
    })
  }, [customerList, search, activeTab])

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <Loader2 className="animate-spin text-[#1a56ff]" size={32} />
      </div>
    )
  }

  // ── Database Action Handlers ──
  const handleDelete = async () => {
    if (!deletingPayment) return
    setDeleteLoading(true)
    try {
      await pb.collection('payments').delete(deletingPayment.id)
      logAdminAction({ action: 'delete', tableName: 'payments', recordId: deletingPayment.id });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] })
      toast.success('Payment record deleted')
      setDeletingPayment(null)
    } catch {
      toast.error('Failed to delete payment record')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleSaved = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin', 'payments'] })
    setEditingPayment(null)
  }

  // ── Export Formats ──
  const triggerExportCSV = () => {
    exportCsv(
      filteredPayments.map(p => ({
        invoiceId: p.invoiceId,
        customerName: p.customerName,
        customerEmail: p.customerEmail,
        companyName: p.companyName,
        service: p.service,
        amount: p.amount,
        currency: 'USD',
        status: p.status,
        stripePaymentId: p.stripePaymentId,
        date: new Date(p.createdAt).toLocaleDateString()
      })),
      'payments_report',
      {
        invoiceId: 'Invoice ID',
        customerName: 'Customer Name',
        customerEmail: 'Customer Email',
        companyName: 'Company Name',
        service: 'Service',
        amount: 'Amount (USD)',
        currency: 'Currency',
        status: 'Status',
        stripePaymentId: 'Stripe ID',
        date: 'Date'
      }
    )
  }

  const triggerExportExcel = () => {
    // Generate standard Excel CSV with UTF-8 BOM so it opens correctly in Excel
    const headers = ['Invoice ID', 'Customer Name', 'Customer Email', 'Company Name', 'Country', 'Service', 'Amount (USD)', 'Status', 'Stripe ID', 'Invoice URL', 'Receipt URL', 'Created At'];
    const rows = filteredPayments.map(p => [
      p.invoiceId || `INV-${p.id.slice(-6).toUpperCase()}`,
      p.customerName || 'N/A',
      p.customerEmail || 'N/A',
      p.companyName || 'N/A',
      p.customerCountry || 'N/A',
      p.service || 'N/A',
      p.amount.toFixed(2),
      p.status,
      p.stripePaymentId || 'N/A',
      p.invoiceUrl || 'N/A',
      p.receiptUrl || 'N/A',
      new Date(p.createdAt).toLocaleDateString()
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'payments_dashboard_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Excel-compatible CSV exported successfully')
  }

  const triggerExportPDF = () => {
    window.print()
  }

  return (
    <div className="space-y-6 force-light" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
      
      {/* Dynamic print-only stylesheet block */}
      <style>{`
        @media print {
          body { background: white; color: black; }
          .no-print, header, nav, aside, button, input, select { display: none !important; }
          .print-full-width { width: 100% !important; max-width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .print-visible { display: block !important; }
        }
      `}</style>

      {/* Header section (Hidden when printing) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 no-print border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-0.5">
            <div className="w-8 h-8 rounded-lg bg-[#1a56ff]/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-[#1a56ff]" />
            </div>
            <h2 className="text-xl font-bold text-slate-900">Payments & Revenue</h2>
            <span className="bg-slate-100 text-slate-700 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-slate-200">
              {payments.length} Records
            </span>
          </div>
          <p className="text-slate-500 text-sm">Real-time payment dashboard and financial logs (USD only)</p>
        </div>

        {/* Global Export actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={triggerExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-sm"
          >
            <Download size={13} /> CSV
          </button>
          <button
            onClick={triggerExportExcel}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-sm"
          >
            <FileSpreadsheet size={13} className="text-green-600" /> Excel
          </button>
          <button
            onClick={triggerExportPDF}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold border border-slate-200 rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-all shadow-sm"
          >
            <Printer size={13} className="text-red-500" /> Print PDF
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div id="print-section" className="print-full-width">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            {
              label: 'Total Revenue',
              value: `$${stats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              icon: DollarSign,
              color: 'text-blue-600 bg-blue-50 border-blue-100',
              desc: 'All paid orders total'
            },
            {
              label: "Today's Sales",
              value: `$${stats.todayRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              icon: TrendingUp,
              color: 'text-green-600 bg-green-50 border-green-100',
              desc: 'Paid payments today'
            },
            {
              label: 'Monthly Revenue',
              value: `$${stats.monthlyRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
              icon: Calendar,
              color: 'text-purple-600 bg-purple-50 border-purple-100',
              desc: 'This calendar month'
            },
            {
              label: 'Refunded / Failed',
              value: `$${stats.refundsAmount.toLocaleString()} (${stats.refundsCount + stats.failedPayments})`,
              icon: AlertCircle,
              color: 'text-red-600 bg-red-50 border-red-100',
              desc: `Refunded sum & failed attempts`
            },
          ].map(card => {
            const Icon = card.icon
            return (
              <div key={card.label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex flex-col justify-between hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{card.label}</span>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${card.color}`}>
                    <Icon size={16} />
                  </div>
                </div>
                <div>
                  <p className="text-lg sm:text-xl font-bold text-slate-900 leading-none">{card.value}</p>
                  <p className="text-[10px] text-slate-400 mt-1.5">{card.desc}</p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Dashboard Panels (Hidden when printing or collapsed nicely) */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 no-print">
          
          {/* Top Services Panel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <BarChart3 size={15} className="text-[#1a56ff]" />
                Top Services
              </h3>
              <span className="text-xs text-slate-400">By revenue (USD)</span>
            </div>
            {topServices.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-center py-6">
                <ShoppingBag size={24} className="text-slate-300 mb-2" />
                <p className="text-xs text-slate-400">No services data available</p>
              </div>
            ) : (
              <div className="space-y-3.5 flex-1 justify-center flex flex-col">
                {topServices.map(svc => {
                  const percent = stats.totalRevenue > 0 ? (svc.total / stats.totalRevenue) * 100 : 0
                  return (
                    <div key={svc.name} className="space-y-1">
                      <div className="flex justify-between text-xs font-medium text-slate-700">
                        <span className="truncate max-w-[200px]" title={svc.name}>{svc.name}</span>
                        <span className="font-bold text-slate-900">${svc.total.toLocaleString()}</span>
                      </div>
                      <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {/* Top Customers Panel */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col col-span-1 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-slate-800 text-sm flex items-center gap-1.5">
                <Users size={15} className="text-[#1a56ff]" />
                Top Customers
              </h3>
              <span className="text-xs text-slate-400">Sorted by total spent</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-semibold uppercase">
                    <th className="py-2">Name</th>
                    <th className="py-2">Email</th>
                    <th className="py-2">Company</th>
                    <th className="py-2">Country</th>
                    <th className="py-2 text-right">Transactions</th>
                    <th className="py-2 text-right">Spent (USD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 font-medium text-slate-800">
                  {customerList.slice(0, 4).map((cust, idx) => (
                    <tr key={cust.email + idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-2.5 font-bold text-slate-900">{cust.name}</td>
                      <td className="py-2.5 text-slate-500 font-mono">{cust.email}</td>
                      <td className="py-2.5">{cust.company}</td>
                      <td className="py-2.5">{cust.country}</td>
                      <td className="py-2.5 text-right font-bold text-slate-500">{cust.count}</td>
                      <td className="py-2.5 text-right font-bold text-blue-600">${cust.spent.toLocaleString()}</td>
                    </tr>
                  ))}
                  {customerList.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-400">No customer records</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Tab Controls (Hidden when printing) */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-3 mb-4 no-print">
          <div className="flex gap-2">
            <button
              onClick={() => { setActiveTab('payments'); setSearch(''); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'payments' ? 'bg-[#1a56ff] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Recent Transactions
            </button>
            <button
              onClick={() => { setActiveTab('customers'); setSearch(''); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${activeTab === 'customers' ? 'bg-[#1a56ff] text-white' : 'text-slate-600 hover:bg-slate-100'}`}
            >
              Customer Directory
            </button>
          </div>

          {/* Table quick filters (Search & filters) */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder={activeTab === 'payments' ? 'Search service, client, invoice ID...' : 'Search customer...'}
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff] bg-white w-56 font-semibold"
              />
            </div>
            {activeTab === 'payments' && (
              <>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="py-1.5 px-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff] bg-white font-semibold text-slate-700"
                >
                  <option value="all">All Statuses</option>
                  {PAYMENT_STATUS_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>

                <select
                  value={dateFilter}
                  onChange={e => setDateFilter(e.target.value)}
                  className="py-1.5 px-2.5 text-xs border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff] bg-white font-semibold text-slate-700"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="7days">Last 7 Days</option>
                  <option value="30days">Last 30 Days</option>
                  <option value="month">This Month</option>
                </select>
              </>
            )}
          </div>
        </div>

        {/* Data views (Full report printed directly) */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-2">
              <Loader2 className="animate-spin text-[#1a56ff]" size={28} />
              <span className="text-xs text-slate-400 font-semibold">Loading data...</span>
            </div>
          ) : activeTab === 'payments' ? (
            /* Transactions view */
            <div className="overflow-x-auto print-full-width">
              <table className="w-full text-xs text-left min-w-[1000px] print-full-width">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="px-5 py-3.5">Invoice ID</th>
                    <th className="px-5 py-3.5">Service</th>
                    <th className="px-5 py-3.5">Client Details</th>
                    <th className="px-5 py-3.5">Company Name</th>
                    <th className="px-5 py-3.5">Amount (USD)</th>
                    <th className="px-5 py-3.5">Date</th>
                    <th className="px-5 py-3.5">Status</th>
                    <th className="px-5 py-3.5 no-print">Links</th>
                    <th className="px-5 py-3.5 no-print">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredPayments.map(payment => (
                    <tr key={payment.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-800 whitespace-nowrap">
                        {payment.invoiceId || `INV-${payment.id.slice(-6).toUpperCase()}`}
                      </td>
                      <td className="px-5 py-3.5 font-semibold text-slate-900 whitespace-nowrap">
                        {payment.service}
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-slate-900">{payment.customerName || '—'}</div>
                        <div className="text-[10px] text-slate-400 font-mono mt-0.5">{payment.customerEmail || '—'}</div>
                      </td>
                      <td className="px-5 py-3.5 max-w-[180px] truncate" title={payment.companyName}>
                        {payment.companyName || '—'}
                      </td>
                      <td className="px-5 py-3.5 font-bold text-slate-900 whitespace-nowrap text-sm">
                        ${payment.amount.toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 whitespace-nowrap">
                        {new Date(payment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={payment.status} />
                      </td>
                      {/* Documents / Stripe direct link */}
                      <td className="px-5 py-3.5 no-print">
                        <div className="flex items-center gap-2">
                          {payment.stripePaymentId && (
                            <button
                              onClick={() => openStripeDashboard(payment.stripePaymentId)}
                              className="text-[#1a56ff] font-semibold hover:underline flex items-center gap-0.5"
                              title="View in Stripe Dashboard"
                            >
                              Stripe <ArrowUpRight size={11} />
                            </button>
                          )}
                          {payment.invoiceUrl && (
                            <a
                              href={payment.invoiceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-[#1a56ff]"
                              title="Invoice PDF"
                            >
                              <FileText size={13} />
                            </a>
                          )}
                          {payment.receiptUrl && (
                            <a
                              href={payment.receiptUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-slate-400 hover:text-[#1a56ff]"
                              title="Stripe Receipt"
                            >
                              <Receipt size={13} />
                            </a>
                          )}
                        </div>
                      </td>
                      {/* Actions */}
                      <td className="px-5 py-3.5 no-print">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setEditingPayment(payment)}
                            className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50 hover:text-slate-800 transition-colors"
                            title="Edit Record"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            onClick={() => setDeletingPayment(payment)}
                            className="p-1.5 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filteredPayments.length === 0 && (
                    <tr>
                      <td colSpan={9} className="text-center py-10 text-slate-400 font-semibold">
                        No transactions match the filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ) : (
            /* Customers view */
            <div className="overflow-x-auto print-full-width">
              <table className="w-full text-xs text-left min-w-[700px] print-full-width">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/75 text-slate-500 font-semibold uppercase tracking-wider">
                    <th className="px-5 py-3.5">Name</th>
                    <th className="px-5 py-3.5">Email</th>
                    <th className="px-5 py-3.5">Primary Company</th>
                    <th className="px-5 py-3.5">Country</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Total Payments</th>
                    <th className="px-5 py-3.5 text-right font-semibold">Total Spent (USD)</th>
                    <th className="px-5 py-3.5 no-print">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredCustomers.map(cust => (
                    <tr key={cust.email} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-slate-900 flex items-center gap-1.5">
                        <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-500 text-[10px]">
                          {cust.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                        </div>
                        {cust.name}
                      </td>
                      <td className="px-5 py-3.5 font-mono text-slate-500">{cust.email}</td>
                      <td className="px-5 py-3.5 font-semibold text-slate-800">{cust.company}</td>
                      <td className="px-5 py-3.5">{cust.country}</td>
                      <td className="px-5 py-3.5 text-right font-bold text-slate-500">{cust.count}</td>
                      <td className="px-5 py-3.5 text-right font-bold text-[#1a56ff] text-sm">${cust.spent.toLocaleString()}</td>
                      <td className="px-5 py-3.5 no-print">
                        <button
                          onClick={() => {
                            setActiveTab('payments');
                            setSearch(cust.email);
                          }}
                          className="flex items-center gap-1 text-[10px] font-bold text-slate-500 hover:text-[#1a56ff] transition-colors border border-slate-200 rounded-md px-2 py-1 bg-white hover:bg-slate-50"
                        >
                          Payments <ChevronRight size={10} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {filteredCustomers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-10 text-slate-400 font-semibold">
                        No customers match the search criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Edit Payment Modal */}
      {editingPayment && (
        <EditPaymentModal
          payment={editingPayment}
          onClose={() => setEditingPayment(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Delete Confirmation Modal */}
      {deletingPayment && (
        <DeleteConfirmModal
          title="Delete Payment Record"
          itemName={deletingPayment.service || deletingPayment.invoiceId}
          onConfirm={handleDelete}
          onClose={() => setDeletingPayment(null)}
          loading={deleteLoading}
        />
      )}
    </div>
  )
}

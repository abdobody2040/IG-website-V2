import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Search, Eye, Filter, CreditCard } from 'lucide-react'
import ClientLayout from './ClientLayout'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { pb } from '../../lib/pocketbase'
import { useOrders } from '../../hooks/useOrders'
import { useLang } from '../../i18n/LanguageContext'
import type { Order } from '../../types/db'

const STATUS_COLORS: Record<string, string> = {
  paid:     'bg-green-50 text-green-700 border-green-200',
  pending:  'bg-amber-50 text-amber-700 border-amber-200',
  failed:   'bg-red-50 text-red-700 border-red-200',
  refunded: 'bg-slate-100 text-slate-600 border-slate-200',
}

interface Payment {
  id: string
  invoiceId: string
  service: string
  amount: number
  currency: string
  status: string
  createdAt: string
  orderId: string
}

function usePayments(userId: string | null | undefined) {
  return useQuery({
    queryKey: ['payments', userId],
    queryFn: async () => {
      const { data, error } = await pb.collection('payments').getList(1, 100, { filter: `user = "${userId!}"`, sort: '-created' }).then(res => ({ data: res.items, error: null }))
      if (error) throw error
      return (data ?? []).map((p: Record<string, unknown>) => ({
        id: p.id as string,
        invoiceId: p.invoice_id as string ?? '',
        service: p.service as string ?? '',
        amount: p.amount as number,
        currency: p.currency as string,
        status: p.status as string,
        createdAt: p.created_at as string,
        orderId: p.order_id as string ?? '',
      })) as Payment[]
    },
    enabled: !!userId,
  })
}

// Convert orders to payment-like rows for display
function ordersToPayments(orders: Order[]): Payment[] {
  return orders.map(o => ({
    id: `pay_${o.id}`,
    invoiceId: `INVa${o.orderNumber?.split('-').pop() ?? o.id.slice(-4)}`,
    service: o.packageName || 'LLC Formation',
    amount: o.amount,
    currency: o.currency,
    status: o.status === 'completed' ? 'paid' : 'pending',
    createdAt: o.createdAt,
    orderId: o.id,
  }))
}

export default function ClientPaymentsPage() {
  const { t } = useLang()
  const pp = t.client.paymentsPage
  const { user, isLoading: authLoading } = useRequireAuth()
  const { orders, isLoading: ordersLoading } = useOrders(user?.id)
  const { data: dbPayments = [], isLoading: paymentsLoading } = usePayments(user?.id)
  const [search, setSearch] = useState('')

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56ff]" />
      </div>
    )
  }

  const rawPayments = dbPayments.length > 0 ? dbPayments : ordersToPayments(orders)
  const isLoading = ordersLoading || paymentsLoading

  const filtered = rawPayments.filter(p =>
    !search ||
    p.invoiceId.toLowerCase().includes(search.toLowerCase()) ||
    p.service.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <ClientLayout currentPath="/client/payments" title={t.client.nav.payments}>
      <div className="max-w-5xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">{t.client.nav.payments}</h2>
          <p className="text-slate-500 text-sm mt-0.5">{pp.subtitle}</p>
        </div>

        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={pp.search}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/30 focus:border-[#1a56ff]"
            />
          </div>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 text-sm text-slate-600 border border-slate-200 rounded-lg px-3 py-2 hover:bg-slate-50 transition-colors">
              <Filter size={13} />
              {pp.filters}
            </button>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center py-16">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1a56ff]" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <CreditCard size={36} className="text-slate-300 mb-3" />
              <p className="text-sm font-medium text-slate-500">{pp.noPayments}</p>
              <p className="text-xs text-slate-400 mt-1">{pp.noPaymentsDesc}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[600px]">
                <thead>
                  <tr className="border-b border-slate-100">
                    {[pp.invoiceId, pp.service, pp.amount, pp.date, pp.status, pp.actions].map(h => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">
                        <div className="flex items-center gap-1">{h}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filtered.map(payment => (
                    <tr key={payment.id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {payment.invoiceId}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 font-medium text-slate-900">{payment.service}</td>
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        ${payment.amount.toFixed(2)}
                      </td>
                      <td className="px-5 py-3.5 text-slate-500 text-xs">
                        {new Date(payment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${STATUS_COLORS[payment.status] ?? STATUS_COLORS.pending}`}>
                          {payment.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <button className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#1a56ff] hover:bg-blue-50 transition-colors">
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </ClientLayout>
  )
}

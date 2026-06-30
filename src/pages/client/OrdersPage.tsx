import { useState } from 'react'
import { ShoppingBag, ChevronRight } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useOrders } from '../../hooks/useOrders'
import type { Order } from '../../types/db'
import StatusBadge from './StatusBadge'
import OrderDetailDrawer from './OrderDetailDrawer'
import { formatDate, formatCurrency } from './statusUtils'

function EmptyOrders() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[#e8efff] flex items-center justify-center text-[#1a56ff] mb-4">
        <ShoppingBag size={28} />
      </div>
      <h3 className="font-semibold text-gray-900 text-lg mb-1">No orders yet</h3>
      <p className="text-gray-500 text-sm max-w-xs">
        Once you place an LLC formation order, it will appear here.
      </p>
    </div>
  )
}

function OrderRow({ order, onClick }: { order: Order; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left grid grid-cols-[1fr_auto] md:grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-3 px-5 py-4 hover:bg-gray-50/80 transition-colors border-b border-gray-50 last:border-0 group"
    >
      <span className="hidden md:block text-xs font-mono text-gray-400 w-20">#{order.orderNumber}</span>
      <div className="min-w-0">
        <p className="font-medium text-gray-900 text-sm truncate">{order.companyName}</p>
        <p className="text-xs text-gray-400 mt-0.5">{order.packageName} · {order.companyState}</p>
      </div>
      <StatusBadge status={order.status} />
      <span className="hidden md:block text-sm font-semibold text-gray-800">{formatCurrency(order.amount, order.currency)}</span>
      <span className="hidden md:block text-xs text-gray-400 w-24 text-right">{formatDate(order.createdAt)}</span>
      <ChevronRight size={15} className="text-gray-300 group-hover:text-[#1a56ff] transition-colors" />
    </button>
  )
}

export default function OrdersPage() {
  const { user } = useAuth()
  const { orders, isLoading } = useOrders(user?.id)
  const [selected, setSelected] = useState<Order | null>(null)

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
          My Orders
        </h1>
        <p className="text-gray-500 text-sm mt-1">Track all your LLC formation orders.</p>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table head — desktop */}
        <div className="hidden md:grid grid-cols-[auto_1fr_auto_auto_auto_auto] items-center gap-3 px-5 py-3 bg-gray-50 border-b border-gray-100 text-xs font-medium text-gray-400 uppercase tracking-wide">
          <span className="w-20">Order #</span>
          <span>Company</span>
          <span>Status</span>
          <span>Amount</span>
          <span className="w-24 text-right">Date</span>
          <span />
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-gray-400 text-sm">Loading orders…</div>
        ) : orders.length === 0 ? (
          <EmptyOrders />
        ) : (
          <div>
            {orders.map(order => (
              <OrderRow key={order.id} order={order} onClick={() => setSelected(order)} />
            ))}
          </div>
        )}
      </div>

      {/* Detail drawer */}
      <OrderDetailDrawer order={selected} onClose={() => setSelected(null)} />
    </div>
  )
}

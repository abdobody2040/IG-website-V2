import { LayoutDashboard, ShoppingBag, CheckCircle, Clock, Users } from 'lucide-react'
import { useAllOrders, useAllUsers } from '../../hooks/useAdminData'
import { useRequireAdmin } from '../../hooks/useRequireAuth'
import { StatusBadge } from '../../components/admin/StatusBadge'
import { StatCardSkeleton, TableSkeleton } from '../../components/admin/TableSkeleton'
import { format } from 'date-fns'

function StatCard({ icon: Icon, label, value, color }: { icon: any; label: string; value: number; color: string }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 flex items-center gap-4 shadow-sm hover:shadow-md transition-shadow">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

export default function AdminOverviewPage() {
  const { isLoading: authLoading } = useRequireAdmin()
  const { orders, isLoading: ordersLoading } = useAllOrders()
  const { users, isLoading: usersLoading } = useAllUsers()

  if (authLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56ff]" /></div>

  const pendingCount   = orders.filter(o => ['pending', 'in_review'].includes(o.status)).length
  const completedCount = orders.filter(o => o.status === 'completed').length
  const recentOrders   = orders.slice(0, 10)

  return (
    <>
      <div className="mb-6 flex items-center gap-2">
        <LayoutDashboard className="h-5 w-5 text-[#1a56ff]" />
        <div>
          <h2 className="text-xl font-bold text-slate-900">Admin Dashboard</h2>
          <p className="text-slate-500 text-sm mt-0.5">Welcome back. Here's what's happening today.</p>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        {ordersLoading || usersLoading
          ? Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          : <>
              <StatCard icon={ShoppingBag} label="Total Orders"        value={orders.length}  color="bg-blue-50 text-[#1a56ff]" />
              <StatCard icon={Clock}       label="Pending / In Review"  value={pendingCount}   color="bg-yellow-50 text-yellow-600" />
              <StatCard icon={CheckCircle} label="Completed"           value={completedCount} color="bg-green-50 text-green-600" />
              <StatCard icon={Users}       label="Total Clients"       value={users.length}   color="bg-purple-50 text-purple-600" />
            </>
        }
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-base font-semibold text-slate-900">Recent Orders</h3>
          <span className="text-xs text-slate-400">Last 10</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <thead>
              <tr className="bg-slate-50 text-left border-b border-slate-100">
                {['Order #', 'Client', 'Company', 'Package', 'Amount', 'Status', 'Date'].map(h => (
                  <th key={h} className="px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ordersLoading
                ? <tr><td colSpan={7}><TableSkeleton rows={5} cols={7} /></td></tr>
                : recentOrders.length === 0
                ? <tr><td colSpan={7} className="px-5 py-12 text-center text-slate-400 text-sm">No orders yet</td></tr>
                : recentOrders.map(order => (
                  <tr key={order.id} className="border-t border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-slate-500 whitespace-nowrap">#{order.orderNumber}</td>
                    <td className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap max-w-[120px] truncate">{order.userId}</td>
                    <td className="px-5 py-3 font-medium text-slate-900 whitespace-nowrap">{order.companyName}</td>
                    <td className="px-5 py-3 text-slate-600 whitespace-nowrap">{order.packageName}</td>
                    <td className="px-5 py-3 text-slate-900 whitespace-nowrap font-semibold">${order.amount.toLocaleString()}</td>
                    <td className="px-5 py-3 whitespace-nowrap"><StatusBadge status={order.status} /></td>
                    <td className="px-5 py-3 text-slate-400 whitespace-nowrap text-xs">{format(new Date(order.createdAt), 'MMM d, yyyy')}</td>
                  </tr>
                ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
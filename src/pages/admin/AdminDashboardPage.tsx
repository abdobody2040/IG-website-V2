import { ShoppingBag, Users, TrendingUp, Clock, CheckCircle, ArrowRight, Zap, BarChart2, Package } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from 'recharts'
import { useAllOrders, useAllUsers } from '../../hooks/useAdminData'
import { useRequireAdmin } from '../../hooks/useRequireAuth'
import type { Order } from '../../types/db'
import { KPICard } from '../../components/KPICard'

// ─── Constants ───────────────────────────────────────────────────────────────

const STATUS_DOT: Record<string, string> = {
  pending:         'bg-amber-400',
  in_review:       'bg-blue-500',
  processing:      'bg-blue-500',
  documents_filed: 'bg-indigo-500',
  ein_processing:  'bg-purple-500',
  completed:       'bg-green-500',
  cancelled:       'bg-red-400',
}

const STATUS_LABELS: Record<string, string> = {
  pending:         'Pending',
  in_review:       'In Review',
  processing:      'Processing',
  documents_filed: 'Docs Filed',
  ein_processing:  'EIN Processing',
  completed:       'Completed',
  cancelled:       'Cancelled',
}

const STATUS_BG: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  in_review: 'bg-blue-50 text-blue-700 border-blue-200',
  processing: 'bg-blue-50 text-blue-700 border-blue-200',
  documents_filed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  ein_processing: 'bg-purple-50 text-purple-700 border-purple-200',
  completed: 'bg-green-50 text-green-700 border-green-200',
  cancelled: 'bg-red-50 text-red-700 border-red-200',
}

// Pipeline steps in order (excluding cancelled)
const PIPELINE_STEPS = [
  'pending', 'in_review', 'processing', 'documents_filed', 'ein_processing', 'completed',
]

// ─── Custom Tooltip ───────────────────────────────────────────────────────────

function RevenueTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="text-slate-500 text-xs mb-1">{label}</p>
      <p className="font-bold text-slate-900">${payload[0]!.value.toLocaleString()}</p>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function buildRevenueChart(orders: Order[]) {
  const now = new Date()
  const months: { month: string; revenue: number }[] = []

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = d.toLocaleDateString('en-US', { month: 'short' })
    const yr = d.getFullYear()
    const mo = d.getMonth()

    const real = orders
      .filter(o => {
        const c = new Date(o.createdAt)
        return c.getFullYear() === yr && c.getMonth() === mo && o.status !== 'cancelled'
      })
      .reduce((sum, o) => sum + o.amount, 0)

    months.push({ month: label, revenue: real })
  }
  return months
}

// ─── Pipeline Step ────────────────────────────────────────────────────────────

function PipelineStep({
  status, count, total, isLast,
}: {
  status: string; count: number; total: number; isLast: boolean
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 flex-1 min-w-0">
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-1.5">
            <span className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_DOT[status] ?? 'bg-slate-400'}`} />
            <span className="text-xs font-medium text-slate-600 truncate">{STATUS_LABELS[status]}</span>
          </div>
          <span className="text-xs font-bold text-slate-900 ml-2">{count}</span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${pct}%`,
              background: status === 'completed' ? '#22c55e' : '#1a56ff',
            }}
          />
        </div>
        <p className="text-[10px] text-slate-400 mt-1">{pct}% of total</p>
      </div>
      {!isLast && (
        <ArrowRight size={12} className="text-slate-300 flex-shrink-0 mx-1" />
      )}
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { isLoading: authLoading } = useRequireAdmin()
  const { orders, isLoading: ordersLoading } = useAllOrders()
  const { users, isLoading: usersLoading } = useAllUsers()

  if (authLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56ff]" /></div>

  const totalRevenue    = orders.filter(o => o.status !== 'cancelled').reduce((s, o) => s + o.amount, 0)
  const activeOrders    = orders.filter(o => !['completed', 'cancelled'].includes(o.status))
  const completedOrders = orders.filter(o => o.status === 'completed')
  const completionRate  = orders.length ? Math.round((completedOrders.length / orders.length) * 100) : 0
  const recentOrders    = orders.slice(0, 8)
  const chartData       = buildRevenueChart(orders)

  return (
    <>

      {/* ── KPI Row ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 mb-6">
        <KPICard
          label="Total Orders"
          value={ordersLoading ? '—' : orders.length}
          sub="All time"
          icon={ShoppingBag}
          iconBg="bg-blue-50"
          iconColor="text-[#1a56ff]"
          loading={ordersLoading}
        />
        <KPICard
          label="Active Orders"
          value={ordersLoading ? '—' : activeOrders.length}
          sub="In pipeline"
          icon={Clock}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          loading={ordersLoading}
        />
        <KPICard
          label="Total Revenue"
          value={ordersLoading ? '—' : `$${totalRevenue.toLocaleString()}`}
          sub="Excl. cancelled"
          icon={TrendingUp}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          loading={ordersLoading}
        />
        <KPICard
          label="Total Clients"
          value={usersLoading ? '—' : users.length}
          sub="Registered users"
          icon={Users}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          loading={usersLoading}
        />
        <KPICard
          label="Completion Rate"
          value={ordersLoading ? '—' : `${completionRate}%`}
          sub={`${completedOrders.length} completed`}
          icon={CheckCircle}
          iconBg="bg-emerald-50"
          iconColor="text-emerald-600"
          loading={ordersLoading}
        />
      </div>

      {/* ── Revenue Chart + Order Pipeline ───────────────────────────────────── */}
      <div className="grid lg:grid-cols-5 gap-6 mb-6">

        {/* Revenue Bar Chart */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Revenue Overview</h3>
              <p className="text-xs text-slate-400 mt-0.5">Monthly revenue — last 6 months</p>
            </div>
            <div className="flex items-center gap-1.5 bg-blue-50 rounded-lg px-3 py-1.5">
              <BarChart2 size={12} className="text-[#1a56ff]" />
              <span className="text-xs font-semibold text-[#1a56ff]">
                ${totalRevenue.toLocaleString()}
              </span>
            </div>
          </div>
          <div className="p-5 pt-4">
            {ordersLoading ? (
              <div className="h-52 flex items-center justify-center">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1a56ff]" />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={chartData} barCategoryGap="28%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                    width={40}
                  />
                  <Tooltip content={<RevenueTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar
                    dataKey="revenue"
                    fill="#1a56ff"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Order Pipeline Funnel */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Order Pipeline</h3>
              <p className="text-xs text-slate-400 mt-0.5">Count at each stage</p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-slate-100 rounded-lg px-2.5 py-1">
              {orders.length} total
            </span>
          </div>
          <div className="p-5">
            {ordersLoading ? (
              <div className="space-y-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="space-y-1.5">
                    <div className="flex justify-between">
                      <div className="h-3 w-24 bg-slate-100 rounded animate-pulse" />
                      <div className="h-3 w-6 bg-slate-100 rounded animate-pulse" />
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full animate-pulse" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {PIPELINE_STEPS.map((status, idx) => {
                  const count = orders.filter(o => o.status === status).length
                  return (
                    <PipelineStep
                      key={status}
                      status={status}
                      count={count}
                      total={orders.length}
                      isLast={idx === PIPELINE_STEPS.length - 1}
                    />
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Recent Orders Table + Quick Actions ──────────────────────────────── */}
      <div className="grid lg:grid-cols-4 gap-6">

        {/* Recent Orders */}
        <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Recent Orders</h3>
              <p className="text-xs text-slate-400 mt-0.5">Latest 8 orders</p>
            </div>
            <Link
              to="/admin/orders"
              className="flex items-center gap-1 text-xs font-medium text-[#1a56ff] hover:underline"
            >
              View all <ArrowRight size={12} />
            </Link>
          </div>

          {ordersLoading ? (
            <div className="p-6 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-4 w-16 bg-slate-100 rounded animate-pulse" />
                  <div className="h-4 flex-1 bg-slate-100 rounded animate-pulse" />
                  <div className="h-4 w-20 bg-slate-100 rounded animate-pulse" />
                  <div className="h-5 w-16 bg-slate-100 rounded-full animate-pulse" />
                  <div className="h-4 w-14 bg-slate-100 rounded animate-pulse" />
                </div>
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center mx-auto mb-3">
                <ShoppingBag size={20} className="text-slate-400" />
              </div>
              <p className="text-sm font-medium text-slate-500">No orders yet</p>
              <p className="text-xs text-slate-400 mt-1">Orders will appear here once placed</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Order</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Company</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Package</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Status</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Amount</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-400 uppercase tracking-wide">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-50/70 transition-colors group">
                      <td className="px-5 py-3.5">
                        <span className="font-mono text-xs text-slate-400 bg-slate-50 group-hover:bg-white px-2 py-0.5 rounded border border-slate-200">
                          #{order.orderNumber}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <div>
                          <p className="font-semibold text-slate-900 text-sm leading-tight">{order.companyName}</p>
                          <p className="text-xs text-slate-400">{order.companyState} · {order.companyType}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <Package size={11} className="text-slate-400 flex-shrink-0" />
                          <span className="text-slate-600 text-xs">{order.packageName}</span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${STATUS_DOT[order.status] ?? 'bg-slate-400'}`} />
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${STATUS_BG[order.status] ?? 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                            {STATUS_LABELS[order.status] ?? order.status}
                          </span>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="font-bold text-slate-900">${order.amount.toLocaleString()}</span>
                        <span className="text-xs text-slate-400 ml-1">{order.currency?.toUpperCase()}</span>
                      </td>
                      <td className="px-5 py-3.5 text-slate-400 text-xs">
                        {new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Quick Actions + Stats */}
        <div className="lg:col-span-1 flex flex-col gap-4">

          {/* Quick Actions */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm">Quick Actions</h3>
            </div>
            <div className="p-3 space-y-1.5">
              <Link
                to="/admin/orders"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <ShoppingBag size={14} className="text-[#1a56ff]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 leading-tight">All Orders</p>
                  <p className="text-xs text-slate-400">Manage & update</p>
                </div>
                <ArrowRight size={12} className="text-slate-300 group-hover:text-[#1a56ff] transition-colors" />
              </Link>
              <Link
                to="/admin/clients"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users size={14} className="text-purple-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 leading-tight">Clients</p>
                  <p className="text-xs text-slate-400">View all users</p>
                </div>
                <ArrowRight size={12} className="text-slate-300 group-hover:text-purple-500 transition-colors" />
              </Link>
              <Link
                to="/admin/analytics"
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-slate-50 transition-colors group"
              >
                <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BarChart2 size={14} className="text-green-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 leading-tight">Analytics</p>
                  <p className="text-xs text-slate-400">Performance data</p>
                </div>
                <ArrowRight size={12} className="text-slate-300 group-hover:text-green-500 transition-colors" />
              </Link>
            </div>
          </div>

          {/* Summary Stats */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100">
              <h3 className="font-semibold text-slate-900 text-sm">Highlights</h3>
            </div>
            <div className="p-5 space-y-3.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" />
                  <span className="text-xs text-slate-600">Completed</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{ordersLoading ? '—' : completedOrders.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap size={14} className="text-amber-500" />
                  <span className="text-xs text-slate-600">In Progress</span>
                </div>
                <span className="text-sm font-bold text-slate-900">{ordersLoading ? '—' : activeOrders.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-[#1a56ff]" />
                  <span className="text-xs text-slate-600">Avg. Value</span>
                </div>
                <span className="text-sm font-bold text-slate-900">
                  {ordersLoading ? '—' : orders.filter(o => o.status !== 'cancelled').length
                    ? `$${Math.round(totalRevenue / orders.filter(o => o.status !== 'cancelled').length).toLocaleString()}`
                    : '$0'}
                </span>
              </div>
              <div className="pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-slate-500">Completion rate</span>
                  <span className="text-xs font-bold text-slate-900">{completionRate}%</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full transition-all duration-700"
                    style={{ width: `${completionRate}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

import { useState } from 'react'
import { DollarSign, ShoppingBag, Users, TrendingUp, Download } from 'lucide-react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend, Line,
} from 'recharts'
interface EntryPayload { readonly value: string | undefined; readonly color?: string; readonly payload?: object }
import { useAllOrders, useAllUsers } from '../../hooks/useAdminData'
import { useRequireAdmin } from '../../hooks/useRequireAuth'
import { useExportCsv } from '../../hooks/useExportCsv'
import type { Order } from '../../types/db'

const STATUS_LABELS: Record<string, string> = {
  pending:         'Pending',
  in_review:       'In Review',
  processing:      'Processing',
  documents_filed: 'Docs Filed',
  ein_processing:  'EIN Processing',
  completed:       'Completed',
  cancelled:       'Cancelled',
}

const STATUS_PIE_COLORS: Record<string, string> = {
  pending:         '#f59e0b',
  in_review:       '#3b82f6',
  processing:      '#60a5fa',
  documents_filed: '#6366f1',
  ein_processing:  '#a855f7',
  completed:       '#22c55e',
  cancelled:       '#ef4444',
}

const REGION_COLORS = ['#1a56ff', '#a855f7']

const RANGE_OPTIONS = [
  { label: 'Last 30 days', value: 30 },
  { label: 'Last 90 days', value: 90 },
  { label: 'Last year', value: 365 },
  { label: 'All time', value: 0 },
]

function BarTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number; name?: string }[]; label?: string }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <p className="text-slate-400 text-xs mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-bold text-slate-900">
          {p.name === 'revenue' ? `$${p.value.toLocaleString()}` : p.name === 'orders' ? `${p.value} orders` : p.value}
        </p>
      ))}
    </div>
  )
}

function PieTooltip({ active, payload }: { active?: boolean; payload?: { name: string; value: number; payload: { fill: string } }[] }) {
  if (!active || !payload?.length) return null
  const item = payload[0]!
  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3 text-sm">
      <div className="flex items-center gap-2">
        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.payload.fill }} />
        <p className="text-slate-600 text-xs">{item.name}</p>
      </div>
      <p className="font-bold text-slate-900 mt-1">{item.value} orders</p>
    </div>
  )
}

function filterByRange(orders: Order[], days: number) {
  if (days === 0) return orders
  const cutoff = new Date(Date.now() - days * 86400000)
  return orders.filter((o) => new Date(o.createdAt) >= cutoff)
}

function buildMonthlyData(orders: Order[]) {
  const now = new Date()
  const months: { month: string; revenue: number; orders: number }[] = []

  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const label = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    const yr = d.getFullYear()
    const mo = d.getMonth()

    const slice = orders.filter((o) => {
      const c = new Date(o.createdAt)
      return c.getFullYear() === yr && c.getMonth() === mo
    })
    const revenue = slice.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.amount, 0)
    months.push({ month: label, revenue, orders: slice.length })
  }
  return months
}

function buildClientGrowth(users: { createdAt: string }[], months: { month: string; yr: number; mo: number }[]) {
  let cumulative = 0
  return months.map((m) => {
    const count = users.filter((u) => {
      const c = new Date(u.createdAt)
      return c.getFullYear() === m.yr && c.getMonth() === m.mo
    }).length
    cumulative += count
    return { month: m.month, newClients: count, totalClients: cumulative }
  })
}

function buildStatusPie(orders: Order[]) {
  return Object.entries(STATUS_LABELS)
    .map(([key, label]) => ({
      name: label,
      value: orders.filter((o) => o.status === key).length,
      fill: STATUS_PIE_COLORS[key] ?? '#94a3b8',
    }))
    .filter((d) => d.value > 0)
}

function buildPackageData(orders: Order[]) {
  const map: Record<string, number> = {}
  orders.forEach((o) => { map[o.packageName] = (map[o.packageName] ?? 0) + 1 })
  return Object.entries(map)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([name, count]) => ({ name, count }))
}

function buildRegionData(orders: Order[]) {
  const usStates = ['DE', 'WY', 'FL', 'TX', 'NV', 'CA', 'NY', 'CO']
  let us = 0, uk = 0, other = 0
  orders.forEach((o) => {
    const s = (o.companyState ?? '').toUpperCase()
    if (usStates.some((st) => s.includes(st)) || s.length === 2) us++
    else if (s.includes('UK') || s.includes('ENGLAND') || s.includes('WALES')) uk++
    else other++
  })
  if (us + uk + other === 0) return []
  const total = us + uk + other
  return [
    { name: 'United States', value: us, pct: Math.round((us / total) * 100) },
    { name: 'United Kingdom', value: uk, pct: Math.round((uk / total) * 100) },
    ...(other > 0 ? [{ name: 'Other', value: other, pct: Math.round((other / total) * 100) }] : []),
  ]
}

function KPICard({
  label, value, sub, icon: Icon, iconBg, iconColor, loading,
}: {
  label: string; value: string | number; sub?: string
  icon: React.ElementType; iconBg: string; iconColor: string; loading?: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
      <div className="mb-3">
        <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
          <Icon size={18} className={iconColor} />
        </div>
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-7 w-24 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-3.5 w-20 bg-slate-100 rounded animate-pulse" />
        </div>
      ) : (
        <>
          <p className="text-2xl font-bold text-slate-900">{value}</p>
          {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
          <p className="text-xs font-medium text-slate-500 mt-2">{label}</p>
        </>
      )}
    </div>
  )
}

function SectionCard({ title, subtitle, children, action }: { title: string; subtitle?: string; children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="font-semibold text-slate-900 text-sm">{title}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
        </div>
        {action && <div className="flex-shrink-0">{action}</div>}
      </div>
      <div className="p-5">{children}</div>
    </div>
  )
}

function SkeletonChart({ height = 200 }: { height?: number }) {
  return (
    <div className="flex items-center justify-center" style={{ height }}>
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1a56ff]" />
    </div>
  )
}

function renderCustomLegend(props: { payload?: readonly EntryPayload[] }) {
  const { payload = [] } = props
  return (
    <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center mt-2">
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: entry.color }} />
          <span className="text-xs text-slate-600">{entry.value}</span>
          <span className="text-xs text-slate-400">({(entry.payload as { value?: number } | undefined)?.value})</span>
        </div>
      ))}
    </div>
  )
}

export default function AdminAnalyticsPage() {
  const { isLoading: authLoading } = useRequireAdmin()
  const { orders, isLoading: ordersLoading } = useAllOrders()
  const { users, isLoading: usersLoading } = useAllUsers()
  const { exportCsv } = useExportCsv()

  const [dateRange, setDateRange] = useState(0)

  if (authLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56ff]" /></div>

  const filteredOrders = filterByRange(orders, dateRange)

  const totalRevenue    = filteredOrders.filter((o) => o.status !== 'cancelled').reduce((s, o) => s + o.amount, 0)
  const completedOrders = filteredOrders.filter((o) => o.status === 'completed')
  const activeOrders    = filteredOrders.filter((o) => o.status !== 'cancelled')
  const avgOrderValue   = activeOrders.length ? Math.round(totalRevenue / activeOrders.length) : 0

  const monthlyData = buildMonthlyData(filteredOrders)

  const now = new Date()
  const monthLabels = Array.from({ length: 12 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - 11 + i, 1)
    return {
      month: d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
      yr: d.getFullYear(),
      mo: d.getMonth(),
    }
  })
  const clientGrowth = buildClientGrowth(users, monthLabels)

  const statusPie   = buildStatusPie(filteredOrders)
  const packageData = buildPackageData(filteredOrders)
  const regionData  = buildRegionData(filteredOrders)
  const totalRegion = regionData.reduce((s, r) => s + r.value, 0)

  const handleExportAnalytics = () => {
    exportCsv(
      monthlyData.map((m) => ({ month: m.month, revenue: m.revenue, orders: m.orders })),
      `analytics_revenue_${dateRange > 0 ? `${dateRange}d` : 'alltime'}`,
      { month: 'Month', revenue: 'Revenue', orders: 'Orders' }
    )
  }

  const handleExportOrders = () => {
    exportCsv(
      filteredOrders.map((o) => ({
        orderNumber: o.orderNumber,
        packageName: o.packageName,
        companyName: o.companyName,
        status: o.status,
        amount: o.amount,
        currency: o.currency,
        createdAt: o.createdAt,
      })),
      `analytics_orders_${dateRange > 0 ? `${dateRange}d` : 'alltime'}`,
      {
        orderNumber: 'Order Number', packageName: 'Package', companyName: 'Company',
        status: 'Status', amount: 'Amount', currency: 'Currency', createdAt: 'Date',
      }
    )
  }

  const handleExportClients = () => {
    exportCsv(
      users.map((u) => ({
        displayName: u.displayName,
        role: u.role,
        createdAt: u.createdAt,
        lastSignIn: u.lastSignIn ?? '',
      })),
      'analytics_clients_alltime',
      {
        displayName: 'Name', role: 'Role', createdAt: 'Joined',
        lastSignIn: 'Last Sign In',
      }
    )
  }

  return (
    <>

      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Analytics</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {dateRange === 0 ? 'All time' : `Last ${dateRange} days`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(Number(e.target.value))}
            className="py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff] bg-white"
          >
            {RANGE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <button
            onClick={handleExportAnalytics}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
          >
            <Download size={13} />
            Export CSV
          </button>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        <KPICard
          label="Total Revenue"
          value={`$${totalRevenue.toLocaleString()}`}
          sub="Excl. cancelled"
          icon={DollarSign}
          iconBg="bg-green-50"
          iconColor="text-green-600"
          loading={ordersLoading}
        />
        <KPICard
          label="Total Orders"
          value={filteredOrders.length}
          sub="In selected period"
          icon={ShoppingBag}
          iconBg="bg-blue-50"
          iconColor="text-[#1a56ff]"
          loading={ordersLoading}
        />
        <KPICard
          label="Total Clients"
          value={users.length}
          sub="All time registered"
          icon={Users}
          iconBg="bg-purple-50"
          iconColor="text-purple-600"
          loading={usersLoading}
        />
        <KPICard
          label="Avg. Order Value"
          value={`$${avgOrderValue.toLocaleString()}`}
          sub={`${completedOrders.length} completed`}
          icon={TrendingUp}
          iconBg="bg-amber-50"
          iconColor="text-amber-600"
          loading={ordersLoading}
        />
      </div>

      {/* Revenue + Orders Trend */}
      <div className="mb-6">
        <SectionCard
          title="Revenue & Order Trend"
          subtitle="Monthly revenue and order volume over the last 12 months"
          action={
            <button
              onClick={handleExportOrders}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Download size={11} />
              Export Orders
            </button>
          }
        >
          {ordersLoading ? (
            <SkeletonChart height={240} />
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={monthlyData} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} width={44} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} width={32} />
                <Tooltip content={<BarTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar yAxisId="left" dataKey="revenue" name="revenue" fill="#1a56ff" radius={[6, 6, 0, 0]} maxBarSize={40} />
                <Line yAxisId="right" type="monotone" dataKey="orders" name="orders" stroke="#a855f7" strokeWidth={2} dot={{ r: 3, fill: '#a855f7' }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      {/* Client Growth */}
      <div className="mb-6">
        <SectionCard
          title="Client Growth"
          subtitle="New clients and cumulative total over the last 12 months"
          action={
            <button
              onClick={handleExportClients}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <Download size={11} />
              Export Clients
            </button>
          }
        >
          {usersLoading ? (
            <SkeletonChart height={200} />
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={clientGrowth} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="left" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} width={32} />
                <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} width={32} />
                <Tooltip content={<BarTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar yAxisId="left" dataKey="newClients" name="orders" fill="#6366f1" radius={[6, 6, 0, 0]} maxBarSize={32} />
                <Line yAxisId="right" type="monotone" dataKey="totalClients" name="revenue" stroke="#22c55e" strokeWidth={2} dot={{ r: 3, fill: '#22c55e' }} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      {/* Status Pie + Package Bar */}
      <div className="grid lg:grid-cols-2 gap-6 mb-6">
        <SectionCard title="Orders by Status" subtitle="Distribution across pipeline stages">
          {ordersLoading ? (
            <SkeletonChart height={260} />
          ) : statusPie.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-16">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie data={statusPie} cx="50%" cy="45%" innerRadius={60} outerRadius={95} paddingAngle={3} dataKey="value">
                  {statusPie.map((entry, i) => (
                    <Cell key={i} fill={entry.fill} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<PieTooltip />} />
                <Legend content={renderCustomLegend} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Orders by Package" subtitle="Volume per product tier">
          {ordersLoading ? (
            <SkeletonChart height={260} />
          ) : packageData.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-16">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={packageData} layout="vertical" barCategoryGap="20%">
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} width={90} />
                <Tooltip content={<BarTooltip />} cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="count" fill="#6366f1" radius={[0, 6, 6, 0]} maxBarSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>
      </div>

      {/* Orders by Region */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <SectionCard title="Orders by Region" subtitle="US vs UK formation volume">
            {ordersLoading ? (
              <SkeletonChart height={180} />
            ) : regionData.length === 0 ? (
              <p className="text-slate-400 text-sm text-center py-16">No data yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={regionData} barCategoryGap="35%">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} width={32} />
                  <Tooltip content={<BarTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={64}>
                    {regionData.map((_, i) => (
                      <Cell key={i} fill={REGION_COLORS[i] ?? '#94a3b8'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </SectionCard>
        </div>

        <div className="flex flex-col gap-4">
          {regionData.map((region, i) => (
            <div key={region.name} className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex items-center gap-4">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 text-white text-base font-bold"
                style={{ background: REGION_COLORS[i] ?? '#94a3b8' }}
              >
                {region.name === 'United States' ? '🇺🇸' : region.name === 'United Kingdom' ? '🇬🇧' : '🌍'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 leading-tight">{region.name}</p>
                <p className="text-xs text-slate-400 mt-0.5">{region.value} of {totalRegion} orders</p>
                <div className="h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                  <div className="h-full rounded-full transition-all duration-700" style={{ width: `${region.pct}%`, background: REGION_COLORS[i] ?? '#94a3b8' }} />
                </div>
              </div>
              <span className="text-xl font-bold flex-shrink-0" style={{ color: REGION_COLORS[i] ?? '#94a3b8' }}>{region.pct}%</span>
            </div>
          ))}
        </div>
      </div>

    </>
  )
}

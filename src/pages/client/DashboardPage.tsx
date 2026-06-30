import { Link } from '@tanstack/react-router'
import { ShoppingBag, Building2, FileText, Plus, Headphones, ArrowRight } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useOrders } from '../../hooks/useOrders'
import { useCompanies } from '../../hooks/useCompanies'
import { useDocuments } from '../../hooks/useDocuments'
import StatusBadge from './StatusBadge'
import { formatDate, formatCurrency } from './statusUtils'

function StatCard({ icon: Icon, label, value, color }: {
  icon: React.ElementType; label: string; value: number | string; color: string
}) {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon size={20} />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>
        <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      </div>
    </div>
  )
}

function QuickAction({ icon: Icon, title, desc, href, external }: {
  icon: React.ElementType; title: string; desc: string; href: string; external?: boolean
}) {
  const cls = "group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-[#1a56ff]/40 hover:shadow-md transition-all duration-200 text-left flex flex-col gap-3"
  const inner = (
    <>
      <div className="w-10 h-10 rounded-xl bg-[#e8efff] text-[#1a56ff] flex items-center justify-center">
        <Icon size={18} />
      </div>
      <div>
        <p className="font-semibold text-gray-900 text-sm group-hover:text-[#1a56ff] transition-colors">{title}</p>
        <p className="text-xs text-gray-500 mt-0.5">{desc}</p>
      </div>
      <ArrowRight size={14} className="text-gray-300 group-hover:text-[#1a56ff] transition-colors mt-auto" />
    </>
  )
  return external
    ? <a href={href} className={cls}>{inner}</a>
    : <Link to={href} className={cls}>{inner}</Link>
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { orders, isLoading: ordersLoading } = useOrders(user?.id)
  const { companies, isLoading: companiesLoading } = useCompanies(user?.id)
  const { documents, isLoading: docsLoading } = useDocuments(user?.id)

  const activeOrders  = orders.filter(o => o.status !== 'completed' && o.status !== 'cancelled').length
  const pendingDocs   = documents.filter(d => d.status === 'pending').length
  const recentOrders  = orders.slice(0, 3)
  const loading       = ordersLoading || companiesLoading || docsLoading

  const name = user?.displayName?.split(' ')[0] || user?.email?.split('@')[0] || 'there'

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto space-y-8 animate-fade-in">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
          Welcome back, {name} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Here's an overview of your account.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={ShoppingBag} label="Active Orders"      value={loading ? '—' : activeOrders}        color="bg-[#e8efff] text-[#1a56ff]" />
        <StatCard icon={Building2}   label="Companies"          value={loading ? '—' : companies.length}    color="bg-green-50 text-green-600" />
        <StatCard icon={FileText}    label="Pending Documents"  value={loading ? '—' : pendingDocs}         color="bg-yellow-50 text-yellow-600" />
      </div>

      {/* Recent Orders */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="font-semibold text-gray-900">Recent Orders</h2>
          <Link to="/client/orders" className="text-xs text-[#1a56ff] font-medium hover:underline flex items-center gap-1">
            View all <ArrowRight size={12} />
          </Link>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-400 text-sm">Loading…</div>
        ) : recentOrders.length === 0 ? (
          <div className="p-8 text-center text-gray-400 text-sm">No orders yet.</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {recentOrders.map(order => (
              <div key={order.id} className="grid grid-cols-[1fr_auto] md:grid-cols-[auto_1fr_auto_auto_auto] items-center gap-3 px-5 py-3.5 hover:bg-gray-50/70 transition-colors">
                <span className="hidden md:block text-xs font-mono text-gray-400">#{order.orderNumber}</span>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">{order.companyName}</p>
                  <p className="text-xs text-gray-400">{order.packageName}</p>
                </div>
                <StatusBadge status={order.status} className="hidden md:inline-flex" />
                <span className="hidden md:block text-sm font-medium text-gray-700">{formatCurrency(order.amount, order.currency)}</span>
                <span className="text-xs text-gray-400">{formatDate(order.createdAt)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <QuickAction icon={Plus}        title="Form New LLC"       desc="Start a new LLC formation order"      href="/client/services" />
          <QuickAction icon={FileText}    title="View Documents"     desc="Access your formation documents"      href="/client/documents" />
          <QuickAction icon={Headphones}  title="Contact Support"    desc="Get help from our team"               href="mailto:info@instantgrow.net" external />
        </div>
      </div>
    </div>
  )
}

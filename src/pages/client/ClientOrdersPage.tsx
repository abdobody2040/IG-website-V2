import { ShoppingBag } from 'lucide-react'
import ClientLayout from './ClientLayout'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { useOrders } from '../../hooks/useOrders'
import { useDocuments } from '../../hooks/useDocuments'
import { useCompanies } from '../../hooks/useCompanies'
import { useLang } from '../../i18n/LanguageContext'
import { OrderCard } from './OrderCard'

export default function ClientOrdersPage() {
  const { t } = useLang()
  const op = t.client.ordersPage
  const { user, isLoading: authLoading } = useRequireAuth()
  const { orders, isLoading: ordersLoading } = useOrders(user?.id)
  const { documents } = useDocuments(user?.id)
  const { companies } = useCompanies(user?.id)

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56ff]" />
      </div>
    )
  }

  const activeCount = orders.filter(o => !['completed', 'cancelled'].includes(o.status)).length

  return (
    <ClientLayout currentPath="/client/orders" title={t.client.nav.myOrders}>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t.client.nav.myOrders}</h2>
            <p className="text-slate-500 text-sm mt-0.5">
              {orders.length > 0
                ? `${op.ordersCount.replace('{count}', String(orders.length))} \u00b7 ${activeCount} ${op.active}`
                : op.subtitle}
            </p>
          </div>
          <a
            href="/order"
            className="bg-[#1a56ff] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#3a76ff] transition-colors shadow-sm shadow-blue-200 flex items-center gap-1.5"
          >
            {op.newOrder}
          </a>
        </div>

        {ordersLoading ? (
          <div className="flex items-center gap-3 py-12 justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1a56ff]" />
            <span className="text-slate-500 text-sm">{op.loading}</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <ShoppingBag size={40} className="text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 mb-1">{op.noOrders}</h3>
            <p className="text-slate-500 text-sm mb-6">{op.noOrdersDesc}</p>
            <a
              href="/order"
              className="inline-block bg-[#1a56ff] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#3a76ff] transition-colors"
            >
              {t.client.startLLCFormation}
            </a>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-xs text-slate-400">{op.clickToSee}</p>
            {orders.map(order => (
              <OrderCard
                key={order.id}
                order={order}
                allDocuments={documents}
                allCompanies={companies}
              />
            ))}
          </div>
        )}
      </div>
    </ClientLayout>
  )
}

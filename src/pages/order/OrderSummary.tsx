import type { Plan, AddOn } from './data'
import { useLang } from '../../i18n/LanguageContext'

export function OrderSummary({
  plan, stateFee, selectedAddOns
}: {
  plan: Plan | undefined
  stateFee: number
  selectedAddOns: AddOn[]
}) {
  const { t } = useLang()
  if (!plan) return null
  const addOnTotal = selectedAddOns.reduce((s, a) => s + a.price, 0)
  const total = plan.price + stateFee + addOnTotal
  const planT = t.order.plans[plan.id]

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 sticky top-6">
      <p className="text-sm font-bold text-slate-900 mb-4">{t.order.orderSummary}</p>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-slate-600">{t.order.basePackage}</span>
          <span className="font-semibold">${plan.price}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-600">{t.order.stateFeeLabel}</span>
          <span className="font-semibold">${stateFee}</span>
        </div>
        {selectedAddOns.map(a => (
          <div key={a.id} className="flex justify-between text-xs">
            <span className="text-slate-500">{t.order.addOns[a.id]?.name ?? a.name}</span>
            <span className="font-semibold">${a.price}</span>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-100 mt-3 pt-3 flex justify-between items-center">
        <span className="font-bold text-slate-900">{t.order.total}</span>
        <span className="text-xl font-extrabold text-[#1a56ff]">${total}</span>
      </div>
      {plan && (
        <div className="mt-4 bg-blue-50 rounded-xl p-3">
          <p className="text-xs font-bold text-blue-800">{planT?.label ?? plan.label} {t.order.formation}</p>
          <p className="text-xs text-blue-600">{planT?.name ?? plan.name}</p>
        </div>
      )}
    </div>
  )
}

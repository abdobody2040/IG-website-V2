import { Check } from 'lucide-react'
import { useLang } from '../../i18n/LanguageContext'
import { PLANS } from './data'

export function StepServicePackage({
  planId, setPlanId
}: {
  planId: string
  setPlanId: (id: string) => void
}) {
  const { t } = useLang()
  const isUk = planId.startsWith('uk')
  const filtered = PLANS.filter(p => p.region === (isUk ? 'uk' : 'us'))

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">{t.order.servicePackageTitle}</h2>
      <p className="text-slate-500 text-sm mb-6">{t.order.servicePackageDesc}</p>

      <div className="grid sm:grid-cols-2 gap-4">
        {filtered.map(plan => {
          const selected = planId === plan.id
          return (
            <button
              key={plan.id}
              type="button"
              onClick={() => setPlanId(plan.id)}
              className={`text-left p-5 rounded-2xl border-2 transition-all hover:shadow-md ${
                selected ? 'border-[#1a56ff] bg-[#1a56ff]/5 shadow-md' : 'border-slate-200 bg-white hover:border-[#1a56ff]/30'
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{t.order.plans[plan.id]?.label ?? plan.label}</span>
                  <p className="font-bold text-slate-900 text-lg">{plan.flag} {t.order.plans[plan.id]?.name ?? plan.name}</p>
                </div>
                <div className={`w-5 h-5 rounded-full border-2 flex-shrink-0 mt-1 transition-all ${
                  selected ? 'border-[#1a56ff] bg-[#1a56ff]' : 'border-slate-300'
                }`}>
                  {selected && <Check size={12} className="text-white m-auto mt-0.5" />}
                </div>
              </div>
              <p className="text-2xl font-extrabold text-[#0a0f1e] mb-1">${plan.price}</p>
              <p className="text-xs text-slate-400 mb-3">{t.order.oneTimePayment}</p>
              <ul className="space-y-1.5">
                {(t.order.plans[plan.id]?.features ?? plan.features).slice(0, 4).map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-slate-600">
                    <Check size={11} className="text-[#1a56ff] flex-shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
                {plan.features.length > 4 && (
                  <li className="text-xs text-[#1a56ff] font-medium">+{plan.features.length - 4} {t.order.moreIncluded}</li>
                )}
              </ul>
            </button>
          )
        })}
      </div>
    </div>
  )
}

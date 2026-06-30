import { Check } from 'lucide-react'
import { useLang } from '../../i18n/LanguageContext'
import { ADD_ONS } from './data'

export function StepAddOns({
  selectedAddOns, setSelectedAddOns
}: {
  selectedAddOns: string[]
  setSelectedAddOns: (ids: string[]) => void
}) {
  const { t } = useLang()
  const toggle = (id: string) => {
    setSelectedAddOns(
      selectedAddOns.includes(id)
        ? selectedAddOns.filter(a => a !== id)
        : [...selectedAddOns, id]
    )
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">{t.order.addOnServicesTitle}</h2>
      <p className="text-slate-500 text-sm mb-4">{t.order.addOnServicesDesc}</p>

      <p className="text-xs font-bold text-[#1a56ff] mb-3">{t.order.premiumAddOns}</p>

      <div className="space-y-3">
        {ADD_ONS.map(addon => {
          const checked = selectedAddOns.includes(addon.id)
          return (
            <label
              key={addon.id}
              className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all ${
                checked ? 'border-[#1a56ff] bg-[#1a56ff]/5' : 'border-slate-200 hover:border-[#1a56ff]/30'
              }`}
              onClick={() => toggle(addon.id)}
            >
              <div className="flex items-start gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                  checked ? 'bg-[#1a56ff] text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {addon.icon}
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">{t.order.addOns[addon.id]?.name ?? addon.name}</p>
                  <p className="text-xs text-slate-500">{t.order.addOns[addon.id]?.description ?? addon.description}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 flex-shrink-0 ml-3">
                <span className="text-sm font-bold text-slate-900">${addon.price}</span>
                <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                  checked ? 'border-[#1a56ff] bg-[#1a56ff]' : 'border-slate-300'
                }`}>
                  {checked && <Check size={11} className="text-white" />}
                </div>
              </div>
            </label>
          )
        })}
      </div>
    </div>
  )
}

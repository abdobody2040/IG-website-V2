import { Check } from 'lucide-react'
import { STEPS } from './data'
import { useLang } from '../../i18n/LanguageContext'

export function StepIndicator({ current }: { current: number }) {
  const { t } = useLang()
  return (
    <div className="flex items-center justify-center gap-0 mb-8 overflow-x-auto pb-2">
      {STEPS.map((_step, i) => {
        const done = i < current
        const active = i === current
        return (
          <div key={i} className="flex items-center">
            <div className="flex flex-col items-center gap-1 min-w-[60px]">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border-2 ${
                done
                  ? 'bg-[#1a56ff] border-[#1a56ff] text-white'
                  : active
                  ? 'bg-[#1a56ff] border-[#1a56ff] text-white ring-4 ring-[#1a56ff]/20'
                  : 'bg-white border-slate-300 text-slate-400'
              }`}>
                {done ? <Check size={14} /> : <span className="text-xs font-bold">{i + 1}</span>}
              </div>
              <span className={`text-[9px] font-semibold text-center leading-tight hidden sm:block ${
                active ? 'text-[#1a56ff]' : done ? 'text-slate-600' : 'text-slate-400'
              }`}>
                {t.order.stepLabels[i]}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`h-0.5 w-6 sm:w-10 mb-4 flex-shrink-0 ${done ? 'bg-[#1a56ff]' : 'bg-slate-200'}`} />
            )}
          </div>
        )
      })}
    </div>
  )
}

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Check } from 'lucide-react'
import { useLang } from '../../i18n/LanguageContext'
import type { WizardData } from './data'
import { POPULAR_STATES, ALL_US_STATES } from './data'

export function StepCompanyInfo({
  register, errors, planId, setPlanId, onStateFeeChange
}: {
  register: ReturnType<typeof useForm<WizardData>>['register']
  errors: ReturnType<typeof useForm<WizardData>>['formState']['errors']
  planId: string
  setPlanId: (id: string) => void
  onStateFeeChange: (fee: number) => void
}) {
  const { t } = useLang()
  const isUk = planId.startsWith('uk')
  const [selectedState, setSelectedState] = useState('')
  const [showAllStates, setShowAllStates] = useState(false)

  const handleStateSelect = (stateName: string, fee: number) => {
    setSelectedState(stateName)
    onStateFeeChange(fee)
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">{t.order.companyInfoTitle}</h2>
      <p className="text-slate-500 text-sm mb-6">{t.order.companyInfoDesc}</p>

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            {t.order.companyNameLabel} <span className="text-red-500">*</span>
          </label>
          <input
            {...register('companyName', { required: t.order.companyNameRequired })}
            placeholder={isUk ? t.order.companyNamePlaceholderLTD : t.order.companyNamePlaceholderLLC}
            className="w-full bg-white text-slate-900 border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a56ff] focus:ring-2 focus:ring-[#1a56ff]/10 transition-all placeholder:text-slate-400"
          />
          {errors.companyName && <p className="text-red-500 text-xs mt-1">{errors.companyName.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-2">{t.order.companyTypeLabel}</label>
          <div className="flex gap-3">
            {(['us', 'uk'] as const).map(r => {
              const usePlan = r === 'us' ? (planId === 'us-premium' ? 'us-premium' : 'us-basic') : (planId === 'uk-premium' ? 'uk-premium' : 'uk-basic')
              const active = planId.startsWith(r)
              return (
                <button
                  key={r}
                  type="button"
                  onClick={() => setPlanId(usePlan)}
                  className={`flex-1 py-2.5 px-4 rounded-xl border-2 text-sm font-semibold transition-all ${
                    active ? 'border-[#1a56ff] bg-[#1a56ff]/5 text-[#1a56ff]' : 'border-slate-200 text-slate-600 hover:border-[#1a56ff]/30'
                  }`}
                >
                  {r === 'us' ? 'US LLC' : 'UK LTD'}
                </button>
              )
            })}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            {t.order.businessPurposeLabel}
            <span className="text-slate-400 font-normal ms-2 text-xs">{t.order.businessPurposeWords}</span>
          </label>
          <textarea
            {...register('businessPurpose')}
            placeholder={t.order.businessPurposePlaceholder}
            rows={3}
            className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a56ff] focus:ring-2 focus:ring-[#1a56ff]/10 transition-all resize-none"
          />
        </div>

        {!isUk && (
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              {t.order.formationStateLabel} <span className="text-red-500">*</span>
            </label>
            <p className="text-xs font-semibold text-[#1a56ff] mb-2">{t.order.popularChoices}</p>
            <div className="space-y-2 mb-3">
              {POPULAR_STATES.map(s => (
                <label
                  key={s.name}
                  className={`flex items-center justify-between p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    selectedState === s.name
                      ? 'border-[#1a56ff] bg-[#1a56ff]/5'
                      : 'border-slate-200 hover:border-[#1a56ff]/30'
                  }`}
                  onClick={() => handleStateSelect(s.name, s.fee)}
                >
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {s.name}
                      {s.fee > 0 && <span className="ms-2 text-xs text-slate-500">+${s.fee}</span>}
                      {s.fee === 0 && <span className="ms-2 text-xs text-green-600">{t.order.free}</span>}
                    </p>
                    <p className="text-xs text-slate-500">{t.order.stateNotes[s.name] ?? s.note}</p>
                  </div>
                  <div className={`w-4 h-4 rounded-full border-2 flex-shrink-0 transition-all ${
                    selectedState === s.name ? 'border-[#1a56ff] bg-[#1a56ff]' : 'border-slate-300'
                  }`}>
                    {selectedState === s.name && <Check size={10} className="text-white m-auto mt-0.5" />}
                  </div>
                </label>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowAllStates(!showAllStates)}
              className="text-xs text-[#1a56ff] font-semibold underline mb-2"
            >
              {showAllStates ? t.order.hide : t.order.allStates}
            </button>

            {showAllStates && (
              <select
                {...register('companyState', { required: 'Please select a state' })}
                className="w-full border border-slate-300 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-[#1a56ff] bg-white"
                onChange={e => {
                  const val = e.target.value
                  setSelectedState(val)
                  onStateFeeChange(0)
                }}
              >
                <option value="">{t.order.selectState}</option>
                {ALL_US_STATES.map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            )}

            <input type="hidden" {...register('companyState', { required: t.order.selectStateRequired })} value={selectedState} />
            {errors.companyState && <p className="text-red-500 text-xs mt-1">{errors.companyState.message}</p>}
          </div>
        )}
      </div>
    </div>
  )
}

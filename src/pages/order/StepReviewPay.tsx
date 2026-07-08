import { Globe, CreditCard, FileText } from 'lucide-react'
import { useLang } from '../../i18n/LanguageContext'
import type { WizardData, Plan, AddOn, Member } from './data'

export function StepReviewPay({
  data, plan, stateFee, selectedAddOns, members, paymentMethod, setPaymentMethod
}: {
  data: Partial<WizardData>
  plan: Plan | undefined
  stateFee: number
  selectedAddOns: AddOn[]
  members: Member[]
  paymentMethod: 'stripe' | 'invoice'
  setPaymentMethod: (method: 'stripe' | 'invoice') => void
}) {
  const { t, isRTL } = useLang()
  const addOnTotal = selectedAddOns.reduce((s, a) => s + a.price, 0)
  const total = (plan?.price || 0) + stateFee + addOnTotal
  const orderTranslations = t.order as any

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">{t.order.reviewPayTitle}</h2>
      <p className="text-slate-500 text-sm mb-6">{t.order.reviewPayDesc}</p>

      <div className="space-y-4">
        {/* Payment Method Selector */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            {isRTL ? 'طريقة الدفع' : 'Payment Method'}
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card (Stripe) Option */}
            <label
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                paymentMethod === 'stripe' ? 'border-[#1a56ff] bg-[#1a56ff]/5' : 'border-slate-200 hover:border-[#1a56ff]/30'
              }`}
              onClick={() => setPaymentMethod('stripe')}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                paymentMethod === 'stripe' ? 'bg-[#1a56ff] text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                <CreditCard size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  {orderTranslations.payCardTitle}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {orderTranslations.payCardDesc}
                </p>
              </div>
            </label>

            {/* Invoice Option */}
            <label
              className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                paymentMethod === 'invoice' ? 'border-[#1a56ff] bg-[#1a56ff]/5' : 'border-slate-200 hover:border-[#1a56ff]/30'
              }`}
              onClick={() => setPaymentMethod('invoice')}
            >
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                paymentMethod === 'invoice' ? 'bg-[#1a56ff] text-white' : 'bg-slate-100 text-slate-500'
              }`}>
                <FileText size={16} />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  {orderTranslations.payInvoiceTitle}
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  {orderTranslations.payInvoiceDesc}
                </p>
              </div>
            </label>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t.order.formationPackage}</p>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-slate-900">{plan ? (t.order.plans[plan.id]?.name ?? plan.name) : ''}</p>
              <p className="text-sm text-slate-500">{plan ? (t.order.plans[plan.id]?.description ?? plan.description) : ''}</p>
            </div>
            <p className="text-2xl font-extrabold text-[#1a56ff]">${plan?.price}</p>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t.order.companyDetails}</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-slate-500">{t.order.companyNameReview}</p><p className="font-semibold text-slate-900">{data.companyName || '—'} {data.companyType}</p></div>
            {data.companyState && <div><p className="text-slate-500">{t.order.stateReview}</p><p className="font-semibold text-slate-900">{data.companyState}</p></div>}
            <div><p className="text-slate-500">{t.order.entityReview}</p><p className="font-semibold text-slate-900">{data.companyType}</p></div>
          </div>
        </div>

        {members.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t.order.membersOwners}</p>
            <div className="space-y-2">
              {members.map((m, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-slate-900">{m.fullName || '—'}</p>
                    <p className="text-xs text-slate-500 capitalize">{m.role.replace('_', ' ')} · {m.email}</p>
                  </div>
                  <p className="font-bold text-slate-700">{m.ownership}%</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {selectedAddOns.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t.order.addOnServicesReview}</p>
            {selectedAddOns.map(a => (
              <div key={a.id} className="flex justify-between text-sm py-1">
                <span className="text-slate-700">{t.order.addOns[a.id]?.name ?? a.name}</span>
                <span className="font-semibold">${a.price}</span>
              </div>
            ))}
          </div>
        )}

        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-slate-500">{t.order.basePackage}</span><span>${plan?.price}</span></div>
            {stateFee > 0 && <div className="flex justify-between"><span className="text-slate-500">{t.order.stateFeeLabel}</span><span>${stateFee}</span></div>}
            {addOnTotal > 0 && <div className="flex justify-between"><span className="text-slate-500">{t.order.addOnsTotal}</span><span>${addOnTotal}</span></div>}
          </div>
          <div className="border-t border-slate-100 mt-3 pt-3 flex justify-between items-center">
            <span className="font-bold text-slate-900">{t.order.total}</span>
            <span className="text-2xl font-extrabold text-[#1a56ff]">${total}</span>
          </div>
        </div>

        {paymentMethod === 'stripe' ? (
          <div className="bg-[#0a0f1e] rounded-2xl p-5 text-white">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#1a56ff] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <CreditCard size={16} />
              </div>
              <div>
                <p className="font-semibold mb-1">{orderTranslations.paymentViaStripe}</p>
                <p className="text-white/60 text-sm">{orderTranslations.payCardDesc}</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#0a0f1e] rounded-2xl p-5 text-white">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#1a56ff] rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Globe size={16} />
              </div>
              <div>
                <p className="font-semibold mb-1">{t.order.paymentViaInvoice}</p>
                <p className="text-white/60 text-sm">{t.order.paymentNote}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

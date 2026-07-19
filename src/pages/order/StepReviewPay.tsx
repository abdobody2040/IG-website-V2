import { Globe, CreditCard, FileText, Lock } from 'lucide-react'
import { useLang } from '../../i18n/LanguageContext'
import type { WizardData, Plan, AddOn, Member } from './data'

interface CardDetails {
  number: string
  expiry: string
  cvc: string
  name: string
}

export function StepReviewPay({
  data, plan, stateFee, selectedAddOns, members, paymentMethod, setPaymentMethod,
  cardDetails, setCardDetails,
}: {
  data: Partial<WizardData>
  plan: Plan | undefined
  stateFee: number
  selectedAddOns: AddOn[]
  members: Member[]
  paymentMethod: 'stripe' | 'invoice'
  setPaymentMethod: (method: 'stripe' | 'invoice') => void
  cardDetails: CardDetails
  setCardDetails: (d: CardDetails) => void
}) {
  const { t, isRTL } = useLang()
  const addOnTotal = selectedAddOns.reduce((s, a) => s + a.price, 0)
  const total = (plan?.price || 0) + stateFee + addOnTotal
  const orderTranslations = t.order as any

  const formatCardNumber = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 16)
    return digits.replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = (value: string) => {
    const digits = value.replace(/\D/g, '').slice(0, 4)
    if (digits.length >= 3) return digits.slice(0, 2) + '/' + digits.slice(2)
    return digits
  }

  const updateCard = (field: keyof CardDetails, value: string) => {
    setCardDetails({ ...cardDetails, [field]: value })
  }

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

        {/* ── Stripe Card Form ── */}
        {paymentMethod === 'stripe' && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 text-slate-800">
            <div className="flex items-center gap-2 mb-4">
              <Lock size={14} className="text-[#1a56ff]" />
              <p className="text-sm font-semibold text-slate-800">
                {isRTL ? 'بيانات البطاقة الائتمانية الآمنة' : (orderTranslations.paymentViaStripe ?? 'Secure Card Payment')}
              </p>
              <div className="ml-auto flex items-center gap-1.5">
                {/* Card brand icons */}
                <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-600 rounded px-1.5 py-0.5 font-bold font-mono">VISA</span>
                <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-600 rounded px-1.5 py-0.5 font-bold font-mono">MC</span>
                <span className="text-[9px] bg-slate-100 border border-slate-200 text-slate-600 rounded px-1.5 py-0.5 font-bold font-mono">AMEX</span>
              </div>
            </div>

            <div className="space-y-3">
              {/* Cardholder name */}
              <div>
                <label htmlFor="secure_client_f1" className="block text-xs font-semibold text-slate-600 mb-1">
                  {isRTL ? 'الاسم على البطاقة' : 'Name on Card'}
                </label>
                <input
                  type="text"
                  id="secure_client_f1"
                  name="secure_client_f1"
                  autoComplete="off"
                  value={cardDetails.name}
                  onChange={e => updateCard('name', e.target.value)}
                  placeholder={isRTL ? 'الاسم بالكامل' : 'e.g. John Doe'}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1a56ff] focus:ring-2 focus:ring-[#1a56ff]/10"
                />
              </div>

              {/* Card number */}
              <div>
                <label htmlFor="secure_client_f2" className="block text-xs font-semibold text-slate-600 mb-1">
                  {isRTL ? 'رقم البطاقة' : 'Card Number'}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    id="secure_client_f2"
                    name="secure_client_f2"
                    inputMode="numeric"
                    autoComplete="off"
                    value={cardDetails.number}
                    onChange={e => updateCard('number', formatCardNumber(e.target.value))}
                    placeholder="•••• •••• •••• ••••"
                    maxLength={19}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1a56ff] focus:ring-2 focus:ring-[#1a56ff]/10 font-mono tracking-wider"
                  />
                  <CreditCard size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
                </div>
              </div>

              {/* Expiry + CVC */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="secure_client_f3" className="block text-xs font-semibold text-slate-600 mb-1">
                    {isRTL ? 'تاريخ الانتهاء' : 'Expiry Date'}
                  </label>
                  <input
                    type="text"
                    id="secure_client_f3"
                    name="secure_client_f3"
                    inputMode="numeric"
                    autoComplete="off"
                    value={cardDetails.expiry}
                    onChange={e => updateCard('expiry', formatExpiry(e.target.value))}
                    placeholder="••/••"
                    maxLength={5}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1a56ff] focus:ring-2 focus:ring-[#1a56ff]/10 font-mono"
                  />
                </div>
                <div>
                  <label htmlFor="secure_client_f4" className="block text-xs font-semibold text-slate-600 mb-1">
                    {isRTL ? 'الرمز السري (CVC)' : 'CVC / CVV'}
                  </label>
                  <input
                    type="text"
                    id="secure_client_f4"
                    name="secure_client_f4"
                    inputMode="numeric"
                    autoComplete="off"
                    value={cardDetails.cvc}
                    onChange={e => updateCard('cvc', e.target.value.replace(/\D/g, '').slice(0, 4))}
                    placeholder="•••"
                    maxLength={4}
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#1a56ff] focus:ring-2 focus:ring-[#1a56ff]/10 font-mono"
                  />
                </div>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-slate-400 flex items-center gap-1">
              <Lock size={10} className="text-slate-400" /> {isRTL ? 'دفعتك مشفرة وآمنة تماماً ببروتوكول SSL 256-bit' : 'Your payment is secured with 256-bit SSL encryption'}
            </p>
          </div>
        )}

        {/* Invoice info */}
        {paymentMethod === 'invoice' && (
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

        {/* Package */}
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

        {/* Company details */}
        <div className="bg-white border border-slate-200 rounded-2xl p-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t.order.companyDetails}</p>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div><p className="text-slate-500">{t.order.companyNameReview}</p><p className="font-semibold text-slate-900">{data.companyName || '—'} {data.companyType}</p></div>
            {data.companyState && <div><p className="text-slate-500">{t.order.stateReview}</p><p className="font-semibold text-slate-900">{data.companyState}</p></div>}
            <div><p className="text-slate-500">{t.order.entityReview}</p><p className="font-semibold text-slate-900">{data.companyType}</p></div>
          </div>
        </div>

        {/* Members */}
        {members.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5">
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">{t.order.membersOwners}</p>
            <div className="space-y-2">
              {members.map((m, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div>
                    <p className="font-semibold text-slate-900">{m.fullName || '—'}</p>
                    <p className="text-xs text-slate-500 capitalize">{String(m.role).replace(/_/g, ' ')} · {m.email}</p>
                  </div>
                  <p className="font-bold text-slate-700">{m.ownership}%</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add-ons */}
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

        {/* Total */}
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
      </div>
    </div>
  )
}

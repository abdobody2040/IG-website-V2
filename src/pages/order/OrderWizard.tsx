import { useState } from 'react'
import { useNavigate, useSearch } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { ArrowLeft, ArrowRight, Check, ChevronLeft, ChevronRight, Globe } from 'lucide-react'
import { pb } from '../../lib/pocketbase'
import { useAuth } from '../../hooks/useAuth'
import { toast } from 'react-hot-toast'
import { useLang } from '../../i18n/LanguageContext'
import type { Member, WizardData } from './data'
import { PLANS, ADD_ONS, STEPS } from './data'
import { StepIndicator } from './StepIndicator'
import { OrderSummary } from './OrderSummary'
import { StepCompanyInfo } from './StepCompanyInfo'
import { StepMemberInfo } from './StepMemberInfo'
import { StepServicePackage } from './StepServicePackage'
import { StepAddOns } from './StepAddOns'
import { StepAccount } from './StepAccount'
import { StepReviewPay } from './StepReviewPay'

const TOTAL_STEPS = STEPS.length

export default function OrderWizard() {
  const { user, isLoading: authLoading } = useAuth()
  const navigate = useNavigate()

  const search = useSearch({ strict: false }) as { plan?: string }
  const preselect = search?.plan ?? 'us-premium'

  const [step, setStep] = useState(0)
  const [planId, setPlanId] = useState(preselect)
  const [stateFee, setStateFee] = useState(0)
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'invoice'>('stripe')
  const [cardDetails, setCardDetails] = useState({ number: '', expiry: '', cvc: '', name: '' })
  const [members, setMembers] = useState<Member[]>([{
    id: crypto.randomUUID(),
    fullName: '',
    role: 'managing_member',
    ownership: 100,
    address: '',
    email: '',
    phone: ''
  }])

  const { t, isRTL, toggleLang, lang } = useLang()

  const { register, getValues, trigger, setValue, formState: { errors } } = useForm<WizardData>({
    defaultValues: {
      planId: preselect,
      companyType: preselect.startsWith('uk') ? 'LTD' : 'LLC',
      email: user?.email ?? '',
      fullName: user?.displayName ?? '',
    }
  })

  const handleSetPlanId = (id: string) => {
    setPlanId(id)
    setValue('companyType', id.startsWith('uk') ? 'LTD' : 'LLC')
  }

  const plan = PLANS.find(p => p.id === planId)
  const planRegion: 'us' | 'uk' = planId.startsWith('uk') ? 'uk' : 'us'
  const addOnObjects = ADD_ONS.filter(a => selectedAddOns.includes(a.id))

  const next = async () => {
    let valid = true
    if (step === 0) valid = await trigger(['companyName'])
    if (step === 5) valid = await trigger(['fullName', 'email'])
    if (valid) setStep(s => Math.min(s + 1, TOTAL_STEPS - 1))
  }

  const back = () => setStep(s => Math.max(s - 1, 0))

  const onSubmit = async () => {
    setSubmitting(true)
    try {
      const data = getValues()
      const selectedPlan = PLANS.find(p => p.id === planId)!

      let uid = user?.id

      if (!uid) {
        const tempPassword = crypto.randomUUID() + 'Aa1!'
        await pb.collection('users').create({
          email: data.email,
          password: tempPassword,
          passwordConfirm: tempPassword,
          display_name: data.fullName,
          role: 'client',
        })
        const authData = await pb.collection('users').authWithPassword(data.email, tempPassword)
        uid = authData.record.id
      }

      if (!uid) throw new Error('Authentication failed')

      const addOnTotal = addOnObjects.reduce((s, a) => s + a.price, 0)
      const totalAmount = selectedPlan.price + stateFee + addOnTotal
      const checkoutEndpoint = import.meta.env.VITE_CHECKOUT_ENDPOINT as string | undefined

      if (paymentMethod === 'stripe' && checkoutEndpoint) {
        // ── Production Stripe: redirect to Stripe Checkout ──
        const headers: Record<string, string> = { 'Content-Type': 'application/json' }
        if (pb.authStore.token) headers.Authorization = `Bearer ${pb.authStore.token}`

        const res = await fetch(checkoutEndpoint, {
          method: 'POST',
          headers,
          body: JSON.stringify({
            mode: 'formation',
            planId,
            companyName: data.companyName,
            companyState: data.companyState || (planId.startsWith('uk') ? 'UK' : 'N/A'),
            companyType: data.companyType ?? (planId.startsWith('uk') ? 'LTD' : 'LLC'),
            businessActivity: data.businessPurpose || 'Company formation',
            customerEmail: data.email,
            customerName: data.fullName,
            customerPhone: data.phone ?? '',
            customerCountry: '',
            customerAddress: members[0]?.address ?? '',
            userId: uid,
            selectedAddOns,
            successUrl: `${window.location.origin}/order/success`,
            cancelUrl: `${window.location.origin}/order?plan=${planId}`,
          }),
        })

        const checkoutData = await res.json().catch(() => ({}))
        if (!res.ok) throw new Error(checkoutData.error ?? `Checkout failed (${res.status})`)
        if (!checkoutData.url) throw new Error('No checkout URL returned')

        window.location.href = checkoutData.url
      } else {
        // ── Invoice OR Dev mode: create order directly in PocketBase ──
        const orderNumber = 'IG-' + crypto.randomUUID().slice(0, 6).toUpperCase()
        const state = data.companyState || (planId.startsWith('uk') ? 'UK' : 'N/A')
        const companyType = data.companyType ?? (planId.startsWith('uk') ? 'LTD' : 'LLC')

        const createdOrder = await pb.collection('orders').create({
          user: uid,
          order_number: orderNumber,
          package_name: selectedPlan.name,
          company_name: data.companyName || 'Test Company',
          company_state: state,
          company_type: companyType,
          status: 'pending',
          amount: totalAmount,
          currency: selectedPlan.currency,
          customer_name: data.fullName,
          customer_email: data.email,
          customer_phone: data.phone ?? null,
          notes: paymentMethod === 'invoice' ? 'Invoice Payment Selected' : 'Dev/test order',
        })

        // Also create a payment record in PocketBase
        await pb.collection('payments').create({
          user: uid,
          order: createdOrder.id,
          service: selectedPlan.name,
          invoice_id: `INV-${orderNumber.split("-").pop()}`,
          amount: totalAmount,
          currency: selectedPlan.currency,
          status: 'pending',
          notes: paymentMethod === 'invoice' ? 'Pending Invoice Payment' : 'Dev payment',
        }).catch(err => console.error('Failed to create payment record:', err))

        if (paymentMethod === 'invoice') {
          toast.success(lang === 'ar' ? 'تم تقديم الطلب بنجاح!' : 'Order submitted successfully!')
          navigate({ to: '/client/dashboard' })
        } else {
          navigate({
            to: '/order/success',
            search: { orderNumber, plan: selectedPlan.name, company: data.companyName || 'Your Company', method: paymentMethod },
          })
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to place order. Please try again.'
      toast.error(msg)
    } finally {
      setSubmitting(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56ff]" />
      </div>
    )
  }

  const formValues = getValues()

  return (
    <div className="force-light min-h-screen bg-slate-50" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <img src="/logo.png" alt="Instant Grow" className="h-9 w-auto" />
        </a>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleLang}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#1a56ff] font-semibold transition-colors px-2 py-1 border border-slate-200 rounded-lg"
          >
            <Globe size={13} />
            {lang === 'en' ? 'العربية' : 'English'}
          </button>
          <span className="text-xs text-slate-400 hidden sm:block">🔒 {t.order.secureOrder}</span>
          {!user && (
            <a href="/auth/login" className="text-xs text-[#1a56ff] font-semibold hover:underline">{t.order.alreadyHaveAccount}</a>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-1">{t.order.formYourBusiness}</h1>
          <p className="text-slate-500 text-sm">{t.order.completeSteps}</p>
        </div>

        <StepIndicator current={step} />

        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
              {step === 0 && (
                <StepCompanyInfo
                  register={register}
                  errors={errors}
                  planId={planId}
                  setPlanId={handleSetPlanId}
                  onStateFeeChange={setStateFee}
                />
              )}
              {step === 1 && (
                <StepMemberInfo members={members} setMembers={setMembers} planRegion={planRegion} />
              )}
              {step === 2 && (
                <StepServicePackage planId={planId} setPlanId={handleSetPlanId} />
              )}
              {step === 3 && (
                <StepAddOns category="compliance" selectedAddOns={selectedAddOns} setSelectedAddOns={setSelectedAddOns} planRegion={planRegion} />
              )}
              {step === 4 && (
                <StepAddOns category="tech" selectedAddOns={selectedAddOns} setSelectedAddOns={setSelectedAddOns} planRegion={planRegion} />
              )}
              {step === 5 && (
                <StepAccount user={user} register={register} errors={errors} />
              )}
              {step === 6 && (
                <StepReviewPay
                  data={{ ...formValues, planId }}
                  plan={plan}
                  stateFee={stateFee}
                  selectedAddOns={addOnObjects}
                  members={members}
                  paymentMethod={paymentMethod}
                  setPaymentMethod={setPaymentMethod}
                  cardDetails={cardDetails}
                  setCardDetails={setCardDetails}
                />
              )}

              <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
                {step > 0 ? (
                  <button
                    type="button"
                    onClick={back}
                    className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors px-4 py-2.5 border border-slate-200 rounded-xl hover:border-slate-300"
                  >
                    {isRTL ? <ArrowRight size={15} /> : <ArrowLeft size={15} />} {t.order.previous}
                  </button>
                ) : (
                  <a href="/#pricing" className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-slate-900 px-4 py-2.5 border border-slate-200 rounded-xl">
                    {isRTL ? <ArrowRight size={15} /> : <ArrowLeft size={15} />} {t.order.backToPricing}
                  </a>
                )}

                {step < TOTAL_STEPS - 1 ? (
                  <button
                    type="button"
                    onClick={next}
                    className="flex items-center gap-2 bg-[#1a56ff] text-white font-semibold text-sm px-6 py-3 rounded-xl hover:bg-[#3a76ff] transition-colors shadow-sm"
                  >
                    {t.order.nextStep} {isRTL ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={onSubmit}
                    disabled={submitting || (
                      paymentMethod === 'stripe' &&
                      (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvc || !cardDetails.name)
                    )}
                    className="flex items-center gap-2 bg-[#1a56ff] text-white font-semibold text-sm px-8 py-3 rounded-xl hover:bg-[#3a76ff] transition-colors disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
                  >
                    {submitting ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t.order.placingOrder}</>
                    ) : (
                      <>{t.order.placeOrder} <Check size={15} /></>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="lg:w-72">
            <OrderSummary
              plan={plan}
              stateFee={stateFee}
              selectedAddOns={addOnObjects}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

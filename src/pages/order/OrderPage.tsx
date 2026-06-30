import { useState } from 'react'
import { useSearch, Link } from '@tanstack/react-router'
import { PRICING_DATA } from '../../config/pricing'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Check, ChevronRight, ArrowLeft, Building2, User, CreditCard, Loader2 } from 'lucide-react'
import { pb } from '../../lib/pocketbase'
import { useAuth } from '../../hooks/useAuth'

/* ── Plans ── */
const PLANS = {
  'us-basic':   { name: 'US LLC – Basic',   price: PRICING_DATA.us.basic, region: 'us', companyType: 'LLC' },
  'us-premium': { name: 'US LLC – Premium', price: PRICING_DATA.us.premium, region: 'us', companyType: 'LLC' },
  'uk-basic':   { name: 'UK LTD – Basic',   price: PRICING_DATA.uk.basic, region: 'uk', companyType: 'LTD' },
  'uk-premium': { name: 'UK LTD – Premium', price: PRICING_DATA.uk.premium, region: 'uk', companyType: 'LTD' },
}
type PlanKey = keyof typeof PLANS

const US_STATES = [
  'Wyoming','Delaware','New Mexico','Florida','Texas','Nevada','Colorado',
  'California','New York','Washington','Oregon','Georgia','Arizona','Ohio',
  'Illinois','Pennsylvania','North Carolina','Virginia','Maryland','Massachusetts',
]

const UK_ACTIVITIES = [
  'E-commerce / Online Store',
  'Software / SaaS / App',
  'Consulting / Freelancing',
  'Digital Marketing / Agency',
  'Import / Export',
  'Dropshipping',
  'Content Creation / Media',
  'Education / Coaching',
  'Finance / Crypto / Investing',
  'Other',
]

/* ── Zod schemas ── */
const step1Schema = z.object({
  companyName: z.string().min(2, 'Company name must be at least 2 characters'),
  companyState: z.string().min(1, 'Please select a state / jurisdiction'),
  businessActivity: z.string().min(1, 'Please describe your business'),
})

const step2Schema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().min(6, 'Phone number is required'),
  country: z.string().min(1, 'Country is required'),
  address: z.string().min(5, 'Address is required'),
})

type Step1 = z.infer<typeof step1Schema>
type Step2 = z.infer<typeof step2Schema>

/* ── Step indicator ── */
function StepDot({ n, active, done, label }: { n: number; active: boolean; done: boolean; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
        done ? 'bg-[#1a56ff] border-[#1a56ff] text-white'
          : active ? 'border-[#1a56ff] text-[#1a56ff] bg-white'
          : 'border-slate-300 text-slate-400 bg-white'
      }`}>
        {done ? <Check size={14} /> : n}
      </div>
      <span className={`text-sm font-medium hidden sm:block ${active ? 'text-[#1a56ff]' : done ? 'text-slate-700' : 'text-slate-400'}`}>
        {label}
      </span>
    </div>
  )
}

/* ── Main component ── */
export default function OrderPage() {
  const search = useSearch({ from: '/order' }) as { plan?: string }
  const initialPlan = (search?.plan && search.plan in PLANS ? search.plan : 'us-premium') as PlanKey

  const [selectedPlan, setSelectedPlan] = useState<PlanKey>(initialPlan)
  const [step, setStep] = useState(1)
  const [step1Data, setStep1Data] = useState<Step1 | null>(null)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [checkoutError, setCheckoutError] = useState('')

  const { user } = useAuth()
  const plan = PLANS[selectedPlan]

  /* Step 1 form */
  const form1 = useForm<Step1>({ resolver: zodResolver(step1Schema) })
  /* Step 2 form */
  const form2 = useForm<Step2>({
    resolver: zodResolver(step2Schema),
    defaultValues: { email: user?.email ?? '' },
  })

  const onStep1 = (data: Step1) => {
    setStep1Data(data)
    setStep(2)
  }

  const onStep2 = async (data: Step2) => {
    if (!step1Data) return
    setIsCheckingOut(true)
    setCheckoutError('')

    try {
      const payload = {
        plan: selectedPlan,
        planName: plan.name,
        amount: plan.price,
        companyName: step1Data.companyName,
        companyState: step1Data.companyState,
        companyType: plan.companyType,
        businessActivity: step1Data.businessActivity,
        customerEmail: data.email,
        customerName: `${data.firstName} ${data.lastName}`,
        customerPhone: data.phone,
        customerCountry: data.country,
        customerAddress: data.address,
        userId: user?.id ?? null,
        successUrl: `${window.location.origin}/order/success`,
        cancelUrl: `${window.location.origin}/order?plan=${selectedPlan}`,
      }

      const checkoutEndpoint = import.meta.env.VITE_CHECKOUT_ENDPOINT as string | undefined
      if (!checkoutEndpoint) throw new Error('Checkout endpoint not configured')

      const { data: { session } } = await Promise.resolve({ data: { session: pb.authStore.isValid ? { user: pb.authStore.model, access_token: pb.authStore.token } : null } })
      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (session?.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`
      }

      const res = await fetch(checkoutEndpoint, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error('Checkout request failed')
      const { url } = await res.json() as { url: string }

      if (!url) throw new Error('No checkout URL returned')
      window.open(url, '_blank')
    } catch (err: unknown) {
      setCheckoutError(err instanceof Error ? err.message : 'Failed to start checkout. Please try again.')
    } finally {
      setIsCheckingOut(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#f9fafb]" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
      {/* Nav */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="Instant Grow" className="h-9 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <StepDot n={1} active={step === 1} done={step > 1} label="Company Details" />
            <ChevronRight size={14} className="text-slate-300" />
            <StepDot n={2} active={step === 2} done={step > 2} label="Your Info" />
            <ChevronRight size={14} className="text-slate-300" />
            <StepDot n={3} active={step === 3} done={false} label="Payment" />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 grid lg:grid-cols-[1fr_340px] gap-8 items-start">

        {/* ── Left: Form ── */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">

          {/* Plan picker */}
          <div className="mb-8">
            <h2 className="text-lg font-bold text-slate-900 mb-4">Choose Your Plan</h2>
            <div className="grid grid-cols-2 gap-3">
              {(Object.entries(PLANS) as [PlanKey, typeof PLANS[PlanKey]][]).map(([key, p]) => (
                <button
                  key={key}
                  onClick={() => setSelectedPlan(key)}
                  className={`text-left p-4 rounded-xl border-2 transition-all ${
                    selectedPlan === key
                      ? 'border-[#1a56ff] bg-[#1a56ff]/5'
                      : 'border-slate-200 hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{p.region === 'us' ? '🇺🇸' : '🇬🇧'}</span>
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      {p.region === 'us' ? 'US LLC' : 'UK LTD'}
                    </span>
                  </div>
                  <p className="font-bold text-slate-900 text-sm">{p.name.split('–')[1]?.trim()}</p>
                  <p className="text-[#1a56ff] font-extrabold text-lg mt-0.5">${p.price}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Step 1 */}
          {step === 1 && (
            <form onSubmit={form1.handleSubmit(onStep1)} className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <Building2 size={18} className="text-[#1a56ff]" />
                <h2 className="text-lg font-bold text-slate-900">Company Details</h2>
              </div>

              <Field label="Company Name" error={form1.formState.errors.companyName?.message}>
                <input
                  {...form1.register('companyName')}
                  placeholder={plan.companyType === 'LLC' ? 'e.g. Apex Solutions LLC' : 'e.g. Apex Solutions Ltd'}
                  className="input"
                />
              </Field>

              <Field
                label={plan.region === 'us' ? 'State of Formation' : 'Business Activity / Industry'}
                error={form1.formState.errors.companyState?.message}
              >
                {plan.region === 'us' ? (
                  <select {...form1.register('companyState')} className="input">
                    <option value="">Select a state…</option>
                    {US_STATES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                ) : (
                  <select {...form1.register('companyState')} className="input">
                    <option value="">Select jurisdiction…</option>
                    <option value="England and Wales">England and Wales</option>
                    <option value="Scotland">Scotland</option>
                    <option value="Northern Ireland">Northern Ireland</option>
                  </select>
                )}
              </Field>

              <Field label="Business Activity / What does your company do?" error={form1.formState.errors.businessActivity?.message}>
                <select {...form1.register('businessActivity')} className="input">
                  <option value="">Select activity…</option>
                  {UK_ACTIVITIES.map(a => <option key={a} value={a}>{a}</option>)}
                </select>
              </Field>

              <button
                type="submit"
                className="w-full bg-[#1a56ff] text-white font-bold py-3.5 rounded-xl hover:bg-[#3a76ff] transition-colors flex items-center justify-center gap-2"
              >
                Continue to Your Info <ChevronRight size={16} />
              </button>
            </form>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <form onSubmit={form2.handleSubmit(onStep2)} className="space-y-5">
              <div className="flex items-center gap-2 mb-2">
                <User size={18} className="text-[#1a56ff]" />
                <h2 className="text-lg font-bold text-slate-900">Your Information</h2>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="First Name" error={form2.formState.errors.firstName?.message}>
                  <input {...form2.register('firstName')} placeholder="Jane" className="input" />
                </Field>
                <Field label="Last Name" error={form2.formState.errors.lastName?.message}>
                  <input {...form2.register('lastName')} placeholder="Smith" className="input" />
                </Field>
              </div>

              <Field label="Email Address" error={form2.formState.errors.email?.message}>
                <input {...form2.register('email')} type="email" placeholder="you@example.com" className="input" />
              </Field>

              <Field label="Phone Number (with country code)" error={form2.formState.errors.phone?.message}>
                <input {...form2.register('phone')} placeholder="+1 555 000 0000" className="input" />
              </Field>

              <Field label="Country of Residence" error={form2.formState.errors.country?.message}>
                <input {...form2.register('country')} placeholder="e.g. Egypt, UAE, Saudi Arabia" className="input" />
              </Field>

              <Field label="Full Address" error={form2.formState.errors.address?.message}>
                <input {...form2.register('address')} placeholder="Street, City, Postal Code" className="input" />
              </Field>

              {checkoutError && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  {checkoutError}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex items-center gap-2 px-5 py-3.5 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition-colors"
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <button
                  type="submit"
                  disabled={isCheckingOut}
                  className="flex-1 bg-[#1a56ff] text-white font-bold py-3.5 rounded-xl hover:bg-[#3a76ff] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isCheckingOut ? (
                    <><Loader2 size={16} className="animate-spin" /> Opening Checkout…</>
                  ) : (
                    <><CreditCard size={16} /> Pay ${plan.price} Securely</>
                  )}
                </button>
              </div>
              <p className="text-center text-xs text-slate-400">
                🔒 Powered by Stripe · 256-bit SSL encryption
              </p>
            </form>
          )}
        </div>

        {/* ── Right: Order summary ── */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
            <h3 className="font-bold text-slate-900 mb-4">Order Summary</h3>

            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-slate-100">
              <span className="text-2xl">{plan.region === 'us' ? '🇺🇸' : '🇬🇧'}</span>
              <div>
                <p className="font-semibold text-slate-900">{plan.name}</p>
                <p className="text-xs text-slate-500">{plan.region === 'us' ? 'Wyoming LLC · United States' : 'Private Limited Company · UK'}</p>
              </div>
            </div>

            {step1Data && (
              <div className="mb-4 pb-4 border-b border-slate-100 space-y-1.5">
                <InfoRow label="Company" value={step1Data.companyName} />
                <InfoRow label="State / Jurisdiction" value={step1Data.companyState} />
                <InfoRow label="Activity" value={step1Data.businessActivity} />
              </div>
            )}

            <div className="space-y-2 mb-4">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Formation fee</span>
                <span>${plan.price}.00</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>State / filing fee</span>
                <span className="text-slate-400">Included</span>
              </div>
            </div>

            <div className="flex justify-between font-bold text-slate-900 text-base border-t border-slate-100 pt-3">
              <span>Total due today</span>
              <span className="text-[#1a56ff]">${plan.price}.00</span>
            </div>
          </div>

          {/* Trust badges */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 space-y-3">
            {[
              { icon: '⚡', text: 'Formation started within 24 hrs of payment' },
              { icon: '🔒', text: 'Secure payment via Stripe' },
              { icon: '💬', text: 'WhatsApp support throughout the process' },
              { icon: '✅', text: 'Money-back if we can\'t form your company' },
            ].map((b) => (
              <div key={b.text} className="flex items-start gap-3 text-sm text-slate-600">
                <span className="text-base flex-shrink-0">{b.icon}</span>
                {b.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ── Helpers ── */
function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-500 text-xs mt-1">{error}</p>}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-sm">
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-900 text-right max-w-[180px]">{value}</span>
    </div>
  )
}

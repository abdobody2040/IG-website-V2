import { useState, useEffect } from 'react'
import { Loader2, Save, Plus, Trash2, DollarSign, CheckCircle, ChevronDown, ChevronUp } from 'lucide-react'
import { pb } from '../../lib/pocketbase'
import { PRICING_DATA } from '../../config/pricing'
import { invalidatePricingCache } from '../../hooks/usePricingConfig'

const DEFAULTS = {
  us_basic: {
    price: PRICING_DATA.us.basic,
    en: ['Wyoming LLC formation', 'Registered Agent first year', 'EIN (US Tax ID from IRS)', 'All formation documents', 'BOI report filing (free)', 'US mailing address', 'Stripe bank account guidance', 'Email support'],
    ar: ['تأسيس Wyoming LLC', 'Registered Agent - أول سنة', 'EIN رقم ضريبي أمريكي', 'جميع مستندات التأسيس', 'BOI report filing مجاني', 'عنوان بريدي أمريكي', 'إرشاد فتح حساب بنكي Stripe', 'دعم عبر البريد الإلكتروني']
  },
  us_premium: {
    price: PRICING_DATA.us.premium,
    en: ['Everything in Basic', 'Priority / fast processing', 'Virtual US phone number', 'Custom Operating Agreement', 'Full Mercury/Relay account setup', 'Stripe activation assistance', 'WhatsApp + phone support', '30-min onboarding call', 'Login credentials handover doc'],
    ar: ['كل ما في الأساسية', 'معالجة أولوية سريعة', 'رقم هاتف أمريكي افتراضي', 'عقد تشغيل مخصص', 'إعداد كامل لحساب Mercury/Relay', 'مساعدة تفعيل Stripe', 'دعم واتساب وهاتف', 'مكالمة تأهيلية 30 دقيقة', 'مستند تسليم بيانات الدخول الكامل']
  },
  uk_basic: {
    price: PRICING_DATA.uk.basic,
    en: ['UK LTD (Companies House)', 'Registered office first year', 'Certificate of Incorporation', 'All company documents', 'Wise business account referral', 'Stripe UK setup guidance', 'Email support'],
    ar: ['تأسيس UK LTD', 'عنوان مكتب مسجل - أول سنة', 'شهادة التأسيس', 'جميع مستندات الشركة', 'إحالة حساب Wise للأعمال', 'إرشاد إعداد Stripe UK', 'دعم عبر البريد الإلكتروني']
  },
  uk_premium: {
    price: PRICING_DATA.uk.premium,
    en: ['Everything in Basic', 'Director service address (privacy)', 'Virtual UK phone number', 'First Confirmation Statement', 'Full Wise account setup', 'Stripe UK activation assistance', 'WhatsApp + phone support', '30-min onboarding call', 'Login credentials handover doc'],
    ar: ['كل ما في الأساسية', 'عنوان خدمة للمدير', 'رقم هاتف بريطاني افتراضي', 'تقديم أول Confirmation Statement', 'إعداد كامل لحساب Wise', 'مساعدة تفعيل Stripe UK', 'دعم واتساب وهاتف', 'مكالمة تأهيلية 30 دقيقة', 'مستند تسليم بيانات الدخول الكامل']
  },
  uae_basic: {
    price: PRICING_DATA.uae.basic,
    en: ['UAE Freezone company formation', 'Business license for 1 year', 'Virtual office address', 'Pre-approval & name reservation', 'Wise business bank guidance', 'Email support'],
    ar: ['تأسيس شركة في المنطقة الحرة للإمارات', 'رخصة تجارية لمدة سنة', 'عنوان مكتب افتراضي', 'الموافقة المسبقة وحجز الاسم', 'إرشاد فتح حساب Wise للأعمال', 'دعم عبر البريد الإلكتروني']
  },
  uae_premium: {
    price: PRICING_DATA.uae.premium,
    en: ['Everything in Basic', 'Mainland or premium Freezone company', 'Investor visa & residency assistance', 'Corporate bank account opening assistance', 'Physical address / desk lease (1 year)', 'PRO services support', 'WhatsApp + phone support', '30-min onboarding call'],
    ar: ['كل ما في الأساسية', 'شركة في البر الرئيسي أو منطقة حرة مميزة', 'المساعدة في تأشيرة المستثمر والإقامة', 'مساعدة في فتح حساب بنكي تجاري', 'عنوان فعلي / عقد إيجار مكتب سنة', 'دعم خدمات العلاقات العامة PRO', 'دعم واتساب وهاتف', 'مكالمة تأهيلية 30 دقيقة']
  },
  oman_basic: {
    price: PRICING_DATA.oman.basic,
    en: ['Oman SPC (Single Person Company)', 'Commercial Register (CR) & tax card', 'Chamber of Commerce registration', 'Registered office address – 1 year', 'Bank account application guidance', 'Email support'],
    ar: ['تأسيس شركة الشخص الواحد في عُمان (SPC)', 'السجل التجاري (CR) والبطاقة الضريبية', 'التسجيل في غرفة التجارة والصناعة', 'عنوان مكتب مسجل لمدة سنة', 'إرشاد تقديم طلب الحساب البنكي', 'دعم عبر البريد الإلكتروني']
  },
  oman_premium: {
    price: PRICING_DATA.oman.premium,
    en: ['Everything in Basic', 'Oman LLC (multiple shareholders)', 'Investor visa & residency assistance', 'Corporate bank account opening assistance', 'Local office address setup', 'Custom corporate bylaws (MoA)', 'WhatsApp + phone support', '30-min onboarding call'],
    ar: ['كل ما في الأساسية', 'تأسيس شركة ذات مسؤولية محدودة (LLC)', 'المساعدة في تأشيرة المستثمر والإقامة', 'مساعدة في فتح حساب بنكي تجاري', 'إعداد عنوان مكتب محلي', 'عقد تأسيس مخصص (MoA)', 'دعم واتساب وهاتف', 'مكالمة تأهيلية 30 دقيقة']
  }
}

type PlanKey = keyof typeof DEFAULTS

const PLAN_LABELS: Record<PlanKey, { flag: string; name: string; badge: string }> = {
  us_basic:   { flag: '🇺🇸', name: 'US LLC — Basic',   badge: 'bg-blue-50 text-blue-700 border-blue-200' },
  us_premium: { flag: '🇺🇸', name: 'US LLC — Premium', badge: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
  uk_basic:   { flag: '🇬🇧', name: 'UK LTD — Basic',   badge: 'bg-sky-50 text-sky-700 border-sky-200' },
  uk_premium: { flag: '🇬🇧', name: 'UK LTD — Premium', badge: 'bg-violet-50 text-violet-700 border-violet-200' },
  uae_basic:  { flag: '🇦🇪', name: 'UAE Freezone — Basic', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  uae_premium:{ flag: '🇦🇪', name: 'UAE Freezone — Premium', badge: 'bg-teal-50 text-teal-700 border-teal-200' },
  oman_basic: { flag: '🇴🇲', name: 'Oman SPC — Basic',   badge: 'bg-amber-50 text-amber-700 border-amber-200' },
  oman_premium:{ flag: '🇴🇲', name: 'Oman SPC — Premium', badge: 'bg-orange-50 text-orange-700 border-orange-200' },
}

interface PlanState {
  id?: string
  price: number
  features_en: string[]
  features_ar: string[]
  saving: boolean
  saved: boolean
  expanded: boolean
}

function makeDefault(key: PlanKey): PlanState {
  const d = DEFAULTS[key]
  return { price: d.price, features_en: [...d.en], features_ar: [...d.ar], saving: false, saved: false, expanded: false }
}

export default function AdminPriceEditorPage() {
  const [plans, setPlans] = useState<Record<PlanKey, PlanState>>({
    us_basic: makeDefault('us_basic'), us_premium: makeDefault('us_premium'),
    uk_basic: makeDefault('uk_basic'), uk_premium: makeDefault('uk_premium'),
    uae_basic: makeDefault('uae_basic'), uae_premium: makeDefault('uae_premium'),
    oman_basic: makeDefault('oman_basic'), oman_premium: makeDefault('oman_premium'),
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    void (async () => {
      try {
        const records = await pb.collection('pricing_config').getFullList<{ id: string; region: string; plan: string; price: number; features_en: string[]; features_ar: string[] }>({ sort: 'region,plan' })
        setPlans(prev => {
          const next = { ...prev }
          for (const r of records) {
            const key = (r.region + '_' + r.plan) as PlanKey
            if (next[key]) {
              next[key] = {
                ...next[key],
                id: r.id,
                price: r.price,
                features_en: Array.isArray(r.features_en) ? r.features_en : next[key].features_en,
                features_ar: Array.isArray(r.features_ar) ? r.features_ar : next[key].features_ar
              }
            }
          }
          return next
        })
      } catch { /* use defaults */ }
      setLoading(false)
    })()
  }, [])

  function updatePlan(key: PlanKey, patch: Partial<PlanState>) {
    setPlans(prev => ({ ...prev, [key]: { ...prev[key], ...patch } }))
  }

  function updateFeature(key: PlanKey, lang: 'en' | 'ar', idx: number, value: string) {
    const fk = lang === 'en' ? 'features_en' : 'features_ar'
    setPlans(prev => {
      const arr = [...prev[key][fk]]
      arr[idx] = value
      return { ...prev, [key]: { ...prev[key], [fk]: arr } }
    })
  }

  function addFeature(key: PlanKey, lang: 'en' | 'ar') {
    const fk = lang === 'en' ? 'features_en' : 'features_ar'
    setPlans(prev => ({ ...prev, [key]: { ...prev[key], [fk]: [...prev[key][fk], ''] } }))
  }

  function removeFeature(key: PlanKey, lang: 'en' | 'ar', idx: number) {
    const fk = lang === 'en' ? 'features_en' : 'features_ar'
    setPlans(prev => ({ ...prev, [key]: { ...prev[key], [fk]: prev[key][fk].filter((_, i) => i !== idx) } }))
  }

  async function savePlan(key: PlanKey) {
    const plan = plans[key]
    const parts = key.split('_') as [string, string]
    updatePlan(key, { saving: true, saved: false })
    const data = {
      region: parts[0],
      plan: parts[1],
      price: plan.price,
      features_en: plan.features_en.filter(f => f.trim()),
      features_ar: plan.features_ar.filter(f => f.trim())
    }
    try {
      let id = plan.id
      if (id) {
        await pb.collection('pricing_config').update(id, data)
      } else {
        const rec = await pb.collection('pricing_config').create<{ id: string }>(data)
        id = rec.id
      }
      invalidatePricingCache()
      updatePlan(key, { saving: false, saved: true, id })
      setTimeout(() => updatePlan(key, { saved: false }), 2500)
    } catch (err) {
      console.error('Save failed', err)
      updatePlan(key, { saving: false })
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="animate-spin text-slate-400" size={32} />
    </div>
  )

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3">
        <DollarSign size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Live Pricing & Package Editor</p>
          <p className="text-xs text-amber-700 mt-0.5">
            Changes save to the database instantly and reflect on the landing page pricing section & order wizard for all 4 countries (US, UK, UAE, Oman).
          </p>
        </div>
      </div>

      {(Object.keys(plans) as PlanKey[]).map(key => {
        const plan = plans[key]
        const label = PLAN_LABELS[key]
        return (
          <div key={key} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div
              className="flex items-center justify-between px-6 py-4 cursor-pointer select-none hover:bg-slate-50 transition-colors"
              onClick={() => updatePlan(key, { expanded: !plan.expanded })}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{label.flag}</span>
                <div>
                  <p className="font-semibold text-slate-900">{label.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{plan.features_en.length} features listed</p>
                </div>
                <span className={`ml-2 text-xs font-semibold px-2.5 py-1 rounded-full border ${label.badge}`}>
                  ${plan.price}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={e => { e.stopPropagation(); void savePlan(key) }}
                  disabled={plan.saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1a56ff] text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  {plan.saving ? <Loader2 size={13} className="animate-spin" /> : plan.saved ? <CheckCircle size={13} /> : <Save size={13} />}
                  {plan.saving ? 'Saving...' : plan.saved ? 'Saved!' : 'Save'}
                </button>
                {plan.expanded ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
              </div>
            </div>

            {plan.expanded && (
              <div className="border-t border-slate-100 px-6 py-5 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Price (USD $)</label>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 text-lg font-bold">$</span>
                    <input
                      type="number"
                      min={0}
                      value={plan.price}
                      onChange={e => updatePlan(key, { price: Number(e.target.value) })}
                      className="w-36 px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {(['en', 'ar'] as const).map(lang => {
                    const fk = lang === 'en' ? 'features_en' : 'features_ar'
                    const items = plan[fk]
                    return (
                      <div key={lang}>
                        <div className="flex items-center justify-between mb-2">
                          <label className="text-sm font-semibold text-slate-700">
                            {lang === 'en' ? 'Features (English)' : 'Features (Arabic)'}
                          </label>
                          <button
                            onClick={() => addFeature(key, lang)}
                            className="text-xs text-blue-600 hover:text-blue-800 flex items-center gap-1 font-medium"
                          >
                            <Plus size={12} /> Add Feature
                          </button>
                        </div>
                        <div className="space-y-2">
                          {items.map((f, i) => (
                            <div key={i} className="flex gap-2 items-center">
                              <input
                                dir={lang === 'ar' ? 'rtl' : 'ltr'}
                                value={f}
                                onChange={e => updateFeature(key, lang, i, e.target.value)}
                                className={`flex-1 px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                                  lang === 'ar' ? 'text-right' : ''
                                }`}
                                placeholder={lang === 'ar' ? 'الميزة...' : 'Feature...'}
                              />
                              <button
                                onClick={() => removeFeature(key, lang, i)}
                                className="text-red-400 hover:text-red-600 p-1"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
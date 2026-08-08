import { useEffect, useState } from 'react'
import { pb } from '../lib/pocketbase'

export interface ServiceRecord {
  id: string
  title_en: string
  title_ar: string
  description_en: string
  description_ar: string
  price: number
  period_en: string
  period_ar: string
  detail_en?: string
  detail_ar?: string
  badge_en?: string
  badge_ar?: string
  requires_company: boolean
  icon: string
  active: boolean
  sort_order?: number
  type: 'addon' | 'landing'
  color?: string
  bg_color?: string
  href?: string
  category?: string
}

export const FALLBACK_SERVICES: ServiceRecord[] = [
  {
    id: 'formationlandin',
    title_en: 'Company Formation',
    title_ar: 'تأسيس الشركات',
    description_en: 'Form your US LLC, UK LTD & more in 50+ countries.',
    description_ar: 'أسس شركتك الأمريكية أو البريطانية وأكثر.',
    price: 149,
    period_en: 'one-time',
    period_ar: 'مرة واحدة',
    requires_company: false,
    icon: 'Building2',
    active: true,
    sort_order: 10,
    type: 'landing',
    color: '#2563EB',
    bg_color: '#EFF6FF',
    href: '/order',
    category: 'Business Formation',
  },
  {
    id: 'bankinglanding1',
    title_en: 'Business Banking',
    title_ar: 'الحساب البنكي التجاري',
    description_en: 'Open US business bank accounts remotely.',
    description_ar: 'افتح حساباً بنكياً أمريكياً عن بُعد.',
    price: 0,
    period_en: 'included',
    period_ar: 'مشمول',
    requires_company: false,
    icon: 'Landmark',
    active: true,
    sort_order: 20,
    type: 'landing',
    color: '#7C3AED',
    bg_color: '#F5F3FF',
    href: '/#pricing',
    category: 'Banking & Payments',
  },
  {
    id: 'paymentlanding1',
    title_en: 'Payment Solutions',
    title_ar: 'حلول الدفع',
    description_en: 'Stripe, PayPal & merchant account setup.',
    description_ar: 'إعداد Stripe وPayPal والحسابات التجارية.',
    price: 0,
    period_en: 'included',
    period_ar: 'مشمول',
    requires_company: false,
    icon: 'CreditCard',
    active: true,
    sort_order: 30,
    type: 'landing',
    color: '#059669',
    bg_color: '#ECFDF5',
    href: '/#pricing',
    category: 'Banking & Payments',
  },
  {
    id: 'complianceland1',
    title_en: 'Compliance & EIN',
    title_ar: 'الامتثال والرقم الضريبي',
    description_en: 'EIN, tax compliance, and annual reports.',
    description_ar: 'رقم EIN والامتثال الضريبي والتقارير السنوية.',
    price: 0,
    period_en: 'included',
    period_ar: 'مشمول',
    requires_company: false,
    icon: 'Shield',
    active: true,
    sort_order: 40,
    type: 'landing',
    color: '#D97706',
    bg_color: '#FFFBEB',
    href: '/#pricing',
    category: 'Government & Compliance',
  },
  {
    id: 'supportlanding1',
    title_en: 'Ongoing Support',
    title_ar: 'الدعم المستمر',
    description_en: 'Dedicated support to keep your business growing.',
    description_ar: 'دعم متخصص لمتابعة نمو أعمالك.',
    price: 0,
    period_en: 'free',
    period_ar: 'مجاني',
    requires_company: false,
    icon: 'Headphones',
    active: true,
    sort_order: 50,
    type: 'landing',
    color: '#0284C7',
    bg_color: '#F0F9FF',
    href: '/#contact',
    category: 'Government & Compliance',
  },
  {
    id: 'usllc149onetime',
    title_en: 'US LLC Formation',
    title_ar: 'تأسيس شركة ذات مسؤولية محدودة أمريكية (LLC)',
    description_en: 'Incorporate your business in Wyoming, Delaware, or Florida.',
    description_ar: 'تأسيس شركتك في ولايات وايومنغ، ديلاوير، أو فلوريدا.',
    price: 149,
    period_en: 'one-time',
    period_ar: 'مرة واحدة',
    requires_company: false,
    icon: 'Building2',
    active: true,
    sort_order: 1,
    type: 'addon',
    category: 'Business Formation',
  },
  {
    id: 'ukltd149onetime',
    title_en: 'UK LTD Formation',
    title_ar: 'تأسيس شركة مساهمة بريطانية (LTD)',
    description_en: 'Register your company in the UK with Companies House.',
    description_ar: 'سجل شركتك في المملكة المتحدة لدى مسجل الشركات الرسمي.',
    price: 149,
    period_en: 'one-time',
    period_ar: 'مرة واحدة',
    requires_company: false,
    icon: 'Building',
    active: true,
    sort_order: 2,
    type: 'addon',
    category: 'Business Formation',
  },
  {
    id: 'einapplication7',
    title_en: 'EIN Application',
    title_ar: 'التقديم على الرقم الضريبي EIN',
    description_en: 'Get your Employer Identification Number from the IRS.',
    description_ar: 'احصل على الرقم الضريبي لشركتك من مصلحة الضرائب الأمريكية.',
    price: 79,
    period_en: 'one-time',
    period_ar: 'مرة واحدة',
    requires_company: true,
    icon: 'Hash',
    active: true,
    sort_order: 10,
    type: 'addon',
    category: 'Government & Compliance',
  },
]

let _cache: ServiceRecord[] | null = null
let _fetchPromise: Promise<void> | null = null

async function loadServices(): Promise<void> {
  if (_cache !== null && _cache.length > 0) return
  if (_fetchPromise) { await _fetchPromise; return }
  _fetchPromise = (async () => {
    try {
      const records = await pb.collection('services').getFullList<ServiceRecord>({
        sort: 'sort_order,title_en'
      })
      if (records && records.length > 0) {
        _cache = records
      } else {
        _cache = FALLBACK_SERVICES
      }
    } catch (err) {
      console.error('Error fetching services:', err)
      _cache = FALLBACK_SERVICES
    } finally {
      _fetchPromise = null
    }
  })()
  await _fetchPromise
}

export function invalidateServicesCache(): void {
  _cache = null
  _fetchPromise = null
}

export function useServices(): { services: ServiceRecord[]; loading: boolean; refresh: () => Promise<void> } {
  const [services, setServices] = useState<ServiceRecord[]>(_cache ?? FALLBACK_SERVICES)
  const [loading, setLoading] = useState(_cache === null)

  const fetchAndSet = async () => {
    setLoading(true)
    await loadServices()
    setServices(_cache ?? FALLBACK_SERVICES)
    setLoading(false)
  }

  const refresh = async () => {
    invalidateServicesCache()
    await fetchAndSet()
  }

  useEffect(() => {
    if (_cache !== null && _cache.length > 0) {
      setServices(_cache)
      setLoading(false)
      return
    }
    void fetchAndSet()
  }, [])

  return { services, loading, refresh }
}

import type { ReactNode } from 'react'
import { Building2, User, Package, Plus, CreditCard, Globe, ShieldCheck, Zap } from 'lucide-react'
import { PRICING_DATA } from '../../config/pricing'

export interface Plan {
  id: string
  region: 'us' | 'uk'
  name: string
  price: number
  currency: string
  label: string
  description: string
  features: string[]
  flag: string
}

export const PLANS: Plan[] = [
  {
    id: 'us-basic',
    region: 'us',
    name: 'US LLC Basic',
    price: PRICING_DATA.us.basic,
    currency: 'USD',
    label: 'Basic',
    description: 'Everything you need to launch your US LLC',
    flag: '🇺🇸',
    features: ['Wyoming LLC formation', 'Registered Agent – first year', 'EIN (US Tax ID)', 'All formation documents', 'BOI report filing', 'Stripe bank account guidance'],
  },
  {
    id: 'us-premium',
    region: 'us',
    name: 'US LLC Premium',
    price: PRICING_DATA.us.premium,
    currency: 'USD',
    label: 'Premium',
    description: 'The complete package with full support',
    flag: '🇺🇸',
    features: ['Everything in Basic', 'Priority processing', 'Virtual US phone number', 'Custom Operating Agreement', 'Mercury/Relay account setup', 'WhatsApp + phone support', '30-min onboarding call'],
  },
  {
    id: 'uk-basic',
    region: 'uk',
    name: 'UK LTD Basic',
    price: PRICING_DATA.uk.basic,
    currency: 'USD',
    label: 'Basic',
    description: 'Everything you need to launch your UK company',
    flag: '🇬🇧',
    features: ['UK LTD (Companies House)', 'Registered office – first year', 'Certificate of Incorporation', 'All company documents', 'Wise business account referral', 'Stripe UK setup guidance'],
  },
  {
    id: 'uk-premium',
    region: 'uk',
    name: 'UK LTD Premium',
    price: PRICING_DATA.uk.premium,
    currency: 'USD',
    label: 'Premium',
    description: 'The complete package with full support',
    flag: '🇬🇧',
    features: ["Everything in Basic", "Director's service address", 'Virtual UK phone number', 'First Confirmation Statement', 'Full Wise account setup', 'WhatsApp + phone support', '30-min onboarding call'],
  },
]

export const POPULAR_STATES = [
  { name: 'New Mexico', fee: 0, note: 'No state taxes, great for privacy' },
  { name: 'Wyoming', fee: 50, note: 'No state taxes, strong asset protection' },
  { name: 'Delaware', fee: 100, note: 'Best for corporations, business-friendly courts' },
]

export const ALL_US_STATES = [
  'Alabama','Alaska','Arizona','Arkansas','California','Colorado','Connecticut',
  'Florida','Georgia','Hawaii','Idaho','Illinois','Indiana','Iowa','Kansas','Kentucky',
  'Louisiana','Maine','Maryland','Massachusetts','Michigan','Minnesota','Mississippi',
  'Missouri','Montana','Nebraska','Nevada','New Hampshire','New Jersey',
  'New York','North Carolina','North Dakota','Ohio','Oklahoma','Oregon','Pennsylvania',
  'Rhode Island','South Carolina','South Dakota','Tennessee','Texas','Utah','Vermont',
  'Virginia','Washington','West Virginia','Wisconsin',
].filter(s => !POPULAR_STATES.map(p => p.name).includes(s))

export interface AddOn {
  id: string
  name: string
  description: string
  price: number
  icon: ReactNode
}

export const ADD_ONS: AddOn[] = [
  { id: 'website', name: 'Professional Website Design', description: 'Custom business website to establish your online presence', price: 99, icon: <Globe size={16} /> },
  { id: 'logo', name: 'Custom Logo Design', description: 'Professional logo design for your brand', price: 49, icon: <ShieldCheck size={16} /> },
  { id: 'express', name: 'Express Filing', description: 'Rush processing (2–3 business days)', price: 50, icon: <Zap size={16} /> },
]

export type MemberRole = 'managing_member' | 'member' | 'manager'

export interface Member {
  id: string
  fullName: string
  role: MemberRole
  ownership: number
  address: string
  email: string
  phone: string
}

export interface Step1Data { planId: string }
export interface Step2Data { companyName: string; companyState: string; companyType: string; businessPurpose: string }
export interface Step3Data { fullName: string; email: string; phone?: string; whatsapp?: string }

export type WizardData = Step1Data & Step2Data & Step3Data

export const STEPS = [
  { label: 'Company Info', icon: Building2 },
  { label: 'Owner Info', icon: User },
  { label: 'Service Package', icon: Package },
  { label: 'Add-ons', icon: Plus },
  { label: 'Account', icon: User },
  { label: 'Review & Pay', icon: CreditCard },
]

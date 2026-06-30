import { Calendar, RefreshCw, Hash, FileEdit, Award } from 'lucide-react'

export interface Service {
  id: string
  icon: React.ElementType
  title: string
  price: number
  period: string
  description: string
  badge: string | null
  detail: string
  requiresCompany: boolean
}

export const ADDON_SERVICES: Service[] = [
  {
    id: 'annual-report',
    icon: Calendar,
    title: 'Annual Report Filing',
    price: 149,
    period: 'per filing',
    description: 'Stay compliant and avoid penalties. We handle your annual state report filing on time, every time.',
    badge: 'Most Popular',
    detail: 'We prepare and file your LLC annual report with the state to keep your business in good standing and avoid late fees.',
    requiresCompany: true,
  },
  {
    id: 'registered-agent-renewal',
    icon: RefreshCw,
    title: 'Registered Agent Renewal',
    price: 99,
    period: 'per year',
    description: 'Keep your registered agent service active to ensure you never miss important legal notices.',
    badge: null,
    detail: 'Renews your registered agent subscription for another 12 months. We receive and forward all state and legal correspondence.',
    requiresCompany: false,
  },
  {
    id: 'ein-amendment',
    icon: Hash,
    title: 'EIN Amendment',
    price: 79,
    period: 'one-time',
    description: 'Need to update your EIN information? We file the amendment with the IRS quickly and accurately.',
    badge: null,
    detail: 'We file IRS Form SS-4 amendments to update the responsible party, address, or other EIN-related changes on your behalf.',
    requiresCompany: true,
  },
  {
    id: 'operating-agreement',
    icon: FileEdit,
    title: 'Operating Agreement Update',
    price: 49,
    period: 'per update',
    description: "Update your LLC's operating agreement to reflect ownership changes, new members, or policy updates.",
    badge: null,
    detail: 'Our legal team drafts a revised operating agreement reflecting your changes, signed and ready to use.',
    requiresCompany: false,
  },
  {
    id: 'good-standing',
    icon: Award,
    title: 'Certificate of Good Standing',
    price: 79,
    period: 'per request',
    description: 'Obtain an official Certificate of Good Standing from the state to prove your LLC is active and compliant.',
    badge: null,
    detail: 'We request an official certificate from the state on your behalf, typically delivered in 3–5 business days.',
    requiresCompany: true,
  },
]

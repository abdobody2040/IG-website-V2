export interface Order {
  id: string
  userId: string
  orderNumber: string
  packageName: string
  companyName: string
  companyState: string
  companyType: string  // 'LLC' | 'LTD'
  status: string  // 'pending' | 'in_review' | 'processing' | 'documents_filed' | 'ein_processing' | 'completed' | 'cancelled' | 'in_progress'
  amount: number
  currency: string
  notes: string
  customerName: string | null
  customerEmail: string | null
  customerPhone: string | null
  customerCountry: string | null
  customerAddress: string | null
  businessActivity: string | null
  stripeSessionId: string | null
  createdAt: string
  updatedAt: string
}

export interface Company {
  id: string
  userId: string
  orderId: string
  companyName: string
  companyType: string
  state: string
  einNumber: string
  formationDate: string
  registeredAgent: string
  renewalDueDate: string | null
  annualReportDueDate: string | null
  taxFilingDueDate: string | null
  registeredAgentRenewalDate: string | null
  complianceStatus: string
  complianceNotes: string | null
  status: string
  createdAt: string
  updatedAt: string
}

export interface Document {
  id: string
  userId: string
  orderId: string
  companyId: string
  name: string
  docType: string  // 'articles_of_org' | 'operating_agreement' | 'ein_letter' | 'banking_resolution' | 'other'
  fileUrl: string
  fileName: string
  status: string  // 'pending' | 'ready' | 'uploaded' | 'approved' | 'rejected'
  notes: string
  createdAt: string
  updatedAt: string
}

export interface OrderUpdate {
  id: string
  orderId: string
  status: string
  message: string
  createdBy: string
  createdAt: string
}

export interface Payment {
  id: string
  userId: string
  orderId: string
  service: string
  invoiceId: string
  amount: number
  currency: string
  status: string  // 'pending' | 'paid' | 'failed' | 'refunded'
  stripePaymentId: string
  notes: string
  createdAt: string
  updatedAt: string
}

export interface Invitation {
  id: string
  email: string
  companyName: string | null
  role: string
  token: string
  invitedBy: string | null
  status: 'pending' | 'accepted' | 'expired'
  expiresAt: string
  createdAt: string
  updatedAt: string
}

export interface Blog {
  id: string
  title: string
  slug: string
  excerpt: string | null
  content: string
  coverImage: string | null
  author: string
  tags: string[]
  published: boolean
  featured: boolean
  createdBy: string | null
  createdAt: string
  updatedAt: string
  language: string
  titleAr: string | null
  slugAr: string | null
  excerptAr: string | null
  contentAr: string | null
}

export interface SeoPage {
  id: string
  slug: string
  countryName: string
  countryCode: string
  metaTitle: string
  metaDescription: string
  heroTitle: string
  heroDescription: string
  mainKeyword: string
  secondaryKeywords: string[]
  painPoints: string[]
  benefits: Record<string, unknown>[]
  bestBank: string | null
  bankNotes: string | null
  taxNotes: string | null
  faqJson: Record<string, unknown>[]
  ctaText: string
  featuredImage: string | null
  schemaJson: Record<string, unknown>
  published: boolean
  createdBy: string | null
  createdAt: string
  updatedAt: string
}

export interface SeoPageFormData {
  slug: string
  countryName: string
  countryCode: string
  metaTitle: string
  metaDescription: string
  heroTitle: string
  heroDescription: string
  mainKeyword: string
  secondaryKeywords: string
  painPoints: string
  benefits: string
  bestBank: string
  bankNotes: string
  taxNotes: string
  faqJson: string
  ctaText: string
  featuredImage: string
  schemaJson: string
  published: boolean
}

export interface BlogFormData {
  title: string
  slug: string
  excerpt: string
  content: string
  coverImage: string
  author: string
  tags: string
  published: boolean
  featured: boolean
  language: string
  titleAr: string
  slugAr: string
  excerptAr: string
  contentAr: string
}

export interface User {
  id: string
  email: string
  emailVerified: boolean
  displayName: string
  avatarUrl: string
  phone: string
  phoneVerified: boolean
  role: string
  country: string
  address: string
  metadata: string
  createdAt: string
  updatedAt: string
  lastSignIn: string
}

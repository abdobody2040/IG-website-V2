export type IntegrationCategory = 'analytics' | 'advertising' | 'webmaster' | 'consent'

export type ProviderId =
  | 'ga4'
  | 'gtm'
  | 'clarity'
  | 'hotjar'
  | 'plausible'
  | 'matomo'
  | 'mixpanel'
  | 'posthog'
  | 'meta'
  | 'google_ads'
  | 'tiktok'
  | 'linkedin'
  | 'snapchat'
  | 'pinterest'
  | 'twitter'
  | 'reddit'
  | 'gsc'
  | 'bing'

export interface ProviderField {
  key: string
  label: string
  placeholder: string
  type: 'text' | 'password' | 'textarea'
  required?: boolean
  helpText?: string
}

export interface ProviderConfig {
  id: ProviderId
  name: string
  category: IntegrationCategory
  icon: string
  description: string
  fields: ProviderField[]
  docsUrl?: string
}

export interface TrackingIntegration {
  id: string
  provider: ProviderId
  name: string
  category: IntegrationCategory
  status: 'connected' | 'disconnected' | 'error'
  enabled: boolean
  config: Record<string, string>
  lastSync?: string
  verificationStatus?: 'verified' | 'pending' | 'unverified'
  created?: string
  updated?: string
}

export interface CustomEventRule {
  id: string
  name: string
  category: 'Purchase' | 'Lead' | 'Form' | 'Contact' | 'BookCall' | 'Checkout' | 'WhatsApp' | 'Phone' | 'Custom'
  trigger: 'pageview' | 'click' | 'form_submit' | 'scroll' | 'custom'
  selector?: string
  platform: ProviderId | 'all'
  destinationUrl?: string
  enabled: boolean
  value?: number
  currency?: string
}

export interface CookieConsentConfig {
  enabled: boolean
  bannerTitle: string
  bannerMessage: string
  acceptAllText: string
  rejectAllText: string
  preferencesText: string
  gdprEnabled: boolean
  ccpaEnabled: boolean
  consentModeV2: boolean
  defaultAnalytics: boolean
  defaultMarketing: boolean
}

export interface TrackingDomain {
  id: string
  domain: string
  isPrimary: boolean
  trackingId: string
  status: 'active' | 'pending'
}

export interface PixelDiagnostic {
  id: string
  severity: 'error' | 'warning' | 'info'
  title: string
  description: string
  recommendation: string
  affectedProvider?: ProviderId
}

export interface AnalyticsSummary {
  visitors: number
  sessions: number
  users: number
  bounceRate: number
  avgSessionDuration: number
  conversions: number
  revenue: number
  realtimeVisitors: number
  topPages: { path: string; views: number; percentage: number }[]
  topSources: { source: string; visits: number; percentage: number }[]
  devices: { device: string; count: number; percentage: number }[]
  countries: { country: string; flag: string; count: number }[]
  trafficOverTime: { date: string; visitors: number; pageviews: number; conversions: number }[]
}

export interface UtmCampaign {
  id?: string
  baseUrl: string
  source: string
  medium: string
  campaign: string
  term?: string
  content?: string
  generatedUrl?: string
  shortUrl?: string
}

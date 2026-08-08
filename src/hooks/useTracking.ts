import { useState, useEffect } from 'react'
import { pb } from '../lib/pocketbase'
import {
  TrackingIntegration,
  CustomEventRule,
  CookieConsentConfig,
  TrackingDomain,
  AnalyticsSummary,
  PixelDiagnostic,
  ProviderId
} from '../types/tracking'
import { DEFAULT_CONSENT, initGoogleConsentModeV2 } from '../lib/tracking/consentManager'
import { injectIntegrationScripts } from '../lib/tracking/scriptInjector'

const INITIAL_INTEGRATIONS: TrackingIntegration[] = [
  {
    id: 'tr_ga4',
    provider: 'ga4',
    name: 'Google Analytics 4',
    category: 'analytics',
    status: 'connected',
    enabled: true,
    config: { measurement_id: 'G-7484210956' },
    lastSync: '2 minutes ago',
    verificationStatus: 'verified'
  },
  {
    id: 'tr_gtm',
    provider: 'gtm',
    name: 'Google Tag Manager',
    category: 'analytics',
    status: 'connected',
    enabled: true,
    config: { container_id: 'GTM-IG2026X' },
    lastSync: '10 minutes ago',
    verificationStatus: 'verified'
  },
  {
    id: 'tr_clarity',
    provider: 'clarity',
    name: 'Microsoft Clarity',
    category: 'analytics',
    status: 'connected',
    enabled: true,
    config: { project_id: 'ig_clarity_99' },
    lastSync: '1 hour ago',
    verificationStatus: 'verified'
  },
  {
    id: 'tr_meta',
    provider: 'meta',
    name: 'Meta (Facebook) Pixel & CAPI',
    category: 'advertising',
    status: 'connected',
    enabled: true,
    config: { pixel_id: '987654321012345', access_token: 'EAA...' },
    lastSync: '5 minutes ago',
    verificationStatus: 'verified'
  },
  {
    id: 'tr_gads',
    provider: 'google_ads',
    name: 'Google Ads',
    category: 'advertising',
    status: 'connected',
    enabled: true,
    config: { conversion_id: 'AW-987654321', conversion_label: 'Purchase' },
    lastSync: '15 minutes ago',
    verificationStatus: 'verified'
  },
  {
    id: 'tr_tiktok',
    provider: 'tiktok',
    name: 'TikTok Pixel',
    category: 'advertising',
    status: 'disconnected',
    enabled: false,
    config: { pixel_id: '' },
    verificationStatus: 'unverified'
  },
  {
    id: 'tr_linkedin',
    provider: 'linkedin',
    name: 'LinkedIn Insight Tag',
    category: 'advertising',
    status: 'disconnected',
    enabled: false,
    config: { partner_id: '' },
    verificationStatus: 'unverified'
  },
  {
    id: 'tr_gsc',
    provider: 'gsc',
    name: 'Google Search Console',
    category: 'webmaster',
    status: 'connected',
    enabled: true,
    config: { verification_meta: 'google-site-verification=ig-prod-2026' },
    lastSync: 'Just now',
    verificationStatus: 'verified'
  }
]

const INITIAL_CUSTOM_EVENTS: CustomEventRule[] = [
  { id: 'ev_1', name: 'Company Formation Order', category: 'Purchase', trigger: 'form_submit', platform: 'all', enabled: true, value: 149, currency: 'USD' },
  { id: 'ev_2', name: 'WhatsApp Click', category: 'WhatsApp', trigger: 'click', selector: 'a[href*="wa.me"]', platform: 'meta', enabled: true },
  { id: 'ev_3', name: 'Book Strategy Call', category: 'BookCall', trigger: 'click', selector: 'a[href*="cal.com"]', platform: 'ga4', enabled: true },
  { id: 'ev_4', name: 'Contact Form Submission', category: 'Lead', trigger: 'form_submit', platform: 'all', enabled: true }
]

const INITIAL_DOMAINS: TrackingDomain[] = [
  { id: 'dom_1', domain: 'instantgrow.net', isPrimary: true, trackingId: 'IG-PROD-MAIN', status: 'active' },
  { id: 'dom_2', domain: 'app.instantgrow.net', isPrimary: false, trackingId: 'IG-PROD-SUB', status: 'active' }
]

const MOCK_ANALYTICS: AnalyticsSummary = {
  visitors: 42890,
  sessions: 58120,
  users: 34100,
  bounceRate: 34.2,
  avgSessionDuration: 214,
  conversions: 1840,
  revenue: 124500,
  realtimeVisitors: 38,
  topPages: [
    { path: '/', views: 24500, percentage: 42.1 },
    { path: '/services/business-formation/usllc149onetime', views: 9800, percentage: 16.8 },
    { path: '/services', views: 7400, percentage: 12.7 },
    { path: '/order', views: 5200, percentage: 8.9 },
    { path: '/blog/how-to-start-us-llc-non-resident', views: 4100, percentage: 7.0 }
  ],
  topSources: [
    { source: 'Google Organic (SEO)', visits: 22100, percentage: 38.0 },
    { source: 'Direct Traffic', visits: 14500, percentage: 24.9 },
    { source: 'Meta Ads (FB/IG)', visits: 11200, percentage: 19.3 },
    { source: 'Google Search Ads', visits: 6800, percentage: 11.7 },
    { source: 'WhatsApp / Referral', visits: 3520, percentage: 6.1 }
  ],
  devices: [
    { device: 'Mobile', count: 34870, percentage: 60.0 },
    { device: 'Desktop', count: 20340, percentage: 35.0 },
    { device: 'Tablet', count: 2910, percentage: 5.0 }
  ],
  countries: [
    { country: 'Saudi Arabia', flag: '🇸🇦', count: 18400 },
    { country: 'United Arab Emirates', flag: '🇦🇪', count: 12200 },
    { country: 'Egypt', flag: '🇪🇬', count: 8900 },
    { country: 'United States', flag: '🇺🇸', count: 6400 },
    { country: 'United Kingdom', flag: '🇬🇧', count: 4200 }
  ],
  trafficOverTime: [
    { date: 'Jul 28', visitors: 1120, pageviews: 1850, conversions: 42 },
    { date: 'Jul 29', visitors: 1240, pageviews: 2040, conversions: 51 },
    { date: 'Jul 30', visitors: 1390, pageviews: 2210, conversions: 64 },
    { date: 'Jul 31', visitors: 1180, pageviews: 1920, conversions: 48 },
    { date: 'Aug 01', visitors: 1450, pageviews: 2400, conversions: 72 },
    { date: 'Aug 02', visitors: 1580, pageviews: 2650, conversions: 83 },
    { date: 'Aug 03', visitors: 1720, pageviews: 2890, conversions: 95 }
  ]
}

export function useTracking() {
  const [integrations, setIntegrations] = useState<TrackingIntegration[]>(INITIAL_INTEGRATIONS)
  const [customEvents, setCustomEvents] = useState<CustomEventRule[]>(INITIAL_CUSTOM_EVENTS)
  const [consentConfig, setConsentConfig] = useState<CookieConsentConfig>(DEFAULT_CONSENT)
  const [domains, setDomains] = useState<TrackingDomain[]>(INITIAL_DOMAINS)
  const [analytics] = useState<AnalyticsSummary>(MOCK_ANALYTICS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    initGoogleConsentModeV2()

    const loadFromDb = async () => {
      try {
        const records = await pb.collection('tracking_integrations').getFullList<TrackingIntegration>()
        if (records && records.length > 0) {
          setIntegrations(records)
        }
      } catch {
        // Fallback to initial mock state if DB table empty
      } finally {
        setLoading(false)
      }
    }

    void loadFromDb()
  }, [])

  useEffect(() => {
    if (!loading && integrations.length > 0) {
      injectIntegrationScripts(integrations)
    }
  }, [loading, integrations])

  const saveIntegration = async (updated: Partial<TrackingIntegration> & { provider: ProviderId }) => {
    try {
      const existing = integrations.find(i => i.provider === updated.provider)
      let savedRecord: TrackingIntegration

      const payload = {
        provider: updated.provider,
        name: updated.name || existing?.name || updated.provider,
        category: updated.category || existing?.category || 'analytics',
        status: (updated.enabled ? 'connected' : 'disconnected') as 'connected' | 'disconnected',
        enabled: updated.enabled ?? true,
        config: updated.config || existing?.config || {},
        lastSync: 'Just now',
        verificationStatus: 'verified' as const
      }

      if (existing && existing.id) {
        try {
          savedRecord = await pb.collection('tracking_integrations').update<TrackingIntegration>(existing.id, payload)
        } catch {
          savedRecord = { ...existing, ...payload } as TrackingIntegration
        }
      } else {
        try {
          savedRecord = await pb.collection('tracking_integrations').create<TrackingIntegration>(payload)
        } catch {
          savedRecord = { id: `tr_${Date.now()}`, ...payload } as TrackingIntegration
        }
      }

      setIntegrations(prev => {
        const idx = prev.findIndex(i => i.provider === updated.provider)
        if (idx >= 0) {
          const next = [...prev]
          next[idx] = savedRecord
          return next
        }
        return [...prev, savedRecord]
      })

      return savedRecord
    } catch (e) {
      console.error('Error saving tracking integration:', e)
      throw e
    }
  }

  const deleteIntegration = async (providerId: ProviderId) => {
    const existing = integrations.find(i => i.provider === providerId)
    if (existing && existing.id) {
      try {
        await pb.collection('tracking_integrations').delete(existing.id)
      } catch {
        // Safe fallback
      }
    }
    setIntegrations(prev => prev.filter(i => i.provider !== providerId))
  }

  const toggleIntegrationStatus = async (providerId: ProviderId) => {
    const item = integrations.find(i => i.provider === providerId)
    if (!item) return
    const nextEnabled = !item.enabled
    await saveIntegration({
      provider: providerId,
      enabled: nextEnabled,
      status: nextEnabled ? 'connected' : 'disconnected'
    })
  }

  const addCustomEvent = (rule: Omit<CustomEventRule, 'id'>) => {
    const newRule: CustomEventRule = {
      ...rule,
      id: `ev_${Date.now()}`
    }
    setCustomEvents(prev => [...prev, newRule])
  }

  const toggleCustomEvent = (id: string) => {
    setCustomEvents(prev => prev.map(e => e.id === id ? { ...e, enabled: !e.enabled } : e))
  }

  const deleteCustomEvent = (id: string) => {
    setCustomEvents(prev => prev.filter(e => e.id !== id))
  }

  // Calculate Diagnostic Scanner Recommendations
  const diagnostics: PixelDiagnostic[] = []
  const hasGA4 = integrations.some(i => i.provider === 'ga4' && i.enabled)
  const hasMeta = integrations.some(i => i.provider === 'meta' && i.enabled)
  const hasGTM = integrations.some(i => i.provider === 'gtm' && i.enabled)
  const hasClarity = integrations.some(i => i.provider === 'clarity' && i.enabled)

  if (!hasGA4 && !hasGTM) {
    diagnostics.push({
      id: 'diag_1',
      severity: 'error',
      title: 'Missing Core Analytics (GA4 / GTM)',
      description: 'Neither Google Analytics 4 nor Google Tag Manager is connected.',
      recommendation: 'Connect GA4 or GTM in the Integrations tab to start tracking website traffic.',
      affectedProvider: 'ga4'
    })
  }

  if (!hasMeta) {
    diagnostics.push({
      id: 'diag_2',
      severity: 'warning',
      title: 'Meta Pixel & CAPI Disconnected',
      description: 'Meta advertising pixel is not configured. Facebook & Instagram ad attribution is offline.',
      recommendation: 'Add your Meta Pixel ID and Conversions API token for full attribution.',
      affectedProvider: 'meta'
    })
  }

  if (!hasClarity) {
    diagnostics.push({
      id: 'diag_3',
      severity: 'info',
      title: 'Session Recording & Heatmaps Inactive',
      description: 'Microsoft Clarity is not connected.',
      recommendation: 'Enable Microsoft Clarity to watch free session recordings and click heatmaps.',
      affectedProvider: 'clarity'
    })
  }

  if (consentConfig.consentModeV2) {
    diagnostics.push({
      id: 'diag_4',
      severity: 'info',
      title: 'Google Consent Mode V2 Active',
      description: 'Consent Mode V2 signals (ad_user_data, ad_personalization) are configured.',
      recommendation: 'Ensure your cookie banner options align with target regional regulations (GDPR/CCPA).'
    })
  }

  return {
    integrations,
    customEvents,
    consentConfig,
    domains,
    analytics,
    diagnostics,
    loading,
    saveIntegration,
    deleteIntegration,
    toggleIntegrationStatus,
    setConsentConfig,
    addCustomEvent,
    toggleCustomEvent,
    deleteCustomEvent,
    setDomains
  }
}

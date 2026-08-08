import { CookieConsentConfig } from '../../types/tracking'

const CONSENT_STORAGE_KEY = 'ig_cookie_consent_v2'

export const DEFAULT_CONSENT: CookieConsentConfig = {
  enabled: true,
  bannerTitle: 'Cookie & Privacy Preferences',
  bannerMessage: 'We use cookies and analytical tags to enhance your experience, analyze site traffic, and assist in our marketing efforts in compliance with GDPR and CCPA.',
  acceptAllText: 'Accept All',
  rejectAllText: 'Reject Non-Essential',
  preferencesText: 'Customize Preferences',
  gdprEnabled: true,
  ccpaEnabled: true,
  consentModeV2: true,
  defaultAnalytics: true,
  defaultMarketing: true
}

export function getSavedConsent(): { granted: boolean; preferences: { analytics: boolean; marketing: boolean } } | null {
  try {
    const raw = localStorage.getItem(CONSENT_STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch (e) {
    console.warn('Error reading cookie consent from storage', e)
  }
  return null
}

export function saveConsent(granted: boolean, analytics: boolean, marketing: boolean): void {
  try {
    const payload = {
      granted,
      timestamp: new Date().toISOString(),
      preferences: { analytics, marketing }
    }
    localStorage.setItem(CONSENT_STORAGE_KEY, JSON.stringify(payload))
    updateGoogleConsentModeV2(analytics, marketing)
  } catch (e) {
    console.warn('Error saving cookie consent', e)
  }
}

export function updateGoogleConsentModeV2(analyticsGranted: boolean, marketingGranted: boolean): void {
  if (typeof window === 'undefined') return
  const w = window as any
  w.dataLayer = w.dataLayer || []
  function gtag(...args: any[]) {
    w.dataLayer.push(args)
  }

  const consentState = {
    analytics_storage: analyticsGranted ? 'granted' : 'denied',
    ad_storage: marketingGranted ? 'granted' : 'denied',
    ad_user_data: marketingGranted ? 'granted' : 'denied',
    ad_personalization: marketingGranted ? 'granted' : 'denied',
  }

  gtag('consent', 'update', consentState)
}

export function initGoogleConsentModeV2(): void {
  if (typeof window === 'undefined') return
  const w = window as any
  w.dataLayer = w.dataLayer || []
  function gtag(...args: any[]) {
    w.dataLayer.push(args)
  }

  const saved = getSavedConsent()
  const analyticsGranted = saved ? saved.preferences.analytics : true
  const marketingGranted = saved ? saved.preferences.marketing : true

  gtag('consent', 'default', {
    analytics_storage: analyticsGranted ? 'granted' : 'denied',
    ad_storage: marketingGranted ? 'granted' : 'denied',
    ad_user_data: marketingGranted ? 'granted' : 'denied',
    ad_personalization: marketingGranted ? 'granted' : 'denied',
    wait_for_update: 500
  })
}

export interface TrackEventPayload {
  eventName: string
  category?: string
  value?: number
  currency?: string
  params?: Record<string, any>
}

export function trackEvent(payload: TrackEventPayload): void {
  if (typeof window === 'undefined') return
  const w = window as any

  console.log('[Tracking] Event triggered:', payload)

  // 1. Google Analytics / GTM
  if (typeof w.gtag === 'function') {
    w.gtag('event', payload.eventName, {
      event_category: payload.category || 'General',
      value: payload.value,
      currency: payload.currency || 'USD',
      ...payload.params
    })
  }

  // 2. Meta Pixel
  if (typeof w.fbq === 'function') {
    const metaStandardEvents: Record<string, string> = {
      Purchase: 'Purchase',
      Lead: 'Lead',
      BookCall: 'Schedule',
      Checkout: 'InitiateCheckout',
      Contact: 'Contact'
    }
    const metaEvent = metaStandardEvents[payload.eventName] || 'CustomEvent'
    w.fbq('track', metaEvent, {
      value: payload.value,
      currency: payload.currency || 'USD',
      ...payload.params
    })
  }

  // 3. TikTok Pixel
  if (typeof w.ttq === 'object' && typeof w.ttq.track === 'function') {
    w.ttq.track(payload.eventName, {
      value: payload.value,
      currency: payload.currency || 'USD',
      ...payload.params
    })
  }

  // 4. PostHog
  if (typeof w.posthog === 'object' && typeof w.posthog.capture === 'function') {
    w.posthog.capture(payload.eventName, payload.params)
  }
}

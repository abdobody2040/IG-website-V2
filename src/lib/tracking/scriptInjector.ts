import { TrackingIntegration } from '../../types/tracking'

const INJECTED_SCRIPTS = new Set<string>()

export function injectIntegrationScripts(integrations: TrackingIntegration[]): void {
  if (typeof window === 'undefined') return

  const active = integrations.filter(i => i.enabled && i.status === 'connected')

  for (const item of active) {
    if (INJECTED_SCRIPTS.has(item.id)) continue
    INJECTED_SCRIPTS.add(item.id)

    try {
      switch (item.provider) {
        case 'ga4': {
          const mid = item.config.measurement_id
          if (mid) injectGA4(mid)
          break
        }
        case 'gtm': {
          const cid = item.config.container_id
          if (cid) injectGTM(cid)
          break
        }
        case 'meta': {
          const pid = item.config.pixel_id
          if (pid) injectMetaPixel(pid)
          break
        }
        case 'clarity': {
          const cid = item.config.project_id
          if (cid) injectClarity(cid)
          break
        }
        case 'tiktok': {
          const tid = item.config.pixel_id
          if (tid) injectTikTok(tid)
          break
        }
        case 'hotjar': {
          const hjid = item.config.site_id
          if (hjid) injectHotjar(hjid)
          break
        }
        case 'plausible': {
          const domain = item.config.domain
          if (domain) injectPlausible(domain, item.config.custom_host)
          break
        }
        case 'posthog': {
          const key = item.config.api_key
          const host = item.config.host
          if (key) injectPostHog(key, host)
          break
        }
        case 'linkedin': {
          const pid = item.config.partner_id
          if (pid) injectLinkedIn(pid)
          break
        }
        case 'gsc': {
          const meta = item.config.verification_meta
          if (meta) injectMetaTag(meta)
          break
        }
        case 'bing': {
          const meta = item.config.verification_meta
          if (meta) injectMetaTag(meta)
          break
        }
      }
    } catch (e) {
      console.warn(`[Tracking] Error injecting script for provider ${item.provider}`, e)
    }
  }
}

function injectGA4(measurementId: string): void {
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`
  document.head.appendChild(script)

  const w = window as any
  w.dataLayer = w.dataLayer || []
  function gtag(...args: any[]) {
    w.dataLayer.push(args)
  }
  gtag('js', new Date())
  gtag('config', measurementId)
}

function injectGTM(containerId: string): void {
  const w = window as any
  const d = document
  w.dataLayer = w.dataLayer || []
  w.dataLayer.push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' })
  const scripts = d.getElementsByTagName('script')
  const f = scripts.length > 0 ? scripts[0] : null
  const j = d.createElement('script')
  j.async = true
  j.src = `https://www.googletagmanager.com/gtm.js?id=${containerId}`
  if (f && f.parentNode) {
    f.parentNode.insertBefore(j, f)
  } else {
    d.head.appendChild(j)
  }
}

function injectMetaPixel(pixelId: string): void {
  const w = window as any
  if (w.fbq) return
  const n = (w.fbq = function (...args: any[]) {
    if (n.callMethod) n.callMethod(...args)
    else n.queue.push(args)
  }) as any
  if (!w._fbq) w._fbq = n
  n.push = n
  n.loaded = true
  n.version = '2.0'
  n.queue = []

  const script = document.createElement('script')
  script.async = true
  script.src = 'https://connect.facebook.net/en_US/fbevents.js'
  document.head.appendChild(script)

  w.fbq('init', pixelId)
  w.fbq('track', 'PageView')
}

function injectClarity(projectId: string): void {
  const w = window as any
  w.clarity = w.clarity || function (...args: any[]) { (w.clarity.q = w.clarity.q || []).push(args) }
  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.clarity.ms/tag/${projectId}`
  document.head.appendChild(script)
}

function injectTikTok(pixelId: string): void {
  const w = window as any
  w.ttq = w.ttq || []
  const script = document.createElement('script')
  script.async = true
  script.src = `https://analytics.tiktok.com/i18n/pixel/events.js?sdkid=${pixelId}&lib=ttq`
  document.head.appendChild(script)
}

function injectHotjar(hjid: string): void {
  const w = window as any
  w._hjSettings = { hjid: parseInt(hjid, 10), hjsv: 6 }
  const script = document.createElement('script')
  script.async = true
  script.src = `https://static.hotjar.com/c/hotjar-${hjid}.js?sv=6`
  document.head.appendChild(script)
}

function injectPlausible(domain: string, host?: string): void {
  const script = document.createElement('script')
  script.defer = true
  script.dataset.domain = domain
  script.src = host ? `${host}/js/script.js` : 'https://plausible.io/js/script.js'
  document.head.appendChild(script)
}

function injectPostHog(apiKey: string, hostUrl?: string): void {
  const script = document.createElement('script')
  script.async = true
  script.dataset.apiKey = apiKey
  script.src = `${hostUrl || 'https://us.i.posthog.com'}/static/array.js?apiKey=${encodeURIComponent(apiKey)}`
  document.head.appendChild(script)
}

function injectLinkedIn(partnerId: string): void {
  const w = window as any
  w._linkedin_data_partner_ids = w._linkedin_data_partner_ids || []
  w._linkedin_data_partner_ids.push(partnerId)
  const script = document.createElement('script')
  script.async = true
  script.src = 'https://snap.licdn.com/li.lms-analytics/insight.min.js'
  document.head.appendChild(script)
}

function injectMetaTag(metaContent: string): void {
  // Use DOM APIs only — never innerHTML — to avoid XSS
  const meta = document.createElement('meta')
  if (metaContent.startsWith('<meta ')) {
    // Extract name and content attributes from the tag string safely
    const nameMatch = metaContent.match(/name=["']([^"']+)["']/)
    const contentMatch = metaContent.match(/content=["']([^"']+)["']/)
    if (nameMatch?.[1]) meta.name = nameMatch[1]
    if (contentMatch?.[1]) meta.content = contentMatch[1]
  } else {
    meta.name = 'verification'
    meta.content = metaContent
  }
  document.head.appendChild(meta)
}

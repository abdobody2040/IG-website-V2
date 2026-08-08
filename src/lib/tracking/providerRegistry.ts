import { ProviderConfig, ProviderId } from '../../types/tracking'

export const PROVIDERS_REGISTRY: Record<ProviderId, ProviderConfig> = {
  ga4: {
    id: 'ga4',
    name: 'Google Analytics 4 (GA4)',
    category: 'analytics',
    icon: 'BarChart2',
    description: 'Track visitor traffic, session duration, conversions, and ecommerce performance.',
    fields: [
      { key: 'measurement_id', label: 'Measurement ID', placeholder: 'G-XXXXXXXXXX', type: 'text', required: true, helpText: 'Found in GA4 Admin > Data Streams' },
      { key: 'api_secret', label: 'API Secret (Measurement Protocol - Optional)', placeholder: 'xYz12345...', type: 'password', helpText: 'For server-side event tracking' }
    ],
    docsUrl: 'https://support.google.com/analytics/answer/9539598'
  },
  gtm: {
    id: 'gtm',
    name: 'Google Tag Manager',
    category: 'analytics',
    icon: 'Tag',
    description: 'Manage all advertising and analytics tags in one container without editing code.',
    fields: [
      { key: 'container_id', label: 'Container ID', placeholder: 'GTM-XXXXXXX', type: 'text', required: true }
    ],
    docsUrl: 'https://tagmanager.google.com'
  },
  clarity: {
    id: 'clarity',
    name: 'Microsoft Clarity',
    category: 'analytics',
    icon: 'Eye',
    description: 'Free session recordings, heatmaps, and click maps by Microsoft.',
    fields: [
      { key: 'project_id', label: 'Clarity Project ID', placeholder: 'abcdefg123', type: 'text', required: true }
    ],
    docsUrl: 'https://clarity.microsoft.com'
  },
  hotjar: {
    id: 'hotjar',
    name: 'Hotjar',
    category: 'analytics',
    icon: 'Flame',
    description: 'Understand user behavior with heatmaps and feedback polls.',
    fields: [
      { key: 'site_id', label: 'Site ID (hjid)', placeholder: '1234567', type: 'text', required: true }
    ],
    docsUrl: 'https://www.hotjar.com'
  },
  plausible: {
    id: 'plausible',
    name: 'Plausible Analytics',
    category: 'analytics',
    icon: 'ShieldCheck',
    description: 'Lightweight and privacy-friendly Google Analytics alternative.',
    fields: [
      { key: 'domain', label: 'Domain Name', placeholder: 'instantgrow.net', type: 'text', required: true },
      { key: 'custom_host', label: 'Custom Self-Hosted Domain (Optional)', placeholder: 'https://plausible.myhost.com', type: 'text' }
    ],
    docsUrl: 'https://plausible.io'
  },
  matomo: {
    id: 'matomo',
    name: 'Matomo Analytics',
    category: 'analytics',
    icon: 'Activity',
    description: 'Open-source web analytics platform with full data ownership.',
    fields: [
      { key: 'matomo_url', label: 'Matomo Server URL', placeholder: 'https://analytics.yourdomain.com', type: 'text', required: true },
      { key: 'site_id', label: 'Site ID', placeholder: '1', type: 'text', required: true }
    ],
    docsUrl: 'https://matomo.org'
  },
  mixpanel: {
    id: 'mixpanel',
    name: 'Mixpanel',
    category: 'analytics',
    icon: 'PieChart',
    description: 'Product analytics to track user actions and funnels.',
    fields: [
      { key: 'project_token', label: 'Project Token', placeholder: 'abc123def456...', type: 'text', required: true }
    ],
    docsUrl: 'https://mixpanel.com'
  },
  posthog: {
    id: 'posthog',
    name: 'PostHog',
    category: 'analytics',
    icon: 'Terminal',
    description: 'Open-source product analytics, session recording, and feature flags.',
    fields: [
      { key: 'api_key', label: 'Project API Key', placeholder: 'phc_xxxxxxxxxxxx', type: 'text', required: true },
      { key: 'host', label: 'PostHog Host URL', placeholder: 'https://us.i.posthog.com', type: 'text', required: true }
    ],
    docsUrl: 'https://posthog.com'
  },
  meta: {
    id: 'meta',
    name: 'Meta (Facebook) Pixel & CAPI',
    category: 'advertising',
    icon: 'Share2',
    description: 'Track ad conversions, build custom audiences, and optimize Facebook & Instagram campaigns.',
    fields: [
      { key: 'pixel_id', label: 'Meta Pixel ID', placeholder: '123456789012345', type: 'text', required: true },
      { key: 'access_token', label: 'Conversions API (CAPI) Access Token', placeholder: 'EAAxxxxxxxxx...', type: 'password', helpText: 'Server-side CAPI for high attribution accuracy' },
      { key: 'test_event_code', label: 'Test Event Code (Optional)', placeholder: 'TEST12345', type: 'text', helpText: 'For testing Meta Events Manager' }
    ],
    docsUrl: 'https://business.facebook.com/events_manager2'
  },
  google_ads: {
    id: 'google_ads',
    name: 'Google Ads',
    category: 'advertising',
    icon: 'Target',
    description: 'Track sales, leads, and conversion labels for Google Search & Display Ads.',
    fields: [
      { key: 'conversion_id', label: 'Conversion ID', placeholder: 'AW-123456789', type: 'text', required: true },
      { key: 'conversion_label', label: 'Default Conversion Label (Optional)', placeholder: 'AbCdEfGhIjK', type: 'text' },
      { key: 'enhanced_conversions', label: 'Enable Enhanced Conversions', placeholder: 'true', type: 'text', helpText: 'Sends hashed user data for precision tracking' }
    ],
    docsUrl: 'https://ads.google.com'
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok Pixel & Events API',
    category: 'advertising',
    icon: 'Video',
    description: 'Track TikTok ad performance, checkout events, and user engagements.',
    fields: [
      { key: 'pixel_id', label: 'TikTok Pixel ID', placeholder: 'C1234567890123456789', type: 'text', required: true },
      { key: 'access_token', label: 'Events API Access Token (Optional)', placeholder: 'xxxx-xxxx-xxxx', type: 'password' }
    ],
    docsUrl: 'https://ads.tiktok.com'
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn Insight Tag',
    category: 'advertising',
    icon: 'Linkedin',
    description: 'Track B2B ad conversions and demographic visitor insights on LinkedIn.',
    fields: [
      { key: 'partner_id', label: 'Partner ID (Insight Tag)', placeholder: '1234567', type: 'text', required: true }
    ],
    docsUrl: 'https://www.linkedin.com/campaignmanager'
  },
  snapchat: {
    id: 'snapchat',
    name: 'Snapchat Pixel',
    category: 'advertising',
    icon: 'Ghost',
    description: 'Track Snapchat ad conversions and swipe-up purchases.',
    fields: [
      { key: 'pixel_id', label: 'Snap Pixel ID', placeholder: '12345678-abcd-1234-abcd-1234567890ab', type: 'text', required: true }
    ],
    docsUrl: 'https://ads.snapchat.com'
  },
  pinterest: {
    id: 'pinterest',
    name: 'Pinterest Tag',
    category: 'advertising',
    icon: 'Bookmark',
    description: 'Track Pinterest ad conversions and promoted pin engagements.',
    fields: [
      { key: 'tag_id', label: 'Pinterest Tag ID', placeholder: '2612345678901', type: 'text', required: true }
    ],
    docsUrl: 'https://ads.pinterest.com'
  },
  twitter: {
    id: 'twitter',
    name: 'X (Twitter) Pixel',
    category: 'advertising',
    icon: 'Twitter',
    description: 'Track X ad conversions and audience engagements.',
    fields: [
      { key: 'pixel_id', label: 'Pixel ID', placeholder: 'o1234', type: 'text', required: true }
    ],
    docsUrl: 'https://ads.twitter.com'
  },
  reddit: {
    id: 'reddit',
    name: 'Reddit Pixel',
    category: 'advertising',
    icon: 'MessageSquare',
    description: 'Measure Reddit ad conversions and community campaigns.',
    fields: [
      { key: 'pixel_id', label: 'Account ID / Pixel ID', placeholder: 't2_a1b2c3d4', type: 'text', required: true }
    ],
    docsUrl: 'https://ads.reddit.com'
  },
  gsc: {
    id: 'gsc',
    name: 'Google Search Console',
    category: 'webmaster',
    icon: 'Globe',
    description: 'Verify domain ownership, track search queries, CTR, impressions, and sitemaps.',
    fields: [
      { key: 'verification_meta', label: 'HTML Meta Tag Content', placeholder: 'google-site-verification=xxxxxxxxxxxx', type: 'text', required: true }
    ],
    docsUrl: 'https://search.google.com/search-console'
  },
  bing: {
    id: 'bing',
    name: 'Bing Webmaster Tools',
    category: 'webmaster',
    icon: 'Search',
    description: 'Verify site ownership on Bing & Yahoo search engines.',
    fields: [
      { key: 'verification_meta', label: 'Meta Tag Code', placeholder: '1234567890ABCDEF1234567890ABCDEF', type: 'text', required: true }
    ],
    docsUrl: 'https://www.bing.com/webmasters'
  }
}

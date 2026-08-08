// ── Dynamic meta tag & SEO schema injection for SPA ──

export interface PageMetaOptions {
  title: string
  description: string
  keywords?: readonly string[] | string[]
  ogImage?: string
  canonical?: string
  lang?: 'en' | 'ar'
  /** Optional geo-targeting: ISO country code e.g. 'SA', 'AE', 'EG' */
  geoRegion?: string
  /** Optional ICBM/geo coordinates for local SEO */
  geoPosition?: string
  /** Optional page type for speakable schema */
  speakable?: boolean
}

export function setPageMeta({
  title,
  description,
  keywords,
  ogImage,
  canonical,
  lang = 'en',
  geoRegion,
  geoPosition,
  speakable = false,
}: PageMetaOptions) {
  document.title = title

  // Update html lang attribute dynamically
  document.documentElement.lang = lang
  document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'

  setMeta('description', description)
  setMeta('keywords', keywords?.join(', ') ?? '')
  setMeta('og:title', title)
  setMeta('og:description', description)
  setMeta('og:locale', lang === 'ar' ? 'ar_AR' : 'en_US')
  setMeta('og:locale:alternate', lang === 'ar' ? 'en_US' : 'ar_AR')
  setMeta('og:type', 'website')

  // ── Twitter / X Card ─────────────────────────────────
  setMeta('twitter:card', 'summary_large_image')
  setMeta('twitter:title', title)
  setMeta('twitter:description', description)

  const origin = window.location.origin
  const absoluteOgImage = ogImage
    ? (ogImage.startsWith('http') ? ogImage : `${origin}${ogImage}`)
    : `${origin}/og-image.png`

  setMeta('og:image', absoluteOgImage)
  setMeta('twitter:image', absoluteOgImage)

  // ── Geo-targeting meta (Middle East / MENA) ───────────
  if (geoRegion) {
    setMeta('geo.region', geoRegion)
    setMeta('geo.placename', geoRegionName(geoRegion))
    setMeta('ICBM', geoPosition || geoRegionCoords(geoRegion))
  }

  setCanonical(canonical)
  setHreflangLinks(lang)

  // ── Speakable schema (voice search / AI assistants) ───
  if (speakable && canonical) {
    setTimeout(() => {
      injectJsonLdById('seo-speakable', {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        '@id': canonical,
        speakable: {
          '@type': 'SpeakableSpecification',
          cssSelector: ['h1', 'h2', '.speakable', 'meta[name="description"]'],
        },
        url: canonical,
      })
    }, 0)
  }
}

// ── Hreflang — FIXED: use country-specific ar codes for MENA SEO ──────────
export function setHreflangLinks(currentLang: 'en' | 'ar' = 'en') {
  const origin = window.location.origin
  const pathname = window.location.pathname

  // English canonical
  setHreflangTag('en', `${origin}${pathname}`)
  setHreflangTag('en-US', `${origin}${pathname}`)
  setHreflangTag('en-GB', `${origin}${pathname}`)

  // Arabic country-specific tags (critical for MENA Google rankings)
  setHreflangTag('ar', `${origin}${pathname}`)
  setHreflangTag('ar-SA', `${origin}${pathname}`)  // Saudi Arabia
  setHreflangTag('ar-AE', `${origin}${pathname}`)  // UAE
  setHreflangTag('ar-EG', `${origin}${pathname}`)  // Egypt
  setHreflangTag('ar-JO', `${origin}${pathname}`)  // Jordan
  setHreflangTag('ar-KW', `${origin}${pathname}`)  // Kuwait
  setHreflangTag('ar-QA', `${origin}${pathname}`)  // Qatar
  setHreflangTag('ar-BH', `${origin}${pathname}`)  // Bahrain
  setHreflangTag('ar-OM', `${origin}${pathname}`)  // Oman
  setHreflangTag('ar-IQ', `${origin}${pathname}`)  // Iraq
  setHreflangTag('ar-MA', `${origin}${pathname}`)  // Morocco
  setHreflangTag('ar-LB', `${origin}${pathname}`)  // Lebanon
  setHreflangTag('x-default', `${origin}${pathname}`)

  void currentLang
}

function setHreflangTag(lang: string, href: string) {
  let el = document.querySelector(`link[rel="alternate"][hreflang="${lang}"]`)
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'alternate')
    el.setAttribute('hreflang', lang)
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

// ── JSON-LD injection (single slot per page) ──────────────────────────────
export function injectJsonLd(schema: Record<string, unknown>) {
  injectJsonLdById('seo-jsonld', schema)
}

function injectJsonLdById(id: string, schema: Record<string, unknown>) {
  const existing = document.getElementById(id)
  if (existing) existing.remove()
  const script = document.createElement('script')
  script.id = id
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(schema)
  document.head.appendChild(script)
}

export function injectBreadcrumb(items: { name: string; url: string }[]) {
  injectJsonLdById('seo-breadcrumb', {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  })
}

export function getCanonical(path: string): string {
  const origin = 'https://instantgrow.net'
  if (!path || path === '/') return `${origin}/`
  const cleanPath = path.startsWith('/') ? path : `/${path}`
  return `${origin}${cleanPath}`
}

// ── Schema generators ─────────────────────────────────────────────────────

export function generateFaqSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  }
}

export function generateHowToSchema(options: {
  name: string
  description: string
  steps: { name: string; text: string; url?: string }[]
}) {
  const origin = window.location.origin
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: options.name,
    description: options.description,
    step: options.steps.map((s, i) => ({
      '@type': 'HowToStep',
      position: i + 1,
      name: s.name,
      text: s.text,
      url: s.url || origin,
    })),
  }
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': 'https://instantgrow.net/#organization',
    name: 'Instant Grow',
    url: window.location.origin,
    logo: {
      '@type': 'ImageObject',
      url: `${window.location.origin}/logo.png`,
      width: 200,
      height: 60,
    },
    description: 'Fast, reliable LLC and LTD formation services for entrepreneurs worldwide. Serving 150+ countries since 2020.',
    foundingDate: '2020',
    areaServed: 'Worldwide',
    sameAs: [
      'https://twitter.com/instantgrow',
      'https://linkedin.com/company/instantgrow',
      'https://www.facebook.com/instantgrow',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer support',
      url: 'https://instantgrow.net/contact',
      availableLanguage: ['English', 'Arabic'],
    },
  }
}

export function generateWebSiteSchema() {
  const origin = window.location.origin
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Instant Grow',
    url: origin,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${origin}/blog?search={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function generateProfessionalServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': 'https://instantgrow.net/#service',
    name: 'Instant Grow',
    description: 'Fast, reliable LLC and LTD formation services for entrepreneurs worldwide.',
    url: window.location.origin,
    logo: `${window.location.origin}/logo.png`,
    image: `${window.location.origin}/og-image.png`,
    priceRange: '$$',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '2847',
      bestRating: '5',
      worstRating: '1',
    },
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
    },
    areaServed: [
      { '@type': 'Country', name: 'Worldwide' },
      { '@type': 'Country', name: 'Saudi Arabia' },
      { '@type': 'Country', name: 'United Arab Emirates' },
      { '@type': 'Country', name: 'Egypt' },
      { '@type': 'Country', name: 'Jordan' },
      { '@type': 'Country', name: 'Kuwait' },
      { '@type': 'Country', name: 'Qatar' },
      { '@type': 'Country', name: 'Bahrain' },
      { '@type': 'Country', name: 'Oman' },
    ],
    sameAs: [
      'https://twitter.com/instantgrow',
      'https://linkedin.com/company/instantgrow',
    ],
  }
}

export function generateProductSchema(options: {
  name: string
  description: string
  price: number
  currency?: string
  image?: string
  url?: string
  /** Reviews for star-rating rich results in Google */
  reviews?: Array<{
    author: string
    rating: number
    text: string
    lang?: string
  }>
  reviewCount?: number
  ratingValue?: number
}) {
  const origin = window.location.origin
  const reviewCount = options.reviewCount ?? 2847
  const ratingValue = options.ratingValue ?? 4.9

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: options.name,
    description: options.description,
    image: options.image ? [options.image] : [`${origin}/og-image.png`],
    brand: {
      '@type': 'Brand',
      name: 'Instant Grow',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: String(ratingValue),
      reviewCount: String(reviewCount),
      bestRating: '5',
      worstRating: '1',
    },
    ...(options.reviews && options.reviews.length > 0 ? {
      review: options.reviews.map(r => ({
        '@type': 'Review',
        author: { '@type': 'Person', name: r.author },
        reviewRating: {
          '@type': 'Rating',
          ratingValue: String(r.rating),
          bestRating: '5',
          worstRating: '1',
        },
        reviewBody: r.text,
        inLanguage: r.lang || 'en',
      })),
    } : {}),
    offers: {
      '@type': 'Offer',
      price: options.price,
      priceCurrency: options.currency || 'USD',
      availability: 'https://schema.org/InStock',
      url: options.url || origin,
      seller: {
        '@type': 'Organization',
        name: 'Instant Grow',
      },
      priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    },
  }
}

export function generateArticleSchema(post: {
  title: string
  titleAr?: string | null
  excerpt?: string | null
  excerptAr?: string | null
  coverImage?: string | null
  author?: string | null
  createdAt: string
  updatedAt?: string | null
  slug: string
}, isAr = false) {
  const origin = window.location.origin
  const title = (isAr && post.titleAr) ? post.titleAr : post.title
  const excerpt = (isAr && post.excerptAr) ? post.excerptAr : post.excerpt
  const url = `${origin}/blog/${post.slug}`

  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: excerpt || '',
    image: post.coverImage ? [post.coverImage] : [`${origin}/og-image.png`],
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
    inLanguage: isAr ? 'ar' : 'en',
    author: [{
      '@type': 'Person',
      name: post.author || 'Instant Grow Team',
      url: origin,
    }],
    publisher: {
      '@type': 'Organization',
      name: 'Instant Grow',
      logo: {
        '@type': 'ImageObject',
        url: `${origin}/logo.png`,
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  }
}

/** Generate LocalBusiness schema — required for Google Local Pack in MENA */
export function generateLocalBusinessSchema(options?: {
  region?: string
  countryCode?: string
  city?: string
  phone?: string
}) {
  const region = options?.region || 'MENA'
  const countryCode = options?.countryCode || 'AE'
  const city = options?.city || 'Dubai'
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: `Instant Grow – ${region}`,
    url: 'https://instantgrow.net',
    logo: 'https://instantgrow.net/logo.png',
    image: 'https://instantgrow.net/og-image.png',
    priceRange: '$$',
    telephone: options?.phone,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '2847',
      bestRating: '5',
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: city,
      addressCountry: countryCode,
    },
    areaServed: [
      { '@type': 'Country', name: 'Saudi Arabia' },
      { '@type': 'Country', name: 'United Arab Emirates' },
      { '@type': 'Country', name: 'Egypt' },
      { '@type': 'Country', name: 'Jordan' },
      { '@type': 'Country', name: 'Kuwait' },
      { '@type': 'Country', name: 'Qatar' },
      { '@type': 'Country', name: 'Bahrain' },
      { '@type': 'Country', name: 'Oman' },
      { '@type': 'Country', name: 'Iraq' },
      { '@type': 'Country', name: 'Morocco' },
      { '@type': 'Country', name: 'Tunisia' },
      { '@type': 'Country', name: 'Libya' },
      { '@type': 'Country', name: 'Turkey' },
      { '@type': 'Country', name: 'Pakistan' },
    ],
    openingHoursSpecification: {
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Sunday'],
      opens: '09:00',
      closes: '23:00',
    },
    hasMap: 'https://www.google.com/maps?q=Instant+Grow',
    sameAs: [
      'https://twitter.com/instantgrow',
      'https://linkedin.com/company/instantgrow',
      'https://www.facebook.com/instantgrow',
    ],
  }
}

/** Generate MENA-specific Service schema with country targeting */
export function generateMenaServiceSchema(options: {
  serviceName: string
  serviceNameAr: string
  description: string
  descriptionAr: string
  price: number
  url: string
  country?: string
  countryCode?: string
}) {
  const { serviceName, serviceNameAr, description, descriptionAr, price, url, country, countryCode } = options
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceName,
    alternateName: serviceNameAr,
    description,
    disambiguatingDescription: descriptionAr,
    url,
    provider: {
      '@type': 'Organization',
      name: 'Instant Grow',
      url: 'https://instantgrow.net',
    },
    areaServed: country ? [
      { '@type': 'Country', name: country },
      { '@type': 'Country', name: 'Worldwide' },
    ] : { '@type': 'Country', name: 'Worldwide' },
    offers: {
      '@type': 'Offer',
      price: String(price),
      priceCurrency: 'USD',
      url,
      availability: 'https://schema.org/InStock',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.9',
      reviewCount: '2847',
      bestRating: '5',
    },
    ...(countryCode ? { serviceArea: { '@type': 'GeoCircle', geoMidpoint: { '@type': 'GeoCoordinates', ...geoCoords(countryCode) } } } : {}),
  }
}

// ── Geo helpers for MENA targeting ────────────────────────────────────────

function geoRegionName(code: string): string {
  const names: Record<string, string> = {
    SA: 'Saudi Arabia', AE: 'United Arab Emirates', EG: 'Egypt',
    JO: 'Jordan', KW: 'Kuwait', QA: 'Qatar', BH: 'Bahrain', OM: 'Oman',
    IQ: 'Iraq', MA: 'Morocco', TN: 'Tunisia', LB: 'Lebanon', TR: 'Turkey', PK: 'Pakistan',
  }
  return names[code] || code
}

function geoRegionCoords(code: string): string {
  const coords: Record<string, string> = {
    SA: '24.7136,46.6753', AE: '25.2048,55.2708', EG: '30.0444,31.2357',
    JO: '31.9522,35.2332', KW: '29.3759,47.9774', QA: '25.2854,51.5310',
    BH: '26.0667,50.5577', OM: '23.6139,58.5922', IQ: '33.3152,44.3661',
    MA: '33.9716,6.8498', LB: '33.8938,35.5018', TR: '39.9334,32.8597', PK: '33.6844,73.0479',
  }
  return coords[code] || ''
}

function geoCoords(code: string): { latitude: number; longitude: number } {
  const c = geoRegionCoords(code).split(',')
  return { latitude: parseFloat(c[0] ?? '0') || 0, longitude: parseFloat(c[1] ?? '0') || 0 }
}

// ── DOM helpers ───────────────────────────────────────────────────────────

function setMeta(name: string, content: string) {
  if (!content) return
  let el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`)
  if (!el) {
    el = document.createElement('meta')
    if (name.startsWith('og:') || name.startsWith('twitter:')) {
      el.setAttribute('property', name)
    } else {
      el.setAttribute('name', name)
    }
    document.head.appendChild(el)
  }
  el.setAttribute('content', content)
}

function setCanonical(url?: string) {
  const href = url || window.location.href
  let el = document.querySelector('link[rel="canonical"]')
  if (!el) {
    el = document.createElement('link')
    el.setAttribute('rel', 'canonical')
    document.head.appendChild(el)
  }
  el.setAttribute('href', href)
}

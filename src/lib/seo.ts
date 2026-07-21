// ── Dynamic meta tag & SEO schema injection for SPA ──

export interface PageMetaOptions {
  title: string
  description: string
  keywords?: readonly string[] | string[]
  ogImage?: string
  canonical?: string
  lang?: 'en' | 'ar'
}

export function setPageMeta({
  title,
  description,
  keywords,
  ogImage,
  canonical,
  lang = 'en',
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

  const origin = window.location.origin
  const absoluteOgImage = ogImage
    ? (ogImage.startsWith('http') ? ogImage : `${origin}${ogImage}`)
    : `${origin}/logo.png`

  setMeta('og:image', absoluteOgImage)
  setMeta('og:type', 'website')
  setMeta('twitter:card', 'summary_large_image')
  setMeta('twitter:title', title)
  setMeta('twitter:description', description)
  setMeta('twitter:image', absoluteOgImage)

  setCanonical(canonical)
  setHreflangLinks()
}

export function setHreflangLinks() {
  const origin = window.location.origin
  const pathname = window.location.pathname

  // Ensurehreflang alternate tags for multilingual indexing (EN, AR, and x-default)
  setHreflangTag('en', `${origin}${pathname}`)
  setHreflangTag('ar', `${origin}${pathname}`)
  setHreflangTag('x-default', `${origin}${pathname}`)
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

export function injectJsonLd(schema: Record<string, unknown>) {
  const id = 'seo-jsonld'
  const existing = document.getElementById(id)
  if (existing) existing.remove()
  const script = document.createElement('script')
  script.id = id
  script.type = 'application/ld+json'
  script.textContent = JSON.stringify(schema)
  document.head.appendChild(script)
}

export function injectBreadcrumb(items: { name: string; url: string }[]) {
  injectJsonLd({
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
  const origin = window.location.origin
  return `${origin}${path}`
}

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
    name: 'Instant Grow',
    url: window.location.origin,
    logo: `${window.location.origin}/logo.png`,
    description: 'Fast, reliable LLC and LTD formation services for entrepreneurs worldwide.',
    sameAs: [
      'https://twitter.com/instantgrow',
      'https://linkedin.com/company/instantgrow',
    ],
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
    '@type': 'LegalService',
    name: 'Instant Grow',
    description: 'Fast, reliable LLC and LTD formation services for entrepreneurs worldwide.',
    url: window.location.origin,
    logo: `${window.location.origin}/logo.png`,
    image: `${window.location.origin}/og-image.jpg`,
    priceRange: '$$',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'US',
    },
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
}) {
  const origin = window.location.origin
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: options.name,
    description: options.description,
    image: options.image ? [options.image] : [`${origin}/logo.png`],
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
    image: post.coverImage ? [post.coverImage] : [],
    datePublished: post.createdAt,
    dateModified: post.updatedAt || post.createdAt,
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

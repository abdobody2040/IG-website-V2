// ── Dynamic meta tag injection for SPA ──
export function setPageMeta({
  title,
  description,
  keywords,
  ogImage,
  canonical,
}: {
  title: string
  description: string
  keywords?: readonly string[] | string[]
  ogImage?: string
  canonical?: string
}) {
  document.title = title

  setMeta('description', description)
  setMeta('keywords', keywords?.join(', ') ?? '')
  setMeta('og:title', title)
  setMeta('og:description', description)

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
    'name': 'Instant Grow',
    'url': origin,
    'potentialAction': {
      '@type': 'SearchAction',
      'target': `${origin}/blog?search={search_term_string}`,
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
    'headline': title,
    'description': excerpt || '',
    'image': post.coverImage ? [post.coverImage] : [],
    'datePublished': post.createdAt,
    'dateModified': post.updatedAt || post.createdAt,
    'author': [{
      '@type': 'Person',
      'name': post.author || 'Instant Grow Team',
      'url': origin,
    }],
    'publisher': {
      '@type': 'Organization',
      'name': 'Instant Grow',
      'logo': {
        '@type': 'ImageObject',
        'url': `${origin}/logo.png`,
      },
    },
    'mainEntityOfPage': {
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


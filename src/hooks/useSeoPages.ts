import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '../lib/pocketbase'
import toast from 'react-hot-toast'
import { logAdminAction } from './useAdminAuditLog'
import type { SeoPage, SeoPageFormData } from '../types/db'

function parseJson<T>(val: unknown, fallback: T): T {
  if (val === null || val === undefined) return fallback
  if (typeof val === 'object') return val as T
  if (typeof val === 'string' && val.trim()) {
    try {
      return JSON.parse(val) as T
    } catch {
      return fallback
    }
  }
  return fallback
}

function mapSeoPage(raw: Record<string, unknown>): SeoPage {
  return {
    id: raw['id'] as string,
    slug: raw['slug'] as string,
    countryName: raw['country_name'] as string,
    countryCode: raw['country_code'] as string,
    metaTitle: raw['meta_title'] as string,
    metaDescription: raw['meta_description'] as string,
    heroTitle: raw['hero_title'] as string,
    heroDescription: raw['hero_description'] as string,
    mainKeyword: raw['main_keyword'] as string,
    secondaryKeywords: parseJson<string[]>(raw['secondary_keywords'], []),
    painPoints: parseJson<string[]>(raw['pain_points'], []),
    benefits: parseJson<Record<string, unknown>[]>(raw['benefits'], []),
    bestBank: raw['best_bank'] as string | null,
    bankNotes: raw['bank_notes'] as string | null,
    taxNotes: raw['tax_notes'] as string | null,
    faqJson: parseJson<Record<string, unknown>[]>(raw['faq_json'], []),
    ctaText: raw['cta_text'] as string,
    featuredImage: raw['featured_image'] as string | null,
    schemaJson: parseJson<Record<string, unknown>>(raw['schema_json'], {}),
    published: Boolean(raw['published']),
    createdBy: raw['created_by'] as string | null,
    createdAt: raw['created'] as string,
    updatedAt: raw['updated'] as string,
  }
}

export const FALLBACK_SEO_PAGES: SeoPage[] = [
  {
    id: 'seo_egypt_fallback',
    slug: 'egypt',
    countryName: 'Egypt',
    countryCode: 'EG',
    metaTitle: 'US LLC Formation for Egyptian Entrepreneurs | Instant Grow',
    metaDescription: 'Complete guide to forming a US LLC from Egypt. Learn about banking options, US-Egypt tax treaties, compliance, and how to run your US company remotely from Cairo or anywhere in Egypt.',
    heroTitle: 'Form Your US LLC from Egypt',
    heroDescription: 'Launch your US company from Egypt with zero US presence required. Open a US bank account remotely, benefit from the US-Egypt tax treaty, and accept payments globally — all while living in Egypt.',
    mainKeyword: 'US LLC Egypt',
    secondaryKeywords: ['LLC for Egyptians', 'US company from Egypt', 'Egyptian entrepreneurs US LLC', 'US bank account Egypt'],
    painPoints: ['Confusing US incorporation process from Egypt', 'High US banking minimums for non-residents', 'Unclear US-Egypt tax obligations', 'Limited payment processing options for Egyptian founders'],
    benefits: [
      { title: 'Zero US Presence Required', desc: 'Form your LLC completely online from Egypt. No US visa, address, or residency needed.' },
      { title: 'Remote US Bank Account', desc: 'Open a Mercury or Relay bank account from Egypt without visiting the US. Receive a US routing number.' },
      { title: 'US-Egypt Tax Treaty Benefits', desc: 'Leverage the tax treaty between the US and Egypt to avoid double taxation on your business income.' },
      { title: 'Global Payment Processing', desc: 'Accept payments via Stripe, PayPal, and other US-based processors unavailable to Egyptian residents.' }
    ],
    bestBank: 'Mercury',
    bankNotes: 'Mercury is the top choice for Egyptian founders — no minimum balance, no monthly fees, remote verification with Egyptian passport.',
    taxNotes: 'Egypt has a tax treaty with the US. LLC profits are generally not taxed in Egypt unless remitted. Consult a local tax advisor for your specific situation.',
    faqJson: [
      { question: 'Can an Egyptian citizen form a US LLC?', answer: 'Yes, absolutely. US LLC formation does not require US citizenship or residency. You can form one entirely online from Egypt using a registered agent service.' },
      { question: 'Do I need a US visa to form an LLC?', answer: 'No, you do not need any US visa or physical presence. The entire process can be completed remotely from Egypt.' },
      { question: 'Which US state is best for Egyptian founders?', answer: 'Wyoming and Delaware are the most popular choices. Wyoming has lower annual fees and no state income tax, while Delaware has a well-established legal system.' },
      { question: 'Can I open a US bank account from Egypt?', answer: 'Yes, online banks like Mercury and Relay allow Egyptian founders to open accounts remotely with their Egyptian passport and LLC documents.' },
      { question: 'How are LLC profits taxed in Egypt?', answer: 'Under the US-Egypt tax treaty, LLC profits may be exempt from Egyptian taxation if the business has no permanent establishment in Egypt. However, consult a tax professional for your specific case.' },
      { question: 'How much does it cost to form a US LLC from Egypt?', answer: 'The total cost ranges from $300-$800 depending on the state and registered agent. Instant Grow offers LLC formation starting at $297.' }
    ],
    ctaText: 'Start Your US LLC from Egypt',
    featuredImage: null,
    schemaJson: {},
    published: true,
    createdBy: null,
    createdAt: '2026-07-18T18:48:45Z',
    updatedAt: '2026-07-18T18:48:45Z',
  },
  {
    id: 'seo_saudi_fallback',
    slug: 'saudi-arabia',
    countryName: 'Saudi Arabia',
    countryCode: 'SA',
    metaTitle: 'US LLC Formation for Saudi Entrepreneurs | Instant Grow',
    metaDescription: 'Complete guide to forming a US LLC from Saudi Arabia. Learn about banking, US-Saudi tax considerations, compliance, and running your US company from Riyadh or Jeddah.',
    heroTitle: 'Form Your US LLC from Saudi Arabia',
    heroDescription: 'Launch your US company from Saudi Arabia without leaving the Kingdom. Open a US bank account remotely, navigate US-Saudi tax rules, and scale globally.',
    mainKeyword: 'US LLC Saudi Arabia',
    secondaryKeywords: ['LLC for Saudis', 'US company from Saudi Arabia', 'Saudi entrepreneurs US LLC', 'US bank account Saudi Arabia'],
    painPoints: ['Complex US company registration for Saudi nationals', 'Limited US banking access from Saudi Arabia', 'Uncertain tax implications under Saudi law', 'Difficulty accepting international payments as Saudi resident'],
    benefits: [
      { title: '100% Remote Formation', desc: 'Form your LLC entirely online from Saudi Arabia. No US travel, visa, or in-person requirements.' },
      { title: 'US Bank Account from KSA', desc: 'Open a US bank account remotely. Mercury and Relay support Saudi passports and proof of address.' },
      { title: 'Saudi Tax Compliance', desc: 'Understand how your US LLC interacts with Zakat, VAT, and Saudi income tax regulations.' },
      { title: 'Access US Payment Gateways', desc: 'Accept payments through Stripe, PayPal, and other US processors to serve global clients.' }
    ],
    bestBank: 'Mercury',
    bankNotes: 'Mercury works well for Saudi founders. Use your Saudi passport for identity verification. Relay is a good alternative.',
    taxNotes: 'Saudi Arabia does not have a formal income tax treaty with the US. LLC income may be subject to Zakat or other Saudi taxes. Always consult a Saudi tax advisor.',
    faqJson: [
      { question: 'Can a Saudi national form a US LLC?', answer: 'Yes, Saudi nationals can form a US LLC entirely online. No US residency or citizenship is required.' },
      { question: 'What US bank can I use from Saudi Arabia?', answer: 'Mercury and Relay are the most accessible. Both support remote onboarding with a Saudi passport and LLC formation documents.' },
      { question: 'Does Saudi Arabia tax US LLC income?', answer: 'Saudi tax treatment depends on your residency status and business activities. Consult a Saudi tax advisor, especially regarding Zakat obligations.' },
      { question: 'Which US state is best?', answer: 'Wyoming is popular for Saudi founders due to no state income tax and strong privacy protections.' },
      { question: 'Can I use Saudi ID documents for verification?', answer: 'Yes, your Saudi passport is sufficient for US LLC formation and most online bank verifications.' }
    ],
    ctaText: 'Start Your US LLC from Saudi Arabia',
    featuredImage: null,
    schemaJson: {},
    published: true,
    createdBy: null,
    createdAt: '2026-07-18T18:48:45Z',
    updatedAt: '2026-07-18T18:48:45Z',
  },
  {
    id: 'seo_uae_fallback',
    slug: 'uae',
    countryName: 'United Arab Emirates',
    countryCode: 'AE',
    metaTitle: 'US LLC Formation for UAE Entrepreneurs | Instant Grow',
    metaDescription: 'Complete guide to forming a US LLC from the UAE. Learn about banking, US-UAE tax treaty benefits, free zone considerations, and running your US company from Dubai or Abu Dhabi.',
    heroTitle: 'Form Your US LLC from the UAE',
    heroDescription: 'Launch your US company from Dubai, Abu Dhabi, or anywhere in the UAE. Leverage the US-UAE tax treaty, open a US bank account remotely, and grow your global business.',
    mainKeyword: 'US LLC UAE',
    secondaryKeywords: ['LLC for UAE residents', 'US company from Dubai', 'UAE entrepreneurs US LLC', 'Dubai US LLC formation'],
    painPoints: ['Confusing US vs UAE company structure options', 'Banking hurdles for UAE residents opening US accounts', 'Understanding US-UAE tax treaty application', 'Choosing between Dubai free zone and US LLC'],
    benefits: [
      { title: 'Seamless Remote Formation', desc: 'Form your LLC online from Dubai or Abu Dhabi. No US presence or travel needed.' },
      { title: 'US-UAE Tax Treaty Advantage', desc: 'The US-UAE tax treaty provides strong protection against double taxation for UAE residents.' },
      { title: 'Remote US Banking', desc: 'Open Mercury or Relay accounts from the UAE using your Emirates ID or passport.' },
      { title: 'Free Zone vs LLC Clarity', desc: 'Understand when a US LLC makes more sense than a Dubai free zone company for your business.' }
    ],
    bestBank: 'Mercury',
    bankNotes: 'Mercury is the top choice for UAE founders. They accept UAE residency proof and passports. Wise multi-currency accounts also pair well.',
    taxNotes: 'The US-UAE tax treaty generally prevents double taxation. LLC income is typically not taxed in the UAE (no corporate income tax for most activities).',
    faqJson: [
      { question: 'Can I form a US LLC while living in Dubai?', answer: 'Yes, absolutely. Many UAE entrepreneurs form US LLCs to access US payment gateways and serve American clients.' },
      { question: 'US LLC or Dubai Free Zone?', answer: 'A US LLC is better if your customers are primarily in the US. Free zones are better for UAE-local operations. Some entrepreneurs use both structures.' },
      { question: 'Can I open a US bank account from the UAE?', answer: 'Yes. Mercury and Relay both accept UAE residents. You need your LLC documents and valid passport/Emirates ID.' },
      { question: 'Does the UAE tax US LLC income?', answer: 'The UAE has no corporate income tax for most mainland businesses. Under the US-UAE tax treaty, LLC income should not be double-taxed.' },
      { question: 'What is the total cost?', answer: 'US LLC formation costs $300-$800. Instant Grow offers packages starting at $297 + state fees.' }
    ],
    ctaText: 'Start Your US LLC from the UAE',
    featuredImage: null,
    schemaJson: {},
    published: true,
    createdBy: null,
    createdAt: '2026-07-18T18:48:45Z',
    updatedAt: '2026-07-18T18:48:45Z',
  },
  {
    id: 'seo_morocco_fallback',
    slug: 'morocco',
    countryName: 'Morocco',
    countryCode: 'MA',
    metaTitle: 'US LLC Formation for Moroccan Entrepreneurs | Instant Grow',
    metaDescription: 'Complete guide to forming a US LLC from Morocco. Learn about banking, US-Morocco tax treaty benefits, compliance, and running your US company from Casablanca or Marrakech.',
    heroTitle: 'Form Your US LLC from Morocco',
    heroDescription: 'Launch your US company from Morocco with zero US presence. Open a US bank account remotely, benefit from the US-Morocco tax treaty, and access global payments.',
    mainKeyword: 'US LLC Morocco',
    secondaryKeywords: ['LLC for Moroccans', 'US company from Morocco', 'Moroccan entrepreneurs US LLC', 'US bank account Morocco'],
    painPoints: ['Limited US banking options for Moroccan residents', 'Complex US-Morocco tax compliance', 'Payment processing restrictions for Moroccan businesses', 'Language barriers in legal processes'],
    benefits: [
      { title: 'Fully Remote Formation', desc: 'Form your LLC online from Morocco. French and Arabic support available through our platform.' },
      { title: 'US Bank Account from Morocco', desc: 'Open a Mercury or Relay bank account remotely using your Moroccan passport.' },
      { title: 'US-Morocco Tax Treaty', desc: 'The US-Morocco tax treaty helps avoid double taxation on your LLC income.' },
      { title: 'Global Payment Access', desc: 'Accept payments via US-based processors like Stripe to serve international clients.' }
    ],
    bestBank: 'Mercury',
    bankNotes: 'Mercury supports Moroccan residents. Use your passport for verification. Wise is a good alternative for multi-currency needs.',
    taxNotes: 'Morocco has a tax treaty with the US. LLC income is generally taxable only in the US unless you have a permanent establishment in Morocco. Consult a Moroccan tax expert.',
    faqJson: [
      { question: 'Can a Moroccan citizen form a US LLC?', answer: 'Yes, Moroccan citizens can form a US LLC entirely online. The process does not require US residency or citizenship.' },
      { question: 'What bank can I use from Morocco?', answer: 'Mercury is the most accessible for Moroccan founders. Wise Business also works well for multi-currency accounts.' },
      { question: 'How does the US-Morocco tax treaty affect my LLC?', answer: 'Under the treaty, business profits are generally taxed only in the US unless you have a permanent establishment in Morocco. This can significantly reduce your tax burden.' }
    ],
    ctaText: 'Start Your US LLC from Morocco',
    featuredImage: null,
    schemaJson: {},
    published: true,
    createdBy: null,
    createdAt: '2026-07-18T18:48:45Z',
    updatedAt: '2026-07-18T18:48:45Z',
  }
]

export function useSeoPages(publishedOnly = false) {
  return useQuery({
    queryKey: ['seo-pages', { publishedOnly }],
    queryFn: async () => {
      try {
        const result = await pb.collection('countries_seo_pages').getList(1, 500, {
          filter: publishedOnly ? 'published = true' : undefined,
          sort: 'country_name',
        })
        const items = result.items.map(item => mapSeoPage(item as unknown as Record<string, unknown>))
        if (items.length > 0) return items
      } catch (err) {
        console.error('Error fetching SEO pages from DB:', err)
      }
      return FALLBACK_SEO_PAGES.filter(p => !publishedOnly || p.published)
    },
  })
}

export function useSeoPageBySlug(slug: string) {
  return useQuery({
    queryKey: ['seo-page', slug],
    queryFn: async () => {
      let page: SeoPage | null = null
      try {
        const result = await pb.collection('countries_seo_pages').getList(1, 1, {
          filter: `slug = "${slug}"`,
        })
        if (result.items.length > 0) {
          page = mapSeoPage(result.items[0] as unknown as Record<string, unknown>)
        }
      } catch (err) {
        console.error('Error fetching SEO page by slug from DB:', err)
      }

      if (!page) {
        page = FALLBACK_SEO_PAGES.find(p => p.slug.toLowerCase() === slug.toLowerCase()) || null
      }
      if (!page) throw new Error('SEO page not found')
      return page
    },
    enabled: !!slug,
  })
}

export function useCreateSeoPage() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (form: SeoPageFormData) => {
      const record = await pb.collection('countries_seo_pages').create({
        slug: form.slug,
        country_name: form.countryName,
        country_code: form.countryCode,
        meta_title: form.metaTitle,
        meta_description: form.metaDescription,
        hero_title: form.heroTitle,
        hero_description: form.heroDescription,
        main_keyword: form.mainKeyword,
        secondary_keywords: parseJsonArray(form.secondaryKeywords),
        pain_points: parseJsonArray(form.painPoints),
        benefits: parseJsonArray(form.benefits),
        best_bank: form.bestBank || null,
        bank_notes: form.bankNotes || null,
        tax_notes: form.taxNotes || null,
        faq_json: parseJsonArray(form.faqJson),
        cta_text: form.ctaText,
        featured_image: form.featuredImage || null,
        schema_json: parseJsonObject(form.schemaJson),
        published: form.published,
        created_by: pb.authStore.model?.['id'] ?? null,
      })

      logAdminAction({ action: 'create', tableName: 'countries_seo_pages', recordId: (record as Record<string, unknown>)['id'] as string })
      return mapSeoPage(record as unknown as Record<string, unknown>)
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['seo-pages'] }); toast.success('SEO page created') },
    onError: (err: Error) => toast.error(err.message || 'Failed to create SEO page'),
  })
}

export function useUpdateSeoPage() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, form }: { id: string; form: Partial<SeoPageFormData> }) => {
      const updates: Record<string, unknown> = {}
      if (form.slug !== undefined) updates['slug'] = form.slug
      if (form.countryName !== undefined) updates['country_name'] = form.countryName
      if (form.countryCode !== undefined) updates['country_code'] = form.countryCode
      if (form.metaTitle !== undefined) updates['meta_title'] = form.metaTitle
      if (form.metaDescription !== undefined) updates['meta_description'] = form.metaDescription
      if (form.heroTitle !== undefined) updates['hero_title'] = form.heroTitle
      if (form.heroDescription !== undefined) updates['hero_description'] = form.heroDescription
      if (form.mainKeyword !== undefined) updates['main_keyword'] = form.mainKeyword
      if (form.secondaryKeywords !== undefined) updates['secondary_keywords'] = parseJsonArray(form.secondaryKeywords)
      if (form.painPoints !== undefined) updates['pain_points'] = parseJsonArray(form.painPoints)
      if (form.benefits !== undefined) updates['benefits'] = parseJsonArray(form.benefits)
      if (form.bestBank !== undefined) updates['best_bank'] = form.bestBank || null
      if (form.bankNotes !== undefined) updates['bank_notes'] = form.bankNotes || null
      if (form.taxNotes !== undefined) updates['tax_notes'] = form.taxNotes || null
      if (form.faqJson !== undefined) updates['faq_json'] = parseJsonArray(form.faqJson)
      if (form.ctaText !== undefined) updates['cta_text'] = form.ctaText
      if (form.featuredImage !== undefined) updates['featured_image'] = form.featuredImage || null
      if (form.schemaJson !== undefined) updates['schema_json'] = parseJsonObject(form.schemaJson)
      if (form.published !== undefined) updates['published'] = form.published

      await pb.collection('countries_seo_pages').update(id, updates)
      logAdminAction({ action: 'update', tableName: 'countries_seo_pages', recordId: id })
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['seo-pages'] }); toast.success('SEO page updated') },
    onError: (err: Error) => toast.error(err.message || 'Failed to update SEO page'),
  })
}

export function useDeleteSeoPage() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await pb.collection('countries_seo_pages').delete(id)
      logAdminAction({ action: 'delete', tableName: 'countries_seo_pages', recordId: id })
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['seo-pages'] }); toast.success('SEO page deleted') },
    onError: (err: Error) => toast.error(err.message || 'Failed to delete SEO page'),
  })
}

function parseJsonArray(val: string): unknown[] {
  try { return JSON.parse(val || '[]') } catch { return [] }
}
function parseJsonObject(val: string): Record<string, unknown> {
  try { return JSON.parse(val || '{}') } catch { return {} }
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '../lib/pocketbase'
import toast from 'react-hot-toast'
import { logAdminAction } from './useAdminAuditLog'
import type { SeoPage, SeoPageFormData } from '../types/db'

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
    secondaryKeywords: (raw['secondary_keywords'] as string[]) ?? [],
    painPoints: (raw['pain_points'] as string[]) ?? [],
    benefits: (raw['benefits'] as Record<string, unknown>[]) ?? [],
    bestBank: raw['best_bank'] as string | null,
    bankNotes: raw['bank_notes'] as string | null,
    taxNotes: raw['tax_notes'] as string | null,
    faqJson: (raw['faq_json'] as Record<string, unknown>[]) ?? [],
    ctaText: raw['cta_text'] as string,
    featuredImage: raw['featured_image'] as string | null,
    schemaJson: (raw['schema_json'] as Record<string, unknown>) ?? {},
    published: raw['published'] as boolean,
    createdBy: raw['created_by'] as string | null,
    createdAt: raw['created'] as string,
    updatedAt: raw['updated'] as string,
  }
}

export function useSeoPages(publishedOnly = false) {
  return useQuery({
    queryKey: ['seo-pages', { publishedOnly }],
    queryFn: async () => {
      const result = await pb.collection('countries_seo_pages').getList(1, 500, {
        filter: publishedOnly ? 'published = true' : undefined,
        sort: 'country_name',
      })
      return result.items.map(item => mapSeoPage(item as unknown as Record<string, unknown>))
    },
  })
}

export function useSeoPageBySlug(slug: string) {
  return useQuery({
    queryKey: ['seo-page', slug],
    queryFn: async () => {
      const result = await pb.collection('countries_seo_pages').getList(1, 1, {
        filter: `slug = "${slug}"`,
      })
      if (result.items.length === 0) throw new Error('SEO page not found')
      return mapSeoPage(result.items[0] as unknown as Record<string, unknown>)
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

      logAdminAction({ action: 'create', tableName: 'countries_seo_pages', recordId: record.id })
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

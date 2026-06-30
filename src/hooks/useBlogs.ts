import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pb } from '../lib/pocketbase'
import toast from 'react-hot-toast'
import type { Blog, BlogFormData } from '../types/db'
import { logAdminAction } from './useAdminAuditLog'

function mapBlog(raw: Record<string, unknown>): Blog {
  return {
    id: raw['id'] as string,
    title: raw['title'] as string,
    slug: raw['slug'] as string,
    excerpt: raw['excerpt'] as string | null,
    content: raw['content'] as string,
    coverImage: raw['cover_image'] as string | null,
    author: raw['author'] as string,
    tags: (raw['tags'] as string[]) ?? [],
    published: raw['published'] as boolean,
    featured: raw['featured'] as boolean,
    createdBy: raw['created_by'] as string | null,
    createdAt: raw['created'] as string,
    updatedAt: raw['updated'] as string,
    language: (raw['language'] as string) ?? 'en',
    titleAr: raw['title_ar'] as string | null,
    slugAr: raw['slug_ar'] as string | null,
    excerptAr: raw['excerpt_ar'] as string | null,
    contentAr: raw['content_ar'] as string | null,
  }
}

export function useBlogs(filters?: { published?: boolean; featured?: boolean; limit?: number; language?: string }) {
  return useQuery({
    queryKey: ['blogs', filters],
    queryFn: async () => {
      const filterParts: string[] = []
      if (filters?.published !== undefined) filterParts.push(`published = ${filters.published}`)
      if (filters?.featured) filterParts.push('featured = true')
      if (filters?.language) filterParts.push(`language = "${filters.language}"`)

      const result = await pb.collection('blogs').getList(1, filters?.limit ?? 200, {
        filter: filterParts.join(' && ') || undefined,
        sort: '-created',
      })
      return result.items.map(item => mapBlog(item as unknown as Record<string, unknown>))
    },
  })
}

export function useBlogBySlug(slug: string) {
  return useQuery({
    queryKey: ['blog', slug],
    queryFn: async () => {
      const safeSlug = slug.replace(/[^a-z0-9-]/gi, '')
      const result = await pb.collection('blogs').getList(1, 1, {
        filter: `published = true && (slug = "${safeSlug}" || slug_ar = "${safeSlug}")`,
      })
      if (result.items.length === 0) throw new Error('Blog not found')
      return mapBlog(result.items[0] as unknown as Record<string, unknown>)
    },
    enabled: !!slug,
  })
}

export function useCreateBlog() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (form: BlogFormData) => {
      const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
      const tags = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []

      const record = await pb.collection('blogs').create({
        title: form.title,
        slug,
        excerpt: form.excerpt || null,
        content: form.content,
        cover_image: form.coverImage || null,
        author: form.author || 'Instant Grow Team',
        tags,
        published: form.published,
        featured: form.featured,
        language: form.language || 'en',
        title_ar: form.titleAr || null,
        slug_ar: form.slugAr || null,
        excerpt_ar: form.excerptAr || null,
        content_ar: form.contentAr || null,
        created_by: pb.authStore.model?.['id'] ?? null,
      })

      logAdminAction({ action: 'create', tableName: 'blogs', recordId: record.id })
      return mapBlog(record as unknown as Record<string, unknown>)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blogs'] })
      toast.success('Blog post created')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to create blog post')
    },
  })
}

export function useUpdateBlog() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, form }: { id: string; form: Partial<BlogFormData> }) => {
      const updates: Record<string, unknown> = {}

      if (form.title !== undefined) updates['title'] = form.title
      if (form.slug !== undefined) updates['slug'] = form.slug
      if (form.excerpt !== undefined) updates['excerpt'] = form.excerpt || null
      if (form.content !== undefined) updates['content'] = form.content
      if (form.coverImage !== undefined) updates['cover_image'] = form.coverImage || null
      if (form.author !== undefined) updates['author'] = form.author
      if (form.tags !== undefined) {
        updates['tags'] = form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : []
      }
      if (form.published !== undefined) updates['published'] = form.published
      if (form.featured !== undefined) updates['featured'] = form.featured
      if (form.language !== undefined) updates['language'] = form.language
      if (form.titleAr !== undefined) updates['title_ar'] = form.titleAr || null
      if (form.slugAr !== undefined) updates['slug_ar'] = form.slugAr || null
      if (form.excerptAr !== undefined) updates['excerpt_ar'] = form.excerptAr || null
      if (form.contentAr !== undefined) updates['content_ar'] = form.contentAr || null

      await pb.collection('blogs').update(id, updates)
      logAdminAction({ action: 'update', tableName: 'blogs', recordId: id })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blogs'] })
      toast.success('Blog post updated')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to update blog post')
    },
  })
}

export function useDeleteBlog() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      await pb.collection('blogs').delete(id)
      logAdminAction({ action: 'delete', tableName: 'blogs', recordId: id })
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['blogs'] })
      toast.success('Blog post deleted')
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Failed to delete blog post')
    },
  })
}

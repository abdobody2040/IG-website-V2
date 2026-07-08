import { useEffect, useState } from 'react'
import { pb } from '../lib/pocketbase'

export interface PageRecord {
  id: string
  slug: string
  title_en: string
  title_ar: string
  content_en?: string
  content_ar?: string
  active: boolean
}

let _cache: Record<string, PageRecord | null> = {}
let _fetchPromises: Record<string, Promise<void> | null> = {}

async function loadPage(slug: string): Promise<void> {
  if (_cache[slug] !== undefined) return
  if (_fetchPromises[slug]) { await _fetchPromises[slug]; return }
  _fetchPromises[slug] = (async () => {
    try {
      const record = await pb.collection('pages').getFirstListItem<PageRecord>(`slug = "${slug}"`)
      _cache[slug] = record
    } catch {
      _cache[slug] = null // Page doesn't exist in DB
    }
  })()
  await _fetchPromises[slug]
}

export function invalidatePageCache(slug?: string): void {
  if (slug) {
    delete _cache[slug]
    delete _fetchPromises[slug]
  } else {
    _cache = {}
    _fetchPromises = {}
  }
}

export function usePageContent(slug: string): { page: PageRecord | null; loading: boolean; refresh: () => Promise<void> } {
  const [page, setPage] = useState<PageRecord | null>(_cache[slug] ?? null)
  const [loading, setLoading] = useState(_cache[slug] === undefined)

  const fetchAndSet = async () => {
    setLoading(true)
    await loadPage(slug)
    setPage(_cache[slug] ?? null)
    setLoading(false)
  }

  const refresh = async () => {
    invalidatePageCache(slug)
    await fetchAndSet()
  }

  useEffect(() => {
    if (_cache[slug] !== undefined) {
      setPage(_cache[slug] ?? null)
      setLoading(false)
      return
    }
    void fetchAndSet()
  }, [slug])

  return { page, loading, refresh }
}

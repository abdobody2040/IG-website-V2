import { useEffect, useState } from 'react'
import { pb } from '../lib/pocketbase'

export interface SiteContentRecord {
  key: string
  value_en: string
  value_ar: string
}

let _cache: Record<string, SiteContentRecord> | null = null
let _fetchPromise: Promise<void> | null = null

async function loadAllContent(): Promise<void> {
  if (_cache !== null) return
  if (_fetchPromise) { await _fetchPromise; return }
  _fetchPromise = (async () => {
    try {
      const records = await pb.collection('site_content').getFullList<SiteContentRecord & { id: string }>({ sort: 'key' })
      _cache = {}
      for (const r of records) {
        _cache[r.key] = { key: r.key, value_en: r.value_en ?? '', value_ar: r.value_ar ?? '' }
      }
    } catch {
      _cache = {}
    }
  })()
  await _fetchPromise
}

export function invalidateSiteContentCache(): void {
  _cache = null
  _fetchPromise = null
}

export function useSiteContent(): { content: Record<string, SiteContentRecord>; loading: boolean } {
  const [content, setContent] = useState<Record<string, SiteContentRecord>>(_cache ?? {})
  const [loading, setLoading] = useState(_cache === null)

  useEffect(() => {
    if (_cache !== null) { setContent(_cache); setLoading(false); return }
    loadAllContent().then(() => { setContent(_cache ?? {}); setLoading(false) })
  }, [])

  return { content, loading }
}

import { useEffect, useState } from 'react'
import { pb } from '../lib/pocketbase'
import { F6S_PERKS } from '../data/f6sPerks'

// Raw API record (snake_case, matching PHP + MySQL column names)
export interface PerkRecord {
  id: string
  title_en: string
  title_ar: string
  description_en: string
  description_ar: string
  partner_name: string | null
  discount_label: string | null
  promo_code: string | null
  cta_url: string | null
  cta_label_en: string | null
  cta_label_ar: string | null
  icon: string
  badge_en: string | null
  badge_ar: string | null
  color: string
  bg_color: string
  sort_order: number
  active: boolean
  logo_url?: string | null
  category?: string | null
  claim_type?: string | null
  offer_value?: string | null
  created: string
  updated: string
}

/** Fallback perks using verified F6S Software perks catalog (824 deals) */
export const FALLBACK_PERKS: PerkRecord[] = F6S_PERKS

// Module-level cache (persists across re-renders, cleared on invalidation)
let _cache: PerkRecord[] | null = null
let _fetchPromise: Promise<void> | null = null

async function loadPerks(): Promise<void> {
  if (_cache !== null && _cache.length > 0) return
  if (_fetchPromise) { await _fetchPromise; return }
  _fetchPromise = (async () => {
    try {
      const records = await pb.collection('perks').getFullList<PerkRecord>({
        sort: 'sort_order,title_en',
      })
      _cache = records && records.length > 0 ? records : FALLBACK_PERKS
    } catch (err) {
      console.error('Error fetching perks:', err)
      _cache = FALLBACK_PERKS
    } finally {
      _fetchPromise = null
    }
  })()
  await _fetchPromise
}

export function invalidatePerksCache(): void {
  _cache = null
  _fetchPromise = null
}

export function usePerks(): { perks: PerkRecord[]; loading: boolean; refresh: () => Promise<void> } {
  const [perks, setPerks] = useState<PerkRecord[]>(_cache ?? FALLBACK_PERKS)
  const [loading, setLoading] = useState(_cache === null)

  const fetchAndSet = async () => {
    setLoading(true)
    await loadPerks()
    setPerks(_cache ?? FALLBACK_PERKS)
    setLoading(false)
  }

  const refresh = async () => {
    invalidatePerksCache()
    await fetchAndSet()
  }

  useEffect(() => {
    if (_cache !== null && _cache.length > 0) {
      setPerks(_cache)
      setLoading(false)
      return
    }
    void fetchAndSet()
  }, [])

  return { perks, loading, refresh }
}

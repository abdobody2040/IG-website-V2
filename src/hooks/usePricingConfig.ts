import { useEffect, useState } from 'react'
import { pb } from '../lib/pocketbase'
import { PRICING_DATA } from '../config/pricing'

export interface PricingRecord {
  id: string
  region: 'us' | 'uk' | 'uae' | 'oman'
  plan: 'basic' | 'premium'
  price: number
  features_en: string[]
  features_ar: string[]
}

export interface PricingMap {
  us: { basic: PricingRecord | null; premium: PricingRecord | null }
  uk: { basic: PricingRecord | null; premium: PricingRecord | null }
  uae: { basic: PricingRecord | null; premium: PricingRecord | null }
  oman: { basic: PricingRecord | null; premium: PricingRecord | null }
}

const emptyMap = (): PricingMap => ({
  us: { basic: null, premium: null },
  uk: { basic: null, premium: null },
  uae: { basic: null, premium: null },
  oman: { basic: null, premium: null },
})

let _cache: PricingMap | null = null
let _fetchPromise: Promise<void> | null = null

async function loadPricing(): Promise<void> {
  if (_cache !== null) return
  if (_fetchPromise) { await _fetchPromise; return }
  _fetchPromise = (async () => {
    try {
      const records = await pb.collection('pricing_config').getFullList<PricingRecord>({ sort: 'region,plan' })
      const map = emptyMap()
      for (const r of records) {
        if (
          (r.region === 'us' || r.region === 'uk' || r.region === 'uae' || r.region === 'oman') &&
          (r.plan === 'basic' || r.plan === 'premium')
        ) {
          map[r.region][r.plan] = r
        }
      }
      _cache = map
    } catch {
      _cache = emptyMap()
    }
  })()
  await _fetchPromise
}

export function invalidatePricingCache(): void {
  _cache = null
  _fetchPromise = null
}

export function usePricingConfig(): { pricing: PricingMap; loading: boolean } {
  const [pricing, setPricing] = useState<PricingMap>(_cache ?? emptyMap())
  const [loading, setLoading] = useState(_cache === null)

  useEffect(() => {
    if (_cache !== null) { setPricing(_cache); setLoading(false); return }
    loadPricing().then(() => { setPricing(_cache ?? emptyMap()); setLoading(false) })
  }, [])

  return { pricing, loading }
}

/** Helper: get price from DB record or fall back to static config */
export function resolvePrice(record: PricingRecord | null, region: 'us' | 'uk' | 'uae' | 'oman', plan: 'basic' | 'premium'): number {
  if (record && typeof record.price === 'number') return record.price
  return PRICING_DATA[region][plan]
}

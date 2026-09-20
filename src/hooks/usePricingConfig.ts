import { useQuery, useQueryClient, type QueryClient } from '@tanstack/react-query'
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

// Module-level queryClient ref — set inside the hook so invalidatePricingCache() can call it
// outside of React component context (e.g., in AdminPriceEditorPage save handler)
let _queryClient: QueryClient | null = null

async function fetchPricing(): Promise<PricingMap> {
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
    return map
  } catch {
    return emptyMap()
  }
}

/** Call this after any admin save to pricing_config to instantly sync all consumers */
export function invalidatePricingCache(): void {
  _queryClient?.invalidateQueries({ queryKey: ['pricing'] })
}

export function usePricingConfig(): { pricing: PricingMap; loading: boolean } {
  const queryClient = useQueryClient()
  // Keep module-level ref up to date so invalidatePricingCache() works from outside hooks
  _queryClient = queryClient

  const { data, isLoading } = useQuery({
    queryKey: ['pricing'],
    queryFn: fetchPricing,
    staleTime: 1000 * 60 * 5, // 5 minutes — treated as fresh; admin invalidation forces a refetch
    gcTime: 1000 * 60 * 10,
  })

  return {
    pricing: data ?? emptyMap(),
    loading: isLoading,
  }
}

/** Helper: get price from DB record or fall back to static config */
export function resolvePrice(record: PricingRecord | null, region: 'us' | 'uk' | 'uae' | 'oman', plan: 'basic' | 'premium'): number {
  if (record && typeof record.price === 'number') return record.price
  return PRICING_DATA[region][plan]
}

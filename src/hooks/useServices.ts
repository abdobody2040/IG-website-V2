import { useEffect, useState } from 'react'
import { pb } from '../lib/pocketbase'

export interface ServiceRecord {
  id: string
  title_en: string
  title_ar: string
  description_en: string
  description_ar: string
  price: number
  period_en: string
  period_ar: string
  detail_en?: string
  detail_ar?: string
  badge_en?: string
  badge_ar?: string
  requires_company: boolean
  icon: string
  active: boolean
  sort_order?: number
  type: 'addon' | 'landing'
  color?: string
  bg_color?: string
  href?: string
  category?: string
}

let _cache: ServiceRecord[] | null = null
let _fetchPromise: Promise<void> | null = null

async function loadServices(): Promise<void> {
  if (_cache !== null) return
  if (_fetchPromise) { await _fetchPromise; return }
  _fetchPromise = (async () => {
    try {
      const records = await pb.collection('services').getFullList<ServiceRecord>({
        sort: 'sort_order,title_en'
      })
      _cache = records
    } catch (err) {
      console.error('Error fetching services:', err)
      _cache = []
    }
  })()
  await _fetchPromise
}

export function invalidateServicesCache(): void {
  _cache = null
  _fetchPromise = null
}

export function useServices(): { services: ServiceRecord[]; loading: boolean; refresh: () => Promise<void> } {
  const [services, setServices] = useState<ServiceRecord[]>(_cache ?? [])
  const [loading, setLoading] = useState(_cache === null)

  const fetchAndSet = async () => {
    setLoading(true)
    await loadServices()
    setServices(_cache ?? [])
    setLoading(false)
  }

  const refresh = async () => {
    invalidateServicesCache()
    await fetchAndSet()
  }

  useEffect(() => {
    if (_cache !== null) {
      setServices(_cache)
      setLoading(false)
      return
    }
    void fetchAndSet()
  }, [])

  return { services, loading, refresh }
}

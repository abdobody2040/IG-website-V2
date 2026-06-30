import { useState } from 'react'
import { pb } from '../lib/pocketbase'

export interface AddonService {
  id: string
  name: string
  description: string
  amount: number // USD
}

const CHECKOUT_ENDPOINT = import.meta.env.VITE_CHECKOUT_ENDPOINT as string | undefined

export function useServiceCheckout() {
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function checkout(service: AddonService) {
    setLoadingId(service.id)
    setError(null)

    try {
      const user = pb.authStore.model
      const token = pb.authStore.token
      const successUrl = `${window.location.origin}/client/payments`
      const cancelUrl = `${window.location.origin}/client/services`

      if (!CHECKOUT_ENDPOINT) {
        throw new Error('Checkout endpoint not configured. Please set VITE_CHECKOUT_ENDPOINT.')
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' }
      if (token) headers['Authorization'] = `Bearer ${token}`

      const res = await fetch(CHECKOUT_ENDPOINT, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          mode: 'addon',
          serviceName: service.name,
          serviceDescription: service.description,
          amount: service.amount,
          customerEmail: user?.['email'] ?? '',
          userId: user?.['id'] ?? '',
          companyId: '',
          companyName: '',
          successUrl,
          cancelUrl,
        }),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data.error ?? `Request failed (${res.status})`)
      }

      const { url } = await res.json()
      if (!url) throw new Error('No checkout URL returned')

      window.open(url, '_blank')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong'
      setError(msg)
      console.error('Service checkout error:', err)
    } finally {
      setLoadingId(null)
    }
  }

  return { checkout, loadingId, error, clearError: () => setError(null) }
}

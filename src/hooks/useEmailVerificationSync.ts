/**
 * useEmailVerificationSync
 *
 * Subscribes to the current user's PocketBase record via the realtime API.
 * When the admin verifies the user's email in the PocketBase dashboard, the
 * `verified` field change is pushed instantly to this hook, which then refreshes
 * the local authStore model so the UI reflects the correct verified status
 * without requiring the user to log out and back in. (Fixes B-001)
 *
 * Usage: Call once inside a layout or settings page component.
 */
import { useEffect } from 'react'
import { pb } from '../lib/pocketbase'

export function useEmailVerificationSync(): void {
  useEffect(() => {
    const userId = pb.authStore.record?.id
    if (!userId) return

    let unsubscribed = false

    pb.collection('users')
      .subscribe(userId, (event) => {
        if (unsubscribed) return
        // Only act on update events where `verified` has changed
        if (
          event.action === 'update' &&
          typeof event.record?.verified === 'boolean' &&
          event.record.verified !== pb.authStore.record?.verified
        ) {
          // Merge the updated verified value into the local authStore model
          pb.authStore.save(pb.authStore.token, {
            ...(pb.authStore.record as Record<string, unknown>),
            verified: event.record.verified,
          } as unknown as import('pocketbase').RecordModel)
        }
      })
      .catch((err: unknown) => {
        // Graceful degradation — realtime is optional; verified status updates on next login
        console.warn('[useEmailVerificationSync] Realtime subscription failed:', err)
      })

    return () => {
      unsubscribed = true
      pb.collection('users').unsubscribe(userId).catch(() => {})
    }
  }, [])
}

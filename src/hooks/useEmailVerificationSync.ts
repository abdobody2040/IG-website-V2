// src/hooks/useEmailVerificationSync.ts
// ──────────────────────────────────────────────────────────────────
// Polls the current user's `verified` field every 30 seconds and
// updates the local authStore when the admin verifies the account.
// Replaces the PocketBase SSE real-time subscription (Fixes B-001).
// ──────────────────────────────────────────────────────────────────

import { useEffect } from 'react'
import { pb } from '../lib/pocketbase'

const POLL_INTERVAL = 30_000 // 30 seconds

export function useEmailVerificationSync(): void {
  useEffect(() => {
    const userId = pb.authStore.record?.id
    if (!userId) return

    // If already verified — nothing to poll
    if (pb.authStore.record?.verified) return

    const check = async () => {
      try {
        const user = await pb.collection('users').getOne<{ verified: boolean }>(userId)
        const alreadyVerified = pb.authStore.record?.verified
        if (user.verified && !alreadyVerified && pb.authStore.model) {
          // Merge verified=true into local authStore model
          pb.authStore.save(pb.authStore.token!, {
            ...pb.authStore.model,
            verified: true,
          })
        }
      } catch {
        // Non-critical — ignore
      }
    }

    const id = setInterval(check, POLL_INTERVAL)
    return () => clearInterval(id)
  }, [])
}

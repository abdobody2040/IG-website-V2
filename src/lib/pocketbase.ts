import PocketBase from 'pocketbase'

const pbUrl = import.meta.env.VITE_PB_URL

if (!pbUrl) {
  throw new Error('Missing VITE_PB_URL environment variable')
}

/**
 * Singleton PocketBase client.
 * Session is automatically persisted in localStorage by the PocketBase JS SDK.
 */
export const pb = new PocketBase(pbUrl)

// Keep token fresh — PocketBase SDK handles refresh automatically when autoRefreshThreshold is set
pb.autoCancellation(false)

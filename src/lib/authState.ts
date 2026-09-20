
import { pb } from './pocketbase'

export interface AuthInfo {
  userId: string | null
  role: string | null
  ready: boolean
}

let authInfo: AuthInfo = { userId: null, role: null, ready: false }
let readyResolve: (() => void) | null = null
const readyPromise = new Promise<void>((resolve) => { readyResolve = resolve })

function syncFromStore() {
  const model = pb.authStore.model
  if (pb.authStore.isValid && model) {
    authInfo.userId = model.id
    authInfo.role = model.role ?? 'client'
  } else {
    authInfo.userId = null
    authInfo.role = null
  }
  authInfo.ready = true
  readyResolve?.()
}

// Initialise synchronously from localStorage-restored session
syncFromStore()

// Keep in sync on auth changes (login, logout, token refresh)
pb.authStore.onChange(() => syncFromStore())

export function getAuthInfo(): AuthInfo {
  return authInfo
}

export function updateAuthRole(role?: string): void {
  if (role) authInfo.role = role
}

export function waitForAuthReady(): Promise<void> {
  if (authInfo.ready) return Promise.resolve()
  return readyPromise
}

import { pb } from './pocketbase'

export interface AuthInfo {
  userId: string | null
  role: string | null
  ready: boolean
}

let authInfo: AuthInfo = { userId: null, role: null, ready: false }
let readyResolve: (() => void) | null = null
const readyPromise = new Promise<void>((resolve) => { readyResolve = resolve })

// Initialize from persisted PocketBase session (synchronous — SDK loads from localStorage)
if (pb.authStore.isValid && pb.authStore.model) {
  authInfo.userId = pb.authStore.model.id
  authInfo.role = pb.authStore.model.email === 'instantgrow.net@gmail.com' ? 'admin' : ((pb.authStore.model['role'] as string) ?? 'client')
  authInfo.ready = true
  readyResolve!()
} else {
  authInfo.ready = true
  readyResolve!()
}

// Listen for auth state changes (login, logout, token refresh)
pb.authStore.onChange((token, model) => {
  if (token && model) {
    authInfo.userId = model.id
    authInfo.role = model.email === 'instantgrow.net@gmail.com' ? 'admin' : ((model['role'] as string) ?? 'client')
  } else {
    authInfo.userId = null
    authInfo.role = null
  }
  authInfo.ready = true
})

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

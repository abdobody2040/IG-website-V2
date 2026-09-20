
import { useState, useEffect } from 'react'
import { pb, type AuthModel } from "../lib/pocketbase";
import { updateAuthRole } from '../lib/authState'

export interface AppUser {
  id: string
  email?: string
  displayName?: string
  avatarUrl?: string
  role?: string
  phone?: string
  emailVerified?: boolean
  metadata?: string
}

interface AuthState {
  user: AppUser | null
  isLoading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
}

function mapUser(model: AuthModel): AppUser {
  return {
    id: model.id,
    email: model.email,
    displayName: model.display_name ?? model.name ?? model.email?.split('@')[0],
    avatarUrl: model.avatar_url ?? undefined,
    role: model.role ?? 'client',
    phone: model.phone,
    emailVerified: model.verified ?? false,
    metadata: undefined,
  }
}

/** Update last_sign_in (fire-and-forget, once per browser session) */
async function syncLastSignIn(userId: string): Promise<void> {
  const key = `ig_last_signin_${userId}`
  if (sessionStorage.getItem(key)) return
  try {
    await pb.collection('users').update(userId, { last_sign_in: new Date().toISOString() })
    sessionStorage.setItem(key, '1')
  } catch { /* non-critical */ }
}

export function useAuth(): AuthState {
  // On page refresh: if auth store has a valid (non-expired) token,
  // pre-populate the user immediately so we never flash "logged out".
  const initialUser = (pb.authStore.isValid && pb.authStore.model)
    ? mapUser(pb.authStore.model)
    : null

  const [user, setUser] = useState<AppUser | null>(initialUser)
  // Only show loading when there's no stored valid session
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Sync role into authState immediately from stored model
    if (pb.authStore.isValid && pb.authStore.model) {
      const appUser = mapUser(pb.authStore.model)
      updateAuthRole(appUser.role)
      setUser(appUser)
      syncLastSignIn(appUser.id)
    } else {
      setUser(null)
    }

    const unsubscribe = pb.authStore.onChange((_token, model) => {
      if (model) {
        const appUser = mapUser(model)
        updateAuthRole(appUser.role)
        setUser(appUser)
        syncLastSignIn(appUser.id)
      } else {
        setUser(null)
      }
      setIsLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signOut = async (): Promise<void> => {
    pb.authStore.clear()
    setUser(null)
  }

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    signOut,
  }
}

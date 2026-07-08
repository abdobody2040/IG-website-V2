import { useState, useEffect } from 'react'
import { pb } from '../lib/pocketbase'
import { updateAuthRole } from '../lib/authState'
import type { RecordModel } from 'pocketbase'

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

function mapUser(model: RecordModel): AppUser {
  const email = model['email'] as string | undefined
  const role = (model['role'] as string | undefined) ?? 'client'
  return {
    id: model.id,
    email,
    displayName: (model['display_name'] as string | undefined) ?? email?.split('@')[0],
    avatarUrl: model['avatar']
      ? pb.files.getURL(model, model['avatar'] as string)
      : (model['avatar_url'] as string | undefined),
    role,
    phone: model['phone'] as string | undefined,
    emailVerified: (model['verified'] as boolean | undefined) ?? false,
    metadata: model['metadata'] as string | undefined,
  }
}

/**
 * Update last_sign_in for the current user in PocketBase.
 * Uses sessionStorage to fire only once per browser session, preventing
 * redundant writes and loops when authStore changes fire on refresh.
 */
async function syncLastSignIn(userId: string): Promise<void> {
  const sessionKey = `pb_last_signin_${userId}`
  if (sessionStorage.getItem(sessionKey)) return
  try {
    await pb.collection('users').update(userId, {
      last_sign_in: new Date().toISOString(),
    })
    sessionStorage.setItem(sessionKey, '1')
  } catch {
    // Non-critical - don't block auth flow if this update fails
  }
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AppUser | null>(() => {
    if (pb.authStore.isValid && pb.authStore.model) {
      return mapUser(pb.authStore.model as RecordModel)
    }
    return null
  })
  const [isLoading, setIsLoading] = useState(!pb.authStore.isValid)

  useEffect(() => {
    if (pb.authStore.isValid && pb.authStore.model) {
      const appUser = mapUser(pb.authStore.model as RecordModel)
      updateAuthRole(appUser.role)
      setUser(appUser)
      setIsLoading(false)
      syncLastSignIn(appUser.id)
    } else {
      setIsLoading(false)
    }

    const unsubscribe = pb.authStore.onChange((_token, model) => {
      if (model) {
        const appUser = mapUser(model as RecordModel)
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

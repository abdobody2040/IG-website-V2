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
}

interface AuthState {
  user: AppUser | null
  isLoading: boolean
  isAuthenticated: boolean
  signOut: () => Promise<void>
}

const ADMIN_EMAIL = 'instantgrow.net@gmail.com'

function mapUser(model: RecordModel): AppUser {
  const email = model['email'] as string | undefined
  const rawRole = (model['role'] as string | undefined) ?? 'client'
  const role = email === ADMIN_EMAIL ? 'admin' : rawRole
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
  }
}

export function useAuth(): AuthState {
  const [user, setUser] = useState<AppUser | null>(() => {
    // Initialize synchronously from persisted PocketBase session
    if (pb.authStore.isValid && pb.authStore.model) {
      return mapUser(pb.authStore.model as RecordModel)
    }
    return null
  })
  const [isLoading, setIsLoading] = useState(!pb.authStore.isValid)

  useEffect(() => {
    // If we already have a valid session from localStorage, mark as ready
    if (pb.authStore.isValid && pb.authStore.model) {
      const appUser = mapUser(pb.authStore.model as RecordModel)
      updateAuthRole(appUser.role)
      setUser(appUser)
      setIsLoading(false)
    } else {
      setIsLoading(false)
    }

    // Subscribe to future auth changes (login, logout, token refresh)
    const unsubscribe = pb.authStore.onChange((_token, model) => {
      if (model) {
        const appUser = mapUser(model as RecordModel)
        updateAuthRole(appUser.role)
        setUser(appUser)
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

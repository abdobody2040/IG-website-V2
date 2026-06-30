import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { useAuth } from './useAuth'

/**
 * Redirects unauthenticated users to /auth/login.
 * Returns auth state so pages can show loading spinner.
 */
export function useRequireAuth() {
  const auth = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      navigate({ to: '/auth/login' })
    }
  }, [auth.isLoading, auth.isAuthenticated, navigate])

  return auth
}

/**
 * Redirects non-admins to /client/dashboard.
 */
export function useRequireAdmin() {
  const auth = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!auth.isLoading) {
      if (!auth.isAuthenticated) {
        navigate({ to: '/auth/login' })
      } else if (auth.user?.role !== 'admin') {
        navigate({ to: '/client/dashboard' })
      }
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.user?.role, navigate])

  return auth
}

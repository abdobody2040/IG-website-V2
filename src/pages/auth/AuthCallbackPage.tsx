import { useEffect } from 'react'
import { useNavigate } from '@tanstack/react-router'
import { pb } from '../../lib/pocketbase'

/**
 * AuthCallbackPage — handles PocketBase OAuth2 redirect callback.
 *
 * PocketBase's authWithOAuth2 (popup mode, used in LoginPage) resolves in the popup
 * and doesn't need this page. However, if redirect mode is used (mobile/PWA fallback),
 * PocketBase appends ?state= and ?code= params — the SDK handles these automatically.
 *
 * This page simply waits for the SDK to finish, then redirects based on role.
 */
export default function AuthCallbackPage() {
  const navigate = useNavigate()

  useEffect(() => {
    // Give SDK a moment to process any OAuth callback params
    const check = () => {
      if (pb.authStore.isValid && pb.authStore.model) {
        const role = (pb.authStore.model['role'] as string) ?? 'client'
        if (role === 'admin') {
          navigate({ to: '/admin' })
        } else {
          navigate({ to: '/client/dashboard' })
        }
      } else {
        // No valid session — redirect to login
        navigate({ to: '/auth/login' })
      }
    }

    // Short delay to allow SDK to process URL params
    const timer = setTimeout(check, 500)
    return () => clearTimeout(timer)
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center space-y-4">
        <span className="w-10 h-10 border-2 border-[#1a56ff]/30 border-t-[#1a56ff] rounded-full animate-spin block mx-auto" />
        <p className="text-slate-500 text-sm">Completing sign-in…</p>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { pb } from '../../lib/pocketbase'
import { AuthPanel } from './AuthPanel'
import { AuthInput } from './AuthInput'
import { useLang } from '../../i18n/LanguageContext'

interface LoginForm {
  email: string
  password: string
}

export default function LoginPage() {
  const { t } = useLang()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>()

  const onSubmit = async ({ email, password }: LoginForm) => {
    setServerError('')
    try {
      const authData = await pb.collection('users').authWithPassword(email, password)
      const role = (authData.record['role'] as string) ?? 'client'
      if (role === 'admin') {
        navigate({ to: '/admin' })
      } else {
        navigate({ to: '/client/dashboard' })
      }
    } catch {
      setServerError('Invalid email or password.')
    }
  }

  const handleGoogleLogin = async () => {
    setServerError('')
    try {
      // PocketBase OAuth2 — opens a popup and resolves with the auth data
      await pb.collection('users').authWithOAuth2({ provider: 'google' })
      const role = (pb.authStore.model?.['role'] as string) ?? 'client'
      if (role === 'admin') {
        navigate({ to: '/admin' })
      } else {
        navigate({ to: '/client/dashboard' })
      }
    } catch {
      setServerError('Sign-in failed. Please try again.')
    }
  }


  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
      <AuthPanel />

      <div className="flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex lg:hidden items-center gap-2.5 mb-2">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs"
              style={{ background: '#1a56ff' }}
            >
              IG
            </div>
            <span className="font-semibold text-slate-900">Instant Grow</span>
          </div>

          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-slate-900">{t.auth.welcomeBack}</h1>
            <p className="text-slate-500 text-sm">{t.auth.signInSubtitle}</p>
          </div>

          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-3 rounded-xl py-3 px-4 border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            {t.auth.continueWithGoogle}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-slate-50 px-3 text-slate-400">{t.auth.orSignInWithEmail}</span></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <AuthInput
              label={t.auth.emailLabel}
              type="email"
              placeholder={t.auth.emailPlaceholder}
              error={errors.email?.message}
              {...register('email', {
                required: t.auth.emailRequired,
                pattern: { value: /^\S+@\S+\.\S+$/, message: t.auth.validEmail },
              })}
            />

            <AuthInput
              label={t.auth.passwordLabel}
              type="password"
              placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
              error={errors.password?.message}
              {...register('password', { required: t.auth.passwordRequired })}
            />
            <div className="text-right -mt-3">
              <Link to="/auth/forgot-password" className="text-xs font-medium" style={{ color: '#1a56ff' }}>{t.auth.forgotPassword}</Link>
            </div>

            {serverError && (
              <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">
                {serverError}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl py-3 px-4 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
              style={{ background: '#1a56ff' }}
              onMouseEnter={e => { if (!isSubmitting) (e.currentTarget as HTMLButtonElement).style.background = '#1240d6' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1a56ff' }}
            >
              {isSubmitting ? (
                <>
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {t.auth.signingIn}
                </>
              ) : (
                t.auth.signIn
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            {t.auth.noAccount}{' '}
            <Link to="/auth/signup" className="font-semibold" style={{ color: '#1a56ff' }}>
              {t.auth.createOne}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { pb } from '../../lib/pocketbase'
import { AuthPanel } from './AuthPanel'
import { AuthInput } from './AuthInput'
import { Loader2, CheckCircle, XCircle } from 'lucide-react'
import { useInvitationByToken } from '../../hooks/useInvitations'
import { useLang } from '../../i18n/LanguageContext'

interface SignupForm {
  fullName: string
  email: string
  password: string
}

function useInviteToken() {
  const [params] = useState(() => new URLSearchParams(window.location.search))
  return params.get('invite')
}

export default function SignupPage() {
  const { t } = useLang()
  const navigate = useNavigate()
  const [serverError, setServerError] = useState('')
  const inviteToken = useInviteToken()
  const { data: invitation, isLoading: inviteLoading } = useInvitationByToken(inviteToken)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<SignupForm>()

  useEffect(() => {
    if (invitation?.email) {
      setValue('email', invitation.email)
    }
  }, [invitation, setValue])

  const onSubmit = async ({ fullName, email, password }: SignupForm) => {
    setServerError('')
    try {
      // Create user in PocketBase
      await pb.collection('users').create({
        email,
        password,
        passwordConfirm: password,
        display_name: fullName,
        role: 'client',
      })

      // Sign in immediately after creation
      await pb.collection('users').authWithPassword(email, password)

      // Request email verification (PocketBase sends verification email)
      await pb.collection('users').requestVerification(email)

      // Accept invitation if token present
      if (inviteToken) {
        try {
          await pb.collection('invitations').update(inviteToken, { accepted: true })
        } catch { /* ignore invite errors */ }
      }

      const role = (pb.authStore.model?.['role'] as string) ?? 'client'
      if (role === 'admin') {
        navigate({ to: '/admin' })
      } else {
        navigate({ to: '/client/dashboard' })
      }

    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not create account. Please try again.'
      setServerError(msg)
    }
  }

  const handleGoogleSignup = async () => {
    setServerError('')
    try {
      await pb.collection('users').authWithOAuth2({ provider: 'google' })
      const role = (pb.authStore.model?.['role'] as string) ?? 'client'
      if (role === 'admin') {
        navigate({ to: '/admin' })
      } else {
        navigate({ to: '/client/dashboard' })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Google sign-up failed.'
      setServerError(msg)
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
            <h1 className="text-2xl font-bold text-slate-900">{t.auth.createAccount}</h1>
            <p className="text-slate-500 text-sm">{t.auth.signupSubtitle}</p>
          </div>

          {inviteToken && (
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
              {inviteLoading ? (
                <Loader2 size={16} className="animate-spin text-blue-500 mt-0.5" />
              ) : invitation ? (
                <>
                  <CheckCircle size={16} className="text-blue-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-slate-900">{t.auth.youAreInvited}</p>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {t.auth.signUpWithEmail} <span className="font-medium">{invitation.email}</span>
                      {invitation.companyName ? ` ${t.auth.toJoinCompany.replace('{company}', invitation.companyName)}` : ''}. {t.auth.emailPrefilled}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <XCircle size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium text-red-700">{t.auth.invalidInvitation}</p>
                    <p className="text-xs text-red-600 mt-0.5">{t.auth.contactAdmin}</p>
                  </div>
                </>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={handleGoogleSignup}
            className="w-full flex items-center justify-center gap-3 rounded-xl py-3 px-4 border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
            {t.auth.continueWithGoogle}
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200" /></div>
            <div className="relative flex justify-center text-xs"><span className="bg-slate-50 px-3 text-slate-400">{t.auth.orSignUpWithEmail}</span></div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <AuthInput
              label={t.auth.fullNameLabel}
              type="text"
              placeholder={t.auth.fullNamePlaceholder}
              error={errors.fullName?.message}
              {...register('fullName', {
                required: t.auth.nameRequired,
                minLength: { value: 2, message: t.auth.nameMinLength },
              })}
            />

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
              placeholder={t.auth.passwordPlaceholder}
              error={errors.password?.message}
              {...register('password', {
                required: t.auth.passwordRequired,
                minLength: { value: 8, message: t.auth.passwordMinLength },
                validate: (value) => {
                  if (!/[A-Z]/.test(value)) return t.auth.passwordUppercase
                  if (!/[a-z]/.test(value)) return t.auth.passwordLowercase
                  if (!/[0-9]/.test(value)) return t.auth.passwordNumber
                  if (!/[^A-Za-z0-9]/.test(value)) return t.auth.passwordSpecial
                  return true
                },
              })}
            />

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
                  {t.auth.creatingAccount}
                </>
              ) : (
                t.auth.createAccountButton
              )}
            </button>
          </form>

          <p className="text-center text-sm text-slate-500">
            {t.auth.alreadyHaveAccount}{' '}
            <Link to="/auth/login" className="font-semibold" style={{ color: '#1a56ff' }}>
              {t.auth.signInLink}
            </Link>
          </p>

          <p className="text-center text-xs text-slate-400 leading-relaxed">
            {t.auth.agreeTermsSignup}{' '}
            <a href="#" className="underline">{t.auth.termsOfService}</a> and{' '}
            <a href="#" className="underline">{t.auth.privacyPolicy}</a>.
          </p>
        </div>
      </div>
    </div>
  )
}

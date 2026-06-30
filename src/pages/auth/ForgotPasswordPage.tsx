import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { useForm } from 'react-hook-form'
import { pb } from '../../lib/pocketbase'
import { AuthPanel } from './AuthPanel'
import { AuthInput } from './AuthInput'
import { useLang } from '../../i18n/LanguageContext'

interface ForgotForm { email: string }

export default function ForgotPasswordPage() {
  const { t } = useLang()
  const [sent, setSent] = useState(false)
  const [serverError, setServerError] = useState('')
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotForm>()

  const onSubmit = async ({ email }: ForgotForm) => {
    setServerError('')
    try {
      await pb.collection('users').requestPasswordReset(email)
      setSent(true)
    } catch {
      setServerError(t.auth.forgotError)
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
      <AuthPanel />
      <div className="flex items-center justify-center bg-slate-50 px-6 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="flex lg:hidden items-center gap-2.5 mb-2">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-xs" style={{ background: '#1a56ff' }}>IG</div>
            <span className="font-semibold text-slate-900">Instant Grow</span>
          </div>

          {sent ? (
            <div className="space-y-6">
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-slate-900">{t.auth.checkEmail}</h1>
                <p className="text-slate-500 text-sm">{t.auth.checkEmailDesc}</p>
              </div>
              <Link to="/auth/login" className="block text-center w-full rounded-xl py-3 px-4 text-white font-semibold text-sm" style={{ background: '#1a56ff' }}>
                {t.auth.backToSignIn}
              </Link>
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-slate-900">{t.auth.forgotHeading}</h1>
                <p className="text-slate-500 text-sm">{t.auth.forgotSubtitle}</p>
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

                {serverError && (
                  <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{serverError}</div>
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
                    <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t.auth.sending}</>
                  ) : t.auth.sendResetLink}
                </button>
              </form>

              <p className="text-center text-sm text-slate-500">
                {t.auth.rememberPassword}{' '}
                <Link to="/auth/login" className="font-semibold" style={{ color: '#1a56ff' }}>{t.auth.signInLink}</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

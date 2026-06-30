import { useState, useEffect } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { pb } from '../../lib/pocketbase'
import { AuthPanel } from './AuthPanel'
import { useLang } from '../../i18n/LanguageContext'

export default function ResetPasswordPage() {
  const { t } = useLang()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // PocketBase password reset token arrives in URL search params (?token=...)
    const params = new URLSearchParams(window.location.search)
    const token = params.get('token')
    let timeout: any
    if (token) {
      setReady(true)
    } else if (pb.authStore.isValid) {
      // Already authenticated (e.g., page refresh after valid link)
      setReady(true)
    } else {
      timeout = setTimeout(() => {
        setError(t.auth.invalidResetLink)
      }, 3000)
    }
    return () => {
      if (timeout) clearTimeout(timeout)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    if (password.length < 8) { setError(t.auth.passwordMin6); return }
    if (password !== confirm) { setError(t.auth.passwordsDoNotMatch); return }
    setSaving(true)
    try {
      const params = new URLSearchParams(window.location.search)
      const token = params.get('token') ?? ''
      await pb.collection('users').confirmPasswordReset(token, password, password)
      pb.authStore.clear()
      navigate({ to: '/auth/login' })
    } catch {
      setError(t.auth.resetError)
    } finally { setSaving(false) }
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

          {!ready && !error ? (
            <div className="flex justify-center py-12">
              <span className="w-8 h-8 border-2 border-[#1a56ff]/30 border-t-[#1a56ff] rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="space-y-1">
                <h1 className="text-2xl font-bold text-slate-900">{t.auth.setNewPassword}</h1>
                <p className="text-slate-500 text-sm">{t.auth.resetSubtitle}</p>
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-600">{error}</div>
              )}

              {ready && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">{t.auth.newPasswordLabel}</label>
                    <input
                      type="password" value={password} onChange={e => setPassword(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 bg-white outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                      placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-sm font-medium text-slate-700">{t.auth.confirmPasswordLabel}</label>
                    <input
                      type="password" value={confirm} onChange={e => setConfirm(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-900 placeholder-slate-400 bg-white outline-none transition-all duration-200 focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
                      placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022"
                    />
                  </div>
                  <button
                    type="submit" disabled={saving}
                    className="w-full rounded-xl py-3 px-4 text-white font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-70"
                    style={{ background: '#1a56ff' }}
                    onMouseEnter={e => { if (!saving) (e.currentTarget as HTMLButtonElement).style.background = '#1240d6' }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#1a56ff' }}
                  >
                    {saving ? (
                      <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> {t.auth.resetting}</>
                    ) : t.auth.resetPassword}
                  </button>
                </form>
              )}

              <p className="text-center text-sm text-slate-500">
                <Link to="/auth/login" className="font-semibold" style={{ color: '#1a56ff' }}>{t.auth.backToSignIn}</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

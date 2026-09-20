import { useState, useEffect } from 'react'
import { User, Bell, Shield, Trash2, Download, Loader2 } from 'lucide-react'
import ClientLayout from './ClientLayout'
import { pb } from '../../lib/pocketbase'
import { useAuth } from '../../hooks/useAuth'
import { useLang } from '../../i18n/LanguageContext'
import { useEmailVerificationSync } from '../../hooks/useEmailVerificationSync'
import toast from 'react-hot-toast'

interface NotifPrefs {
  emailNotifications: boolean
  documentUpdates: boolean
  paymentReminders: boolean
  marketingEmails: boolean
}

function Toggle({
  label,
  description,
  checked,
  onChange,
}: {
  label: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none flex-shrink-0 ${
          checked ? 'bg-[#1a56ff]' : 'bg-slate-200'
        }`}
      >
        <span className={`inline-block w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
      </button>
    </div>
  )
}

export default function ClientSettingsPage() {
  const { t } = useLang()
  const sp = t.client.settingsPage
  const { user } = useAuth()
  // Sync email verification status in real-time when admin verifies account (B-001)
  useEmailVerificationSync()
  const [saving, setSaving] = useState(false)
  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')

  const [prefs, setPrefs] = useState<NotifPrefs>({
    emailNotifications: true,
    documentUpdates: true,
    paymentReminders: true,
    marketingEmails: false,
  })

  useEffect(() => {
    if (!user) return
    setDisplayName(user.displayName ?? '')
    
    try {
      const meta = typeof user.metadata === 'string' 
        ? JSON.parse(user.metadata || '{}') 
        : (user.metadata || {})
        
      if (meta.prefs) {
        setPrefs(meta.prefs)
      }
    } catch (e) {
      // Ignore parse error
    }
  }, [user])

  const handleSave = async () => {
    if (!user?.id) return
    setSaving(true)
    try {
      const updates: Record<string, any> = {}
      if (displayName && displayName !== user.displayName) {
        updates.display_name = displayName
      }
      
      const currentMetadata = typeof user.metadata === 'string' 
        ? JSON.parse(user.metadata || '{}') 
        : (user.metadata || {})
        
      const newMetadata = { ...currentMetadata, prefs }
      
      if (JSON.stringify(currentMetadata.prefs) !== JSON.stringify(prefs)) {
        updates.metadata = JSON.stringify(newMetadata)
      }
      
      if (Object.keys(updates).length > 0) {
        await pb.collection('users').update(user.id, updates)
      }
      toast.success(sp.saved)
    } catch (err) {
      console.error('Operation failed:', err)
      toast.error(sp.saveFailed)
    } finally {
      setSaving(false)
    }
  }

  return (
    <ClientLayout currentPath="/client/settings" title={t.client.nav.settings}>
      <div className="max-w-4xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">{t.client.nav.settings}</h2>
          <p className="text-slate-500 text-sm mt-0.5">{sp.subtitle}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
                <User size={15} className="text-[#1a56ff]" />
                <h3 className="text-base font-semibold text-slate-900">{sp.profileInfo}</h3>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{sp.fullName}</label>
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    placeholder={sp.fullName}
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/30 focus:border-[#1a56ff]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{sp.emailAddress}</label>
                  <div className="flex items-center gap-3">
                    <input
                      type="email"
                      value={user?.email ?? ''}
                      disabled
                      className="flex-1 border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-slate-50 text-slate-400 cursor-not-allowed"
                    />
                    {user?.emailVerified ? (
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-green-600 bg-green-50 px-2.5 py-1.5 rounded-lg border border-green-200">
                        <Shield size={14} />
                        Verified
                      </span>
                    ) : (
                      <button
                        onClick={async () => {
                          if (user?.email) {
                            try {
                              await pb.collection('users').requestVerification(user.email);
                              toast.success('Verification email sent!');
                            } catch (e) {
                              console.error('Operation failed:', e)
                              toast.error('Failed to send verification email.');
                            }
                          }
                        }}
                        className="flex-shrink-0 text-xs font-semibold text-[#1a56ff] bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors border border-blue-200"
                      >
                        Verify Email
                      </button>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">{sp.phoneNumber}</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="w-full border border-slate-200 rounded-lg px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/30 focus:border-[#1a56ff]"
                  />
                </div>
                <div className="flex justify-end pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#1a56ff] text-white text-sm font-semibold rounded-xl hover:bg-[#3a76ff] transition-colors disabled:opacity-60"
                  >
                    {saving && <Loader2 size={14} className="animate-spin" />}
                    {sp.saveChanges}
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
                <Shield size={15} className="text-[#1a56ff]" />
                <h3 className="text-base font-semibold text-slate-900">{sp.security}</h3>
              </div>
              <div className="p-5 space-y-4">
                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    if (!user?.id) return
                    const formData = new FormData(e.currentTarget)
                    const oldPassword = formData.get('oldPassword') as string
                    const password = formData.get('newPassword') as string
                    const passwordConfirm = formData.get('confirmPassword') as string
                    if (password !== passwordConfirm) {
                      toast.error(t.auth.passwordsDoNotMatch || 'Passwords do not match')
                      return
                    }
                    if (password.length < 8) {
                      toast.error('Password must be at least 8 characters')
                      return
                    }
                    try {
                      await pb.collection('users').update(user.id, {
                        oldPassword,
                        password,
                        passwordConfirm,
                      })
                      toast.success('Password updated successfully')
                      ;(e.target as HTMLFormElement).reset()
                    } catch (err: any) {
                      toast.error(err?.message || 'Failed to update password')
                    }
                  }}
                  className="space-y-3"
                >
                  <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1">Change Password</p>
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Current Password</label>
                    <input
                      type="password"
                      name="oldPassword"
                      required
                      placeholder="••••••••"
                      className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/30 focus:border-[#1a56ff]"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">New Password</label>
                      <input
                        type="password"
                        name="newPassword"
                        required
                        minLength={8}
                        placeholder="••••••••"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/30 focus:border-[#1a56ff]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-slate-600 mb-1">Confirm New Password</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        required
                        minLength={8}
                        placeholder="••••••••"
                        className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/30 focus:border-[#1a56ff]"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors"
                    >
                      Update Password
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-slate-100">
                <Bell size={15} className="text-[#1a56ff]" />
                <h3 className="text-base font-semibold text-slate-900">{sp.notifications}</h3>
              </div>
              <div className="p-5 space-y-5">
                <Toggle
                  label={sp.emailNotifs}
                  description={sp.emailNotifsDesc}
                  checked={prefs.emailNotifications}
                  onChange={v => setPrefs(p => ({ ...p, emailNotifications: v }))}
                />
                <Toggle
                  label={sp.docUpdates}
                  description={sp.docUpdatesDesc}
                  checked={prefs.documentUpdates}
                  onChange={v => setPrefs(p => ({ ...p, documentUpdates: v }))}
                />
                <Toggle
                  label={sp.paymentReminders}
                  description={sp.paymentRemindersDesc}
                  checked={prefs.paymentReminders}
                  onChange={v => setPrefs(p => ({ ...p, paymentReminders: v }))}
                />
                <Toggle
                  label={sp.marketingEmails}
                  description={sp.marketingEmailsDesc}
                  checked={prefs.marketingEmails}
                  onChange={v => setPrefs(p => ({ ...p, marketingEmails: v }))}
                />
              </div>
            </div>

            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100">
                <h3 className="text-base font-semibold text-slate-900">{sp.privacy}</h3>
              </div>
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{sp.dataExport}</p>
                    <p className="text-xs text-slate-500">{sp.dataExportDesc}</p>
                  </div>
                  <button
                    onClick={async () => {
                      if (!user?.id) return
                      try {
                        const orders = await pb.collection('orders').getList(1, 100, { filter: `user = "${user.id}"` })
                        const docs = await pb.collection('documents').getList(1, 100, { filter: `user = "${user.id}"` })
                        const exportObj = {
                          user: { id: user.id, email: user.email, name: user.displayName },
                          orders: orders.items,
                          documents: docs.items,
                        }
                        const blob = new Blob([JSON.stringify(exportObj, null, 2)], { type: 'application/json' })
                        const url = URL.createObjectURL(blob)
                        const a = document.createElement('a')
                        a.href = url
                        a.download = `instant_grow_data_${user.id}.json`
                        a.click()
                        URL.revokeObjectURL(url)
                        toast.success('Data exported successfully')
                      } catch (err) {
                        console.error('Operation failed:', err)
                        toast.error('Failed to export data')
                      }
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-[#1a56ff] hover:underline"
                  >
                    <Download size={12} />
                    {sp.export}
                  </button>
                </div>
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-red-600">{sp.deleteAccount}</p>
                      <p className="text-xs text-slate-500">{sp.deleteAccountDesc}</p>
                    </div>
                    <button
                      onClick={async () => {
                        if (!user?.id) return
                        const confirmed = window.confirm('Are you sure you want to request account deletion? This action cannot be undone.')
                        if (!confirmed) return
                        try {
                          await pb.collection('notifications').create({
                            user: user.id,
                            type: 'admin_message',
                            title: 'Account Deletion Requested',
                            message: `User ${user.email} requested account deletion.`,
                          })
                          toast.success('Account deletion request submitted. Support will contact you within 24h.')
                        } catch (err) {
                          console.error('Operation failed:', err)
                          toast.error('Failed to submit request')
                        }
                      }}
                      className="flex items-center gap-1.5 text-xs font-semibold text-white bg-red-500 hover:bg-red-600 transition-colors px-3 py-1.5 rounded-lg"
                    >
                      <Trash2 size={11} />
                      {sp.delete}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ClientLayout>
  )
}

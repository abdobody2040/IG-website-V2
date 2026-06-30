import { useState, useEffect } from 'react'
import { Settings, CheckCircle, Loader2, Bell, Shield } from 'lucide-react'
import { pb } from '../../lib/pocketbase'
import { useAuth } from '../../hooks/useAuth'
import { useRequireAdmin } from '../../hooks/useRequireAuth'
import toast from 'react-hot-toast'

interface AdminNotifPrefs {
  adminNewOrder: boolean
  adminPaymentFailed: boolean
  adminStatusChanged: boolean
  orderStatusChanged: boolean
  emailNotifications: boolean
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
    <label className="flex items-start gap-4 cursor-pointer">
      <div className="relative mt-0.5 flex-shrink-0" onClick={() => onChange(!checked)}>
        <div className={`w-11 h-6 rounded-full transition-colors duration-200 ${checked ? 'bg-[#1a56ff]' : 'bg-slate-200'}`} />
        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-200 ${checked ? 'translate-x-5' : ''}`} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-slate-900">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
    </label>
  )
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100">
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  )
}

function Field({ label, type = 'text', defaultValue }: { label: string; type?: string; defaultValue: string }) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 mb-1.5">{label}</label>
      <input
        type={type}
        defaultValue={defaultValue}
        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a56ff] focus:border-transparent"
      />
    </div>
  )
}

export default function AdminSettingsPage() {
  const { isLoading: authLoading } = useRequireAdmin()
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [prefId, setPrefId] = useState<string | null>(null)

  const [prefs, setPrefs] = useState<AdminNotifPrefs>({
    adminNewOrder: true,
    adminPaymentFailed: true,
    adminStatusChanged: false,
    orderStatusChanged: true,
    emailNotifications: true,
  })

  useEffect(() => {
    if (!user?.id) return
    const load = async () => {
      try {
        const existing = await pb.collection('notification_preferences').getList(1, 1, {
          filter: `user = "${user.id}"`,
        })
        if (existing.items && existing.items.length > 0) {
          const p = existing.items[0] as unknown as Record<string, unknown>
          setPrefId(p.id as string)
          setPrefs({
            adminNewOrder: !!p.admin_new_order,
            adminPaymentFailed: !!p.admin_payment_failed,
            adminStatusChanged: !!p.admin_status_changed,
            orderStatusChanged: !!p.order_status_changed,
            emailNotifications: !!p.email_notifications,
          })
        }
      } catch (err) {
        console.error('Failed to load settings:', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.id])

  if (authLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56ff]" /></div>

  const handleSave = async () => {
    if (!user?.id) return
    setSaving(true)
    try {
      const data = {
        user: user.id,
        role: 'admin',
        order_placed: true,
        order_status_changed: prefs.orderStatusChanged,
        document_ready: true,
        payment_received: true,
        weekly_summary: false,
        admin_new_order: prefs.adminNewOrder,
        admin_payment_failed: prefs.adminPaymentFailed,
        admin_status_changed: prefs.adminStatusChanged,
        email_notifications: prefs.emailNotifications,
      }

      if (prefId) {
        await pb.collection('notification_preferences').update(prefId, data)
      } else {
        const record = await pb.collection('notification_preferences').create(data)
        setPrefId(record.id)
      }

      toast.custom(t => (
        <div className={`flex items-center gap-3 bg-white border border-slate-200 shadow-lg rounded-xl px-4 py-3 text-sm ${t.visible ? '' : 'opacity-0'}`}>
          <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
          <span className="text-slate-800 font-medium">Settings saved successfully</span>
        </div>
      ))
    } catch {
      toast.error('Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[#1a56ff]" />
        </div>
      </>
    )
  }

  return (
    <>
      <div className="mb-6 flex items-center gap-2">
        <Settings className="h-5 w-5 text-[#1a56ff]" />
        <h2 className="text-xl font-bold text-slate-900">Admin Settings</h2>
      </div>

      <div className="max-w-2xl space-y-5">
        {/* Company Info */}
        <SectionCard title="Company Info">
          <div className="space-y-4">
            <Field label="Company Name" defaultValue="Instant Grow LLC" />
            <Field label="Support Email" type="email" defaultValue="info@instantgrow.net" />
            <Field label="Admin Notification Email" type="email" defaultValue="info@instantgrow.net" />
          </div>
        </SectionCard>

        {/* Email Notification Preferences */}
        <SectionCard title="Email Notification Preferences">
          <div className="space-y-1 mb-5">
            <Toggle
              label="Email Notifications"
              description="Master switch — disable to stop all admin email notifications"
              checked={prefs.emailNotifications}
              onChange={v => setPrefs(p => ({ ...p, emailNotifications: v }))}
            />
          </div>

          {prefs.emailNotifications && (
            <div className="space-y-5 pl-4 border-l-2 border-slate-100 mt-5">
              <div className="flex items-center gap-2 mb-2">
                <Bell size={14} className="text-[#1a56ff]" />
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Admin Alerts</p>
              </div>
              <Toggle
                label="New Order Received"
                description="Get notified by email whenever a client places a new order"
                checked={prefs.adminNewOrder}
                onChange={v => setPrefs(p => ({ ...p, adminNewOrder: v }))}
              />
              <Toggle
                label="Payment Failed"
                description="Alert when a client payment attempt fails"
                checked={prefs.adminPaymentFailed}
                onChange={v => setPrefs(p => ({ ...p, adminPaymentFailed: v }))}
              />
              <Toggle
                label="Status Change Confirmation"
                description="Receive a copy of status update emails sent to clients"
                checked={prefs.adminStatusChanged}
                onChange={v => setPrefs(p => ({ ...p, adminStatusChanged: v }))}
              />
              <div className="pt-4 border-t border-slate-100">
                <div className="flex items-center gap-2 mb-4">
                  <Shield size={14} className="text-[#1a56ff]" />
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Client Notifications</p>
                </div>
                <Toggle
                  label="Auto-send Status Updates to Clients"
                  description="Automatically email clients when their order status is updated"
                  checked={prefs.orderStatusChanged}
                  onChange={v => setPrefs(p => ({ ...p, orderStatusChanged: v }))}
                />
              </div>
            </div>
          )}
        </SectionCard>

        {/* Database & System Administration */}
        <SectionCard title="Database & System Administration">
          <div className="space-y-4">
            <p className="text-sm text-slate-600 leading-relaxed">
              Access the direct database console to manage system collections, view raw data tables (clients, companies, payments, blogs, metadata), monitor server logs, and configure mail server SMTP parameters.
            </p>
            <div className="flex">
              <a
                href={`${import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090'}/_/`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white hover:bg-slate-800 rounded-lg text-sm font-semibold transition-colors"
              >
                <Shield className="h-4 w-4 text-amber-400" />
                <span>Launch Database Console</span>
              </a>
            </div>
          </div>
        </SectionCard>

        <div className="flex justify-end">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2.5 bg-[#1a56ff] text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 flex items-center gap-2"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </>
  )
}

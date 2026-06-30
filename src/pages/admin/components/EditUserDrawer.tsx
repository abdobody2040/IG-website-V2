import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { pb } from '../../../lib/pocketbase'
import toast from 'react-hot-toast'
import type { User as DBUser } from '../../../types/db'
import { format } from 'date-fns'

export function EditUserDrawer({ user, onClose, onSaved }: { user: DBUser; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    displayName: user.displayName || '',
    email: user.email || '',
    phone: user.phone || '',
    role: user.role || 'client',
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const { error: updateErr } = await pb.collection('profiles').update(user.id, {
        display_name: form.displayName,
        email: form.email,
        phone: form.phone,
        role: form.role,
        updated_at: new Date().toISOString(),
      })
      if (updateErr) throw updateErr
      toast.success('User updated')
      onSaved()
      onClose()
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full sm:w-96 sm:h-full sm:max-h-screen overflow-y-auto shadow-2xl rounded-t-2xl sm:rounded-none">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Edit User</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>

        <div className="px-5 py-4 bg-slate-50 border-b border-slate-100">
          <p className="text-xs font-medium text-slate-500 uppercase mb-2">Account Info</p>
          <div className="space-y-1 text-xs text-slate-600">
            <div className="flex gap-2"><span className="text-slate-400 w-16">ID:</span><span className="font-mono">{user.id.slice(0, 16)}…</span></div>
            <div className="flex gap-2"><span className="text-slate-400 w-16">Email:</span><span>{user.email}</span></div>
            <div className="flex gap-2"><span className="text-slate-400 w-16">Joined:</span><span>{user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : '—'}</span></div>
            <div className="flex gap-2"><span className="text-slate-400 w-16">Last login:</span><span>{user.lastSignIn ? format(new Date(user.lastSignIn), 'MMM d, yyyy') : '—'}</span></div>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {[
            { label: 'Display Name', field: 'displayName' as const },
            { label: 'Phone', field: 'phone' as const },
          ].map(({ label, field }) => (
            <div key={field}>
              <label className="block text-xs font-medium text-slate-700 mb-1">{label}</label>
              <input value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff]" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Role</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff] bg-white">
              <option value="client">Client</option>
              <option value="admin">Admin</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 p-5 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-lg bg-[#1a56ff] text-white text-sm font-semibold hover:bg-[#1440d0] disabled:opacity-60 flex items-center justify-center gap-2">
            {saving && <Loader2 size={13} className="animate-spin" />} Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

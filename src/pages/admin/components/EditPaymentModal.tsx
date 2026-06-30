import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { pb } from '../../../lib/pocketbase'
import toast from 'react-hot-toast'
import { PAYMENT_STATUS_OPTIONS } from './constants'

export function EditPaymentModal({ payment, onClose, onSaved }: { payment: any; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ service: payment.service, amount: String(payment.amount), status: payment.status, currency: payment.currency })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const { error: updateErr } = await pb.collection('payments').update(payment.id, {
        service: form.service,
        amount: parseFloat(form.amount) || 0,
        status: form.status,
        currency: form.currency,
        updated_at: new Date().toISOString(),
      })
      if (updateErr) throw updateErr
      toast.success('Payment updated')
      onSaved()
      onClose()
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Edit Payment</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          {([['Service', 'service'], ['Amount', 'amount'], ['Currency', 'currency']] as const).map(([label, field]) => (
            <div key={field}>
              <label className="block text-xs font-medium text-slate-700 mb-1">{label}</label>
              <input value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff]" />
            </div>
          ))}
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff] bg-white">
              {PAYMENT_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-lg bg-[#1a56ff] text-white text-sm font-semibold disabled:opacity-60 flex items-center justify-center gap-2">
            {saving && <Loader2 size={13} className="animate-spin" />} Save
          </button>
        </div>
      </div>
    </div>
  )
}

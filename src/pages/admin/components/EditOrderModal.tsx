import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { pb } from '../../../lib/pocketbase'
import toast from 'react-hot-toast'
import type { Order } from '../../../types/db'
import { ORDER_STATUS_OPTIONS } from './constants'

function FormField({ label, field, type = 'text', form, setForm }: {
  label: string; field: keyof typeof form; type?: string;
  form: Record<string, string>; setForm: (f: (prev: any) => any) => void
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">{label}</label>
      <input type={type} value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff]" />
    </div>
  )
}

export function EditOrderModal({ order, onClose, onSaved }: { order: Order; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    companyName: order.companyName,
    companyState: order.companyState,
    companyType: order.companyType,
    packageName: order.packageName,
    amount: String(order.amount),
    currency: order.currency,
    status: order.status,
    notes: order.notes,
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const statusChanged = form.status !== order.status
      const { error: updateErr } = await pb.collection('orders').update(order.id, {
        company_name: form.companyName,
        company_state: form.companyState,
        company_type: form.companyType,
        package_name: form.packageName,
        amount: parseFloat(form.amount) || 0,
        currency: form.currency,
        status: form.status,
        notes: form.notes,
        updated_at: new Date().toISOString(),
      })
      if (updateErr) throw updateErr
      if (statusChanged) {
        const { error: insertErr } = await pb.collection('order_updates').create({
          order_id: order.id,
          status: form.status,
          message: `Status updated to ${form.status} by admin`,
          created_by: 'admin',
          created_at: new Date().toISOString(),
        })
        if (insertErr) throw insertErr
      }
      toast.success('Order updated')
      onSaved()
      onClose()
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Edit Order #{order.orderNumber}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4">
          <FormField label="Company Name" field="companyName" form={form} setForm={setForm} />
          <FormField label="State" field="companyState" form={form} setForm={setForm} />
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
            <select value={form.companyType} onChange={e => setForm(f => ({ ...f, companyType: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff] bg-white">
              <option value="LLC">LLC</option><option value="LTD">LTD</option>
            </select>
          </div>
          <FormField label="Package" field="packageName" form={form} setForm={setForm} />
          <FormField label="Amount ($)" field="amount" type="number" form={form} setForm={setForm} />
          <FormField label="Currency" field="currency" form={form} setForm={setForm} />
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff] bg-white">
              {ORDER_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">Notes</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={3}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff] resize-none" />
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

import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { pb } from '../../../lib/pocketbase'
import toast from 'react-hot-toast'
import type { Company } from '../../../types/db'
import { COMPANY_STATUS_OPTIONS } from './constants'

function FormField({ label, field, form, setForm }: {
  label: string; field: keyof typeof form;
  form: Record<string, string>; setForm: (f: (prev: any) => any) => void
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-700 mb-1">{label}</label>
      <input value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))}
        className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff]" />
    </div>
  )
}

export function EditCompanyModal({ company, onClose, onSaved }: { company: Company; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    companyName: company.companyName,
    companyType: company.companyType,
    state: company.state,
    einNumber: company.einNumber,
    formationDate: company.formationDate,
    registeredAgent: company.registeredAgent,
    status: company.status,
  })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const { error: updateErr } = await pb.collection('companies').update(company.id, {
        company_name: form.companyName,
        company_type: form.companyType,
        state: form.state,
        ein_number: form.einNumber,
        formation_date: form.formationDate,
        registered_agent: form.registeredAgent,
        status: form.status,
        updated_at: new Date().toISOString(),
      })
      if (updateErr) throw updateErr
      toast.success('Company updated')
      onSaved()
      onClose()
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Edit Company</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="p-5 grid grid-cols-2 gap-4">
          <div className="col-span-2"><FormField label="Company Name" field="companyName" form={form} setForm={setForm} /></div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
            <select value={form.companyType} onChange={e => setForm(f => ({ ...f, companyType: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff] bg-white">
              <option>LLC</option><option>LTD</option>
            </select>
          </div>
          <FormField label="State" field="state" form={form} setForm={setForm} />
          <FormField label="EIN Number" field="einNumber" form={form} setForm={setForm} />
          <FormField label="Formation Date" field="formationDate" form={form} setForm={setForm} />
          <div className="col-span-2"><FormField label="Registered Agent" field="registeredAgent" form={form} setForm={setForm} /></div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff] bg-white">
              {COMPANY_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div className="flex gap-3 p-5 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2.5 rounded-lg bg-[#1a56ff] text-white text-sm font-semibold hover:bg-[#1440d0] disabled:opacity-60 flex items-center justify-center gap-2">
            {saving && <Loader2 size={13} className="animate-spin" />} Save
          </button>
        </div>
      </div>
    </div>
  )
}

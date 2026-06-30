import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { pb } from '../../../lib/pocketbase'
import toast from 'react-hot-toast'
import type { Document } from '../../../types/db'
import { DOC_TYPE_OPTIONS, DOC_STATUS_OPTIONS } from './constants'

export function EditDocumentModal({ doc, onClose, onSaved }: { doc: Document; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({ name: doc.name, docType: doc.docType, fileUrl: doc.fileUrl, status: doc.status })
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    setSaving(true)
    try {
      const { error: updateErr } = await pb.collection('documents').update(doc.id, {
        name: form.name,
        doc_type: form.docType,
        file_url: form.fileUrl,
        status: form.status,
        updated_at: new Date().toISOString(),
      })
      if (updateErr) throw updateErr
      toast.success('Document updated')
      onSaved()
      onClose()
    } catch { toast.error('Failed to save') }
    finally { setSaving(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Edit Document</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Name</label>
            <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff]" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Type</label>
            <select value={form.docType} onChange={e => setForm(f => ({ ...f, docType: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff] bg-white">
              {DOC_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Status</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff] bg-white">
              {DOC_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">File URL</label>
            <input value={form.fileUrl} onChange={e => setForm(f => ({ ...f, fileUrl: e.target.value }))}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff]" />
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

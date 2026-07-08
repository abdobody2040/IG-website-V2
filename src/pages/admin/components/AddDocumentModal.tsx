import { useState, useRef } from 'react'
import { X, Loader2, Plus, FileText } from 'lucide-react'
import { pb } from '../../../lib/pocketbase'
import toast from 'react-hot-toast'
import type { Order, Company } from '../../../types/db'
import { ACCEPTED_FILE_TYPES, ALLOWED_MIME_TYPES, MAX_FILE_SIZE, DOC_TYPE_OPTIONS, DOC_STATUS_OPTIONS } from './constants'

export function AddDocumentModal({ userId, orders, companies, onClose, onSaved }: {
  userId: string; orders: Order[]; companies: Company[]; onClose: () => void; onSaved: () => void
}) {
  const [form, setForm] = useState({ docType: 'other', status: 'ready', orderId: '', companyId: '' })
  const [files, setFiles] = useState<File[]>([])
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFiles(selectedFiles: FileList | null) {
    if (!selectedFiles?.length) return
    
    const validFiles: File[] = []
    let errorShown = false
    
    for (let i = 0; i < selectedFiles.length; i++) {
      const f = selectedFiles[i]
      if (!f) continue
      if (!ALLOWED_MIME_TYPES.includes(f.type)) {
        if (!errorShown) { toast.error('Some file types not allowed. Accepted: PDF, PNG, JPEG, WEBP, DOC, DOCX.'); errorShown = true }
        continue
      }
      if (f.size > MAX_FILE_SIZE) {
        if (!errorShown) { toast.error('Some files are too large. Maximum size is 10 MB.'); errorShown = true }
        continue
      }
      validFiles.push(f)
    }
    
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles])
    }
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  async function handleSave() {
    if (files.length === 0) { toast.error('Please select at least one file'); return }
    setUploading(true)
    let successCount = 0
    let failCount = 0

    try {
      for (const file of files) {
        try {
          const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
          const path = `user-docs/${userId}/${Date.now()}-${safeName}`
          let publicUrl = ''
          let recordCreated = false

          const R2_UPLOAD_ENDPOINT = import.meta.env.VITE_R2_UPLOAD_ENDPOINT as string | undefined
          if (R2_UPLOAD_ENDPOINT) {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('path', path)
            const res = await fetch(R2_UPLOAD_ENDPOINT, {
              method: 'POST',
              headers: pb.authStore.token ? { Authorization: `Bearer ${pb.authStore.token}` } : {},
              body: formData,
            })
            if (!res.ok) throw new Error('Upload to R2 failed')
            const json = await res.json()
            publicUrl = json.url
          } else {
            // Upload directly to PocketBase documents collection
            const formData = new FormData()
            formData.append('user', userId)
            if (form.orderId) formData.append('order', form.orderId)
            if (form.companyId) formData.append('company', form.companyId)
            formData.append('name', file.name)
            formData.append('doc_type', form.docType)
            formData.append('file_name', safeName)
            formData.append('status', form.status)
            formData.append('file', file)

            await pb.collection('documents').create(formData)
            recordCreated = true
          }

          if (!recordCreated) {
            await pb.collection('documents').create({
              user: userId,
              order: form.orderId || null,
              company: form.companyId || null,
              name: file.name,
              doc_type: form.docType,
              file_url: publicUrl,
              file_name: safeName,
              status: form.status,
            })
          }
          successCount++
        } catch (err) {
          console.error(`Failed to upload ${file.name}:`, err)
          failCount++
        }
      }

      if (successCount > 0) {
        toast.success(`Successfully uploaded ${successCount} document${successCount > 1 ? 's' : ''}`)
      }
      if (failCount > 0) {
        toast.error(`Failed to upload ${failCount} document${failCount > 1 ? 's' : ''}`)
      }
      
      onSaved()
      if (failCount === 0) {
        onClose()
      } else {
        // Clear successful files from the list if some failed
        // For simplicity, just close it or let them retry
        onClose()
      }
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="font-semibold text-slate-900">Add Document for Client</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          {files.length === 0 ? (
            <div
              onDragOver={e => { e.preventDefault(); setDragging(true) }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              onClick={() => fileRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragging ? 'border-[#1a56ff] bg-blue-50' : 'border-slate-200 hover:border-[#1a56ff]/50 hover:bg-slate-50'}`}
            >
              <Plus size={28} className={`mx-auto mb-2 ${dragging ? 'text-[#1a56ff]' : 'text-slate-300'}`} />
              <p className="text-sm font-medium text-slate-700">Drag & drop or <span className="text-[#1a56ff]">browse</span></p>
              <p className="text-xs text-slate-400 mt-1">PDF, DOC, JPG, PNG — max 10 MB per file</p>
              <input ref={fileRef} type="file" accept={ACCEPTED_FILE_TYPES} multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
            </div>
          ) : (
            <div className="space-y-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-slate-500">{files.length} file(s) selected</span>
                <button onClick={() => fileRef.current?.click()} className="text-xs font-semibold text-[#1a56ff] hover:underline">Add more</button>
              </div>
              <input ref={fileRef} type="file" accept={ACCEPTED_FILE_TYPES} multiple className="hidden" onChange={e => handleFiles(e.target.files)} />
              <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
                    <FileText size={18} className="text-[#1a56ff] flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button onClick={() => setFiles(prev => prev.filter((_, i) => i !== idx))} className="text-slate-400 hover:text-red-500 flex-shrink-0">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {orders.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Link to Order (optional)</label>
              <select value={form.orderId} onChange={e => setForm(f => ({ ...f, orderId: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff] bg-white">
                <option value="">— None —</option>
                {orders.map(o => <option key={o.id} value={o.id}>#{o.orderNumber} — {o.companyName}</option>)}
              </select>
            </div>
          )}

          {companies.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Link to Company (optional)</label>
              <select value={form.companyId} onChange={e => setForm(f => ({ ...f, companyId: e.target.value }))}
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff] bg-white">
                <option value="">— None —</option>
                {companies.map(c => <option key={c.id} value={c.id}>{c.companyName} ({c.state})</option>)}
              </select>
            </div>
          )}

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
        </div>
        <div className="flex gap-3 p-5 border-t border-slate-100">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50">Cancel</button>
          <button onClick={handleSave} disabled={uploading || files.length === 0} className="flex-1 py-2.5 rounded-lg bg-[#1a56ff] text-white text-sm font-semibold hover:bg-[#1440d0] disabled:opacity-60 flex items-center justify-center gap-2">
            {uploading && <Loader2 size={13} className="animate-spin" />} {uploading ? 'Uploading...' : 'Upload Document'}
          </button>
        </div>
      </div>
    </div>
  )
}

import { useState, useRef, useCallback } from 'react'
import { X, Loader2, Upload, FileText, ExternalLink, AlertCircle } from 'lucide-react'
import { pb } from '../../../lib/pocketbase'
import toast from 'react-hot-toast'
import { logAdminAction } from '../../../hooks/useAdminAuditLog'
import { DOC_TYPE_OPTIONS, DOC_STATUS_OPTIONS, ACCEPTED_FILE_TYPES, ALLOWED_MIME_TYPES, MAX_FILE_SIZE } from './constants'

import type { Order, Company } from '../../../types/db'

const R2_UPLOAD_ENDPOINT = import.meta.env.VITE_R2_UPLOAD_ENDPOINT as string | undefined

interface Props {
  /** Optional — pre-fills userId, links selectors for Order/Company */
  userId?: string
  orders?: Order[]
  companies?: Company[]
  onClose: () => void
  onSaved: () => void
}

export function AddDocumentModal({ onClose, onSaved, userId: prefillUserId = '', orders = [], companies = [] }: Props) {
  const [name, setName] = useState('')
  const [docType, setDocType] = useState('other')
  const [status, setStatus] = useState('ready')
  const [fileUrl, setFileUrl] = useState('')
  const [userId, setUserId] = useState(prefillUserId)
  const [orderId, setOrderId] = useState('')
  const [companyId, setCompanyId] = useState('')

  const [file, setFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [saving, setSaving] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── File validation ────────────────────────────────────────────────
  const validateFile = (f: File): string | null => {
    if (f.size > MAX_FILE_SIZE) return 'File too large. Maximum size is 10 MB.'
    if (!ALLOWED_MIME_TYPES.includes(f.type)) return 'File type not allowed. Accepted: PDF, PNG, JPEG, WEBP, DOC, DOCX.'
    return null
  }

  const handleFileSelect = (f: File) => {
    const err = validateFile(f)
    if (err) { toast.error(err); return }
    setFile(f)
    if (!name) setName(f.name.replace(/\.[^.]+$/, ''))
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFileSelect(f)
  }, [name])

  // ── Upload file & get URL ──────────────────────────────────────────
  const uploadFile = async (f: File): Promise<string> => {
    const safeName = f.name.replace(/[^a-zA-Z0-9._-]/g, '_')
    setUploadProgress(10)

    if (R2_UPLOAD_ENDPOINT) {
      const path = `admin-docs/${userId || 'admin'}/${Date.now()}-${safeName}`
      const formData = new FormData()
      formData.append('file', f)
      formData.append('path', path)

      const res = await fetch(R2_UPLOAD_ENDPOINT, {
        method: 'POST',
        headers: pb.authStore.token ? { Authorization: `Bearer ${pb.authStore.token}` } : {},
        body: formData,
      })
      setUploadProgress(70)
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string }
        throw new Error(body.error ?? 'Upload failed')
      }
      const json = await res.json() as { url: string }
      setUploadProgress(90)
      return json.url
    } else {
      // Fallback: PocketBase file storage
      const formData = new FormData()
      formData.append('file', f)
      formData.append('name', name || f.name)
      formData.append('doc_type', docType)
      formData.append('status', status)
      formData.append('file_name', safeName)
      if (userId) formData.append('user', userId)
      if (orderId) formData.append('order', orderId)
      if (companyId) formData.append('company', companyId)

      const rec = await pb.collection('documents').create(formData)
      logAdminAction({ action: 'create', tableName: 'documents', recordId: rec.id as string })
      setUploadProgress(100)
      return (rec as Record<string, any>)['file_url'] as string || ''
    }
  }

  // ── Save ──────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!name.trim()) { toast.error('Document name is required'); return }
    if (!file && !fileUrl.trim()) { toast.error('Upload a file or enter a File URL'); return }

    let finalUrl = fileUrl

    if (file) {
      setUploading(true)
      try {
        finalUrl = await uploadFile(file)
      } catch (err) {
        toast.error(err instanceof Error ? err.message : 'Upload failed')
        setUploading(false)
        return
      }
      setUploading(false)
    }

    // If PocketBase fallback already created the record, we're done
    if (file && !R2_UPLOAD_ENDPOINT) {
      toast.success('Document created successfully')
      onSaved()
      onClose()
      return
    }

    setSaving(true)
    try {
      const rec = await pb.collection('documents').create({
        name: name.trim(),
        doc_type: docType,
        status,
        file_url: finalUrl,
        file_name: file ? file.name.replace(/[^a-zA-Z0-9._-]/g, '_') : '',
        user: userId || null,
        order: orderId || null,
        company: companyId || null,
      })
      logAdminAction({ action: 'create', tableName: 'documents', recordId: (rec.id as string) })
      toast.success('Document created successfully')
      onSaved()
      onClose()
    } catch (err) {
      console.error(err)
      toast.error(err instanceof Error ? err.message : 'Failed to create document')
    } finally {
      setSaving(false)
    }
  }

  const isWorking = uploading || saving

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <div>
            <h2 className="font-semibold text-slate-900">Add Document</h2>
            <p className="text-xs text-slate-500 mt-0.5">Upload a file or paste a URL</p>
          </div>
          <button onClick={onClose} disabled={isWorking} className="text-slate-400 hover:text-slate-700 transition-colors disabled:opacity-40">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

          {/* File drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !isWorking && fileInputRef.current?.click()}
            className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              dragOver ? 'border-[#1a56ff] bg-blue-50' :
              file ? 'border-green-400 bg-green-50' :
              'border-slate-200 hover:border-[#1a56ff] hover:bg-blue-50/30'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_FILE_TYPES}
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFileSelect(f) }}
            />
            {file ? (
              <div className="flex items-center justify-center gap-3">
                <FileText size={20} className="text-green-600 flex-shrink-0" />
                <div className="text-left min-w-0">
                  <p className="text-sm font-medium text-green-800 truncate">{file.name}</p>
                  <p className="text-xs text-green-600">{(file.size / 1024).toFixed(1)} KB · {file.type}</p>
                </div>
                <button
                  onClick={e => { e.stopPropagation(); setFile(null); setUploadProgress(0) }}
                  className="ml-auto text-slate-400 hover:text-red-500 flex-shrink-0"
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <Upload size={24} className="text-slate-300 mx-auto mb-2" />
                <p className="text-sm font-medium text-slate-600">Drop file here or click to browse</p>
                <p className="text-xs text-slate-400 mt-1">PDF, PNG, JPG, WEBP, DOC, DOCX · max 10 MB</p>
              </>
            )}
          </div>

          {/* Upload progress */}
          {uploading && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Uploading…</span><span>{uploadProgress}%</span>
              </div>
              <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#1a56ff] rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          {/* OR divider */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-slate-100" />
            <span className="text-xs text-slate-400">or paste URL</span>
            <div className="flex-1 border-t border-slate-100" />
          </div>

          {/* File URL */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">File URL</label>
            <div className="flex gap-2">
              <input
                value={fileUrl}
                onChange={e => setFileUrl(e.target.value)}
                disabled={!!file}
                placeholder="https://…"
                className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white disabled:bg-slate-50 disabled:text-slate-400"
              />
              {fileUrl && (
                <a href={fileUrl} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 flex-shrink-0">
                  <ExternalLink size={12} /> View
                </a>
              )}
            </div>
            {file && <p className="text-xs text-slate-400 mt-1 flex items-center gap-1"><AlertCircle size={10} /> URL field disabled when a file is selected</p>}
          </div>

          <div className="h-px bg-slate-100" />

          {/* Name */}
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Document Name <span className="text-red-400">*</span></label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Articles of Organization — Acme LLC"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white"
            />
          </div>

          {/* Type + Status */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Document Type</label>
              <select value={docType} onChange={e => setDocType(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white">
                {DOC_TYPE_OPTIONS.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white">
                {DOC_STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
              </select>
            </div>
          </div>

          {/* Linked IDs */}
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Link to (optional)</p>
            <div className="grid grid-cols-1 gap-2">
              <div>
                <label className="block text-xs text-slate-600 mb-1">User ID</label>
                <input value={userId} onChange={e => setUserId(e.target.value)}
                  placeholder="User ID"
                  readOnly={!!prefillUserId}
                  className={`w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] font-mono ${prefillUserId ? 'bg-slate-50 text-slate-500 cursor-default' : 'bg-white'}`} />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Order</label>
                  {orders.length > 0 ? (
                    <select value={orderId} onChange={e => setOrderId(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white">
                      <option value="">— none —</option>
                      {orders.map(o => (
                        <option key={o.id} value={o.id}>
                          {o.id.slice(0, 8)}… · {o.status}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input value={orderId} onChange={e => setOrderId(e.target.value)}
                      placeholder="Order ID"
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white font-mono" />
                  )}
                </div>
                <div>
                  <label className="block text-xs text-slate-600 mb-1">Company</label>
                  {companies.length > 0 ? (
                    <select value={companyId} onChange={e => setCompanyId(e.target.value)}
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white">
                      <option value="">— none —</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.companyName || c.id.slice(0, 8) + '…'}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input value={companyId} onChange={e => setCompanyId(e.target.value)}
                      placeholder="Company ID"
                      className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white font-mono" />
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-6 py-4 border-t border-slate-200 flex-shrink-0">
          <button onClick={onClose} disabled={isWorking}
            className="flex-1 py-2.5 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors disabled:opacity-40">
            Cancel
          </button>
          <button onClick={handleSave} disabled={isWorking}
            className="flex-1 py-2.5 text-sm rounded-lg bg-[#1a56ff] text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
            {isWorking && <Loader2 size={13} className="animate-spin" />}
            {uploading ? 'Uploading…' : saving ? 'Creating…' : 'Create Document'}
          </button>
        </div>
      </div>
    </div>
  )
}

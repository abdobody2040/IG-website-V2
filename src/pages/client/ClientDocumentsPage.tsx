import { useRef, useState, useCallback } from 'react'
import {
  FileText, Download, Eye,
  UploadCloud, X, AlertCircle, Plus,
} from 'lucide-react'
import ClientLayout from './ClientLayout'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { useDocuments } from '../../hooks/useDocuments'
import { useDocumentUpload } from '../../hooks/useDocumentUpload'
import { useOrders } from '../../hooks/useOrders'
import { useLang } from '../../i18n/LanguageContext'
import type { Order } from '../../types/db'

const DOC_TYPE_LABELS: Record<string, string> = {
  articles_of_org:    'Articles of Organization',
  operating_agreement:'Operating Agreement',
  ein_letter:         'EIN Confirmation Letter',
  banking_resolution: 'Banking Resolution',
  id_document:        'ID / Passport',
  proof_of_address:   'Proof of Address',
  other:              'Document',
}

const UPLOAD_DOC_TYPES = [
  { value: 'id_document',         label: 'ID / Passport' },
  { value: 'proof_of_address',    label: 'Proof of Address' },
  { value: 'articles_of_org',     label: 'Articles of Organization' },
  { value: 'operating_agreement', label: 'Operating Agreement' },
  { value: 'banking_resolution',  label: 'Banking Resolution' },
  { value: 'other',               label: 'Other' },
]

const ACCEPTED = '.pdf,.doc,.docx,.jpg,.jpeg,.png,.webp'

function UploadZone({ userId, orders }: { userId: string; orders: Order[] }) {
  const { t } = useLang()
  const dp = t.client.documentsPage
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [docType, setDocType] = useState('other')
  const [orderId, setOrderId] = useState(orders[0]?.id ?? '')
  const [open, setOpen] = useState(false)

  const { uploading, progress, error, upload, reset } = useDocumentUpload({ userId, orderId })

  const handleFiles = useCallback((files: FileList | null) => {
    if (!files?.length) return
    setSelectedFile(files[0]!)
    reset()
  }, [reset])

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer.files)
  }, [handleFiles])

  const handleUpload = async () => {
    if (!selectedFile) return
    const ok = await upload(selectedFile, docType)
    if (ok) { setSelectedFile(null); setDocType('other'); setOpen(false) }
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 text-sm font-semibold bg-[#1a56ff] text-white px-4 py-2 rounded-xl hover:bg-[#3a76ff] transition-colors"
      >
        <Plus size={15} />
        {dp.uploadDocument}
      </button>
    )
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <UploadCloud size={15} className="text-[#1a56ff]" />
          <span className="text-sm font-semibold text-slate-900">{dp.uploadDocument}</span>
        </div>
        <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700 transition-colors">
          <X size={15} />
        </button>
      </div>

      <div className="p-5 space-y-4">
        {!selectedFile ? (
          <div
            onDragOver={e => { e.preventDefault(); setDragging(true) }}
            onDragLeave={() => setDragging(false)}
            onDrop={onDrop}
            onClick={() => fileRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragging ? 'border-[#1a56ff] bg-blue-50' : 'border-slate-200 hover:border-[#1a56ff]/50 hover:bg-slate-50'}`}
          >
            <UploadCloud size={28} className={`mx-auto mb-2 ${dragging ? 'text-[#1a56ff]' : 'text-slate-300'}`} />
            <p className="text-sm font-medium text-slate-700">{dp.dragDrop}<span className="text-[#1a56ff]">{dp.browse}</span></p>
            <p className="text-xs text-slate-400 mt-1">{dp.maxSize}</p>
            <input ref={fileRef} type="file" accept={ACCEPTED} className="hidden" onChange={e => handleFiles(e.target.files)} />
          </div>
        ) : (
          <div className="flex items-center gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <FileText size={18} className="text-[#1a56ff] flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-900 truncate">{selectedFile.name}</p>
              <p className="text-xs text-slate-500">{(selectedFile.size / 1024).toFixed(0)} KB</p>
            </div>
            <button onClick={() => { setSelectedFile(null); reset() }} className="text-slate-400 hover:text-red-500 transition-colors">
              <X size={14} />
            </button>
          </div>
        )}

        {uploading && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-slate-500"><span>{dp.uploading}</span><span>{progress}%</span></div>
            <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#1a56ff] rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-2.5 text-red-600 text-sm">
            <AlertCircle size={14} className="flex-shrink-0" /><span>{error}</span>
          </div>
        )}

        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1.5">{dp.documentType}</label>
            <select value={docType} onChange={e => setDocType(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/30 focus:border-[#1a56ff]">
              {UPLOAD_DOC_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
            </select>
          </div>
          {orders.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1.5">{dp.linkToOrder}</label>
              <select value={orderId} onChange={e => setOrderId(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/30 focus:border-[#1a56ff]">
                <option value="">\u2014 None \u2014</option>
                {orders.map(o => <option key={o.id} value={o.id}>#{o.orderNumber} \u00b7 {o.companyName}</option>)}
              </select>
            </div>
          )}
        </div>

        <button
          onClick={handleUpload}
          disabled={!selectedFile || uploading}
          className="w-full bg-[#1a56ff] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#3a76ff] transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {uploading ? <><span className="animate-spin inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full" /> {dp.uploading}</> : <><UploadCloud size={14} /> {dp.uploadDocument}</>}
        </button>
      </div>
    </div>
  )
}

export default function ClientDocumentsPage() {
  const { t } = useLang()
  const dp = t.client.documentsPage
  const { user, isLoading: authLoading } = useRequireAuth()
  const { documents, isLoading } = useDocuments(user?.id)
  const { orders } = useOrders(user?.id)

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56ff]" />
      </div>
    )
  }

  const readyDocs = documents.filter(d => d.status === 'ready')

  return (
    <ClientLayout currentPath="/client/documents" title={t.client.nav.documents}>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">{t.client.nav.documents}</h2>
            <p className="text-slate-500 text-sm mt-0.5">{dp.subtitle}</p>
          </div>
          {user && <UploadZone userId={user.id} orders={orders} />}
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">{dp.allDocuments}</h3>
              {documents.length > 0 && (
                <p className="text-xs text-slate-400 mt-0.5">{readyDocs.length}/{documents.length} {dp.ready}</p>
              )}
            </div>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1a56ff]" />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{dp.documentName}</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{dp.view}</th>
                    <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{dp.download}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {documents.length === 0 ? (
                    <>
                      <tr>
                        <td colSpan={3} className="px-5 py-3 text-xs text-slate-400">{dp.noDocuments}</td>
                      </tr>
                      <tr className="border-t border-slate-100">
                        <td className="px-5 py-3 text-xs text-slate-400">{dp.noDocuments}</td>
                        <td className="px-5 py-3 text-xs text-slate-300">\u2014</td>
                        <td className="px-5 py-3 text-xs text-slate-300">\u2014</td>
                      </tr>
                    </>
                  ) : (
                    documents.map(doc => {
                      const isReady = doc.status === 'ready'
                      const label = DOC_TYPE_LABELS[doc.docType] ?? doc.name
                      return (
                        <tr key={doc.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <FileText size={14} className="text-slate-500" />
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-slate-900 truncate">{doc.name || label}</p>
                                <p className="text-xs text-slate-400">{label}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            {isReady && doc.fileUrl ? (
                              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="w-7 h-7 inline-flex items-center justify-center rounded-lg bg-slate-100 text-slate-500 hover:bg-[#1a56ff]/10 hover:text-[#1a56ff] transition-colors">
                                <Eye size={13} />
                              </a>
                            ) : (
                              <span className="text-slate-300 text-xs">\u2014</span>
                            )}
                          </td>
                          <td className="px-5 py-3.5">
                            {isReady && doc.fileUrl ? (
                              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="w-7 h-7 inline-flex items-center justify-center rounded-lg bg-[#1a56ff]/10 text-[#1a56ff] hover:bg-[#1a56ff]/20 transition-colors">
                                <Download size={13} />
                              </a>
                            ) : (
                              <span className="text-slate-300 text-xs">\u2014</span>
                            )}
                          </td>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {documents.some(d => d.status !== 'ready') && (
          <div className="mt-4 bg-blue-50 border border-blue-200 rounded-xl p-4 flex items-start gap-3">
            <div className="w-5 h-5 bg-[#1a56ff] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-white text-xs font-bold">i</span>
            </div>
            <p className="text-blue-700 text-sm">{dp.processingBanner}</p>
          </div>
        )}
      </div>
    </ClientLayout>
  )
}

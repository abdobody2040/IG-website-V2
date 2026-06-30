import { useState, useMemo } from 'react'
import { FileText, Search, Edit2, Trash2, X, Loader2, ExternalLink } from 'lucide-react'
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal'
import { useQueryClient } from '@tanstack/react-query'
import { useAllDocuments } from '../../hooks/useAdminData'
import { useRequireAdmin } from '../../hooks/useRequireAuth'
import { pb } from '../../lib/pocketbase'
import toast from 'react-hot-toast'
import type { Document } from '../../types/db'
import { logAdminAction } from '../../hooks/useAdminAuditLog'

const DOC_TYPE_OPTIONS = [
  { value: 'articles_of_org', label: 'Articles of Organization' },
  { value: 'operating_agreement', label: 'Operating Agreement' },
  { value: 'ein_letter', label: 'EIN Letter' },
  { value: 'banking_resolution', label: 'Banking Resolution' },
  { value: 'other', label: 'Other' },
]

const DOC_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'ready', label: 'Ready' },
]

const DOC_TYPE_COLORS: Record<string, string> = {
  articles_of_org: 'bg-blue-100 text-blue-700',
  operating_agreement: 'bg-purple-100 text-purple-700',
  ein_letter: 'bg-amber-100 text-amber-700',
  banking_resolution: 'bg-indigo-100 text-indigo-700',
  other: 'bg-slate-100 text-slate-600',
}

function DocTypeBadge({ docType }: { docType: string }) {
  const cls = DOC_TYPE_COLORS[docType] ?? 'bg-slate-100 text-slate-600'
  const label = DOC_TYPE_OPTIONS.find(o => o.value === docType)?.label ?? docType
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${cls}`}>
      {label}
    </span>
  )
}

function StatusBadge({ status }: { status: string }) {
  const isPending = status === 'pending'
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${isPending ? 'bg-amber-100 text-amber-700' : 'bg-green-100 text-green-700'}`}>
      {isPending ? 'Pending' : 'Ready'}
    </span>
  )
}

// ── Edit Document Modal ───────────────────────────────────────────
function EditDocumentModal({
  document,
  onClose,
  onSaved,
}: {
  document: Document
  onClose: () => void
  onSaved: () => void
}) {
  const [name, setName] = useState(document.name || '')
  const [docType, setDocType] = useState(document.docType || 'other')
  const [status, setStatus] = useState(document.status || 'pending')
  const [fileUrl, setFileUrl] = useState(document.fileUrl || '')
  const [orderId, setOrderId] = useState(document.orderId || '')
  const [companyId, setCompanyId] = useState(document.companyId || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      await pb.collection('documents').update(document.id, {
        name,
        doc_type: docType,
        status,
        file_url: fileUrl,
        order: orderId || null,
        company: companyId || null,
      })
      logAdminAction({ action: 'update', tableName: 'documents', recordId: document.id });
      toast.success('Document updated successfully')
      onSaved()
    } catch {
      toast.error('Failed to update document')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <div>
            <h2 className="font-semibold text-slate-900">Edit Document</h2>
            <p className="text-xs text-slate-500 mt-0.5">{document.name}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Document Name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white"
              placeholder="Document name"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Document Type</label>
              <select
                value={docType}
                onChange={e => setDocType(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white"
              >
                {DOC_TYPE_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select
                value={status}
                onChange={e => setStatus(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white"
              >
                {DOC_STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">File URL</label>
            <div className="flex gap-2">
              <input
                value={fileUrl}
                onChange={e => setFileUrl(e.target.value)}
                className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white"
                placeholder="https://…"
              />
              {fileUrl && (
                <a
                  href={fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1 px-3 py-2 text-xs border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors flex-shrink-0"
                >
                  <ExternalLink size={12} /> View
                </a>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Order ID</label>
              <input
                value={orderId}
                onChange={e => setOrderId(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white font-mono"
                placeholder="Order ID"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Company ID</label>
              <input
                value={companyId}
                onChange={e => setCompanyId(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white font-mono"
                placeholder="Company ID"
              />
            </div>
          </div>

          {/* Read-only info */}
          <div className="p-3 bg-slate-50 rounded-lg space-y-1.5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">System Fields</p>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Document ID</span>
              <span className="text-slate-700 font-mono">{document.id.slice(0, 16)}…</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">User ID</span>
              <span className="text-slate-700 font-mono">{document.userId ? `${document.userId.slice(0, 16)}…` : '—'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Created</span>
              <span className="text-slate-700">{new Date(document.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-6 py-4 border-t border-slate-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 text-sm rounded-lg bg-[#1a56ff] text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {saving && <Loader2 size={13} className="animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────
export default function AdminDocumentsPage() {
  const { isLoading: authLoading } = useRequireAdmin()
  const { documents, isLoading } = useAllDocuments()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState('')
  const [docTypeFilter, setDocTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [editingDoc, setEditingDoc] = useState<Document | null>(null)
  const [deletingDoc, setDeletingDoc] = useState<Document | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const filtered = useMemo(() => {
    return documents.filter(d => {
      const q = search.toLowerCase()
      const matchSearch = !search || d.name?.toLowerCase().includes(q)
      const matchType = docTypeFilter === 'all' || d.docType === docTypeFilter
      const matchStatus = statusFilter === 'all' || d.status === statusFilter
      return matchSearch && matchType && matchStatus
    })
  }, [documents, search, docTypeFilter, statusFilter])

  if (authLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56ff]" /></div>

  const handleDelete = async () => {
    if (!deletingDoc) return
    setDeleteLoading(true)
    try {
      await pb.collection('documents').delete(deletingDoc.id)
      logAdminAction({ action: 'delete', tableName: 'documents', recordId: deletingDoc.id });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'documents'] })
      toast.success('Document deleted')
      setDeletingDoc(null)
    } catch {
      toast.error('Failed to delete document')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleSaved = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin', 'documents'] })
    setEditingDoc(null)
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-0.5">
          <FileText className="h-5 w-5 text-[#1a56ff]" />
          <h2 className="text-xl font-bold text-slate-900">All Documents</h2>
          <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full">{documents.length}</span>
        </div>
        <p className="text-slate-500 text-sm mt-0.5">Manage client documents and formation files</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by document name"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff] bg-white w-64"
          />
        </div>
        <select
          value={docTypeFilter}
          onChange={e => setDocTypeFilter(e.target.value)}
          className="py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff] bg-white"
        >
          <option value="all">All Types</option>
          {DOC_TYPE_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff] bg-white"
        >
          <option value="all">All Statuses</option>
          {DOC_STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <span className="py-2 text-sm text-slate-500">{filtered.length} document{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center gap-3 py-12 justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1a56ff]" />
          <span className="text-slate-500 text-sm">Loading documents…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <FileText size={36} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No documents found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500 uppercase">
                  {['Name', 'Type', 'Status', 'Company ID', 'User ID', 'Created', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(doc => (
                  <tr key={doc.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{doc.name}</p>
                      <p className="text-xs text-slate-400 font-mono">{doc.id.slice(0, 10)}…</p>
                    </td>
                    <td className="px-5 py-3">
                      <DocTypeBadge docType={doc.docType} />
                    </td>
                    <td className="px-5 py-3">
                      <StatusBadge status={doc.status} />
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs font-mono">
                      {doc.companyId ? `${doc.companyId.slice(0, 10)}…` : '—'}
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs font-mono">
                      {doc.userId ? `${doc.userId.slice(0, 10)}…` : '—'}
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">
                      {new Date(doc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        {doc.fileUrl && (
                          <a
                            href={doc.fileUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors"
                          >
                            <ExternalLink size={12} /> View
                          </a>
                        )}
                        <button
                          onClick={() => setEditingDoc(doc)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button
                          onClick={() => setDeletingDoc(doc)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {editingDoc && (
        <EditDocumentModal
          document={editingDoc}
          onClose={() => setEditingDoc(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Delete Confirm */}
      {deletingDoc && (
        <DeleteConfirmModal
          title="Delete Document"
          itemName={deletingDoc.name}
          onConfirm={handleDelete}
          onClose={() => setDeletingDoc(null)}
          loading={deleteLoading}
        />
      )}
    </>
  )
}

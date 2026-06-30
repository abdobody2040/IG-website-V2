import { FileText, Download, FileBadge, FileSignature, File, ScrollText } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { useDocuments } from '../../hooks/useDocuments'
import type { Document } from '../../types/db'
import { formatDate, getDocStatusBadge } from './statusUtils'

const DOC_ICONS: Record<string, React.ElementType> = {
  articles_of_org:        FileBadge,
  operating_agreement:    FileSignature,
  ein_letter:             ScrollText,
  banking_resolution:     FileText,
  other:                  File,
}

const DOC_LABELS: Record<string, string> = {
  articles_of_org:        'Articles of Organization',
  operating_agreement:    'Operating Agreement',
  ein_letter:             'EIN Letter',
  banking_resolution:     'Banking Resolution',
  other:                  'Document',
}

function DocCard({ doc }: { doc: Document }) {
  const Icon     = DOC_ICONS[doc.docType] ?? File
  const typeLabel = DOC_LABELS[doc.docType] ?? doc.docType
  const { bg, text, label } = getDocStatusBadge(doc.status)
  const isReady = doc.status === 'ready'

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col gap-4 hover:shadow-md hover:border-gray-200 transition-all duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="w-11 h-11 rounded-xl bg-[#e8efff] text-[#1a56ff] flex items-center justify-center flex-shrink-0">
          <Icon size={20} />
        </div>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${bg} ${text}`}>
          {label}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-sm truncate">{doc.name || typeLabel}</p>
        <p className="text-xs text-gray-400 mt-0.5">{typeLabel}</p>
        <p className="text-xs text-gray-400 mt-1">{formatDate(doc.createdAt)}</p>
      </div>

      {isReady && doc.fileUrl ? (
        <a
          href={doc.fileUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl bg-[#1a56ff] text-white text-xs font-semibold hover:bg-[#1240d6] transition-colors"
        >
          <Download size={13} />
          Download
        </a>
      ) : (
        <div className="flex items-center justify-center gap-2 w-full py-2 px-4 rounded-xl bg-gray-50 text-gray-300 text-xs font-semibold cursor-not-allowed">
          <Download size={13} />
          Not ready yet
        </div>
      )}
    </div>
  )
}

function EmptyDocs() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-2xl border border-gray-100 shadow-sm">
      <div className="w-16 h-16 rounded-2xl bg-[#e8efff] flex items-center justify-center text-[#1a56ff] mb-4">
        <FileText size={28} />
      </div>
      <h3 className="font-semibold text-gray-900 text-lg mb-1">No documents yet</h3>
      <p className="text-gray-500 text-sm max-w-xs">
        Your formation documents will appear here once your LLC is processed.
      </p>
    </div>
  )
}

export default function DocumentsPage() {
  const { user } = useAuth()
  const { documents, isLoading } = useDocuments(user?.id)

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto animate-fade-in">
      <div className="mb-7">
        <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
          Documents
        </h1>
        <p className="text-gray-500 text-sm mt-1">Download your LLC formation documents.</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-[3px] border-[#1a56ff]/20 border-t-[#1a56ff] rounded-full animate-spin" />
        </div>
      ) : documents.length === 0 ? (
        <EmptyDocs />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {documents.map(doc => <DocCard key={doc.id} doc={doc} />)}
        </div>
      )}
    </div>
  )
}

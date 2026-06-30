import { useRef, useState } from 'react'
import { Upload, CheckCircle, Clock, User, MapPin } from 'lucide-react'
import ClientLayout from './ClientLayout'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { useDocumentUpload } from '../../hooks/useDocumentUpload'
import { useDocuments } from '../../hooks/useDocuments'
import { useLang } from '../../i18n/LanguageContext'

interface VerificationType {
  id: string
  title: string
  subtitle: string
  docType: string
  icon: React.ElementType
}

const VERIFICATION_TYPES: VerificationType[] = [
  {
    id: 'id_verification',
    title: 'ID Verification',
    subtitle: 'Government-issued ID',
    docType: 'id_document',
    icon: User,
  },
  {
    id: 'address_verification',
    title: 'Address Verification',
    subtitle: 'Proof of Address',
    docType: 'proof_of_address',
    icon: MapPin,
  },
]

function VerificationRow({
  type,
  userId,
  existingDoc,
}: {
  type: VerificationType
  userId: string
  existingDoc?: { status: string; createdAt: string } | null
}) {
  const { t } = useLang()
  const vp = t.client.verificationsPage
  const fileRef = useRef<HTMLInputElement>(null)
  const { uploading, progress, error, upload } = useDocumentUpload({ userId })
  const Icon = type.icon
  const [uploaded, setUploaded] = useState(false)

  const isSubmitted = uploaded || !!existingDoc
  const submittedDate = existingDoc?.createdAt
    ? new Date(existingDoc.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const ok = await upload(file, type.docType)
    if (ok) setUploaded(true)
    e.target.value = ''
  }

  return (
    <tr className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50 transition-colors">
      <td className="px-5 py-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center flex-shrink-0">
            <Icon size={16} className="text-slate-500" />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">{type.title}</p>
            <p className="text-xs text-slate-500">{type.subtitle}</p>
          </div>
        </div>
      </td>

      <td className="px-5 py-4">
        {isSubmitted ? (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border bg-green-50 border-green-200 text-green-700">
            <CheckCircle size={11} />
            {vp.submitted}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border bg-slate-100 border-slate-200 text-slate-500">
            <Clock size={11} />
            {vp.notSubmitted}
          </span>
        )}
      </td>

      <td className="px-5 py-4 text-xs text-slate-400">
        {isSubmitted ? submittedDate : '\u2014'}
      </td>

      <td className="px-5 py-4">
        {uploading ? (
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
              <div className="h-full bg-[#1a56ff] rounded-full transition-all" style={{ width: `${progress}%` }} />
            </div>
            <span className="text-xs text-slate-400">{progress}%</span>
          </div>
        ) : (
          <>
            <button
              onClick={() => fileRef.current?.click()}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-[#1a56ff] text-white rounded-lg hover:bg-[#3a76ff] transition-colors"
            >
              <Upload size={12} />
              {vp.upload}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png,.webp"
              className="hidden"
              onChange={handleFileChange}
            />
          </>
        )}
        {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
      </td>
    </tr>
  )
}

export default function ClientVerificationsPage() {
  const { t } = useLang()
  const vp = t.client.verificationsPage
  const { user, isLoading: authLoading } = useRequireAuth()
  const { documents } = useDocuments(user?.id)

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56ff]" />
      </div>
    )
  }

  const idDoc = documents.find(d => d.docType === 'id_document') ?? null
  const addressDoc = documents.find(d => d.docType === 'proof_of_address') ?? null

  return (
    <ClientLayout currentPath="/client/verifications" title={t.client.nav.verifications}>
      <div className="max-w-3xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">{t.client.nav.verifications}</h2>
          <p className="text-slate-500 text-sm mt-0.5">{vp.subtitle}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{vp.verificationType}</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{vp.status}</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{vp.submittedDate}</th>
                <th className="px-5 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{vp.actions}</th>
              </tr>
            </thead>
            <tbody>
              {user && (
                <>
                  {VERIFICATION_TYPES[0] && <VerificationRow type={VERIFICATION_TYPES[0]} userId={user.id} existingDoc={idDoc} />}
                  {VERIFICATION_TYPES[1] && <VerificationRow type={VERIFICATION_TYPES[1]} userId={user.id} existingDoc={addressDoc} />}
                </>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-5 bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <div className="w-5 h-5 bg-amber-400 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <span className="text-white text-xs font-bold">!</span>
          </div>
          <div>
            <p className="text-amber-800 text-sm font-medium">{vp.whyNeeded}</p>
            <p className="text-amber-700 text-xs mt-0.5">{vp.whyNeededDesc}</p>
          </div>
        </div>
      </div>
    </ClientLayout>
  )
}

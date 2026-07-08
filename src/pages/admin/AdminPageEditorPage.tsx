import { useState, useEffect } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, Save, Globe, Lock, CheckCircle, Loader2, Plus, Trash2 } from 'lucide-react'
import { pb } from '../../lib/pocketbase'
import { useRequireAdmin } from '../../hooks/useRequireAuth'
import { invalidatePageCache, PageRecord } from '../../hooks/usePageContent'
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal'

const SYSTEM_PAGE_LOOKUP: Record<string, { titleEn: string; titleAr: string }> = {
  'privacy-policy': { titleEn: 'Privacy Policy', titleAr: 'سياسة الخصوصية' },
  'terms-of-service': { titleEn: 'Terms of Service', titleAr: 'شروط الخدمة' },
  'refund-policy': { titleEn: 'Refund Policy', titleAr: 'سياسة الاسترداد' },
  'legal-disclaimer': { titleEn: 'Legal Disclaimer', titleAr: 'إخلاء المسؤولية القانونية' },
  'accessibility': { titleEn: 'Accessibility Statement', titleAr: 'بيان إمكانية الوصول' },
  'kyc-aml': { titleEn: 'KYC & AML Policy', titleAr: 'سياسة اعرف عميلك ومكافحة غسيل الأموال' }
}

export default function AdminPageEditorPage() {
  useRequireAdmin()
  const { id } = useParams({ strict: false }) as { id: string }
  const navigate = useNavigate()

  const [pageData, setPageData] = useState<Partial<PageRecord>>({
    slug: '',
    title_en: '',
    title_ar: '',
    content_en: '',
    content_ar: '',
    active: true
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [slugError, setSlugError] = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const isNew = id === 'new'
  const isSystemPage = SYSTEM_PAGE_LOOKUP[pageData.slug || ''] !== undefined

  useEffect(() => {
    void (async () => {
      const isRecordId = id.length === 15 && !id.includes('-') && id !== 'new'
      
      try {
        let record: PageRecord
        if (id === 'new') {
          setPageData({
            slug: '',
            title_en: '',
            title_ar: '',
            content_en: '',
            content_ar: '',
            active: true
          })
        } else if (isRecordId) {
          record = await pb.collection('pages').getOne<PageRecord>(id)
          setPageData(record)
        } else {
          // It is a slug, try to fetch by slug query
          record = await pb.collection('pages').getFirstListItem<PageRecord>(`slug = "${id}"`)
          setPageData(record)
        }
      } catch (err) {
        if (id !== 'new') {
          // Page record doesn't exist yet, seed local state with system lookup defaults
          const defaults = SYSTEM_PAGE_LOOKUP[id] || { titleEn: '', titleAr: '' }
          setPageData({
            slug: id,
            title_en: defaults.titleEn,
            title_ar: defaults.titleAr,
            content_en: '',
            content_ar: '',
            active: true
          })
        }
      }
      setLoading(false)
    })()
  }, [id])

  const handleSlugChange = (val: string) => {
    const sanitized = val.toLowerCase().replace(/[^a-z0-9-]/g, '')
    setPageData(prev => ({ ...prev, slug: sanitized }))
    
    if (SYSTEM_PAGE_LOOKUP[sanitized] !== undefined) {
      setSlugError('This slug is reserved for system pages.')
    } else {
      setSlugError('')
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!pageData.slug) {
      setSlugError('Slug is required.')
      return
    }
    if (slugError) return

    setSaving(true)
    try {
      const data = {
        slug: pageData.slug,
        title_en: pageData.title_en,
        title_ar: pageData.title_ar,
        content_en: pageData.content_en,
        content_ar: pageData.content_ar,
        active: pageData.active
      }

      let savedRecord: PageRecord
      if (pageData.id) {
        // Double-check slug uniqueness for updates
        try {
          const existing = await pb.collection('pages').getFirstListItem<PageRecord>(`slug = "${pageData.slug}" && id != "${pageData.id}"`)
          if (existing) {
            setSlugError('A page with this slug already exists.')
            setSaving(false)
            return
          }
        } catch {
          // Safe to proceed
        }
        savedRecord = await pb.collection('pages').update<PageRecord>(pageData.id, data)
      } else {
        // Double-check slug uniqueness for new pages
        try {
          const existing = await pb.collection('pages').getFirstListItem<PageRecord>(`slug = "${pageData.slug}"`)
          if (existing) {
            setSlugError('A page with this slug already exists.')
            setSaving(false)
            return
          }
        } catch {
          // Safe to proceed, slug is unique
        }
        savedRecord = await pb.collection('pages').create<PageRecord>(data)
      }

      setPageData(savedRecord)
      invalidatePageCache(pageData.slug)
      setSaved(true)
      setTimeout(() => setSaved(false), 2500)
      if (isNew) {
        navigate({ to: '/admin/pages/$id/edit', params: { id: savedRecord.id }, replace: true })
      }
    } catch (err) {
      console.error('Failed to save page customizations:', err)
    }
    setSaving(false)
  }

  const handleDelete = async () => {
    if (!pageData.id) return
    setDeleting(true)
    try {
      await pb.collection('pages').delete(pageData.id)
      invalidatePageCache(pageData.slug)
      navigate({ to: '/admin/pages' })
    } catch (err) {
      console.error('Failed to delete page:', err)
    } finally {
      setDeleting(false)
      setShowDeleteModal(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="animate-spin text-slate-400" size={32} />
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Back Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate({ to: '/admin/pages' })}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h2 className="text-xl font-bold text-slate-900">
              {isNew ? 'Create Custom Page' : `Edit Page: /${pageData.slug}`}
            </h2>
            <p className="text-slate-500 text-sm mt-0.5">
              Updates will take effect on the public site immediately when active.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isNew && (
            <button
              onClick={() => navigate({ to: '/admin/pages/$id/edit', params: { id: 'new' } })}
              className="flex items-center gap-1 px-4 py-2 text-slate-700 border border-slate-200 text-sm font-semibold rounded-xl hover:bg-slate-50 transition-colors"
            >
              <Plus size={14} /> Add Page
            </button>
          )}
          {!isNew && !isSystemPage && (
            <button
              type="button"
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-1 px-4 py-2 text-red-600 border border-red-200 text-sm font-semibold rounded-xl hover:bg-red-50 hover:border-red-300 transition-colors"
            >
              <Trash2 size={14} /> Delete
            </button>
          )}
          <button
            onClick={() => navigate({ to: '/admin/pages' })}
            className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="page-editor-form"
            disabled={saving || !!slugError}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#1a56ff] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors"
          >
            {saving ? <Loader2 size={14} className="animate-spin" /> : saved ? <CheckCircle size={14} /> : <Save size={14} />}
            {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Page'}
          </button>
        </div>
      </div>

      {/* Editor Form */}
      <form id="page-editor-form" onSubmit={e => void handleSave(e)} className="space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
          {/* Status and Slug */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Page Slug / Route</label>
              {isSystemPage && !isNew ? (
                <input
                  disabled
                  value={pageData.slug || ''}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-100 font-mono text-slate-500 cursor-not-allowed"
                />
              ) : (
                <div>
                  <input
                    required
                    value={pageData.slug || ''}
                    onChange={e => handleSlugChange(e.target.value)}
                    placeholder="e.g. about-us"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-400"
                  />
                  {slugError && (
                    <p className="text-red-500 text-xs mt-1 font-semibold">{slugError}</p>
                  )}
                  <p className="text-slate-400 text-[10px] mt-1">
                    Route will be: <code className="font-mono bg-slate-100 px-1 py-0.5 rounded">/p/{pageData.slug || 'slug'}</code>
                  </p>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between mt-6 md:mt-0">
              <div>
                <p className="text-sm font-semibold text-slate-800">Publish Status</p>
                <p className="text-xs text-slate-400">Toggle whether to make the page live.</p>
              </div>
              <button
                type="button"
                onClick={() => setPageData(prev => ({ ...prev, active: !prev.active }))}
                className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border text-xs font-bold transition-all ${
                  pageData.active
                    ? 'bg-green-50 border-green-200 text-green-700'
                    : 'bg-amber-50 border-amber-200 text-amber-700'
                }`}
              >
                {pageData.active ? <Globe size={13} /> : <Lock size={13} />}
                {pageData.active ? 'Active (Live)' : 'Draft (Inactive)'}
              </button>
            </div>
          </div>

          {/* Titles Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5">Page Title (English)</label>
              <input
                required
                value={pageData.title_en || ''}
                onChange={e => setPageData(prev => ({ ...prev, title_en: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400"
                placeholder="e.g. Privacy Policy"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1.5 text-right">العنوان (بالعربية)</label>
              <input
                required
                dir="rtl"
                value={pageData.title_ar || ''}
                onChange={e => setPageData(prev => ({ ...prev, title_ar: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-right focus:ring-2 focus:ring-blue-400"
                placeholder="مثال: سياسة الخصوصية"
              />
            </div>
          </div>

          {/* Body Content Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* English Content */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600">English Content (HTML / Markdown-safe)</label>
              <textarea
                rows={16}
                value={pageData.content_en || ''}
                onChange={e => setPageData(prev => ({ ...prev, content_en: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-400"
                placeholder="Write page content in English. HTML tags are supported..."
              />
            </div>
            {/* Arabic Content */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-600 text-right">المحتوى باللغة العربية (HTML / متوافق مع Markdown)</label>
              <textarea
                rows={16}
                dir="rtl"
                value={pageData.content_ar || ''}
                onChange={e => setPageData(prev => ({ ...prev, content_ar: e.target.value }))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono text-right focus:ring-2 focus:ring-blue-400"
                placeholder="اكتب محتوى الصفحة باللغة العربية. يدعم وسوم HTML..."
              />
            </div>
          </div>
        </div>
      </form>

      {showDeleteModal && (
        <DeleteConfirmModal
          title="Delete Custom Page"
          itemName={pageData.title_en ?? 'this page'}
          loading={deleting}
          onConfirm={() => void handleDelete()}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  )
}

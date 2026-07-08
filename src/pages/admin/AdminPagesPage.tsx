import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { FileText, Search, Edit, Eye, ShieldAlert, Loader2, Plus, Trash2 } from 'lucide-react'
import { pb } from '../../lib/pocketbase'
import { useRequireAdmin } from '../../hooks/useRequireAuth'
import { PageRecord, invalidatePageCache } from '../../hooks/usePageContent'
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal'

const SYSTEM_PAGES = [
  { slug: 'privacy-policy', titleEn: 'Privacy Policy', titleAr: 'سياسة الخصوصية' },
  { slug: 'terms-of-service', titleEn: 'Terms of Service', titleAr: 'شروط الخدمة' },
  { slug: 'refund-policy', titleEn: 'Refund Policy', titleAr: 'سياسة الاسترداد' },
  { slug: 'legal-disclaimer', titleEn: 'Legal Disclaimer', titleAr: 'إخلاء المسؤولية القانونية' },
  { slug: 'accessibility', titleEn: 'Accessibility Statement', titleAr: 'بيان إمكانية الوصول' },
  { slug: 'kyc-aml', titleEn: 'KYC & AML Policy', titleAr: 'سياسة اعرف عميلك ومكافحة غسيل الأموال' }
]

const SYSTEM_SLUGS = SYSTEM_PAGES.map(p => p.slug)

export default function AdminPagesPage() {
  useRequireAdmin()
  const [dbPages, setDbPages] = useState<PageRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchPages = async () => {
    setLoading(true)
    try {
      const records = await pb.collection('pages').getFullList<PageRecord>()
      setDbPages(records)
    } catch (err) {
      console.error('Error loading pages:', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    void fetchPages()
  }, [])

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await pb.collection('pages').delete(deletingId)
      setDbPages(prev => prev.filter(p => p.id !== deletingId))
      setDeletingId(null)
      invalidatePageCache()
    } catch (err) {
      console.error('Failed to delete page:', err)
    }
  }

  // Pre-populate system pages mapping
  const systemMapped = SYSTEM_PAGES.map(sp => {
    const matched = dbPages.find(p => p.slug === sp.slug)
    return {
      slug: sp.slug,
      titleEn: sp.titleEn,
      titleAr: sp.titleAr,
      isSystem: true,
      status: matched ? (matched.active ? 'Customized (Live)' : 'Customized (Draft)') : 'Default Static Text',
      statusStyle: matched 
        ? (matched.active ? 'bg-green-50 text-green-700 border-green-200' : 'bg-amber-50 text-amber-700 border-amber-200') 
        : 'bg-slate-100 text-slate-500 border-slate-200',
      id: matched ? matched.id : sp.slug,
      active: matched ? matched.active : false
    }
  })

  // Custom pages from database (slugs not in SYSTEM_SLUGS)
  const customMapped = dbPages
    .filter(p => !SYSTEM_SLUGS.includes(p.slug))
    .map(p => ({
      slug: p.slug,
      titleEn: p.title_en,
      titleAr: p.title_ar,
      isSystem: false,
      status: p.active ? 'Custom (Live)' : 'Custom (Draft)',
      statusStyle: p.active ? 'bg-blue-50 text-blue-700 border-blue-200' : 'bg-slate-100 text-slate-500 border-slate-200',
      id: p.id,
      active: p.active
    }))

  const allPagesCombined = [...systemMapped, ...customMapped]

  const filtered = allPagesCombined.filter(page => {
    return !search ||
      page.titleEn.toLowerCase().includes(search.toLowerCase()) ||
      page.titleAr.includes(search) ||
      page.slug.toLowerCase().includes(search.toLowerCase())
  })

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Custom Pages Editor</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            Manage legal pages and create dynamic content pages in English and Arabic.
          </p>
        </div>
        <Link
          to="/admin/pages/$id/edit"
          params={{ id: 'new' }}
          className="bg-[#1a56ff] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-1.5"
        >
          <Plus size={16} /> Create Page
        </Link>
      </div>

      {/* Info Warning */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl px-5 py-4 flex items-start gap-3">
        <ShieldAlert size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-amber-800">Static Content Overrides & Routing</p>
          <p className="text-xs text-amber-700 mt-0.5">
            System pages override the built-in hardcoded translations when activated. Custom pages created here are dynamically routed at <code className="font-mono bg-amber-100/50 px-1 py-0.5 rounded">/p/slug-name</code>.
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm max-w-xs">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search pages…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
      </div>

      {/* Pages List */}
      {loading ? (
        <div className="flex items-center gap-3 py-12 justify-center">
          <Loader2 className="animate-spin text-[#1a56ff]" size={24} />
          <span className="text-slate-500 text-sm">Checking database pages…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <FileText size={40} className="text-slate-300 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-900 mb-1">No pages found</h3>
          <p className="text-slate-500 text-sm">Try adjusting your search terms or create a page.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold">Page Title</th>
                <th className="px-6 py-4 font-semibold">URL Slug</th>
                <th className="px-6 py-4 font-semibold">Type / Status</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(page => {
                return (
                  <tr key={page.slug} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#1a56ff] flex items-center justify-center flex-shrink-0">
                          <FileText size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{page.titleEn}</p>
                          <p className="text-xs text-slate-400 font-medium">{page.titleAr}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-mono text-slate-500">
                      {page.isSystem ? `/${page.slug}` : `/p/${page.slug}`}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${page.statusStyle}`}>
                        {page.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <a
                          href={page.isSystem ? `/${page.slug}` : `/p/${page.slug}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors flex items-center gap-1 mr-1"
                        >
                          <Eye size={13} /> View Live
                        </a>
                        <Link
                          to="/admin/pages/$id/edit"
                          params={{ id: page.id }}
                          className="bg-slate-100 text-slate-700 hover:bg-blue-50 hover:text-[#1a56ff] text-xs font-semibold px-3 py-1.5 rounded-lg border border-slate-200 hover:border-blue-200 transition-all flex items-center gap-1"
                        >
                          <Edit size={12} /> Edit
                        </Link>
                        {!page.isSystem && page.id !== page.slug && (
                          <button
                            onClick={() => setDeletingId(page.id)}
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                            title="Delete custom page"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <DeleteConfirmModal
          title="Delete Custom Page"
          itemName={dbPages.find(p => p.id === deletingId)?.title_en ?? 'this page'}
          loading={false}
          onConfirm={() => void handleDelete()}
          onClose={() => setDeletingId(null)}
        />
      )}
    </div>
  )
}

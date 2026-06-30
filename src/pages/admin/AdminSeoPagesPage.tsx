import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Globe, Plus, Search, Edit, Trash2, Eye, Calendar } from 'lucide-react'
import { useRequireAdmin } from '../../hooks/useRequireAuth'
import { useSeoPages, useDeleteSeoPage } from '../../hooks/useSeoPages'
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal'

export default function AdminSeoPagesPage() {
  useRequireAdmin()
  const { data: pages = [], isLoading } = useSeoPages()
  const deleteMutation = useDeleteSeoPage()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = pages.filter(p => {
    const matchesSearch = !search || p.countryName.toLowerCase().includes(search.toLowerCase()) || p.slug.includes(search.toLowerCase())
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'published' && p.published) || (statusFilter === 'draft' && !p.published)
    return matchesSearch && matchesStatus
  })

  return (
    <>
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Country SEO Pages</h2>
            <p className="text-slate-500 text-sm mt-0.5">
              {pages.length} page{pages.length !== 1 ? 's' : ''} · {pages.filter(p => p.published).length} published
            </p>
          </div>
          <Link
            to="/admin/seo/$id/edit"
            params={{ id: 'new' }}
            className="bg-[#1a56ff] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#1440d0] transition-colors flex items-center gap-1.5"
          >
            <Plus size={16} /> New Page
          </Link>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search countries…"
              className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff]"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as typeof statusFilter)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/20"
          >
            <option value="all">All</option>
            <option value="published">Published</option>
            <option value="draft">Drafts</option>
          </select>
        </div>

        {isLoading ? (
          <div className="flex items-center gap-3 py-12 justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1a56ff]" />
            <span className="text-slate-500 text-sm">Loading…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <Globe size={40} className="text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 mb-1">No pages found</h3>
            <p className="text-slate-500 text-sm mb-6">
              {search || statusFilter !== 'all' ? 'Try adjusting filters' : 'Create your first SEO landing page'}
            </p>
            {!search && statusFilter === 'all' && (
              <Link
                to="/admin/seo/$id/edit"
                params={{ id: 'new' }}
                className="inline-block bg-[#1a56ff] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#1440d0] transition-colors"
              >
                Create First Page
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Country</th>
                  <th className="px-5 py-3 text-left font-semibold hidden sm:table-cell">Slug</th>
                  <th className="px-5 py-3 text-center font-semibold hidden md:table-cell">Status</th>
                  <th className="px-5 py-3 text-left font-semibold hidden lg:table-cell">Updated</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#e8efff] text-[#1a56ff] flex items-center justify-center flex-shrink-0 font-bold text-xs">
                          {p.countryCode}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{p.countryName}</p>
                          <p className="text-xs text-slate-400">{p.metaTitle.slice(0, 50)}…</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <span className="text-xs font-mono text-slate-500">/{p.slug}</span>
                    </td>
                    <td className="px-5 py-4 text-center hidden md:table-cell">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        p.published ? 'bg-green-50 border-green-200 text-green-700' : 'bg-amber-50 border-amber-200 text-amber-700'
                      }`}>
                        {p.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-4 hidden lg:table-cell">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar size={11} />
                        {new Date(p.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to="/us-company/$slug"
                          params={{ slug: p.slug }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#1a56ff] hover:bg-[#e8efff] transition-all"
                          title="View"
                        >
                          <Eye size={14} />
                        </Link>
                        <Link
                          to="/admin/seo/$id/edit"
                          params={{ id: p.id }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          onClick={() => setDeletingId(p.id)}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-all"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {deletingId && (
        <DeleteConfirmModal
          title="Delete SEO Page"
          itemName={pages.find(p => p.id === deletingId)?.countryName ?? 'this page'}
          loading={deleteMutation.isPending}
          onConfirm={() => deleteMutation.mutate(deletingId, { onSuccess: () => setDeletingId(null) })}
          onClose={() => setDeletingId(null)}
        />
      )}
    </>
  )
}

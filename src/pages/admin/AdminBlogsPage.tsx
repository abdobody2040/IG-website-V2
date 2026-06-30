import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { FileText, Plus, Search, Eye, Edit, Trash2, Globe, Lock, Star, Calendar } from 'lucide-react'
import { useRequireAdmin } from '../../hooks/useRequireAuth'
import { useBlogs, useDeleteBlog } from '../../hooks/useBlogs'
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal'

export default function AdminBlogsPage() {
  useRequireAdmin()
  const { data: blogs = [], isLoading } = useBlogs()
  const deleteMutation = useDeleteBlog()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'published' | 'draft'>('all')
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const filtered = blogs.filter(b => {
    const matchesSearch = !search || b.title.toLowerCase().includes(search.toLowerCase()) || b.tags.some(t => t.toLowerCase().includes(search.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || (statusFilter === 'published' && b.published) || (statusFilter === 'draft' && !b.published)
    return matchesSearch && matchesStatus
  })

  return (
    <>
      <div className="max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Blog Posts</h2>
            <p className="text-slate-500 text-sm mt-0.5">
              {blogs.length} post{blogs.length !== 1 ? 's' : ''} · {blogs.filter(b => b.published).length} published
            </p>
          </div>
          <Link
            to="/admin/blogs/$id/edit"
            params={{ id: 'new' }}
            className="bg-[#1a56ff] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-[#1440d0] transition-colors flex items-center gap-1.5"
          >
            <Plus size={16} /> New Post
          </Link>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search posts…"
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

        {/* Loading */}
        {isLoading ? (
          <div className="flex items-center gap-3 py-12 justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1a56ff]" />
            <span className="text-slate-500 text-sm">Loading posts…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
            <FileText size={40} className="text-slate-300 mx-auto mb-4" />
            <h3 className="font-semibold text-slate-900 mb-1">No posts found</h3>
            <p className="text-slate-500 text-sm mb-6">
              {search || statusFilter !== 'all' ? 'Try adjusting your filters' : 'Write your first blog post'}
            </p>
              {!search && statusFilter === 'all' && (
              <Link
                to="/admin/blogs/$id/edit"
                params={{ id: 'new' }}
                className="inline-block bg-[#1a56ff] text-white text-sm font-semibold px-6 py-2.5 rounded-xl hover:bg-[#1440d0] transition-colors"
              >
                Create First Post
              </Link>
            )}
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <table className="w-full">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Post</th>
                  <th className="px-5 py-3 text-left font-semibold hidden sm:table-cell">Tags</th>
                  <th className="px-5 py-3 text-center font-semibold hidden md:table-cell">Status</th>
                  <th className="px-5 py-3 text-center font-semibold hidden md:table-cell">Featured</th>
                  <th className="px-5 py-3 text-left font-semibold hidden lg:table-cell">Date</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(post => (
                  <tr key={post.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-[#e8efff] text-[#1a56ff] flex items-center justify-center flex-shrink-0">
                          <FileText size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900 line-clamp-1">{post.title}</p>
                          <p className="text-xs text-slate-400">/{post.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 hidden sm:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {post.tags.slice(0, 3).map(tag => (
                          <span key={tag} className="text-xs bg-slate-100 text-slate-600 rounded-full px-2 py-0.5">
                            {tag}
                          </span>
                        ))}
                        {post.tags.length > 3 && (
                          <span className="text-xs text-slate-400">+{post.tags.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center hidden md:table-cell">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        post.published
                          ? 'bg-green-50 border-green-200 text-green-700'
                          : 'bg-amber-50 border-amber-200 text-amber-700'
                      }`}>
                        {post.published ? <Globe size={11} /> : <Lock size={11} />}
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-center hidden md:table-cell">
                      {post.featured ? (
                        <Star size={14} className="text-amber-400 inline-block fill-amber-400" />
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>
                    <td className="px-5 py-4 text-left hidden lg:table-cell">
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        <Calendar size={11} />
                        {new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          to="/blog/$slug"
                          params={{ slug: post.slug }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-[#1a56ff] hover:bg-[#e8efff] transition-all"
                          title="View"
                        >
                          <Eye size={14} />
                        </Link>
                        <Link
                          to="/admin/blogs/$id/edit"
                          params={{ id: post.id }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </Link>
                        <button
                          onClick={() => setDeletingId(post.id)}
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
          title="Delete Blog Post"
          itemName={blogs.find(b => b.id === deletingId)?.title ?? 'this post'}
          loading={deleteMutation.isPending}
          onConfirm={() => {
            deleteMutation.mutate(deletingId, {
              onSuccess: () => setDeletingId(null),
            })
          }}
          onClose={() => setDeletingId(null)}
        />
      )}
    </>
  )
}

import { useState, useEffect } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Save, Loader2, Eye, Globe, Star, Languages } from 'lucide-react'
import { useRequireAdmin } from '../../hooks/useRequireAuth'
import { useCreateBlog, useUpdateBlog } from '../../hooks/useBlogs'
import { pb } from '../../lib/pocketbase'
import type { BlogFormData } from '../../types/db'

export default function AdminBlogEditorPage() {
  useRequireAdmin()
  const params = useParams({ from: '/admin/blogs/$id/edit' })
  const id = params.id
  const navigate = useNavigate()
  const isNew = id === 'new'

  const [form, setForm] = useState<BlogFormData>({
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    author: 'Instant Grow Team',
    tags: '',
    published: false,
    featured: false,
    language: 'en',
    titleAr: '',
    slugAr: '',
    excerptAr: '',
    contentAr: '',
  })
  const [saving, setSaving] = useState(false)
  const [slugEdited, setSlugEdited] = useState(false)
  const [arOpen, setArOpen] = useState(false)

  const createMutation = useCreateBlog()
  const updateMutation = useUpdateBlog()

  useEffect(() => {
    if (isNew) return
    const load = async () => {
      try {
        const record = await pb.collection('blogs').getOne(id)
        if (record) {
          const b = record as unknown as Record<string, unknown>
          setForm({
            title: b.title as string,
            slug: b.slug as string,
            excerpt: b.excerpt as string || '',
            content: b.content as string,
            coverImage: b.cover_image as string || '',
            author: b.author as string,
            tags: ((b.tags as string[]) || []).join(', '),
            published: b.published as boolean,
            featured: b.featured as boolean,
            language: (b.language as string) || 'en',
            titleAr: (b.title_ar as string) || '',
            slugAr: (b.slug_ar as string) || '',
            excerptAr: (b.excerpt_ar as string) || '',
            contentAr: (b.content_ar as string) || '',
          })
        }
      } catch (err) {
        console.error('Failed to load blog post details:', err)
      }
      setSaving(false)
    }
    load()
  }, [id])

  function generateSlug(title: string) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
  }

  function handleTitleChange(value: string) {
    setForm(f => ({ ...f, title: value }))
    if (!slugEdited) {
      setForm(f => ({ ...f, slug: generateSlug(value) }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      if (isNew) {
        await createMutation.mutateAsync(form)
      } else {
        await updateMutation.mutateAsync({ id, form })
      }
      navigate({ to: '/admin/blogs' })
    } catch {
      // error handled by mutation
    } finally {
      setSaving(false)
    }
  }

  if (!isNew && saving) {
    return (
      <>
        <div className="flex items-center justify-center py-20">
          <Loader2 size={24} className="animate-spin text-[#1a56ff]" />
        </div>
      </>
    )
  }

  const previewSlug = form.slug || generateSlug(form.title)

  return (
    <>
      <div className="max-w-4xl">
        <button
          onClick={() => navigate({ to: '/admin/blogs' })}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-5 transition-colors"
        >
          <ArrowLeft size={14} /> Back to posts
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Title *</label>
            <input
              required
              value={form.title}
              onChange={e => handleTitleChange(e.target.value)}
              placeholder="Enter post title…"
              className="w-full px-4 py-3 text-lg font-semibold border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff]"
            />
          </div>

          {/* Slug */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Slug <span className="font-normal normal-case text-slate-400">(URL path)</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">/blog/</span>
              <input
                required
                value={form.slug}
                onChange={e => { setSlugEdited(true); setForm(f => ({ ...f, slug: e.target.value })) }}
                placeholder="my-post-title"
                className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff] font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Excerpt</label>
              <textarea
                value={form.excerpt}
                onChange={e => setForm(f => ({ ...f, excerpt: e.target.value }))}
                rows={3}
                placeholder="Brief summary of the post…"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff] resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Cover Image URL</label>
              <input
                value={form.coverImage}
                onChange={e => setForm(f => ({ ...f, coverImage: e.target.value }))}
                placeholder="https://example.com/image.jpg"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff]"
              />
              {form.coverImage && (
                <img src={form.coverImage} alt="Preview" className="mt-2 h-24 w-full object-cover rounded-lg border border-slate-200" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Author</label>
              <input
                value={form.author}
                onChange={e => setForm(f => ({ ...f, author: e.target.value }))}
                placeholder="Instant Grow Team"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Tags <span className="font-normal normal-case text-slate-400">(comma-separated)</span>
              </label>
              <input
                value={form.tags}
                onChange={e => setForm(f => ({ ...f, tags: e.target.value }))}
                placeholder="LLC, Compliance, Tax Tips"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff]"
              />
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Content *</label>
            <textarea
              required
              value={form.content}
              onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
              rows={16}
              placeholder="Write your blog post content here. Markdown supported…"
              className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff] font-mono resize-y"
            />
            <p className="text-xs text-slate-400 mt-1">Supports markdown formatting</p>
          </div>

          {/* Arabic Content */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden">
            <button
              type="button"
              onClick={() => setArOpen(!arOpen)}
              className="w-full flex items-center justify-between px-5 py-4 bg-slate-50 hover:bg-slate-100 transition-colors"
            >
              <span className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Languages size={16} className="text-emerald-600" />
                Arabic Content
              </span>
              <svg className={`w-4 h-4 text-slate-400 transition-transform ${arOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
            </button>
            {arOpen && (
              <div className="p-5 space-y-5 border-t border-slate-200">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Arabic Title</label>
                  <input
                    value={form.titleAr}
                    onChange={e => setForm(f => ({ ...f, titleAr: e.target.value }))}
                    placeholder="العنوان بالعربية"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff]"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Arabic Slug</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-400">/blog/</span>
                    <input
                      value={form.slugAr}
                      onChange={e => setForm(f => ({ ...f, slugAr: e.target.value }))}
                      placeholder="arabic-post-slug"
                      className="flex-1 px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff] font-mono"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Arabic Excerpt</label>
                  <textarea
                    value={form.excerptAr}
                    onChange={e => setForm(f => ({ ...f, excerptAr: e.target.value }))}
                    rows={3}
                    placeholder="ملخص المقال بالعربية"
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff] resize-none"
                    dir="rtl"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">Arabic Content</label>
                  <textarea
                    value={form.contentAr}
                    onChange={e => setForm(f => ({ ...f, contentAr: e.target.value }))}
                    rows={12}
                    placeholder="محتوى المقال بالعربية"
                    className="w-full px-4 py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff] font-mono resize-y"
                    dir="rtl"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Publishing options */}
          <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 flex flex-wrap gap-6">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.published}
                onChange={e => setForm(f => ({ ...f, published: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-[#1a56ff] focus:ring-[#1a56ff]/20"
              />
              <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Globe size={14} /> Published
              </span>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={e => setForm(f => ({ ...f, featured: e.target.checked }))}
                className="w-4 h-4 rounded border-slate-300 text-amber-400 focus:ring-amber-400/20"
              />
              <span className="text-sm font-medium text-slate-700 flex items-center gap-1.5">
                <Star size={14} className="text-amber-400" /> Featured
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 pb-12">
            <Link
              to="/blog/$slug"
              params={{ slug: previewSlug }}
              className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#1a56ff] transition-colors"
            >
              <Eye size={14} /> Preview
            </Link>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => navigate({ to: '/admin/blogs' })}
                className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1a56ff] text-white text-sm font-semibold hover:bg-[#1440d0] transition-colors disabled:opacity-70"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                {isNew ? 'Publish' : 'Save Changes'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  )
}

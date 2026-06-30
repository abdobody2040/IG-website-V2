import { useState, useEffect } from 'react'
import { Link } from '@tanstack/react-router'
import { Calendar, ArrowRight, Search, FileText, User } from 'lucide-react'
import { useBlogs } from '../hooks/useBlogs'
import { useLang } from '../i18n/LanguageContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { setPageMeta, injectBreadcrumb, getCanonical } from '../lib/seo'

export default function BlogListPage() {
  const { t, isRTL } = useLang()
  const b = t.blog
  const s = t.seo.blog
  const { data: blogs = [], isLoading } = useBlogs({ published: true })
  const [search, setSearch] = useState('')
  const [activeTag, setActiveTag] = useState<string | null>(null)

  useEffect(() => {
    setPageMeta({
      title: s.title,
      description: s.description,
      keywords: s.keywords,
      canonical: getCanonical('/blog'),
    })
    injectBreadcrumb([
      { name: isRTL ? 'الرئيسية' : 'Home', url: getCanonical('/') },
      { name: isRTL ? 'المدونة' : 'Blog', url: getCanonical('/blog') },
    ])
  }, [s, isRTL])


  const featuredPosts = blogs.filter(b => b.featured)
  const featuredPost = featuredPosts[0]
  const allTags = [...new Set(blogs.flatMap(b => b.tags))].sort()

  const filtered = blogs.filter(b => {
    const title = (isRTL && b.titleAr) ? b.titleAr : b.title
    const excerpt = (isRTL && b.excerptAr) ? b.excerptAr : (b.excerpt || '')
    const matchesSearch = !search || title.toLowerCase().includes(search.toLowerCase()) || excerpt.toLowerCase().includes(search.toLowerCase())
    const matchesTag = !activeTag || b.tags.includes(activeTag)
    const isNotFeatured = !b.featured || !featuredPost || b.id !== featuredPost.id
    return matchesSearch && matchesTag && isNotFeatured
  })

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  function formatDateShort(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short', day: 'numeric' })
  }

  function postTitle(post: typeof blogs[0]) { return (isRTL && post.titleAr) ? post.titleAr : post.title }
  function postExcerpt(post: typeof blogs[0]) { return (isRTL && post.excerptAr) ? post.excerptAr : (post.excerpt || '') }
  function postSlug(post: typeof blogs[0]) { return (isRTL && post.slugAr) ? post.slugAr : post.slug }


  return (
    <div className="min-h-screen bg-white font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />
      <main>
        <section className="bg-gradient-to-b from-slate-50 to-white py-16 sm:py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-3">{b.title}</h1>
            <p className="text-slate-500 text-sm sm:text-base max-w-xl mx-auto mb-8">{b.subtitle}</p>
            <div className="relative max-w-md mx-auto">
              <Search size={16} className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 text-slate-400`} />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={b.searchPlaceholder}
                className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-3 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff] bg-white`}
              />
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
          {featuredPost && (
            <section className="mb-12">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">{b.featuredArticle}</h2>
              <Link
                to="/blog/$slug"
                params={{ slug: postSlug(featuredPost) }}
                className="block bg-gradient-to-br from-[#1a56ff]/5 to-[#1a56ff]/10 rounded-3xl border border-[#1a56ff]/20 overflow-hidden hover:shadow-lg transition-all group"
              >
                <div className={`flex flex-col sm:flex-row ${isRTL ? 'sm:flex-row-reverse' : ''}`}>
                  {featuredPost.coverImage && (
                    <div className="sm:w-2/5 h-48 sm:h-auto">
                      <img src={featuredPost.coverImage} alt={postTitle(featuredPost)} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-6 sm:p-8 flex flex-col justify-center flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#1a56ff] text-white">{b.featured}</span>
                      {featuredPost.tags.slice(0, 2).map(t => (
                        <span key={t} className="text-xs text-slate-500 bg-white rounded-full px-2 py-0.5 border border-slate-200">{t}</span>
                      ))}
                    </div>
                    <h3 className="text-xl sm:text-2xl font-bold text-slate-900 mb-2 group-hover:text-[#1a56ff] transition-colors">{postTitle(featuredPost)}</h3>
                    {postExcerpt(featuredPost) && <p className="text-sm text-slate-500 mb-4 line-clamp-2">{postExcerpt(featuredPost)}</p>}
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1"><User size={12} /> {featuredPost.author}</span>
                      <span className="flex items-center gap-1"><Calendar size={12} /> {formatDate(featuredPost.createdAt)}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </section>
          )}

          {allTags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-8">
              <button
                onClick={() => setActiveTag(null)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${!activeTag ? 'bg-[#1a56ff] text-white border-[#1a56ff]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#1a56ff]/30'}`}
              >
                {b.all}
              </button>
              {allTags.map(tag => (
                <button
                  key={tag}
                  onClick={() => setActiveTag(activeTag === tag ? null : tag)}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${activeTag === tag ? 'bg-[#1a56ff] text-white border-[#1a56ff]' : 'bg-white text-slate-600 border-slate-200 hover:border-[#1a56ff]/30'}`}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}

          {isLoading ? (
            <div className="flex items-center gap-3 py-12 justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1a56ff]" />
              <span className="text-slate-500 text-sm">{b.loadingArticles}</span>
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12">
              <FileText size={40} className="text-slate-300 mx-auto mb-4" />
              <h3 className="font-semibold text-slate-900 mb-1">{b.noArticlesFound}</h3>
              <p className="text-sm text-slate-500">{search ? b.tryDifferentSearch : b.checkBackSoon}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(post => (
                <Link
                  key={post.id}
                  to="/blog/$slug"
                  params={{ slug: postSlug(post) }}
                  className="group bg-white rounded-2xl border border-slate-200 overflow-hidden hover:shadow-md hover:border-[#1a56ff]/20 transition-all"
                >
                  {post.coverImage ? (
                    <div className="h-40 overflow-hidden">
                      <img src={post.coverImage} alt={postTitle(post)} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    </div>
                  ) : (
                    <div className="h-40 bg-gradient-to-br from-[#1a56ff]/5 to-slate-50 flex items-center justify-center">
                      <FileText size={32} className="text-[#1a56ff]/30" />
                    </div>
                  )}
                  <div className="p-5">
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {post.tags.slice(0, 2).map(t => (
                        <span key={t} className="text-[10px] font-semibold text-slate-500 bg-slate-100 rounded-full px-2 py-0.5">{t}</span>
                      ))}
                    </div>
                    <h3 className="font-semibold text-slate-900 mb-1.5 group-hover:text-[#1a56ff] transition-colors line-clamp-2">{postTitle(post)}</h3>
                    {postExcerpt(post) && <p className="text-xs text-slate-500 line-clamp-2 mb-3">{postExcerpt(post)}</p>}
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Calendar size={10} /> {formatDateShort(post.createdAt)}
                      </span>
                      <span className={`text-xs font-semibold text-[#1a56ff] flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity ${isRTL ? 'flex-row-reverse' : ''}`}>
                        {b.read} {isRTL ? <ArrowRight size={10} className="rotate-180" /> : <ArrowRight size={10} />}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  )
}

import { useEffect } from 'react'
import { Link, useParams } from '@tanstack/react-router'
import { Calendar, User, ArrowLeft, ArrowRight, Share2, Tag, Loader2 } from 'lucide-react'
import { useBlogBySlug } from '../hooks/useBlogs'
import { useLang } from '../i18n/LanguageContext'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import { setPageMeta, injectJsonLd, generateArticleSchema, injectBreadcrumb, getCanonical } from '../lib/seo'

export default function BlogDetailPage() {
  const { slug } = useParams({ from: '/blog/$slug' })
  const { data: post, isLoading, error } = useBlogBySlug(slug)
  const { t, isRTL, lang } = useLang()
  const b = t.blog

  const content = post ? ((isRTL && post.contentAr) || post.content) : ''
  const title = post && (isRTL && post.titleAr ? post.titleAr : post.title)

  useEffect(() => {
    if (!post) return
    const excerpt = (isRTL && post.excerptAr) ? post.excerptAr : post.excerpt
    setPageMeta({
      title: `${title} | Instant Grow`,
      description: excerpt || '',
      keywords: post.tags,
      ogImage: post.coverImage || `/og/blog-${post.slug}-${lang}.png`,
      canonical: getCanonical(`/blog/${post.slug}`),
    })
    injectJsonLd(generateArticleSchema(post, isRTL))
    injectBreadcrumb([
      { name: isRTL ? 'الرئيسية' : 'Home', url: getCanonical('/') },
      { name: isRTL ? 'المدونة' : 'Blog', url: getCanonical('/blog') },
      { name: title || '', url: getCanonical(`/blog/${post.slug}`) },
    ])
  }, [post, title, isRTL, lang])


  function renderInline(text: string) {
    const parts = text.split(/(\*\*[^*]+\*\*)/g)
    return parts.map((part, j) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={j} className="font-semibold text-slate-800">{part.slice(2, -2)}</strong>
      return part
    })
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'long', day: 'numeric', year: 'numeric' })
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
        <Navbar />
        <div className="flex items-center justify-center py-32">
          <Loader2 size={24} className="animate-spin text-[#1a56ff]" />
        </div>
        <Footer />
      </div>
    )
  }

  if (error || !post) {
    return (
      <div className="min-h-screen bg-white font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
        <Navbar />
        <div className="max-w-2xl mx-auto px-4 py-32 text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">{b.articleNotFound}</h2>
          <p className="text-slate-500 text-sm mb-6">{b.articleNotFoundDesc}</p>
          <Link to="/blog" className={`inline-flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-[#1a56ff] border border-slate-200 px-4 py-2.5 rounded-lg transition-all mx-auto w-fit shadow-sm relative z-10`}>
            {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />} {b.backToBlog}
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-sans" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 pb-12 sm:pt-32 sm:pb-16">
        <Link to="/blog" className={`inline-flex items-center gap-2 text-sm font-medium text-slate-600 bg-slate-50 hover:bg-slate-100 hover:text-[#1a56ff] border border-slate-200 px-4 py-2.5 rounded-lg transition-all mb-8 w-fit shadow-sm relative z-10`}>
          {isRTL ? <ArrowRight size={16} /> : <ArrowLeft size={16} />} {b.backToBlog}
        </Link>

        {post.coverImage && (
          <div className="rounded-2xl overflow-hidden mb-8">
            <img src={post.coverImage} alt={title} className="w-full h-56 sm:h-72 object-cover" />
          </div>
        )}

        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map(t => (
              <span key={t} className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-100 text-slate-600 rounded-full px-3 py-1">
                <Tag size={10} /> {t}
              </span>
            ))}
          </div>
        )}

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4 leading-tight">{title}</h1>

        <div className={`flex items-center gap-4 text-sm text-slate-400 mb-8 pb-6 border-b border-slate-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <span className="flex items-center gap-1.5"><User size={14} /> {post.author}</span>
          <span className="flex items-center gap-1.5"><Calendar size={14} /> {formatDate(post.createdAt)}</span>
          <button
            onClick={() => { navigator.clipboard.writeText(window.location.href); }}
            className={`flex items-center gap-1.5 text-slate-400 hover:text-[#1a56ff] transition-colors ${isRTL ? 'mr-auto' : 'ml-auto'}`}
            title={b.copyLink}
          >
            <Share2 size={14} /> {b.share}
          </button>
        </div>

        <div className="prose prose-slate prose-sm sm:prose-base max-w-none">
          {content.split('\n').map((line, i) => {
            if (line.startsWith('## ')) return <h2 key={i} className="text-xl font-bold text-slate-900 mt-8 mb-3">{line.slice(3)}</h2>
            if (line.startsWith('### ')) return <h3 key={i} className="text-lg font-semibold text-slate-900 mt-6 mb-2">{line.slice(4)}</h3>
            if (line.startsWith('> ')) return <blockquote key={i} className="border-l-4 border-[#1a56ff] pl-4 py-2 my-4 text-slate-600 italic bg-slate-50 rounded-r-lg">{renderInline(line.slice(2))}</blockquote>
            if (line.startsWith('- ')) return <li key={i} className="text-slate-600 ml-4 mb-1">{renderInline(line.slice(2))}</li>
            if (line.startsWith('**') && line.endsWith('**')) return <p key={i} className="font-semibold text-slate-800 mt-4 mb-1">{line.slice(2, -2)}</p>
            if (line.trim() === '') return <div key={i} className="h-3" />
            return <p key={i} className="text-slate-600 leading-relaxed mb-3">{renderInline(line)}</p>
          })}
        </div>

        <div className="mt-10 pt-6 border-t border-slate-100 flex items-center justify-between">
          <Link to="/blog" className="flex items-center gap-1.5 text-sm font-semibold text-[#1a56ff] hover:underline">
            {isRTL ? <ArrowRight size={14} /> : <ArrowLeft size={14} />} {b.moreArticles}
          </Link>
          <button
            onClick={() => { navigator.clipboard.writeText(window.location.href); }}
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-[#1a56ff] transition-colors"
          >
            <Share2 size={14} /> {b.shareThisArticle}
          </button>
        </div>
      </main>
      <Footer />
    </div>
  )
}

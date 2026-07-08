import { useState, useEffect } from 'react'
import { useNavigate, useParams } from '@tanstack/react-router'
import { ArrowLeft, Save, Loader2, Globe } from 'lucide-react'
import { useRequireAdmin } from '../../hooks/useRequireAuth'
import { useCreateSeoPage, useUpdateSeoPage } from '../../hooks/useSeoPages'
import { pb } from '../../lib/pocketbase'
import type { SeoPageFormData } from '../../types/db'
import toast from 'react-hot-toast'

export default function AdminSeoEditorPage() {
  useRequireAdmin()
  const params = useParams({ strict: false }) as { id: string }
  const id = params.id
  const navigate = useNavigate()
  const isNew = id === 'new'

  const [form, setForm] = useState<SeoPageFormData>({
    slug: '', countryName: '', countryCode: '', metaTitle: '', metaDescription: '',
    heroTitle: '', heroDescription: '', mainKeyword: '', secondaryKeywords: '',
    painPoints: '[]', benefits: '[]', bestBank: '', bankNotes: '', taxNotes: '',
    faqJson: '[]', ctaText: 'Start Your US LLC Today', featuredImage: '', schemaJson: '{}', published: false,
  })
  const [loading, setLoading] = useState(false)

  const createMutation = useCreateSeoPage()
  const updateMutation = useUpdateSeoPage()

  useEffect(() => {
    if (isNew) return
    const load = async () => {
      setLoading(true)
      try {
        const data = await pb.collection('countries_seo_pages').getOne(id)
        if (data) {
          const d = data as unknown as Record<string, unknown>
          setForm({
            slug: d.slug as string,
            countryName: d.country_name as string,
            countryCode: d.country_code as string,
            metaTitle: d.meta_title as string,
            metaDescription: d.meta_description as string,
            heroTitle: d.hero_title as string,
            heroDescription: d.hero_description as string,
            mainKeyword: d.main_keyword as string,
            secondaryKeywords: JSON.stringify(d.secondary_keywords),
            painPoints: JSON.stringify(d.pain_points),
            benefits: JSON.stringify(d.benefits),
            bestBank: (d.best_bank as string) || '',
            bankNotes: (d.bank_notes as string) || '',
            taxNotes: (d.tax_notes as string) || '',
            faqJson: JSON.stringify(d.faq_json),
            ctaText: d.cta_text as string,
            featuredImage: (d.featured_image as string) || '',
            schemaJson: JSON.stringify(d.schema_json),
            published: d.published as boolean,
          })
        }
      } catch (err) {
        console.error('Failed to load SEO page:', err)
        toast.error('Failed to load SEO page')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  function handleField(field: keyof SeoPageFormData) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value
      setForm(f => ({ ...f, [field]: value }))
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      if (isNew) await createMutation.mutateAsync(form)
      else await updateMutation.mutateAsync({ id, form })
      navigate({ to: '/admin/seo' })
    } catch { /* handled by mutations */ }
    setLoading(false)
  }

  if (!isNew && loading) {
    return (
      <>
        <div className="flex items-center justify-center py-20"><Loader2 size={24} className="animate-spin text-[#1a56ff]" /></div>
      </>
    )
  }

  const labelClass = "block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1"
  const inputClass = "w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff]"
  const sectionClass = "bg-white rounded-2xl border border-slate-200 p-5 space-y-4"

  return (
    <>
      <div className="max-w-4xl">
        <button onClick={() => navigate({ to: '/admin/seo' })} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900 mb-5 transition-colors">
          <ArrowLeft size={14} /> Back to SEO pages
        </button>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Identity */}
          <div className={sectionClass}>
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2"><Globe size={16} className="text-[#1a56ff]" /> Identity</h3>
            <div className="grid grid-cols-3 gap-4">
              <div className="col-span-2">
                <label className={labelClass}>Country Name *</label>
                <input required value={form.countryName} onChange={handleField('countryName')} placeholder="Egypt" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Code *</label>
                <input required value={form.countryCode} onChange={handleField('countryCode')} placeholder="EG" className={`${inputClass} uppercase`} />
              </div>
            </div>
            <div>
              <label className={labelClass}>Slug *</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-400 font-mono">/us-company/</span>
                <input required value={form.slug} onChange={handleField('slug')} placeholder="egypt" className={inputClass} />
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className={sectionClass}>
            <h3 className="text-sm font-bold text-slate-900">SEO</h3>
            <div>
              <label className={labelClass}>Meta Title *</label>
              <input required value={form.metaTitle} onChange={handleField('metaTitle')} placeholder="US LLC Formation for Egyptian Entrepreneurs" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Meta Description *</label>
              <textarea required value={form.metaDescription} onChange={handleField('metaDescription')} rows={2} placeholder="Complete guide to forming a US LLC from Egypt..." className={inputClass} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Main Keyword *</label>
                <input required value={form.mainKeyword} onChange={handleField('mainKeyword')} placeholder="US LLC Egypt" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Secondary Keywords (JSON array)</label>
                <input value={form.secondaryKeywords} onChange={handleField('secondaryKeywords')} placeholder='["LLC Egypt", "US company Egypt"]' className={inputClass} />
              </div>
            </div>
          </div>

          {/* Hero */}
          <div className={sectionClass}>
            <h3 className="text-sm font-bold text-slate-900">Hero Section</h3>
            <div>
              <label className={labelClass}>Hero Title *</label>
              <input required value={form.heroTitle} onChange={handleField('heroTitle')} placeholder="Form Your US LLC from Egypt" className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>Hero Description *</label>
              <textarea required value={form.heroDescription} onChange={handleField('heroDescription')} rows={3} placeholder="Launch your US company from Egypt..." className={inputClass} />
            </div>
            <div>
              <label className={labelClass}>CTA Text</label>
              <input value={form.ctaText} onChange={handleField('ctaText')} className={inputClass} />
            </div>
          </div>

          {/* Content JSON fields */}
          <div className={sectionClass}>
            <h3 className="text-sm font-bold text-slate-900">Content (JSON arrays)</h3>
            <div>
              <label className={labelClass}>Benefits <span className="font-normal normal-case text-slate-400">[{`{"title":"...","desc":"..."}`}]</span></label>
              <textarea value={form.benefits} onChange={handleField('benefits')} rows={4} className={`${inputClass} font-mono text-xs`} />
            </div>
            <div>
              <label className={labelClass}>Pain Points <span className="font-normal normal-case text-slate-400">[string]</span></label>
              <textarea value={form.painPoints} onChange={handleField('painPoints')} rows={3} className={`${inputClass} font-mono text-xs`} />
            </div>
            <div>
              <label className={labelClass}>FAQ <span className="font-normal normal-case text-slate-400">[{`{"question":"...","answer":"..."}`}]</span></label>
              <textarea value={form.faqJson} onChange={handleField('faqJson')} rows={5} className={`${inputClass} font-mono text-xs`} />
            </div>
          </div>

          {/* Banking & Taxes */}
          <div className={`${sectionClass} grid grid-cols-1 md:grid-cols-2 gap-4`}>
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Banking</h3>
              <div>
                <label className={labelClass}>Best Bank</label>
                <input value={form.bestBank} onChange={handleField('bestBank')} placeholder="Mercury / Relay / Wise" className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>Bank Notes</label>
                <textarea value={form.bankNotes} onChange={handleField('bankNotes')} rows={4} className={inputClass} />
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900">Taxes</h3>
              <div>
                <label className={labelClass}>Tax Notes</label>
                <textarea value={form.taxNotes} onChange={handleField('taxNotes')} rows={6} className={inputClass} />
              </div>
            </div>
          </div>

          {/* Advanced */}
          <div className={sectionClass}>
            <h3 className="text-sm font-bold text-slate-900">Advanced</h3>
            <div>
              <label className={labelClass}>Schema JSON (optional)</label>
              <textarea value={form.schemaJson} onChange={handleField('schemaJson')} rows={3} className={`${inputClass} font-mono text-xs`} />
            </div>
            <div>
              <label className={labelClass}>Featured Image URL</label>
              <input value={form.featuredImage} onChange={handleField('featuredImage')} className={inputClass} />
            </div>
            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" checked={form.published} onChange={handleField('published')} className="w-4 h-4 rounded border-slate-300 text-[#1a56ff] focus:ring-[#1a56ff]/20" />
                <span className="text-sm font-medium text-slate-700">Published</span>
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3 pb-12">
            <button type="button" onClick={() => navigate({ to: '/admin/seo' })}
              className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#1a56ff] text-white text-sm font-semibold hover:bg-[#1440d0] transition-colors disabled:opacity-70">
              {loading ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              {isNew ? 'Create Page' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </>
  )
}

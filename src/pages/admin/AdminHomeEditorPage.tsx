import { useState, useEffect } from 'react'
import { Loader2, Save, CheckCircle, Globe, Home } from 'lucide-react'
import { pb } from '../../lib/pocketbase'
import { invalidateSiteContentCache } from '../../hooks/useSiteContent'

interface FieldDef {
  key: string
  labelEn: string
  labelAr: string
  multiline?: boolean
  hint?: string
}

const SECTIONS: { title: string; icon: React.ElementType; fields: FieldDef[] }[] = [
  {
    title: 'Hero Section',
    icon: Home,
    fields: [
      { key: 'hero_headline', labelEn: 'Main Headline (EN)', labelAr: 'العنوان الرئيسي (AR)', hint: 'The big h1 heading shown in the hero' },
      { key: 'hero_subheadline', labelEn: 'Sub-headline (EN)', labelAr: 'العنوان الفرعي (AR)', multiline: true },
      { key: 'hero_cta', labelEn: 'Primary CTA Button (EN)', labelAr: 'زر الدعوة للعمل (AR)' },
      { key: 'hero_badge1', labelEn: 'Trust Badge 1 (EN)', labelAr: 'شعار الثقة 1 (AR)' },
      { key: 'hero_badge2', labelEn: 'Trust Badge 2 (EN)', labelAr: 'شعار الثقة 2 (AR)' },
      { key: 'hero_badge3', labelEn: 'Trust Badge 3 (EN)', labelAr: 'شعار الثقة 3 (AR)' },
      { key: 'hero_badge4', labelEn: 'Trust Badge 4 (EN)', labelAr: 'شعار الثقة 4 (AR)' },
    ],
  },
  {
    title: 'General / SEO',
    icon: Globe,
    fields: [
      { key: 'site_tagline', labelEn: 'Site Tagline (EN)', labelAr: 'شعار الموقع (AR)', hint: 'Used in SEO meta description and footer' },
      { key: 'contact_email', labelEn: 'Contact Email', labelAr: 'البريد الإلكتروني للتواصل', hint: 'Shown in footer and contact page' },
      { key: 'whatsapp_number', labelEn: 'WhatsApp Number', labelAr: 'رقم واتساب', hint: 'Full international format e.g. +13072898149' },
    ],
  },
]

interface FieldState { value_en: string; value_ar: string; id?: string }
type ContentMap = Record<string, FieldState>

export default function AdminHomeEditorPage() {
  const [content, setContent] = useState<ContentMap>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedKeys, setSavedKeys] = useState<Set<string>>(new Set())

  const allKeys = SECTIONS.flatMap(s => s.fields.map(f => f.key))

  useEffect(() => {
    void (async () => {
      const initial: ContentMap = {}
      for (const key of allKeys) initial[key] = { value_en: '', value_ar: '' }
      try {
        const records = await pb.collection('site_content').getFullList<{ id: string; key: string; value_en: string; value_ar: string }>({ sort: 'key' })
        for (const r of records) {
          if (initial[r.key] !== undefined) initial[r.key] = { value_en: r.value_en ?? '', value_ar: r.value_ar ?? '', id: r.id }
        }
      } catch { /* no records yet */ }
      setContent(initial)
      setLoading(false)
    })()
  }, [])

  function updateField(key: string, lang: 'en' | 'ar', value: string) {
    setContent(prev => ({ ...prev, [key]: { ...(prev[key] ?? { value_en: '', value_ar: '' }), [lang === 'en' ? 'value_en' : 'value_ar']: value } } as ContentMap))
  }

  async function saveSection(fields: FieldDef[]) {
    setSaving(true)
    const newSaved = new Set(savedKeys)
    try {
      for (const field of fields) {
        const state = content[field.key] ?? { value_en: '', value_ar: '' }
        const data = { key: field.key, value_en: state.value_en, value_ar: state.value_ar }
        if (state.id) {
          await pb.collection('site_content').update(state.id, data)
        } else {
          try {
            const rec = await pb.collection('site_content').create<{ id: string }>(data)
            setContent(prev => ({ ...prev, [field.key]: { ...(prev[field.key] ?? { value_en: '', value_ar: '' }), id: rec.id } } as ContentMap))
          } catch {
            const existing = await pb.collection('site_content').getFirstListItem<{ id: string; key: string; value_en: string; value_ar: string }>(`key="${field.key}"`)
            await pb.collection('site_content').update(existing.id, data)
            setContent(prev => ({ ...prev, [field.key]: { ...(prev[field.key] ?? { value_en: '', value_ar: '' }), id: existing.id } } as ContentMap))
          }
        }
        newSaved.add(field.key)
      }
      invalidateSiteContentCache()
      setSavedKeys(newSaved)
      setTimeout(() => setSavedKeys(new Set()), 2500)
    } catch (err) { console.error('Save error', err) }
    setSaving(false)
  }

  if (loading) {
    return (
      <>
        <div className="flex items-center justify-center h-64"><Loader2 className="animate-spin text-slate-400" size={32} /></div>
      </>
    )
  }

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 flex items-start gap-3">
          <Globe size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-blue-800">Live content editor</p>
            <p className="text-xs text-blue-700 mt-0.5">Edits save to the database and are reflected on the landing page for new visitors. Each section has its own Save button.</p>
          </div>
        </div>

        {SECTIONS.map(section => {
          const SectionIcon = section.icon
          const sectionSaved = section.fields.every(f => savedKeys.has(f.key))
          return (
            <div key={section.title} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center">
                    <SectionIcon size={16} className="text-slate-600" />
                  </div>
                  <h3 className="font-semibold text-slate-900">{section.title}</h3>
                </div>
                <button
                  onClick={() => void saveSection(section.fields)}
                  disabled={saving}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#1a56ff] text-white text-xs font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 transition-colors"
                >
                  {saving ? <Loader2 size={13} className="animate-spin" /> : sectionSaved ? <CheckCircle size={13} /> : <Save size={13} />}
                  {saving ? 'Saving...' : sectionSaved ? 'Saved!' : 'Save Section'}
                </button>
              </div>

              <div className="px-6 py-5 space-y-6">
                {section.fields.map(field => {
                  const state = content[field.key] || { value_en: '', value_ar: '' }
                  return (
                    <div key={field.key} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">{field.labelEn}</label>
                        {field.hint && <p className="text-xs text-slate-400 mb-1.5">{field.hint}</p>}
                        {field.multiline ? (
                          <textarea rows={3} value={state.value_en} onChange={e => updateField(field.key, 'en', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" placeholder="Enter English value..." />
                        ) : (
                          <input value={state.value_en} onChange={e => updateField(field.key, 'en', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Enter English value..." />
                        )}
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">{field.labelAr}</label>
                        {field.hint && <p className="text-xs text-slate-400 mb-1.5">&nbsp;</p>}
                        {field.multiline ? (
                          <textarea dir="rtl" rows={3} value={state.value_ar} onChange={e => updateField(field.key, 'ar', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none" placeholder="أدخل القيمة بالعربية..." />
                        ) : (
                          <input dir="rtl" value={state.value_ar} onChange={e => updateField(field.key, 'ar', e.target.value)} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-right focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="أدخل القيمة بالعربية..." />
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </>
  )
}
import { useState } from 'react'
import { ShieldCheck, CheckCircle2, Eye, Save } from 'lucide-react'
import { CookieConsentConfig } from '../../types/tracking'
import { saveConsent } from '../../lib/tracking/consentManager'

interface Props {
  config: CookieConsentConfig
  onSave: (cfg: CookieConsentConfig) => void
}

export default function CookieConsentTab({ config, onSave }: Props) {
  const [formData, setFormData] = useState<CookieConsentConfig>({ ...config })
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    saveConsent(true, formData.defaultAnalytics, formData.defaultMarketing)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900">Cookie Consent Banner & Compliance (GDPR / CCPA / Consent Mode V2)</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure visitor cookie preferences, regional compliance flags, and Google Consent Mode V2 signals.
          </p>
        </div>

        {savedSuccess && (
          <div className="bg-emerald-50 text-emerald-800 text-xs px-3.5 py-2 rounded-xl border border-emerald-200 font-semibold flex items-center gap-1.5 animate-in fade-in">
            <CheckCircle2 size={15} className="text-emerald-600" />
            <span>Settings Saved Successfully!</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Banner Copy & Customization Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h4 className="font-bold text-slate-800 text-sm">Banner Content & Text Labels</h4>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Banner Title</label>
              <input
                value={formData.bannerTitle}
                onChange={e => setFormData(prev => ({ ...prev, bannerTitle: e.target.value }))}
                className="w-full px-3 py-2 text-xs border rounded-xl"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Privacy Notice Message</label>
              <textarea
                rows={3}
                value={formData.bannerMessage}
                onChange={e => setFormData(prev => ({ ...prev, bannerMessage: e.target.value }))}
                className="w-full px-3 py-2 text-xs border rounded-xl leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Accept All Button</label>
                <input
                  value={formData.acceptAllText}
                  onChange={e => setFormData(prev => ({ ...prev, acceptAllText: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reject Button</label>
                <input
                  value={formData.rejectAllText}
                  onChange={e => setFormData(prev => ({ ...prev, rejectAllText: e.target.value }))}
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t space-y-3">
            <h4 className="font-bold text-slate-800 text-sm">Compliance & Regional Frameworks</h4>

            <div className="space-y-2">
              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.consentModeV2}
                  onChange={e => setFormData(prev => ({ ...prev, consentModeV2: e.target.checked }))}
                  className="rounded text-blue-600"
                />
                <span className="font-semibold text-slate-900">Google Consent Mode V2</span> (Passes ad_storage & analytics_storage flags)
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.gdprEnabled}
                  onChange={e => setFormData(prev => ({ ...prev, gdprEnabled: e.target.checked }))}
                  className="rounded text-blue-600"
                />
                <span>Enable European Union (GDPR) Compliance Protocol</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.ccpaEnabled}
                  onChange={e => setFormData(prev => ({ ...prev, ccpaEnabled: e.target.checked }))}
                  className="rounded text-blue-600"
                />
                <span>Enable California (CCPA) Privacy Notice</span>
              </label>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 bg-[#1a56ff] hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm"
            >
              <Save size={14} /> Save Banner Settings
            </button>
          </div>
        </div>

        {/* Live Banner Preview Card */}
        <div className="bg-slate-900 rounded-2xl p-6 text-white flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
              <Eye size={15} /> Live Banner Preview
            </div>

            {/* Simulated Banner Container */}
            <div className="bg-white text-slate-900 rounded-2xl p-5 shadow-2xl space-y-3 border border-slate-200">
              <div className="flex items-center gap-2">
                <ShieldCheck className="text-blue-600" size={18} />
                <h5 className="font-bold text-sm">{formData.bannerTitle}</h5>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {formData.bannerMessage}
              </p>

              <div className="flex items-center gap-2 pt-2">
                <button type="button" className="px-3.5 py-1.5 bg-[#1a56ff] text-white text-xs font-semibold rounded-xl shadow-xs">
                  {formData.acceptAllText}
                </button>
                <button type="button" className="px-3.5 py-1.5 bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200">
                  {formData.rejectAllText}
                </button>
              </div>
            </div>
          </div>

          <div className="text-[11px] text-slate-400 leading-relaxed bg-slate-800/60 p-3.5 rounded-xl border border-slate-800">
            🔒 <strong>Consent Mode V2 Status:</strong> {formData.consentModeV2 ? 'Active (analytics_storage, ad_storage, ad_user_data, ad_personalization signals emitted)' : 'Disabled'}
          </div>
        </div>
      </form>
    </div>
  )
}

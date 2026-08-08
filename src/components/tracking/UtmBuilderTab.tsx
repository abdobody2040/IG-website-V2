import { useState } from 'react'
import { Copy, Check, QrCode, Link2 } from 'lucide-react'

export default function UtmBuilderTab() {
  const [baseUrl, setBaseUrl] = useState('https://instantgrow.net/services')
  const [source, setSource] = useState('facebook')
  const [medium, setMedium] = useState('cpc')
  const [campaign, setCampaign] = useState('us_llc_promo_2026')
  const [term, setTerm] = useState('wyoming_company')
  const [content, setContent] = useState('banner_blue')

  const [copied, setCopied] = useState(false)
  const [showQr, setShowQr] = useState(false)

  // Construct generated URL
  const buildUrl = () => {
    try {
      const u = new URL(baseUrl)
      if (source) u.searchParams.set('utm_source', source)
      if (medium) u.searchParams.set('utm_medium', medium)
      if (campaign) u.searchParams.set('utm_campaign', campaign)
      if (term) u.searchParams.set('utm_term', term)
      if (content) u.searchParams.set('utm_content', content)
      return u.toString()
    } catch {
      return `${baseUrl}?utm_source=${source}&utm_medium=${medium}&utm_campaign=${campaign}`
    }
  }

  const finalUrl = buildUrl()
  const shortUrl = `https://ig.link/${btoa(campaign).slice(0, 8).toLowerCase()}`

  const handleCopy = () => {
    navigator.clipboard.writeText(finalUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-1">
        <h3 className="font-bold text-slate-900">UTM Campaign URL Builder & QR Generator</h3>
        <p className="text-xs text-slate-500">
          Create trackable links for Meta Ads, Google Ads, Email Newsletters, and Influencer links with short URLs and QR codes.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generator Form */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <h4 className="font-bold text-slate-800 text-sm">Campaign Parameters</h4>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Target Website URL *</label>
              <input
                value={baseUrl}
                onChange={e => setBaseUrl(e.target.value)}
                placeholder="https://instantgrow.net/services"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign Source (utm_source) *</label>
                <input
                  value={source}
                  onChange={e => setSource(e.target.value)}
                  placeholder="google, facebook, newsletter"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign Medium (utm_medium) *</label>
                <input
                  value={medium}
                  onChange={e => setMedium(e.target.value)}
                  placeholder="cpc, banner, email"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign Name (utm_campaign) *</label>
              <input
                value={campaign}
                onChange={e => setCampaign(e.target.value)}
                placeholder="summer_sale_2026"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign Term (utm_term)</label>
                <input
                  value={term}
                  onChange={e => setTerm(e.target.value)}
                  placeholder="wyoming_llc"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Campaign Content (utm_content)</label>
                <input
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="logolink, cta_button"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Output Card: Generated Link & QR Code */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <h4 className="font-bold text-slate-800 text-sm">Generated Campaign Link</h4>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
              <label className="block text-[11px] font-semibold text-slate-500 uppercase">Full Trackable URL</label>
              <p className="text-xs font-mono text-blue-700 break-all leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200">
                {finalUrl}
              </p>

              <div className="pt-2 flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <Link2 size={14} className="text-blue-600" />
                  <span>Short Link: <strong className="font-mono text-slate-900">{shortUrl}</strong></span>
                </div>
              </div>
            </div>

            {/* QR Code SVG Display */}
            {showQr && (
              <div className="p-4 bg-slate-900 rounded-2xl text-center text-white space-y-2 animate-in fade-in">
                <div className="w-32 h-32 mx-auto bg-white p-2 rounded-xl flex items-center justify-center">
                  {/* Simple Clean QR Pattern */}
                  <svg className="w-full h-full text-slate-900" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm8-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 2h2v4h-2v-4zm-4-2h2v2h-2v-2zm2 4h2v2h-2v-2zm2-4h2v2h-2v-2zm-6-2h2v2h-2v-2zm2 2h2v2h-2v-2z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-slate-200">Scan to Open Tracked Campaign</p>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleCopy}
              className="flex-1 py-2.5 bg-[#1a56ff] hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Copied to Clipboard!' : 'Copy Campaign Link'}
            </button>

            <button
              onClick={() => setShowQr(!showQr)}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <QrCode size={15} />
              {showQr ? 'Hide QR' : 'QR Code'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

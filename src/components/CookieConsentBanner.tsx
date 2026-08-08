import { useState, useEffect } from 'react'
import { ShieldCheck } from 'lucide-react'
import { getSavedConsent, saveConsent } from '../lib/tracking/consentManager'

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false)
  const [showPreferences, setShowPreferences] = useState(false)
  const [analytics, setAnalytics] = useState(true)
  const [marketing, setMarketing] = useState(true)

  useEffect(() => {
    const saved = getSavedConsent()
    if (!saved) {
      const timer = setTimeout(() => setVisible(true), 1000)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [])

  if (!visible) return null

  const handleAcceptAll = () => {
    saveConsent(true, true, true)
    setVisible(false)
  }

  const handleRejectAll = () => {
    saveConsent(false, false, false)
    setVisible(false)
  }

  const handleSavePreferences = () => {
    saveConsent(true, analytics, marketing)
    setVisible(false)
  }

  return (
    <div className="fixed bottom-5 left-5 right-5 md:left-auto md:right-5 md:max-w-md z-50 animate-in slide-in-from-bottom duration-300">
      <div className="bg-slate-900 text-white rounded-2xl p-5 shadow-2xl border border-slate-800 space-y-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="text-blue-400" size={18} />
            <h4 className="font-bold text-sm text-white">Cookie & Privacy Preferences</h4>
          </div>
          <button onClick={() => setVisible(false)} className="text-slate-400 hover:text-white">&times;</button>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          We use cookies and tracking tags to analyze site traffic, personalize content, and support marketing performance in compliance with GDPR, CCPA, and Google Consent Mode V2.
        </p>

        {showPreferences && (
          <div className="p-3 bg-slate-800/80 rounded-xl space-y-2 text-xs border border-slate-700">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-semibold text-slate-200">Strictly Necessary Cookies</span>
              <span className="text-[10px] uppercase font-bold text-emerald-400">Always Active</span>
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Analytics Cookies (GA4, Clarity)</span>
              <input type="checkbox" checked={analytics} onChange={e => setAnalytics(e.target.checked)} className="rounded text-blue-500" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-slate-300">Marketing & Pixel Cookies (Meta, TikTok)</span>
              <input type="checkbox" checked={marketing} onChange={e => setMarketing(e.target.checked)} className="rounded text-blue-500" />
            </label>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-2 pt-1">
          {showPreferences ? (
            <button
              onClick={handleSavePreferences}
              className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl"
            >
              Save Preferences
            </button>
          ) : (
            <>
              <button
                onClick={handleAcceptAll}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl shadow-xs"
              >
                Accept All
              </button>
              <button
                onClick={handleRejectAll}
                className="py-2 px-3 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700"
              >
                Reject Non-Essential
              </button>
              <button
                onClick={() => setShowPreferences(true)}
                className="text-[11px] text-slate-400 hover:text-white font-medium underline"
              >
                Customize
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

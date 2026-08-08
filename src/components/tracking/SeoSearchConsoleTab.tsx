import { useState } from 'react'
import { Globe, CheckCircle2, FileText, ArrowUpRight, RefreshCw } from 'lucide-react'

export default function SeoSearchConsoleTab() {
  const [synced, setSynced] = useState(false)

  const mockQueries = [
    { query: 'us llc formation non resident', clicks: 4200, impressions: 28400, ctr: '14.8%', pos: 1.8 },
    { query: 'start uk ltd company', clicks: 2900, impressions: 19800, ctr: '14.6%', pos: 2.1 },
    { query: 'instant grow business services', clicks: 2100, impressions: 8400, ctr: '25.0%', pos: 1.0 },
    { query: 'wyoming llc registered agent', clicks: 1850, impressions: 14200, ctr: '13.0%', pos: 3.2 },
    { query: 'uae freezone company setup', clicks: 1400, impressions: 11500, ctr: '12.1%', pos: 2.9 }
  ]

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-bold text-slate-900">Google Search Console & Bing Webmaster Integration</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor search engine indexing, core web vitals, sitemap status, and organic search impressions.
          </p>
        </div>

        <button
          onClick={() => { setSynced(true); setTimeout(() => setSynced(false), 2000) }}
          className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw size={14} className={synced ? 'animate-spin' : ''} />
          {synced ? 'Syncing Search Data...' : 'Sync Search Console Data'}
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Verified Domain</span>
          <div className="flex items-center gap-2 pt-1">
            <Globe className="text-blue-600" size={18} />
            <span className="font-bold text-slate-900 text-sm">instantgrow.net</span>
            <CheckCircle2 size={14} className="text-emerald-500" />
          </div>
          <p className="text-[11px] text-slate-400">Status: Verified & Indexed</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Organic Clicks</span>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-bold text-slate-900">24,500</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">+18.4% <ArrowUpRight size={12} /></span>
          </div>
          <p className="text-[11px] text-slate-400">Last 30 days</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Search Impressions</span>
          <div className="flex items-baseline gap-2 pt-1">
            <span className="text-2xl font-bold text-slate-900">182,300</span>
            <span className="text-xs font-semibold text-emerald-600 flex items-center">+24.1% <ArrowUpRight size={12} /></span>
          </div>
          <p className="text-[11px] text-slate-400">Average CTR: 13.4%</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sitemap Status</span>
          <div className="flex items-center gap-2 pt-1">
            <FileText className="text-emerald-600" size={18} />
            <span className="font-bold text-slate-900 text-sm">/sitemap.xml</span>
          </div>
          <p className="text-[11px] text-emerald-600 font-semibold">14 URLs Indexed Successfully</p>
        </div>
      </div>

      {/* Top Search Queries Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h4 className="font-bold text-slate-900 text-sm">Top Search Keywords & Organic Positions</h4>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 font-semibold">Query</th>
                <th className="px-5 py-3 font-semibold">Organic Clicks</th>
                <th className="px-5 py-3 font-semibold">Impressions</th>
                <th className="px-5 py-3 font-semibold">CTR</th>
                <th className="px-5 py-3 font-semibold">Avg Position</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs font-medium">
              {mockQueries.map(q => (
                <tr key={q.query} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{q.query}</td>
                  <td className="px-5 py-3.5 text-slate-800 font-semibold">{q.clicks.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-slate-600">{q.impressions.toLocaleString()}</td>
                  <td className="px-5 py-3.5 text-emerald-600 font-semibold">{q.ctr}</td>
                  <td className="px-5 py-3.5 text-blue-700 font-bold">#{q.pos}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

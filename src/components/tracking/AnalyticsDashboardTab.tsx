import { useState } from 'react'
import {
  Users, DollarSign, Clock, ArrowUpRight, Activity
} from 'lucide-react'
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import { AnalyticsSummary } from '../../types/tracking'

interface Props {
  data: AnalyticsSummary
}

export default function AnalyticsDashboardTab({ data }: Props) {
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d')

  return (
    <div className="space-y-6">
      {/* Realtime & Key Metrics Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Realtime Visitors Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-100 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Realtime Active Visitors
            </span>
            <Activity size={18} className="text-blue-200" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-extrabold tracking-tight">{data.realtimeVisitors}</span>
            <span className="text-xs text-blue-200 font-medium">right now</span>
          </div>
          <p className="text-xs text-blue-100/80 mt-2">Active on instantgrow.net</p>
        </div>

        {/* Total Visitors */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Visitors</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{data.visitors.toLocaleString()}</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                +14.2% <ArrowUpRight size={12} />
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{data.sessions.toLocaleString()} total sessions</p>
          </div>
        </div>

        {/* Bounce Rate & Session Duration */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Engagement</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">{data.bounceRate}%</span>
              <span className="text-xs text-slate-400">bounce rate</span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">Avg Duration: 3m 34s</p>
          </div>
        </div>

        {/* Conversions & Revenue */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Conversions & Sales</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">${data.revenue.toLocaleString()}</span>
              <span className="text-xs font-semibold text-emerald-600 flex items-center">
                +22.8% <ArrowUpRight size={12} />
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5 font-medium">{data.conversions} goals completed</p>
          </div>
        </div>
      </div>

      {/* Traffic Trend Chart */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900">Traffic & Conversions Over Time</h3>
            <p className="text-slate-500 text-xs mt-0.5">Daily visitors, pageviews, and goal completions</p>
          </div>
          <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
            {(['7d', '30d', '90d'] as const).map(t => (
              <button
                key={t}
                onClick={() => setTimeRange(t)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  timeRange === t ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t === '7d' ? 'Last 7 Days' : t === '30d' ? 'Last 30 Days' : 'Last 90 Days'}
              </button>
            ))}
          </div>
        </div>

        <div className="h-72 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.trafficOverTime}>
              <defs>
                <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a56ff" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1a56ff" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorConversions" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="date" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '12px', color: '#fff' }}
              />
              <Area type="monotone" dataKey="visitors" stroke="#1a56ff" strokeWidth={2.5} fillOpacity={1} fill="url(#colorVisitors)" name="Visitors" />
              <Area type="monotone" dataKey="conversions" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorConversions)" name="Conversions" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid Breakdowns: Top Sources, Top Pages, Devices & Countries */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Traffic Sources */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Top Traffic Sources</h3>
            <span className="text-xs text-slate-400 font-medium">By visits</span>
          </div>
          <div className="space-y-3">
            {data.topSources.map(s => (
              <div key={s.source} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">{s.source}</span>
                  <span className="text-slate-600">{s.visits.toLocaleString()} ({s.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1a56ff] rounded-full transition-all duration-500" style={{ width: `${s.percentage}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Pages Visited */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900">Top Visited Pages</h3>
            <span className="text-xs text-slate-400 font-medium">By pageviews</span>
          </div>
          <div className="space-y-3">
            {data.topPages.map(p => (
              <div key={p.path} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold text-slate-800 font-mono truncate max-w-[240px]">{p.path}</span>
                <div className="flex items-center gap-3">
                  <span className="text-xs font-bold text-slate-900">{p.views.toLocaleString()}</span>
                  <span className="text-xs font-medium text-slate-400 w-10 text-right">{p.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

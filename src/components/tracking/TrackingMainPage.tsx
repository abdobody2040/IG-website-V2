import { useState } from 'react'
import {
  BarChart2, Grid, Zap, Target, Link2, ShieldCheck, Globe, Shield
} from 'lucide-react'
import { useTracking } from '../../hooks/useTracking'
import AnalyticsDashboardTab from './AnalyticsDashboardTab'
import IntegrationsTab from './IntegrationsTab'
import PixelHelperTab from './PixelHelperTab'
import EventTrackingTab from './EventTrackingTab'
import UtmBuilderTab from './UtmBuilderTab'
import CookieConsentTab from './CookieConsentTab'
import SeoSearchConsoleTab from './SeoSearchConsoleTab'
import MultiDomainTab from './MultiDomainTab'

type SubTab =
  | 'dashboard'
  | 'integrations'
  | 'diagnostics'
  | 'events'
  | 'utm'
  | 'consent'
  | 'seo'
  | 'domains'

export default function TrackingMainPage() {
  const [activeTab, setActiveTab] = useState<SubTab>('integrations')

  const {
    integrations,
    customEvents,
    consentConfig,
    domains,
    analytics,
    diagnostics,
    saveIntegration,
    deleteIntegration,
    toggleIntegrationStatus,
    setConsentConfig,
    addCustomEvent,
    toggleCustomEvent,
    deleteCustomEvent,
    setDomains
  } = useTracking()

  const tabs = [
    { id: 'integrations', label: 'Integrations & Pixels', icon: Grid, badge: integrations.filter(i => i.enabled).length },
    { id: 'dashboard', label: 'Analytics Dashboard', icon: BarChart2 },
    { id: 'diagnostics', label: 'Pixel Helper Scanner', icon: Zap, badge: diagnostics.filter(d => d.severity === 'error' || d.severity === 'warning').length },
    { id: 'events', label: 'Event Tracking Rules', icon: Target },
    { id: 'utm', label: 'UTM & QR Builder', icon: Link2 },
    { id: 'consent', label: 'Cookie Consent V2', icon: ShieldCheck },
    { id: 'seo', label: 'Search Console & SEO', icon: Globe },
    { id: 'domains', label: 'Multi-Domain & Team', icon: Shield }
  ]

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Workspace Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900">Tracking & Analytics Engine</h2>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#1a56ff] border border-blue-200">
              Enterprise v2.4
            </span>
          </div>
          <p className="text-slate-500 text-xs mt-1">
            Connect GA4, Meta Pixel CAPI, GTM, TikTok, Clarity & Custom Events without writing code.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Consent Mode V2 Active</span>
          </div>
        </div>
      </div>

      {/* Main Sub-Tab Navigation Bar */}
      <div className="flex items-center gap-1.5 bg-white p-2 rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        {tabs.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as SubTab)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                isActive
                  ? 'bg-[#1a56ff] text-white shadow-sm'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
              {tab.badge ? (
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {tab.badge}
                </span>
              ) : null}
            </button>
          )
        })}
      </div>

      {/* Active Tab Content Area */}
      <div>
        {activeTab === 'integrations' && (
          <IntegrationsTab
            integrations={integrations}
            onSave={saveIntegration}
            onDelete={deleteIntegration}
            onToggle={toggleIntegrationStatus}
          />
        )}

        {activeTab === 'dashboard' && (
          <AnalyticsDashboardTab data={analytics} />
        )}

        {activeTab === 'diagnostics' && (
          <PixelHelperTab diagnostics={diagnostics} />
        )}

        {activeTab === 'events' && (
          <EventTrackingTab
            events={customEvents}
            onAdd={addCustomEvent}
            onToggle={toggleCustomEvent}
            onDelete={deleteCustomEvent}
          />
        )}

        {activeTab === 'utm' && (
          <UtmBuilderTab />
        )}

        {activeTab === 'consent' && (
          <CookieConsentTab
            config={consentConfig}
            onSave={setConsentConfig}
          />
        )}

        {activeTab === 'seo' && (
          <SeoSearchConsoleTab />
        )}

        {activeTab === 'domains' && (
          <MultiDomainTab
            domains={domains}
            onSetDomains={setDomains}
          />
        )}
      </div>
    </div>
  )
}

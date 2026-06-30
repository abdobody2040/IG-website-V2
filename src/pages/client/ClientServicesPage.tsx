import { useState } from 'react'
import {
  ArrowRight, FileText, Mail,
} from 'lucide-react'
import ClientLayout from './ClientLayout'
import { useAuth } from '../../hooks/useAuth'
import { useCompanies } from '../../hooks/useCompanies'
import { ADDON_SERVICES } from '../../data/addonServices'
import { useLang } from '../../i18n/LanguageContext'
import type { Service } from '../../data/addonServices'
import { OrderModal } from './OrderModal'

export default function ClientServicesPage() {
  const { t } = useLang()
  const sp = t.client.servicesPage
  const { user } = useAuth()
  const { companies } = useCompanies(user?.id)
  const [selected, setSelected] = useState<Service | null>(null)

  const companyList = (companies ?? []).map(c => ({
    id: c.id,
    companyName: c.companyName,
    companyType: c.companyType,
    state: c.state,
  }))

  return (
    <ClientLayout currentPath="/client/services" title={t.client.nav.services}>
      <div className="max-w-5xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">{sp.heading}</h2>
          <p className="text-slate-500 text-sm mt-0.5">{sp.subtitle}</p>
        </div>

        <div className="bg-[#e8efff] border border-[#1a56ff]/20 rounded-2xl p-4 flex gap-3 items-center mb-8">
          <div className="w-8 h-8 rounded-lg bg-[#1a56ff] flex items-center justify-center flex-shrink-0">
            <Mail size={14} className="text-white" />
          </div>
          <p className="text-sm text-[#1a40b0]">{sp.infoBanner}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-12">
          {ADDON_SERVICES.map(svc => {
            const Icon = svc.icon
            return (
              <div
                key={svc.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col gap-4 hover:shadow-md hover:border-[#1a56ff]/20 transition-all duration-200 relative"
              >
                {svc.badge && (
                  <span className="absolute top-4 right-4 bg-[#1a56ff] text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
                    {svc.badge}
                  </span>
                )}
                <div className="w-12 h-12 rounded-xl bg-[#e8efff] text-[#1a56ff] flex items-center justify-center flex-shrink-0">
                  <Icon size={22} />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 text-base">{svc.title}</h3>
                  <div className="flex items-baseline gap-1 mt-1 mb-3">
                    <span className="text-2xl font-bold text-[#1a56ff]">${svc.price}</span>
                    <span className="text-sm text-gray-400">{svc.period}</span>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{svc.description}</p>
                </div>

                <button
                  onClick={() => setSelected(svc)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl border-2 border-[#1a56ff] text-[#1a56ff] text-sm font-semibold hover:bg-[#1a56ff] hover:text-white transition-all duration-200"
                >
                  {sp.orderService}
                  <ArrowRight size={14} />
                </button>
              </div>
            )
          })}
        </div>

        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">{sp.comingSoon}</h2>
          <p className="text-slate-500 text-sm mt-0.5">{sp.comingSoonSub}</p>
        </div>

        <div className="max-w-xs">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="flex justify-end px-4 pt-4">
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                {sp.comingSoon}
              </span>
            </div>
            <div className="px-5 pb-5 pt-2">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                <FileText size={22} className="text-[#1a56ff]" />
              </div>
              <h3 className="font-semibold text-slate-900 mb-2">ITIN Application</h3>
              <p className="text-sm text-slate-500 leading-relaxed mb-5">
                Get your Individual Taxpayer Identification Number (ITIN) for tax filing purposes
                if you don't qualify for an SSN.
              </p>
              <button
                disabled
                className="w-full py-2 rounded-lg bg-slate-100 text-slate-400 text-sm font-semibold cursor-not-allowed"
              >
                Coming Soon
              </button>
            </div>
          </div>
        </div>
      </div>

      {selected && (
        <OrderModal
          service={selected}
          userEmail={user?.email ?? ''}
          userName={user?.displayName ?? ''}
          companies={companyList}
          onClose={() => setSelected(null)}
        />
      )}
    </ClientLayout>
  )
}

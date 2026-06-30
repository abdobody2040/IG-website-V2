import { Mail, MapPin, Calendar, ShieldCheck, AlertCircle } from 'lucide-react'
import ClientLayout from './ClientLayout'
import { useRequireAuth } from '../../hooks/useRequireAuth'
import { useCompanies } from '../../hooks/useCompanies'
import { useLang } from '../../i18n/LanguageContext'

export default function ClientMailInboxPage() {
  const { t } = useLang()
  const mp = t.client.mailInboxPage
  const { user, isLoading: authLoading } = useRequireAuth()
  const { companies, isLoading } = useCompanies(user?.id)

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56ff]" />
      </div>
    )
  }

  const firstCompany = companies[0]

  return (
    <ClientLayout currentPath="/client/mail-inbox" title={t.client.nav.mailInbox}>
      <div className="max-w-3xl">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-slate-900">{t.client.nav.mailInbox}</h2>
          <p className="text-slate-500 text-sm mt-0.5">{mp.subtitle}</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
          <div className="flex items-start justify-between p-5">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={20} className="text-[#1a56ff]" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{mp.registeredAgent}</h3>
                <p className="text-sm text-slate-500 mt-0.5">
                  {isLoading ? '\u2026' : firstCompany?.state ?? 'N/A'}
                </p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border bg-green-50 border-green-200 text-green-700">
              {mp.active}
            </span>
          </div>
          <div className="border-t border-slate-100 px-5 py-3">
            <p className="text-sm text-slate-600">{mp.raDesc}</p>
          </div>
          <div className="border-t border-slate-100 px-5 py-3 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 mb-0.5">{mp.state}</p>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                <MapPin size={13} className="text-slate-400" />
                {isLoading ? '\u2014' : firstCompany?.state ?? mp.noMail}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-400 mb-0.5">{mp.renewalDate}</p>
              <div className="flex items-center gap-1.5 text-sm font-semibold text-slate-800">
                <Calendar size={13} className="text-slate-400" />
                {t.client.companyPage.notSet}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-5">
          <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100">
            <div className="w-9 h-9 bg-orange-50 rounded-xl flex items-center justify-center">
              <Mail size={16} className="text-orange-500" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">{mp.scannedMail}</h3>
              <p className="text-sm text-slate-400">{mp.noMail}</p>
            </div>
          </div>

          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Mail size={28} className="text-slate-300" />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">{mp.noMailTitle}</p>
            <p className="text-xs text-slate-400 max-w-xs">{mp.noMailDesc}</p>
          </div>
        </div>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-5 flex items-start gap-3">
          <div className="w-8 h-8 bg-[#1a56ff]/10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
            <AlertCircle size={16} className="text-[#1a56ff]" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">{mp.stayCompliant}</h4>
            <p className="text-sm text-slate-600 mt-0.5">{mp.stayCompliantDesc}</p>
          </div>
        </div>
      </div>
    </ClientLayout>
  )
}

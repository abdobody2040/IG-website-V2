import { useState } from 'react'
import { Globe, Plus, Shield, Check } from 'lucide-react'
import { TrackingDomain } from '../../types/tracking'

interface Props {
  domains: TrackingDomain[]
  onSetDomains: (doms: TrackingDomain[]) => void
}

export default function MultiDomainTab({ domains, onSetDomains }: Props) {
  const [newDomain, setNewDomain] = useState('')

  const handleAddDomain = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDomain) return
    const created: TrackingDomain = {
      id: `dom_${Date.now()}`,
      domain: newDomain.trim(),
      isPrimary: false,
      trackingId: `IG-SUB-${Math.floor(Math.random() * 9000 + 1000)}`,
      status: 'active'
    }
    onSetDomains([...domains, created])
    setNewDomain('')
  }

  const rolesMatrix = [
    { role: 'Owner', view: true, edit: true, delete: true, manage: true },
    { role: 'Admin', view: true, edit: true, delete: true, manage: true },
    { role: 'Marketing', view: true, edit: true, delete: false, manage: true },
    { role: 'Developer', view: true, edit: true, delete: false, manage: false },
    { role: 'Viewer', view: true, edit: false, delete: false, manage: false }
  ]

  return (
    <div className="space-y-6">
      {/* Domains Section */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="font-bold text-slate-900">Multi-Domain Tracking Properties</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Connect secondary domains and client subdomains under isolated tracking profiles.
            </p>
          </div>

          <form onSubmit={handleAddDomain} className="flex items-center gap-2">
            <input
              value={newDomain}
              onChange={e => setNewDomain(e.target.value)}
              placeholder="e.g. store.instantgrow.net"
              className="px-3 py-1.5 text-xs border rounded-xl w-60"
            />
            <button type="submit" className="px-3.5 py-1.5 bg-[#1a56ff] text-white text-xs font-semibold rounded-xl flex items-center gap-1">
              <Plus size={14} /> Add Domain
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {domains.map(dom => (
            <div key={dom.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Globe size={18} />
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{dom.domain}</h4>
                  <span className="text-[11px] font-mono text-slate-500">{dom.trackingId}</span>
                </div>
              </div>

              {dom.isPrimary ? (
                <span className="px-2.5 py-1 text-[10px] font-bold uppercase rounded-md bg-blue-100 text-blue-800 border border-blue-200">
                  Primary Domain
                </span>
              ) : (
                <span className="px-2.5 py-1 text-[10px] font-semibold uppercase rounded-md bg-slate-200 text-slate-700">
                  Subdomain
                </span>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Permissions Matrix */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <Shield size={18} className="text-blue-600" />
          <h3 className="font-bold text-slate-900">Team Permissions & Access Control Matrix</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3 font-semibold">User Role</th>
                <th className="px-5 py-3 font-semibold text-center">View Analytics</th>
                <th className="px-5 py-3 font-semibold text-center">Edit Config</th>
                <th className="px-5 py-3 font-semibold text-center">Delete Integration</th>
                <th className="px-5 py-3 font-semibold text-center">Manage API Tokens</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {rolesMatrix.map(row => (
                <tr key={row.role} className="hover:bg-slate-50 transition-colors">
                  <td className="px-5 py-3.5 font-bold text-slate-900">{row.role}</td>
                  <td className="px-5 py-3.5 text-center">{row.view ? <Check size={16} className="text-emerald-500 mx-auto" /> : '—'}</td>
                  <td className="px-5 py-3.5 text-center">{row.edit ? <Check size={16} className="text-emerald-500 mx-auto" /> : '—'}</td>
                  <td className="px-5 py-3.5 text-center">{row.delete ? <Check size={16} className="text-emerald-500 mx-auto" /> : '—'}</td>
                  <td className="px-5 py-3.5 text-center">{row.manage ? <Check size={16} className="text-emerald-500 mx-auto" /> : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

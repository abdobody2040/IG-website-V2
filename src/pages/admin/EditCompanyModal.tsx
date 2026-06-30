import { useState } from 'react'
import { X, Loader2 } from 'lucide-react'
import { pb } from '../../lib/pocketbase'
import toast from 'react-hot-toast'
import type { Company } from '../../types/db'
import { logAdminAction } from '../../hooks/useAdminAuditLog'

const COMPANY_STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'suspended', label: 'Suspended' },
  { value: 'completed', label: 'Completed' },
]

const COMPLIANCE_STATUS_OPTIONS = [
  { value: 'not_started', label: 'Not Started' },
  { value: 'up_to_date', label: 'Up to Date' },
  { value: 'due_soon', label: 'Due Soon' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'completed', label: 'Completed' },
]

export function EditCompanyModal({
  company,
  onClose,
  onSaved,
}: {
  company: Company
  onClose: () => void
  onSaved: () => void
}) {
  const [companyName, setCompanyName] = useState(company.companyName || '')
  const [companyType, setCompanyType] = useState(company.companyType || 'LLC')
  const [state, setState] = useState(company.state || '')
  const [einNumber, setEinNumber] = useState(company.einNumber || '')
  const [formationDate, setFormationDate] = useState(company.formationDate || '')
  const [registeredAgent, setRegisteredAgent] = useState(company.registeredAgent || '')
  const [status, setStatus] = useState(company.status || 'pending')
  const [renewalDueDate, setRenewalDueDate] = useState(company.renewalDueDate || '')
  const [annualReportDueDate, setAnnualReportDueDate] = useState(company.annualReportDueDate || '')
  const [taxFilingDueDate, setTaxFilingDueDate] = useState(company.taxFilingDueDate || '')
  const [registeredAgentRenewalDate, setRegisteredAgentRenewalDate] = useState(company.registeredAgentRenewalDate || '')
  const [complianceStatus, setComplianceStatus] = useState(company.complianceStatus || 'not_started')
  const [complianceNotes, setComplianceNotes] = useState(company.complianceNotes || '')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error: updateErr } = await pb.collection('companies').update(company.id, {
        company_name: companyName,
        company_type: companyType,
        state,
        ein_number: einNumber,
        formation_date: formationDate,
        registered_agent: registeredAgent,
        status,
        renewal_due_date: renewalDueDate || null,
        annual_report_due_date: annualReportDueDate || null,
        tax_filing_due_date: taxFilingDueDate || null,
        registered_agent_renewal_date: registeredAgentRenewalDate || null,
        compliance_status: complianceStatus,
        compliance_notes: complianceNotes || null,
        updated_at: new Date().toISOString(),
      })
      if (updateErr) throw updateErr
      logAdminAction({ action: 'update', tableName: 'companies', recordId: company.id });
      toast.success('Company updated successfully')
      onSaved()
    } catch {
      toast.error('Failed to update company')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <div>
            <h2 className="font-semibold text-slate-900">Edit Company</h2>
            <p className="text-xs text-slate-500 mt-0.5">{company.companyName}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Company Name</label>
              <input value={companyName} onChange={e => setCompanyName(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Company Type</label>
              <select value={companyType} onChange={e => setCompanyType(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white">
                <option value="LLC">LLC</option>
                <option value="LTD">LTD</option>
                <option value="C-Corp">C-Corp</option>
                <option value="S-Corp">S-Corp</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">State</label>
              <input value={state} onChange={e => setState(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white" placeholder="e.g. Delaware" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">EIN Number</label>
              <input value={einNumber} onChange={e => setEinNumber(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white" placeholder="XX-XXXXXXX" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Formation Date</label>
              <input value={formationDate} onChange={e => setFormationDate(e.target.value)} type="date" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Registered Agent</label>
              <input value={registeredAgent} onChange={e => setRegisteredAgent(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white" placeholder="Agent name or company" />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select value={status} onChange={e => setStatus(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white">
                {COMPANY_STATUS_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2 pt-2 border-t border-slate-100">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Renewals & Compliance</p>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Company Renewal Due</label>
                  <input value={renewalDueDate} onChange={e => setRenewalDueDate(e.target.value)} type="date" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Annual Report Due</label>
                  <input value={annualReportDueDate} onChange={e => setAnnualReportDueDate(e.target.value)} type="date" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Tax Filing Due</label>
                  <input value={taxFilingDueDate} onChange={e => setTaxFilingDueDate(e.target.value)} type="date" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Registered Agent Renewal</label>
                  <input value={registeredAgentRenewalDate} onChange={e => setRegisteredAgentRenewalDate(e.target.value)} type="date" className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white" />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Compliance Status</label>
                  <select value={complianceStatus} onChange={e => setComplianceStatus(e.target.value)} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white">
                    {COMPLIANCE_STATUS_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-slate-600 mb-1">Compliance Notes</label>
                  <textarea value={complianceNotes} onChange={e => setComplianceNotes(e.target.value)} rows={3} className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white resize-none" placeholder="Internal note shown to the client when useful." />
                </div>
              </div>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg space-y-1.5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">System Fields (read-only)</p>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Company ID</span>
              <span className="text-slate-700 font-mono">{company.id.slice(0, 16)}…</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Order ID</span>
              <span className="text-slate-700 font-mono">{company.orderId ? `${company.orderId.slice(0, 16)}…` : '—'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">User ID</span>
              <span className="text-slate-700 font-mono">{company.userId ? `${company.userId.slice(0, 16)}…` : '—'}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Created</span>
              <span className="text-slate-700">{new Date(company.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 px-6 py-4 border-t border-slate-200 flex-shrink-0">
          <button onClick={onClose} className="flex-1 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="flex-1 py-2 text-sm rounded-lg bg-[#1a56ff] text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
            {saving && <Loader2 size={13} className="animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

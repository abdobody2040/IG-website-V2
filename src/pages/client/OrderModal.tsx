import { useState } from 'react'
import { Loader2, CheckCircle, X, Mail, Building2, User, Phone } from 'lucide-react'
import type { Service } from '../../data/addonServices'

interface OrderModalProps {
  service: Service
  userEmail: string
  userName: string
  companies: Array<{ id: string; companyName: string; companyType: string; state: string }>
  onClose: () => void
}

export function OrderModal({ service, userEmail, userName, companies, onClose }: OrderModalProps) {
  const Icon = service.icon
  const [form, setForm] = useState({
    name: userName || '',
    email: userEmail || '',
    phone: '',
    companyId: companies[0]?.id || '',
    notes: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    const selectedCompany = companies.find(c => c.id === form.companyId)
    const companyInfo = selectedCompany
      ? `${selectedCompany.companyName} (${selectedCompany.companyType} · ${selectedCompany.state})`
      : 'N/A'

    const subject = encodeURIComponent(`Service Request: ${service.title} — $${service.price}`)
    const body = encodeURIComponent(
      `Hi Instant Grow team,\n\n` +
      `I'd like to order the following service:\n\n` +
      `Service: ${service.title}\n` +
      `Price: $${service.price} ${service.period}\n\n` +
      `My details:\n` +
      `Name: ${form.name}\n` +
      `Email: ${form.email}\n` +
      `Phone: ${form.phone || 'Not provided'}\n` +
      `Company: ${companyInfo}\n\n` +
      `Additional notes:\n${form.notes || 'None'}\n\n` +
      `Please reach out to confirm next steps.\n\nThank you.`
    )

    window.open(`mailto:info@instantgrow.net?subject=${subject}&body=${body}`, '_blank')

    await new Promise(r => setTimeout(r, 600))
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-8 text-center relative">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Request Sent!</h3>
          <p className="text-sm text-slate-500 mb-6">
            Your email client opened with a pre-filled request for <strong>{service.title}</strong>.
            Our team will contact you within 1 business day.
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-[#1a56ff] text-white text-sm font-semibold hover:bg-[#1440d0] transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full relative">
        <div className="flex items-center gap-3 p-6 border-b border-slate-100">
          <div className="w-10 h-10 rounded-xl bg-[#e8efff] text-[#1a56ff] flex items-center justify-center flex-shrink-0">
            <Icon size={20} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-slate-900">{service.title}</h3>
            <p className="text-xs text-slate-500">{service.detail}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 ml-2">
            <X size={18} />
          </button>
        </div>

        <div className="flex items-center justify-between px-6 py-3 bg-slate-50 border-b border-slate-100">
          <span className="text-sm text-slate-600">Service fee</span>
          <span className="text-lg font-bold text-slate-900">${service.price} <span className="text-sm font-normal text-slate-400">{service.period}</span></span>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Full Name *</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  placeholder="John Doe"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff]"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={form.phone}
                  onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                  placeholder="+1 555 000 0000"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Email *</label>
            <div className="relative">
              <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                required
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="you@example.com"
                className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff]"
              />
            </div>
          </div>

          {companies.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                {service.requiresCompany ? 'Company *' : 'Company (optional)'}
              </label>
              <div className="relative">
                <Building2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  required={service.requiresCompany}
                  value={form.companyId}
                  onChange={e => setForm(f => ({ ...f, companyId: e.target.value }))}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff] appearance-none bg-white"
                >
                  {!service.requiresCompany && <option value="">None</option>}
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.companyName} ({c.companyType} · {c.state})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Additional Notes</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={3}
              placeholder="Any specific details or instructions for this service…"
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/20 focus:border-[#1a56ff] resize-none"
            />
          </div>

          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-sm font-semibold hover:bg-slate-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-2.5 rounded-xl bg-[#1a56ff] text-white text-sm font-semibold hover:bg-[#1440d0] transition-colors disabled:opacity-70 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <><Loader2 size={14} className="animate-spin" /> Sending…</>
              ) : (
                <><Mail size={14} /> Send Request</>
              )}
            </button>
          </div>

          <p className="text-xs text-slate-400 text-center">
            This opens your email client with a pre-filled request. Our team will confirm and send an invoice.
          </p>
        </form>
      </div>
    </div>
  )
}

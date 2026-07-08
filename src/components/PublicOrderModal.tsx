import { useState } from 'react'
import * as Icons from 'lucide-react'
import { User, Mail, Phone, Briefcase, X, CheckCircle, Loader2 } from 'lucide-react'
import { ServiceRecord } from '../hooks/useServices'

interface PublicOrderModalProps {
  service: ServiceRecord
  isAr: boolean
  onClose: () => void
}

export default function PublicOrderModal({ service, isAr, onClose }: PublicOrderModalProps) {
  const IconComponent = (Icons as any)[service.icon] || Icons.HelpCircle
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    notes: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const title = isAr ? service.title_ar : service.title_en
  const period = isAr ? service.period_ar : service.period_en
  const detail = isAr ? (service.detail_ar || service.description_ar) : (service.detail_en || service.description_en)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    const subject = encodeURIComponent(`Public Service Order: ${service.title_en} — $${service.price}`)
    const body = encodeURIComponent(
      `Dear Instant Grow Support,\n\n` +
      `I would like to order the following service:\n\n` +
      `Service: ${service.title_en}\n` +
      `Price: $${service.price} ${service.period_en}\n\n` +
      `My contact information:\n` +
      `Name: ${form.name}\n` +
      `Email: ${form.email}\n` +
      `Phone: ${form.phone || 'Not provided'}\n` +
      `Company profile (if any): ${form.company || 'None'}\n\n` +
      `Additional notes/requirements:\n${form.notes || 'None'}\n\n` +
      `Please contact me to arrange invoice payment and next steps.\n\nBest regards,\n${form.name}`
    )

    window.open(`mailto:info@instantgrow.net?subject=${subject}&body=${body}`, '_blank')

    await new Promise(r => setTimeout(r, 600))
    setSubmitting(false)
    setSubmitted(true)
  }

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full p-8 text-center relative animate-in fade-in zoom-in duration-200">
          <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
            <X size={18} />
          </button>
          <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-green-200">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">
            {isAr ? 'تم إرسال الطلب!' : 'Request Initiated!'}
          </h3>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">
            {isAr 
              ? 'لقد تم فتح تطبيق البريد الخاص بك بطلب معبأ مسبقاً. سنقوم بالتواصل معك لتسوية الفاتورة والتنفيذ.' 
              : 'Your email client has opened with a pre-filled request. Our team will contact you shortly to arrange payment.'}
          </p>
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-blue-650 text-white text-sm font-semibold hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/10"
          >
            {isAr ? 'تم' : 'Done'}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-lg w-full relative flex flex-col max-h-[90vh] animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="flex items-center gap-3 p-6 border-b border-slate-100 flex-shrink-0">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <IconComponent size={22} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-slate-900 text-base sm:text-lg">{title}</h3>
            <p className="text-xs text-slate-400 font-medium truncate max-w-[280px]">/ {detail}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 ml-2">
            <X size={18} />
          </button>
        </div>

        {/* Pricing Info bar */}
        <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50 border-b border-slate-100 flex-shrink-0">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{isAr ? 'رسوم الخدمة' : 'Service Fee'}</span>
          <span className="text-lg font-extrabold text-blue-600">
            {service.price > 0 ? `$${service.price}` : (isAr ? 'مشمول' : 'Included')} {service.price > 0 && <span className="text-xs font-medium text-slate-400">/ {period}</span>}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={e => void handleSubmit(e)} className="flex-1 overflow-y-auto p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{isAr ? 'الاسم بالكامل' : 'Full Name'}</label>
              <div className="relative">
                <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  required
                  value={form.name}
                  onChange={e => setForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={isAr ? 'جون دو' : 'John Doe'}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{isAr ? 'البريد الإلكتروني' : 'Email Address'}</label>
              <div className="relative">
                <Mail size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={e => setForm(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="john@example.com"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{isAr ? 'رقم الهاتف (اختياري)' : 'Phone Number (Optional)'}</label>
              <div className="relative">
                <Phone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={form.phone}
                  onChange={e => setForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="+1 (555) 000-0000"
                  className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">{isAr ? 'اسم الشركة المقترح (اختياري)' : 'Proposed Company (Optional)'}</label>
              <div className="relative">
                <Briefcase size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={form.company}
                  onChange={e => setForm(prev => ({ ...prev, company: e.target.value }))}
                  placeholder={isAr ? 'شركة التقنيات المحدودة' : 'Acme Technologies LLC'}
                  className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">{isAr ? 'ملاحظات إضافية' : 'Additional Notes'}</label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={e => setForm(prev => ({ ...prev, notes: e.target.value }))}
              placeholder={isAr ? 'أدخل أي تفاصيل أو متطلبات خاصة...' : 'Enter any specific requirements or questions...'}
              className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-400 resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-1.5 w-full py-3 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 transition-colors shadow-lg shadow-blue-500/10 mt-6"
          >
            {submitting ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
            {isAr ? 'تأكيد وإرسال عبر البريد الإلكتروني' : 'Confirm & Send Request via Email'}
          </button>
        </form>
      </div>
    </div>
  )
}

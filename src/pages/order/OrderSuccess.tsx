import { CheckCircle, ArrowRight, MessageCircle, Mail } from 'lucide-react'
import { useSearch } from '@tanstack/react-router'
import { Link } from '@tanstack/react-router'
import { useLang } from '../../i18n/LanguageContext'

export default function OrderSuccess() {
  const { t } = useLang()
  const search = useSearch({ strict: false }) as {
    orderNumber?: string
    plan?: string
    company?: string
  }

  const orderNumber = search.orderNumber ?? 'IG-XXXX'
  const plan = search.plan ?? 'LLC Formation'
  const company = search.company ?? 'Your Company'

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between">
        <a href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1a56ff] flex items-center justify-center font-bold text-white text-xs">IG</div>
          <span className="font-bold text-[#0a0f1e]">Instant Grow</span>
        </a>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full text-center">
          {/* Success icon */}
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle size={40} className="text-green-500" />
            </div>
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-2" style={{ fontFamily: 'Sora, sans-serif' }}>
            {t.orderSuccess.orderPlaced} 🎉
          </h1>
          <p className="text-slate-500 mb-8">
            {t.orderSuccess.orderReceivedDesc}
          </p>

          {/* Order card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6 text-left">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">{t.orderSuccess.orderNumberLabel}</p>
                <p className="font-mono font-bold text-slate-900 text-lg">{orderNumber}</p>
              </div>
              <span className="bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold px-3 py-1 rounded-full">
                {t.orderSuccess.pendingReview}
              </span>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">{t.orderSuccess.company}</span>
                <span className="font-semibold text-slate-900">{company}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">{t.orderSuccess.package}</span>
                <span className="font-semibold text-slate-900">{plan}</span>
              </div>
            </div>
          </div>

          {/* What happens next */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 mb-6 text-left">
            <h3 className="font-bold text-slate-900 mb-4">{t.orderSuccess.whatHappensNext}</h3>
            <div className="space-y-4">
              {[
                { icon: Mail, step: '1', title: t.orderSuccess.steps[0]?.title ?? '', desc: t.orderSuccess.steps[0]?.desc ?? '' },
                { icon: CheckCircle, step: '2', title: t.orderSuccess.steps[1]?.title ?? '', desc: t.orderSuccess.steps[1]?.desc ?? '' },
                { icon: MessageCircle, step: '3', title: t.orderSuccess.steps[2]?.title ?? '', desc: t.orderSuccess.steps[2]?.desc ?? '' },
              ].map(({ icon: Icon, step, title, desc }) => (
                <div key={step} className="flex gap-4">
                  <div className="w-8 h-8 bg-[#1a56ff]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Icon size={15} className="text-[#1a56ff]" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900 text-sm">{title}</p>
                    <p className="text-slate-500 text-xs mt-0.5">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/client/dashboard"
              className="flex-1 flex items-center justify-center gap-2 bg-[#1a56ff] text-white font-semibold py-3 rounded-xl hover:bg-[#3a76ff] transition-colors text-sm"
            >
              {t.orderSuccess.goToDashboard} <ArrowRight size={15} />
            </Link>
            <a
              href="https://wa.me/13072898149"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold py-3 rounded-xl hover:bg-[#1fba58] transition-colors text-sm"
            >
              <MessageCircle size={15} /> {t.orderSuccess.whatsappUs}
            </a>
          </div>

          <p className="text-slate-400 text-xs mt-6">
            {t.orderSuccess.questionsEmail}{' '}
            <a href="mailto:info@instantgrow.net" className="text-[#1a56ff] hover:underline">
              info@instantgrow.net
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}

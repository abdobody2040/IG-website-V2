import { useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { CheckCircle, ArrowRight, MessageCircle } from 'lucide-react'

export default function OrderSuccessPage() {
  const [dots, setDots] = useState('.')

  useEffect(() => {
    const id = setInterval(() => setDots(d => d.length >= 3 ? '.' : d + '.'), 600)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="min-h-screen bg-[#f9fafb] flex flex-col" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
      {/* Nav */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 py-4">
          <Link to="/" className="flex items-center gap-2 w-fit">
            <div className="w-8 h-8 rounded-lg bg-[#1a56ff] flex items-center justify-center font-bold text-white text-xs">IG</div>
            <span className="font-bold text-slate-900">Instant Grow</span>
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full text-center">
          {/* Success icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-500" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-3">
            Payment Successful!
          </h1>
          <p className="text-slate-500 text-base mb-8 leading-relaxed">
            Thank you for your order. Our team will review your details and begin your company formation within{' '}
            <strong className="text-slate-700">24 hours</strong>. Watch for an email confirmation shortly.
          </p>

          {/* What happens next */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 text-left mb-6 space-y-4">
            <h3 className="font-bold text-slate-900 text-sm uppercase tracking-wider">What happens next</h3>
            {[
              { step: '1', title: 'Order confirmed', desc: 'You\'ll receive an email with your order details in the next few minutes.', done: true },
              { step: '2', title: 'Team review', desc: 'Our specialists review your company details and begin the filing process.', done: false },
              { step: '3', title: 'Formation filed', desc: 'We file your LLC/LTD with the relevant state or Companies House.', done: false },
              { step: '4', title: 'Documents delivered', desc: 'Your formation documents and EIN are uploaded to your client portal.', done: false },
            ].map((item) => (
              <div key={item.step} className="flex gap-4">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                  item.done ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {item.done ? '✓' : item.step}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 text-sm">{item.title}</p>
                  <p className="text-slate-500 text-xs leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Processing indicator */}
          <div className="bg-[#1a56ff]/5 border border-[#1a56ff]/20 rounded-xl px-5 py-3 text-sm text-[#1a56ff] font-medium mb-8">
            🚀 Your formation is being queued{dots}
          </div>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/client/dashboard"
              className="flex items-center justify-center gap-2 bg-[#1a56ff] text-white font-semibold px-6 py-3 rounded-xl hover:bg-[#3a76ff] transition-colors"
            >
              Go to My Dashboard <ArrowRight size={16} />
            </Link>
            <a
              href="https://wa.me/13072898149"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 border border-slate-300 text-slate-700 font-semibold px-6 py-3 rounded-xl hover:bg-slate-50 transition-colors"
            >
              <MessageCircle size={16} className="text-green-500" />
              WhatsApp Support
            </a>
          </div>

          <p className="text-slate-400 text-xs mt-6">
            Order confirmation also sent to your email ·{' '}
            <a href="mailto:info@instantgrow.net" className="text-[#1a56ff] hover:underline">info@instantgrow.net</a>
          </p>
        </div>
      </div>
    </div>
  )
}

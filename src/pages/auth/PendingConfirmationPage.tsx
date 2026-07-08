import { useState, useEffect } from 'react'
import { useNavigate, Link } from '@tanstack/react-router'
import { AlertCircle, Loader2, LogOut, MessageCircle, RefreshCw, Globe } from 'lucide-react'
import { pb } from '../../lib/pocketbase'
import { useAuth } from '../../hooks/useAuth'
import { useLang } from '../../i18n/LanguageContext'

export default function PendingConfirmationPage() {
  const { user } = useAuth()
  const { t, isRTL, lang, toggleLang } = useLang()
  const navigate = useNavigate()
  
  const [checking, setChecking] = useState(false)
  const [orderInfo, setOrderInfo] = useState<{ orderNumber: string; isInvoice: boolean } | null>(null)
  const [loadingOrder, setLoadingOrder] = useState(true)

  // Fetch the latest order to determine if it is Invoice or Stripe
  useEffect(() => {
    const userId = user?.id
    if (!userId) return

    let isMounted = true
    async function getLatestOrder() {
      try {
        const res = await pb.collection('orders').getList(1, 1, {
          filter: `user = "${userId}"`,
          sort: '-created',
        })
        if (res.items.length > 0 && isMounted) {
          const latest = res.items[0]
          if (latest) {
            // If status is already active, redirect them immediately
            if (latest.status !== 'pending' && latest.status !== 'cancelled') {
              navigate({ to: '/client/dashboard' })
              return
            }
            setOrderInfo({
              orderNumber: latest.order_number as string,
              isInvoice: !latest.stripe_session_id,
            })
          }
        }
      } catch (err) {
        console.error('Failed to get latest order:', err)
      } finally {
        if (isMounted) setLoadingOrder(false)
      }
    }

    getLatestOrder()
    return () => { isMounted = false }
  }, [user, navigate])

  const handleCheckStatus = async () => {
    if (!user?.id) return
    setChecking(true)
    try {
      // Clear session storage cache to force a fresh DB query in guards
      sessionStorage.removeItem(`ig_has_paid_order_${user.id}`)

      const res = await pb.collection('orders').getList(1, 100, {
        filter: `user = "${user.id}"`,
      })
      const hasConfirmed = res.items.some(
        o => o.status !== 'pending' && o.status !== 'cancelled'
      )

      if (hasConfirmed) {
        // Cache and navigate
        sessionStorage.setItem(`ig_has_paid_order_${user.id}`, 'true')
        navigate({ to: '/client/dashboard' })
      } else {
        // Still pending
        const latest = res.items[0]
        if (latest) {
          setOrderInfo({
            orderNumber: latest.order_number,
            isInvoice: !latest.stripe_session_id,
          })
        }
      }
    } catch (err) {
      console.error('Error checking status:', err)
    } finally {
      setChecking(false)
    }
  }

  const handleLogout = async () => {
    if (user?.id) {
      sessionStorage.removeItem(`ig_has_paid_order_${user.id}`)
    }
    pb.authStore.clear()
    navigate({ to: '/auth/login' })
  }

  // Cast translations to satisfy typescript indexer
  const pendingT = (t as any).pendingConfirmation || {}

  return (
    <div 
      className="min-h-screen bg-slate-50 flex flex-col justify-between"
      style={{ fontFamily: 'Sora, Inter, sans-serif' }}
      dir={isRTL ? 'rtl' : 'ltr'}
    >
      {/* Top Header bar */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#1a56ff] flex items-center justify-center font-bold text-white text-xs">IG</div>
          <span className="font-bold text-[#0a0f1e]">Instant Grow</span>
        </Link>
        
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleLang}
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#1a56ff] font-semibold transition-colors px-2 py-1.5 border border-slate-200 rounded-lg bg-white"
          >
            <Globe size={13} />
            {lang === 'en' ? 'العربية' : 'English'}
          </button>
          
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-xs text-red-600 hover:text-red-700 font-semibold px-2 py-1.5 border border-red-100 bg-red-50/50 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut size={13} />
            {pendingT.logOutBtn || 'Log Out'}
          </button>
        </div>
      </header>

      {/* Main card */}
      <div className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="max-w-lg w-full bg-white rounded-2xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          
          {/* Status animation ring */}
          <div className="flex justify-center">
            <div className="w-20 h-20 bg-amber-50 rounded-full flex items-center justify-center border-2 border-amber-200 animate-pulse">
              <AlertCircle size={40} className="text-amber-500" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-extrabold text-slate-900">{pendingT.title}</h1>
            <p className="text-slate-500 text-sm">{pendingT.subtitle}</p>
          </div>

          {/* Order number badge */}
          {loadingOrder ? (
            <div className="flex justify-center py-2">
              <Loader2 className="animate-spin text-slate-400" size={16} />
            </div>
          ) : orderInfo && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 flex justify-between items-center text-sm font-semibold max-w-xs mx-auto">
              <span className="text-slate-500">{pendingT.orderNumber}:</span>
              <span className="font-mono text-[#1a56ff]">{orderInfo.orderNumber}</span>
            </div>
          )}

          {/* Custom payment details text */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-sm text-slate-600 text-start leading-relaxed space-y-3">
            <p className="font-bold text-slate-800 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-500" />
              {pendingT.statusLabel}: <span className="text-amber-600">{pendingT.statusPending}</span>
            </p>
            {loadingOrder ? (
              <p className="text-slate-400">Loading instructions...</p>
            ) : orderInfo?.isInvoice ? (
              <p className="text-slate-600">{pendingT.invoiceInfo}</p>
            ) : (
              <p className="text-slate-600">{pendingT.stripeInfo}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={handleCheckStatus}
              disabled={checking}
              className="flex-1 flex items-center justify-center gap-2 bg-[#1a56ff] text-white font-semibold py-3 rounded-xl hover:bg-[#3a76ff] transition-all text-sm disabled:opacity-75 shadow-md"
            >
              {checking ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <RefreshCw size={14} className={isRTL ? 'rotate-180' : ''} />
              )}
              {pendingT.checkStatusBtn}
            </button>
            
            <a
              href="https://wa.me/13072898149"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 bg-[#25D366] text-white font-semibold py-3 rounded-xl hover:bg-[#1fba58] transition-all text-sm shadow-md"
            >
              <MessageCircle size={15} />
              {pendingT.contactSupport}
            </a>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-slate-200 bg-white">
        <p>
          {pendingT.questionsEmail}{' '}
          <a href="mailto:info@instantgrow.net" className="text-[#1a56ff] hover:underline font-semibold">
            info@instantgrow.net
          </a>
        </p>
      </footer>
    </div>
  )
}

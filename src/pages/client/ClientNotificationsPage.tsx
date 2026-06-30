import { useAuth } from '../../hooks/useAuth'
import { useNotifications, type AppNotification } from '../../hooks/useNotifications'
import ClientLayout from './ClientLayout'
import { useNavigate } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import { CheckCheck, Bell, Loader2 } from 'lucide-react'
import { useLang } from '../../i18n/LanguageContext'

const TYPE_ICONS: Record<string, string> = {
  order_status: '\ud83d\udd04',
  order_placed: '\ud83d\uded2',
  document_ready: '\ud83d\udcc4',
  payment_received: '\ud83d\udcb3',
  payment_failed: '\u274c',
  admin_message: '\ud83d\udce2',
  compliance: '\ud83d\udcc5',
  general: '\ud83d\udd14',
}

function NotificationItem({ n, onMarkRead }: { n: AppNotification; onMarkRead: (id: string) => void }) {
  const { t } = useLang()
  const navigate = useNavigate()

  return (
    <div
      className={`flex gap-4 p-4 rounded-xl border transition-colors cursor-pointer ${
        !n.read
          ? 'bg-blue-50/50 border-blue-100'
          : 'bg-white border-slate-200 hover:bg-slate-50'
      }`}
      onClick={() => {
        if (!n.read) onMarkRead(n.id)
        if (n.link) navigate({ to: n.link })
      }}
    >
      <span className="text-2xl flex-shrink-0">{TYPE_ICONS[n.type] ?? TYPE_ICONS.general}</span>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p className={`text-sm ${!n.read ? 'font-semibold text-slate-900' : 'text-slate-700'}`}>
            {n.title}
          </p>
          {!n.read && (
            <button
              onClick={(e) => { e.stopPropagation(); onMarkRead(n.id) }}
              className="flex-shrink-0 text-[11px] text-[#1a56ff] hover:underline font-medium"
            >
              {t.client.notificationsPage.markRead}
            </button>
          )}
        </div>
        {n.message && (
          <p className="text-sm text-slate-500 mt-1">{n.message}</p>
        )}
        <p className="text-xs text-slate-400 mt-2">
          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  )
}

export default function ClientNotificationsPage() {
  const { t } = useLang()
  const np = t.client.notificationsPage
  const { user } = useAuth()
  const { notifications, isLoading, unreadCount, markAsRead, markAllAsRead } = useNotifications(user?.id)

  return (
    <ClientLayout currentPath="/client/notifications" title={t.client.nav.notifications}>
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {unreadCount > 0 ? `${unreadCount} unread` : np.allCaughtUp}
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              {np.total.replace('{count}', String(notifications.length))}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="flex items-center gap-1.5 text-sm text-[#1a56ff] font-medium hover:text-[#1a56ff]/80 transition-colors px-3 py-1.5 rounded-lg hover:bg-blue-50"
            >
              <CheckCheck size={15} />
              {np.markAllRead}
            </button>
          )}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={24} className="animate-spin text-slate-400" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <Bell size={40} className="mb-3 opacity-30" />
            <p className="text-sm font-medium">{np.noNotifications}</p>
            <p className="text-xs mt-1">{np.noNotifsDesc}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <NotificationItem key={n.id} n={n} onMarkRead={markAsRead} />
            ))}
          </div>
        )}
      </div>
    </ClientLayout>
  )
}

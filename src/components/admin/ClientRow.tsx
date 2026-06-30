import { Mail, Calendar, Shield, Loader2 } from 'lucide-react'
import type { User } from '../../types/db'

interface Props {
  user: User
  orderCount: number
  totalSpend: number
  onMakeAdmin: (id: string) => void
  promoting: boolean
}

export function ClientRow({ user, orderCount, totalSpend, onMakeAdmin, promoting }: Props) {
  const initials = (user.displayName || user.email || 'U').slice(0, 2).toUpperCase()

  return (
    <tr className="hover:bg-slate-50 transition-colors">
      <td className="px-5 py-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#1a56ff] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
            {initials}
          </div>
          <div>
            <p className="font-medium text-slate-900">{user.displayName || 'No name'}</p>
            <p className="text-xs text-slate-400">ID: {user.id.slice(0, 8)}…</p>
          </div>
        </div>
      </td>
      <td className="px-5 py-3">
        <div className="flex items-center gap-1.5 text-slate-600">
          <Mail size={12} className="text-slate-400" />
          {user.email}
        </div>
      </td>
      <td className="px-5 py-3">
        {user.role === 'admin' ? (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Shield size={10} />
            Admin
          </span>
        ) : (
          <span className="text-xs font-medium text-slate-500 px-2 py-0.5 rounded-full bg-slate-100">Client</span>
        )}
      </td>
      <td className="px-5 py-3 font-semibold text-slate-900">{orderCount}</td>
      <td className="px-5 py-3 font-semibold text-slate-900">
        {totalSpend > 0 ? `$${totalSpend.toLocaleString()}` : '—'}
      </td>
      <td className="px-5 py-3 text-slate-500 text-xs">
        <div className="flex items-center gap-1.5">
          <Calendar size={11} />
          {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </div>
      </td>
      <td className="px-5 py-3">
        {user.role !== 'admin' && (
          <button
            onClick={() => onMakeAdmin(user.id)}
            disabled={promoting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#1a56ff] text-[#1a56ff] rounded-lg hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {promoting && <Loader2 className="h-3 w-3 animate-spin" />}
            Make Admin
          </button>
        )}
      </td>
    </tr>
  )
}

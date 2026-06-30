import { useState } from 'react'
import { X, Loader2, Send } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { pb } from '../../lib/pocketbase'
import { StatusBadge, STATUS_OPTIONS } from './StatusBadge'
import type { Order } from '../../types/db'
import toast from 'react-hot-toast'
import { sendStatusUpdateEmail } from '../../hooks/useEmailNotifications'

interface Props {
  order: Order
  onClose: () => void
}

export function UpdateStatusModal({ order, onClose }: Props) {
  const [status, setStatus] = useState(order.status)
  const [note, setNote]     = useState('')
  const [saving, setSaving] = useState(false)
  const [sendEmail, setSendEmail] = useState(true)
  const queryClient = useQueryClient()

  const handleSave = async () => {
    setSaving(true)
    try {
      await pb.collection('orders').update(order.id, { status })

      // Log status change activity
      try {
        await pb.collection('admin_audit_log').create({
          action: 'update',
          table_name: 'orders',
          record_id: order.id,
          details: JSON.stringify({ message: `Status changed from ${order.status} to ${status} by admin: ${note}` }),
        })
      } catch (logErr) {
        console.error('Failed to log admin action:', logErr)
      }

      // Send status update email to the client if opted in
      const userId = (order as any).user || (order as any).userId
      if (sendEmail && userId) {
        try {
          const p = await pb.collection('users').getOne(userId)
          if (p?.email) {
            await sendStatusUpdateEmail({
              toEmail: p.email,
              toName: p.display_name || p.email.split('@')[0],
              orderNumber: order.orderNumber,
              companyName: order.companyName,
              newStatus: status,
              message: note || undefined,
            })
          }
        } catch (emailErr) {
          console.error('Email notification failed:', emailErr)
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['admin', 'orders'] })
      toast.success('Order status updated')
      onClose()
    } catch {
      toast.error('Failed to update order')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Update Order Status</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="px-6 py-4 space-y-4">
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <span className="text-gray-500">Order:</span>{' '}
            <span className="font-mono font-medium">{order.orderNumber}</span>
            <span className="mx-2 text-gray-300">·</span>
            <span className="text-gray-700">{order.companyName}</span>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Current Status</label>
            <StatusBadge status={order.status} />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">New Status</label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56ff] focus:border-transparent"
            >
              {STATUS_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Note (optional)</label>
            <textarea
              value={note}
              onChange={e => setNote(e.target.value)}
              rows={3}
              placeholder="Add a note for this status change…"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[#1a56ff] focus:border-transparent"
            />
          </div>

          {/* Email notification toggle */}
          <div
            className="flex items-center gap-3 cursor-pointer bg-[#eff6ff] rounded-lg px-4 py-3 border border-[#1a56ff]/10"
            onClick={() => setSendEmail(v => !v)}
          >
            <div className="relative flex-shrink-0">
              <div className={`w-10 h-5 rounded-full transition-colors ${sendEmail ? 'bg-[#1a56ff]' : 'bg-slate-200'}`} />
              <div className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${sendEmail ? 'translate-x-5' : ''}`} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-slate-800 flex items-center gap-1.5">
                <Send size={12} />
                Notify client via email
              </p>
              <p className="text-xs text-slate-500 mt-0.5">Send status update email to the client</p>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving || status === order.status}
            className="px-4 py-2 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-50 flex items-center gap-2"
            style={{ background: '#1a56ff' }}
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Update Status
          </button>
        </div>
      </div>
    </div>
  )
}

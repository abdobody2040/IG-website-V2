import { useState } from 'react'
import { X, Send, Loader2 } from 'lucide-react'
import { pb } from '../lib/pocketbase'
import toast from 'react-hot-toast'

interface SendMessageModalProps {
  userId: string
  userName: string
  onClose: () => void
  onSent: () => void
}

export default function SendMessageModal({ userId, userName, onClose, onSent }: SendMessageModalProps) {
  const [title, setTitle] = useState('')
  const [message, setMessage] = useState('')
  const [type, setType] = useState('admin_message')
  const [sending, setSending] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    setSending(true)

    try {
      await pb.collection('notifications').create({
        user: userId,
        type: type,
        title: title.trim(),
        message: message.trim() || null,
        data: {},
        link: '/client/notifications',
        read: false,
      })

      toast.success('Message sent to ' + userName)
      onSent()
      onClose()
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('SendMessage failed:', msg)
      toast.error(msg)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900">Send Message</h3>
            <p className="text-xs text-slate-500 mt-0.5">To: <span className="font-medium text-slate-700">{userName}</span></p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Type</label>
            <select value={type} onChange={e => setType(e.target.value)}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#1a56ff] bg-white">
              <option value="admin_message">General Message</option>
              <option value="order_status">Order Update</option>
              <option value="document_ready">Document Ready</option>
              <option value="compliance">Compliance Reminder</option>
              <option value="payment_received">Payment Confirmation</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Subject *</label>
            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Your LLC documents are ready" required
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#1a56ff] bg-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Message</label>
            <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4} placeholder="Write your message…"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#1a56ff] bg-white resize-none" />
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
            <p className="text-xs text-blue-700 leading-relaxed">
              The client will see this message in their notification center instantly.
            </p>
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={onClose} disabled={sending}
              className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={sending || !title.trim()}
              className="px-4 py-2 text-sm rounded-lg bg-[#1a56ff] text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1.5">
              {sending ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
              {sending ? 'Sending...' : 'Send Message'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

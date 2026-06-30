import { useState } from 'react'
import { X, UserPlus, Loader2 } from 'lucide-react'
import { pb } from '../lib/pocketbase'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'

interface AddClientModalProps {
  onClose: () => void
}

export default function AddClientModal({ onClose }: AddClientModalProps) {
  const queryClient = useQueryClient()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password) return
    setLoading(true)

    try {
      const createEndpoint = import.meta.env.VITE_CREATE_USER_ENDPOINT as string | undefined

      if (createEndpoint) {
        const res = await fetch(createEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(pb.authStore.token ? { Authorization: `Bearer ${pb.authStore.token}` } : {}),
          },
          body: JSON.stringify({ email: email.trim(), password, displayName: displayName.trim() || undefined, phone: phone.trim() || undefined }),
        })
        const json = await res.json()
        if (!res.ok) throw new Error(json.error || 'Failed to create user')
      } else {
        await pb.collection('users').create({
          email: email.trim(),
          password,
          passwordConfirm: password,
          display_name: displayName.trim() || null,
          phone: phone.trim() || null,
          role: 'client',
        })
      }

      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('Client created successfully')
      onClose()
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create client')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-slate-900">Create Client</h3>
            <p className="text-xs text-slate-500 mt-0.5">Create a new client account directly</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Email *</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="client@example.com" required
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#1a56ff] bg-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Password *</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 6 characters" required minLength={6}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#1a56ff] bg-white" />
            <p className="text-xs text-slate-400 mt-1">Client can change this after first login</p>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Display Name</label>
            <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="Ahmed Hassan"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#1a56ff] bg-white" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+20 100 000 0000"
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2.5 focus:outline-none focus:border-[#1a56ff] bg-white" />
          </div>

          <div className="flex gap-2 justify-end pt-1">
            <button type="button" onClick={onClose} disabled={loading}
              className="px-4 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button type="submit" disabled={loading || !email.trim() || !password}
              className="px-4 py-2 text-sm rounded-lg bg-[#1a56ff] text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-1.5">
              {loading ? <Loader2 size={13} className="animate-spin" /> : <UserPlus size={13} />}
              {loading ? 'Creating...' : 'Create Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

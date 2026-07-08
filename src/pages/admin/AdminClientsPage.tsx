import { useState } from 'react'
import { Users, Search, Edit2, Trash2, X, Loader2, Shield, CheckCircle, XCircle, Eye, UserPlus, Download, UserRoundPlus, MessageSquare } from 'lucide-react'
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal'
import { Link } from '@tanstack/react-router'
import { useUsers, useAllOrders } from '../../hooks/useAdminData'
import { useRequireAdmin } from '../../hooks/useRequireAuth'
import { pb } from '../../lib/pocketbase'
import { useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useExportCsv } from '../../hooks/useExportCsv'
import type { User } from '../../types/db'
import InviteClientModal from '../../components/InviteClientModal'
import AddClientModal from '../../components/AddClientModal'
import SendMessageModal from '../../components/SendMessageModal'
import { Skeleton } from '../../components/ui/Skeleton'

// ── Status Badge ────────────────────────────────────────────────
function RoleBadge({ role }: { role: string }) {
  if (role === 'admin') {
    return (
      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
        <Shield size={10} /> Admin
      </span>
    )
  }
  return (
    <span className="text-xs font-medium text-slate-500 px-2 py-0.5 rounded-full bg-slate-100">Client</span>
  )
}

// ── Edit User Drawer ─────────────────────────────────────────────
function EditUserDrawer({
  user,
  onClose,
  onSaved,
}: {
  user: User
  onClose: () => void
  onSaved: () => void
}) {
  const [displayName, setDisplayName] = useState(user.displayName || '')
  const [email, setEmail] = useState(user.email || '')
  const [phone, setPhone] = useState(user.phone || '')
  const [role, setRole] = useState(user.role || 'client')
  const [saving, setSaving] = useState(false)

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error: updateErr } = await pb.collection('profiles').update(user.id, {
        display_name: displayName,
        email,
        phone,
        role,
        updated_at: new Date().toISOString(),
      })
      if (updateErr) throw updateErr
      toast.success('User updated successfully')
      onSaved()
    } catch {
      toast.error('Failed to update user')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="relative ml-auto w-full max-w-md bg-white h-full shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 flex-shrink-0">
          <div>
            <h2 className="font-semibold text-slate-900">Edit User</h2>
            <p className="text-xs text-slate-500 mt-0.5">{user.displayName || user.email}</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
          {/* Avatar preview */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
            <div className="w-10 h-10 rounded-full bg-[#1a56ff] flex items-center justify-center text-sm font-bold text-white flex-shrink-0">
              {(displayName || email || 'U').slice(0, 2).toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800">{displayName || 'No name'}</p>
              <p className="text-xs text-slate-400">ID: {user.id.slice(0, 16)}…</p>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Display Name</label>
              <input
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white"
                placeholder="Full name"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
              <input
                value={email}
                onChange={e => setEmail(e.target.value)}
                type="email"
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white"
                placeholder="email@example.com"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Phone</label>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                type="tel"
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white"
                placeholder="+1 (555) 000-0000"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Role</label>
              <select
                value={role}
                onChange={e => setRole(e.target.value)}
                className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-[#1a56ff] bg-white"
              >
                <option value="client">Client</option>
                <option value="admin">Admin</option>
              </select>
            </div>


          </div>

          {/* Read-only info */}
          <div className="p-3 bg-slate-50 rounded-lg space-y-1.5">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-2">Account Info</p>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Joined</span>
              <span className="text-slate-700">{new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">Last Sign In</span>
              <span className="text-slate-700">{user.lastSignIn ? new Date(user.lastSignIn).toLocaleDateString() : '—'}</span>
            </div>
            <div className="flex justify-between text-xs items-center">
              <span className="text-slate-500">Email Status</span>
              {user.emailVerified ? (
                <span className="flex items-center gap-1 text-green-600"><CheckCircle size={11} /> Verified</span>
              ) : (
                <span className="flex items-center gap-1 text-red-500"><XCircle size={11} /> Unverified</span>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 px-6 py-4 border-t border-slate-200 flex-shrink-0">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 text-sm rounded-lg bg-[#1a56ff] text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5"
          >
            {saving && <Loader2 size={13} className="animate-spin" />}
            Save Changes
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────
export default function AdminClientsPage() {
  const { isLoading: authLoading } = useRequireAdmin()
  const queryClient = useQueryClient()
  const { exportCsv } = useExportCsv()

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [deletingUser, setDeletingUser] = useState<User | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showAddModal, setShowAddModal] = useState(false)
  const [messagingUser, setMessagingUser] = useState<User | null>(null)

  const { data, isLoading } = useUsers({ page, perPage: 20, search, role: roleFilter })
  // We still need all orders to calculate total spend... Or just use the hook and live with it for now.
  const { orders } = useAllOrders()

  const filtered = data?.items || []
  const totalPages = data?.totalPages || 1
  const totalItems = data?.totalItems || 0

  if (authLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56ff]" /></div>

  const getOrderCount = (userId: string) => orders.filter(o => o.userId === userId).length
  const getTotalSpend = (userId: string) =>
    orders.filter(o => o.userId === userId && o.status !== 'cancelled').reduce((sum, o) => sum + (o.amount || 0), 0)

  const handleDelete = async () => {
    if (!deletingUser) return
    setDeleteLoading(true)
    try {
      const deleteEndpoint = import.meta.env.VITE_DELETE_USER_ENDPOINT as string | undefined
      if (deleteEndpoint) {
        const res = await fetch(deleteEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(pb.authStore.token ? { Authorization: `Bearer ${pb.authStore.token}` } : {}),
          },
          body: JSON.stringify({ userId: deletingUser.id }),
        })
        if (!res.ok) {
          const body = await res.json().catch(() => ({}))
          throw new Error(body.error || 'Delete failed')
        }
      } else {
        await pb.collection('users').delete(deletingUser.id)
      }
      await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
      toast.success('User deleted')
      setDeletingUser(null)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to delete user')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleSaved = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin', 'users'] })
    setEditingUser(null)
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-0.5">
          <Users className="h-5 w-5 text-[#1a56ff]" />
          <h2 className="text-xl font-bold text-slate-900">All Clients</h2>
          <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full">{totalItems}</span>
        </div>
        <p className="text-slate-500 text-sm mt-0.5">View, edit, and manage all registered users</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name or email"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff] bg-white w-72"
          />
        </div>
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
          className="py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff] bg-white"
        >
          <option value="all">All Roles</option>
          <option value="client">Client</option>
          <option value="admin">Admin</option>
        </select>
        <span className="py-2 text-sm text-slate-500">{filtered.length} user{filtered.length !== 1 ? 's' : ''}</span>
        <button
          onClick={() => exportCsv(
            filtered.map(u => ({
              email: u.email, displayName: u.displayName, role: u.role,
              emailVerified: u.emailVerified ? 'Yes' : 'No', createdAt: u.createdAt, lastSignIn: u.lastSignIn ?? '',
            })),
            'clients_export',
            { email: 'Email', displayName: 'Name', role: 'Role', emailVerified: 'Verified', createdAt: 'Joined', lastSignIn: 'Last Sign In' }
          )}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <Download size={13} />
          Export CSV
        </button>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors"
        >
          <UserRoundPlus size={14} />
          Add Client
        </button>
        <button
          onClick={() => setShowInviteModal(true)}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-[#1a56ff] rounded-lg hover:bg-blue-700 transition-colors"
        >
          <UserPlus size={14} />
          Invite Client
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm min-w-[900px]">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="px-5 py-3 text-left"><Skeleton className="h-4 w-24" /></th>
                <th className="px-5 py-3 text-left"><Skeleton className="h-4 w-16" /></th>
                <th className="px-5 py-3 text-left"><Skeleton className="h-4 w-24" /></th>
                <th className="px-5 py-3 text-left"><Skeleton className="h-4 w-16" /></th>
                <th className="px-5 py-3 text-left"><Skeleton className="h-4 w-20" /></th>
                <th className="px-5 py-3 text-left"><Skeleton className="h-4 w-20" /></th>
                <th className="px-5 py-3 text-left"><Skeleton className="h-4 w-40" /></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {[1, 2, 3, 4, 5].map(i => (
                <tr key={i}>
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div>
                        <Skeleton className="h-4 w-28 mb-1" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3"><Skeleton className="h-5 w-16 rounded-full" /></td>
                  <td className="px-5 py-3"><Skeleton className="h-4 w-24" /></td>
                  <td className="px-5 py-3"><Skeleton className="h-4 w-8" /></td>
                  <td className="px-5 py-3"><Skeleton className="h-4 w-16" /></td>
                  <td className="px-5 py-3"><Skeleton className="h-4 w-20" /></td>
                  <td className="px-5 py-3"><Skeleton className="h-8 w-40" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <Users size={36} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No users found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[900px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500 uppercase">
                  {['Client', 'Role', 'Phone', 'Orders', 'Total Spend', 'Joined', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(user => {
                  const initials = (user.displayName || user.email || 'U').slice(0, 2).toUpperCase()
                  const orderCount = getOrderCount(user.id)
                  const totalSpend = getTotalSpend(user.id)
                  return (
                    <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#1a56ff] flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                            {initials}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900">{user.displayName || 'No name'}</p>
                            <p className="text-xs text-slate-400">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3">
                        <RoleBadge role={user.role} />
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-xs">{user.phone || '—'}</td>
                      <td className="px-5 py-3 font-semibold text-slate-900">{orderCount}</td>
                      <td className="px-5 py-3 font-semibold text-slate-900">
                        {totalSpend > 0 ? `$${totalSpend.toLocaleString()}` : '—'}
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">
                        {new Date(user.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2">
                          <Link
                            to="/admin/clients/$userId"
                            params={{ userId: user.id }}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-[#1a56ff]/30 text-[#1a56ff] rounded-lg hover:bg-blue-50 transition-colors"
                          >
                            <Eye size={12} /> View
                          </Link>
                          <button
                            onClick={() => setEditingUser(user)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
                          >
                            <Edit2 size={12} /> Edit
                          </button>
                          <button
                            onClick={() => setMessagingUser(user)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-emerald-200 text-emerald-600 rounded-lg hover:bg-emerald-50 transition-colors"
                          >
                            <MessageSquare size={12} /> Message
                          </button>
                          <button
                            onClick={() => setDeletingUser(user)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50">
              <span className="text-sm text-slate-500">
                Page {page} of {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 text-sm border border-slate-200 rounded-md bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-3 py-1 text-sm border border-slate-200 rounded-md bg-white text-slate-600 disabled:opacity-50 hover:bg-slate-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Send Message Modal */}
      {messagingUser && (
        <SendMessageModal
          userId={messagingUser.id}
          userName={messagingUser.displayName || messagingUser.email}
          onClose={() => setMessagingUser(null)}
          onSent={handleSaved}
        />
      )}

      {/* Add Client Modal */}
      {showAddModal && (
        <AddClientModal onClose={() => setShowAddModal(false)} />
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <InviteClientModal onClose={() => setShowInviteModal(false)} />
      )}

      {/* Edit Drawer */}
      {editingUser && (
        <EditUserDrawer
          user={editingUser}
          onClose={() => setEditingUser(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Delete Confirm */}
      {deletingUser && (
        <DeleteConfirmModal
          title="Delete User"
          itemName={deletingUser.displayName || deletingUser.email}
          onConfirm={handleDelete}
          onClose={() => setDeletingUser(null)}
          loading={deleteLoading}
        />
      )}
    </>
  )
}

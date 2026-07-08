import { useState } from 'react'
import { useParams, Link } from '@tanstack/react-router'
import {
  ArrowLeft, Mail, Phone, Shield, ShoppingBag, Building2,
  FileText, CreditCard, Edit2, Trash2, CheckCircle, ExternalLink, Calendar, Plus, MessageSquare
} from 'lucide-react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { pb } from '../../lib/pocketbase'
import { useRequireAdmin } from '../../hooks/useRequireAuth'
import toast from 'react-hot-toast'
import type { Order, Company, Document, User as DBUser } from '../../types/db'
import { format } from 'date-fns'
import { StatusBadge } from './components/StatusBadge'
import { logAdminAction } from '../../hooks/useAdminAuditLog'
import { SectionTable } from './components/SectionTable'
import { ConfirmDeleteModal } from './components/ConfirmDeleteModal'
import { EditOrderModal } from './components/EditOrderModal'
import { EditCompanyModal } from './components/EditCompanyModal'
import { EditDocumentModal } from './components/EditDocumentModal'
import { AddDocumentModal } from './components/AddDocumentModal'
import { EditPaymentModal } from './components/EditPaymentModal'
import { EditUserDrawer } from './components/EditUserDrawer'
import SendMessageModal from '../../components/SendMessageModal'

export default function AdminClientDetailPage() {
  const { isLoading: authLoading } = useRequireAdmin()
  const { userId } = useParams({ strict: false }) as { userId: string }
  const qc = useQueryClient()

  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['admin', 'user', userId],
    queryFn: async () => {
      const data = await pb.collection('users').getOne(userId)
      return {
        id: data.id,
        email: data['email'] ?? '',
        displayName: data['display_name'] ?? '',
        phone: data['phone'] ?? '',
        role: data['role'] ?? 'client',
        avatarUrl: data['avatar'] ? pb.files.getURL(data, data['avatar'] as string) : (data['avatar_url'] ?? ''),
        emailVerified: data['verified'] ?? false,
        phoneVerified: false,
        country: data['country'] ?? '',
        address: data['address'] ?? '',
        createdAt: data['created'] ?? '',
        updatedAt: data['updated'] ?? '',
        lastSignIn: data['last_sign_in'] ?? '',
        metadata: data['metadata'] ?? '{}',
      } as DBUser
    },
    enabled: !!userId,
  })

  const { data: orders = [] } = useQuery({
    queryKey: ['admin', 'user-orders', userId],
    queryFn: async () => {
      const result = await pb.collection('orders').getList(1, 100, {
        filter: `user = "${userId}"`,
        sort: '-created',
      })
      return result.items.map((r) => ({
        id: r.id,
        userId: r['user'] as string,
        orderNumber: r['order_number'] as string,
        packageName: r['package_name'] as string,
        companyName: r['company_name'] as string,
        companyState: r['company_state'] as string,
        companyType: r['company_type'] as string,
        status: r['status'] as string,
        amount: r['amount'] as number,
        currency: r['currency'] as string,
        notes: (r['notes'] as string) ?? '',
        createdAt: r['created'] as string,
        updatedAt: r['updated'] as string,
      })) as Order[]
    },
    enabled: !!userId,
  })

  const { data: companies = [] } = useQuery({
    queryKey: ['admin', 'user-companies', userId],
    queryFn: async () => {
      const result = await pb.collection('companies').getList(1, 100, {
        filter: `user = "${userId}"`,
        sort: '-created',
      })
      return result.items.map((r) => ({
        id: r.id,
        userId: r['user'] as string,
        orderId: r['order'] as string,
        companyName: r['company_name'] as string,
        companyType: r['company_type'] as string,
        state: r['state'] as string,
        einNumber: r['ein_number'] as string,
        formationDate: r['formation_date'] as string,
        registeredAgent: r['registered_agent'] as string,
        status: r['status'] as string,
        createdAt: r['created'] as string,
        updatedAt: r['updated'] as string,
      })) as Company[]
    },
    enabled: !!userId,
  })

  const { data: documents = [] } = useQuery({
    queryKey: ['admin', 'user-documents', userId],
    queryFn: async () => {
      const result = await pb.collection('documents').getList(1, 100, {
        filter: `user = "${userId}"`,
        sort: '-created',
      })
      return result.items.map((r) => ({
        id: r.id,
        userId: r['user'] as string,
        orderId: r['order'] as string,
        companyId: r['company'] as string,
        name: r['name'] as string,
        docType: r['doc_type'] as string,
        fileUrl: (r['file_url'] as string) ?? '',
        fileName: (r['file_name'] as string) ?? '',
        status: r['status'] as string,
        notes: (r['notes'] as string) ?? '',
        createdAt: r['created'] as string,
        updatedAt: r['updated'] as string,
      })) as Document[]
    },
    enabled: !!userId,
  })

  const { data: payments = [] } = useQuery({
    queryKey: ['admin', 'user-payments', userId],
    queryFn: async () => {
      const result = await pb.collection('payments').getList(1, 100, {
        filter: `user = "${userId}"`,
        sort: '-created',
      })
      return result.items.map((r) => ({
        id: r.id,
        userId: r['user'] as string,
        orderId: r['order'] as string,
        service: r['service'] as string,
        invoiceId: r['invoice_id'] as string,
        amount: r['amount'] as number,
        currency: r['currency'] as string,
        status: r['status'] as string,
        stripePaymentId: (r['stripe_payment_id'] as string) ?? '',
        notes: r['notes'] as string,
        createdAt: r['created'] as string,
        updatedAt: r['updated'] as string,
      }))
    },
    enabled: !!userId,
  })

  const [editUser, setEditUser] = useState(false)
  const [showMessageModal, setShowMessageModal] = useState(false)
  const [editOrder, setEditOrder] = useState<Order | null>(null)
  const [editCompany, setEditCompany] = useState<Company | null>(null)
  const [editDoc, setEditDoc] = useState<Document | null>(null)
  const [addDoc, setAddDoc] = useState(false)
  const [editPayment, setEditPayment] = useState<any | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{ type: string; id: string; label: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  if (authLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56ff]" /></div>

  const refetchAll = () => {
    qc.invalidateQueries({ queryKey: ['admin', 'user', userId] })
    qc.invalidateQueries({ queryKey: ['admin', 'user-orders', userId] })
    qc.invalidateQueries({ queryKey: ['admin', 'user-companies', userId] })
    qc.invalidateQueries({ queryKey: ['admin', 'user-documents', userId] })
    qc.invalidateQueries({ queryKey: ['admin', 'user-payments', userId] })
    qc.invalidateQueries({ queryKey: ['admin', 'users'] })
  }

  async function handleDelete() {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      const tableMap: Record<string, string> = { order: 'orders', company: 'companies', document: 'documents', payment: 'payments' }
      const tableName = tableMap[deleteTarget.type]
      if (!tableName) { toast.error('Unknown table'); return }
      await pb.collection(tableName).delete(deleteTarget.id)
      logAdminAction({ action: 'delete', tableName: tableName, recordId: deleteTarget.id, details: { label: deleteTarget.label } })
      toast.success(`${deleteTarget.type} deleted`)
      refetchAll()
      setDeleteTarget(null)
    } catch { toast.error('Failed to delete') }
    finally { setDeleting(false) }
  }

  if (userLoading) {
    return (
      <>
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56ff]" />
        </div>
      </>
    )
  }

  if (!user) {
    return (
      <>
        <div className="text-center py-20 text-slate-400">User not found</div>
      </>
    )
  }

  const initials = (user.displayName || user.email || 'U').slice(0, 2).toUpperCase()

  return (
    <>
      <Link to="/admin/clients" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 mb-5 transition-colors">
        <ArrowLeft size={15} /> Back to Clients
      </Link>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 mb-6 flex items-start gap-4">
        <div className="w-14 h-14 rounded-full bg-[#1a56ff] flex items-center justify-center text-white text-lg font-bold flex-shrink-0">
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-lg font-bold text-slate-900">{user.displayName || 'No name'}</h2>
            {user.role === 'admin' ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                <Shield size={10} /> Admin
              </span>
            ) : (
              <span className="text-xs font-medium text-slate-500 px-2 py-0.5 rounded-full bg-slate-100">Client</span>
            )}
            {user.emailVerified && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-green-50 text-green-700">
                <CheckCircle size={10} /> Verified
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-4 mt-1.5 text-sm text-slate-500">
            <span className="flex items-center gap-1.5"><Mail size={13} />{user.email}</span>
            {user.phone && <span className="flex items-center gap-1.5"><Phone size={13} />{user.phone}</span>}
            <span className="flex items-center gap-1.5"><Calendar size={13} />Joined {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : '—'}</span>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowMessageModal(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-emerald-500 text-emerald-600 text-sm font-semibold hover:bg-emerald-50 transition-colors"
          >
            <MessageSquare size={14} /> Message
          </button>
          <button
            onClick={() => setEditUser(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#1a56ff] text-[#1a56ff] text-sm font-semibold hover:bg-blue-50 transition-colors"
          >
            <Edit2 size={14} /> Edit User
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {[
          { icon: ShoppingBag, label: 'Orders', value: orders.length, color: 'bg-blue-50 text-[#1a56ff]' },
          { icon: Building2, label: 'Companies', value: companies.length, color: 'bg-purple-50 text-purple-600' },
          { icon: FileText, label: 'Documents', value: documents.length, color: 'bg-green-50 text-green-600' },
          { icon: CreditCard, label: 'Payments', value: payments.length, color: 'bg-amber-50 text-amber-600' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="bg-white rounded-xl border border-slate-200 shadow-sm p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}><Icon size={18} /></div>
            <div><p className="text-xl font-bold text-slate-900">{value}</p><p className="text-xs text-slate-500">{label}</p></div>
          </div>
        ))}
      </div>

      <SectionTable
        title="Orders"
        icon={<ShoppingBag size={16} className="text-[#1a56ff]" />}
        count={orders.length}
        headers={['Order #', 'Company', 'Package', 'Amount', 'Status', 'Date', 'Actions']}
        empty="No orders"
        rows={orders.map(o => (
          <tr key={o.id} className="hover:bg-slate-50 border-b border-slate-100">
            <td className="px-4 py-3 font-mono text-xs text-slate-500">#{o.orderNumber}</td>
            <td className="px-4 py-3"><p className="font-medium text-slate-900 text-sm">{o.companyName}</p><p className="text-xs text-slate-400">{o.companyState} · {o.companyType}</p></td>
            <td className="px-4 py-3 text-sm text-slate-600">{o.packageName}</td>
            <td className="px-4 py-3 font-semibold text-slate-900">${o.amount.toLocaleString()}</td>
            <td className="px-4 py-3"><StatusBadge status={o.status} /></td>
            <td className="px-4 py-3 text-xs text-slate-400">{o.createdAt ? format(new Date(o.createdAt), 'MMM d, yyyy') : '—'}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <button onClick={() => setEditOrder(o)} className="p-1.5 rounded-lg text-slate-400 hover:text-[#1a56ff] hover:bg-blue-50 transition-colors"><Edit2 size={14} /></button>
                <button onClick={() => setDeleteTarget({ type: 'order', id: o.id, label: `Order #${o.orderNumber}` })} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
              </div>
            </td>
          </tr>
        ))}
      />

      <SectionTable
        title="Companies"
        icon={<Building2 size={16} className="text-purple-600" />}
        count={companies.length}
        headers={['Name', 'Type', 'State', 'EIN', 'Status', 'Actions']}
        empty="No companies"
        rows={companies.map(c => (
          <tr key={c.id} className="hover:bg-slate-50 border-b border-slate-100">
            <td className="px-4 py-3 font-medium text-slate-900">{c.companyName}</td>
            <td className="px-4 py-3 text-sm text-slate-600">{c.companyType}</td>
            <td className="px-4 py-3 text-sm text-slate-600">{c.state}</td>
            <td className="px-4 py-3 font-mono text-xs text-slate-500">{c.einNumber || '—'}</td>
            <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <button onClick={() => setEditCompany(c)} className="p-1.5 rounded-lg text-slate-400 hover:text-[#1a56ff] hover:bg-blue-50 transition-colors"><Edit2 size={14} /></button>
                <button onClick={() => setDeleteTarget({ type: 'company', id: c.id, label: c.companyName })} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
              </div>
            </td>
          </tr>
        ))}
      />

      <SectionTable
        title="Documents"
        icon={<FileText size={16} className="text-green-600" />}
        count={documents.length}
        headers={['Name', 'Type', 'Status', 'Created', 'Actions']}
        empty="No documents"
        action={<button onClick={() => setAddDoc(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#1a56ff] text-white text-xs font-semibold hover:bg-[#1440d0] transition-colors"><Plus size={13} />Add Document</button>}
        rows={documents.map(d => (
          <tr key={d.id} className="hover:bg-slate-50 border-b border-slate-100">
            <td className="px-4 py-3 font-medium text-slate-900">{d.name}</td>
            <td className="px-4 py-3 text-xs text-slate-500">{d.docType?.replace(/_/g, ' ')}</td>
            <td className="px-4 py-3"><StatusBadge status={d.status} /></td>
            <td className="px-4 py-3 text-xs text-slate-400">{d.createdAt ? format(new Date(d.createdAt), 'MMM d, yyyy') : '—'}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                {d.fileUrl && <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="p-1.5 rounded-lg text-slate-400 hover:text-green-600 hover:bg-green-50 transition-colors"><ExternalLink size={14} /></a>}
                <button onClick={() => setEditDoc(d)} className="p-1.5 rounded-lg text-slate-400 hover:text-[#1a56ff] hover:bg-blue-50 transition-colors"><Edit2 size={14} /></button>
                <button onClick={() => setDeleteTarget({ type: 'document', id: d.id, label: d.name })} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
              </div>
            </td>
          </tr>
        ))}
      />

      <SectionTable
        title="Payments"
        icon={<CreditCard size={16} className="text-amber-600" />}
        count={payments.length}
        headers={['Invoice', 'Service', 'Amount', 'Status', 'Date', 'Actions']}
        empty="No payments"
        rows={payments.map((p: any) => (
          <tr key={p.id} className="hover:bg-slate-50 border-b border-slate-100">
            <td className="px-4 py-3 font-mono text-xs text-slate-500">{p.invoiceId}</td>
            <td className="px-4 py-3 text-sm text-slate-900">{p.service}</td>
            <td className="px-4 py-3 font-semibold text-slate-900">${Number(p.amount).toLocaleString()}</td>
            <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
            <td className="px-4 py-3 text-xs text-slate-400">{p.createdAt ? format(new Date(p.createdAt), 'MMM d, yyyy') : '—'}</td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2">
                <button onClick={() => setEditPayment(p)} className="p-1.5 rounded-lg text-slate-400 hover:text-[#1a56ff] hover:bg-blue-50 transition-colors"><Edit2 size={14} /></button>
                <button onClick={() => setDeleteTarget({ type: 'payment', id: p.id, label: p.invoiceId })} className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"><Trash2 size={14} /></button>
              </div>
            </td>
          </tr>
        ))}
      />

      {editUser && user && <EditUserDrawer user={user} onClose={() => setEditUser(false)} onSaved={refetchAll} />}
      {showMessageModal && user && (
        <SendMessageModal
          userId={user.id}
          userName={user.displayName || user.email}
          onClose={() => setShowMessageModal(false)}
          onSent={() => {}}
        />
      )}
      {editOrder && <EditOrderModal order={editOrder} onClose={() => setEditOrder(null)} onSaved={refetchAll} />}
      {editCompany && <EditCompanyModal company={editCompany} onClose={() => setEditCompany(null)} onSaved={refetchAll} />}
      {editDoc && <EditDocumentModal doc={editDoc} onClose={() => setEditDoc(null)} onSaved={refetchAll} />}
      {addDoc && <AddDocumentModal userId={userId} orders={orders} companies={companies} onClose={() => setAddDoc(false)} onSaved={refetchAll} />}
      {editPayment && <EditPaymentModal payment={editPayment} onClose={() => setEditPayment(null)} onSaved={refetchAll} />}
      {deleteTarget && (
        <ConfirmDeleteModal
          label={deleteTarget.label}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </>
  )
}

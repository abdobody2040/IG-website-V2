import { useState } from 'react'
import { Building2, Search, Edit2, Trash2 } from 'lucide-react'
import { useQueryClient } from '@tanstack/react-query'
import { useCompanies } from '../../hooks/useAdminData'
import { useRequireAdmin } from '../../hooks/useRequireAuth'
import { pb } from '../../lib/pocketbase'
import toast from 'react-hot-toast'
import type { Company } from '../../types/db'
import { logAdminAction } from '../../hooks/useAdminAuditLog'
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal'
import { EditCompanyModal } from './EditCompanyModal'
import { COMPANY_STATUS_OPTIONS, COMPLIANCE_COLORS, STATUS_COLORS, formatDate, renderBadge } from './adminUtils'
import { PaginationBar } from '../../components/PaginationBar'

// ── Main Page ─────────────────────────────────────────────────────
export default function AdminCompaniesPage() {
  const { isLoading: authLoading } = useRequireAdmin()
  
  const [page, setPage] = useState(1)
  const perPage = 20
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [complianceFilter, setComplianceFilter] = useState('all')
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const { data, isLoading } = useCompanies({
    page,
    perPage,
    search,
    status: statusFilter,
    compliance: complianceFilter,
  })

  const queryClient = useQueryClient()

  if (authLoading) return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56ff]" /></div>

  const handleDelete = async () => {
    if (!deletingCompany) return
    setDeleteLoading(true)
    try {
      await pb.collection('companies').delete(deletingCompany.id)
      logAdminAction({ action: 'delete', tableName: 'companies', recordId: deletingCompany.id });
      await queryClient.invalidateQueries({ queryKey: ['admin', 'companies'] })
      toast.success('Company deleted')
      setDeletingCompany(null)
    } catch {
      toast.error('Failed to delete company')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleSaved = async () => {
    await queryClient.invalidateQueries({ queryKey: ['admin', 'companies'] })
    setEditingCompany(null)
  }

  return (
    <>
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-0.5">
          <Building2 className="h-5 w-5 text-[#1a56ff]" />
          <h2 className="text-xl font-bold text-slate-900">All Companies</h2>
          <span className="bg-slate-100 text-slate-600 text-xs font-medium px-2 py-0.5 rounded-full">{data?.totalItems || 0}</span>
        </div>
        <p className="text-slate-500 text-sm mt-0.5">Manage registered companies and their formation details</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by company name"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff] bg-white w-64"
          />
        </div>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
          className="py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff] bg-white"
        >
          <option value="all">All Statuses</option>
          {COMPANY_STATUS_OPTIONS.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
        <select
          value={complianceFilter}
          onChange={e => { setComplianceFilter(e.target.value); setPage(1); }}
          className="py-2 px-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:border-[#1a56ff] bg-white"
        >
          <option value="all">All Compliance</option>
          <option value="overdue">🔴 Overdue</option>
          <option value="due_soon">🟡 Due Soon (≤30 days)</option>
          <option value="compliant">🟢 Compliant</option>
          <option value="no_dates">⚪ No Dates Set</option>
        </select>
        <span className="py-2 text-sm text-slate-500">{data?.totalItems || 0} compan{data?.totalItems !== 1 ? 'ies' : 'y'}</span>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center gap-3 py-12 justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-[#1a56ff]" />
          <span className="text-slate-500 text-sm">Loading companies…</span>
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-12 text-center">
          <Building2 size={36} className="text-slate-300 mx-auto mb-3" />
          <p className="text-slate-500 text-sm">No companies found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[1000px]">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-xs text-slate-500 uppercase">
                  {['Company', 'Type', 'State', 'EIN', 'Renewal Due', 'Compliance', 'Reg. Agent', 'Status', 'User ID', 'Actions'].map(h => (
                    <th key={h} className="px-5 py-3 text-left font-medium">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data.items.map(company => (
                  <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-900">{company.companyName}</p>
                      <p className="text-xs text-slate-400 font-mono">{company.id.slice(0, 10)}…</p>
                    </td>
                    <td className="px-5 py-3 text-slate-600 text-xs font-medium">{company.companyType || '—'}</td>
                    <td className="px-5 py-3 text-slate-600 text-xs">{company.state || '—'}</td>
                    <td className="px-5 py-3 text-slate-600 text-xs font-mono">{company.einNumber || '—'}</td>
                    <td className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(company.renewalDueDate)}</td>
                    <td className="px-5 py-3">{renderBadge(COMPANY_STATUS_OPTIONS.find(o => o.value === company.complianceStatus)?.label ?? company.complianceStatus, COMPLIANCE_COLORS[company.complianceStatus] ?? 'bg-slate-100 text-slate-600')}</td>
                    <td className="px-5 py-3 text-slate-600 text-xs max-w-[100px] truncate">{company.registeredAgent || '—'}</td>
                    <td className="px-5 py-3">
                      {renderBadge(COMPANY_STATUS_OPTIONS.find(o => o.value === company.status)?.label ?? company.status, STATUS_COLORS[company.status] ?? 'bg-slate-100 text-slate-600')}
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-xs font-mono">
                      {company.userId ? `${company.userId.slice(0, 8)}…` : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setEditingCompany(company)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 hover:border-slate-300 transition-colors"
                        >
                          <Edit2 size={12} /> Edit
                        </button>
                        <button
                          onClick={() => setDeletingCompany(company)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        >
                          <Trash2 size={12} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <PaginationBar
            page={page}
            totalPages={data.totalPages}
            totalItems={data.totalItems}
            perPage={perPage}
            onPageChange={setPage}
            label="companies"
          />
        </div>
      )}

      {/* Edit Modal */}
      {editingCompany && (
        <EditCompanyModal
          company={editingCompany}
          onClose={() => setEditingCompany(null)}
          onSaved={handleSaved}
        />
      )}

      {/* Delete Confirm */}
      {deletingCompany && (
        <DeleteConfirmModal
          title="Delete Company"
          itemName={deletingCompany.companyName}
          onConfirm={handleDelete}
          onClose={() => setDeletingCompany(null)}
          loading={deleteLoading}
        />
      )}
    </>
  )
}

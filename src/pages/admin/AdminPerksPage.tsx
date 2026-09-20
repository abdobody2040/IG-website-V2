import { useState, useEffect, useMemo } from 'react'
import { Plus, Search, Edit, Trash2, Gift, Loader2, CheckCircle, AlertCircle, Eye, EyeOff, ChevronLeft, ChevronRight } from 'lucide-react'
import { pb } from '../../lib/pocketbase'
import { useRequireAdmin } from '../../hooks/useRequireAuth'
import { invalidatePerksCache, PerkRecord } from '../../hooks/usePerks'
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal'
import { F6S_PERKS } from '../../data/f6sPerks'

const PERK_CATEGORIES = [
  'General Software',
  'AI & Machine Learning',
  'Developer Tools',
  'Cloud & Hosting',
  'Security & Privacy',
  'Marketing & SEO',
  'Finance & Payments',
  'Productivity & CRM',
  'HR & Hiring',
  'Design & Creative',
  'Sales & Support',
  'Legal',
]

type PerkFormState = Omit<PerkRecord, 'id' | 'created' | 'updated'>

const DEFAULT_FORM: PerkFormState = {
  title_en: '',
  title_ar: '',
  description_en: '',
  description_ar: '',
  partner_name: '',
  discount_label: '',
  promo_code: '',
  cta_url: '',
  cta_label_en: 'Claim Perk',
  cta_label_ar: 'الحصول على الميزة',
  icon: 'Gift',
  badge_en: '',
  badge_ar: '',
  color: '#1a56ff',
  bg_color: '#e8efff',
  sort_order: 10,
  active: true,
  logo_url: '',
  category: 'General Software',
  claim_type: 'singleLink',
  offer_value: '',
}

const ITEMS_PER_PAGE = 30

export default function AdminPerksPage() {
  useRequireAdmin()

  const [perks, setPerks] = useState<PerkRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [currentPage, setCurrentPage] = useState<number>(1)

  const [modalOpen, setModalOpen] = useState(false)
  const [editingPerk, setEditingPerk] = useState<(PerkFormState & { id?: string }) | null>(null)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  // ── Data fetching ──────────────────────────────────────────────────────────
  const fetchPerks = async () => {
    setLoading(true)
    try {
      const records = await pb.collection('perks').getFullList<PerkRecord>({
        sort: 'sort_order,title_en',
      })
      setPerks(records && records.length > 0 ? records : F6S_PERKS)
    } catch (err) {
      console.error('Error loading perks from API, using fallback:', err)
      setPerks(F6S_PERKS)
    }
    setLoading(false)
  }

  useEffect(() => { void fetchPerks() }, [])

  // ── Filtered view ──────────────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return perks.filter(p => {
      const q = search.toLowerCase()
      const matchSearch = !q ||
        p.title_en?.toLowerCase().includes(q) ||
        p.partner_name?.toLowerCase().includes(q) ||
        p.category?.toLowerCase().includes(q) ||
        p.discount_label?.toLowerCase().includes(q)
      const matchCat = categoryFilter === 'all' || (p.category || 'General Software') === categoryFilter
      const matchActive =
        activeFilter === 'all' ? true :
        activeFilter === 'active' ? p.active :
        !p.active
      return matchSearch && matchCat && matchActive
    })
  }, [perks, search, categoryFilter, activeFilter])

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginatedPerks = useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filtered.slice(start, start + ITEMS_PER_PAGE)
  }, [filtered, currentPage])

  // ── Toggle active ──────────────────────────────────────────────────────────
  const handleToggleActive = async (perk: PerkRecord) => {
    try {
      const updated = await pb.collection('perks').update<PerkRecord>(perk.id, { active: !perk.active })
      setPerks(prev => prev.map(p => p.id === perk.id ? updated : p))
      invalidatePerksCache()
      setSuccessMsg(`Perk "${perk.title_en}" ${!perk.active ? 'activated' : 'deactivated'}.`)
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      console.error('Failed to toggle perk status:', err)
      setErrorMsg('Failed to update perk status.')
    }
  }

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    if (!deletingId) return
    setDeleteLoading(true)
    try {
      await pb.collection('perks').delete(deletingId)
      setPerks(prev => prev.filter(p => p.id !== deletingId))
      setDeletingId(null)
      invalidatePerksCache()
      setSuccessMsg('Perk deleted successfully.')
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err) {
      console.error('Failed to delete perk:', err)
      setErrorMsg('Failed to delete perk.')
    } finally {
      setDeleteLoading(false)
    }
  }

  // ── Open modal ─────────────────────────────────────────────────────────────
  const handleOpenEdit = (perk: PerkRecord | null) => {
    setErrorMsg(null)
    setEditingPerk(perk ? { ...perk } : { ...DEFAULT_FORM })
    setModalOpen(true)
  }

  // ── Save ───────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!editingPerk) return
    if (!editingPerk.title_en?.trim()) { setErrorMsg('English title is required.'); return }
    setSaving(true)
    setErrorMsg(null)
    try {
      const payload: Partial<PerkFormState> = {
        title_en:       editingPerk.title_en,
        title_ar:       editingPerk.title_ar,
        description_en: editingPerk.description_en,
        description_ar: editingPerk.description_ar,
        partner_name:   editingPerk.partner_name,
        discount_label: editingPerk.discount_label,
        promo_code:     editingPerk.promo_code,
        cta_url:        editingPerk.cta_url,
        cta_label_en:   editingPerk.cta_label_en,
        cta_label_ar:   editingPerk.cta_label_ar,
        icon:           editingPerk.icon || 'Gift',
        badge_en:       editingPerk.badge_en,
        badge_ar:       editingPerk.badge_ar,
        color:          editingPerk.color || '#1a56ff',
        bg_color:       editingPerk.bg_color || '#e8efff',
        sort_order:     editingPerk.sort_order ?? 10,
        active:         editingPerk.active,
        logo_url:       editingPerk.logo_url,
        category:       editingPerk.category,
        claim_type:     editingPerk.claim_type,
        offer_value:    editingPerk.offer_value,
      }

      if ((editingPerk as { id?: string }).id) {
        const updated = await pb.collection('perks').update<PerkRecord>((editingPerk as { id: string }).id, payload)
        setPerks(prev => prev.map(p => p.id === updated.id ? updated : p))
        setSuccessMsg(`Perk "${updated.title_en}" updated.`)
      } else {
        const created = await pb.collection('perks').create<PerkRecord>(payload)
        setPerks(prev => [...prev, created])
        setSuccessMsg(`Perk "${created.title_en}" created.`)
      }
      invalidatePerksCache()
      setModalOpen(false)
      setEditingPerk(null)
      setTimeout(() => setSuccessMsg(null), 3000)
    } catch (err: unknown) {
      const e = err as { message?: string }
      setErrorMsg(e?.message || 'Failed to save perk.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Member Perks Catalog</h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Manage partner discounts, F6S software perks ({perks.length} deals total), logos, and promo codes.
          </p>
        </div>
        <button
          onClick={() => handleOpenEdit(null)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#1a56ff] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-colors shadow-sm"
        >
          <Plus size={16} />
          Add Perk
        </button>
      </div>

      {/* Toast messages */}
      {successMsg && (
        <div className="flex items-center gap-2 px-4 py-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
          <CheckCircle size={16} className="flex-shrink-0" />
          {successMsg}
        </div>
      )}
      {errorMsg && !modalOpen && (
        <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
          <AlertCircle size={16} className="flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search perks by name, partner, category..."
            value={search}
            onChange={e => { setSearch(e.target.value); setCurrentPage(1) }}
            className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/30"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={e => { setCategoryFilter(e.target.value); setCurrentPage(1) }}
          className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/30"
        >
          <option value="all">All Categories</option>
          {PERK_CATEGORIES.map(c => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
        <select
          value={activeFilter}
          onChange={e => { setActiveFilter(e.target.value as typeof activeFilter); setCurrentPage(1) }}
          className="px-3 py-2.5 border border-slate-200 rounded-xl text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/30"
        >
          <option value="all">All Status</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 size={24} className="animate-spin text-[#1a56ff]" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <Gift size={40} className="mb-3 opacity-30" />
            <p className="font-medium">No perks found</p>
            <p className="text-sm mt-1">Try adjusting your search or filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Logo & Deal</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Partner</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Discount / Value</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Status</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedPerks.map(perk => (
                  <tr key={perk.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5 max-w-xs">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-slate-50 border border-slate-200 p-1 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {perk.logo_url ? (
                            <img
                              src={perk.logo_url}
                              alt={perk.partner_name || perk.title_en}
                              className="w-full h-full object-contain rounded"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).style.display = 'none'
                              }}
                            />
                          ) : (
                            <Gift size={16} className="text-slate-400" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate">{perk.title_en}</p>
                          <p className="text-xs text-slate-400 truncate mt-0.5">{perk.cta_url}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">{perk.partner_name || '—'}</td>
                    <td className="px-4 py-3.5">
                      <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                        {perk.category || 'General'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {perk.discount_label ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {perk.discount_label}
                        </span>
                      ) : '—'}
                    </td>
                    <td className="px-4 py-3.5">
                      <button
                        onClick={() => handleToggleActive(perk)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-colors ${
                          perk.active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-slate-100 text-slate-500 border-slate-200 hover:bg-slate-200'
                        }`}
                      >
                        {perk.active ? <Eye size={11} /> : <EyeOff size={11} />}
                        {perk.active ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center gap-1.5 justify-end">
                        <button
                          onClick={() => handleOpenEdit(perk)}
                          className="p-1.5 text-slate-400 hover:text-[#1a56ff] hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => setDeletingId(perk.id)}
                          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination in table footer */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-600">
            <p>
              Showing {paginatedPerks.length} of {filtered.length} perks (Page {currentPage} of {totalPages})
            </p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft size={14} />
              </button>
              <span className="font-bold">{currentPage}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Edit / Create Modal ── */}
      {modalOpen && editingPerk && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="px-6 pt-6 pb-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">
                {(editingPerk as { id?: string }).id ? 'Edit Perk' : 'Add New Perk'}
              </h3>
              <button
                onClick={() => { setModalOpen(false); setEditingPerk(null) }}
                className="text-slate-400 hover:text-slate-700 text-2xl font-light leading-none"
              >
                ×
              </button>
            </div>

            <div className="p-6 space-y-5">
              {errorMsg && (
                <div className="flex items-center gap-2 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  <AlertCircle size={15} />
                  {errorMsg}
                </div>
              )}

              {/* Titles */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Title (English) *</label>
                  <input
                    type="text"
                    value={editingPerk.title_en}
                    onChange={e => setEditingPerk(p => p ? { ...p, title_en: e.target.value } : p)}
                    placeholder="e.g. $10,000 in GitHub Credits"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Partner Name</label>
                  <input
                    type="text"
                    value={editingPerk.partner_name ?? ''}
                    onChange={e => setEditingPerk(p => p ? { ...p, partner_name: e.target.value } : p)}
                    placeholder="e.g. GitHub"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/30"
                  />
                </div>
              </div>

              {/* Category + Logo URL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Category</label>
                  <select
                    value={editingPerk.category ?? 'General Software'}
                    onChange={e => setEditingPerk(p => p ? { ...p, category: e.target.value } : p)}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/30"
                  >
                    {PERK_CATEGORIES.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Logo URL (Icon/Favicon)</label>
                  <input
                    type="url"
                    value={editingPerk.logo_url ?? ''}
                    onChange={e => setEditingPerk(p => p ? { ...p, logo_url: e.target.value } : p)}
                    placeholder="https://www.google.com/s2/favicons?domain=github.com&sz=128"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/30"
                  />
                </div>
              </div>

              {/* Discount / Value + Promo code */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Discount Label / Value</label>
                  <input
                    type="text"
                    value={editingPerk.discount_label ?? ''}
                    onChange={e => setEditingPerk(p => p ? { ...p, discount_label: e.target.value } : p)}
                    placeholder="e.g. $10,000 USD, 6 months free"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Promo Code (optional)</label>
                  <input
                    type="text"
                    value={editingPerk.promo_code ?? ''}
                    onChange={e => setEditingPerk(p => p ? { ...p, promo_code: e.target.value } : p)}
                    placeholder="e.g. STARTUP2026"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/30 font-mono"
                  />
                </div>
              </div>

              {/* Direct Claim URL + Button text */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Claim URL</label>
                  <input
                    type="url"
                    value={editingPerk.cta_url ?? ''}
                    onChange={e => setEditingPerk(p => p ? { ...p, cta_url: e.target.value } : p)}
                    placeholder="https://partner.com/startup"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/30"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">CTA Button Label</label>
                  <input
                    type="text"
                    value={editingPerk.cta_label_en ?? 'Claim Perk'}
                    onChange={e => setEditingPerk(p => p ? { ...p, cta_label_en: e.target.value } : p)}
                    placeholder="Claim Perk"
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/30"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-500 mb-1.5">Description</label>
                <textarea
                  rows={3}
                  value={editingPerk.description_en ?? ''}
                  onChange={e => setEditingPerk(p => p ? { ...p, description_en: e.target.value } : p)}
                  placeholder="Brief description of the deal..."
                  className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/30 resize-none"
                />
              </div>

              {/* Sort order + Active toggle */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5">Sort Order</label>
                  <input
                    type="number"
                    value={editingPerk.sort_order}
                    onChange={e => setEditingPerk(p => p ? { ...p, sort_order: Number(e.target.value) } : p)}
                    min={0}
                    className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a56ff]/30"
                  />
                </div>
                <div className="flex items-end pb-0.5">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <span className="text-xs font-semibold text-slate-500">Active (visible to members)</span>
                    <div
                      onClick={() => setEditingPerk(p => p ? { ...p, active: !p.active } : p)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
                        editingPerk.active ? 'bg-[#1a56ff]' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
                          editingPerk.active ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </div>
                  </label>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 pb-6 flex justify-end gap-3">
              <button
                onClick={() => { setModalOpen(false); setEditingPerk(null) }}
                className="px-5 py-2.5 border border-slate-200 rounded-xl text-slate-700 text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 bg-[#1a56ff] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 flex items-center gap-2 transition-colors"
              >
                {saving && <Loader2 size={14} className="animate-spin" />}
                {(editingPerk as { id?: string }).id ? 'Save Changes' : 'Create Perk'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {!!deletingId && (
        <DeleteConfirmModal
          title="Delete Perk"
          itemName={perks.find(p => p.id === deletingId)?.title_en ?? 'this perk'}
          onClose={() => setDeletingId(null)}
          onConfirm={() => { void handleDelete() }}
          loading={deleteLoading}
        />
      )}
    </div>
  )
}

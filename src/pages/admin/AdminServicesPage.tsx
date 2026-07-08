import { useState, useEffect } from 'react'
import { Plus, Search, Edit, Trash2, Briefcase, Loader2, Info } from 'lucide-react'
import { pb } from '../../lib/pocketbase'
import { useRequireAdmin } from '../../hooks/useRequireAuth'
import { invalidateServicesCache, ServiceRecord } from '../../hooks/useServices'
import { DeleteConfirmModal } from '../../components/DeleteConfirmModal'

const POPULAR_ICONS = [
  'Calendar', 'RefreshCw', 'Hash', 'FileEdit', 'Award',
  'Building2', 'Landmark', 'CreditCard', 'Shield', 'HeadphonesIcon',
  'MessageSquare', 'HelpCircle', 'Activity', 'PhoneCall'
]

export default function AdminServicesPage() {
  useRequireAdmin()
  const [services, setServices] = useState<ServiceRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | 'addon' | 'landing'>('all')
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'inactive'>('all')

  const [modalOpen, setModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<Partial<ServiceRecord> | null>(null)
  const [saving, setSaving] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const fetchServices = async () => {
    setLoading(true)
    try {
      const records = await pb.collection('services').getFullList<ServiceRecord>({
        sort: 'sort_order,title_en'
      })
      setServices(records)
    } catch (err) {
      console.error('Error loading services:', err)
    }
    setLoading(false)
  }

  useEffect(() => {
    void fetchServices()
  }, [])

  const handleToggleActive = async (service: ServiceRecord) => {
    try {
      const updated = await pb.collection('services').update<ServiceRecord>(service.id, {
        active: !service.active
      })
      setServices(prev => prev.map(s => s.id === service.id ? updated : s))
      invalidateServicesCache()
    } catch (err) {
      console.error('Failed to toggle status:', err)
    }
  }

  const handleDelete = async () => {
    if (!deletingId) return
    try {
      await pb.collection('services').delete(deletingId)
      setServices(prev => prev.filter(s => s.id !== deletingId))
      setDeletingId(null)
      invalidateServicesCache()
    } catch (err) {
      console.error('Failed to delete service:', err)
    }
  }

  const handleOpenEdit = (service: ServiceRecord | null) => {
    setEditingService(service ? { ...service } : {
      title_en: '',
      title_ar: '',
      description_en: '',
      description_ar: '',
      price: 0,
      period_en: 'one-time',
      period_ar: 'مرة واحدة',
      detail_en: '',
      detail_ar: '',
      badge_en: '',
      badge_ar: '',
      requires_company: false,
      icon: 'HelpCircle',
      active: true,
      sort_order: 10,
      type: 'addon',
      color: '#2563EB',
      bg_color: '#EFF6FF',
      href: ''
    })
    setModalOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingService) return
    setSaving(true)
    try {
      const data = {
        ...editingService,
        price: Number(editingService.price || 0),
        sort_order: Number(editingService.sort_order || 10)
      }
      if (editingService.id) {
        await pb.collection('services').update(editingService.id, data)
      } else {
        await pb.collection('services').create(data)
      }
      invalidateServicesCache()
      await fetchServices()
      setModalOpen(false)
      setEditingService(null)
    } catch (err) {
      console.error('Failed to save service:', err)
    }
    setSaving(false)
  }

  const filtered = services.filter(s => {
    const matchesSearch = !search ||
      s.title_en.toLowerCase().includes(search.toLowerCase()) ||
      s.title_ar.includes(search) ||
      s.description_en.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === 'all' || s.type === typeFilter
    const matchesActive = activeFilter === 'all' ||
      (activeFilter === 'active' && s.active) ||
      (activeFilter === 'inactive' && !s.active)
    return matchesSearch && matchesType && matchesActive
  })

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Services Manager</h2>
          <p className="text-slate-500 text-sm mt-0.5">
            {services.length} services configured ({services.filter(s => s.active).length} active)
          </p>
        </div>
        <button
          onClick={() => handleOpenEdit(null)}
          className="bg-[#1a56ff] text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-1.5"
        >
          <Plus size={16} /> Add Service
        </button>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-5 py-4 flex items-start gap-3">
        <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-blue-800">Dynamic Content Delivery</p>
          <p className="text-xs text-blue-700 mt-0.5">
            Services added here will automatically render on the landing page services section (if marked <strong>Landing</strong>) or as buyable items in the client dashboard (if marked <strong>Addon</strong>).
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
        <div className="relative flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search services…"
            className="w-full pl-8 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>
        <div>
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value as any)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">All Types</option>
            <option value="addon">Client Portal Addon</option>
            <option value="landing">Landing Page Feature</option>
          </select>
        </div>
        <div>
          <select
            value={activeFilter}
            onChange={e => setActiveFilter(e.target.value as any)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active Only</option>
            <option value="inactive">Inactive Only</option>
          </select>
        </div>
      </div>

      {/* Services Table */}
      {loading ? (
        <div className="flex items-center gap-3 py-12 justify-center">
          <Loader2 className="animate-spin text-[#1a56ff]" size={24} />
          <span className="text-slate-500 text-sm">Loading services…</span>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-12 text-center">
          <Briefcase size={40} className="text-slate-300 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-900 mb-1">No services found</h3>
          <p className="text-slate-500 text-sm">
            {search || typeFilter !== 'all' || activeFilter !== 'all' ? 'Try adjusting your filters' : 'Add your first service to get started'}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Service Name</th>
                  <th className="px-6 py-4 font-semibold">Type</th>
                  <th className="px-6 py-4 font-semibold">Pricing</th>
                  <th className="px-6 py-4 font-semibold">Sort Order</th>
                  <th className="px-6 py-4 font-semibold text-center">Active</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(service => (
                  <tr key={service.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center font-bold text-slate-700 bg-slate-100 flex-shrink-0">
                          {service.icon.slice(0, 2)}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{service.title_en}</p>
                          <p className="text-xs text-slate-400 font-medium">{service.title_ar}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                        service.type === 'addon'
                          ? 'bg-indigo-50 border-indigo-100 text-indigo-700'
                          : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                      }`}>
                        {service.type === 'addon' ? 'Addon Service' : 'Landing Page'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-bold text-slate-900">${service.price}</span>
                        <span className="text-xs text-slate-400">/ {service.period_en}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-500">
                      {service.sort_order}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => void handleToggleActive(service)}
                        className={`inline-block w-9 h-5 rounded-full transition-colors relative ${
                          service.active ? 'bg-blue-600' : 'bg-slate-200'
                        }`}
                      >
                        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                          service.active ? 'left-4.5' : 'left-0.5'
                        }`} />
                      </button>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEdit(service)}
                          className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          onClick={() => setDeletingId(service.id)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && editingService && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-2xl w-full max-h-[90vh] flex flex-col">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between flex-shrink-0">
              <h3 className="font-bold text-slate-900">
                {editingService.id ? 'Edit Service' : 'Add New Service'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 hover:text-slate-600 font-semibold">&times;</button>
            </div>
            
            <form onSubmit={e => void handleSave(e)} className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Type Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Service Type</label>
                  <select
                    value={editingService.type}
                    onChange={e => setEditingService(prev => ({ ...prev, type: e.target.value as any }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400"
                  >
                    <option value="addon">Client Portal Addon</option>
                    <option value="landing">Landing Page Service</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Icon Component</label>
                  <select
                    value={editingService.icon}
                    onChange={e => setEditingService(prev => ({ ...prev, icon: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-400"
                  >
                    {POPULAR_ICONS.map(ic => (
                      <option key={ic} value={ic}>{ic}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Title Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Title (English)</label>
                  <input
                    required
                    value={editingService.title_en || ''}
                    onChange={e => setEditingService(prev => ({ ...prev, title_en: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="e.g. Annual Report Filing"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 text-right">العنوان (بالعربية)</label>
                  <input
                    required
                    dir="rtl"
                    value={editingService.title_ar || ''}
                    onChange={e => setEditingService(prev => ({ ...prev, title_ar: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-right"
                    placeholder="مثال: تقديم التقرير السنوي"
                  />
                </div>
              </div>

              {/* Description Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Description (English)</label>
                  <textarea
                    required
                    rows={2}
                    value={editingService.description_en || ''}
                    onChange={e => setEditingService(prev => ({ ...prev, description_en: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                    placeholder="Brief description for grid lists..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 text-right">الوصف (بالعربية)</label>
                  <textarea
                    required
                    rows={2}
                    dir="rtl"
                    value={editingService.description_ar || ''}
                    onChange={e => setEditingService(prev => ({ ...prev, description_ar: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-right resize-none"
                    placeholder="وصف مختصر للخدمة..."
                  />
                </div>
              </div>

              {/* Pricing Details */}
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Price (USD $)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={editingService.price ?? ''}
                    onChange={e => setEditingService(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Period (EN)</label>
                  <input
                    value={editingService.period_en || ''}
                    onChange={e => setEditingService(prev => ({ ...prev, period_en: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="e.g. per filing, one-time"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 text-right">الفترة (AR)</label>
                  <input
                    dir="rtl"
                    value={editingService.period_ar || ''}
                    onChange={e => setEditingService(prev => ({ ...prev, period_ar: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-right"
                    placeholder="مثال: لكل ملف، لمرة واحدة"
                  />
                </div>
              </div>

              {/* Detail Content (Used in popups/checkouts) */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Full Detail (EN - optional)</label>
                  <textarea
                    rows={3}
                    value={editingService.detail_en || ''}
                    onChange={e => setEditingService(prev => ({ ...prev, detail_en: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm resize-none"
                    placeholder="More in-depth details for modals..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 text-right">التفاصيل الكاملة (AR - اختياري)</label>
                  <textarea
                    rows={3}
                    dir="rtl"
                    value={editingService.detail_ar || ''}
                    onChange={e => setEditingService(prev => ({ ...prev, detail_ar: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-right resize-none"
                    placeholder="تفاصيل أكثر عمقاً للمودال..."
                  />
                </div>
              </div>

              {/* Badges */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Badge (EN - optional)</label>
                  <input
                    value={editingService.badge_en || ''}
                    onChange={e => setEditingService(prev => ({ ...prev, badge_en: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm"
                    placeholder="e.g. Popular, Hot"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 text-right">شارة (AR - اختياري)</label>
                  <input
                    dir="rtl"
                    value={editingService.badge_ar || ''}
                    onChange={e => setEditingService(prev => ({ ...prev, badge_ar: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-right"
                    placeholder="مثال: الأكثر طلباً"
                  />
                </div>
              </div>

              {/* Extra properties */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="requires_company"
                      checked={editingService.requires_company || false}
                      onChange={e => setEditingService(prev => ({ ...prev, requires_company: e.target.checked }))}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="requires_company" className="text-sm font-medium text-slate-700">Requires company profile</label>
                  </div>
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="active"
                      checked={editingService.active ?? true}
                      onChange={e => setEditingService(prev => ({ ...prev, active: e.target.checked }))}
                      className="rounded text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="active" className="text-sm font-medium text-slate-700">Service is Active</label>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Display Sort Order</label>
                    <input
                      type="number"
                      value={editingService.sort_order ?? 10}
                      onChange={e => setEditingService(prev => ({ ...prev, sort_order: Number(e.target.value) }))}
                      className="w-24 px-2 py-1 border border-slate-200 rounded-lg text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* Landing Page only fields */}
              {editingService.type === 'landing' && (
                <div className="grid grid-cols-3 gap-4 border-t border-slate-100 pt-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Icon Color Hex</label>
                    <input
                      value={editingService.color || ''}
                      onChange={e => setEditingService(prev => ({ ...prev, color: e.target.value }))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                      placeholder="e.g. #2563EB"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Icon Bg Hex</label>
                    <input
                      value={editingService.bg_color || ''}
                      onChange={e => setEditingService(prev => ({ ...prev, bg_color: e.target.value }))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                      placeholder="e.g. #EFF6FF"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1">Redirect Href</label>
                    <input
                      value={editingService.href || ''}
                      onChange={e => setEditingService(prev => ({ ...prev, href: e.target.value }))}
                      className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm"
                      placeholder="e.g. /order"
                    />
                  </div>
                </div>
              )}

              {/* Submit Buttons */}
              <div className="border-t border-slate-100 pt-4 flex justify-end gap-3 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 text-slate-600 text-sm font-semibold rounded-xl hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-[#1a56ff] text-white text-sm font-semibold rounded-xl hover:bg-blue-700 disabled:opacity-60 transition-colors flex items-center gap-1.5"
                >
                  {saving && <Loader2 size={14} className="animate-spin" />}
                  Save Service
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deletingId && (
        <DeleteConfirmModal
          title="Delete Service"
          itemName={services.find(s => s.id === deletingId)?.title_en ?? 'this service'}
          loading={false}
          onConfirm={() => void handleDelete()}
          onClose={() => setDeletingId(null)}
        />
      )}
    </div>
  )
}

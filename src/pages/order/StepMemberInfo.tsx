import { Plus, Trash2, AlertTriangle } from 'lucide-react'
import { useLang } from '../../i18n/LanguageContext'
import type { Member } from './data'

interface RoleOption {
  value: string
  label: string
  desc: string
}

export function StepMemberInfo({
  members,
  setMembers,
  planRegion,
}: {
  members: Member[]
  setMembers: (m: Member[]) => void
  planRegion: 'us' | 'uk'
}) {
  const { t } = useLang()
  const totalOwnership = members.reduce((s, m) => s + (m.ownership || 0), 0)
  const isComplete = Math.abs(totalOwnership - 100) < 0.01
  const hasMultiple = members.length > 1

  const updateMember = (id: string, field: keyof Member, value: string | number) => {
    setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m))
  }

  const addMember = () => {
    // When adding a second member, cap first member's ownership to leave room
    const updatedMembers = members.map((m, idx) => {
      if (idx === 0 && m.ownership === 100) {
        return { ...m, ownership: 50 }
      }
      return m
    })
    setMembers([...updatedMembers, {
      id: crypto.randomUUID(),
      fullName: '',
      role: planRegion === 'uk' ? 'director' : 'member',
      ownership: 50,
      address: '',
      email: '',
      phone: ''
    }])
  }

  const removeMember = (id: string) => {
    if (members.length <= 1) return
    const remaining = members.filter(m => m.id !== id)
    // If only one member left, reset their ownership to 100
    if (remaining.length === 1) {
      setMembers(remaining.map(m => ({ ...m, ownership: 100 })))
    } else {
      setMembers(remaining)
    }
  }

  // Roles per region
  const US_ROLES: RoleOption[] = [
    { value: 'managing_member', label: t.order.roles.managing_member!.label, desc: t.order.roles.managing_member!.desc },
    { value: 'member', label: t.order.roles.member!.label, desc: t.order.roles.member!.desc },
    { value: 'manager', label: t.order.roles.manager!.label, desc: t.order.roles.manager!.desc },
  ]

  const UK_ROLES: RoleOption[] = [
    { value: 'director', label: t.order.roles.director!.label, desc: t.order.roles.director!.desc },
    { value: 'shareholder', label: t.order.roles.shareholder!.label, desc: t.order.roles.shareholder!.desc },
    { value: 'company_secretary', label: t.order.roles.company_secretary!.label, desc: t.order.roles.company_secretary!.desc },
  ]

  const ROLES = planRegion === 'uk' ? UK_ROLES : US_ROLES

  const ownershipError = hasMultiple && isComplete === false && totalOwnership !== 0
    ? `Total: ${totalOwnership.toFixed(1)}% — must equal 100%`
    : hasMultiple && members.some(m => m.ownership >= 100)
    ? 'No single member can hold 100% when there are multiple members'
    : null

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">{t.order.memberInfoTitle}</h2>
      <p className="text-slate-500 text-sm mb-2">{t.order.memberInfoDesc}</p>

      {/* Region badge */}
      <div className="inline-flex items-center gap-1.5 mb-4 px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
        {planRegion === 'uk' ? '🇬🇧 UK LTD — Companies House roles' : '🇺🇸 US LLC — Member roles'}
      </div>

      {/* Ownership tracker */}
      <div className={`rounded-xl px-4 py-2.5 text-sm font-semibold mb-5 flex items-center justify-between ${
        isComplete ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-blue-50 border border-blue-200 text-blue-700'
      }`}>
        <span>{t.order.totalOwnership}: {totalOwnership.toFixed(1)}%</span>
        {isComplete && <span className="text-xs">✓ {t.order.completeLabel}</span>}
      </div>

      {/* Ownership error warning */}
      {ownershipError && (
        <div className="flex items-start gap-2 mb-4 px-4 py-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm">
          <AlertTriangle size={15} className="mt-0.5 flex-shrink-0" />
          <span>{ownershipError}</span>
        </div>
      )}

      <div className="space-y-5">
        {members.map((member, idx) => {
          const memberOwnershipInvalid = hasMultiple && member.ownership >= 100

          return (
            <div key={member.id} className="border border-slate-200 rounded-2xl p-5 relative">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm font-bold text-slate-900">{t.order.memberLabel} {idx + 1}</p>
                {members.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeMember(member.id)}
                    className="text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={15} />
                  </button>
                )}
              </div>

              <div className="space-y-3">
                {/* Full Name */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t.order.fullNameLabel} <span className="text-red-500">*</span></label>
                  <input
                    value={member.fullName}
                    onChange={e => updateMember(member.id, 'fullName', e.target.value)}
                    placeholder={t.order.fullNamePlaceholder}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a56ff] focus:ring-2 focus:ring-[#1a56ff]/10"
                  />
                </div>

                {/* Role */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">{t.order.roleLabel}</label>
                  <div className="grid grid-cols-3 gap-2">
                    {ROLES.map(role => (
                      <button
                        key={role.value}
                        type="button"
                        onClick={() => updateMember(member.id, 'role', role.value)}
                        className={`p-2.5 rounded-xl border-2 text-left transition-all ${
                          member.role === role.value
                            ? 'border-[#1a56ff] bg-[#1a56ff]/5'
                            : 'border-slate-200 hover:border-[#1a56ff]/30'
                        }`}
                      >
                        <p className={`text-xs font-bold leading-tight ${member.role === role.value ? 'text-[#1a56ff]' : 'text-slate-700'}`}>
                          {role.label}
                        </p>
                        <p className="text-[9px] text-slate-400 mt-0.5 leading-tight">{role.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ownership */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t.order.ownershipLabel} <span className="text-red-500">*</span></label>
                  <input
                    type="number"
                    min={0}
                    max={hasMultiple ? 99 : 100}
                    value={member.ownership || ''}
                    onChange={e => updateMember(member.id, 'ownership', parseFloat(e.target.value) || 0)}
                    placeholder="50"
                    className={`w-full border rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 ${
                      memberOwnershipInvalid
                        ? 'border-amber-400 focus:border-amber-500 focus:ring-amber-200'
                        : 'border-slate-300 focus:border-[#1a56ff] focus:ring-[#1a56ff]/10'
                    }`}
                  />
                  {memberOwnershipInvalid && (
                    <p className="text-amber-600 text-[11px] mt-1">Cannot be 100% when multiple members exist</p>
                  )}
                </div>

                {/* Address */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t.order.addressLabel} <span className="text-red-500">*</span></label>
                  <input
                    value={member.address}
                    onChange={e => updateMember(member.id, 'address', e.target.value)}
                    placeholder={t.order.addressPlaceholder}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a56ff] focus:ring-2 focus:ring-[#1a56ff]/10"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t.order.emailLabel} <span className="text-red-500">*</span></label>
                  <input
                    type="email"
                    value={member.email}
                    onChange={e => updateMember(member.id, 'email', e.target.value)}
                    placeholder={t.order.emailPlaceholder}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a56ff] focus:ring-2 focus:ring-[#1a56ff]/10"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">{t.order.phoneLabel} <span className="text-red-500">*</span></label>
                  <input
                    value={member.phone}
                    onChange={e => updateMember(member.id, 'phone', e.target.value)}
                    placeholder={t.order.phonePlaceholder}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a56ff] focus:ring-2 focus:ring-[#1a56ff]/10"
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={addMember}
        className="mt-4 w-full flex items-center justify-center gap-2 border-2 border-dashed border-slate-300 rounded-2xl py-3 text-sm font-semibold text-slate-500 hover:border-[#1a56ff] hover:text-[#1a56ff] transition-colors"
      >
        <Plus size={15} /> {t.order.addAnotherMember}
      </button>
    </div>
  )
}

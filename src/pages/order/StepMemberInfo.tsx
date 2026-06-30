import { Plus, Trash2 } from 'lucide-react'
import { useLang } from '../../i18n/LanguageContext'
import type { Member, MemberRole } from './data'

export function StepMemberInfo({
  members, setMembers
}: {
  members: Member[]
  setMembers: (m: Member[]) => void
}) {
  const { t } = useLang()
  const totalOwnership = members.reduce((s, m) => s + (m.ownership || 0), 0)
  const isComplete = totalOwnership === 100

  const updateMember = (id: string, field: keyof Member, value: string | number) => {
    setMembers(members.map(m => m.id === id ? { ...m, [field]: value } : m))
  }

  const addMember = () => {
    setMembers([...members, {
      id: crypto.randomUUID(),
      fullName: '',
      role: 'member' as MemberRole,
      ownership: 0,
      address: '',
      email: '',
      phone: ''
    }])
  }

  const removeMember = (id: string) => {
    if (members.length <= 1) return
    setMembers(members.filter(m => m.id !== id))
  }

  const ROLES: { value: MemberRole; label: string; desc: string }[] = [
    { value: 'managing_member', label: t.order.roles.managing_member!.label, desc: t.order.roles.managing_member!.desc },
    { value: 'member', label: t.order.roles.member!.label, desc: t.order.roles.member!.desc },
    { value: 'manager', label: t.order.roles.manager!.label, desc: t.order.roles.manager!.desc },
  ]

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-1">{t.order.memberInfoTitle}</h2>
      <p className="text-slate-500 text-sm mb-4">{t.order.memberInfoDesc}</p>

      <div className={`rounded-xl px-4 py-2.5 text-sm font-semibold mb-5 flex items-center justify-between ${
        isComplete ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-blue-50 border border-blue-200 text-blue-700'
      }`}>
        <span>{t.order.totalOwnership}: {totalOwnership.toFixed(1)}%</span>
        {isComplete && <span className="text-xs">✓ {t.order.completeLabel}</span>}
      </div>

      <div className="space-y-5">
        {members.map((member, idx) => (
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
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{t.order.fullNameLabel} <span className="text-red-500">*</span></label>
                <input
                  value={member.fullName}
                  onChange={e => updateMember(member.id, 'fullName', e.target.value)}
                  placeholder={t.order.fullNamePlaceholder}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a56ff] focus:ring-2 focus:ring-[#1a56ff]/10"
                />
              </div>

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

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{t.order.ownershipLabel} <span className="text-red-500">*</span></label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={member.ownership || ''}
                  onChange={e => updateMember(member.id, 'ownership', parseFloat(e.target.value) || 0)}
                  placeholder="50"
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a56ff] focus:ring-2 focus:ring-[#1a56ff]/10"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">{t.order.addressLabel} <span className="text-red-500">*</span></label>
                <input
                  value={member.address}
                  onChange={e => updateMember(member.id, 'address', e.target.value)}
                  placeholder={t.order.addressPlaceholder}
                  className="w-full border border-slate-300 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a56ff] focus:ring-2 focus:ring-[#1a56ff]/10"
                />
              </div>

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
        ))}
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

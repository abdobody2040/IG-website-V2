import type { ElementType } from 'react'

export function KPICard({
  label, value, sub, icon: Icon, iconBg, iconColor, loading,
}: {
  label: string; value: string | number; sub?: string
  icon: ElementType; iconBg: string; iconColor: string; loading?: boolean
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col gap-3">
      <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center`}>
        <Icon size={18} className={iconColor} />
      </div>
      {loading ? (
        <div className="space-y-2">
          <div className="h-7 w-20 bg-slate-100 rounded-lg animate-pulse" />
          <div className="h-3.5 w-16 bg-slate-100 rounded animate-pulse" />
        </div>
      ) : (
        <>
          <div>
            <p className="text-2xl font-bold text-slate-900 leading-none">{value}</p>
            {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
          </div>
          <p className="text-xs font-medium text-slate-500">{label}</p>
        </>
      )}
    </div>
  )
}

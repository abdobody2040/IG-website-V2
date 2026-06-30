export function SectionTable({ title, icon, count, headers, rows, empty, action }: {
  title: string; icon: React.ReactNode; count: number;
  headers: string[]; rows: React.ReactNode[]; empty: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden mb-6">
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {icon}
          <span className="font-semibold text-slate-900">{title}</span>
          <span className="bg-slate-100 text-slate-500 text-xs px-2 py-0.5 rounded-full">{count}</span>
        </div>
        {action}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {headers.map(h => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-medium text-slate-500 uppercase tracking-wide whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={headers.length} className="px-4 py-8 text-center text-sm text-slate-400">{empty}</td></tr>
            ) : rows}
          </tbody>
        </table>
      </div>
    </div>
  )
}

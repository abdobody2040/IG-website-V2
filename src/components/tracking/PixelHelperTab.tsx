import { useState } from 'react'
import {
  ShieldAlert, CheckCircle2, AlertTriangle, Info, RefreshCw, Zap
} from 'lucide-react'
import { PixelDiagnostic } from '../../types/tracking'

interface Props {
  diagnostics: PixelDiagnostic[]
}

export default function PixelHelperTab({ diagnostics }: Props) {
  const [scanning, setScanning] = useState(false)
  const [scanTime, setScanTime] = useState<string>('Just now')

  const handleRunScan = async () => {
    setScanning(true)
    await new Promise(r => setTimeout(r, 1000))
    setScanTime(new Date().toLocaleTimeString())
    setScanning(false)
  }

  const errors = diagnostics.filter(d => d.severity === 'error')
  const warnings = diagnostics.filter(d => d.severity === 'warning')
  const infos = diagnostics.filter(d => d.severity === 'info')

  return (
    <div className="space-y-6">
      {/* Scanner Control Header */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Zap className="text-amber-400" size={20} />
            <h3 className="text-lg font-bold">Pixel Helper & Tag Diagnostics</h3>
          </div>
          <p className="text-xs text-slate-300">
            Real-time audit scanner for missing pixels, broken scripts, unverified tags, and Consent Mode V2 alignment.
          </p>
          <span className="text-[11px] text-slate-400 mt-2 block">Last scanned: {scanTime}</span>
        </div>

        <button
          onClick={() => void handleRunScan()}
          disabled={scanning}
          className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-sm transition-all"
        >
          <RefreshCw size={14} className={scanning ? 'animate-spin' : ''} />
          {scanning ? 'Auditing Tags...' : 'Run Diagnostics Scan'}
        </button>
      </div>

      {/* Summary Audit Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0">
            <ShieldAlert size={20} />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900">{errors.length}</span>
            <p className="text-xs text-slate-500 font-medium">Critical Errors</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0">
            <AlertTriangle size={20} />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900">{warnings.length}</span>
            <p className="text-xs text-slate-500 font-medium">Warnings & Missing Pixels</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <span className="text-2xl font-bold text-slate-900">{infos.length}</span>
            <p className="text-xs text-slate-500 font-medium">Health & Compliance Checks</p>
          </div>
        </div>
      </div>

      {/* Diagnostic Issues List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
        <h3 className="font-bold text-slate-900">Diagnostic Findings & Recommendations</h3>

        {diagnostics.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            <CheckCircle2 size={36} className="mx-auto mb-2 text-emerald-500" />
            <p className="font-semibold text-slate-700">All tracking pixels and tags are healthy!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {diagnostics.map(item => {
              const isError = item.severity === 'error'
              const isWarn = item.severity === 'warning'

              return (
                <div
                  key={item.id}
                  className={`p-4 rounded-xl border flex items-start gap-3.5 ${
                    isError
                      ? 'bg-red-50/50 border-red-200'
                      : isWarn
                      ? 'bg-amber-50/50 border-amber-200'
                      : 'bg-blue-50/50 border-blue-200'
                  }`}
                >
                  {isError ? (
                    <ShieldAlert size={18} className="text-red-600 flex-shrink-0 mt-0.5" />
                  ) : isWarn ? (
                    <AlertTriangle size={18} className="text-amber-600 flex-shrink-0 mt-0.5" />
                  ) : (
                    <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
                  )}

                  <div className="space-y-1 flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-slate-900">{item.title}</h4>
                      <span className={`text-[10px] font-semibold uppercase px-2 py-0.5 rounded-md ${
                        isError ? 'bg-red-100 text-red-700' : isWarn ? 'bg-amber-100 text-amber-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {item.severity}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{item.description}</p>
                    <p className="text-xs text-slate-800 font-medium pt-1">
                      💡 <strong>Recommendation:</strong> {item.recommendation}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

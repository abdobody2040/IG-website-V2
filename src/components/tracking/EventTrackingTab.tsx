import { useState } from 'react'
import { Plus, Trash2, CheckCircle2, Play } from 'lucide-react'
import { CustomEventRule } from '../../types/tracking'
import { trackEvent } from '../../lib/tracking/eventTracker'

interface Props {
  events: CustomEventRule[]
  onAdd: (rule: Omit<CustomEventRule, 'id'>) => void
  onToggle: (id: string) => void
  onDelete: (id: string) => void
}

export default function EventTrackingTab({ events, onAdd, onToggle, onDelete }: Props) {
  const [modalOpen, setModalOpen] = useState(false)
  const [testResult, setTestResult] = useState<string | null>(null)

  const [name, setName] = useState('')
  const [category, setCategory] = useState<CustomEventRule['category']>('Lead')
  const [trigger, setTrigger] = useState<CustomEventRule['trigger']>('click')
  const [selector, setSelector] = useState('')
  const [platform] = useState<CustomEventRule['platform']>('all')
  const [value, setValue] = useState<number | undefined>(undefined)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return
    onAdd({
      name,
      category,
      trigger,
      selector,
      platform,
      enabled: true,
      value: value || undefined,
      currency: 'USD'
    })
    setName('')
    setSelector('')
    setValue(undefined)
    setModalOpen(false)
  }

  const handleTestEvent = (ev: CustomEventRule) => {
    trackEvent({
      eventName: ev.name,
      category: ev.category,
      value: ev.value,
      currency: 'USD',
      params: { test_source: 'TrackingModule' }
    })
    setTestResult(`Fired "${ev.name}" to connected pixel payloads!`)
    setTimeout(() => setTestResult(null), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h3 className="text-base font-bold text-slate-900">Custom Event Tracking Rules</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Automatically trigger custom conversion goals (Purchase, Lead, WhatsApp Click, Book Call) to GA4 & Meta Pixel.
          </p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="px-4 py-2 bg-[#1a56ff] hover:bg-blue-700 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm"
        >
          <Plus size={15} /> Create Event Rule
        </button>
      </div>

      {testResult && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs px-4 py-3 rounded-xl font-semibold flex items-center gap-2">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{testResult}</span>
        </div>
      )}

      {/* Rules Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 text-slate-600 text-xs uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5 font-semibold">Event Name</th>
                <th className="px-6 py-3.5 font-semibold">Category</th>
                <th className="px-6 py-3.5 font-semibold">Trigger</th>
                <th className="px-6 py-3.5 font-semibold">Target Platform</th>
                <th className="px-6 py-3.5 font-semibold text-center">Status</th>
                <th className="px-6 py-3.5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {events.map(ev => (
                <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    {ev.name}
                    {ev.value ? <span className="ml-2 text-[10px] text-emerald-600 font-normal">(${ev.value} USD)</span> : null}
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 border border-blue-100 font-semibold text-[11px]">
                      {ev.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-600 font-mono">
                    {ev.trigger} {ev.selector ? `(${ev.selector})` : ''}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-700 uppercase">
                    {ev.platform}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => onToggle(ev.id)}
                      className={`inline-block w-8 h-4.5 rounded-full transition-colors relative ${
                        ev.enabled ? 'bg-blue-600' : 'bg-slate-200'
                      }`}
                    >
                      <span className={`absolute top-0.5 w-3.5 h-3.5 rounded-full bg-white shadow transition-all ${
                        ev.enabled ? 'left-4' : 'left-0.5'
                      }`} />
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button
                      onClick={() => handleTestEvent(ev)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 inline-flex items-center gap-1"
                    >
                      <Play size={11} /> Test
                    </button>
                    <button
                      onClick={() => onDelete(ev.id)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded-lg"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Custom Event Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Create Event Tracking Rule</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 font-bold">&times;</button>
            </div>

            <form onSubmit={handleCreate} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Event Name</label>
                <input
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. Schedule Call Click"
                  className="w-full px-3 py-2 text-xs border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border rounded-xl"
                  >
                    <option value="Lead">Lead</option>
                    <option value="Purchase">Purchase</option>
                    <option value="BookCall">Book Call</option>
                    <option value="WhatsApp">WhatsApp Click</option>
                    <option value="Form">Form Submit</option>
                    <option value="Contact">Contact</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Trigger</label>
                  <select
                    value={trigger}
                    onChange={e => setTrigger(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs border rounded-xl"
                  >
                    <option value="click">Click</option>
                    <option value="form_submit">Form Submit</option>
                    <option value="pageview">Pageview</option>
                    <option value="scroll">Scroll Depth</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">CSS Selector (Optional)</label>
                <input
                  value={selector}
                  onChange={e => setSelector(e.target.value)}
                  placeholder="e.g. .cta-book-button"
                  className="w-full px-3 py-2 text-xs border rounded-xl font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-500 rounded-xl hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#1a56ff] text-white text-xs font-semibold rounded-xl"
                >
                  Create Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

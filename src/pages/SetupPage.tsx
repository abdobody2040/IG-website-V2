import { useState } from 'react'
import { CheckCircle, Loader2, ShieldCheck, User, Copy, Check, Database } from 'lucide-react'
import { pb } from '../lib/pocketbase'
import { seedMockData } from '../lib/setup/seedData'

interface Account {
  email: string
  password: string
  role: string
  dashboardUrl: string
}

const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL ?? 'admin@instantgrow.net'
const CLIENT_EMAIL = import.meta.env.VITE_CLIENT_EMAIL ?? 'client@instantgrow.net'
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD
const CLIENT_PASSWORD = import.meta.env.VITE_CLIENT_PASSWORD

if (!ADMIN_PASSWORD || !CLIENT_PASSWORD) {
  throw new Error('Setup requires VITE_ADMIN_PASSWORD and VITE_CLIENT_PASSWORD environment variables')
}

const ACCOUNTS: Account[] = [
  {
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin',
    dashboardUrl: '/admin',
  },
  {
    email: CLIENT_EMAIL,
    password: CLIENT_PASSWORD,
    role: 'client',
    dashboardUrl: '/client/dashboard',
  },
]

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={handleCopy}
      className="ml-2 text-slate-400 hover:text-[#1a56ff] transition-colors"
      title="Copy"
    >
      {copied ? <Check size={13} className="text-green-500" /> : <Copy size={13} />}
    </button>
  )
}



export default function SetupPage() {
  // Block this page in production — it exposes hardcoded credentials
  if (import.meta.env.PROD) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Not Available</h1>
          <p className="text-slate-500 text-sm">This page is only available in development mode.</p>
          <a href="/" className="mt-4 inline-block text-[#1a56ff] font-medium text-sm hover:underline">Go Home</a>
        </div>
      </div>
    )
  }

  const [statuses, setStatuses] = useState<Record<string, 'idle' | 'loading' | 'done' | 'exists' | 'error'>>({
    [ADMIN_EMAIL]: 'idle',
    [CLIENT_EMAIL]: 'idle',
  })
  const [seedStatus, setSeedStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [allDone, setAllDone] = useState(false)

  const createAccount = async (acc: Account): Promise<string | null> => {
    setStatuses(s => ({ ...s, [acc.email]: 'loading' }))
    try {
      const userRecord = await pb.collection('users').create({
        email: acc.email,
        password: acc.password,
        passwordConfirm: acc.password,
        display_name: acc.role === 'admin' ? 'Admin User' : 'John Client',
        role: acc.role,
      })
      setStatuses(s => ({ ...s, [acc.email]: 'done' }))
      return userRecord.id
    } catch (err: unknown) {
      const msg = (err instanceof Error ? err.message : String(err)) ?? ''
      if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('exists') || msg.toLowerCase().includes('validation_not_unique')) {
        setStatuses(s => ({ ...s, [acc.email]: 'exists' }))
        try {
          const authData = await pb.collection('users').authWithPassword(acc.email, acc.password)
          return authData.record.id
        } catch {
          try {
            const list = await pb.collection('users').getList(1, 1, {
              filter: `email = "${acc.email}"`,
            })
            return list.items[0]?.id ?? null
          } catch {
            return null
          }
        }
      } else {
        console.error(err)
        setStatuses(s => ({ ...s, [acc.email]: 'error' }))
        return null
      }
    }
  }

  const createAll = async () => {
    // Create admin account
    const adminAccount = ACCOUNTS[0]
    if (adminAccount) await createAccount(adminAccount)

    // Create client account and seed mock data
    const clientUserId = await createAccount(ACCOUNTS[1]!)

    if (clientUserId) {
      setSeedStatus('loading')
      try {
        await seedMockData(clientUserId)
        setSeedStatus('done')
      } catch (err) {
        console.error('Seed error:', err)
        setSeedStatus('error')
      }
    }

    setAllDone(true)
  }

  const statusIcon = (s: string) => {
    if (s === 'loading') return <Loader2 size={16} className="animate-spin text-[#1a56ff]" />
    if (s === 'done') return <CheckCircle size={16} className="text-green-500" />
    if (s === 'exists') return <CheckCircle size={16} className="text-amber-500" />
    if (s === 'error') return <span className="text-red-500 text-xs font-semibold">Error</span>
    return <div className="w-4 h-4 rounded-full border-2 border-slate-300" />
  }

  const statusText = (s: string) => {
    if (s === 'loading') return 'Creating...'
    if (s === 'done') return 'Created'
    if (s === 'exists') return 'Already exists'
    if (s === 'error') return 'Failed'
    return 'Pending'
  }

  const isLoading = Object.values(statuses).some(s => s === 'loading') || seedStatus === 'loading'

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <a href="/" className="inline-block mb-4">
            <img src="/logo.png" alt="Instant Grow" className="h-10 w-auto mx-auto" />
          </a>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Test Account Setup</h1>
          <p className="text-slate-500 text-sm">Create demo accounts with mock data to preview all dashboards</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-100">
            <h2 className="text-base font-semibold text-slate-900">Accounts to Create</h2>
          </div>

          <div className="divide-y divide-slate-100">
            {ACCOUNTS.map((acc) => (
              <div key={acc.email} className="px-6 py-5">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                      acc.role === 'admin' ? 'bg-amber-100' : 'bg-blue-100'
                    }`}>
                      {acc.role === 'admin'
                        ? <ShieldCheck size={18} className="text-amber-600" />
                        : <User size={18} className="text-blue-600" />
                      }
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-900 capitalize">{acc.role} Account</p>
                      <p className="text-xs text-slate-500">Dashboard: <a href={acc.dashboardUrl} className="text-[#1a56ff] hover:underline">{acc.dashboardUrl}</a></p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {statusIcon(statuses[acc.email] ?? '')}
                    <span>{statusText(statuses[acc.email] ?? '')}</span>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-xs font-mono">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-sans font-medium">Email</span>
                    <div className="flex items-center text-slate-800">
                      <span>{acc.email}</span>
                      <CopyButton text={acc.email} />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500 font-sans font-medium">Password</span>
                    <div className="flex items-center text-slate-800">
                      <span>{acc.password}</span>
                      <CopyButton text={acc.password} />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {/* Mock data seed status */}
            {seedStatus !== 'idle' && (
              <div className="px-6 py-4 bg-slate-50/60">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                    <Database size={16} className="text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-slate-900">Mock Data</p>
                    <p className="text-xs text-slate-500">Orders, companies &amp; documents for client account</p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    {seedStatus === 'loading' && <Loader2 size={16} className="animate-spin text-[#1a56ff]" />}
                    {seedStatus === 'done' && <CheckCircle size={16} className="text-green-500" />}
                    {seedStatus === 'error' && <span className="text-red-500 font-semibold">Error</span>}
                    <span>{seedStatus === 'loading' ? 'Seeding…' : seedStatus === 'done' ? 'Seeded' : seedStatus === 'error' ? 'Failed' : ''}</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="px-6 py-5 bg-slate-50 border-t border-slate-100">
            {allDone ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600 text-sm font-medium">
                  <CheckCircle size={16} />
                  Accounts ready! You can now log in.
                </div>
                <div className="flex gap-3">
                  <a
                    href="/admin"
                    className="flex-1 text-center bg-amber-500 text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-amber-600 transition-colors"
                  >
                    Open Admin
                  </a>
                  <a
                    href="/auth/login"
                    className="flex-1 text-center bg-[#1a56ff] text-white text-sm font-semibold py-2.5 rounded-xl hover:bg-[#3a76ff] transition-colors"
                  >
                    Login as Client
                  </a>
                </div>
              </div>
            ) : (
              <button
                onClick={createAll}
                disabled={isLoading}
                className="w-full bg-[#1a56ff] text-white text-sm font-semibold py-3 rounded-xl hover:bg-[#3a76ff] transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <><Loader2 size={16} className="animate-spin" /> Setting up accounts &amp; data...</>
                ) : (
                  'Create Test Accounts + Seed Mock Data'
                )}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-4">
          This page is for development/demo purposes only. <a href="/" className="text-[#1a56ff] hover:underline">Back to home</a>
        </p>
      </div>
    </div>
  )
}

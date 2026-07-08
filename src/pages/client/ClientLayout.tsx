import { useState } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  LayoutDashboard, Building2, FileText, Zap,
  Menu, X, LogOut, ChevronRight, Bell, Settings, CreditCard,
  Mail, ShieldCheck, Briefcase, Plus, ChevronDown, Loader2
} from 'lucide-react'
import { pb } from '../../lib/pocketbase'
import { useAuth } from '../../hooks/useAuth'
import { useOrderRealtime } from '../../hooks/useOrderRealtime'
import NotificationCenter from '../../components/NotificationCenter'
import { useLang } from '../../i18n/LanguageContext'
import { useWorkspace } from '../../hooks/useWorkspace'
import toast from 'react-hot-toast'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

function useNavItems(): NavItem[] {
  const { t } = useLang()
  return [
    { label: t.client.nav.home,          href: '/client/dashboard',     icon: LayoutDashboard },
    { label: t.client.nav.payments,      href: '/client/payments',      icon: CreditCard },
    { label: t.client.nav.myCompany,     href: '/client/company',       icon: Building2 },
    { label: t.client.nav.documents,     href: '/client/documents',     icon: FileText },
    { label: t.client.nav.mailInbox,     href: '/client/mail-inbox',    icon: Mail },
    { label: t.client.nav.services,      href: '/client/services',      icon: Zap },
    { label: t.client.nav.verifications, href: '/client/verifications', icon: ShieldCheck },
    { label: 'Workspace Settings',       href: '/client/workspace-settings', icon: Briefcase },
    { label: t.client.nav.notifications, href: '/client/notifications',  icon: Bell },
    { label: t.client.nav.settings,      href: '/client/settings',      icon: Settings },
  ]
}

interface ClientLayoutProps {
  children: React.ReactNode
  currentPath: string
  title: string
}

export default function ClientLayout({ children, currentPath, title }: ClientLayoutProps) {
  const { t, isRTL, toggleLang } = useLang()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const navItems = useNavItems()

  // Workspace Switcher States
  const { workspaces, activeWorkspace, switchWorkspace, createWorkspace } = useWorkspace()
  const [switcherOpen, setSwitcherOpen] = useState(false)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [newWorkspaceName, setNewWorkspaceName] = useState('')
  const [creating, setCreating] = useState(false)

  const handleLogout = async () => {
    await pb.authStore.clear()
    navigate({ to: '/auth/login' })
  }

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newWorkspaceName.trim()) return
    setCreating(true)
    try {
      await createWorkspace(newWorkspaceName.trim())
      setNewWorkspaceName('')
      setCreateModalOpen(false)
      toast.success('Workspace created!')
    } catch (err) {
      toast.error('Failed to create workspace')
    } finally {
      setCreating(false)
    }
  }

  useOrderRealtime(user?.id)

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Client'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Create Workspace Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <form onSubmit={handleCreateWorkspace} className="bg-white rounded-xl max-w-sm w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Create New Workspace</h3>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Workspace Name</label>
              <input
                type="text"
                required
                value={newWorkspaceName}
                onChange={e => setNewWorkspaceName(e.target.value)}
                placeholder="e.g. Acme Corp"
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#1a56ff]"
              />
            </div>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setCreateModalOpen(false)}
                className="px-4 py-2 border border-slate-200 rounded-lg text-slate-700 text-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating}
                className="px-4 py-2 bg-[#1a56ff] text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-60 flex items-center gap-1.5"
              >
                {creating && <Loader2 size={14} className="animate-spin" />}
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      <aside
        className={`fixed lg:static inset-y-0 z-30 w-64 flex flex-col bg-[#0a0f1e] text-white transition-transform duration-300 ${
          isRTL ? 'right-0' : 'left-0'
        } ${
          sidebarOpen ? 'translate-x-0' : isRTL ? 'translate-x-full lg:translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Instant Grow" className="h-8 w-auto" />
          </Link>
          <button className="lg:hidden text-white/60 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Workspace Switcher */}
        <div className="px-3 py-3 border-b border-white/10 relative z-40">
          <button
            onClick={() => setSwitcherOpen(v => !v)}
            className="w-full flex items-center justify-between gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-left transition-colors"
          >
            <div className="min-w-0">
              <p className="text-xs text-white/40 uppercase font-semibold tracking-wider">Active Workspace</p>
              <p className="text-sm font-medium text-white truncate mt-0.5">
                {activeWorkspace ? activeWorkspace.name : 'Select Workspace'}
              </p>
            </div>
            <ChevronDown size={16} className={`text-white/40 transition-transform ${switcherOpen ? 'rotate-180' : ''}`} />
          </button>

          {switcherOpen && (
            <div className="absolute left-3 right-3 mt-1 bg-[#121829] border border-white/10 rounded-lg shadow-xl py-1 z-50 max-h-60 overflow-y-auto custom-scrollbar">
              <div className="text-[10px] text-white/30 font-semibold uppercase tracking-wider px-3 py-1.5 border-b border-white/5">
                My Workspaces
              </div>
              {workspaces.map(ws => (
                <button
                  key={ws.id}
                  onClick={() => {
                    switchWorkspace(ws.id)
                    setSwitcherOpen(false)
                  }}
                  className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center justify-between ${
                    activeWorkspace?.id === ws.id
                      ? 'bg-[#1a56ff] text-white font-medium'
                      : 'text-white/70 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className="truncate">{ws.name}</span>
                  {activeWorkspace?.id === ws.id && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </button>
              ))}
              <div className="border-t border-white/5 mt-1 pt-1">
                <button
                  onClick={() => {
                    setSwitcherOpen(false)
                    setCreateModalOpen(true)
                  }}
                  className="w-full text-left px-3 py-2 text-sm text-[#1a56ff] hover:bg-white/5 hover:text-blue-400 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Plus size={14} />
                  Create Workspace
                </button>
              </div>
            </div>
          )}
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="text-white/30 text-xs font-semibold uppercase tracking-wider px-3 mb-3">{t.client.portal}</p>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = currentPath === item.href
            return (
              <Link
                key={item.href}
                to={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#1a56ff] text-white'
                    : 'text-white/60 hover:text-white hover:bg-white/8'
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon size={16} />
                {item.label}
                {isActive && <ChevronRight size={14} className={`opacity-60 ${isRTL ? 'mr-auto rotate-180' : 'ml-auto'}`} />}
              </Link>
            )
          })}
        </nav>

        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-[#1a56ff] flex items-center justify-center text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{displayName}</p>
              <p className="text-xs text-white/40 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/8 transition-all"
          >
            <LogOut size={15} />
            {t.client.signOut}
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="flex items-center justify-between h-14 px-4 sm:px-6 bg-white border-b border-slate-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            <button
              className="lg:hidden text-slate-600 hover:text-slate-900"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <h1 className="text-base font-semibold text-slate-900">{title}</h1>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
              <span className={`cursor-pointer select-none hover:text-[#1a56ff] transition-colors ${!isRTL ? 'text-[#1a56ff]' : ''}`} onClick={() => { if (isRTL) toggleLang() }}>EN</span>
              <span className="text-slate-300">|</span>
              <span className={`cursor-pointer select-none hover:text-[#1a56ff] transition-colors ${isRTL ? 'text-[#1a56ff]' : ''}`} onClick={() => { if (!isRTL) toggleLang() }}>AR</span>
            </span>
            <NotificationCenter userId={user?.id} />
            <div className="w-8 h-8 rounded-full bg-[#1a56ff] flex items-center justify-center text-xs font-bold text-white">
              {initials}
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

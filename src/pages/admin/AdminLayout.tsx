import { useState } from 'react'
import { Link, useNavigate, Outlet, useLocation } from '@tanstack/react-router'
import {
  LayoutDashboard, ShoppingBag, Users, BarChart3, Settings,
  Menu, X, LogOut, ChevronRight, Shield, Building2, FileText, CreditCard, Newspaper, Globe, Database,
  Home, DollarSign, Briefcase, Layers
} from 'lucide-react'
import { pb } from '../../lib/pocketbase'
import { useAuth } from '../../hooks/useAuth'
import { useRequireAdmin } from '../../hooks/useRequireAuth'
import NotificationCenter from '../../components/NotificationCenter'

interface NavItem {
  label: string
  href: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { label: 'Overview',      href: '/admin',               icon: LayoutDashboard },
  { label: 'Orders',        href: '/admin/orders',         icon: ShoppingBag },
  { label: 'Clients',       href: '/admin/clients',        icon: Users },
  { label: 'Companies',     href: '/admin/companies',      icon: Building2 },
  { label: 'Documents',     href: '/admin/documents',      icon: FileText },
  { label: 'Blog',          href: '/admin/blogs',          icon: Newspaper },
  { label: 'SEO Pages',     href: '/admin/seo',            icon: Globe },
  { label: 'Payments',      href: '/admin/payments',       icon: CreditCard },
  { label: 'Analytics',     href: '/admin/analytics',      icon: BarChart3 },
  { label: 'Home Editor',   href: '/admin/home-editor',    icon: Home },
  { label: 'Price Editor',  href: '/admin/pricing-editor', icon: DollarSign },
  { label: 'Services',      href: '/admin/services',       icon: Briefcase },
  { label: 'Pages Editor',  href: '/admin/pages',          icon: Layers },
  { label: 'Settings',      href: '/admin/settings',       icon: Settings },
]

export default function AdminLayout() {
  useRequireAdmin()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const currentPath = location.pathname

  let title = 'Admin Panel'
  if (currentPath === '/admin') title = 'Admin Overview'
  else if (currentPath.startsWith('/admin/dashboard')) title = 'Dashboard'
  else if (currentPath.startsWith('/admin/orders')) title = 'Orders'
  else if (currentPath.startsWith('/admin/clients')) title = 'Clients'
  else if (currentPath.startsWith('/admin/companies')) title = 'Companies'
  else if (currentPath.startsWith('/admin/documents')) title = 'Documents'
  else if (currentPath.startsWith('/admin/blogs')) title = 'Blog Management'
  else if (currentPath.startsWith('/admin/seo')) title = 'SEO Pages'
  else if (currentPath.startsWith('/admin/payments')) title = 'Payments'
  else if (currentPath.startsWith('/admin/analytics')) title = 'Analytics'
  else if (currentPath.startsWith('/admin/home-editor')) title = 'Home Editor'
  else if (currentPath.startsWith('/admin/pricing-editor')) title = 'Pricing Editor'
  else if (currentPath.startsWith('/admin/services')) title = 'Services Manager'
  else if (currentPath.startsWith('/admin/pages')) title = 'Pages Editor'
  else if (currentPath.startsWith('/admin/settings')) title = 'Settings'

  const handleLogout = async () => {
    await pb.authStore.clear()
    navigate({ to: '/auth/login' })
  }

  const displayName = user?.displayName || user?.email?.split('@')[0] || 'Admin'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" style={{ fontFamily: 'Sora, Inter, sans-serif' }}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-30 w-64 flex flex-col bg-[#0a0f1e] text-white transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Logo */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2.5">
            <img src="/logo.png" alt="Instant Grow" className="h-8 w-auto" />
            <span className="text-white/40 text-[10px]">Admin Panel</span>
          </div>
          <button className="lg:hidden text-white/60 hover:text-white" onClick={() => setSidebarOpen(false)}>
            <X size={18} />
          </button>
        </div>

        {/* Admin badge */}
        <div className="px-4 py-3 border-b border-white/10">
          <div className="flex items-center gap-2 bg-amber-500/10 rounded-lg px-3 py-2 border border-amber-500/20">
            <Shield size={12} className="text-amber-400" />
            <span className="text-amber-400 text-xs font-semibold">Admin Access</span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
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
                {isActive && <ChevronRight size={14} className="ml-auto opacity-60" />}
              </Link>
            )
          })}

          <div className="pt-4 mt-4 border-t border-white/10" />

          <a
            href={`${import.meta.env.VITE_PB_URL || 'http://127.0.0.1:8090'}/_/`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-amber-400/90 hover:text-amber-300 hover:bg-white/8 transition-all"
          >
            <Database size={16} />
            <span>Database Console</span>
            <ChevronRight size={14} className="ml-auto opacity-40" />
          </a>
        </nav>

        {/* User footer */}
        <div className="px-3 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-3 py-2 mb-1">
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold flex-shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">{displayName}</p>
              <p className="text-xs text-amber-400/70 truncate">Administrator</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 w-full rounded-lg text-sm text-white/50 hover:text-white hover:bg-white/8 transition-all"
          >
            <LogOut size={15} />
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
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
            <NotificationCenter userId={user?.id} />
            <div className="w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center text-xs font-bold text-white">
              {initials}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

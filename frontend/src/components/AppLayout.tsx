import { Bell, ChevronDown, LayoutDashboard, LineChart, ListChecks, Menu, ReceiptText, Settings, UsersRound, X } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../auth/AuthContext'
import { Logo } from './ui'

const navigation = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard }, { to: '/groups', label: 'Groups', icon: UsersRound },
  { to: '/activity', label: 'Activity', icon: ListChecks }, { to: '/analytics', label: 'Analytics', icon: LineChart },
  { to: '/settlements', label: 'Settlements', icon: ReceiptText },
]
const names: Record<string, string> = { '/dashboard': 'Dashboard', '/groups': 'Groups', '/activity': 'Activity', '/analytics': 'Analytics', '/settlements': 'Settlements', '/settings': 'Settings' }

export function AppLayout({ children }: { children: ReactNode }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const nav = () => <nav className="space-y-1">{navigation.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} onClick={() => setMenuOpen(false)} className={({ isActive }) => `flex h-10 items-center gap-3 rounded-lg px-3 text-sm transition ${isActive ? 'bg-accent-soft font-medium text-accent' : 'text-muted hover:bg-surface hover:text-ink'}`}><Icon className="size-[18px]" />{label}</NavLink>)}</nav>
  const signOut = () => { logout(); navigate('/login') }
  return <div className="min-h-screen bg-surface md:flex">
    <aside className="fixed inset-y-0 z-30 hidden w-64 flex-col border-r border-line bg-white p-4 md:flex"><Logo /><div className="mt-9">{nav()}</div><div className="mt-8 border-t border-line pt-5"><p className="mb-2 px-3 text-[11px] font-semibold tracking-[0.08em] text-muted">YOUR GROUPS</p><p className="px-3 text-sm text-muted">Your groups will appear here.</p></div><div className="mt-auto space-y-1"><NavLink to="/settings" className={({ isActive }) => `flex h-10 items-center gap-3 rounded-lg px-3 text-sm ${isActive ? 'bg-accent-soft text-accent' : 'text-muted hover:bg-surface hover:text-ink'}`}><Settings className="size-[18px]" />Settings</NavLink><button onClick={signOut} className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-muted hover:bg-surface hover:text-ink"><X className="size-[18px]" />Log out</button></div></aside>
    <div className="flex min-h-screen min-w-0 flex-1 flex-col md:ml-64"><header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-line bg-white/90 px-4 backdrop-blur md:px-8"><div className="flex items-center gap-3"><button className="grid size-9 place-items-center rounded-lg hover:bg-surface md:hidden" onClick={() => setMenuOpen(true)} aria-label="Open navigation"><Menu className="size-5" /></button><h1 className="text-lg font-semibold tracking-[-0.02em]">{names[location.pathname] ?? 'SplitStream'}</h1></div><div className="flex items-center gap-3"><button className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface" aria-label="Notifications"><Bell className="size-[18px]" /></button><button className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-surface"><span className="grid size-7 place-items-center rounded-full bg-accent-soft text-xs font-semibold text-accent">{user?.name.slice(0, 1).toUpperCase()}</span><span className="hidden text-sm font-medium sm:block">{user?.name}</span><ChevronDown className="hidden size-4 text-muted sm:block" /></button></div></header><main className="mx-auto w-full max-w-7xl flex-1 px-4 py-7 md:px-8 md:py-9">{children}</main></div>
    {menuOpen && <div className="fixed inset-0 z-50 bg-ink/20 md:hidden"><aside className="flex h-full w-[280px] flex-col bg-white p-4 shadow-xl"><div className="flex items-center justify-between"><Logo /><button className="grid size-9 place-items-center rounded-lg hover:bg-surface" onClick={() => setMenuOpen(false)} aria-label="Close navigation"><X className="size-5" /></button></div><div className="mt-8">{nav()}</div><div className="mt-auto space-y-1"><NavLink to="/settings" onClick={() => setMenuOpen(false)} className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm text-muted"><Settings className="size-[18px]" />Settings</NavLink><button onClick={signOut} className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-sm text-muted"><X className="size-[18px]" />Log out</button></div></aside></div>}
  </div>
}

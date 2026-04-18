import { useState } from 'react'
import { Link, Outlet, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'

const adminLinks = [
  { to: '/admin',             label: 'Dashboard',   icon: '📊' },
  { to: '/admin/seasons',     label: 'Seasons',     icon: '📅' },
  { to: '/admin/tournaments', label: 'Tournaments', icon: '🏆' },
  { to: '/admin/venues',      label: 'Venues',      icon: '📍' },
  { to: '/admin/opponents',   label: 'Opponents',   icon: '⚔️' },
  { to: '/admin/players',     label: 'Players',     icon: '👤' },
  { to: '/admin/matches',     label: 'Matches',     icon: '🏏' },
]

export default function AdminLayout() {
  const { pathname } = useLocation()
  const [collapsed, setCollapsed] = useState(false)

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">

      {/* ── Sidebar ── */}
      <aside className={clsx(
        'shrink-0 border-r border-slate-800 bg-slate-900',
        'min-h-screen flex flex-col transition-all duration-200',
        collapsed ? 'w-14' : 'w-56'
      )}>
        {/* Logo + collapse toggle */}
        <div className={clsx(
          'flex items-center border-b border-slate-800 h-14',
          collapsed ? 'justify-center px-0' : 'justify-between px-4'
        )}>
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2">
              <span className="text-xl">🏏</span>
              <span className="text-mora-gold text-sm font-bold">Admin</span>
            </Link>
          )}
          <button
            onClick={() => setCollapsed(c => !c)}
            className="p-1.5 rounded-md text-slate-400 hover:text-white
                       hover:bg-slate-800 transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? '→' : '←'}
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 space-y-1 px-2">
          {adminLinks.map(link => {
            const isActive = link.to === '/admin'
              ? pathname === '/admin'
              : pathname.startsWith(link.to)

            return (
              <Link
                key={link.to}
                to={link.to}
                title={collapsed ? link.label : undefined}
                className={clsx(
                  'flex items-center rounded-lg transition-colors',
                  collapsed
                    ? 'justify-center w-10 h-10 mx-auto'
                    : 'gap-3 px-3 py-2',
                  isActive
                    ? 'bg-slate-700 text-white'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                )}
              >
                <span className="text-lg shrink-0">{link.icon}</span>
                {!collapsed && (
                  <span className="text-sm truncate">{link.label}</span>
                )}
              </Link>
            )
          })}
        </nav>

        {/* Bottom: back to public site */}
        <div className="p-2 border-t border-slate-800">
          <Link
            to="/"
            title={collapsed ? 'Public site' : undefined}
            className={clsx(
              'flex items-center rounded-lg text-slate-500',
              'hover:text-slate-300 transition-colors',
              collapsed
                ? 'justify-center w-10 h-10 mx-auto'
                : 'gap-3 px-3 py-2'
            )}
          >
            <span className="text-lg">🌐</span>
            {!collapsed && (
              <span className="text-xs">Public site</span>
            )}
          </Link>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="flex-1 p-6 overflow-auto min-w-0">
        <Outlet />
      </main>
    </div>
  )
}
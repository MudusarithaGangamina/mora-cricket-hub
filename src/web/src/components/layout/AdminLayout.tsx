import { Link, Outlet, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'

const adminLinks = [
  { to: '/admin',                  label: '📊 Dashboard'    },
  { to: '/admin/seasons',          label: '📅 Seasons'      },
  { to: '/admin/tournaments',      label: '🏆 Tournaments'  },
  { to: '/admin/venues',           label: '📍 Venues'       },
  { to: '/admin/opponents',        label: '⚔️ Opponents'    },
  { to: '/admin/players',          label: '👤 Players'      },
  { to: '/admin/matches',          label: '🏏 Matches'      },
]

export default function AdminLayout() {
  const { pathname } = useLocation()

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r border-slate-800 bg-slate-900 min-h-screen p-4">
        <Link to="/" className="flex items-center gap-2 font-bold mb-8">
          <span className="text-xl">🏏</span>
          <span className="text-mora-gold text-sm">Admin Panel</span>
        </Link>
        <nav className="space-y-1">
          {adminLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={clsx(
                'block px-3 py-2 rounded-md text-sm transition-colors',
                pathname.startsWith(link.to) && link.to !== '/admin'
                  || pathname === link.to
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-8 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
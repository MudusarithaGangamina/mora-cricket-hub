import { Link, useLocation } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'
import { clsx } from 'clsx'

const publicLinks = [
  { to: '/',            label: 'Home'       },
  { to: '/matches',     label: 'Matches'    },
  { to: '/players',     label: 'Players'    },
  { to: '/analytics',   label: 'Analytics'  },
  { to: '/records',     label: 'Records'    },
  { to: '/captaincy',   label: 'Captaincy'  },
]

export function Navbar() {
  const { pathname } = useLocation()
  const { isAuthenticated, user, clearAuth } = useAuthStore()

  return (
    <nav className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 flex items-center justify-between h-14">

        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          <span className="text-2xl">🏏</span>
          <span className="text-white">Mora</span>
          <span className="text-mora-gold">Cricket</span>
        </Link>

        {/* Nav links */}
        <div className="hidden md:flex items-center gap-1">
          {publicLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={clsx(
                'px-3 py-1.5 rounded-md text-sm transition-colors',
                pathname === link.to
                  ? 'bg-slate-700 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Auth */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              {user?.role === 'Admin' && (
                <Link
                  to="/admin"
                  className="text-sm px-3 py-1.5 rounded-md bg-mora-blue
                             text-white hover:bg-blue-800 transition-colors"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={clearAuth}
                className="text-sm text-slate-400 hover:text-white transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <Link
              to="/login"
              className="text-sm px-3 py-1.5 rounded-md bg-mora-gold
                         text-slate-900 font-semibold hover:bg-yellow-400 transition-colors"
            >
              Sign in
            </Link>
          )}
        </div>

      </div>
    </nav>
  )
}
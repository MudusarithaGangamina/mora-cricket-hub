import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '@/api/dashboard'
import { StatCard } from '@/components/shared/StatCard'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'

const quickLinks = [
  { to: '/admin/seasons',     icon: '📅', label: 'Seasons',     desc: 'Manage seasons'       },
  { to: '/admin/tournaments', icon: '🏆', label: 'Tournaments', desc: 'Add tournaments'      },
  { to: '/admin/venues',      icon: '📍', label: 'Venues',      desc: 'Manage grounds'       },
  { to: '/admin/opponents',   icon: '⚔️', label: 'Opponents',   desc: 'Teams & their players'},
  { to: '/admin/players',     icon: '👤', label: 'Players',     desc: 'Squad management'     },
  { to: '/admin/matches',     icon: '🏏', label: 'Matches',     desc: 'Enter match data'     },
]

export default function AdminDashboardPage() {
  const { data: summary, isLoading } = useQuery({
    queryKey: ['dashboard'],
    queryFn: dashboardApi.getSummary,
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm mt-1">
          Manage all cricket data from here. Follow the order below when setting
          up for the first time.
        </p>
      </div>

      {/* Setup order reminder */}
      <div className="bg-blue-950/40 border border-blue-800/40 rounded-xl p-4 mb-8">
        <p className="text-blue-300 text-sm font-medium mb-1">
          📋 First time setup order
        </p>
        <p className="text-blue-400/80 text-xs">
          Seasons → Tournaments → Venues → Opponents → Players → Matches
        </p>
      </div>

      {/* Stats */}
      {isLoading ? (
        <LoadingSpinner />
      ) : summary ? (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Matches"
            value={summary.totalMatches}
            sub={`${summary.wins}W ${summary.losses}L`}
            color="#4fc3f7"
          />
          <StatCard
            label="Win Rate"
            value={`${summary.winPercentage}%`}
            color="#66bb6a"
          />
          <StatCard
            label="Top Scorer"
            value={summary.topScorerName}
            sub={`${summary.topScorerRuns} runs`}
            color="#ffd54f"
          />
          <StatCard
            label="Top Wickets"
            value={summary.topWicketTakerName}
            sub={`${summary.topWicketTakerWickets} wickets`}
            color="#ab47bc"
          />
        </div>
      ) : null}

      {/* Quick links */}
      <h2 className="text-lg font-semibold text-white mb-4">Quick Access</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {quickLinks.map((link, i) => (
          <Link
            key={link.to}
            to={link.to}
            className="group bg-slate-800/60 border border-slate-700/50 rounded-xl
                       p-5 hover:border-slate-500 transition-colors"
          >
            <div className="flex items-center gap-3">
              <span className="text-2xl">{link.icon}</span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-white group-hover:text-blue-300
                                   transition-colors">
                    {link.label}
                  </span>
                  {i === 0 && (
                    <span className="text-xs px-1.5 py-0.5 bg-blue-900/50
                                     text-blue-300 rounded">
                      Start here
                    </span>
                  )}
                </div>
                <p className="text-slate-500 text-xs mt-0.5">{link.desc}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}


import { Link } from 'react-router-dom'
import { useMatches } from '@/hooks/useMatches'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { formatMatchDate, formatResult } from '@/utils/formatters'
import { clsx } from 'clsx'

const resultColor = (r: string | null) => {
  if (r === 'WIN')  return 'text-green-400'
  if (r === 'LOSS') return 'text-red-400'
  return 'text-slate-400'
}

export default function MatchListPage() {
  const { data, isLoading } = useMatches()
  const matches = data?.items ?? []

  if (isLoading) return <LoadingSpinner size="lg" />

  return (
    <div>
      <PageHeader
        title="Matches"
        subtitle={`${data?.totalCount ?? 0} matches recorded`}
        action={
          <Link
            to="/admin/matches/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white
                       text-sm font-medium rounded-lg transition-colors"
          >
            + New Match
          </Link>
        }
      />

      {!matches.length ? (
        <EmptyState
          icon="🏏"
          title="No matches yet"
          description="Create your first match to start entering data."
          action={
            <Link
              to="/admin/matches/new"
              className="px-4 py-2 bg-blue-600 text-white text-sm
                         rounded-lg hover:bg-blue-500 transition-colors"
            >
              Create First Match
            </Link>
          }
        />
      ) : (
        <div className="space-y-2">
          {matches.map(m => (
            <div
              key={m.id}
              className="flex items-center gap-4 bg-slate-800/60
                         border border-slate-700/50 rounded-lg px-4 py-3
                         hover:border-slate-500 transition-colors"
            >
              {/* Date */}
              <div className="w-24 shrink-0 text-xs text-slate-400">
                {formatMatchDate(m.matchDate)}
              </div>

              {/* Tournament + round */}
              <div className="w-32 shrink-0 text-xs text-slate-500 truncate">
                {m.tournamentName.includes('CDCA') ? 'CDCA Div 3' : 'IUCC'}
                {' · '}{m.roundType.replace(/_/g, ' ')}
              </div>

              {/* Opponent */}
              <div className="flex-1 font-medium text-white truncate">
                vs {m.opponentName}
              </div>

              {/* Venue + surface */}
              <div className="hidden md:block text-xs text-slate-500 w-28 truncate">
                {m.venueType} · {m.surfaceType}
              </div>

              {/* Result */}
              <div className={clsx('text-sm font-semibold w-32 text-right shrink-0',
                resultColor(m.resultType))}>
                {m.status === 'PRE_TOSS_ABANDONED'
                  ? 'Abandoned (pre-toss)'
                  : formatResult(m.resultType, m.resultMargin, m.resultMarginType)}
              </div>

              {/* Action */}
              <Link
                to={`/admin/matches/${m.id}/entry`}
                className="shrink-0 text-sm px-3 py-1.5 bg-slate-700
                           hover:bg-slate-600 text-slate-300 rounded-lg
                           transition-colors"
              >
                Enter Data
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


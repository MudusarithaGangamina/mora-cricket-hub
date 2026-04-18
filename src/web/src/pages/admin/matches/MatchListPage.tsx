import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMatches } from '@/hooks/useMatches'
import { useTournaments } from '@/hooks/useTournaments'
import { useOpponents } from '@/hooks/useOpponents'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { clsx } from 'clsx'

const resultColor = (r: string | null) => {
  if (r === 'WIN')  return 'text-green-400'
  if (r === 'LOSS') return 'text-red-400'
  return 'text-slate-400'
}

const resultLabel = (
  status: string,
  resultType: string | null,
  margin: number | null,
  marginType: string | null
) => {
  if (status === 'PRE_TOSS_ABANDONED') return 'Abandoned (pre-toss)'
  if (status === 'ABANDONED')          return 'Abandoned'
  if (status === 'ABANDONED_MID')      return 'Abandoned (mid-match)'
  if (status === 'NO_RESULT')          return 'No Result'
  if (!resultType) return '—'
  if (resultType === 'WIN' && margin && marginType)
    return `Won by ${margin} ${marginType === 'RUNS' ? 'runs' : 'wkts'}`
  if (resultType === 'LOSS' && margin && marginType)
    return `Lost by ${margin} ${marginType === 'RUNS' ? 'runs' : 'wkts'}`
  if (resultType === 'TIE_TOSS')     return 'Tie (toss)'
  if (resultType === 'TIE_BOWL_OUT') return 'Tie (bowl-out)'
  return resultType
}

export default function MatchListPage() {
  const { data: tournaments } = useTournaments()
  const { data: opponents }   = useOpponents()

  // Filter state
  const [tournamentId, setTournamentId] = useState('')
  const [opponentId,   setOpponentId]   = useState('')
  const [resultFilter, setResultFilter] = useState('')
  const [venueFilter,  setVenueFilter]  = useState('')
  const [page,         setPage]         = useState(1)

  const { data, isLoading } = useMatches({
    tournamentId: tournamentId || undefined,
    opponentId:   opponentId   || undefined,
    resultType:   resultFilter || undefined,
    page,
    pageSize: 20,
  })

  const matches = data?.items ?? []
  const total   = data?.totalCount ?? 0

  // Client-side venue filter (not supported in backend yet)
  const filtered = venueFilter
    ? matches.filter(m => m.venueType === venueFilter)
    : matches

  if (isLoading) return <LoadingSpinner size="lg" />

  return (
    <div>
      <PageHeader
        title="Matches"
        subtitle={`${total} matches recorded`}
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

      {/* ── Filters ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <select
          value={tournamentId}
          onChange={e => { setTournamentId(e.target.value); setPage(1) }}
          className="input-base"
        >
          <option value="">All Tournaments</option>
          {tournaments?.map(t => (
            <option key={t.id} value={t.id}>{t.name}</option>
          ))}
        </select>

        <select
          value={opponentId}
          onChange={e => { setOpponentId(e.target.value); setPage(1) }}
          className="input-base"
        >
          <option value="">All Opponents</option>
          {opponents?.map(o => (
            <option key={o.id} value={o.id}>{o.name}</option>
          ))}
        </select>

        <select
          value={resultFilter}
          onChange={e => { setResultFilter(e.target.value); setPage(1) }}
          className="input-base"
        >
          <option value="">All Results</option>
          <option value="WIN">Wins</option>
          <option value="LOSS">Losses</option>
          <option value="TIE_TOSS">Ties</option>
          <option value="NR">No Result</option>
        </select>

        <select
          value={venueFilter}
          onChange={e => setVenueFilter(e.target.value)}
          className="input-base"
        >
          <option value="">Home / Away / Neutral</option>
          <option value="HOME">Home</option>
          <option value="AWAY">Away</option>
          <option value="NEUTRAL">Neutral</option>
        </select>
      </div>

      {/* ── Clear filters ── */}
      {(tournamentId || opponentId || resultFilter || venueFilter) && (
        <button
          onClick={() => {
            setTournamentId('')
            setOpponentId('')
            setResultFilter('')
            setVenueFilter('')
            setPage(1)
          }}
          className="text-xs text-slate-400 hover:text-white mb-4
                     transition-colors underline"
        >
          Clear all filters
        </button>
      )}

      {!filtered.length ? (
        <EmptyState
          icon="🏏"
          title="No matches found"
          description="Try adjusting your filters or create a new match."
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
          {filtered.map(m => (
            <div
              key={m.id}
              className={clsx(
                'bg-slate-800/60 border rounded-xl px-4 py-3',
                'hover:border-slate-500 transition-colors',
                m.isConfirmed
                  ? 'border-slate-700/30'
                  : 'border-slate-700/50'
              )}
            >
              <div className="flex items-center gap-3 flex-wrap">

                {/* Date */}
                <span className="text-xs text-slate-500 w-24 shrink-0">
                  {m.matchDate}
                </span>

                {/* Tournament + round */}
                <span className="text-xs text-slate-500 w-28
                                 truncate shrink-0 hidden md:block">
                  {m.tournamentName
                    .replace('Inter University Cricket', 'IUCC')
                    .replace('CDCA', 'CDCA')
                    .slice(0, 20)}
                  {' · '}{m.roundType.replace(/_/g, ' ')}
                </span>

                {/* Opponent */}
                <span className="font-semibold text-white flex-1 min-w-0
                                 truncate">
                  vs {m.opponentName}
                </span>

                {/* Venue badge */}
                <span className={clsx(
                  'text-xs px-2 py-0.5 rounded-full border shrink-0',
                  m.venueType === 'HOME'
                    ? 'bg-green-900/30 text-green-400 border-green-700/40'
                    : m.venueType === 'AWAY'
                      ? 'bg-red-900/30 text-red-400 border-red-700/40'
                      : 'bg-slate-700/40 text-slate-400 border-slate-600/40'
                )}>
                  {m.venueType}
                </span>

                {/* Surface */}
                <span className="text-xs text-slate-500 shrink-0 hidden lg:block">
                  {m.surfaceType}
                </span>

                {/* Result */}
                <span className={clsx(
                  'text-sm font-semibold w-36 text-right shrink-0',
                  resultColor(m.resultType)
                )}>
                  {resultLabel(
                    m.status, m.resultType,
                    m.resultMargin, m.resultMarginType
                  )}
                </span>

                {/* Confirmed badge */}
                {m.isConfirmed && (
                  <span className="text-xs text-slate-500 shrink-0">
                    🔒
                  </span>
                )}

                {/* Action button */}
                <Link
                  to={`/admin/matches/${m.id}/entry`}
                  className={clsx(
                    'shrink-0 text-sm px-3 py-1.5 rounded-lg transition-colors',
                    m.isConfirmed
                      ? 'bg-slate-800 hover:bg-slate-700 text-slate-400'
                      : 'bg-blue-700 hover:bg-blue-600 text-white'
                  )}
                >
                  {m.isConfirmed ? 'View Match' : 'Enter Data'}
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Pagination ── */}
      {total > 20 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-slate-400">
            Showing {((page - 1) * 20) + 1}–
            {Math.min(page * 20, total)} of {total}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg
                         text-sm disabled:opacity-40 transition-colors
                         hover:bg-slate-700"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page * 20 >= total}
              className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg
                         text-sm disabled:opacity-40 transition-colors
                         hover:bg-slate-700"
            >
              Next →
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
import { useMatchSummaryData } from '@/hooks/useMatches'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { clsx } from 'clsx'

interface Props {
  matchId: string
  match:   any
}

export function SummaryTab({ matchId, match }: Props) {
  const { data: summary, isLoading } = useMatchSummaryData(matchId)

  if (isLoading) return <LoadingSpinner />

  if (!summary || summary.innings.length === 0) {
    return (
      <div className="text-slate-500 text-sm">
        No innings data yet. Create innings and enter data first.
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* ── Match header ── */}
      <div className="bg-gradient-to-r from-slate-800/80 to-slate-900/60
                      border border-slate-700/50 rounded-2xl p-6">
        <div className="text-center mb-4">
          <p className="text-slate-400 text-sm">
            {match.tournamentName} · {match.matchDate}
          </p>
          <h2 className="text-2xl font-bold text-white mt-1">
            Mora Cricket Club
          </h2>
          <p className="text-slate-400">vs</p>
          <h2 className="text-2xl font-bold text-white">
            {match.opponentName}
          </h2>
        </div>

        {/* Innings score blocks */}
        <div className="flex gap-4 justify-center flex-wrap">
          {summary.innings.map((inn: any, i: number) => (
            <div key={i}
              className="text-center px-6 py-3 bg-slate-900/60
                         rounded-xl border border-slate-700/40">
              <p className="text-xs text-slate-400 mb-1">
                {inn.battingTeam === 'MORA'
                  ? 'Mora Cricket Club'
                  : match.opponentShortName ?? match.opponentName}
              </p>
              <p className="text-4xl font-bold text-white tabular-nums">
                {inn.totalRuns}/{inn.totalWickets}
              </p>
              <p className="text-slate-400 text-sm mt-0.5">
                ({inn.totalOversFaced} ov)
              </p>
            </div>
          ))}
        </div>

        {/* Result banner */}
        {match.resultType && (
          <div className={clsx(
            'mt-4 text-center py-2 rounded-xl font-bold text-lg',
            match.resultType === 'WIN'
              ? 'text-green-400 bg-green-950/30'
              : match.resultType === 'LOSS'
                ? 'text-red-400 bg-red-950/30'
                : 'text-slate-300 bg-slate-800/40'
          )}>
            {match.resultType === 'WIN'
              ? `🏆 Mora won by ${match.resultMargin} ${
                  match.resultMarginType === 'RUNS' ? 'runs' : 'wickets'
                }`
              : match.resultType === 'LOSS'
                ? `Mora lost by ${match.resultMargin} ${
                    match.resultMarginType === 'RUNS' ? 'runs' : 'wickets'
                  }`
                : match.status.replace(/_/g, ' ')}
          </div>
        )}

        {/* POTM */}
        {match.playerOfMatchName && (
          <p className="text-center text-sm text-amber-400 mt-3">
            ⭐ Player of the Match: <strong>{match.playerOfMatchName}</strong>
            {match.playerOfMatchTeam === 'MORA' ? ' (Mora)' : ' (Opponent)'}
          </p>
        )}
      </div>

      {/* ── Per-innings batting + bowling panels ── */}
      {summary.innings.map((inn: any, i: number) => {
        const isMoraBatting = inn.battingTeam === 'MORA'
        const battingLabel  = isMoraBatting
          ? 'Mora Batting'
          : `${match.opponentShortName ?? match.opponentName} Batting`
        const bowlingLabel  = isMoraBatting
          ? `${match.opponentShortName ?? match.opponentName} Bowling`
          : 'Mora Bowling'

        return (
          <div key={i}
            className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
            <h3 className="font-bold text-white mb-4">
              {i + 1}{i === 0 ? 'st' : 'nd'} Innings —{' '}
              {isMoraBatting ? 'Mora' : match.opponentShortName}
              {' '}
              <span className="text-slate-400 font-normal text-sm">
                {inn.totalRuns}/{inn.totalWickets}
                {' '}({inn.totalOversFaced} ov)
              </span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Top batters */}
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase
                              tracking-wide mb-3">
                  {battingLabel}
                </p>
                {inn.topBatters.length === 0 ? (
                  <p className="text-slate-500 text-xs">No batting data</p>
                ) : (
                  <div className="space-y-2">
                    {inn.topBatters.map((b: any, bi: number) => (
                      <div key={bi}
                        className="flex items-center gap-3 text-sm">
                        <span className="flex-1 text-white font-medium
                                         truncate">
                          {b.name}
                          {b.isNotOut && (
                            <span className="text-slate-400 ml-1">*</span>
                          )}
                        </span>
                        <span className="font-bold text-white tabular-nums">
                          {b.runs}
                        </span>
                        <span className="text-slate-400 text-xs tabular-nums">
                          ({b.balls})
                        </span>
                        {b.fours > 0 && (
                          <span className="text-blue-400 text-xs">
                            {b.fours}×4
                          </span>
                        )}
                        {b.sixes > 0 && (
                          <span className="text-purple-400 text-xs">
                            {b.sixes}×6
                          </span>
                        )}
                        {/* SR bar */}
                        <div className="w-16 bg-slate-700 rounded-full h-1.5">
                          <div
                            className={clsx(
                              'h-1.5 rounded-full',
                              b.balls > 0 && (b.runs / b.balls) * 100 >= 100
                                ? 'bg-green-400'
                                : 'bg-blue-400'
                            )}
                            style={{
                              width: `${Math.min(
                                100,
                                b.balls > 0
                                  ? (b.runs / b.balls) * 100
                                  : 0
                              )}%`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Top bowlers */}
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase
                              tracking-wide mb-3">
                  {bowlingLabel}
                </p>
                {inn.topBowlers.length === 0 ? (
                  <p className="text-slate-500 text-xs">No bowling data</p>
                ) : (
                  <div className="space-y-2">
                    {inn.topBowlers.map((b: any, bi: number) => {
                      const eco = b.overs > 0
                        ? (b.runs / b.overs).toFixed(1)
                        : '—'
                      return (
                        <div key={bi}
                          className="flex items-center gap-3 text-sm">
                          <span className="flex-1 text-white font-medium
                                           truncate">
                            {b.name}
                          </span>
                          <span className="text-slate-400 tabular-nums
                                           text-xs w-8">
                            {b.overs}
                          </span>
                          <span className="text-slate-400 tabular-nums w-8">
                            {b.runs}r
                          </span>
                          <span className={clsx(
                            'font-bold tabular-nums w-6',
                            b.wickets >= 5 ? 'text-green-400'
                              : b.wickets >= 3 ? 'text-emerald-400'
                              : 'text-white'
                          )}>
                            {b.wickets}w
                          </span>
                          <span className="text-slate-500 text-xs w-10
                                           text-right hidden md:block">
                            {eco} eco
                          </span>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
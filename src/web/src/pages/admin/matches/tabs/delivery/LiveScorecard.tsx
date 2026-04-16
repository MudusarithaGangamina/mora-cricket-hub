import { useQuery, useQueryClient } from '@tanstack/react-query'
import { inningsApi } from '@/api/innings'
import type { SquadMember } from '@/api/matches'
import type { BatterScore, BowlerFigures } from './useDeliveryState'
import { clsx } from 'clsx'

interface Props {
  inningsId:      string
  batterScores:   BatterScore[]
  bowlerFigures:  BowlerFigures[]
  isMoraBatting:  boolean
  moraSquad:      SquadMember[]
  strikerId:      string
  nonStrikerId:   string
  oppStrikerName: string
  oppNonStriker:  string
  overSummaries:  any[]
}

export function LiveScorecard({
  inningsId,
  batterScores,
  bowlerFigures,
  isMoraBatting,
  strikerId,
  nonStrikerId,
  oppStrikerName,
  oppNonStriker,
  overSummaries,
}: Props) {
  const qc = useQueryClient()

  // Auto-generated FOW from backend
  const { data: scorecard } = useQuery({
    queryKey: ['scorecard', inningsId],
    queryFn:  () => inningsApi.getScorecard(inningsId),
    enabled:  !!inningsId,
  })

  const fowList = scorecard?.fallOfWickets ?? []

  // Separate active and dismissed batters
  const activeBatters    = batterScores.filter(b => !b.isDismissed)
  const dismissedBatters = batterScores.filter(b => b.isDismissed)

  return (
    <div className="space-y-3">

      {/* ── Active batters ──────────────────────────────────────────────── */}
      <div className="bg-slate-800/60 border border-slate-700/50
                      rounded-xl p-4">
        <p className="text-xs font-medium text-slate-400 uppercase
                      tracking-wide mb-3">
          Batters at the Crease
        </p>

        {activeBatters.length === 0 ? (
          <p className="text-slate-500 text-xs">No balls entered yet</p>
        ) : (
          <div className="space-y-1.5">
            {activeBatters.map(b => {
              const isStriker = isMoraBatting
                ? b.playerId === strikerId
                : b.playerName === oppStrikerName

              const isNonStriker = isMoraBatting
                ? b.playerId === nonStrikerId
                : b.playerName === oppNonStriker

              return (
                <div
                  key={b.playerId}
                  className={clsx(
                    'flex items-center gap-2 px-3 py-2 rounded-lg text-sm',
                    isStriker
                      ? 'bg-blue-900/30 border border-blue-700/40'
                      : 'bg-slate-900/40'
                  )}
                >
                  {/* Striker indicator */}
                  <span className={clsx(
                    'text-xs shrink-0 w-3 font-bold',
                    isStriker
                      ? 'text-blue-400'
                      : isNonStriker
                        ? 'text-slate-500'
                        : 'text-transparent'
                  )}>
                    {isStriker ? '*' : isNonStriker ? '†' : '·'}
                  </span>

                  {/* Name */}
                  <span className="flex-1 text-white font-medium truncate text-xs">
                    {b.playerName}
                  </span>

                  {/* Runs */}
                  <span className="text-white font-bold tabular-nums text-sm">
                    {b.runs}
                  </span>

                  {/* Balls */}
                  <span className="text-slate-400 text-xs tabular-nums">
                    ({b.balls})
                  </span>

                  {/* Boundaries */}
                  {b.fours > 0 && (
                    <span className="text-blue-400 text-xs tabular-nums">
                      {b.fours}×4
                    </span>
                  )}
                  {b.sixes > 0 && (
                    <span className="text-purple-400 text-xs tabular-nums">
                      {b.sixes}×6
                    </span>
                  )}

                  {/* Strike rate */}
                  <span className="text-slate-500 text-xs tabular-nums hidden md:block">
                    {b.balls > 0
                      ? `SR ${((b.runs / b.balls) * 100).toFixed(0)}`
                      : '—'}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Dismissed batters shown faded below */}
        {dismissedBatters.length > 0 && (
          <div className="mt-2 pt-2 border-t border-slate-700/40 space-y-0.5">
            {dismissedBatters.map(b => (
              <div
                key={b.playerId}
                className="flex items-center gap-2 px-3 py-1 text-xs"
              >
                <span className="text-red-500/70 shrink-0 w-3">✕</span>
                <span className="flex-1 text-slate-500 truncate">
                  {b.playerName}
                </span>
                <span className="text-slate-500 tabular-nums">
                  {b.runs}
                </span>
                <span className="text-slate-600 tabular-nums">
                  ({b.balls})
                </span>
                {b.wicketType && (
                  <span className="text-red-500/60 truncate max-w-[80px]">
                    {b.wicketType.replace(/_/g, ' ').toLowerCase()}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Bowler figures ───────────────────────────────────────────────── */}
      {bowlerFigures.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700/50
                        rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400 uppercase
                        tracking-wide mb-3">
            Bowling
          </p>
          <div className="space-y-1">
            {/* Header */}
            <div className="flex items-center gap-2 px-3
                            text-xs text-slate-600 mb-1">
              <span className="flex-1">Bowler</span>
              <span className="tabular-nums w-8 text-right">Ov</span>
              <span className="tabular-nums w-8 text-right">R</span>
              <span className="tabular-nums w-6 text-right">W</span>
              <span className="tabular-nums w-8 text-right hidden md:block">
                Eco
              </span>
            </div>

            {bowlerFigures
              .sort((a, b) => b.wickets - a.wickets || a.runs - b.runs)
              .map(b => {
                // Calculate economy
                const [ovFull, ovPart] = b.overs.split('.').map(Number)
                const totalBalls = (ovFull * 6) + (ovPart || 0)
                const overs      = totalBalls / 6
                const economy    = overs > 0
                  ? (b.runs / overs).toFixed(1)
                  : '—'

                return (
                  <div
                    key={b.playerId}
                    className="flex items-center gap-2 px-3 py-1.5
                               bg-slate-900/40 rounded text-xs"
                  >
                    <span className="flex-1 text-white truncate">
                      {b.playerName}
                    </span>
                    <span className="text-slate-400 tabular-nums w-8 text-right">
                      {b.overs}
                    </span>
                    <span className="text-slate-400 tabular-nums w-8 text-right">
                      {b.runs}
                    </span>
                    <span className={clsx(
                      'font-bold tabular-nums w-6 text-right',
                      b.wickets >= 5 ? 'text-green-400'
                        : b.wickets >= 3 ? 'text-emerald-400'
                        : 'text-white'
                    )}>
                      {b.wickets}
                    </span>
                    <span className="text-slate-500 tabular-nums w-8
                                     text-right hidden md:block">
                      {economy}
                    </span>
                    {(b.wides > 0 || b.noBalls > 0) && (
                      <span className="text-amber-500/70 text-xs shrink-0">
                        {b.wides > 0 ? `${b.wides}wd` : ''}
                        {b.noBalls > 0 ? ` ${b.noBalls}nb` : ''}
                      </span>
                    )}
                  </div>
                )
              })}
          </div>
        </div>
      )}

      {/* ── Fall of Wickets — auto-generated by backend ──────────────────── */}
      {fowList.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700/50
                        rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400 uppercase
                        tracking-wide mb-2">
            Fall of Wickets
          </p>
          <div className="flex flex-wrap gap-x-4 gap-y-1">
            {fowList
              .sort((a: any, b: any) => a.wicketNumber - b.wicketNumber)
              .map((f: any) => (
                <div key={f.id} className="text-xs">
                  <span className="text-slate-500">
                    {f.wicketNumber}-
                  </span>
                  <span className="text-white font-semibold tabular-nums">
                    {f.scoreAtFall}
                  </span>
                  <span className="text-slate-500 ml-1">
                    ({f.overAtFall})
                  </span>
                  <span className="text-slate-400 ml-1 hidden md:inline">
                    {f.dismissedPlayerName}
                  </span>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── Over-by-over summary ─────────────────────────────────────────── */}
      {overSummaries.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700/50
                        rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400 uppercase
                        tracking-wide mb-2">
            Overs
          </p>
          <div className="flex flex-wrap gap-1">
            {overSummaries.map((os: any) => (
              <div
                key={os.overNumber}
                className={clsx(
                  'text-xs px-2 py-1 rounded border tabular-nums',
                  os.wicketsInOver > 0
                    ? 'bg-red-900/30 border-red-700/40 text-red-300'
                    : os.runsInOver >= 15
                      ? 'bg-purple-900/30 border-purple-700/40 text-purple-300'
                      : os.runsInOver === 0
                        ? 'bg-green-900/30 border-green-700/40 text-green-400'
                        : 'bg-slate-900/40 border-slate-700/30 text-slate-300'
                )}
              >
                <span className="text-slate-500 mr-1">
                  {os.overNumber - 1}:
                </span>
                {os.runsInOver}
                {os.wicketsInOver > 0 && (
                  <span className="text-red-400 ml-0.5">
                    -{os.wicketsInOver}w
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
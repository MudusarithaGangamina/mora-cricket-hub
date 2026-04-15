import { clsx } from 'clsx'
import type { BatterScore, BowlerFigures } from './useDeliveryState'
import type { SquadMember } from '@/api/matches'

interface Props {
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
  batterScores,
  bowlerFigures,
  isMoraBatting,
  strikerId,
  nonStrikerId,
  oppStrikerName,
  oppNonStriker,
  overSummaries,
}: Props) {
  // Active batters on pitch
  const activeBatters = batterScores.filter(b => !b.isDismissed)
  const dismissedBatters = batterScores.filter(b => b.isDismissed)

  return (
    <div className="space-y-4">

      {/* ── Active batters ── */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
        <p className="text-xs font-medium text-slate-400 uppercase
                      tracking-wide mb-3">
          Batters at the Crease
        </p>

        {activeBatters.length === 0 ? (
          <p className="text-slate-500 text-xs">No balls entered yet</p>
        ) : (
          <div className="space-y-2">
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
                    'flex items-center gap-3 px-3 py-2 rounded-lg text-sm',
                    isStriker
                      ? 'bg-blue-900/30 border border-blue-700/40'
                      : 'bg-slate-900/40'
                  )}
                >
                  <span className={clsx(
                    'text-xs shrink-0 w-4',
                    isStriker ? 'text-blue-400 font-bold' : 'text-slate-600'
                  )}>
                    {isStriker ? '*' : isNonStriker ? '†' : ''}
                  </span>
                  <span className="flex-1 text-white font-medium truncate">
                    {b.playerName}
                  </span>
                  <span className="text-white font-bold tabular-nums">
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
                  <span className="text-slate-500 text-xs tabular-nums">
                    {b.balls > 0
                      ? `SR ${((b.runs / b.balls) * 100).toFixed(0)}`
                      : 'SR —'}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Dismissed batters */}
        {dismissedBatters.length > 0 && (
          <div className="mt-3 pt-3 border-t border-slate-700/50 space-y-1">
            {dismissedBatters.map(b => (
              <div
                key={b.playerId}
                className="flex items-center gap-3 px-3 py-1 text-xs"
              >
                <span className="text-red-500 shrink-0">✕</span>
                <span className="flex-1 text-slate-500 truncate">
                  {b.playerName}
                </span>
                <span className="text-slate-500 tabular-nums">{b.runs}</span>
                <span className="text-slate-600">({b.balls})</span>
                <span className="text-red-500/70">
                  {b.wicketType?.replace(/_/g, ' ').toLowerCase()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Bowler figures ── */}
      {bowlerFigures.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400 uppercase
                        tracking-wide mb-3">
            Bowling
          </p>
          <div className="space-y-1">
            {bowlerFigures
              .sort((a, b) => b.wickets - a.wickets || a.runs - b.runs)
              .map(b => (
                <div
                  key={b.playerId}
                  className="flex items-center gap-3 px-3 py-1.5
                             bg-slate-900/40 rounded text-xs"
                >
                  <span className="flex-1 text-white truncate">
                    {b.playerName}
                  </span>
                  <span className="text-slate-400 tabular-nums w-8">
                    {b.overs}
                  </span>
                  <span className="text-slate-500 tabular-nums w-8">
                    {b.runs}r
                  </span>
                  <span className={clsx(
                    'font-bold tabular-nums w-6',
                    b.wickets >= 3 ? 'text-green-400' : 'text-white'
                  )}>
                    {b.wickets}w
                  </span>
                  {b.wides > 0 && (
                    <span className="text-amber-500 tabular-nums">
                      {b.wides}wd
                    </span>
                  )}
                  {b.noBalls > 0 && (
                    <span className="text-red-500 tabular-nums">
                      {b.noBalls}nb
                    </span>
                  )}
                </div>
              ))}
          </div>
        </div>
      )}

      {/* ── Over-by-over summary ── */}
      {overSummaries.length > 0 && (
        <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <p className="text-xs font-medium text-slate-400 uppercase
                        tracking-wide mb-3">
            Over Summary
          </p>
          <div className="flex flex-wrap gap-1.5">
            {overSummaries.map((os: any) => (
              <div
                key={os.overNumber}
                className={clsx(
                  'text-xs px-2 py-1 rounded border tabular-nums',
                  os.wicketsInOver > 0
                    ? 'bg-red-900/30 border-red-700/40 text-red-300'
                    : os.runsInOver >= 12
                      ? 'bg-purple-900/30 border-purple-700/40 text-purple-300'
                      : os.runsInOver === 0
                        ? 'bg-green-900/30 border-green-700/40 text-green-400'
                        : 'bg-slate-900/40 border-slate-700/30 text-slate-300'
                )}
              >
                <span className="text-slate-500 mr-1">
                  Ov {os.overNumber - 1}
                </span>
                {os.runsInOver}
                {os.wicketsInOver > 0 && (
                  <span className="text-red-400 ml-1">
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
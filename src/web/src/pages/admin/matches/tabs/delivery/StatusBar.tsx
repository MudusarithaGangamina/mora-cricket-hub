import { formatBallDisplay } from '@/utils/cricketCalculations'

interface Props {
  overNumber: number
  ballNumber: number
  deliverySequence: number
  battingTeam: string
  overSummaries: any[]
}

export function StatusBar({
  overNumber, ballNumber, deliverySequence,
  battingTeam, overSummaries,
}: Props) {
  const currentOS = overSummaries.find(
    (os: any) => os.overNumber === overNumber
  )
  const lastOS = overSummaries.length > 0
    ? overSummaries[overSummaries.length - 1]
    : null

  return (
    <div className="flex flex-wrap items-center gap-4 bg-slate-800/60
                    border border-slate-700/50 rounded-xl px-5 py-3">
      {/* Ball position */}
      <div>
        <span className="text-3xl font-bold text-white font-mono">
          {formatBallDisplay(overNumber, ballNumber)}
        </span>
        <span className="text-slate-500 text-xs ml-2">
          seq #{deliverySequence}
        </span>
      </div>

      {/* Current over stats */}
      {currentOS && (
        <div className="flex gap-3 text-sm">
          <span className="text-slate-400">
            Over:{' '}
            <span className="text-white font-semibold">
              {currentOS.runsInOver}
            </span>
          </span>
          <span className="text-slate-500">{currentOS.wicketsInOver}w</span>
          <span className="text-slate-500">{currentOS.dotsInOver} dots</span>
          <span className="text-slate-500">{currentOS.foursInOver}×4</span>
          <span className="text-slate-500">{currentOS.sixesInOver}×6</span>
        </div>
      )}

      {/* Running total */}
      {lastOS && (
        <div className="ml-auto text-right">
          <span className="text-xl font-bold text-white">
            {lastOS.cumulativeRuns}/{lastOS.cumulativeWickets}
          </span>
          <span className="text-slate-500 text-xs ml-1">
            ({battingTeam})
          </span>
        </div>
      )}
    </div>
  )
}
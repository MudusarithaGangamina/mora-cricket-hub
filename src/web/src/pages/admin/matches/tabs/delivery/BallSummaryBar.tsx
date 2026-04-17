import { formatBallDisplay } from '@/utils/cricketCalculations'
import type { BallState } from './types'

interface Props {
  ball: BallState
  overNumber: number
  ballNumber: number
}

export function BallSummaryBar({ ball, overNumber, ballNumber }: Props) {
  const total = ball.runsOffBat + ball.extrasRuns

  return (
    <div className="bg-slate-900/80 border border-slate-700/30
                    rounded-xl px-4 py-3">
      <p className="text-xs text-slate-500 mb-1">Ball summary</p>
      <div className="text-sm text-slate-300 flex flex-wrap gap-2">
        <span className="font-bold text-white">
          {formatBallDisplay(overNumber, ballNumber)}
        </span>
        {ball.runsOffBat > 0 && (
          <span>{ball.runsOffBat} off bat</span>
        )}
        {ball.extrasType && (
          <span className="text-amber-400">
            {ball.extrasType} ({ball.extrasRuns})
          </span>
        )}
        {ball.isWicket && (
          <span className="text-red-400 font-bold">
            🔴 {ball.wicketType || 'WICKET'}
          </span>
        )}
        {ball.shotType && (
          <span className="text-indigo-400">
            · {ball.shotType.replace(/_/g, ' ').toLowerCase()}
          </span>
        )}
        {ball.directionZone && (
          <span className="text-blue-400">
            → {ball.directionZone.replace(/_/g, ' ').toLowerCase()}
          </span>
        )}
        <span className="text-slate-500">= {total} total</span>
      </div>
    </div>
  )
}
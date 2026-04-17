import { formatBallDisplay } from '@/utils/cricketCalculations'

interface Props {
  deliveries: any[]
}

export function DeliveryLog({ deliveries }: Props) {
  if (deliveries.length === 0) return null

  return (
    <div>
      <p className="text-xs font-medium text-slate-400 uppercase
                    tracking-wide mb-2">
        {deliveries.length} balls entered
      </p>
      <div className="max-h-56 overflow-y-auto space-y-0.5">
        {[...deliveries].reverse().map((d: any) => (
          <div
            key={d.id}
            className="flex items-center gap-3 text-xs bg-slate-900/40
                       rounded px-3 py-1.5 font-mono"
          >
            <span className="text-slate-500 w-8 shrink-0">
              {formatBallDisplay(d.overNumber, d.ballNumber)}
            </span>
            <span className="text-slate-300 w-28 truncate shrink-0">
              {d.moraBatterName ?? d.oppBatterName ?? '—'}
            </span>
            <span className="text-slate-500 w-24 truncate shrink-0">
              {d.moraBowlerName ?? d.oppBowlerName ?? '—'}
              {d.oppBowlerStyle ? ` (${d.oppBowlerStyle})` : ''}
            </span>
            {d.isWicket && (
              <span className="text-red-400 font-bold shrink-0">W</span>
            )}
            {d.extrasType && (
              <span className="text-amber-400 shrink-0">
                {d.extrasType}
              </span>
            )}
            <span className="text-white font-bold w-4 shrink-0">
              {d.totalRuns}
            </span>
            {d.shotType && (
              <span className="text-indigo-400 truncate">
                {d.shotType.replace(/_/g, ' ')}
              </span>
            )}
            {d.directionZone && (
              <span className="text-blue-400 shrink-0">
                → {d.directionZone.replace(/_/g, ' ')}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
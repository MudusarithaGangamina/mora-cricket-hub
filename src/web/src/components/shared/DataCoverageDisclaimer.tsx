import { Info } from 'lucide-react'

interface Props {
  coverageInnings: number
  totalInnings: number
  coverageType: 'shot' | 'delivery'
}

export function DataCoverageDisclaimer({ coverageInnings, totalInnings, coverageType }: Props) {
  const label = coverageType === 'shot' ? 'shot/direction data' : 'ball-by-ball data'
  const pct = Math.round((coverageInnings / totalInnings) * 100)

  return (
    <div className="flex items-start gap-2 rounded-md bg-amber-950/30 border border-amber-800/40 px-3 py-2 text-xs text-amber-300">
      <Info className="mt-0.5 h-3 w-3 shrink-0" />
      <span>
        Based on <strong>{coverageInnings} of {totalInnings} innings</strong> ({pct}%) with {label}.
        Matches without this data are excluded from this chart.
      </span>
    </div>
  )
}
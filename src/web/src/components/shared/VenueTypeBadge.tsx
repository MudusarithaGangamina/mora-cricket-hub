import { VenueType } from '@/types/enums'

const styles: Record<VenueType, string> = {
  [VenueType.HOME]:    'bg-green-900/40 text-green-300 border-green-700/40',
  [VenueType.AWAY]:    'bg-red-900/40 text-red-300 border-red-700/40',
  [VenueType.NEUTRAL]: 'bg-slate-700/40 text-slate-300 border-slate-600/40',
}

const labels: Record<VenueType, string> = {
  [VenueType.HOME]:    'Home',
  [VenueType.AWAY]:    'Away',
  [VenueType.NEUTRAL]: 'Neutral',
}

export function VenueTypeBadge({ type }: { type: VenueType }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[type]}`}>
      {labels[type]}
    </span>
  )
}
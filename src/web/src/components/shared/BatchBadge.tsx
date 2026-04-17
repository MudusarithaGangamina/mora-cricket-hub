import { getBatchColor } from '@/utils/constants'

export function BatchBadge({ batch }: { batch: number }) {
  const color = getBatchColor(batch)
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-0.5
                 text-xs font-medium border"
      style={{ color, borderColor: color + '60', backgroundColor: color + '15' }}
    >
      Batch {batch}
    </span>
  )
}
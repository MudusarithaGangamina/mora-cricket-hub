import { SurfaceType } from '@/types/enums'

const styles: Record<SurfaceType, string> = {
  [SurfaceType.MATTING]: 'bg-amber-900/40 text-amber-300 border-amber-700/40',
  [SurfaceType.TURF]:    'bg-green-900/40 text-green-300 border-green-700/40',
}

export function SurfaceBadge({ type }: { type: SurfaceType }) {
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles[type]}`}>
      {type === SurfaceType.MATTING ? 'Matting' : 'Turf'}
    </span>
  )
}
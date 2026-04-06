import type { PhaseMode } from '@/utils/phaseUtils'

interface Props {
  mode: PhaseMode
  onToggle: () => void
}

export function PhaseToggle({ mode, onToggle }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-400">Phase view:</span>
      <button
        onClick={onToggle}
        className="flex rounded-md overflow-hidden border border-slate-600 text-xs"
      >
        <span className={`px-3 py-1.5 transition-colors ${
          mode === '3-phase' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
        }`}>
          3-Phase
        </span>
        <span className={`px-3 py-1.5 transition-colors ${
          mode === '4-phase' ? 'bg-blue-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
        }`}>
          4-Phase
        </span>
      </button>
    </div>
  )
}
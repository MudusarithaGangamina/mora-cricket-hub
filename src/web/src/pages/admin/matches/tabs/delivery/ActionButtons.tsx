interface Props {
  onConfirm: () => void
  onUndo: () => void
  onMarkComplete: () => void
  saving: boolean
  canUndo: boolean
}

export function ActionButtons({
  onConfirm, onUndo, onMarkComplete, saving, canUndo,
}: Props) {
  return (
    <div className="flex gap-3 flex-wrap items-center">
      <button
        type="button"
        onClick={onConfirm}
        disabled={saving}
        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white
                   font-bold rounded-xl transition-colors text-lg
                   disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {saving ? 'Saving...' : '✓ Confirm Ball'}
      </button>

      <button
        type="button"
        onClick={onUndo}
        disabled={!canUndo || saving}
        className="px-4 py-3 bg-slate-700 hover:bg-red-900/50 text-slate-300
                   hover:text-red-300 rounded-xl transition-colors text-sm
                   disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ↩ Undo Last Ball
      </button>

      <button
        type="button"
        onClick={onMarkComplete}
        disabled={saving}
        className="px-4 py-3 ml-auto bg-green-900/40 hover:bg-green-800/60
                   text-green-300 border border-green-800/40 rounded-xl
                   transition-colors text-sm"
      >
        ✓ Mark Innings Complete
      </button>
    </div>
  )
}
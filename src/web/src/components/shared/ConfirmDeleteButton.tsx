import { useState } from 'react'
import { clsx } from 'clsx'

interface Props {
  onConfirm: () => void
  label?: string
  itemName?: string
  size?: 'sm' | 'md'
  disabled?: boolean
}

export function ConfirmDeleteButton({
  onConfirm, label = 'Delete',
  itemName = 'this item',
  size = 'sm',
  disabled = false,
}: Props) {
  const [confirming, setConfirming] = useState(false)

  if (confirming) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">Delete {itemName}?</span>
        <button
          onClick={() => { onConfirm(); setConfirming(false) }}
          className="text-xs px-2 py-1 bg-red-700 hover:bg-red-600
                     text-white rounded transition-colors"
        >
          Yes, delete
        </button>
        <button
          onClick={() => setConfirming(false)}
          className="text-xs px-2 py-1 bg-slate-700 hover:bg-slate-600
                     text-slate-300 rounded transition-colors"
        >
          Cancel
        </button>
      </div>
    )
  }

  return (
    <button
      onClick={() => setConfirming(true)}
      disabled={disabled}
      className={clsx(
        'text-red-400 hover:text-red-300 transition-colors',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        size === 'sm' ? 'text-xs' : 'text-sm'
      )}
    >
      {label}
    </button>
  )
}
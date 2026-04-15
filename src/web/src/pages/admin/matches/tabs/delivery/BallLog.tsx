import { clsx } from 'clsx'

interface Props {
  log: string[]
}

export function BallLog({ log }: Props) {
  if (log.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5">
      {log.map((entry, i) => (
        <span
          key={i}
          className={clsx(
            'text-xs px-2 py-1 rounded font-mono',
            i === 0
              ? 'bg-blue-900/50 text-blue-300 border border-blue-700/50'
              : 'bg-slate-800 text-slate-500'
          )}
        >
          {entry}
        </span>
      ))}
    </div>
  )
}
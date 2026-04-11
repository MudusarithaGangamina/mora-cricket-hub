interface Props {
  label: string
  value: string | number
  sub?: string
  color?: string
}

export function StatCard({ label, value, sub, color = '#4fc3f7' }: Props) {
  return (
    <div
      className="bg-slate-800/60 rounded-xl p-5 border border-slate-700/50"
      style={{ borderTopColor: color, borderTopWidth: 3 }}
    >
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wide">
        {label}
      </p>
      <p className="text-white text-2xl font-bold mt-1">{value}</p>
      {sub && <p className="text-slate-500 text-xs mt-1">{sub}</p>}
    </div>
  )
}
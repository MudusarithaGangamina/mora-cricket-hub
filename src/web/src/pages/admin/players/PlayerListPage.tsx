import { Link } from 'react-router-dom'
import { usePlayers, useDeletePlayer } from '@/hooks/usePlayers'
import { PageHeader } from '@/components/shared/PageHeader'
import { EmptyState } from '@/components/shared/EmptyState'
import { BatchBadge } from '@/components/shared/BatchBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { BowlingStyleLabels } from '@/types/enums'
import { ConfirmDeleteButton } from '@/components/shared/ConfirmDeleteButton'

export default function PlayerListPage() {
  const { data: players, isLoading } = usePlayers()
  const deletePlayer = useDeletePlayer()

  if (isLoading) return <LoadingSpinner size="lg" />

  return (
    <div>
      <PageHeader
        title="Players"
        subtitle={`${players?.length ?? 0} players in the squad`}
        action={
          <Link
            to="/admin/players/new"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white
                       text-sm font-medium rounded-lg transition-colors"
          >
            + New Player
          </Link>
        }
      />

      {!players?.length ? (
        <EmptyState icon="👤" title="No players yet"
          description="Add your squad members to get started." />
      ) : (
        <div className="grid gap-2">
          {/* Sort by batch, then name */}
          {[...players]
            .sort((a, b) => a.batchYear - b.batchYear || a.fullName.localeCompare(b.fullName))
            .map(p => (
              <div key={p.id}
                className="flex items-center gap-4 bg-slate-800/60
                           border border-slate-700/50 rounded-lg px-4 py-3">
                {/* Avatar */}
                <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center
                                justify-center text-sm font-bold text-slate-300 shrink-0">
                  {p.shortName.slice(0, 2).toUpperCase()}
                </div>

                {/* Name + details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-white truncate">
                      {p.fullName}
                    </span>
                    {p.nickname && (
                      <span className="text-slate-500 text-sm">
                        "{p.nickname}"
                      </span>
                    )}
                    {!p.isActive && (
                      <span className="text-xs px-1.5 py-0.5 rounded bg-slate-700
                                       text-slate-400">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-0.5">
                    <BatchBadge batch={p.batchYear} />
                    <span className="text-xs text-slate-500">{p.battingStyle}</span>
                    {p.primaryBowlingStyle && (
                      <span className="text-xs text-slate-500">
                        {BowlingStyleLabels[p.primaryBowlingStyle as keyof typeof BowlingStyleLabels]
                          ?? p.primaryBowlingStyle}
                      </span>
                    )}
                    {p.faculty && (
                      <span className="text-xs text-slate-600 truncate hidden md:block">
                        {p.faculty}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Link
                  to={`/admin/players/${p.id}/edit`}
                  className="text-sm text-slate-400 hover:text-white transition-colors shrink-0"
                >
                  Edit
                </Link>
                <ConfirmDeleteButton
                  onConfirm={() => deletePlayer.mutate(p.id)}
                  itemName={p.fullName}
                />
              </div>
              </div>
            ))}
        </div>
      )}
    </div>
  )
}


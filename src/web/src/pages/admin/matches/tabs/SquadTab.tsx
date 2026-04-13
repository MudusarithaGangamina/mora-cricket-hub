import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { matchesApi, type SquadMember } from '@/api/matches'
import { usePlayersLookup } from '@/hooks/usePlayers'
import { useOpponent } from '@/hooks/useOpponents'
import { BatchBadge } from '@/components/shared/BatchBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { clsx } from 'clsx'

interface Props {
  matchId: string
  opponentId: string
}

export function SquadTab({ matchId, opponentId }: Props) {
  const qc = useQueryClient()

  const { data: currentSquad = [], isLoading: squadLoading } = useQuery({
    queryKey: ['squad', matchId],
    queryFn:  () => matchesApi.getSquad(matchId),
  })

  const { data: players }  = usePlayersLookup()
  const { data: opponent } = useOpponent(opponentId)

  // ── Mora XI ───────────────────────────────────────────────────────────────
  const [selectedMoraIds, setSelectedMoraIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (currentSquad.length > 0) {
      setSelectedMoraIds(
        new Set(currentSquad.map((s: SquadMember) => s.playerId))
      )
    }
  }, [currentSquad])

  // ── Opponent XI ───────────────────────────────────────────────────────────
  const [selectedOppIds, setSelectedOppIds] = useState<Set<string>>(new Set())
  const [oppFreeText, setOppFreeText] = useState<string[]>(Array(11).fill(''))

  const [moraSaving, setMoraSaving] = useState(false)
  const [moraError,  setMoraError]  = useState('')
  const [moraSaved,  setMoraSaved]  = useState(false)

  const toggleMora = (id: string) => {
    setSelectedMoraIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        if (next.size >= 11) return prev
        next.add(id)
      }
      return next
    })
    setMoraSaved(false)
  }

  const toggleOpp = (id: string) => {
    setSelectedOppIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const saveMoraSquad = async () => {
    setMoraSaving(true)
    setMoraError('')
    try {
      await matchesApi.setSquad(matchId, Array.from(selectedMoraIds))
      qc.invalidateQueries({ queryKey: ['squad', matchId] })
      setMoraSaved(true)
      setTimeout(() => setMoraSaved(false), 3000)
    } catch {
      setMoraError('Failed to save squad.')
    } finally {
      setMoraSaving(false)
    }
  }

  // Group Mora players by batch
  const byBatch: Record<number, NonNullable<typeof players>> = {}
  if (players) {
    for (const p of players) {
      if (!byBatch[p.batchYear]) byBatch[p.batchYear] = []
      byBatch[p.batchYear].push(p)
    }
  }

  if (squadLoading) return <LoadingSpinner />

  return (
    <div className="space-y-8">

      {/* ── Mora XI ─────────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white text-lg">
              Mora Playing XI
            </h3>
            <p className="text-slate-400 text-sm mt-0.5">
              Select exactly 11.{' '}
              <span className={clsx(
                'font-semibold',
                selectedMoraIds.size === 11 ? 'text-green-400' : 'text-amber-400'
              )}>
                {selectedMoraIds.size}/11
              </span>
            </p>
          </div>

          <button
            onClick={saveMoraSquad}
            disabled={moraSaving || selectedMoraIds.size === 0}
            className={clsx(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              moraSaved
                ? 'bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            )}
          >
            {moraSaving ? 'Saving...' : moraSaved ? '✓ Saved' : 'Save XI'}
          </button>
        </div>

        {moraError && (
          <p className="text-red-400 text-sm mb-3">{moraError}</p>
        )}

        {/* Player grid grouped by batch */}
        <div className="space-y-5">
          {Object.entries(byBatch)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([batch, batchPlayers]) => (
              <div key={batch}>
                <div className="mb-2">
                  <BatchBadge batch={Number(batch)} />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {batchPlayers
                    .sort((a, b) => a.fullName.localeCompare(b.fullName))
                    .map(p => {
                      const sel = selectedMoraIds.has(p.id)
                      const pos = sel
                        ? Array.from(selectedMoraIds).indexOf(p.id) + 1
                        : null

                      return (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => toggleMora(p.id)}
                          className={clsx(
                            'flex items-center gap-2 px-3 py-2 rounded-lg',
                            'border text-left text-sm transition-all',
                            sel
                              ? 'bg-blue-900/40 border-blue-500/60 text-white'
                              : 'bg-slate-800/60 border-slate-700/40 text-slate-300',
                            'hover:border-slate-500'
                          )}
                        >
                          <span className={clsx(
                            'w-6 h-6 rounded-full text-xs flex items-center',
                            'justify-center shrink-0 font-bold',
                            sel
                              ? 'bg-blue-600 text-white'
                              : 'bg-slate-700 text-slate-500'
                          )}>
                            {pos ?? ''}
                          </span>
                          <div className="min-w-0">
                            <div className="font-medium truncate">
                              {p.shortName}
                            </div>
                            <div className="text-xs text-slate-500 truncate">
                              {p.battingStyle}
                              {p.primaryBowlingStyle
                                ? ` · ${p.primaryBowlingStyle}` : ''}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                </div>
              </div>
            ))}
        </div>

        {/* Selected XI summary */}
        {selectedMoraIds.size > 0 && (
          <div className="mt-4 bg-slate-800/40 border border-slate-700/40
                          rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase font-medium
                          tracking-wide mb-3">
              Selected XI
            </p>
            <div className="grid grid-cols-2 gap-1">
              {Array.from(selectedMoraIds).map((id, i) => {
                const p = players?.find(x => x.id === id)
                return (
                  <div key={id} className="flex items-center gap-2 text-sm">
                    <span className="text-slate-500 w-5 shrink-0">
                      {i + 1}.
                    </span>
                    <span className="text-white">{p?.fullName ?? id}</span>
                    <span className="text-slate-500 text-xs">
                      {p?.battingStyle}
                      {p?.primaryBowlingStyle
                        ? ` ${p.primaryBowlingStyle}` : ''}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </section>

      {/* ── Opponent XI ──────────────────────────────────────────────────── */}
      <section>
        <h3 className="font-semibold text-white text-lg mb-1">
          {opponent?.name ?? 'Opponent'} Playing XI
        </h3>
        <p className="text-slate-400 text-sm mb-4">
          Select registered players who played, and add any unregistered ones
          by name. Bowling styles here enable analytics.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Registered opponent players */}
          {opponent && opponent.players.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 uppercase font-medium
                            tracking-wide mb-2">
                Registered Players
              </p>
              <div className="space-y-1.5">
                {opponent.players.map(p => {
                  const sel = selectedOppIds.has(p.id)
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => toggleOpp(p.id)}
                      className={clsx(
                        'w-full flex items-center gap-3 px-3 py-2 rounded-lg',
                        'border text-left text-sm transition-colors',
                        sel
                          ? 'bg-red-900/30 border-red-700/50 text-white'
                          : 'bg-slate-800/60 border-slate-700/40 text-slate-300',
                        'hover:border-slate-500'
                      )}
                    >
                      <span className={clsx(
                        'w-5 h-5 rounded-full flex items-center justify-center',
                        'text-xs shrink-0 font-bold',
                        sel
                          ? 'bg-red-700 text-white'
                          : 'bg-slate-700 text-slate-500'
                      )}>
                        {sel ? '✓' : ''}
                      </span>
                      <span className="flex-1 font-medium">
                        {p.fullName}
                      </span>
                      <div className="flex gap-2 text-xs">
                        {p.battingStyle && (
                          <span className="text-slate-400">
                            {p.battingStyle}
                          </span>
                        )}
                        {p.bowlingStyle && (
                          <span className="text-purple-400">
                            {p.bowlingStyle}
                          </span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Free-text unregistered players */}
          <div>
            <p className="text-xs text-slate-400 uppercase font-medium
                          tracking-wide mb-2">
              Unregistered Players
            </p>
            <p className="text-xs text-slate-500 mb-3">
              Type names for players not in the registry.
            </p>
            <div className="space-y-2">
              {oppFreeText.map((name, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-slate-500 text-xs w-5 shrink-0">
                    {i + 1}.
                  </span>
                  <input
                    value={name}
                    onChange={e => {
                      const next = [...oppFreeText]
                      next[i] = e.target.value
                      setOppFreeText(next)
                    }}
                    className="input-base w-full"
                    placeholder={`Player ${i + 1}`}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Opponent XI summary */}
        {(selectedOppIds.size > 0 || oppFreeText.some(n => n.trim())) && (
          <div className="mt-4 bg-slate-800/40 border border-slate-700/40
                          rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase font-medium
                          tracking-wide mb-3">
              Opponent XI Summary
            </p>
            <div className="grid grid-cols-2 gap-1 text-sm">
              {opponent?.players
                .filter(p => selectedOppIds.has(p.id))
                .map(p => (
                  <div key={p.id}
                    className="flex items-center gap-2">
                    <span className="text-white">{p.fullName}</span>
                    {p.bowlingStyle && (
                      <span className="text-xs text-purple-400">
                        {p.bowlingStyle}
                      </span>
                    )}
                  </div>
                ))}
              {oppFreeText
                .filter(n => n.trim())
                .map((name, i) => (
                  <span key={`ft-${i}`} className="text-slate-300">
                    {name}
                  </span>
                ))}
            </div>
            <p className="text-xs text-slate-500 mt-3">
              These are for reference during data entry. Opponent batter and
              bowler names are entered per ball in the delivery entry tab.
            </p>
          </div>
        )}
      </section>

    </div>
  )
}
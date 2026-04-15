import { useState, useEffect } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  matchesApi,
  type SquadMember,
  type OpponentSquadMember,
  type SetOpponentSquadEntry,
} from '@/api/matches'
import { usePlayersLookup } from '@/hooks/usePlayers'
import { useOpponent } from '@/hooks/useOpponents'
import { BatchBadge } from '@/components/shared/BatchBadge'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { BowlingStyleLabels } from '@/types/enums'
import { clsx } from 'clsx'

interface Props {
  matchId:    string
  opponentId: string
}

// Empty row for the free-text opponent XI form
const emptyRow = (): SetOpponentSquadEntry => ({
  opponentPlayerId: null,
  playerName:       '',
  battingStyle:     null,
  bowlingStyle:     null,
  battingOrder:     null,
})

export function SquadTab({ matchId, opponentId }: Props) {
  const qc = useQueryClient()

  // ── Load existing squads from server ──────────────────────────────────────
  const { data: currentMoraSquad = [], isLoading: moraLoading } =
    useQuery<SquadMember[]>({
      queryKey: ['squad', matchId],
      queryFn:  () => matchesApi.getSquad(matchId),
    })

  const { data: currentOppSquad = [], isLoading: oppSquadLoading } =
    useQuery<OpponentSquadMember[]>({
      queryKey: ['opp-squad', matchId],
      queryFn:  () => matchesApi.getOpponentSquad(matchId),
    })

  const { data: players }  = usePlayersLookup()
  const { data: opponent } = useOpponent(opponentId)

  // ── Mora XI state — pre-populated from server ─────────────────────────────
  const [selectedMoraIds, setSelectedMoraIds] = useState<Set<string>>(new Set())

  useEffect(() => {
    if (currentMoraSquad.length > 0) {
      setSelectedMoraIds(
        new Set(currentMoraSquad.map(s => s.playerId))
      )
    }
  }, [currentMoraSquad])

  // ── Opponent XI state — mix of registered + free-text ────────────────────
  // Registered players selected from opponent registry
  const [selectedOppIds, setSelectedOppIds] = useState<Set<string>>(new Set())

  // Free-text rows for unregistered players (11 rows)
  const [oppRows, setOppRows] = useState<SetOpponentSquadEntry[]>(
    Array.from({ length: 11 }, emptyRow)
  )

  // Pre-populate opponent squad from server on load
  useEffect(() => {
    if (currentOppSquad.length === 0) return

    const registered = new Set<string>()
    const freeRows: SetOpponentSquadEntry[] = Array.from(
      { length: 11 }, emptyRow
    )
    let freeIndex = 0

    for (const entry of currentOppSquad) {
      if (entry.opponentPlayerId) {
        registered.add(entry.opponentPlayerId)
      } else if (freeIndex < 11) {
        freeRows[freeIndex] = {
          opponentPlayerId: null,
          playerName:       entry.playerName,
          battingStyle:     entry.battingStyle,
          bowlingStyle:     entry.bowlingStyle,
          battingOrder:     entry.battingOrder,
        }
        freeIndex++
      }
    }

    setSelectedOppIds(registered)
    setOppRows(freeRows)
  }, [currentOppSquad])

  // ── Save states ───────────────────────────────────────────────────────────
  const [moraSaving, setMoraSaving] = useState(false)
  const [moraSaved,  setMoraSaved]  = useState(false)
  const [moraError,  setMoraError]  = useState('')

  const [oppSaving,  setOppSaving]  = useState(false)
  const [oppSaved,   setOppSaved]   = useState(false)
  const [oppError,   setOppError]   = useState('')

  // ── Toggle Mora player ────────────────────────────────────────────────────
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

  // ── Save Mora XI ──────────────────────────────────────────────────────────
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

  // ── Save Opponent XI ──────────────────────────────────────────────────────
  const saveOppSquad = async () => {
    setOppSaving(true)
    setOppError('')
    try {
      // Build entries from registered + free-text
      const entries: SetOpponentSquadEntry[] = []

      // Registered players
      if (opponent) {
        for (const p of opponent.players) {
          if (selectedOppIds.has(p.id)) {
            entries.push({
              opponentPlayerId: p.id,
              playerName:       p.fullName,
              battingStyle:     p.battingStyle ?? null,
              bowlingStyle:     p.bowlingStyle ?? null,
              battingOrder:     null,
            })
          }
        }
      }

      // Free-text rows (skip blank ones)
      for (let i = 0; i < oppRows.length; i++) {
        const row = oppRows[i]
        if (row.playerName.trim()) {
          entries.push({
            ...row,
            playerName:  row.playerName.trim(),
            battingOrder: i + 1 + entries.length,
          })
        }
      }

      await matchesApi.setOpponentSquad(matchId, entries)
      qc.invalidateQueries({ queryKey: ['opp-squad', matchId] })
      setOppSaved(true)
      setTimeout(() => setOppSaved(false), 3000)
    } catch {
      setOppError('Failed to save opponent squad.')
    } finally {
      setOppSaving(false)
    }
  }

  // ── Update a free-text row field ──────────────────────────────────────────
  const updateRow = (
    index: number,
    field: keyof SetOpponentSquadEntry,
    value: string | null
  ) => {
    setOppRows(prev => {
      const next = [...prev]
      next[index] = { ...next[index], [field]: value }
      return next
    })
    setOppSaved(false)
  }

  // Group Mora players by batch
  const byBatch: Record<number, NonNullable<typeof players>> = {}
  if (players) {
    for (const p of players) {
      if (!byBatch[p.batchYear]) byBatch[p.batchYear] = []
      byBatch[p.batchYear].push(p)
    }
  }

  if (moraLoading || oppSquadLoading) return <LoadingSpinner />

  return (
    <div className="space-y-10">

      {/* ═══════════════════════ MORA XI ═══════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white text-lg">Mora Playing XI</h3>
            <p className="text-slate-400 text-sm mt-0.5">
              Select exactly 11.{' '}
              <span className={clsx(
                'font-semibold',
                selectedMoraIds.size === 11 ? 'text-green-400' : 'text-amber-400'
              )}>
                {selectedMoraIds.size}/11 selected
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
            {moraSaving ? 'Saving...' : moraSaved ? '✓ Saved' : 'Save Mora XI'}
          </button>
        </div>

        {moraError && (
          <p className="text-red-400 text-sm mb-3">{moraError}</p>
        )}

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
                    <span className="text-slate-500 w-5 shrink-0">{i + 1}.</span>
                    <span className="text-white">{p?.fullName ?? id}</span>
                    <span className="text-slate-500 text-xs">
                      {p?.battingStyle}
                      {p?.primaryBowlingStyle ? ` ${p.primaryBowlingStyle}` : ''}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </section>

      {/* ══════════════════════ OPPONENT XI ════════════════════════════════ */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="font-semibold text-white text-lg">
              {opponent?.name ?? 'Opponent'} Playing XI
            </h3>
            <p className="text-slate-400 text-sm mt-0.5">
              Select registered players and add any unregistered ones by name.
              Bowling styles enable analytics.
            </p>
          </div>
          <button
            onClick={saveOppSquad}
            disabled={oppSaving}
            className={clsx(
              'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
              'disabled:opacity-50 disabled:cursor-not-allowed',
              oppSaved
                ? 'bg-green-700 text-white'
                : 'bg-red-700 hover:bg-red-600 text-white'
            )}
          >
            {oppSaving
              ? 'Saving...'
              : oppSaved
                ? '✓ Saved'
                : 'Save Opponent XI'}
          </button>
        </div>

        {oppError && (
          <p className="text-red-400 text-sm mb-3">{oppError}</p>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Registered players from the registry */}
          {opponent && opponent.players.length > 0 && (
            <div>
              <p className="text-xs text-slate-400 uppercase font-medium
                            tracking-wide mb-3">
                From Player Registry
              </p>
              <div className="space-y-1.5">
                {opponent.players.map(p => {
                  const sel = selectedOppIds.has(p.id)
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedOppIds(prev => {
                          const next = new Set(prev)
                          if (next.has(p.id)) next.delete(p.id)
                          else next.add(p.id)
                          return next
                        })
                        setOppSaved(false)
                      }}
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
                      <span className="flex-1 font-medium">{p.fullName}</span>
                      <div className="flex gap-2 text-xs shrink-0">
                        {p.battingStyle && (
                          <span className="text-slate-400">{p.battingStyle}</span>
                        )}
                        {p.bowlingStyle && (
                          <span className="text-purple-400">{p.bowlingStyle}</span>
                        )}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Free-text rows for unregistered players */}
          <div>
            <p className="text-xs text-slate-400 uppercase font-medium
                          tracking-wide mb-3">
              Unregistered / Additional Players
            </p>
            <div className="space-y-2">
              {oppRows.map((row, i) => (
                <div key={i}
                  className="grid grid-cols-12 gap-1.5 items-center">
                  <span className="col-span-1 text-slate-500 text-xs text-right">
                    {i + 1}.
                  </span>
                  {/* Name */}
                  <input
                    value={row.playerName}
                    onChange={e => updateRow(i, 'playerName', e.target.value)}
                    className="input-base col-span-4 text-xs py-1"
                    placeholder="Name"
                  />
                  {/* Batting style */}
                  <select
                    value={row.battingStyle ?? ''}
                    onChange={e =>
                      updateRow(i, 'battingStyle', e.target.value || null)}
                    className="input-base col-span-3 text-xs py-1"
                  >
                    <option value="">Bat?</option>
                    <option value="RHB">RHB</option>
                    <option value="LHB">LHB</option>
                  </select>
                  {/* Bowling style */}
                  <select
                    value={row.bowlingStyle ?? ''}
                    onChange={e =>
                      updateRow(i, 'bowlingStyle', e.target.value || null)}
                    className="input-base col-span-4 text-xs py-1"
                  >
                    <option value="">Bowl?</option>
                    {Object.entries(BowlingStyleLabels).map(([val, label]) => (
                      <option key={val} value={val}>{val} — {label}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Current saved opponent squad preview */}
        {currentOppSquad.length > 0 && (
          <div className="mt-4 bg-slate-800/40 border border-slate-700/40
                          rounded-xl p-4">
            <p className="text-xs text-slate-400 uppercase font-medium
                          tracking-wide mb-3">
              Saved Opponent XI — will appear as autocomplete in delivery entry
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-1.5">
              {currentOppSquad.map((p, i) => (
                <div key={i}
                  className="flex items-center gap-2 text-xs bg-slate-900/40
                             rounded px-2 py-1.5">
                  <span className="text-slate-500 shrink-0">{i + 1}.</span>
                  <span className="text-white truncate">{p.playerName}</span>
                  {p.battingStyle && (
                    <span className="text-slate-500 shrink-0">
                      {p.battingStyle}
                    </span>
                  )}
                  {p.bowlingStyle && (
                    <span className="text-purple-400 shrink-0">
                      {p.bowlingStyle}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
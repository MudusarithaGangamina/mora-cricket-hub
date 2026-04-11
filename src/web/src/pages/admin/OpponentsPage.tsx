import { useState } from 'react'
import { useOpponents, useCreateOpponent, useOpponent } from '@/hooks/useOpponents'
import { opponentsApi } from '@/api/opponents'
import { useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/shared/PageHeader'
import { FormField } from '@/components/shared/FormField'
import { EmptyState } from '@/components/shared/EmptyState'
import { BowlingStyleLabels } from '@/types/enums'

export default function OpponentsPage() {
  const { data: opponents }   = useOpponents()
  const createOpponent        = useCreateOpponent()
  const qc                    = useQueryClient()

  const [showForm, setShowForm]     = useState(false)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [form, setForm]             = useState({ name: '', shortName: '' })
  const [playerForm, setPlayerForm] = useState({
    fullName: '', battingStyle: '', bowlingStyle: '', notes: ''
  })
  const [showPlayerForm, setShowPlayerForm] = useState(false)
  const [error, setError] = useState('')

  const { data: selectedOpponent } = useOpponent(selectedId ?? '')

  const handleCreateOpponent = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await createOpponent.mutateAsync(form)
      setShowForm(false)
      setForm({ name: '', shortName: '' })
    } catch {
      setError('Failed to create opponent.')
    }
  }

  const handleAddPlayer = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedId) return
    setError('')
    try {
      await opponentsApi.addPlayer(selectedId, {
        fullName: playerForm.fullName,
        battingStyle: playerForm.battingStyle || undefined,
        bowlingStyle: playerForm.bowlingStyle || undefined,
        notes: playerForm.notes || undefined,
      })
      qc.invalidateQueries({ queryKey: ['opponent', selectedId] })
      setPlayerForm({ fullName: '', battingStyle: '', bowlingStyle: '', notes: '' })
      setShowPlayerForm(false)
    } catch {
      setError('Failed to add player.')
    }
  }

  return (
    <div>
      <PageHeader
        title="Opponents"
        subtitle="Teams we play against and their key players"
        action={
          <button onClick={() => setShowForm(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white
                       text-sm font-medium rounded-lg transition-colors">
            + New Opponent
          </button>
        }
      />

      {/* Create opponent form */}
      {showForm && (
        <div className="bg-slate-800/60 border border-slate-700 rounded-xl
                        p-6 mb-6 max-w-lg">
          <h3 className="font-semibold text-white mb-4">New Opponent</h3>
          <form onSubmit={handleCreateOpponent} className="space-y-4">
            <FormField label="Full Name" required>
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="input-base w-full"
                placeholder="Memon Sporting Club"
                required
              />
            </FormField>
            <FormField label="Short Name" required hint="Max 20 characters">
              <input
                value={form.shortName}
                onChange={e => setForm(f => ({ ...f, shortName: e.target.value }))}
                className="input-base w-full"
                placeholder="Memon SC"
                maxLength={20}
                required
              />
            </FormField>
            {error && <p className="text-red-400 text-sm">{error}</p>}
            <div className="flex gap-3">
              <button type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white
                           text-sm font-medium rounded-lg transition-colors">
                Create
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="px-4 py-2 bg-slate-700 text-slate-300 text-sm rounded-lg">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Two-column layout: list + detail */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Opponent list */}
        <div className="lg:col-span-1 space-y-2">
          {!opponents?.length ? (
            <EmptyState icon="⚔️" title="No opponents yet" />
          ) : (
            opponents.map(o => (
              <button
                key={o.id}
                onClick={() => setSelectedId(o.id)}
                className={`w-full text-left px-4 py-3 rounded-lg border
                            transition-colors ${
                  selectedId === o.id
                    ? 'bg-blue-900/30 border-blue-600/50 text-white'
                    : 'bg-slate-800/60 border-slate-700/50 text-slate-300 hover:border-slate-600'
                }`}
              >
                <div className="font-medium">{o.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">
                  {o.registeredPlayers} player{o.registeredPlayers !== 1 ? 's' : ''} registered
                </div>
              </button>
            ))
          )}
        </div>

        {/* Opponent detail */}
        <div className="lg:col-span-2">
          {!selectedOpponent ? (
            <div className="text-slate-500 text-sm pt-4">
              Select an opponent to see their players
            </div>
          ) : (
            <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-bold text-white text-lg">
                  {selectedOpponent.name}
                </h3>
                <button
                  onClick={() => setShowPlayerForm(p => !p)}
                  className="text-sm px-3 py-1.5 bg-blue-600 hover:bg-blue-500
                             text-white rounded-lg transition-colors"
                >
                  + Add Player
                </button>
              </div>

              {/* Add player form */}
              {showPlayerForm && (
                <form onSubmit={handleAddPlayer}
                  className="bg-slate-900/60 rounded-lg p-4 mb-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <FormField label="Full Name" required>
                      <input
                        value={playerForm.fullName}
                        onChange={e => setPlayerForm(f => ({
                          ...f, fullName: e.target.value
                        }))}
                        className="input-base w-full"
                        required
                      />
                    </FormField>
                    <FormField label="Notes" hint="e.g. Opening bowler">
                      <input
                        value={playerForm.notes}
                        onChange={e => setPlayerForm(f => ({
                          ...f, notes: e.target.value
                        }))}
                        className="input-base w-full"
                      />
                    </FormField>
                    <FormField label="Batting Style">
                      <select
                        value={playerForm.battingStyle}
                        onChange={e => setPlayerForm(f => ({
                          ...f, battingStyle: e.target.value
                        }))}
                        className="input-base w-full"
                      >
                        <option value="">Unknown</option>
                        <option value="RHB">Right-hand</option>
                        <option value="LHB">Left-hand</option>
                      </select>
                    </FormField>
                    <FormField label="Bowling Style"
                      hint="Critical for matchup analysis">
                      <select
                        value={playerForm.bowlingStyle}
                        onChange={e => setPlayerForm(f => ({
                          ...f, bowlingStyle: e.target.value
                        }))}
                        className="input-base w-full"
                      >
                        <option value="">Unknown</option>
                        {Object.entries(BowlingStyleLabels).map(([val, label]) => (
                          <option key={val} value={val}>{label}</option>
                        ))}
                      </select>
                    </FormField>
                  </div>
                  {error && <p className="text-red-400 text-sm">{error}</p>}
                  <div className="flex gap-2">
                    <button type="submit"
                      className="px-3 py-1.5 bg-blue-600 text-white text-sm
                                 rounded-lg hover:bg-blue-500 transition-colors">
                      Add
                    </button>
                    <button type="button"
                      onClick={() => setShowPlayerForm(false)}
                      className="px-3 py-1.5 bg-slate-700 text-slate-300
                                 text-sm rounded-lg transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Players list */}
              {selectedOpponent.players.length === 0 ? (
                <p className="text-slate-500 text-sm">
                  No players registered yet. Add players whose bowling style
                  you know — this enables batter vs bowling type analytics.
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedOpponent.players.map(p => (
                    <div key={p.id}
                      className="flex items-center gap-4 bg-slate-900/40
                                 rounded-lg px-3 py-2">
                      <span className="font-medium text-white text-sm flex-1">
                        {p.fullName}
                      </span>
                      {p.battingStyle && (
                        <span className="text-xs text-slate-400">
                          {p.battingStyle}
                        </span>
                      )}
                      {p.bowlingStyle && (
                        <span className="text-xs px-2 py-0.5 rounded-full
                                         bg-purple-900/40 text-purple-300
                                         border border-purple-700/40">
                          {BowlingStyleLabels[p.bowlingStyle as keyof typeof BowlingStyleLabels]
                            ?? p.bowlingStyle}
                        </span>
                      )}
                      {p.notes && (
                        <span className="text-xs text-slate-500">{p.notes}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
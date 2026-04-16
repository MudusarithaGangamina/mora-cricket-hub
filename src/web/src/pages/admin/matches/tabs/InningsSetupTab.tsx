import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { inningsApi } from '@/api/innings'
import { usePlayersLookup } from '@/hooks/usePlayers'
import { FormField } from '@/components/shared/FormField'

interface Props {
  matchId: string
  existingInnings: any[]
  matchScheduledOvers: number   // ← new prop
}

export function InningsSetupTab({
  matchId, existingInnings, matchScheduledOvers
}: Props) {
  const qc = useQueryClient()
  const { data: players } = usePlayersLookup()

  const [form, setForm] = useState({
    battingTeam:        'MORA',
    inningsType:        'NORMAL',
    moraWickeeperId:    '',
    commentaryCoverage: 'NONE',
    scheduledOvers:     matchScheduledOvers,
  })
  const [error,   setError]   = useState('')
  const [success, setSuccess] = useState('')

  // For completing an existing innings
  const [completingId, setCompletingId] = useState<string | null>(null)
  const [endReason,    setEndReason]    = useState('MANUAL')
  const [endedAtOver,  setEndedAtOver]  = useState('')

  const inningsNumber = existingInnings.length + 1

  // Prevent 2nd innings creation if 1st not completed
  const canCreate = inningsNumber === 1 ||
    (inningsNumber === 2 && existingInnings[0]?.isCompleted)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await inningsApi.create({
        matchId,
        inningsNumber,
        inningsType:        form.inningsType,
        battingTeam:        form.battingTeam,
        moraWickeeperId:    form.moraWickeeperId || undefined,
        commentaryCoverage: form.commentaryCoverage,
        scheduledOvers:     Number(form.scheduledOvers),
      })
      qc.invalidateQueries({ queryKey: ['scorecards', matchId] })
      setSuccess(`Innings ${inningsNumber} created successfully.`)
    } catch {
      setError('Failed to create innings.')
    }
  }

  const handleComplete = async (inningsId: string) => {
    if (!endedAtOver) {
      setError('Enter the over at which innings ended.')
      return
    }
    try {
      await inningsApi.complete(inningsId, {
        endedAtOver: Number(endedAtOver),
        reason:      endReason as 'WICKETS' | 'OVERS' | 'TARGET' | 'MANUAL',
      })
      qc.invalidateQueries({ queryKey: ['scorecards', matchId] })
      setCompletingId(null)
      setSuccess('Innings marked as completed.')
    } catch {
      setError('Failed to complete innings.')
    }
  }

  return (
    <div className="max-w-xl space-y-6">

      {/* ── Existing innings status ── */}
      {existingInnings.map((innings: any) => (
        <div key={innings.id}
          className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-white">
                Innings {innings.inningsNumber} —{' '}
                {innings.battingTeam}
              </h4>
              <p className="text-slate-400 text-sm">
                {innings.totalRuns}/{innings.totalWickets}
                {' '}({innings.totalOversFaced} ov)
                {' · '}{innings.commentaryCoverage} coverage
              </p>
            </div>
            <div className="flex items-center gap-3">
              {innings.isCompleted ? (
                <span className="text-xs px-2 py-1 rounded-full
                                  bg-green-900/40 text-green-300
                                  border border-green-700/40">
                  ✓ Completed
                </span>
              ) : (
                <button
                  onClick={() => setCompletingId(innings.id)}
                  className="text-xs px-3 py-1.5 bg-amber-700 hover:bg-amber-600
                             text-white rounded-lg transition-colors"
                >
                  End Innings
                </button>
              )}
              {innings.isConfirmed && (
                <span className="text-xs px-2 py-1 rounded-full
                                  bg-blue-900/40 text-blue-300
                                  border border-blue-700/40">
                  🔒 Confirmed
                </span>
              )}
            </div>
          </div>

          {/* Complete innings form */}
          {completingId === innings.id && (
            <div className="mt-4 pt-4 border-t border-slate-700/50 space-y-3">
              <p className="text-sm text-slate-300 font-medium">
                End Innings {innings.inningsNumber}
              </p>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Ended at Over (e.g. 48.3)">
                  <input
                    type="number" step="0.1" min="0"
                    value={endedAtOver}
                    onChange={e => setEndedAtOver(e.target.value)}
                    className="input-base w-full"
                    placeholder="48.3"
                  />
                </FormField>
                <FormField label="Reason">
                  <select
                    value={endReason}
                    onChange={e => setEndReason(e.target.value)}
                    className="input-base w-full"
                  >
                    <option value="WICKETS">All out (10 wickets)</option>
                    <option value="OVERS">Overs completed</option>
                    <option value="TARGET">Target achieved</option>
                    <option value="MANUAL">Manual / other</option>
                  </select>
                </FormField>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handleComplete(innings.id)}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-600
                             text-white text-sm rounded-lg transition-colors"
                >
                  Confirm End of Innings
                </button>
                <button
                  onClick={() => setCompletingId(null)}
                  className="px-4 py-2 bg-slate-700 text-slate-300
                             text-sm rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {/* ── Create new innings ── */}
      {existingInnings.length < 2 && (
        <>
          {!canCreate && (
            <div className="bg-amber-950/30 border border-amber-800/40
                            rounded-xl p-4 text-amber-300 text-sm">
              ⚠ Complete innings {inningsNumber - 1} before creating innings {inningsNumber}.
            </div>
          )}

          <div className="bg-slate-800/60 border border-slate-700 rounded-xl p-6">
            <h3 className="font-semibold text-white mb-4">
              Create Innings {inningsNumber}
            </h3>
            <form onSubmit={handleCreate} className="space-y-4">

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Batting Team" required>
                  <select
                    value={form.battingTeam}
                    onChange={e => setForm(f => ({
                      ...f, battingTeam: e.target.value
                    }))}
                    className="input-base w-full"
                  >
                    <option value="MORA">Mora (us)</option>
                    <option value="OPPONENT">Opponent</option>
                  </select>
                </FormField>

                <FormField
                  label="Scheduled Overs"
                  hint="Edit if reduced before start"
                >
                  <input
                    type="number" min="1" max="50"
                    value={form.scheduledOvers}
                    onChange={e => setForm(f => ({
                      ...f, scheduledOvers: Number(e.target.value)
                    }))}
                    className="input-base w-full"
                  />
                </FormField>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField label="Innings Type">
                  <select
                    value={form.inningsType}
                    onChange={e => setForm(f => ({
                      ...f, inningsType: e.target.value
                    }))}
                    className="input-base w-full"
                  >
                    <option value="NORMAL">Normal</option>
                    <option value="SUPER_OVER">Super Over</option>
                  </select>
                </FormField>

                <FormField
                  label="Ball-by-Ball Coverage"
                  hint="Determines which features are available"
                >
                  <select
                    value={form.commentaryCoverage}
                    onChange={e => setForm(f => ({
                      ...f, commentaryCoverage: e.target.value
                    }))}
                    className="input-base w-full"
                  >
                    <option value="NONE">None — scorecard only</option>
                    <option value="KEY">Key moments (4s, 6s, wickets)</option>
                    <option value="FULL">Full — every ball</option>
                  </select>
                </FormField>
              </div>

              {form.battingTeam === 'MORA' && (
                <FormField
                  label="Wicketkeeper for this innings"
                  hint="Overrides match-level keeper if different"
                >
                  <select
                    value={form.moraWickeeperId}
                    onChange={e => setForm(f => ({
                      ...f, moraWickeeperId: e.target.value
                    }))}
                    className="input-base w-full"
                  >
                    <option value="">Use match-level keeper</option>
                    {players?.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.fullName}
                      </option>
                    ))}
                  </select>
                </FormField>
              )}

              {error   && <p className="text-red-400 text-sm">{error}</p>}
              {success && <p className="text-green-400 text-sm">{success}</p>}

              <button
                type="submit"
                disabled={!canCreate}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white
                           text-sm font-medium rounded-lg transition-colors
                           disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Create Innings {inningsNumber}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  )
}
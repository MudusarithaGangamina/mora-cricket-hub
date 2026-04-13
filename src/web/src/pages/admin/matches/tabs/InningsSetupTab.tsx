import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { inningsApi } from '@/api/innings'
import { usePlayersLookup } from '@/hooks/usePlayers'
import { FormField } from '@/components/shared/FormField'

interface Props {
  matchId: string
  existingInnings: any[]
}

export function InningsSetupTab({ matchId, existingInnings }: Props) {
  const qc = useQueryClient()
  const { data: players } = usePlayersLookup()

  const [form, setForm] = useState({
    battingTeam:       'MORA',
    inningsType:       'NORMAL',
    moraWickeeperId:   '',
    commentaryCoverage:'NONE',
  })
  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')

  const inningsNumber = existingInnings.length + 1

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    try {
      await inningsApi.create({
        matchId,
        inningsNumber,
        inningsType:       form.inningsType,
        battingTeam:       form.battingTeam,
        moraWickeeperId:   form.moraWickeeperId || undefined,
        commentaryCoverage: form.commentaryCoverage,
      })
      qc.invalidateQueries({ queryKey: ['scorecards', matchId] })
      setSuccess(`Innings ${inningsNumber} created. Switch to the scorecard tab to enter data.`)
    } catch {
      setError('Failed to create innings.')
    }
  }

  if (existingInnings.length >= 2) {
    return (
      <div className="text-slate-400 text-sm">
        Both innings have been created. Use the scorecard and delivery tabs to enter data.
      </div>
    )
  }

  return (
    <div className="max-w-lg">
      <h3 className="font-semibold text-white mb-4">
        Create Innings {inningsNumber}
      </h3>

      <form onSubmit={handleCreate}
        className="bg-slate-800/60 border border-slate-700 rounded-xl p-6 space-y-4">

        <FormField label="Batting Team" required>
          <select
            value={form.battingTeam}
            onChange={e => setForm(f => ({ ...f, battingTeam: e.target.value }))}
            className="input-base w-full"
          >
            <option value="MORA">Mora (us)</option>
            <option value="OPPONENT">Opponent</option>
          </select>
        </FormField>

        <FormField label="Innings Type">
          <select
            value={form.inningsType}
            onChange={e => setForm(f => ({ ...f, inningsType: e.target.value }))}
            className="input-base w-full"
          >
            <option value="NORMAL">Normal</option>
            <option value="SUPER_OVER">Super Over</option>
          </select>
        </FormField>

        <FormField
          label="Commentary / Shot Data Coverage"
          hint="What level of ball-by-ball shot/direction data does the scorecard app have?"
        >
          <select
            value={form.commentaryCoverage}
            onChange={e => setForm(f => ({ ...f, commentaryCoverage: e.target.value }))}
            className="input-base w-full"
          >
            <option value="NONE">None — no shot/direction data</option>
            <option value="KEY">Key moments only (4s, 6s, wickets)</option>
            <option value="FULL">Full — every ball has shot/direction</option>
          </select>
        </FormField>

        {form.battingTeam === 'MORA' && (
          <FormField label="Wicketkeeper for this innings"
            hint="Set if keeper changed mid-innings from the match keeper">
            <select
              value={form.moraWickeeperId}
              onChange={e => setForm(f => ({ ...f, moraWickeeperId: e.target.value }))}
              className="input-base w-full"
            >
              <option value="">Use match-level keeper</option>
              {players?.map(p => (
                <option key={p.id} value={p.id}>{p.fullName}</option>
              ))}
            </select>
          </FormField>
        )}

        {error   && <p className="text-red-400 text-sm">{error}</p>}
        {success && <p className="text-green-400 text-sm">{success}</p>}

        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white
                     text-sm font-medium rounded-lg transition-colors"
        >
          Create Innings {inningsNumber}
        </button>
      </form>
    </div>
  )
}
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCreateMatch } from '@/hooks/useMatches'
import { useTournaments } from '@/hooks/useTournaments'
import { useVenues } from '@/hooks/useVenues'
import { useOpponents } from '@/hooks/useOpponents'
import { usePlayersLookup } from '@/hooks/usePlayers'
import { FormField } from '@/components/shared/FormField'
import { PageHeader } from '@/components/shared/PageHeader'
import { RoundType, RoundTypeLabels } from '@/types/enums'

const ROUND_TYPES = Object.values(RoundType)

export default function CreateMatchPage() {
  const navigate     = useNavigate()
  const createMatch  = useCreateMatch()

  const { data: tournaments } = useTournaments()
  const { data: venues }      = useVenues()
  const { data: opponents }   = useOpponents()
  const { data: players }     = usePlayersLookup()

  const [error, setError] = useState('')

  const [form, setForm] = useState({
    tournamentId:       '',
    opponentId:         '',
    venueId:            '',
    matchDate:          '',
    scheduledOvers:     50,
    venueType:          'HOME',
    surfaceType:        'MATTING',
    ballColour:         'RED',
    ballType:           'LEATHER',
    roundType:          'LEAGUE',
    roundLabel:         '',
    tossHeld:           true,
    tossWinner:         'MORA',
    tossDecision:       'BAT',
    moraBattingFirst:   true,
    status:             'COMPLETED',
    resultType:         'WIN',
    resultMargin:       '',
    resultMarginType:   'RUNS',
    dlsApplied:         false,
    dlsTarget:          '',
    revisedOvers:       '',
    moraCaptainId:      '',
    moraWickeeperId:    '',
    opponentCaptainName:'',
    playerOfMatchName:  '',
    playerOfMatchMoraId:'',
    playerOfMatchTeam:  'MORA',
    notes:              '',
  })

  const set = (k: string, v: string | number | boolean) =>
    setForm(f => ({ ...f, [k]: v }))

  // When toss decision changes, derive moraBattingFirst
  const handleTossDecision = (decision: string) => {
    const moraBats = form.tossWinner === 'MORA'
      ? decision === 'BAT'
      : decision === 'FIELD'
    set('tossDecision', decision)
    set('moraBattingFirst', moraBats)
  }

  const handleTossWinner = (winner: string) => {
    const moraBats = winner === 'MORA'
      ? form.tossDecision === 'BAT'
      : form.tossDecision === 'FIELD'
    set('tossWinner', winner)
    set('moraBattingFirst', moraBats)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      const payload = {
        tournamentId:        form.tournamentId,
        opponentId:          form.opponentId,
        venueId:             form.venueId || undefined,
        matchDate:           form.matchDate,
        scheduledOvers:      Number(form.scheduledOvers),
        venueType:           form.venueType,
        surfaceType:         form.surfaceType,
        ballColour:          form.ballColour,
        ballType:            form.ballType,
        roundType:           form.roundType,
        roundLabel:          form.roundLabel || undefined,
        tossHeld:            form.tossHeld,
        tossWinner:          form.tossHeld ? form.tossWinner : undefined,
        tossDecision:        form.tossHeld ? form.tossDecision : undefined,
        moraBattingFirst:    form.tossHeld ? form.moraBattingFirst : undefined,
        status:              form.status,
        resultType:          form.status === 'COMPLETED' ? form.resultType : undefined,
        resultMargin:        form.resultMargin ? Number(form.resultMargin) : undefined,
        resultMarginType:    form.resultMarginType || undefined,
        dlsApplied:          form.dlsApplied,
        dlsTarget:           form.dlsApplied && form.dlsTarget
                               ? Number(form.dlsTarget) : undefined,
        revisedOvers:        form.revisedOvers ? Number(form.revisedOvers) : undefined,
        moraCaptainId:       form.moraCaptainId || undefined,
        moraWickeeperId:     form.moraWickeeperId || undefined,
        opponentCaptainName: form.opponentCaptainName || undefined,
        playerOfMatchName:   form.playerOfMatchName || undefined,
        playerOfMatchMoraId: form.playerOfMatchMoraId || undefined,
        playerOfMatchTeam:   form.playerOfMatchName ? form.playerOfMatchTeam : undefined,
        notes:               form.notes || undefined,
      }
      const result = await createMatch.mutateAsync(payload)
      navigate(`/admin/matches/${result.id}/entry`)
    } catch {
      setError('Failed to create match. Check all required fields.')
    }
  }

  return (
    <div className="max-w-3xl">
      <PageHeader title="New Match" subtitle="Enter match details" />

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* ── Basic info ── */}
        <section className="bg-slate-800/60 border border-slate-700
                            rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-white">Match Details</h3>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Tournament" required>
              <select
                value={form.tournamentId}
                onChange={e => set('tournamentId', e.target.value)}
                className="input-base w-full" required
              >
                <option value="">Select tournament...</option>
                {tournaments?.map(t => (
                  <option key={t.id} value={t.id}>
                    {t.name} ({t.seasonName})
                  </option>
                ))}
              </select>
            </FormField>

            <FormField label="Opponent" required>
              <select
                value={form.opponentId}
                onChange={e => set('opponentId', e.target.value)}
                className="input-base w-full" required
              >
                <option value="">Select opponent...</option>
                {opponents?.map(o => (
                  <option key={o.id} value={o.id}>{o.name}</option>
                ))}
              </select>
            </FormField>

            <FormField label="Match Date" required>
              <input
                type="date"
                value={form.matchDate}
                onChange={e => set('matchDate', e.target.value)}
                className="input-base w-full" required
              />
            </FormField>

            <FormField label="Scheduled Overs" required>
              <select
                value={form.scheduledOvers}
                onChange={e => set('scheduledOvers', e.target.value)}
                className="input-base w-full"
              >
                <option value={50}>50 overs</option>
                <option value={40}>40 overs</option>
                <option value={20}>20 overs (T20)</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="Round">
              <select
                value={form.roundType}
                onChange={e => set('roundType', e.target.value)}
                className="input-base w-full"
              >
                {ROUND_TYPES.map(r => (
                  <option key={r} value={r}>{RoundTypeLabels[r]}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Round Label" hint='e.g. "Group B Match 3"'>
              <input
                value={form.roundLabel}
                onChange={e => set('roundLabel', e.target.value)}
                className="input-base w-full"
                placeholder="Optional"
              />
            </FormField>
            <FormField label="Venue">
              <select
                value={form.venueId}
                onChange={e => set('venueId', e.target.value)}
                className="input-base w-full"
              >
                <option value="">Unknown</option>
                {venues?.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <FormField label="Home/Away" required>
              <select
                value={form.venueType}
                onChange={e => set('venueType', e.target.value)}
                className="input-base w-full"
              >
                <option value="HOME">Home</option>
                <option value="AWAY">Away</option>
                <option value="NEUTRAL">Neutral</option>
              </select>
            </FormField>
            <FormField label="Surface" required>
              <select
                value={form.surfaceType}
                onChange={e => set('surfaceType', e.target.value)}
                className="input-base w-full"
              >
                <option value="MATTING">Matting</option>
                <option value="TURF">Turf</option>
              </select>
            </FormField>
            <FormField label="Ball Colour" required>
              <select
                value={form.ballColour}
                onChange={e => set('ballColour', e.target.value)}
                className="input-base w-full"
              >
                <option value="RED">Red</option>
                <option value="WHITE">White</option>
              </select>
            </FormField>
            <FormField label="Ball Type" required>
              <select
                value={form.ballType}
                onChange={e => set('ballType', e.target.value)}
                className="input-base w-full"
              >
                <option value="LEATHER">Leather</option>
                <option value="TAPE">Tape</option>
                <option value="TENNIS">Tennis</option>
              </select>
            </FormField>
          </div>
        </section>

        {/* ── Toss ── */}
        <section className="bg-slate-800/60 border border-slate-700
                            rounded-xl p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-white">Toss</h3>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={!form.tossHeld}
                onChange={e => set('tossHeld', !e.target.checked)}
                className="accent-blue-500"
              />
              <span className="text-sm text-slate-400">
                Washed out before toss
              </span>
            </label>
          </div>

          {form.tossHeld && (
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Toss Won By">
                <select
                  value={form.tossWinner}
                  onChange={e => handleTossWinner(e.target.value)}
                  className="input-base w-full"
                >
                  <option value="MORA">Mora</option>
                  <option value="OPPONENT">Opponent</option>
                </select>
              </FormField>
              <FormField label="Elected To">
                <select
                  value={form.tossDecision}
                  onChange={e => handleTossDecision(e.target.value)}
                  className="input-base w-full"
                >
                  <option value="BAT">Bat</option>
                  <option value="FIELD">Field</option>
                </select>
              </FormField>
              <FormField label="Mora Batted">
                <input
                  readOnly
                  value={form.moraBattingFirst ? 'First' : 'Second (chased)'}
                  className="input-base w-full bg-slate-900/50 cursor-default"
                />
              </FormField>
            </div>
          )}
        </section>

        {/* ── Result ── */}
        <section className="bg-slate-800/60 border border-slate-700
                            rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-white">Result</h3>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="Match Status" required>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value)}
                className="input-base w-full"
              >
                <option value="COMPLETED">Completed</option>
                <option value="ABANDONED">Abandoned (after toss)</option>
                <option value="ABANDONED_MID">Abandoned mid-match</option>
                <option value="NO_RESULT">No Result</option>
                <option value="PRE_TOSS_ABANDONED">Pre-toss Abandoned</option>
              </select>
            </FormField>

            {form.status === 'COMPLETED' && (
              <>
                <FormField label="Result">
                  <select
                    value={form.resultType}
                    onChange={e => set('resultType', e.target.value)}
                    className="input-base w-full"
                  >
                    <option value="WIN">Win</option>
                    <option value="LOSS">Loss</option>
                    <option value="TIE_TOSS">Tie (toss)</option>
                    <option value="TIE_BOWL_OUT">Tie (bowl-out)</option>
                  </select>
                </FormField>
                <FormField label="Margin">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min={1}
                      value={form.resultMargin}
                      onChange={e => set('resultMargin', e.target.value)}
                      className="input-base w-full"
                      placeholder="100"
                    />
                    <select
                      value={form.resultMarginType}
                      onChange={e => set('resultMarginType', e.target.value)}
                      className="input-base"
                    >
                      <option value="RUNS">runs</option>
                      <option value="WICKETS">wkts</option>
                    </select>
                  </div>
                </FormField>
              </>
            )}
          </div>

          {/* DLS */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.dlsApplied}
              onChange={e => set('dlsApplied', e.target.checked)}
              className="accent-blue-500"
            />
            <span className="text-sm text-slate-400">DLS / Parabola applied</span>
          </label>

          {form.dlsApplied && (
            <div className="grid grid-cols-2 gap-4">
              <FormField label="DLS/Parabola Target" required>
                <input
                  type="number"
                  value={form.dlsTarget}
                  onChange={e => set('dlsTarget', e.target.value)}
                  className="input-base w-full"
                  placeholder="178"
                />
              </FormField>
              <FormField label="Revised Overs">
                <input
                  type="number"
                  value={form.revisedOvers}
                  onChange={e => set('revisedOvers', e.target.value)}
                  className="input-base w-full"
                  placeholder="35"
                />
              </FormField>
            </div>
          )}
        </section>

        {/* ── Match officials ── */}
        <section className="bg-slate-800/60 border border-slate-700
                            rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-white">Match Officials & Awards</h3>

          <div className="grid grid-cols-2 gap-4">
            <FormField label="Mora Captain">
              <select
                value={form.moraCaptainId}
                onChange={e => set('moraCaptainId', e.target.value)}
                className="input-base w-full"
              >
                <option value="">Select captain...</option>
                {players?.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} (Batch {p.batchYear})
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Mora Wicketkeeper">
              <select
                value={form.moraWickeeperId}
                onChange={e => set('moraWickeeperId', e.target.value)}
                className="input-base w-full"
              >
                <option value="">Select keeper...</option>
                {players?.map(p => (
                  <option key={p.id} value={p.id}>{p.fullName}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Opponent Captain">
              <input
                value={form.opponentCaptainName}
                onChange={e => set('opponentCaptainName', e.target.value)}
                className="input-base w-full"
                placeholder="Name"
              />
            </FormField>
          </div>

          {form.status === 'COMPLETED' && (
            <div className="grid grid-cols-3 gap-4 pt-2 border-t border-slate-700">
              <FormField label="Player of the Match">
                <input
                  value={form.playerOfMatchName}
                  onChange={e => set('playerOfMatchName', e.target.value)}
                  className="input-base w-full"
                  placeholder="Name"
                />
              </FormField>
              <FormField label="POTM — Mora Player (optional)">
                <select
                  value={form.playerOfMatchMoraId}
                  onChange={e => set('playerOfMatchMoraId', e.target.value)}
                  className="input-base w-full"
                >
                  <option value="">None / Opponent</option>
                  {players?.map(p => (
                    <option key={p.id} value={p.id}>{p.fullName}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="POTM Team">
                <select
                  value={form.playerOfMatchTeam}
                  onChange={e => set('playerOfMatchTeam', e.target.value)}
                  className="input-base w-full"
                >
                  <option value="MORA">Mora</option>
                  <option value="OPPONENT">Opponent</option>
                </select>
              </FormField>
            </div>
          )}

          <FormField label="Notes">
            <textarea
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
              className="input-base w-full h-20 resize-none"
              placeholder="Anything unusual about this match..."
            />
          </FormField>
        </section>

        {error && (
          <p className="text-red-400 text-sm bg-red-950/40 border border-red-800/40
                         rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={createMatch.isPending}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white
                       font-semibold rounded-lg transition-colors
                       disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {createMatch.isPending ? 'Creating...' : 'Create Match & Enter Data →'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/matches')}
            className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-slate-300
                       rounded-lg transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

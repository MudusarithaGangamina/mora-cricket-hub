import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUpdateMatch, useConfirmMatch } from '@/hooks/useMatches'
import { useTournaments } from '@/hooks/useTournaments'
import { useVenues } from '@/hooks/useVenues'
import { useOpponents } from '@/hooks/useOpponents'
import { usePlayersLookup } from '@/hooks/usePlayers'
import { FormField } from '@/components/shared/FormField'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { RoundType, RoundTypeLabels } from '@/types/enums'
import { clsx } from 'clsx'

interface Props {
  match: any
  matchId: string
}

const ROUND_TYPES = Object.values(RoundType)

export function InfoTab({ match, matchId }: Props) {
  const navigate      = useNavigate()
  const updateMatch   = useUpdateMatch()
  const confirmMatch  = useConfirmMatch()

  const { data: tournaments } = useTournaments()
  const { data: venues }      = useVenues()
  const { data: opponents }   = useOpponents()
  const { data: players }     = usePlayersLookup()

  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [saved, setSaved]   = useState(false)
  const [error, setError]   = useState('')

  const [form, setForm] = useState({
    tournamentId:        match.tournamentId ?? '',
    opponentId:          match.opponentId   ?? '',
    venueId:             match.venueId      ?? '',
    matchDate:           match.matchDate    ?? '',
    scheduledOvers:      match.scheduledOvers ?? 50,
    venueType:           match.venueType    ?? 'HOME',
    surfaceType:         match.surfaceType  ?? 'MATTING',
    ballColour:          match.ballColour   ?? 'RED',
    ballType:            match.ballType     ?? 'LEATHER',
    roundType:           match.roundType    ?? 'LEAGUE',
    roundLabel:          match.roundLabel   ?? '',
    tossHeld:            match.tossHeld     ?? true,
    tossWinner:          match.tossWinner   ?? 'MORA',
    tossDecision:        match.tossDecision ?? 'BAT',
    moraBattingFirst:    match.moraBattingFirst ?? true,
    status:              match.status       ?? 'COMPLETED',
    resultType:          match.resultType   ?? '',
    resultMargin:        match.resultMargin ?? '',
    resultMarginType:    match.resultMarginType ?? 'RUNS',
    dlsApplied:          match.dlsApplied   ?? false,
    dlsTarget:           match.dlsTarget    ?? '',
    revisedOvers:        match.revisedOvers ?? '',
    moraCaptainId:       match.moraCaptainId ?? '',
    moraWickeeperId:     match.moraWickeeperId ?? '',
    opponentCaptainName: match.opponentCaptainName ?? '',
    playerOfMatchMoraId: match.playerOfMatchMoraId ?? '',
    playerOfMatchName:   match.playerOfMatchName   ?? '',
    playerOfMatchTeam:   match.playerOfMatchTeam   ?? 'MORA',
    notes:               match.notes ?? '',
  })

  const set = (k: string, v: string | number | boolean) =>
    setForm(f => ({ ...f, [k]: v }))

  const handleTossWinner = (winner: string) => {
    const moraBats = winner === 'MORA'
      ? form.tossDecision === 'BAT'
      : form.tossDecision === 'FIELD'
    set('tossWinner', winner)
    set('moraBattingFirst', moraBats)
  }

  const handleTossDecision = (decision: string) => {
    const moraBats = form.tossWinner === 'MORA'
      ? decision === 'BAT'
      : decision === 'FIELD'
    set('tossDecision', decision)
    set('moraBattingFirst', moraBats)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await updateMatch.mutateAsync({
        id: matchId,
        data: {
          tournamentId:        form.tournamentId,
          opponentId:          form.opponentId,
          venueId:             form.venueId     || undefined,
          matchDate:           form.matchDate,
          scheduledOvers:      Number(form.scheduledOvers),
          venueType:           form.venueType,
          surfaceType:         form.surfaceType,
          ballColour:          form.ballColour,
          ballType:            form.ballType,
          roundType:           form.roundType,
          roundLabel:          form.roundLabel  || undefined,
          tossHeld:            form.tossHeld,
          tossWinner:          form.tossHeld ? form.tossWinner  : undefined,
          tossDecision:        form.tossHeld ? form.tossDecision: undefined,
          moraBattingFirst:    form.tossHeld
                                 ? Boolean(form.moraBattingFirst)
                                 : undefined,
          status:              form.status,
          resultType:          form.resultType  || undefined,
          resultMargin:        form.resultMargin
                                 ? Number(form.resultMargin) : undefined,
          resultMarginType:    form.resultMarginType || undefined,
          dlsApplied:          form.dlsApplied,
          dlsTarget:           form.dlsApplied && form.dlsTarget
                                 ? Number(form.dlsTarget) : undefined,
          revisedOvers:        form.revisedOvers
                                 ? Number(form.revisedOvers) : undefined,
          moraCaptainId:       form.moraCaptainId  || undefined,
          moraWickeeperId:     form.moraWickeeperId|| undefined,
          opponentCaptainName: form.opponentCaptainName || undefined,
          playerOfMatchMoraId: form.playerOfMatchMoraId || undefined,
          playerOfMatchName:   form.playerOfMatchName   || undefined,
          playerOfMatchTeam:   form.playerOfMatchName
                                 ? form.playerOfMatchTeam : undefined,
          notes:               form.notes || undefined,
        },
      })
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch {
      setError('Failed to save. Check all fields.')
    }
  }

  const handleConfirm = async () => {
    try {
      await confirmMatch.mutateAsync(matchId)
      setShowConfirmDialog(false)
      navigate('/admin/matches')
    } catch {
      setError('Failed to confirm match.')
    }
  }

  if (match.isConfirmed) {
    return (
      <div className="space-y-6">
        <div className="bg-green-950/30 border border-green-800/40
                        rounded-xl p-4 flex items-center gap-3">
          <span className="text-2xl">🔒</span>
          <div>
            <p className="font-semibold text-green-300">Match Confirmed</p>
            <p className="text-green-400/70 text-sm">
              This match is locked. Contact admin to unlock if corrections needed.
            </p>
          </div>
        </div>

        {/* Read-only summary */}
        <MatchInfoReadOnly match={match} />
      </div>
    )
  }

  return (
    <div className="max-w-3xl">
      <form onSubmit={handleSave} className="space-y-6">

        {/* ── Basic info ── */}
        <section className="bg-slate-800/60 border border-slate-700
                            rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-white">Match Details</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Tournament" required>
              <select
                value={form.tournamentId}
                onChange={e => set('tournamentId', e.target.value)}
                className="input-base w-full" required>
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
                className="input-base w-full" required>
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
                className="input-base w-full" required />
            </FormField>

            <FormField label="Scheduled Overs" required>
              <input
                type="number" min={1} max={50}
                value={form.scheduledOvers}
                onChange={e => set('scheduledOvers', e.target.value)}
                className="input-base w-full" />
            </FormField>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <FormField label="Home/Away">
              <select
                value={form.venueType}
                onChange={e => set('venueType', e.target.value)}
                className="input-base w-full">
                <option value="HOME">Home</option>
                <option value="AWAY">Away</option>
                <option value="NEUTRAL">Neutral</option>
              </select>
            </FormField>
            <FormField label="Surface">
              <select
                value={form.surfaceType}
                onChange={e => set('surfaceType', e.target.value)}
                className="input-base w-full">
                <option value="MATTING">Matting</option>
                <option value="TURF">Turf</option>
              </select>
            </FormField>
            <FormField label="Ball Colour">
              <select
                value={form.ballColour}
                onChange={e => set('ballColour', e.target.value)}
                className="input-base w-full">
                <option value="RED">Red</option>
                <option value="WHITE">White</option>
              </select>
            </FormField>
            <FormField label="Ball Type">
              <select
                value={form.ballType}
                onChange={e => set('ballType', e.target.value)}
                className="input-base w-full">
                <option value="LEATHER">Leather</option>
                <option value="TAPE">Tape</option>
                <option value="TENNIS">Tennis</option>
              </select>
            </FormField>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField label="Round">
              <select
                value={form.roundType}
                onChange={e => set('roundType', e.target.value)}
                className="input-base w-full">
                {ROUND_TYPES.map(r => (
                  <option key={r} value={r}>{RoundTypeLabels[r]}</option>
                ))}
              </select>
            </FormField>
            <FormField label="Round Label">
              <input
                value={form.roundLabel}
                onChange={e => set('roundLabel', e.target.value)}
                className="input-base w-full"
                placeholder="e.g. Group B Match 3" />
            </FormField>
            <FormField label="Venue">
              <select
                value={form.venueId}
                onChange={e => set('venueId', e.target.value)}
                className="input-base w-full">
                <option value="">Unknown</option>
                {venues?.map(v => (
                  <option key={v.id} value={v.id}>{v.name}</option>
                ))}
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
                className="accent-blue-500" />
              <span className="text-sm text-slate-400">
                Abandoned before toss
              </span>
            </label>
          </div>
          {form.tossHeld && (
            <div className="grid grid-cols-3 gap-4">
              <FormField label="Toss Won By">
                <select
                  value={form.tossWinner}
                  onChange={e => handleTossWinner(e.target.value)}
                  className="input-base w-full">
                  <option value="MORA">Mora</option>
                  <option value="OPPONENT">Opponent</option>
                </select>
              </FormField>
              <FormField label="Elected To">
                <select
                  value={form.tossDecision}
                  onChange={e => handleTossDecision(e.target.value)}
                  className="input-base w-full">
                  <option value="BAT">Bat</option>
                  <option value="FIELD">Field</option>
                </select>
              </FormField>
              <FormField label="Mora Batted">
                <input
                  readOnly
                  value={form.moraBattingFirst ? 'First' : 'Second (chased)'}
                  className="input-base w-full bg-slate-900/50 cursor-default" />
              </FormField>
            </div>
          )}
        </section>

        {/* ── Result ── */}
        <section className="bg-slate-800/60 border border-slate-700
                            rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-white">Result</h3>
          <div className="grid grid-cols-3 gap-4">
            <FormField label="Status" required>
              <select
                value={form.status}
                onChange={e => set('status', e.target.value)}
                className="input-base w-full">
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
                    className="input-base w-full">
                    <option value="">—</option>
                    <option value="WIN">Win</option>
                    <option value="LOSS">Loss</option>
                    <option value="TIE_TOSS">Tie (toss)</option>
                    <option value="TIE_BOWL_OUT">Tie (bowl-out)</option>
                  </select>
                </FormField>
                <FormField label="Margin">
                  <div className="flex gap-2">
                    <input
                      type="number" min={1}
                      value={form.resultMargin}
                      onChange={e => set('resultMargin', e.target.value)}
                      className="input-base flex-1"
                      placeholder="e.g. 100" />
                    <select
                      value={form.resultMarginType}
                      onChange={e => set('resultMarginType', e.target.value)}
                      className="input-base">
                      <option value="RUNS">runs</option>
                      <option value="WICKETS">wkts</option>
                    </select>
                  </div>
                </FormField>
              </>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={form.dlsApplied}
              onChange={e => set('dlsApplied', e.target.checked)}
              className="accent-blue-500" />
            <span className="text-sm text-slate-400">DLS / Parabola applied</span>
          </label>

          {form.dlsApplied && (
            <div className="grid grid-cols-2 gap-4">
              <FormField label="DLS Target">
                <input
                  type="number"
                  value={form.dlsTarget}
                  onChange={e => set('dlsTarget', e.target.value)}
                  className="input-base w-full" />
              </FormField>
              <FormField label="Revised Overs">
                <input
                  type="number"
                  value={form.revisedOvers}
                  onChange={e => set('revisedOvers', e.target.value)}
                  className="input-base w-full" />
              </FormField>
            </div>
          )}
        </section>

        {/* ── Officials + Awards ── */}
        <section className="bg-slate-800/60 border border-slate-700
                            rounded-xl p-6 space-y-4">
          <h3 className="font-semibold text-white">Officials & Awards</h3>
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Mora Captain">
              <select
                value={form.moraCaptainId}
                onChange={e => set('moraCaptainId', e.target.value)}
                className="input-base w-full">
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
                className="input-base w-full">
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
                className="input-base w-full" />
            </FormField>
          </div>

          {form.status === 'COMPLETED' && (
            <div className="grid grid-cols-3 gap-4 pt-2
                            border-t border-slate-700">
              <FormField label="Player of the Match">
                <input
                  value={form.playerOfMatchName}
                  onChange={e => set('playerOfMatchName', e.target.value)}
                  className="input-base w-full"
                  placeholder="Name" />
              </FormField>
              <FormField label="POTM — Mora Player">
                <select
                  value={form.playerOfMatchMoraId}
                  onChange={e => set('playerOfMatchMoraId', e.target.value)}
                  className="input-base w-full">
                  <option value="">None / Opponent player</option>
                  {players?.map(p => (
                    <option key={p.id} value={p.id}>{p.fullName}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="POTM Team">
                <select
                  value={form.playerOfMatchTeam}
                  onChange={e => set('playerOfMatchTeam', e.target.value)}
                  className="input-base w-full">
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
              placeholder="Anything unusual about this match..." />
          </FormField>
        </section>

        {error && (
          <p className="text-red-400 text-sm bg-red-950/40 border
                         border-red-800/40 rounded-lg px-4 py-2">
            {error}
          </p>
        )}

        {/* ── Actions ── */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={updateMatch.isPending}
            className={clsx(
              'px-6 py-2.5 font-semibold rounded-lg transition-colors',
              saved
                ? 'bg-green-700 text-white'
                : 'bg-blue-600 hover:bg-blue-500 text-white',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {updateMatch.isPending
              ? 'Saving...'
              : saved
                ? '✓ Saved'
                : 'Save Changes'}
          </button>

          <div className="flex-1" />

          <button
            type="button"
            onClick={() => setShowConfirmDialog(true)}
            className="px-6 py-2.5 bg-green-800 hover:bg-green-700
                       text-white font-semibold rounded-lg transition-colors
                       border border-green-700"
          >
            🔒 Confirm & Lock Match
          </button>
        </div>

        <p className="text-xs text-slate-500">
          Confirming locks the match permanently. Use this once all data entry
          is complete and verified. The match will appear as "View Match" in
          the matches list.
        </p>
      </form>

      <ConfirmDialog
        open={showConfirmDialog}
        title="Confirm Match?"
        message="This will lock the match permanently. You will not be able
                 to edit match details or enter new delivery data after
                 confirming. Make sure all innings are complete and correct."
        confirmLabel="Yes, Confirm & Lock"
        onConfirm={handleConfirm}
        onCancel={() => setShowConfirmDialog(false)}
      />
    </div>
  )
}

function MatchInfoReadOnly({ match }: { match: any }) {
  return (
    <div className="grid grid-cols-2 gap-4 text-sm">
      {[
        ['Tournament',   match.tournamentName],
        ['Opponent',     match.opponentName],
        ['Date',         match.matchDate],
        ['Venue',        match.venueName ?? 'Unknown'],
        ['Surface',      match.surfaceType],
        ['Ball',         `${match.ballColour} ${match.ballType}`],
        ['Toss',         match.tossHeld
          ? `${match.tossWinner} won, chose ${match.tossDecision}`
          : 'Not held'],
        ['Result',       match.resultType ?? match.status],
        ['Captain',      match.moraCaptainName ?? '—'],
        ['Keeper',       match.moraWickeeperName ?? '—'],
        ['POTM',         match.playerOfMatchName ?? '—'],
      ].map(([label, value]) => (
        <div key={label as string}>
          <p className="text-xs text-slate-500">{label}</p>
          <p className="text-white">{value as string}</p>
        </div>
      ))}
    </div>
  )
}
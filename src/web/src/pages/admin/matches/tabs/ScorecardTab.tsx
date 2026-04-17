import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { inningsApi } from '@/api/innings'
import { usePlayersLookup } from '@/hooks/usePlayers'
import { useInningsEvents } from '@/hooks/useInnings'
import { InningsTimeline } from './delivery/InningsTimeline'
import { FormField } from '@/components/shared/FormField'

interface Props {
  innings:  any
  matchId:  string
}

type ActiveForm = 'totals' | 'batting' | 'bowling' | 'fow' | null

export function ScorecardTab({ innings, matchId }: Props) {
  const qc              = useQueryClient()
  const { data: players } = usePlayersLookup()
  const isMora          = innings.battingTeam === 'MORA'
  const [active, setActive] = useState<ActiveForm>(null)
  const [error,  setError]  = useState('')
  const [msg,    setMsg]    = useState('')

  // ── Totals form ───────────────────────────────────────────────────────────
  const [totals, setTotals] = useState({
    totalRuns:       innings.totalRuns       ?? 0,
    totalWickets:    innings.totalWickets    ?? 0,
    totalOversFaced: innings.totalOversFaced ?? 0,
    extrasWides:     innings.extrasWides     ?? 0,
    extrasNoBalls:   innings.extrasNoBalls   ?? 0,
    extrasLegByes:   innings.extrasLegByes   ?? 0,
    extrasByes:      innings.extrasByes      ?? 0,
    extrasPenalty:   innings.extrasPenalty   ?? 0,
  })

  // ── Batting form ──────────────────────────────────────────────────────────
  const [bat, setBat] = useState({
    playerId:                  '',
    playerName:                '',
    battingStyle:              '',
    battingPosition:           (innings.moraBatting?.length ?? 0) + 1,
    runs:                      0,
    ballsFaced:                0,
    fours:                     0,
    sixes:                     0,
    isNotOut:                  false,
    minutesBatted:             '',
    dismissalType:             '',
    dismissedByOppBowlerName:  '',
    dismissedByOppBowlerStyle: '',
    fieldedByOppName:          '',
    dismissedByMoraBowlerId:   '',
    fieldedByMoraPlayerId:     '',
  })

  // ── Bowling form ──────────────────────────────────────────────────────────
  const [bowl, setBowl] = useState({
    playerId:     '',
    playerName:   '',
    bowlingStyle: '',
    oversBowled:  '',
    maidens:      0,
    runsConceded: 0,
    wickets:      0,
    wides:        0,
    noBalls:      0,
  })

  // ── FOW form ──────────────────────────────────────────────────────────────
  const [fow, setFow] = useState({
    wicketNumber:          (innings.fallOfWickets?.length ?? 0) + 1,
    scoreAtFall:           0,
    overAtFall:            '',
    dismissedPlayerName:   '',
    dismissedMoraPlayerId: '',
  })

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ['scorecards', matchId] })
    qc.invalidateQueries({ queryKey: ['scorecard',  innings.id] })
  }

  const saveTotals = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await inningsApi.updateTotals(innings.id, {
        totalRuns:       Number(totals.totalRuns),
        totalWickets:    Number(totals.totalWickets),
        totalOversFaced: Number(totals.totalOversFaced),
        extrasWides:     Number(totals.extrasWides),
        extrasNoBalls:   Number(totals.extrasNoBalls),
        extrasLegByes:   Number(totals.extrasLegByes),
        extrasByes:      Number(totals.extrasByes),
        extrasPenalty:   Number(totals.extrasPenalty),
      })
      setMsg('Totals saved.')
      refresh()
    } catch {
      setError('Failed to save totals.')
    }
  }

  const saveBatting = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (isMora) {
        await inningsApi.addMoraBatting(innings.id, {
          inningsId:                  innings.id,
          playerId:                   bat.playerId,
          battingPosition:            Number(bat.battingPosition),
          runs:                       Number(bat.runs),
          ballsFaced:                 Number(bat.ballsFaced),
          fours:                      Number(bat.fours),
          sixes:                      Number(bat.sixes),
          isNotOut:                   bat.isNotOut,
          minutesBatted:              bat.minutesBatted
                                        ? Number(bat.minutesBatted) : null,
          dismissalType:              bat.dismissalType   || null,
          dismissedByOppBowlerName:   bat.dismissedByOppBowlerName  || null,
          dismissedByOppBowlerStyle:  bat.dismissedByOppBowlerStyle || null,
          fieldedByOppName:           bat.fieldedByOppName          || null,
          dismissedByOppBowlerId:     null,
          fieldedByMoraPlayerId:      null,
        })
      } else {
        await inningsApi.addOpponentBatting(innings.id, {
          inningsId:               innings.id,
          opponentPlayerId:        null,
          playerName:              bat.playerName,
          battingStyle:            bat.battingStyle || null,
          battingPosition:         Number(bat.battingPosition),
          runs:                    Number(bat.runs),
          ballsFaced:              Number(bat.ballsFaced),
          fours:                   Number(bat.fours),
          sixes:                   Number(bat.sixes),
          isNotOut:                bat.isNotOut,
          minutesBatted:           bat.minutesBatted
                                     ? Number(bat.minutesBatted) : null,
          dismissalType:           bat.dismissalType              || null,
          dismissedByMoraBowlerId: bat.dismissedByMoraBowlerId    || null,
          fieldedByMoraPlayerId:   bat.fieldedByMoraPlayerId      || null,
        })
      }
      setMsg('Batting line added.')
      setBat(b => ({
        ...b,
        runs: 0, ballsFaced: 0, fours: 0, sixes: 0,
        isNotOut: false, minutesBatted: '', dismissalType: '',
        dismissedByOppBowlerName: '', dismissedByOppBowlerStyle: '',
        fieldedByOppName: '', playerId: '', playerName: '',
        battingPosition: Number(b.battingPosition) + 1,
      }))
      refresh()
    } catch {
      setError('Failed to add batting line.')
    }
  }

  const saveBowling = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      if (!isMora) {
        await inningsApi.addMoraBowling(innings.id, {
          inningsId:    innings.id,
          playerId:     bowl.playerId,
          oversBowled:  Number(bowl.oversBowled),
          maidens:      Number(bowl.maidens),
          runsConceded: Number(bowl.runsConceded),
          wickets:      Number(bowl.wickets),
          wides:        Number(bowl.wides),
          noBalls:      Number(bowl.noBalls),
        })
      } else {
        await inningsApi.addOpponentBowling(innings.id, {
          inningsId:       innings.id,
          opponentPlayerId: null,
          playerName:      bowl.playerName,
          bowlingStyle:    bowl.bowlingStyle || null,
          oversBowled:     Number(bowl.oversBowled),
          maidens:         Number(bowl.maidens),
          runsConceded:    Number(bowl.runsConceded),
          wickets:         Number(bowl.wickets),
          wides:           Number(bowl.wides),
          noBalls:         Number(bowl.noBalls),
        })
      }
      setMsg('Bowling figures added.')
      setBowl(b => ({
        ...b,
        oversBowled: '', maidens: 0, runsConceded: 0,
        wickets: 0, wides: 0, noBalls: 0,
        playerId: '', playerName: '',
      }))
      refresh()
    } catch {
      setError('Failed to add bowling figures.')
    }
  }

  const saveFow = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    try {
      await inningsApi.addFallOfWicket(innings.id, {
        inningsId:             innings.id,
        wicketNumber:          Number(fow.wicketNumber),
        scoreAtFall:           Number(fow.scoreAtFall),
        overAtFall:            Number(fow.overAtFall),
        dismissedPlayerName:   fow.dismissedPlayerName,
        dismissedMoraPlayerId: fow.dismissedMoraPlayerId || null,
        dismissedOppPlayerId:  null,
      })
      setMsg('Fall of wicket added.')
      setFow(f => ({
        ...f,
        wicketNumber: Number(f.wicketNumber) + 1,
        scoreAtFall: 0, overAtFall: '',
        dismissedPlayerName: '',
        dismissedMoraPlayerId: '',
      }))
      refresh()
    } catch {
      setError('Failed to add fall of wicket.')
    }
  }

  return (
    <div className="space-y-6">

      {/* ── Current scorecard summary ── */}
      <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-5">
        <h3 className="font-semibold text-white mb-3">
          {innings.battingTeam} —{' '}
          {innings.totalRuns}/{innings.totalWickets}
          {' '}({innings.totalOversFaced} ov)
        </h3>

        {/* Batting lines */}
        {(innings.moraBatting?.length > 0 ||
          innings.opponentBatting?.length > 0) && (
          <div className="mb-4">
            <p className="text-xs text-slate-400 mb-2 font-medium
                          uppercase tracking-wide">
              Batting
            </p>
            <div className="space-y-1">
              {(isMora ? innings.moraBatting : innings.opponentBatting)
                ?.map((b: any) => (
                <div key={b.id}
                  className="flex gap-3 text-sm bg-slate-900/40
                             rounded px-3 py-1.5">
                  <span className="text-slate-400 w-5">
                    {b.battingPosition}
                  </span>
                  <span className="flex-1 text-white">
                    {b.playerFullName ?? b.playerName}
                  </span>
                  <span className="text-slate-300 font-semibold">
                    {b.runs}{b.isNotOut ? '*' : ''}
                  </span>
                  <span className="text-slate-500">({b.ballsFaced})</span>
                  <span className="text-slate-500 text-xs">
                    {b.dismissalType ?? 'not out'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bowling lines */}
        {(innings.moraBowling?.length > 0 ||
          innings.opponentBowling?.length > 0) && (
          <div>
            <p className="text-xs text-slate-400 mb-2 font-medium
                          uppercase tracking-wide">
              Bowling
            </p>
            <div className="space-y-1">
              {(isMora
                ? innings.opponentBowling
                : innings.moraBowling)?.map((b: any) => (
                <div key={b.id}
                  className="flex gap-3 text-sm bg-slate-900/40
                             rounded px-3 py-1.5">
                  <span className="flex-1 text-white">
                    {b.playerFullName ?? b.playerName}
                  </span>
                  <span className="text-slate-400">{b.oversBowled}</span>
                  <span className="text-slate-400">{b.maidens}m</span>
                  <span className="text-slate-400">{b.runsConceded}r</span>
                  <span className="text-white font-semibold">
                    {b.wickets}w
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Fall of wickets */}
        {innings.fallOfWickets?.length > 0 && (
          <div className="mt-4 pt-4 border-t border-slate-700/50">
            <p className="text-xs text-slate-400 mb-2 font-medium
                          uppercase tracking-wide">
              Fall of Wickets
            </p>
            <div className="flex flex-wrap gap-3 text-xs">
              {innings.fallOfWickets
                .sort((a: any, b: any) => a.wicketNumber - b.wicketNumber)
                .map((f: any) => (
                  <span key={f.id} className="text-slate-300 font-mono">
                    {f.wicketNumber}-{f.scoreAtFall}
                    <span className="text-slate-500 ml-1">
                      ({f.overAtFall})
                    </span>
                  </span>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Action buttons ── */}
      {!innings.hasDeliveryData && (
        <>
          <div className="flex flex-wrap gap-2">
            {(['totals', 'batting', 'bowling', 'fow'] as ActiveForm[])
              .map(f => (
              <button
                key={f}
                onClick={() => setActive(active === f ? null : f)}
                className={`px-3 py-1.5 rounded-lg text-sm
                            transition-colors ${
                  active === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                }`}
              >
                {f === 'totals'  ? '📊 Update Totals'
               : f === 'batting' ? '🏏 Add Batter'
               : f === 'bowling' ? '🎳 Add Bowler'
               :                   '📉 Add Fall of Wicket'}
              </button>
            ))}
          </div>

          {msg   && <p className="text-green-400 text-sm">{msg}</p>}
          {error && <p className="text-red-400 text-sm">{error}</p>}

          {/* Totals form */}
          {active === 'totals' && (
            <form onSubmit={saveTotals}
              className="bg-slate-800/60 border border-slate-700
                         rounded-xl p-5 space-y-4">
              <h4 className="font-medium text-white">Innings Totals</h4>
              <div className="grid grid-cols-3 gap-3">
                {([ 'totalRuns',
                    'totalWickets',
                    'totalOversFaced',
                ] as const).map(k => (
                  <FormField key={k}
                    label={k.replace(/([A-Z])/g, ' $1').trim()}>
                    <input
                      type="number" step="0.1"
                      value={totals[k]}
                      onChange={e => setTotals(t => ({
                        ...t, [k]: e.target.value
                      }))}
                      className="input-base w-full"
                    />
                  </FormField>
                ))}
              </div>
              <div className="grid grid-cols-5 gap-3">
                {([
                  'extrasWides', 'extrasNoBalls',
                  'extrasLegByes', 'extrasByes', 'extrasPenalty',
                ] as const).map(k => (
                  <FormField key={k}
                    label={k.replace('extras', '').trim()}>
                    <input
                      type="number" min={0}
                      value={totals[k]}
                      onChange={e => setTotals(t => ({
                        ...t, [k]: e.target.value
                      }))}
                      className="input-base w-full"
                    />
                  </FormField>
                ))}
              </div>
              <button type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500
                           text-white text-sm rounded-lg transition-colors">
                Save Totals
              </button>
            </form>
          )}

          {/* Batting form */}
          {active === 'batting' && (
            <form onSubmit={saveBatting}
              className="bg-slate-800/60 border border-slate-700
                         rounded-xl p-5 space-y-4">
              <h4 className="font-medium text-white">Add Batting Line</h4>
              <div className="grid grid-cols-3 gap-4">
                {isMora ? (
                  <FormField label="Batter" required>
                    <select
                      value={bat.playerId}
                      onChange={e => setBat(b => ({
                        ...b, playerId: e.target.value
                      }))}
                      className="input-base w-full" required>
                      <option value="">Select player...</option>
                      {players?.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.fullName}
                        </option>
                      ))}
                    </select>
                  </FormField>
                ) : (
                  <>
                    <FormField label="Batter Name" required>
                      <input
                        value={bat.playerName}
                        onChange={e => setBat(b => ({
                          ...b, playerName: e.target.value
                        }))}
                        className="input-base w-full" required />
                    </FormField>
                    <FormField label="Batting Hand">
                      <select
                        value={bat.battingStyle}
                        onChange={e => setBat(b => ({
                          ...b, battingStyle: e.target.value
                        }))}
                        className="input-base w-full">
                        <option value="">Unknown</option>
                        <option value="RHB">Right-hand</option>
                        <option value="LHB">Left-hand</option>
                      </select>
                    </FormField>
                  </>
                )}
                <FormField label="Position">
                  <input
                    type="number" min={1} max={11}
                    value={bat.battingPosition}
                    onChange={e => setBat(b => ({
                      ...b, battingPosition: Number(e.target.value)
                    }))}
                    className="input-base w-full" />
                </FormField>
              </div>

              <div className="grid grid-cols-5 gap-3">
                {(['runs','ballsFaced','fours','sixes'] as const).map(k => (
                  <FormField key={k}
                    label={k.replace(/([A-Z])/g, ' $1').trim()}>
                    <input type="number" min={0}
                      value={bat[k]}
                      onChange={e => setBat(b => ({
                        ...b, [k]: e.target.value
                      }))}
                      className="input-base w-full" />
                  </FormField>
                ))}
                <FormField label="Mins">
                  <input type="number" min={0}
                    value={bat.minutesBatted}
                    onChange={e => setBat(b => ({
                      ...b, minutesBatted: e.target.value
                    }))}
                    className="input-base w-full"
                    placeholder="—" />
                </FormField>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <FormField label="Dismissal">
                  <select
                    value={bat.dismissalType}
                    onChange={e => setBat(b => ({
                      ...b, dismissalType: e.target.value
                    }))}
                    className="input-base w-full">
                    <option value="">Not Out</option>
                    {['BOWLED','CAUGHT','LBW','RUN_OUT','STUMPED',
                      'HIT_WICKET','RETIRED_HURT','DNB'].map(d => (
                      <option key={d} value={d}>
                        {d.replace('_', ' ')}
                      </option>
                    ))}
                  </select>
                </FormField>

                {isMora && bat.dismissalType &&
                 bat.dismissalType !== 'DNB' && (
                  <>
                    <FormField label="Bowler Name">
                      <input
                        value={bat.dismissedByOppBowlerName}
                        onChange={e => setBat(b => ({
                          ...b, dismissedByOppBowlerName: e.target.value
                        }))}
                        className="input-base w-full"
                        placeholder="Opponent bowler" />
                    </FormField>
                    <FormField label="Bowler Style">
                      <select
                        value={bat.dismissedByOppBowlerStyle}
                        onChange={e => setBat(b => ({
                          ...b, dismissedByOppBowlerStyle: e.target.value
                        }))}
                        className="input-base w-full">
                        <option value="">Unknown</option>
                        {['RF','RFM','RM','OB','LB','SLA','SLO','LM','LF']
                          .map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </FormField>
                  </>
                )}

                {!isMora && bat.dismissalType &&
                 bat.dismissalType !== 'DNB' && (
                  <>
                    <FormField label="Dismissed By (our bowler)">
                      <select
                        value={bat.dismissedByMoraBowlerId}
                        onChange={e => setBat(b => ({
                          ...b, dismissedByMoraBowlerId: e.target.value
                        }))}
                        className="input-base w-full">
                        <option value="">Select bowler...</option>
                        {players?.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.fullName}
                          </option>
                        ))}
                      </select>
                    </FormField>
                    <FormField label="Fielder">
                      <select
                        value={bat.fieldedByMoraPlayerId}
                        onChange={e => setBat(b => ({
                          ...b, fieldedByMoraPlayerId: e.target.value
                        }))}
                        className="input-base w-full">
                        <option value="">N/A</option>
                        {players?.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.fullName}
                          </option>
                        ))}
                      </select>
                    </FormField>
                  </>
                )}
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={bat.isNotOut}
                  onChange={e => setBat(b => ({
                    ...b, isNotOut: e.target.checked
                  }))}
                  className="accent-blue-500" />
                <span className="text-sm text-slate-300">Not out</span>
              </label>

              <button type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500
                           text-white text-sm rounded-lg transition-colors">
                Add Batter
              </button>
            </form>
          )}

          {/* Bowling form */}
          {active === 'bowling' && (
            <form onSubmit={saveBowling}
              className="bg-slate-800/60 border border-slate-700
                         rounded-xl p-5 space-y-4">
              <h4 className="font-medium text-white">Add Bowling Figures</h4>
              <div className="grid grid-cols-3 gap-4">
                {!isMora ? (
                  <FormField label="Bowler" required>
                    <select
                      value={bowl.playerId}
                      onChange={e => setBowl(b => ({
                        ...b, playerId: e.target.value
                      }))}
                      className="input-base w-full" required>
                      <option value="">Select bowler...</option>
                      {players?.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.fullName}
                        </option>
                      ))}
                    </select>
                  </FormField>
                ) : (
                  <>
                    <FormField label="Bowler Name" required>
                      <input
                        value={bowl.playerName}
                        onChange={e => setBowl(b => ({
                          ...b, playerName: e.target.value
                        }))}
                        className="input-base w-full" required />
                    </FormField>
                    <FormField label="Bowling Style">
                      <select
                        value={bowl.bowlingStyle}
                        onChange={e => setBowl(b => ({
                          ...b, bowlingStyle: e.target.value
                        }))}
                        className="input-base w-full">
                        <option value="">Unknown</option>
                        {['RF','RFM','RM','RMF','OB','LB',
                          'SLA','SLO','LM','LMF','LF'].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </FormField>
                  </>
                )}
              </div>
              <div className="grid grid-cols-6 gap-3">
                {(['oversBowled','maidens','runsConceded',
                   'wickets','wides','noBalls'] as const).map(k => (
                  <FormField key={k}
                    label={k.replace(/([A-Z])/g, ' $1').slice(0, 8)}>
                    <input
                      type="number" min={0}
                      step={k === 'oversBowled' ? '0.1' : '1'}
                      value={bowl[k]}
                      onChange={e => setBowl(b => ({
                        ...b, [k]: e.target.value
                      }))}
                      className="input-base w-full" />
                  </FormField>
                ))}
              </div>
              <button type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500
                           text-white text-sm rounded-lg transition-colors">
                Add Bowling
              </button>
            </form>
          )}

          {/* FOW form */}
          {active === 'fow' && (
            <form onSubmit={saveFow}
              className="bg-slate-800/60 border border-slate-700
                         rounded-xl p-5 space-y-4">
              <h4 className="font-medium text-white">Fall of Wicket</h4>
              <div className="grid grid-cols-4 gap-4">
                <FormField label="Wicket #">
                  <input
                    type="number" min={1} max={10}
                    value={fow.wicketNumber}
                    onChange={e => setFow(f => ({
                      ...f, wicketNumber: Number(e.target.value)
                    }))}
                    className="input-base w-full" />
                </FormField>
                <FormField label="Score at Fall">
                  <input
                    type="number" min={0}
                    value={fow.scoreAtFall}
                    onChange={e => setFow(f => ({
                      ...f, scoreAtFall: Number(e.target.value)
                    }))}
                    className="input-base w-full" />
                </FormField>
                <FormField label="Over" hint="e.g. 12.4">
                  <input
                    type="number" min={0} step="0.1"
                    value={fow.overAtFall}
                    onChange={e => setFow(f => ({
                      ...f, overAtFall: e.target.value
                    }))}
                    className="input-base w-full" />
                </FormField>
                <FormField label="Dismissed Player">
                  {isMora ? (
                    <select
                      value={fow.dismissedMoraPlayerId}
                      onChange={e => {
                        const p = players?.find(
                          p => p.id === e.target.value
                        )
                        setFow(f => ({
                          ...f,
                          dismissedMoraPlayerId: e.target.value,
                          dismissedPlayerName:   p?.fullName ?? '',
                        }))
                      }}
                      className="input-base w-full">
                      <option value="">Select player...</option>
                      {players?.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.fullName}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={fow.dismissedPlayerName}
                      onChange={e => setFow(f => ({
                        ...f, dismissedPlayerName: e.target.value
                      }))}
                      className="input-base w-full"
                      placeholder="Player name" />
                  )}
                </FormField>
              </div>
              <button type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500
                           text-white text-sm rounded-lg transition-colors">
                Add FOW
              </button>
            </form>
          )}
        </>
      )}

      {innings.hasDeliveryData && (
        <div className="bg-blue-950/30 border border-blue-800/40
                        rounded-xl p-4 text-blue-300 text-sm">
          ℹ This innings has ball-by-ball data. Scorecard entries are
          auto-generated from deliveries. Use the Balls tab to make corrections.
        </div>
      )}

      {/* ── Innings Timeline ── */}
      <InningsEventsSection inningsId={innings.id} />
    </div>
  )
}

function InningsEventsSection({ inningsId }: { inningsId: string }) {
  const { data: events = [] } = useInningsEvents(inningsId)

  if (events.length === 0) return null

  return (
    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
      <p className="text-xs font-medium text-slate-400 uppercase
                    tracking-wide mb-3">
        Innings Timeline
      </p>
      <InningsTimeline events={events} />
    </div>
  )
}
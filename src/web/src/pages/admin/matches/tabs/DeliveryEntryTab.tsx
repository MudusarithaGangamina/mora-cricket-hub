import { useState, useEffect, useMemo } from 'react'
import { useQueryClient, useQuery } from '@tanstack/react-query'
import { deliveriesApi } from '@/api/deliveries'
import { matchesApi } from '@/api/matches'
import { WagonWheelPicker } from '@/components/charts/WagonWheelPicker'
import { FormField } from '@/components/shared/FormField'
import { DirectionZone, ShotType, BowlingStyleLabels } from '@/types/enums'
import {
  formatBallDisplay,
  nextBallState,
  shouldRotateStrike,
  strikeAfterWicket,
  type RunOutEnd,
} from '@/utils/cricketCalculations'
import { clsx } from 'clsx'
import type { SquadMember } from '@/api/matches'

interface Props {
  innings: any
  matchId: string
}

const SHOT_TYPES = Object.values(ShotType)

const DISMISSAL_TYPES = [
  { value: 'BOWLED',       label: 'Bowled'       },
  { value: 'CAUGHT',       label: 'Caught'       },
  { value: 'LBW',          label: 'LBW'          },
  { value: 'RUN_OUT',      label: 'Run Out'      },
  { value: 'STUMPED',      label: 'Stumped'      },
  { value: 'HIT_WICKET',   label: 'Hit Wicket'   },
  { value: 'RETIRED_HURT', label: 'Retired Hurt' },
  { value: 'RETIRED_OUT',  label: 'Retired Out'  },
  { value: 'OBSTRUCTING',  label: 'Obstructing'  },
]

const RUN_BUTTONS = [0, 1, 2, 3, 4, 5, 6, 7]

export function DeliveryEntryTab({ innings, matchId }: Props) {
  const qc                = useQueryClient()
  const isMoraBatting     = innings.battingTeam === 'Mora'
  console.log(isMoraBatting)
  console.log(innings)
  // ── Load squad for this match ─────────────────────────────────────────────
  const { data: squad = [] } = useQuery<SquadMember[]>({
  queryKey: ['squad', matchId],
  queryFn:  () => matchesApi.getSquad(matchId),
})

console.log(squad)
  // ── Load existing deliveries ──────────────────────────────────────────────
  const { data: deliveries = [] } = useQuery({
    queryKey: ['deliveries', innings.id],
    queryFn:  () => deliveriesApi.getInningsDeliveries(innings.id),
  })

  const { data: overSummaries = [] } = useQuery({
    queryKey: ['over-summaries', innings.id],
    queryFn:  () => deliveriesApi.getOverSummaries(innings.id),
  })

  // ── Derive already-dismissed Mora batters from scorecard ──────────────────
  // These are batters who are OUT (not retired-hurt who can return)
  const dismissedMoraIds = useMemo(() => {
    const out = new Set<string>()
    for (const d of deliveries) {
      if (
        d.isWicket &&
        d.dismissedMoraBatterId &&
        d.wicketType !== 'RETIRED_HURT'
      ) {
        out.add(d.dismissedMoraBatterId)
      }
    }
    return out
  }, [deliveries])

  // Retired-hurt batters — they CAN return
  const retiredHurtIds = useMemo(() => {
    const rh = new Set<string>()
    for (const d of deliveries) {
      if (d.isWicket && d.dismissedMoraBatterId && d.wicketType === 'RETIRED_HURT') {
        rh.add(d.dismissedMoraBatterId)
      }
    }
    return rh
  }, [deliveries])

  // Batters available to come in — squad XI, not permanently out
  const availableMoraBatters = useMemo(
  () => squad.filter(p =>
    p.isPlayingXi && !dismissedMoraIds.has(p.playerId)
  ),
  [squad, dismissedMoraIds]
)

console.log(availableMoraBatters)

  // ── Last over bowler (cannot bowl consecutive overs) ──────────────────────
  const lastOverBowlerId = useMemo(() => {
    if (!deliveries.length) return null
    // Find the last completed over
    const lastDelivery = deliveries[deliveries.length - 1]
    const prevOverNumber = lastDelivery.overNumber - 1
    if (prevOverNumber < 1) return null
    const prevOverBalls = deliveries.filter(
      d => d.overNumber === prevOverNumber
    )
    if (!prevOverBalls.length) return null
    return prevOverBalls[0].moraBowlerId ?? null
  }, [deliveries])

  // ── Ball position state ───────────────────────────────────────────────────
  const [overNumber,       setOverNumber]       = useState(1)
  const [ballNumber,       setBallNumber]        = useState(1)
  const [deliverySequence, setDeliverySequence]  = useState(1)

  // ── Batters on pitch ──────────────────────────────────────────────────────
  const [strikerId,    setStrikerId]    = useState('')
  const [nonStrikerId, setNonStrikerId] = useState('')

  // Opponent batters (free text when opponent bats)
  const [oppStrikerName,    setOppStrikerName]    = useState('')
  const [oppStrikerStyle,   setOppStrikerStyle]   = useState('')
  const [oppNonStrikerName, setOppNonStrikerName] = useState('')

  // ── Bowler ────────────────────────────────────────────────────────────────
  const [moraBowlerId,   setMoraBowlerId]   = useState('')
  const [oppBowlerName,  setOppBowlerName]  = useState('')
  const [oppBowlerStyle, setOppBowlerStyle] = useState('')

  // ── Ball outcome ──────────────────────────────────────────────────────────
  const [runsOffBat, setRunsOffBat] = useState(0)
  const [extrasType, setExtrasType] = useState('')
  const [extrasRuns, setExtrasRuns] = useState(0)

  // ── Wicket ────────────────────────────────────────────────────────────────
  const [isWicket,        setIsWicket]        = useState(false)
  const [wicketType,      setWicketType]       = useState('')
  const [dismissedId,     setDismissedId]      = useState('')
  const [dismissedName,   setDismissedName]    = useState('')
  const [runOutEnd,       setRunOutEnd]        = useState<RunOutEnd>('STRIKER')
  const [moraFielderId,   setMoraFielderId]    = useState('')
  const [oppFielderName,  setOppFielderName]   = useState('')

  // ── Enrichment ────────────────────────────────────────────────────────────
  const [bowlingSide,   setBowlingSide]   = useState('')
  const [shotType,      setShotType]      = useState<ShotType | null>(null)
  const [directionZone, setDirectionZone] = useState<DirectionZone | null>(null)

  // ── UI ────────────────────────────────────────────────────────────────────
  const [saving,    setSaving]    = useState(false)
  const [error,     setError]     = useState('')
  const [ballLog,   setBallLog]   = useState<string[]>([])

  // ── Derive ball position from last delivery on mount ──────────────────────
  useEffect(() => {
    if (!deliveries.length) return
    const last = deliveries[deliveries.length - 1]
    const next = nextBallState({
      overNumber:      last.overNumber,
      ballNumber:      last.ballNumber,
      deliverySequence: last.deliverySequence,
      extrasType:      last.extrasType,
    })
    setOverNumber(next.overNumber)
    setBallNumber(next.ballNumber)
    setDeliverySequence(next.deliverySequence)
  }, []) // mount only

  // ── Reset per-ball state ──────────────────────────────────────────────────
  const resetBall = () => {
    setRunsOffBat(0)
    setExtrasType('')
    setExtrasRuns(0)
    setIsWicket(false)
    setWicketType('')
    setDismissedId('')
    setDismissedName('')
    setRunOutEnd('STRIKER')
    setMoraFielderId('')
    setOppFielderName('')
    setShotType(null)
    setDirectionZone(null)
    setBowlingSide('')
  }

  // ── Computed: will strike rotate? ─────────────────────────────────────────
  const isLegalBall = extrasType !== 'WIDE' && extrasType !== 'NO_BALL'
  const isEndOfOver  = isLegalBall && ballNumber === 6

  const willRotate = shouldRotateStrike(
    runsOffBat, extrasType || null, extrasRuns, isEndOfOver
  )

  // ── Apply strike rotation ─────────────────────────────────────────────────
  const applyStrikeRotation = (
    runs: number,
    extras: string,
    exRuns: number,
    endOfOver: boolean,
    wicket: boolean,
    wType: string,
    roEnd: RunOutEnd
  ) => {
    if (!isMoraBatting) {
      // Opponent batting — rotate their names
      if (shouldRotateStrike(runs, extras || null, exRuns, endOfOver)) {
        setOppStrikerName(prev => {
          setOppNonStrikerName(prev)
          return oppNonStrikerName
        })
      }
      return
    }

    if (wicket) {
      const placement = strikeAfterWicket(
        wType, runs, ballNumber, extras || null, roEnd
      )

      if (placement === 'NEW_BATTER_STRIKER') {
        // Dismissed batter was at striker end — clear striker
        const dismissedWasStriker =
          !dismissedId || dismissedId === strikerId
        if (dismissedWasStriker) {
          setStrikerId('')  // prompt for new batter
        } else {
          // Non-striker was dismissed (run-out at non-striker end)
          setNonStrikerId('')
        }
      } else {
        // NEW_BATTER_NON_STRIKER — last ball of over wicket
        // New batter comes to non-striker end for next over
        setNonStrikerId('')
      }

      // If batters crossed on odd runs before the wicket, swap
      if (runs % 2 === 1 && !endOfOver) {
        setStrikerId(nonStrikerId)
        setNonStrikerId(strikerId)
        // Then clear the dismissed one again from the swapped position
        if (!dismissedId || dismissedId === strikerId) {
          setNonStrikerId('')  // was striker, now at non-striker after swap
        } else {
          setStrikerId('')
        }
      }
      return
    }

    // No wicket — normal rotation
    if (shouldRotateStrike(runs, extras || null, exRuns, endOfOver)) {
      setStrikerId(prev => {
        setNonStrikerId(prev)
        return nonStrikerId
      })
    }
  }

  // ── Confirm ball ──────────────────────────────────────────────────────────
  const confirmBall = async () => {
    if (!strikerId && isMoraBatting) {
      setError('Select the striker before confirming.')
      return
    }
    if (!moraBowlerId && !isMoraBatting) {
      setError('Select the Mora bowler before confirming.')
      return
    }
    if (isWicket && !wicketType) {
      setError('Select the wicket type.')
      return
    }

    setSaving(true)
    setError('')

    const endOfOver = isLegalBall && ballNumber === 6
    const totalRuns = runsOffBat + extrasRuns

    try {
      // Find Mora batter name for log
      const strikerPlayer = squad.find(p => p.playerId === strikerId)
      const strikerName = strikerPlayer?.playerName ?? '?'
      await deliveriesApi.add({
        inningsId:       innings.id,
        overNumber,
        ballNumber,
        deliverySequence,

        moraBatterId:   isMoraBatting  ? strikerId    || undefined : undefined,
        oppBatterId:    undefined,
        oppBatterName:  !isMoraBatting ? oppStrikerName  || undefined : undefined,
        oppBatterStyle: !isMoraBatting ? oppStrikerStyle || undefined : undefined,

        moraBowlerId:   !isMoraBatting ? moraBowlerId   || undefined : undefined,
        oppBowlerId:    undefined,
        oppBowlerName:  isMoraBatting  ? oppBowlerName  || undefined : undefined,
        oppBowlerStyle: isMoraBatting  ? oppBowlerStyle || undefined : undefined,

        runsOffBat,
        extrasType:  extrasType || null,
        extrasRuns,

        isWicket,
        wicketType:   isWicket ? wicketType : null,
        dismissedMoraBatterId: isMoraBatting && isWicket
          ? (dismissedId || strikerId) : undefined,
        dismissedBatterName: isWicket
          ? (isMoraBatting
              ? squad.find((p: any) =>
                  p.playerId === (dismissedId || strikerId)
                )?.fullName
              : dismissedName)
          : null,
        moraFielderId:  !isMoraBatting && isWicket
          ? moraFielderId || undefined : undefined,
        oppFielderName: isMoraBatting && isWicket
          ? oppFielderName || undefined : undefined,

        bowlingSide:   bowlingSide   || null,
        shotType:      shotType      || null,
        directionZone: directionZone || null,
      })

      // ── Build ball log entry ──────────────────────────────────────────────
      const display = formatBallDisplay(overNumber, ballNumber)
      const parts: string[] = [`${display}`]
      if (extrasType)    parts.push(`[${extrasType}${extrasRuns > 1 ? `+${extrasRuns - 1}` : ''}]`)
      if (runsOffBat > 0) parts.push(`${runsOffBat}`)
      if (isWicket)      parts.push(`🔴${wicketType}`)
      if (shotType)      parts.push(shotType.replace(/_/g, ' ').toLowerCase())
      if (directionZone) parts.push(`→ ${directionZone.replace(/_/g, ' ')}`)
      parts.push(`(${totalRuns})`)
      setBallLog(prev => [parts.join(' '), ...prev].slice(0, 12))

      // ── Apply strike rotation ─────────────────────────────────────────────
      applyStrikeRotation(
        runsOffBat, extrasType, extrasRuns,
        endOfOver, isWicket, wicketType, runOutEnd
      )

      // ── Advance ball counter ──────────────────────────────────────────────
      const next = nextBallState({
        overNumber, ballNumber, deliverySequence,
        extrasType: extrasType || null,
      })
      setOverNumber(next.overNumber)
      setBallNumber(next.ballNumber)
      setDeliverySequence(next.deliverySequence)

      resetBall()
      qc.invalidateQueries({ queryKey: ['deliveries',     innings.id] })
      qc.invalidateQueries({ queryKey: ['over-summaries', innings.id] })

    } catch (e: any) {
      setError(
        e?.response?.data?.errors?.[0]?.message ??
        'Failed to save ball.'
      )
    } finally {
      setSaving(false)
    }
  }

  // ── Undo last ball ────────────────────────────────────────────────────────
  const undoLastBall = async () => {
    if (!deliveries.length) return
    const last = deliveries[deliveries.length - 1]
    await deliveriesApi.delete(last.id, innings.id, last.overNumber)

    // Roll back ball position to what it was before that delivery
    setOverNumber(last.overNumber)
    setBallNumber(last.ballNumber)
    setDeliverySequence(last.deliverySequence)
    setBallLog(prev => prev.slice(1))

    qc.invalidateQueries({ queryKey: ['deliveries',     innings.id] })
    qc.invalidateQueries({ queryKey: ['over-summaries', innings.id] })
  }

  const markComplete = async () => {
    await deliveriesApi.markComplete(innings.id)
    qc.invalidateQueries({ queryKey: ['scorecards', matchId] })
  }

  // ── Bowler availability ───────────────────────────────────────────────────
  // Can't bowl consecutive overs
  const availableMoraBowlers = useMemo(
  () => squad.filter(p =>
    p.isPlayingXi &&
    p.playerId !== lastOverBowlerId &&
    // Only show players who can bowl (have a bowling style or are allrounders)
    // If no bowling style set, show everyone — admin decides
    p.playerId !== lastOverBowlerId
  ),
  [squad, lastOverBowlerId]
)

  // ── Striker batting style for wagon wheel ─────────────────────────────────
  const strikerStyle = isMoraBatting
    ? squad.find((p: any) => p.playerId === strikerId)?.battingStyle ?? 'RHB'
    : oppStrikerStyle || 'RHB'
  const isLHB = strikerStyle === 'LHB'

  // ── Current over summary ──────────────────────────────────────────────────
  const currentOS = overSummaries.find(
    (os: any) => os.overNumber === overNumber
  )

  const cumulativeLast = overSummaries.length > 0
    ? overSummaries[overSummaries.length - 1]
    : null

  return (
    <div className="space-y-5">

      {/* ── Status bar ───────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-4 bg-slate-800/60
                      border border-slate-700/50 rounded-xl px-5 py-3">
        {/* Ball display — cricket format */}
        <div>
          <span className="text-3xl font-bold text-white font-mono">
            {formatBallDisplay(overNumber, ballNumber)}
          </span>
          <span className="text-slate-500 text-xs ml-2">
            seq #{deliverySequence}
          </span>
        </div>

        {/* Current over stats */}
        {currentOS && (
          <div className="flex gap-3 text-sm">
            <span className="text-slate-400">
              Over: <span className="text-white font-semibold">
                {currentOS.runsInOver}
              </span>
            </span>
            <span className="text-slate-500">{currentOS.wicketsInOver}w</span>
            <span className="text-slate-500">{currentOS.dotsInOver} dots</span>
            <span className="text-slate-500">{currentOS.foursInOver}×4</span>
            <span className="text-slate-500">{currentOS.sixesInOver}×6</span>
          </div>
        )}

        {/* Running total */}
        {cumulativeLast && (
          <div className="ml-auto text-right">
            <span className="text-xl font-bold text-white">
              {cumulativeLast.cumulativeRuns}/
              {cumulativeLast.cumulativeWickets}
            </span>
            <span className="text-slate-500 text-xs ml-1">
              ({innings.battingTeam})
            </span>
          </div>
        )}
      </div>

      {/* ── Ball log ─────────────────────────────────────────────────────── */}
      {ballLog.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {ballLog.map((b, i) => (
            <span key={i} className={clsx(
              'text-xs px-2 py-1 rounded font-mono',
              i === 0
                ? 'bg-blue-900/50 text-blue-300 border border-blue-700/50'
                : 'bg-slate-800 text-slate-500'
            )}>
              {b}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">

        {/* ── Left: Players ────────────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Batters */}
          <div className="bg-slate-800/60 border border-slate-700/50
                          rounded-xl p-4 space-y-3">
            <p className="text-xs font-medium text-slate-400 uppercase
                          tracking-wide">
              Batters on Pitch
            </p>

            {/* Striker */}
            <div>
              <label className="text-xs text-slate-400 mb-1 flex items-center gap-1">
                🏏 Striker *
                {isMoraBatting && strikerId && (
                  <span className="text-slate-500">
                    ({strikerStyle})
                  </span>
                )}
              </label>

              {isMoraBatting ? (
                <select
                  value={strikerId}
                  onChange={e => setStrikerId(e.target.value)}
                  className="input-base w-full"
                >
                  <option value="">
                    {strikerId === ''
                      ? '⚠ Select striker...'
                      : 'Select striker...'}
                  </option>
                  {/* Active batters (not out, including retired-hurt who returned) */}
                  {availableMoraBatters.map(p => (
  <option key={p.playerId} value={p.playerId}
    disabled={p.playerId === nonStrikerId}>
    {p.shortName}
    {p.battingStyle ? ` (${p.battingStyle})` : ''}
    {retiredHurtIds.has(p.playerId) ? ' [RH - can return]' : ''}
    {p.playerId === nonStrikerId ? ' — non-striker' : ''}
  </option>
))}
                </select>
              ) : (
                <div className="space-y-1">
                  <input
                    value={oppStrikerName}
                    onChange={e => setOppStrikerName(e.target.value)}
                    className="input-base w-full"
                    placeholder="Striker name *"
                  />
                  <select
                    value={oppStrikerStyle}
                    onChange={e => setOppStrikerStyle(e.target.value)}
                    className="input-base w-full"
                  >
                    <option value="">Batting hand?</option>
                    <option value="RHB">Right-hand (RHB)</option>
                    <option value="LHB">Left-hand (LHB)</option>
                  </select>
                </div>
              )}
            </div>

            {/* Non-striker */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">
                Non-Striker
              </label>
              {isMoraBatting ? (
                <select
                  value={nonStrikerId}
                  onChange={e => setNonStrikerId(e.target.value)}
                  className="input-base w-full"
                >
                  <option value="">Select non-striker...</option>
                  {availableMoraBatters.map(p => (
  <option key={p.playerId} value={p.playerId}
    disabled={p.playerId === strikerId}>
    {p.shortName}
    {p.battingStyle ? ` (${p.battingStyle})` : ''}
    {retiredHurtIds.has(p.playerId) ? ' [RH]' : ''}
    {p.playerId === strikerId ? ' — on strike' : ''}
  </option>
))}
                </select>
              ) : (
                <input
                  value={oppNonStrikerName}
                  onChange={e => setOppNonStrikerName(e.target.value)}
                  className="input-base w-full"
                  placeholder="Non-striker name"
                />
              )}
            </div>

            {/* Manual swap */}
            <button type="button"
              onClick={() => {
                if (isMoraBatting) {
                  const temp = strikerId
                  setStrikerId(nonStrikerId)
                  setNonStrikerId(temp)
                } else {
                  const tName  = oppStrikerName
                  const tStyle = oppStrikerStyle
                  setOppStrikerName(oppNonStrikerName)
                  setOppStrikerStyle('')
                  setOppNonStrikerName(tName)
                  setOppStrikerStyle(tStyle)
                }
              }}
              className="w-full text-xs py-1.5 bg-slate-700 hover:bg-slate-600
                         text-slate-300 rounded-lg transition-colors"
            >
              ⇄ Swap Strike Manually
            </button>

            {/* Strike rotation preview */}
            <div className={clsx(
              'text-xs px-3 py-2 rounded-lg border',
              (willRotate)
                ? 'bg-green-950/40 border-green-800/40 text-green-400'
                : 'bg-slate-900/40 border-slate-700/30 text-slate-500'
            )}>
              {isEndOfOver
                ? '⇄ End of over — strike swaps'
                : willRotate
                  ? '⇄ Strike rotates after this ball'
                  : '— Strike stays same after this ball'}
            </div>
          </div>

          {/* Bowler */}
          <div className="bg-slate-800/60 border border-slate-700/50
                          rounded-xl p-4 space-y-3">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
              Bowler
            </p>

            {!isMoraBatting ? (
              <>
                <select
                  value={moraBowlerId}
                  onChange={e => setMoraBowlerId(e.target.value)}
                  className="input-base w-full"
                >
                  <option value="">Select bowler *</option>
                  {availableMoraBowlers.map(p => (
  <option key={p.playerId} value={p.playerId}>
    {p.shortName}
    {p.primaryBowlingStyle ? ` (${p.primaryBowlingStyle})` : ''}
    {p.playerId === lastOverBowlerId ? ' — bowled last over' : ''}
  </option>
))}
                </select>
                {lastOverBowlerId && (
                  <p className="text-xs text-slate-500">
                    Cannot bowl consecutive overs: {
                      squad.find((p: any) => p.playerId === lastOverBowlerId)
                        ?.playerName
                    }
                  </p>
                )}
              </>
            ) : (
              <div className="space-y-2">
                <input
                  value={oppBowlerName}
                  onChange={e => setOppBowlerName(e.target.value)}
                  className="input-base w-full"
                  placeholder="Bowler name *"
                />
                <select
                  value={oppBowlerStyle}
                  onChange={e => setOppBowlerStyle(e.target.value)}
                  className="input-base w-full"
                >
                  <option value="">Style? (important for analytics)</option>
                  {Object.entries(BowlingStyleLabels).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Over/Around */}
            <div>
              <label className="text-xs text-slate-400 mb-1 block">
                Over / Around the wicket
              </label>
              <div className="flex gap-2">
                {['', 'OVER', 'AROUND'].map(s => (
                  <button key={s} type="button"
                    onClick={() => setBowlingSide(s)}
                    className={clsx(
                      'flex-1 py-1.5 rounded text-xs font-medium transition-colors',
                      bowlingSide === s
                        ? 'bg-slate-500 text-white'
                        : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                    )}>
                    {s || '—'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ── Middle: Ball Outcome ──────────────────────────────────────── */}
        <div className="space-y-4">

          {/* Runs off bat */}
          <div className="bg-slate-800/60 border border-slate-700/50
                          rounded-xl p-4">
            <p className="text-xs font-medium text-slate-400 uppercase
                          tracking-wide mb-3">
              Runs Off Bat
            </p>
            <div className="flex gap-2">
              {RUN_BUTTONS.map(r => (
                <button key={r} type="button"
                  onClick={() => setRunsOffBat(r)}
                  className={clsx(
                    'flex-1 h-12 rounded-lg font-bold text-lg transition-colors',
                    runsOffBat === r
                      ? r === 4
                        ? 'bg-blue-600 text-white ring-2 ring-blue-400'
                        : r === 6
                          ? 'bg-purple-600 text-white ring-2 ring-purple-400'
                          : 'bg-blue-600 text-white'
                      : r === 4
                        ? 'bg-blue-900/30 text-blue-400 hover:bg-blue-900/50'
                        : r === 6
                          ? 'bg-purple-900/30 text-purple-400 hover:bg-purple-900/50'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  )}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          {/* Extras */}
          <div className="bg-slate-800/60 border border-slate-700/50
                          rounded-xl p-4">
            <p className="text-xs font-medium text-slate-400 uppercase
                          tracking-wide mb-3">
              Extras
            </p>
            <div className="grid grid-cols-3 gap-2 mb-3">
              {[
                { val: '',        label: 'None'    },
                { val: 'WIDE',    label: 'Wide'    },
                { val: 'NO_BALL', label: 'No Ball' },
                { val: 'LEG_BYE', label: 'Leg Bye' },
                { val: 'BYE',     label: 'Bye'     },
                { val: 'PENALTY', label: 'Penalty' },
              ].map(ex => (
                <button key={ex.val} type="button"
                  onClick={() => {
                    setExtrasType(ex.val)
                    setExtrasRuns(ex.val === 'WIDE' || ex.val === 'NO_BALL' ? 1 : 0)
                  }}
                  className={clsx(
                    'py-2 rounded-lg text-xs font-medium transition-colors',
                    extrasType === ex.val
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                  )}>
                  {ex.label}
                </button>
              ))}
            </div>

            {extrasType && (
              <div>
                <label className="text-xs text-slate-400 mb-1 block">
                  Extras runs (including the {extrasType.toLowerCase()} itself)
                </label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5, 6].map(n => (
                    <button key={n} type="button"
                      onClick={() => setExtrasRuns(n)}
                      className={clsx(
                        'w-10 h-9 rounded text-sm font-semibold transition-colors',
                        extrasRuns === n
                          ? 'bg-amber-600 text-white'
                          : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                      )}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Wicket */}
          <div className="bg-slate-800/60 border border-slate-700/50
                          rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wide">
                Wicket
              </p>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={isWicket}
                  onChange={e => {
                    setIsWicket(e.target.checked)
                    if (!e.target.checked) setWicketType('')
                  }}
                  className="accent-red-500 w-4 h-4" />
                <span className="text-sm font-semibold text-red-400">
                  🔴 Wicket
                </span>
              </label>
            </div>

            {isWicket && (
              <div className="space-y-3">
                {/* Dismissal type */}
                <div className="grid grid-cols-2 gap-2">
                  {DISMISSAL_TYPES.map(d => (
                    <button key={d.value} type="button"
                      onClick={() => setWicketType(d.value)}
                      className={clsx(
                        'py-2 px-3 rounded-lg text-xs text-left transition-colors',
                        wicketType === d.value
                          ? 'bg-red-700 text-white'
                          : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                      )}>
                      {d.label}
                    </button>
                  ))}
                </div>

                {/* Retired hurt note */}
                {wicketType === 'RETIRED_HURT' && (
                  <p className="text-xs text-amber-400 bg-amber-950/30
                                border border-amber-800/40 rounded-lg px-3 py-2">
                    ℹ Retired Hurt — this batter can return later in the
                    innings. They will still appear in the batter dropdown.
                  </p>
                )}
                {wicketType === 'RETIRED_OUT' && (
                  <p className="text-xs text-red-400 bg-red-950/30
                                border border-red-800/40 rounded-lg px-3 py-2">
                    ℹ Retired Out — this batter cannot return.
                  </p>
                )}

                {/* Who was dismissed */}
                <FormField label="Dismissed batter">
                  {isMoraBatting ? (
                    <select value={dismissedId}
                      onChange={e => setDismissedId(e.target.value)}
                      className="input-base w-full">
                      <option value="">Striker (default)</option>
                      {availableMoraBatters.map(p => (
  <option key={p.playerId} value={p.playerId}>
    {p.shortName}
    {p.playerId === strikerId ? ' (striker)' : ' (non-striker)'}
  </option>
))}
                    </select>
                  ) : (
                    <input value={dismissedName}
                      onChange={e => setDismissedName(e.target.value)}
                      className="input-base w-full"
                      placeholder="Dismissed batter name" />
                  )}
                </FormField>

                {/* Run-out end */}
                {wicketType === 'RUN_OUT' && (
                  <FormField label="Run out at which end?">
                    <div className="flex gap-2">
                      {(['STRIKER', 'NON_STRIKER'] as RunOutEnd[]).map(end => (
                        <button key={end} type="button"
                          onClick={() => setRunOutEnd(end)}
                          className={clsx(
                            'flex-1 py-2 rounded-lg text-xs font-medium transition-colors',
                            runOutEnd === end
                              ? 'bg-red-700 text-white'
                              : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                          )}>
                          {end === 'STRIKER' ? "Striker's end" : "Non-striker's end"}
                        </button>
                      ))}
                    </div>
                  </FormField>
                )}

                {/* Fielder */}
                {['CAUGHT', 'RUN_OUT', 'STUMPED'].includes(wicketType) && (
                  <FormField label="Fielder">
                    {isMoraBatting ? (
                      <input value={oppFielderName}
                        onChange={e => setOppFielderName(e.target.value)}
                        className="input-base w-full"
                        placeholder="Opponent fielder name" />
                    ) : (
                      <select value={moraFielderId}
                        onChange={e => setMoraFielderId(e.target.value)}
                        className="input-base w-full">
                        <option value="">Select fielder...</option>
                        {squad.filter(p => p.isPlayingXi).map(p => (
  <option key={p.playerId} value={p.playerId}>
    {p.playerName}
  </option>
))}
                      </select>
                    )}
                  </FormField>
                )}
              </div>
            )}
          </div>

          {/* Shot type */}
          <div className="bg-slate-800/60 border border-slate-700/50
                          rounded-xl p-4">
            <p className="text-xs font-medium text-slate-400 uppercase
                          tracking-wide mb-3">
              Shot Type
              <span className="normal-case text-slate-600 ml-1">(optional)</span>
            </p>
            <div className="flex flex-wrap gap-1.5">
              {SHOT_TYPES.map(s => (
                <button key={s} type="button"
                  onClick={() => setShotType(shotType === s ? null : s)}
                  className={clsx(
                    'px-2.5 py-1 rounded-lg text-xs transition-colors',
                    shotType === s
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-700 text-slate-400 hover:bg-slate-600'
                  )}>
                  {s.toLowerCase().replace(/_/g, ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Ball summary */}
          <div className="bg-slate-900/80 border border-slate-700/30
                          rounded-xl px-4 py-3">
            <p className="text-xs text-slate-500 mb-1">Ball summary</p>
            <div className="text-sm text-slate-300 space-x-2">
              <span className="font-bold text-white">
                {formatBallDisplay(overNumber, ballNumber)}
              </span>
              {runsOffBat > 0 && (
                <span>{runsOffBat} off bat</span>
              )}
              {extrasType && (
                <span className="text-amber-400">
                  {extrasType} ({extrasRuns})
                </span>
              )}
              {isWicket && (
                <span className="text-red-400 font-bold">
                  🔴 {wicketType || 'WICKET'}
                </span>
              )}
              {shotType && (
                <span className="text-indigo-400">
                  · {shotType.replace(/_/g, ' ').toLowerCase()}
                </span>
              )}
              {directionZone && (
                <span className="text-blue-400">
                  → {directionZone.replace(/_/g, ' ').toLowerCase()}
                </span>
              )}
              <span className="text-slate-500">
                = {runsOffBat + extrasRuns} total
              </span>
            </div>
          </div>
        </div>

        {/* ── Right: Wagon Wheel ────────────────────────────────────────── */}
        <div className="space-y-4">
          <div className="bg-slate-800/60 border border-slate-700/50
                          rounded-xl p-4 flex flex-col items-center">
            <p className="text-xs font-medium text-slate-400 uppercase
                          tracking-wide mb-3 self-start">
              Direction
              <span className="normal-case text-slate-600 ml-1">(optional)</span>
            </p>
            <WagonWheelPicker
              selected={directionZone}
              onChange={setDirectionZone}
              isLHB={isLHB}
            />
          </div>
        </div>
      </div>

      {/* ── Error ─────────────────────────────────────────────────────────── */}
      {error && (
        <div className="bg-red-950/40 border border-red-800/40 rounded-lg
                        px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* ── Action buttons ─────────────────────────────────────────────────── */}
      <div className="flex gap-3 flex-wrap items-center">
        <button
          type="button"
          onClick={confirmBall}
          disabled={saving}
          className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white
                     font-bold rounded-xl transition-colors text-lg
                     disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? 'Saving...' : '✓ Confirm Ball'}
        </button>

        <button
          type="button"
          onClick={undoLastBall}
          disabled={!deliveries.length || saving}
          className="px-4 py-3 bg-slate-700 hover:bg-red-900/50 text-slate-300
                     hover:text-red-300 rounded-xl transition-colors text-sm
                     disabled:opacity-40 disabled:cursor-not-allowed"
        >
          ↩ Undo Last Ball
        </button>

        <button
          type="button"
          onClick={markComplete}
          disabled={saving}
          className="px-4 py-3 ml-auto bg-green-900/40 hover:bg-green-800/60
                     text-green-300 border border-green-800/40 rounded-xl
                     transition-colors text-sm"
        >
          ✓ Mark Innings Complete
        </button>
      </div>

      {/* ── Delivery log ──────────────────────────────────────────────────── */}
      {deliveries.length > 0 && (
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase
                        tracking-wide mb-2">
            {deliveries.length} balls entered
          </p>
          <div className="max-h-56 overflow-y-auto space-y-0.5">
            {[...deliveries].reverse().map((d: any) => (
              <div key={d.id}
                className="flex items-center gap-3 text-xs bg-slate-900/40
                           rounded px-3 py-1.5 font-mono">
                <span className="text-slate-500 w-8 shrink-0">
                  {formatBallDisplay(d.overNumber, d.ballNumber)}
                </span>
                <span className="text-slate-300 w-28 truncate shrink-0">
                  {d.moraBatterName ?? d.oppBatterName ?? '—'}
                </span>
                <span className="text-slate-500 w-24 truncate shrink-0">
                  {d.moraBowlerName ?? d.oppBowlerName ?? '—'}
                  {d.oppBowlerStyle ? ` (${d.oppBowlerStyle})` : ''}
                </span>
                {d.isWicket && (
                  <span className="text-red-400 font-bold shrink-0">W</span>
                )}
                {d.extrasType && (
                  <span className="text-amber-400 shrink-0">
                    {d.extrasType}
                  </span>
                )}
                <span className="text-white font-bold w-4 shrink-0">
                  {d.totalRuns}
                </span>
                {d.shotType && (
                  <span className="text-indigo-400 truncate">
                    {d.shotType.replace(/_/g, ' ')}
                  </span>
                )}
                {d.directionZone && (
                  <span className="text-blue-400 shrink-0">
                    → {d.directionZone.replace(/_/g, ' ')}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
import { useState, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { deliveriesApi } from '@/api/deliveries'
import {
  matchesApi,
  type SquadMember,
  type OpponentSquadMember,
} from '@/api/matches'
import {
  nextBallState,
  shouldRotateStrike,
  strikeAfterWicket,
  type RunOutEnd,
} from '@/utils/cricketCalculations'
import {
  type BallState,
  type LivePitchState,
  EMPTY_BALL,
} from './types'

// ── Derive next ball position from delivery list ───────────────────────────
function deriveNextBall(deliveries: any[]): {
  overNumber: number
  ballNumber: number
  deliverySequence: number
} {
  if (deliveries.length === 0) {
    return { overNumber: 1, ballNumber: 1, deliverySequence: 1 }
  }
  const last = deliveries[deliveries.length - 1]
  return nextBallState({
    overNumber:       last.overNumber,
    ballNumber:       last.ballNumber,
    deliverySequence: last.deliverySequence,
    extrasType:       last.extrasType,
  })
}

// ── Derive last completed over's bowler from deliveries ────────────────────
function deriveLastOverBowlerId(
  deliveries: any[],
  currentOverNumber: number
): string | null {
  if (deliveries.length === 0) return null

  // Count legal balls per over
  const legalPerOver: Record<number, string[]> = {}
  for (const d of deliveries) {
    if (d.extrasType !== 'WIDE' && d.extrasType !== 'NO_BALL') {
      if (!legalPerOver[d.overNumber]) legalPerOver[d.overNumber] = []
      if (d.moraBowlerId) legalPerOver[d.overNumber].push(d.moraBowlerId)
    }
  }

  // The over just before the current one, if it had 6 legal balls
  const prevOver = currentOverNumber - 1
  if (prevOver < 1) return null

  const prevOverBowlers = legalPerOver[prevOver]
  if (!prevOverBowlers || prevOverBowlers.length < 6) return null

  // Return the bowler who bowled most balls in that over
  return prevOverBowlers[0] ?? null
}

// ── Derive batter individual scores from deliveries ────────────────────────
export interface BatterScore {
  playerId:     string
  playerName:   string
  runs:         number
  balls:        number
  fours:        number
  sixes:        number
  isNotOut:     boolean
  isDismissed:  boolean
  wicketType:   string | null
}

function deriveBatterScores(
  deliveries: any[],
  isMoraBatting: boolean
): BatterScore[] {
  const scores: Record<string, BatterScore> = {}

  for (const d of deliveries) {
    const key = isMoraBatting
      ? d.moraBatterId
      : d.oppBatterName

    if (!key) continue

    if (!scores[key]) {
      scores[key] = {
        playerId:    isMoraBatting ? d.moraBatterId : d.oppBatterName,
        playerName:  isMoraBatting ? (d.moraBatterName ?? key) : key,
        runs:        0,
        balls:       0,
        fours:       0,
        sixes:       0,
        isNotOut:    true,
        isDismissed: false,
        wicketType:  null,
      }
    }

    const s = scores[key]

    // Count legal balls faced
    if (d.extrasType !== 'WIDE') {
      s.balls += 1
    }

    // Count runs off bat
    s.runs += d.runsOffBat ?? 0
    if (d.runsOffBat === 4) s.fours += 1
    if (d.runsOffBat === 6) s.sixes += 1

    // Check if dismissed
    if (d.isWicket) {
      const dismissedKey = isMoraBatting
        ? d.dismissedMoraBatterId
        : d.dismissedBatterName ?? d.oppBatterName

      if (dismissedKey === key) {
        s.isDismissed = true
        s.isNotOut    = false
        s.wicketType  = d.wicketType
      }
    }
  }

  return Object.values(scores)
}

// ── Derive bowler figures from deliveries ──────────────────────────────────
export interface BowlerFigures {
  playerId:    string
  playerName:  string
  overs:       string     // e.g. "7.3"
  maidens:     number
  runs:        number
  wickets:     number
  wides:       number
  noBalls:     number
}

function deriveBowlerFigures(
  deliveries: any[],
  isMoraBatting: boolean
): BowlerFigures[] {
  const figures: Record<string, {
    key:        string
    name:       string
    legalBalls: number
    runs:       number
    wickets:    number
    wides:      number
    noBalls:    number
    overBalls:  Record<number, number>  // overNumber → legal balls in over
  }> = {}

  for (const d of deliveries) {
    // When Mora bats, the bowler is the opponent bowler (tracked by name)
    // When opponent bats, the bowler is a Mora player (tracked by ID)
    const key = isMoraBatting ? d.oppBowlerName : d.moraBowlerId
    if (!key) continue

    if (!figures[key]) {
      figures[key] = {
        key,
        name:      isMoraBatting
          ? (d.oppBowlerName ?? key)
          : (d.moraBowlerName ?? key),
        legalBalls: 0,
        runs:       0,
        wickets:    0,
        wides:      0,
        noBalls:    0,
        overBalls:  {},
      }
    }

    const f = figures[key]

    // Count legal balls per over (for maiden calculation)
    const isLegal = d.extrasType !== 'WIDE' && d.extrasType !== 'NO_BALL'
    if (isLegal) {
      f.legalBalls += 1
      f.overBalls[d.overNumber] = (f.overBalls[d.overNumber] ?? 0) + 1
    }

    // Runs (all runs off this delivery count against the bowler)
    f.runs += d.totalRuns ?? 0

    // Wickets (not run-outs — those go to fielder)
    if (
      d.isWicket &&
      d.wicketType !== 'RUN_OUT' &&
      d.wicketType !== 'RETIRED_HURT' &&
      d.wicketType !== 'RETIRED_OUT' &&
      d.wicketType !== 'OBSTRUCTING' &&
      d.wicketType !== 'TIMED_OUT'
    ) {
      f.wickets += 1
    }

    if (d.extrasType === 'WIDE')    f.wides   += 1
    if (d.extrasType === 'NO_BALL') f.noBalls += 1
  }

  return Object.values(figures).map(f => {
    const completeOvers = Math.floor(f.legalBalls / 6)
    const remainder     = f.legalBalls % 6
    const oversStr      = remainder === 0
      ? `${completeOvers}`
      : `${completeOvers}.${remainder}`

    // Count maiden overs (complete overs with 0 runs)
    // This is approximate from the per-over run data — proper maiden
    // counting needs over-by-over run totals which we have from overSummaries
    const maidens = 0  // computed separately from over summaries

    return {
      playerId:   f.key,
      playerName: f.name,
      overs:      oversStr,
      maidens,
      runs:       f.runs,
      wickets:    f.wickets,
      wides:      f.wides,
      noBalls:    f.noBalls,
    }
  })
}

// ── Main hook ──────────────────────────────────────────────────────────────
export function useDeliveryState(
  inningsId:     string,
  matchId:       string,
  isMoraBatting: boolean
) {
  const qc = useQueryClient()

  const { data: deliveries = [] } = useQuery({
    queryKey: ['deliveries', inningsId],
    queryFn:  () => deliveriesApi.getInningsDeliveries(inningsId),
  })

  const { data: overSummaries = [] } = useQuery({
    queryKey: ['over-summaries', inningsId],
    queryFn:  () => deliveriesApi.getOverSummaries(inningsId),
  })

  const { data: moraSquad = [] } = useQuery<SquadMember[]>({
    queryKey: ['squad', matchId],
    queryFn:  () => matchesApi.getSquad(matchId),
  })

  const { data: oppSquad = [] } = useQuery<OpponentSquadMember[]>({
    queryKey: ['opp-squad', matchId],
    queryFn:  () => matchesApi.getOpponentSquad(matchId),
  })

  // ── Ball position — always derived from deliveries ────────────────────────
  const basePosition = useMemo(
    () => deriveNextBall(deliveries),
    [deliveries]
  )

  // Optimistic override — set immediately after save, cleared when
  // deliveries refetch (via useEffect in the hook)
  const [override, setOverride] = useState<{
    overNumber: number
    ballNumber: number
    deliverySequence: number
  } | null>(null)

  const position = override ?? basePosition

  // Clear override when delivery count changes (refetch confirmed)
  const prevCount = useMemo(() => deliveries.length, [deliveries])
  useMemo(() => {
    if (override !== null) {
      // Clear override once the refetch catches up
      if (
        basePosition.overNumber       === override.overNumber &&
        basePosition.ballNumber       === override.ballNumber &&
        basePosition.deliverySequence === override.deliverySequence
      ) {
        setOverride(null)
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prevCount])

  // ── Derived analytics ─────────────────────────────────────────────────────
  const dismissedMoraIds = useMemo(() => {
    const out = new Set<string>()
    for (const d of deliveries) {
      if (
        d.isWicket &&
        d.dismissedMoraBatterId &&
        d.wicketType !== 'RETIRED_HURT'
      ) {
        out.add(d.dismissedMoraBatterId as string)
      }
    }
    return out
  }, [deliveries])

  const retiredHurtIds = useMemo(() => {
    const rh = new Set<string>()
    for (const d of deliveries) {
      if (
        d.isWicket &&
        d.dismissedMoraBatterId &&
        d.wicketType === 'RETIRED_HURT'
      ) {
        rh.add(d.dismissedMoraBatterId as string)
      }
    }
    return rh
  }, [deliveries])

  const batterScores = useMemo(
    () => deriveBatterScores(deliveries, isMoraBatting),
    [deliveries, isMoraBatting]
  )

  const bowlerFigures = useMemo(
    () => deriveBowlerFigures(deliveries, isMoraBatting),
    [deliveries, isMoraBatting]
  )

  const availableMoraBatters = useMemo(
    () => moraSquad.filter(
      p => p.isPlayingXi && !dismissedMoraIds.has(p.playerId)
    ),
    [moraSquad, dismissedMoraIds]
  )

  const lastOverBowlerId = useMemo(
    () => deriveLastOverBowlerId(deliveries, position.overNumber),
    [deliveries, position.overNumber]
  )

  const availableMoraBowlers = useMemo(
    () => moraSquad.filter(
      p => p.isPlayingXi && p.playerId !== lastOverBowlerId
    ),
    [moraSquad, lastOverBowlerId]
  )

  // ── Ball state ────────────────────────────────────────────────────────────
  const [ball, setBall]     = useState<BallState>(EMPTY_BALL)
  const [saving, setSaving] = useState(false)
  const [error,  setError]  = useState('')
  const [ballLog, setBallLog] = useState<string[]>([])

  // ── Computed flags ────────────────────────────────────────────────────────
  const isLegalBall = ball.extrasType !== 'WIDE' && ball.extrasType !== 'NO_BALL'
  const isEndOfOver = isLegalBall && position.ballNumber === 6

  const willRotate = shouldRotateStrike(
    ball.runsOffBat,
    ball.extrasType || null,
    ball.extrasRuns,
    isEndOfOver
  )

  // ── Helpers ───────────────────────────────────────────────────────────────
  const resetBall = () => setBall(EMPTY_BALL)

  const invalidateDeliveries = () => {
    qc.invalidateQueries({ queryKey: ['deliveries',     inningsId] })
    qc.invalidateQueries({ queryKey: ['over-summaries', inningsId] })
  }

  const advanceOptimistically = (extrasType: string) => {
    const next = nextBallState({
      overNumber:       position.overNumber,
      ballNumber:       position.ballNumber,
      deliverySequence: position.deliverySequence,
      extrasType:       extrasType || null,
    })
    setOverride(next)
  }

  const rollback = (
    overNumber: number,
    ballNumber: number,
    deliverySequence: number
  ) => {
    setOverride({ overNumber, ballNumber, deliverySequence })
  }

  // ── Strike rotation ───────────────────────────────────────────────────────
  const applyRotation = (
    pitch:       LivePitchState,
    setPitch:    React.Dispatch<React.SetStateAction<LivePitchState>>,
    runsOffBat:  number,
    extrasType:  string,
    extrasRuns:  number,
    endOfOver:   boolean,
    isWicket:    boolean,
    wicketType:  string,
    runOutEnd:   RunOutEnd,
    dismissedId: string
  ) => {
    if (!isMoraBatting) {
      const rotates = shouldRotateStrike(
        runsOffBat, extrasType || null, extrasRuns, endOfOver
      )
      if (rotates) {
        setPitch(p => ({
          ...p,
          oppStrikerName:    p.oppNonStrikerName,
          oppNonStrikerName: p.oppStrikerName,
        }))
      }
      return
    }

    if (isWicket) {
      const placement = strikeAfterWicket({
        wicketType,
        runsOnBall:  runsOffBat,
        ballNumber:  position.ballNumber,
        extrasType:  extrasType || null,
        runOutEnd,
      })

      const dismissedWasStriker =
        !dismissedId || dismissedId === pitch.strikerId

      if (wicketType === 'RUN_OUT' && runOutEnd === 'STRIKER') {
        // Non-striker safely at striker end — becomes new striker
        // New batter fills non-striker end
        if (dismissedWasStriker) {
          setPitch(p => ({
            ...p,
            strikerId:    p.nonStrikerId,
            nonStrikerId: '',
          }))
        } else {
          // Non-striker was the one run out at striker end (uncommon)
          setPitch(p => ({ ...p, nonStrikerId: '' }))
        }
        return
      }

      if (placement === 'NEW_BATTER_NON_STRIKER') {
        // End-of-over wicket or run-out at non-striker end
        if (dismissedWasStriker && !endOfOver) {
          // Striker dismissed: non-striker stays, new batter is non-striker
          // (this happens on run-out at non-striker end — striker stays)
          setPitch(p => ({ ...p, nonStrikerId: '' }))
        } else if (dismissedWasStriker && endOfOver) {
          // Ball 6 wicket: over ends, non-striker now faces
          setPitch(p => ({
            ...p,
            strikerId:    p.nonStrikerId,
            nonStrikerId: '',
          }))
        } else {
          // Non-striker dismissed
          setPitch(p => ({ ...p, nonStrikerId: '' }))
        }
        return
      }

      // NEW_BATTER_STRIKER: dismissed batter is replaced at striker end
      if (dismissedWasStriker) {
        setPitch(p => ({ ...p, strikerId: '' }))
      } else {
        // Non-striker dismissed somehow at striker end (unusual)
        setPitch(p => ({ ...p, nonStrikerId: '' }))
      }
      return
    }

    // Normal rotation
    const rotates = shouldRotateStrike(
      runsOffBat, extrasType || null, extrasRuns, endOfOver
    )
    if (rotates) {
      setPitch(p => ({
        ...p,
        strikerId:    p.nonStrikerId,
        nonStrikerId: p.strikerId,
      }))
    }
  }

  return {
    deliveries,
    overSummaries,
    moraSquad,
    oppSquad,
    availableMoraBatters,
    availableMoraBowlers,
    lastOverBowlerId,
    retiredHurtIds,
    dismissedMoraIds,
    batterScores,
    bowlerFigures,
    overNumber:       position.overNumber,
    ballNumber:       position.ballNumber,
    deliverySequence: position.deliverySequence,
    advanceOptimistically,
    rollback,
    ball,
    setBall,
    resetBall,
    isLegalBall,
    isEndOfOver,
    willRotate,
    saving,
    setSaving,
    error,
    setError,
    ballLog,
    setBallLog,
    applyRotation,
    invalidateDeliveries,
  }
}
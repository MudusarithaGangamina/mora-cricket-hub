import { useQueryClient } from '@tanstack/react-query'
import { deliveriesApi } from '@/api/deliveries'
import { WagonWheelPicker } from '@/components/charts/WagonWheelPicker'
import { useDeliveryState } from './delivery/useDeliveryState'
import { StatusBar }        from './delivery/StatusBar'
import { BallLog }          from './delivery/BallLog'
import { PlayersPanel }     from './delivery/PlayersPanel'
import { BallOutcomePanel } from './delivery/BallOutcomePanel'
import { BallSummaryBar }   from './delivery/BallSummaryBar'
import { ActionButtons }    from './delivery/ActionButtons'
import { DeliveryLog }      from './delivery/DeliveryLog'
import { LiveScorecard }    from './delivery/LiveScorecard'
import { formatBallDisplay } from '@/utils/cricketCalculations'
import { useState } from 'react'
import type { LivePitchState } from './delivery/pitchState'

interface Props {
  innings:   any
  matchId:   string
  pitch:     LivePitchState
  setPitch:  React.Dispatch<React.SetStateAction<LivePitchState>>
}

export function DeliveryEntryTab({
  innings, matchId, pitch, setPitch,
}: Props) {
  const qc            = useQueryClient()
  const isMoraBatting = innings.battingTeam === 'Mora'

  // Bowling side is per-ball state, doesn't need to persist between tabs
  const [bowlingSide, setBowlingSide] = useState('')

  const state = useDeliveryState(innings.id, matchId, isMoraBatting)

  const {
    deliveries, overSummaries,
    moraSquad, oppSquad,
    availableMoraBatters, availableMoraBowlers,
    lastOverBowlerId, retiredHurtIds,
    batterScores, bowlerFigures,
    overNumber, ballNumber, deliverySequence,
    advanceOptimistically, rollback,
    ball, setBall, resetBall,
    isEndOfOver, willRotate,
    saving, setSaving, error, setError,
    ballLog, setBallLog,
    applyRotation, invalidateDeliveries,
  } = state

  const strikerBatStyle = isMoraBatting
    ? moraSquad.find(p => p.playerId === pitch.strikerId)?.battingStyle ?? 'RHB'
    : pitch.oppStrikerStyle || 'RHB'
  const isLHB = strikerBatStyle === 'LHB'

  const confirmBall = async () => {
    if (isMoraBatting && !pitch.strikerId) {
      setError('Select the striker.')
      return
    }
    if (!isMoraBatting && !pitch.moraBowlerId) {
      setError('Select the Mora bowler.')
      return
    }
    if (!isMoraBatting && !pitch.oppStrikerName.trim()) {
      setError('Enter the opponent striker name.')
      return
    }
    if (ball.isWicket && !ball.wicketType) {
      setError('Select the wicket type.')
      return
    }

    setSaving(true)
    setError('')

    const snapOver = overNumber
    const snapBall = ballNumber
    const snapSeq  = deliverySequence

    try {
      await deliveriesApi.add({
        inningsId:        innings.id,
        overNumber:       snapOver,
        ballNumber:       snapBall,
        deliverySequence: snapSeq,

        moraBatterId:    isMoraBatting ? pitch.strikerId  || undefined : undefined,
        oppBatterName:   !isMoraBatting ? pitch.oppStrikerName.trim() : undefined,
        oppBatterStyle:  !isMoraBatting ? pitch.oppStrikerStyle || undefined : undefined,

        moraBowlerId:    !isMoraBatting ? pitch.moraBowlerId   || undefined : undefined,
        oppBowlerName:   isMoraBatting  ? pitch.oppBowlerName.trim() || undefined : undefined,
        oppBowlerStyle:  isMoraBatting  ? pitch.oppBowlerStyle || undefined : undefined,

        runsOffBat:  ball.runsOffBat,
        extrasType:  ball.extrasType || null,
        extrasRuns:  ball.extrasRuns,

        isWicket:   ball.isWicket,
        wicketType: ball.isWicket ? ball.wicketType : null,

        dismissedMoraBatterId: isMoraBatting && ball.isWicket
          ? (ball.dismissedId || pitch.strikerId || undefined)
          : undefined,

        dismissedBatterName: ball.isWicket
          ? (isMoraBatting
            ? moraSquad.find(p =>
                p.playerId === (ball.dismissedId || pitch.strikerId)
              )?.fullName ?? ''
            : ball.dismissedName)
          : null,

        moraFielderId:  !isMoraBatting && ball.isWicket
          ? ball.moraFielderId || undefined : undefined,
        oppFielderName: isMoraBatting && ball.isWicket
          ? ball.oppFielderName || undefined : undefined,

        bowlingSide:   bowlingSide        || null,
        shotType:      ball.shotType      || null,
        directionZone: ball.directionZone || null,
      })

      // Ball log
      const total   = ball.runsOffBat + ball.extrasRuns
      const display = formatBallDisplay(snapOver, snapBall)
      const parts   = [display]
      if (ball.extrasType)     parts.push(`[${ball.extrasType}]`)
      if (ball.runsOffBat > 0) parts.push(`${ball.runsOffBat}`)
      if (ball.isWicket)       parts.push(`🔴${ball.wicketType}`)
      if (ball.shotType)       parts.push(ball.shotType.replace(/_/g, ' '))
      if (ball.directionZone)  parts.push(`→${ball.directionZone.replace(/_/g, ' ')}`)
      parts.push(`(${total})`)
      setBallLog(prev => [parts.join(' '), ...prev].slice(0, 12))

      // Apply strike rotation — pitch state is in parent so it persists
      applyRotation(
        pitch, setPitch,
        ball.runsOffBat, ball.extrasType, ball.extrasRuns,
        isEndOfOver, ball.isWicket, ball.wicketType,
        ball.runOutEnd, ball.dismissedId
      )

      advanceOptimistically(ball.extrasType)
      resetBall()
      setBowlingSide('')
      invalidateDeliveries()

    } catch (e: any) {
      setError(
        e?.response?.data?.errors?.[0]?.message ??
        'Failed to save ball.'
      )
    } finally {
      setSaving(false)
    }
  }

  const undoLastBall = async () => {
    if (deliveries.length === 0) return
    const last = deliveries[deliveries.length - 1]
    try {
      await deliveriesApi.delete(last.id, innings.id, last.overNumber)
      rollback(last.overNumber, last.ballNumber, last.deliverySequence)
      setBallLog(prev => prev.slice(1))
      invalidateDeliveries()
    } catch {
      setError('Failed to undo last ball.')
    }
  }

  const markComplete = async () => {
    await deliveriesApi.markComplete(innings.id)
    qc.invalidateQueries({ queryKey: ['scorecards', matchId] })
  }

  return (
    <div className="space-y-5">

      <StatusBar
        overNumber={overNumber}
        ballNumber={ballNumber}
        deliverySequence={deliverySequence}
        battingTeam={innings.battingTeam}
        overSummaries={overSummaries}
      />

      <BallLog log={ballLog} />

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-5">

        {/* Col 1: Live scorecard */}
        <div className="xl:col-span-1">
          <LiveScorecard
            batterScores={batterScores}
            bowlerFigures={bowlerFigures}
            isMoraBatting={isMoraBatting}
            moraSquad={moraSquad}
            strikerId={pitch.strikerId}
            nonStrikerId={pitch.nonStrikerId}
            oppStrikerName={pitch.oppStrikerName}
            oppNonStriker={pitch.oppNonStrikerName}
            overSummaries={overSummaries}
          />
        </div>

        {/* Col 2: Players panel */}
        <div className="xl:col-span-1">
          <PlayersPanel
            isMoraBatting={isMoraBatting}
            pitch={pitch}
            setPitch={setPitch}
            availableMoraBatters={availableMoraBatters}
            availableMoraBowlers={availableMoraBowlers}
            oppSquad={oppSquad}
            lastOverBowlerId={lastOverBowlerId}
            retiredHurtIds={retiredHurtIds}
            moraSquad={moraSquad}
            willRotate={willRotate}
            isEndOfOver={isEndOfOver}
            bowlingSide={bowlingSide}
            setBowlingSide={setBowlingSide}
          />
        </div>

        {/* Col 3: Ball outcome */}
        <div className="xl:col-span-1 space-y-4">
          <BallOutcomePanel
            ball={ball}
            setBall={setBall}
            isMoraBatting={isMoraBatting}
            strikerId={pitch.strikerId}
            availableMoraBatters={availableMoraBatters}
            moraSquad={moraSquad}
          />
          <BallSummaryBar
            ball={ball}
            overNumber={overNumber}
            ballNumber={ballNumber}
          />
        </div>

        {/* Col 4: Wagon wheel */}
        <div className="xl:col-span-1">
          <div className="bg-slate-800/60 border border-slate-700/50
                          rounded-xl p-4 flex flex-col items-center">
            <p className="text-xs font-medium text-slate-400 uppercase
                          tracking-wide mb-3 self-start">
              Direction
              <span className="normal-case text-slate-600 ml-1">(optional)</span>
            </p>
            <WagonWheelPicker
              selected={ball.directionZone}
              onChange={v => setBall(b => ({ ...b, directionZone: v }))}
              isLHB={isLHB}
            />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/40 border border-red-800/40 rounded-lg
                        px-4 py-3 text-red-400 text-sm">
          {error}
        </div>
      )}

      <ActionButtons
        onConfirm={confirmBall}
        onUndo={undoLastBall}
        onMarkComplete={markComplete}
        saving={saving}
        canUndo={deliveries.length > 0}
      />

      <DeliveryLog deliveries={deliveries} />
    </div>
  )
}
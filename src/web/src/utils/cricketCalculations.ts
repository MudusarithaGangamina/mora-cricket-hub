/**
 * Format ball display — cricket uses 0-based over display
 * Internal over 1 ball 1 → displays as "0.1"
 * Internal over 2 ball 1 → displays as "1.1"
 */
export function formatBallDisplay(
  overNumber: number,
  ballNumber: number
): string {
  return `${overNumber - 1}.${ballNumber}`
}

export function formatOversFromBalls(legalBalls: number): string {
  const completeOvers = Math.floor(legalBalls / 6)
  const remainder     = legalBalls % 6
  return remainder === 0
    ? `${completeOvers}`
    : `${completeOvers}.${remainder}`
}

/**
 * Given the last saved delivery, compute what the NEXT ball should be
 */
export function nextBallState(last: {
  overNumber:       number
  ballNumber:       number
  deliverySequence: number
  extrasType:       string | null
}): { overNumber: number; ballNumber: number; deliverySequence: number } {
  const isLegal =
    last.extrasType !== 'WIDE' && last.extrasType !== 'NO_BALL'

  if (isLegal && last.ballNumber === 6) {
    return {
      overNumber:       last.overNumber + 1,
      ballNumber:       1,
      deliverySequence: last.deliverySequence + 1,
    }
  }
  if (isLegal) {
    return {
      overNumber:       last.overNumber,
      ballNumber:       last.ballNumber + 1,
      deliverySequence: last.deliverySequence + 1,
    }
  }
  // Wide or no-ball: ball number does NOT advance, sequence does
  return {
    overNumber:       last.overNumber,
    ballNumber:       last.ballNumber,
    deliverySequence: last.deliverySequence + 1,
  }
}

/**
 * Strike rotation rules — returns true if striker/non-striker swap
 *
 * WIDE:
 *   - Standard wide (1 extra):              NO rotation
 *   - Wide + 1 run overthrow (2 extras):    YES rotation
 *   - Wide + 3 run overthrow (4 extras):    YES rotation
 *   Rule: rotate when extrasRuns is even (2 or 4) — the batters
 *   ran an ODD number of actual runs (1 or 3) between the wickets
 *
 * NO BALL:
 *   - 0 off bat, 0 extras (just no-ball):   NO rotation
 *     (A no-ball with 0 runs means nobody ran — no rotation)
 *   - 0 off bat, 1 bye (no-ball bye):       NO rotation
 *     (1 bye — odd — but batter did not hit it, use byes logic)
 *   - 0 off bat, 3 byes:                    YES rotation (3 is odd)
 *   - 1 off bat, 0 extra:                   YES rotation (1 is odd off bat)
 *   - 2 off bat, 0 extra:                   NO rotation
 *   - 3 off bat, 0 extra:                   YES rotation
 *   Rule for no-ball: if runs off bat > 0, rotate on odd runs off bat.
 *   If runs off bat = 0, rotate on odd extra runs (byes/leg-byes).
 *
 * LEG BYE / BYE:
 *   - Rotate on odd EXTRA runs (batter did not hit it)
 *   - Runs off bat is always 0 on a bye/leg-bye anyway
 *
 * PENALTY: never rotates
 *
 * NORMAL: odd runs off bat rotates
 *
 * END OF OVER: ALWAYS rotates regardless of runs on last ball
 */
export function shouldRotateStrike(
  runsOffBat:  number,
  extrasType:  string | null,
  extrasRuns:  number,
  isEndOfOver: boolean
): boolean {
  // End of over always rotates — this takes priority over everything
  if (isEndOfOver) return true

  switch (extrasType) {
    case 'WIDE': {
      // Standard wide = 1 extra. extrasRuns = 1 → no rotate
      // Wide + overthrow run = 2 extras → rotate (batters ran 1 odd run)
      // Wide + 3 overthrow = 4 extras → rotate (batters ran 3 odd runs)
      // Total extras is always (1 + actual runs batters ran)
      const actualRunsRan = extrasRuns - 1
      return actualRunsRan > 0 && actualRunsRan % 2 === 1
    }

    case 'NO_BALL': {
      // No-ball with runs off bat: treat like normal ball
      if (runsOffBat > 0) return runsOffBat % 2 === 1
      // No-ball with 0 off bat: rotate on odd extra runs (byes)
      // No-ball itself = 1 extra, so extrasRuns includes the no-ball penalty
      // extrasRuns = 1 means just the no-ball, 0 actual runs → no rotate
      const byeRuns = extrasRuns - 1  // subtract the no-ball penalty run
      return byeRuns > 0 && byeRuns % 2 === 1
    }

    case 'LEG_BYE':
    case 'BYE':
      return extrasRuns % 2 === 1

    case 'PENALTY':
      return false

    default:
      // Normal delivery
      return runsOffBat % 2 === 1
  }
}

export type RunOutEnd = 'STRIKER' | 'NON_STRIKER'

/**
 * After a wicket, determine where the NEW batter should go
 *
 * Returns 'NEW_BATTER_STRIKER' or 'NEW_BATTER_NON_STRIKER'
 *
 * The key rules:
 *
 * BOWLED / CAUGHT / LBW / HIT_WICKET / STUMPED / OBSTRUCTING / TIMED_OUT:
 *   Ball 1-5: new batter at STRIKER end (same end the batter was at)
 *   Ball 6:   new batter at NON-STRIKER end (over ends, strikers cross)
 *   Note: if batters ran an ODD number before wicket (e.g. hit to boundary
 *   but caught after crossing once), new batter is still at striker end —
 *   the physical crossing does not change which end the new batter fills
 *   (this is the mankad/crossing exception — simplified: new batter always
 *    goes to the end the dismissed batter was occupying AFTER any runs)
 *
 * RUN_OUT at STRIKER end:
 *   Striker out → new batter at STRIKER end
 *   Non-striker who was running is safe at striker end
 *   → effectively non-striker becomes striker, new batter is non-striker
 *   Wait — more precisely:
 *   If dismissed at STRIKER end: non-striker safely made it to striker end
 *   New batter comes to non-striker end (the end the non-striker left)
 *   → NEW_BATTER_NON_STRIKER, existing non-striker is now striker
 *
 * RUN_OUT at NON-STRIKER end:
 *   Non-striker out → new batter at NON-STRIKER end
 *   Striker stays at striker end
 *   → NEW_BATTER_NON_STRIKER, striker stays
 *
 * RETIRED_HURT:
 *   New batter at STRIKER end (unless end of over)
 *   Retired-hurt batter can return later
 *
 * RETIRED_OUT:
 *   Same as retired-hurt for positioning, but cannot return
 */
export function strikeAfterWicket(params: {
  wicketType:   string
  runsOnBall:   number
  ballNumber:   number
  extrasType:   string | null
  runOutEnd:    RunOutEnd
}): 'NEW_BATTER_STRIKER' | 'NEW_BATTER_NON_STRIKER' {
  const { wicketType, ballNumber, extrasType, runOutEnd } = params

  const isEndOfOver =
    ballNumber === 6 &&
    extrasType !== 'WIDE' &&
    extrasType !== 'NO_BALL'

  if (wicketType === 'RUN_OUT') {
    if (runOutEnd === 'STRIKER') {
      // Striker run out: non-striker safely at striker end
      // New batter fills the non-striker end
      return 'NEW_BATTER_NON_STRIKER'
    } else {
      // Non-striker run out: striker stays, new batter is non-striker
      return 'NEW_BATTER_NON_STRIKER'
    }
  }

  // All other wickets
  if (isEndOfOver) {
    // Ball 6 wicket: over ends, batters would have crossed
    // New batter comes in at non-striker end (to face next over)
    return 'NEW_BATTER_NON_STRIKER'
  }

  return 'NEW_BATTER_STRIKER'
}
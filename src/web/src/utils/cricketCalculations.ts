/**
 * Convert internal (1-based) over/ball to cricket display format
 * Internal: overNumber=1, ballNumber=1 → Display: "0.1"
 * Internal: overNumber=2, ballNumber=1 → Display: "1.1"
 * Internal: overNumber=1, ballNumber=6 → Display: "0.6"
 */
export function formatBallDisplay(
  overNumber: number,
  ballNumber: number
): string {
  return `${overNumber - 1}.${ballNumber}`
}

/**
 * Format overs faced for scorecard display
 * e.g. 49 legal deliveries = "8.1" (8 complete overs + 1 ball)
 */
export function formatOversFromBalls(legalBalls: number): string {
  const completeOvers = Math.floor(legalBalls / 6)
  const remainder = legalBalls % 6
  return remainder === 0 ? `${completeOvers}` : `${completeOvers}.${remainder}`
}

/**
 * Parse "0.1" display format back to internal { overNumber, ballNumber }
 */
export function parseBallDisplay(display: string): {
  overNumber: number; ballNumber: number
} {
  const [ov, ball] = display.split('.').map(Number)
  return { overNumber: ov + 1, ballNumber: ball }
}

/**
 * Given the last delivery, compute next ball state
 */
export function nextBallState(lastDelivery: {
  overNumber: number
  ballNumber: number
  deliverySequence: number
  extrasType: string | null
}): { overNumber: number; ballNumber: number; deliverySequence: number } {
  const isLegal =
    lastDelivery.extrasType !== 'WIDE' &&
    lastDelivery.extrasType !== 'NO_BALL'

  if (isLegal && lastDelivery.ballNumber === 6) {
    return {
      overNumber:      lastDelivery.overNumber + 1,
      ballNumber:      1,
      deliverySequence: lastDelivery.deliverySequence + 1,
    }
  }
  if (isLegal) {
    return {
      overNumber:      lastDelivery.overNumber,
      ballNumber:      lastDelivery.ballNumber + 1,
      deliverySequence: lastDelivery.deliverySequence + 1,
    }
  }
  // Wide or no-ball — ball number does NOT advance
  return {
    overNumber:      lastDelivery.overNumber,
    ballNumber:      lastDelivery.ballNumber,
    deliverySequence: lastDelivery.deliverySequence + 1,
  }
}

/**
 * Strike rotation rules — returns true if striker and non-striker swap
 *
 * Rules:
 * - Normal ball: odd runs off bat rotate
 * - Wide: rotate only if extras runs are 2 or 4 (batters crossed while
 *   fielder chased an overthrow)
 * - No-ball: odd runs off bat rotate. If no runs off bat, odd bye/leg-bye
 *   extras rotate
 * - Leg-bye / Bye: the extras runs determine rotation (odd = rotate),
 *   NOT runs off bat (batter didn't hit it)
 * - Penalty: never rotates
 * - End of over: ALWAYS rotates regardless of runs on last ball
 * - Run-out: see handleRunOut() — separate logic
 */
export function shouldRotateStrike(
  runsOffBat: number,
  extrasType: string | null,
  extrasRuns: number,
  isEndOfOver: boolean
): boolean {
  // End of over always rotates
  if (isEndOfOver) return true

  switch (extrasType) {
    case 'WIDE':
      // Rotate only on 2 or 4 wide extras (batters ran)
      return extrasRuns === 2 || extrasRuns === 4

    case 'NO_BALL':
      // Runs off bat on no-ball rotate like normal
      if (runsOffBat > 0) return runsOffBat % 2 === 1
      // No runs off bat — bye/leg-bye extras on no-ball
      return extrasRuns % 2 === 1

    case 'LEG_BYE':
    case 'BYE':
      // Extras runs determine rotation — batter didn't hit it
      return extrasRuns % 2 === 1

    case 'PENALTY':
      return false

    default:
      // Normal ball — odd runs off bat
      return runsOffBat % 2 === 1
  }
}

/**
 * After a wicket, determine who is on strike for the NEXT ball
 *
 * Cases:
 * - Batsman out (bowled/caught/lbw/hit-wicket/stumped/obstructing/timed-out):
 *     New batter comes in at STRIKER end (same end as dismissed batter)
 *     UNLESS the delivery was on ball 6 of an over — then new batter
 *     is at non-striker end for the next over
 * - Run out at striker's end:
 *     New batter comes in at STRIKER end
 *     Strike does NOT rotate (non-striker stays non-striker)
 * - Run out at non-striker's end:
 *     Non-striker is out, new batter is at NON-STRIKER end
 *     Striker stays on strike
 * - Retired out:
 *     Same as bowled — new batter at striker end
 *     (retired-out batter cannot return)
 * - Retired hurt:
 *     New batter at striker end, but retired-hurt batter
 *     CAN come back at any point (tracked separately)
 */
export type RunOutEnd = 'STRIKER' | 'NON_STRIKER'

export function strikeAfterWicket(
  wicketType: string,
  runsOnBall: number,  // runs off bat (determines if batters crossed)
  ballNumber: number,
  extrasType: string | null,
  runOutEnd?: RunOutEnd // only for RUN_OUT
): 'NEW_BATTER_STRIKER' | 'NEW_BATTER_NON_STRIKER' {
  const isEndOfOver =
    ballNumber === 6 &&
    extrasType !== 'WIDE' &&
    extrasType !== 'NO_BALL'

  if (wicketType === 'RUN_OUT') {
    if (runOutEnd === 'NON_STRIKER') {
      // Non-striker out — striker stays, new batter at non-striker end
      return 'NEW_BATTER_NON_STRIKER'
    }
    // Striker out — new batter faces next ball at striker end
    return 'NEW_BATTER_STRIKER'
  }

  if (wicketType === 'RETIRED_HURT') {
    // Retired hurt — new batter at striker end
    // Retired hurt batter can return (handled in UI state separately)
    return 'NEW_BATTER_STRIKER'
  }

  // All other dismissals (bowled, caught, lbw, etc.)
  // If batters crossed before catch (odd runs before wicket)
  // the non-striker is now at striker end — but the NEW batter
  // still comes in at the vacant end (which is now striker's)
  if (isEndOfOver) {
    // Ball 6 wicket — new batter is at NON-STRIKER end next over
    return 'NEW_BATTER_NON_STRIKER'
  }
  return 'NEW_BATTER_STRIKER'
}
import type { ExtrasType, WicketType, ShotType, DirectionZone, BowlingSide } from './enums'

export interface Delivery {
  id: string
  inningsId: string
  overNumber: number
  ballNumber: number
  deliverySequence: number
  moraBatterId: string | null
  oppBatterName: string | null
  oppBatterStyle: string | null
  moraBowlerId: string | null
  oppBowlerName: string | null
  oppBowlerStyle: string | null
  runsOffBat: number
  extrasType: ExtrasType | null
  extrasRuns: number
  totalRuns: number
  isWicket: boolean
  wicketType: WicketType | null
  dismissedBatterName: string | null
  moraFielderId: string | null
  oppFielderName: string | null
  bowlingSide: BowlingSide | null
  shotType: ShotType | null
  directionZone: DirectionZone | null
}

export interface OverSummary {
  overNumber: number
  runsInOver: number
  wicketsInOver: number
  dotsInOver: number
  foursInOver: number
  sixesInOver: number
  widesInOver: number
  noBallsInOver: number
  cumulativeRuns: number
  cumulativeWickets: number
}
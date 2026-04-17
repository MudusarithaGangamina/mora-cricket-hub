import type { DirectionZone, ShotType } from '@/types/enums'

// Re-export LivePitchState from pitchState.ts for use inside delivery folder
export type { LivePitchState } from './pitchState'

export interface BallState {
  runsOffBat:    number
  extrasType:    string
  extrasRuns:    number
  isWicket:      boolean
  wicketType:    string
  dismissedId:   string
  dismissedName: string
  runOutEnd:     'STRIKER' | 'NON_STRIKER'
  moraFielderId: string
  oppFielderName: string
  bowlingSide:   string
  shotType:      ShotType | null
  directionZone: DirectionZone | null
}

export const EMPTY_BALL: BallState = {
  runsOffBat:    0,
  extrasType:    '',
  extrasRuns:    0,
  isWicket:      false,
  wicketType:    '',
  dismissedId:   '',
  dismissedName: '',
  runOutEnd:     'STRIKER',
  moraFielderId: '',
  oppFielderName:'',
  bowlingSide:   '',
  shotType:      null,
  directionZone: null,
}

export const DISMISSAL_TYPES = [
  { value: 'BOWLED',       label: 'Bowled'       },
  { value: 'CAUGHT',       label: 'Caught'       },
  { value: 'LBW',          label: 'LBW'          },
  { value: 'RUN_OUT',      label: 'Run Out'      },
  { value: 'STUMPED',      label: 'Stumped'      },
  { value: 'HIT_WICKET',   label: 'Hit Wicket'   },
  { value: 'RETIRED_HURT', label: 'Retired Hurt' },
  { value: 'RETIRED_OUT',  label: 'Retired Out'  },
  { value: 'OBSTRUCTING',  label: 'Obstructing'  },
] as const

export const RUN_BUTTONS = [0, 1, 2, 3, 4, 5, 6, 7] as const

export const EXTRAS_OPTIONS = [
  { val: '',        label: 'None'    },
  { val: 'WIDE',    label: 'Wide'    },
  { val: 'NO_BALL', label: 'No Ball' },
  { val: 'LEG_BYE', label: 'Leg Bye' },
  { val: 'BYE',     label: 'Bye'     },
  { val: 'PENALTY', label: 'Penalty' },
] as const

export type RunOutEnd = 'STRIKER' | 'NON_STRIKER'
export const NEEDS_FIELDER = ['CAUGHT', 'RUN_OUT', 'STUMPED']
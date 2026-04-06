import { BowlingStyle, BattingRole, VenueType, SurfaceType } from '../types/enums'

// Which bowling styles count as spin
export const SPIN_STYLES = [
  BowlingStyle.OB,
  BowlingStyle.LB,
  BowlingStyle.SLA,
  BowlingStyle.SLO,
]

// Which bowling styles count as pace
export const PACE_STYLES = [
  BowlingStyle.RF,
  BowlingStyle.RFM,
  BowlingStyle.RM,
  BowlingStyle.RMF,
  BowlingStyle.LF,
  BowlingStyle.LMF,
  BowlingStyle.LM,
]

// Batting position ranges for each role
export const ROLE_POSITION_RANGES: Record<BattingRole, [number, number]> = {
  [BattingRole.OPENER]:       [1, 2],
  [BattingRole.TOP_ORDER]:    [3, 4],
  [BattingRole.MIDDLE_ORDER]: [5, 7],
  [BattingRole.FINISHER]:     [6, 8],
  [BattingRole.TAIL]:         [9, 11],
}

// Venue type colours used across charts
export const VENUE_COLORS: Record<VenueType, string> = {
  [VenueType.HOME]:    '#66bb6a',
  [VenueType.AWAY]:    '#ef5350',
  [VenueType.NEUTRAL]: '#ffa726',
}

// Surface colours
export const SURFACE_COLORS: Record<SurfaceType, string> = {
  [SurfaceType.MATTING]: '#8d6e63',
  [SurfaceType.TURF]:    '#388e3c',
}

// Batch colour palette â€” matches the Streamlit app
export const BATCH_COLORS: Record<number, string> = {
  18: '#ef5350',
  19: '#ff7043',
  20: '#ffa726',
  21: '#66bb6a',
  22: '#29b6f6',
  23: '#ab47bc',
  24: '#ec407a',
  25: '#26c6da',
}

export const getBatchColor = (batch: number): string =>
  BATCH_COLORS[batch] ?? '#9aa3b0'

// Tournament names for display
export const TOURNAMENT_SHORT: Record<string, string> = {
  'Inter University Cricket Championship': 'IUCC',
  'CDCA Division 3': 'CDCA Div 3',
}
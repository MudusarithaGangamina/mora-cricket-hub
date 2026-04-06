import type { BattingStyle, BattingRole, BowlingStyle, MilestoneType } from './enums'

export interface Player {
  id: string
  fullName: string
  shortName: string
  nickname: string | null
  photoUrl: string | null
  faculty: string | null
  degree: string | null
  batchYear: number
  battingStyle: BattingStyle
  primaryBowlingStyle: BowlingStyle | null
  debutDate: string | null
  isActive: boolean
}

export interface PlayerSeason {
  id: string
  playerId: string
  seasonId: string
  jerseyNumber: number | null
  battingRole: BattingRole | null
}

export interface PlayerMilestone {
  id: string
  playerId: string
  milestoneType: MilestoneType
  matchId: string
  achievedAt: string
  detail: string | null
}

export interface BattingStats {
  matches: number
  innings: number
  notOuts: number
  runs: number
  highScore: number
  highScoreNotOut: boolean
  average: number | null
  strikeRate: number
  fifties: number
  hundreds: number
  thirties: number
  ducks: number
  fours: number
  sixes: number
}

export interface BowlingStats {
  matches: number
  innings: number
  overs: number
  maidens: number
  runs: number
  wickets: number
  average: number | null
  economy: number
  strikeRate: number | null
  fourWicketHauls: number
  fiveWicketHauls: number
}

export interface FieldingStats {
  matches: number
  catches: number
  runOuts: number
  stumpings: number
}

export interface PlayerCareerStats {
  player: Player
  batting: BattingStats
  bowling: BowlingStats
  fielding: FieldingStats
  milestones: PlayerMilestone[]
}

// Analytics types
export interface BowlingTypeBreakdown {
  bowlingStyle: BowlingStyle
  innings: number
  runs: number
  balls: number
  dismissals: number
  average: number | null
  strikeRate: number
  dotBallPct: number | null
  source: 'delivery' | 'scorecard'
  coverageNote: string
}

export interface PhaseStats {
  phase: string
  runs: number
  balls: number
  strikeRate: number
  dotBallPct: number
  boundaryPct: number
  innings: number
}
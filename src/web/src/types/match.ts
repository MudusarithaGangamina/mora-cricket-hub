import type {
  MatchStatus, ResultType, RoundType, VenueType,
  SurfaceType, BallColour, InningsType, BattingTeam,
  CommentaryCoverage,
} from './enums'

export interface Season {
  id: string
  name: string
  startDate: string
  endDate: string | null
}

export interface Tournament {
  id: string
  seasonId: string
  name: string
  format: 'ODI' | 'T20' | 'Other'
  oversPerSide: number
}

export interface Venue {
  id: string
  name: string
  city: string | null
  isMoraHomeGround: boolean
}

export interface Opponent {
  id: string
  name: string
  shortName: string
}

export interface Match {
  id: string
  tournamentId: string
  tournament: Tournament
  opponentId: string
  opponent: Opponent
  venueId: string | null
  venue: Venue | null
  matchDate: string
  scheduledOvers: number
  venueType: VenueType
  roundType: RoundType
  roundLabel: string | null
  tossHeld: boolean
  tossWinner: 'MORA' | 'OPPONENT' | null
  tossDecision: 'BAT' | 'FIELD' | null
  moraBattingFirst: boolean | null
  status: MatchStatus
  resultType: ResultType | null
  resultMargin: number | null
  resultMarginType: 'RUNS' | 'WICKETS' | null
  dlsApplied: boolean
  dlsTarget: number | null
  revisedOvers: number | null
  moraCaptainId: string | null
  moraWickeeperId: string | null
  playerOfMatchMoraId: string | null
  playerOfMatchName: string | null
  playerOfMatchTeam: 'MORA' | 'OPPONENT' | null
  surfaceType: SurfaceType
  ballColour: BallColour
  ballType: 'LEATHER' | 'TAPE' | 'TENNIS'
  notes: string | null
}

export interface Innings {
  id: string
  matchId: string
  inningsNumber: number
  inningsType: InningsType
  battingTeam: BattingTeam
  totalRuns: number
  totalWickets: number
  totalOversFaced: number
  extrasWides: number
  extrasNoBalls: number
  extrasLegByes: number
  extrasByes: number
  extrasPenalty: number
  hasDeliveryData: boolean
  commentaryCoverage: CommentaryCoverage
  moraWickeeperId: string | null
}

export interface FallOfWicket {
  id: string
  inningsId: string
  wicketNumber: number
  scoreAtFall: number
  overAtFall: number
  dismissedPlayerName: string
}

export interface Partnership {
  id: string
  inningsId: string
  wicketNumber: number
  moraBatter1Id: string | null
  moraBatter2Id: string | null
  oppBatter1Name: string | null
  oppBatter2Name: string | null
  runs: number
  balls: number
  batter1Runs: number
  batter2Runs: number
  unbroken: boolean
}

// Scorecard display
export interface MoraBattingLine {
  playerId: string
  playerName: string
  battingPosition: number
  runs: number
  ballsFaced: number
  fours: number
  sixes: number
  isNotOut: boolean
  minutesBatted: number | null
  dismissalType: string | null
  dismissedByName: string | null
  fielderName: string | null
}

export interface OpponentBattingLine {
  playerName: string
  battingPosition: number
  runs: number
  ballsFaced: number
  fours: number
  sixes: number
  isNotOut: boolean
  minutesBatted: number | null
  dismissalType: string | null
  dismissedByMoraPlayerName: string | null
  fielderName: string | null
}

export interface BowlingLine {
  playerName: string
  oversBowled: number
  maidens: number
  runsConceded: number
  wickets: number
  wides: number
  noBalls: number
}
export interface TeamRecord {
  highestTeamTotal: TeamTotalRecord | null
  lowestTeamTotal: TeamTotalRecord | null
  biggestWinRuns: MarginRecord | null
  biggestWinWickets: MarginRecord | null
  individualHighestScore: IndividualRecord | null
  bestBowling: BowlingRecord | null
}

export interface TeamTotalRecord {
  totalRuns: number
  totalWickets: number
  totalOversFaced: number
  matchDate: string
  opponent: string
  venueType: string
}

export interface MarginRecord {
  resultMargin: number
  matchDate: string
  opponent: string
  venueType: string
}

export interface IndividualRecord {
  fullName: string
  runs: number
  isNotOut: boolean
  ballsFaced: number
  matchDate: string
  opponent: string
}

export interface BowlingRecord {
  fullName: string
  wickets: number
  runsConceded: number
  oversBowled: number
  matchDate: string
  opponent: string
}

export interface TossAnalysis {
  totalMatches: number
  tossWins: number
  wonTossChoseBat: number
  wonTossChoseField: number
  batFirstMatches: number
  batFirstWins: number
  avgScoreBattingFirst: number
  chaseMatches: number
  chaseWins: number
  avgScoreChasing: number
}

export interface HeadToHeadRecord {
  opponentId: string
  opponent: string
  shortName: string
  played: number
  wins: number
  losses: number
  ties: number
  noResult: number
  winPct: number | null
  lastPlayed: string
}

export interface HomeAwayRecord {
  venueType: string
  played: number
  wins: number
  losses: number
  winPct: number | null
  avgScore: number
}

export interface CaptaincyLeaderboardEntry {
  playerId: string
  playerName: string
  batchYear: number
  matches: number
  wins: number
  losses: number
  winPct: number | null
  tossWins: number
  tossWinPct: number
  batFirstWins: number
  batFirstMatches: number
  chaseWins: number
  chaseMatches: number
}
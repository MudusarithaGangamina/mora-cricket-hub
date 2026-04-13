import { apiClient } from './client'

export interface MatchSummary {
  id: string
  matchDate: string
  tournamentName: string
  tournamentFormat: string
  opponentName: string
  opponentShortName: string
  venueName: string
  venueType: string
  surfaceType: string
  ballColour: string
  roundType: string
  roundLabel: string | null
  status: string
  resultType: string | null
  resultMargin: number | null
  resultMarginType: string | null
  dlsApplied: boolean
  moraCaptainName: string | null
  playerOfMatchName: string | null
  playerOfMatchTeam: string | null
  scheduledOvers: number
}

export interface SquadMember {
  playerId: string
  fullName: string  // we'll add this to the .NET response
  shortName: string
  isPlayingXi: boolean
  battingStyle?: string
  primaryBowlingStyle?: string
}

export interface MatchDetail {
  id: string
  matchDate: string
  tournamentId: string
  tournamentName: string
  tournamentFormat: string
  oversPerSide: number
  seasonName: string
  opponentId: string
  opponentName: string
  opponentShortName: string
  venueId: string | null
  venueName: string | null
  venueCity: string | null
  venueType: string
  surfaceType: string
  ballColour: string
  ballType: string
  roundType: string
  roundLabel: string | null
  tossHeld: boolean
  tossWinner: string | null
  tossDecision: string | null
  moraBattingFirst: boolean | null
  status: string
  resultType: string | null
  resultMargin: number | null
  resultMarginType: string | null
  dlsApplied: boolean
  dlsTarget: number | null
  revisedOvers: number | null
  moraCaptainId: string | null
  moraCaptainName: string | null
  moraWickeeperId: string | null
  moraWickeeperName: string | null
  opponentCaptainName: string | null
  playerOfMatchMoraId: string | null
  playerOfMatchName: string | null
  playerOfMatchTeam: string | null
  notes: string | null
  scheduledOvers: number
  innings: any[]
  squad: SquadMember[]
}

export interface PagedMatches {
  items: MatchSummary[]
  totalCount: number
  page: number
  pageSize: number
}

export interface CreateMatchData {
  tournamentId: string
  opponentId: string
  venueId?: string
  matchDate: string
  scheduledOvers: number
  venueType: string
  surfaceType: string
  ballColour: string
  ballType: string
  roundType: string
  roundLabel?: string
  tossHeld: boolean
  tossWinner?: string
  tossDecision?: string
  moraBattingFirst?: boolean
  status: string
  resultType?: string
  resultMargin?: number
  resultMarginType?: string
  dlsApplied: boolean
  dlsTarget?: number
  revisedOvers?: number
  moraCaptainId?: string
  moraWickeeperId?: string
  opponentCaptainName?: string
  playerOfMatchMoraId?: string
  playerOfMatchName?: string
  playerOfMatchTeam?: string
  notes?: string
}

export const matchesApi = {
  getAll: (params?: {
    tournamentId?: string
    opponentId?: string
    season?: string
    page?: number
    pageSize?: number
  }) =>
    apiClient
      .get<PagedMatches>('/api/matches', { params })
      .then(r => r.data),

  getById: (id: string) =>
    apiClient
      .get<MatchDetail>(`/api/matches/${id}`)
      .then(r => r.data),

  create: (data: CreateMatchData) =>
    apiClient
      .post<{ id: string }>('/api/matches', data)
      .then(r => r.data),

  updateResult: (id: string, data: object) =>
    apiClient.patch(`/api/matches/${id}/result`, { matchId: id, ...data }),

  getSquad: (id: string) =>
    apiClient
      .get<SquadMember[]>(`/api/matches/${id}/squad`)
      .then(r => r.data),

  setSquad: (id: string, playerIds: string[]) =>
    apiClient.post(`/api/matches/${id}/squad`, {
      matchId: id,
      playerIds,
    }),
}
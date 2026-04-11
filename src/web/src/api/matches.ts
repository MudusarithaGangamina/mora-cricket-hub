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
  scheduledOvers: number
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
    tournamentId?: string; opponentId?: string
    season?: string; page?: number; pageSize?: number
  }) => apiClient.get('/api/matches', { params }).then(r => r.data),

  getById: (id: string) =>
    apiClient.get(`/api/matches/${id}`).then(r => r.data),

  create: (data: CreateMatchData) =>
    apiClient.post<{ id: string }>('/api/matches', data).then(r => r.data),

  updateResult: (id: string, data: object) =>
    apiClient.patch(`/api/matches/${id}/result`, { matchId: id, ...data }),

  getSquad: (id: string) =>
    apiClient.get(`/api/matches/${id}/squad`).then(r => r.data),

  setSquad: (id: string, playerIds: string[]) =>
    apiClient.post(`/api/matches/${id}/squad`, { matchId: id, playerIds }),
}
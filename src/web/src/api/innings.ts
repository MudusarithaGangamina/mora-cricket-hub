import { apiClient } from './client'

export const inningsApi = {
  getScorecard: (id: string) =>
    apiClient.get(`/api/innings/${id}`).then(r => r.data),

  getMatchScorecards: (matchId: string) =>
    apiClient.get(`/api/innings/match/${matchId}`).then(r => r.data),

  create: (data: {
    matchId: string; inningsNumber: number; inningsType: string
    battingTeam: string; moraWickeeperId?: string; commentaryCoverage: string; scheduledOvers: number
  }) => apiClient.post<{ id: string }>('/api/innings', data).then(r => r.data),

  updateTotals: (id: string, data: {
    totalRuns: number; totalWickets: number; totalOversFaced: number
    extrasWides: number; extrasNoBalls: number
    extrasLegByes: number; extrasByes: number; extrasPenalty: number
  }) => apiClient.patch(`/api/innings/${id}/totals`, { inningsId: id, ...data }),

  addMoraBatting: (inningsId: string, data: object) =>
    apiClient.post(`/api/innings/${inningsId}/mora-batting`, data).then(r => r.data),

  updateMoraBatting: (id: string, data: object) =>
    apiClient.put(`/api/innings/mora-batting/${id}`, data),

  addOpponentBatting: (inningsId: string, data: object) =>
    apiClient.post(`/api/innings/${inningsId}/opponent-batting`, data).then(r => r.data),

  updateOpponentBatting: (id: string, data: object) =>
    apiClient.put(`/api/innings/opponent-batting/${id}`, data),

  addMoraBowling: (inningsId: string, data: object) =>
    apiClient.post(`/api/innings/${inningsId}/mora-bowling`, data).then(r => r.data),

  updateMoraBowling: (id: string, data: object) =>
    apiClient.put(`/api/innings/mora-bowling/${id}`, data),

  addOpponentBowling: (inningsId: string, data: object) =>
    apiClient.post(`/api/innings/${inningsId}/opponent-bowling`, data).then(r => r.data),

  addFallOfWicket: (inningsId: string, data: object) =>
    apiClient.post(`/api/innings/${inningsId}/fall-of-wickets`, data).then(r => r.data),

  addFielding: (inningsId: string, data: object) =>
    apiClient.post(`/api/innings/${inningsId}/fielding`, data).then(r => r.data),

  updateOvers: (id: string, data: {
    maxOvers: number
    target?: number
  }) => apiClient.patch(`/api/innings/${id}/overs`, {
    inningsId: id, ...data
  }),

  complete: (id: string, data: {
    endedAtOver: number
    reason: 'WICKETS' | 'OVERS' | 'TARGET' | 'MANUAL'
  }) => apiClient.patch(`/api/innings/${id}/complete`, {
    inningsId: id, ...data
  }),

  confirm: (id: string) =>
    apiClient.patch(`/api/innings/${id}/confirm`),

  getEvents: (id: string) =>
    apiClient.get(`/api/innings/${id}/events`).then(r => r.data),

  addEvent: (id: string, data: {
    eventType: string
    atOver?: number
    teamScoreAtEvent?: number
    teamWicketsAtEvent?: number
    revisedOvers?: number
    description: string
    playerId?: string
  }) => apiClient.post(`/api/innings/${id}/events`, {
    inningsId: id, ...data
  }).then(r => r.data),

  changeBowler: (id: string, data: {
    newBowlerId: string
    overNumber: number
    fromBallNumber: number
  }) => apiClient.patch(`/api/innings/${id}/change-bowler`, {
    inningsId: id, ...data
  }),

  changeKeeper: (id: string, data: {
    newKeeperId: string
    overNumber: number
    ballNumber: number
  }) => apiClient.patch(`/api/innings/${id}/change-keeper`, {
    inningsId: id, ...data
  }),
}
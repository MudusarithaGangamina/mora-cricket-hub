import { apiClient } from './client'

export interface Opponent {
  id: string
  name: string
  shortName: string
  registeredPlayers: number
}

export interface OpponentPlayer {
  id: string
  fullName: string
  battingStyle: string | null
  bowlingStyle: string | null
  notes: string | null
}

export interface OpponentDetail {
  id: string
  name: string
  shortName: string
  players: OpponentPlayer[]
}

export const opponentsApi = {
  getAll: () =>
    apiClient.get<Opponent[]>('/api/opponents').then(r => r.data),

  getById: (id: string) =>
    apiClient.get<OpponentDetail>(`/api/opponents/${id}`).then(r => r.data),

  create: (data: { name: string; shortName: string }) =>
    apiClient.post<{ id: string }>('/api/opponents', data).then(r => r.data),

  update: (id: string, data: { name: string; shortName: string }) =>
    apiClient.put(`/api/opponents/${id}`, { opponentId: id, ...data }),

  addPlayer: (opponentId: string, data: {
    fullName: string; battingStyle?: string; bowlingStyle?: string; notes?: string
  }) => apiClient.post<{ id: string }>(
    `/api/opponents/${opponentId}/players`,
    { opponentId, ...data }
  ).then(r => r.data),

  updatePlayer: (playerId: string, data: {
    fullName: string; battingStyle?: string; bowlingStyle?: string; notes?: string
  }) => apiClient.put(`/api/opponents/players/${playerId}`, {
    opponentPlayerId: playerId, ...data
  }),
}
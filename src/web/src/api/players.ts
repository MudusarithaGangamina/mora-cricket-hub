import { apiClient } from './client'

export interface Player {
  id: string
  fullName: string
  shortName: string
  nickname: string | null
  photoUrl: string | null
  faculty: string | null
  degree: string | null
  batchYear: number
  battingStyle: string
  primaryBowlingStyle: string | null
  debutDate: string | null
  isActive: boolean
}

export interface PlayerLookup {
  id: string
  fullName: string
  shortName: string
  nickname: string | null
  batchYear: number
  battingStyle: string
  primaryBowlingStyle: string | null
}

export const playersApi = {
  getAll: (activeOnly = false) =>
    apiClient.get<Player[]>('/api/players', {
      params: { activeOnly }
    }).then(r => r.data),

  getLookup: (activeOnly = true) =>
    apiClient.get<PlayerLookup[]>('/api/players/lookup', {
      params: { activeOnly }
    }).then(r => r.data),

  getById: (id: string) =>
    apiClient.get(`/api/players/${id}`).then(r => r.data),

  getCareerStats: (id: string) =>
    apiClient.get(`/api/players/${id}/career-stats`).then(r => r.data),

  create: (data: {
    fullName: string; shortName: string; nickname?: string
    photoUrl?: string; faculty?: string; degree?: string
    batchYear: number; battingStyle: string; primaryBowlingStyle?: string
  }) => apiClient.post<{ id: string }>('/api/players', data).then(r => r.data),

  update: (id: string, data: {
    fullName: string; shortName: string; nickname?: string
    photoUrl?: string; faculty?: string; degree?: string
    batchYear: number; battingStyle: string; primaryBowlingStyle?: string
    isActive: boolean
  }) => apiClient.put(`/api/players/${id}`, { playerId: id, ...data }),
}
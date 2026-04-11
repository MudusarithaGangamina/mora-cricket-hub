import { apiClient } from './client'

export interface Tournament {
  id: string
  seasonId: string
  seasonName: string
  name: string
  format: string
  oversPerSide: number
}

export const tournamentsApi = {
  getAll: (seasonId?: string) =>
    apiClient.get<Tournament[]>('/api/tournaments', {
      params: seasonId ? { seasonId } : {}
    }).then(r => r.data),

  create: (data: {
    seasonId: string; name: string; format: string; oversPerSide: number
  }) => apiClient.post<{ id: string }>('/api/tournaments', data).then(r => r.data),

  update: (id: string, data: {
    seasonId: string; name: string; format: string; oversPerSide: number
  }) => apiClient.put(`/api/tournaments/${id}`, { tournamentId: id, ...data }),
}
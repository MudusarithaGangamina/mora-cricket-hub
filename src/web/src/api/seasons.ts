import { apiClient } from './client'

export interface Season {
  id: string
  name: string
  startDate: string
  endDate: string | null
}

export const seasonsApi = {
  getAll: () =>
    apiClient.get<Season[]>('/api/seasons').then(r => r.data),

  getById: (id: string) =>
    apiClient.get<Season>(`/api/seasons/${id}`).then(r => r.data),

  create: (data: { name: string; startDate: string; endDate?: string }) =>
    apiClient.post<{ id: string }>('/api/seasons', data).then(r => r.data),

  update: (id: string, data: { name: string; startDate: string; endDate?: string }) =>
    apiClient.put(`/api/seasons/${id}`, { seasonId: id, ...data }),

  delete: (id: string) =>
    apiClient.delete(`/api/seasons/${id}`),
}
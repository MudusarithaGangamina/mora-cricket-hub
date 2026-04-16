import { apiClient } from './client'

export interface Venue {
  id: string
  name: string
  city: string | null
  isMoraHomeGround: boolean
}

export const venuesApi = {
  getAll: () =>
    apiClient.get<Venue[]>('/api/venues').then(r => r.data),

  create: (data: { name: string; city?: string; isMoraHomeGround: boolean }) =>
    apiClient.post<{ id: string }>('/api/venues', data).then(r => r.data),

  update: (id: string, data: { name: string; city?: string; isMoraHomeGround: boolean }) =>
    apiClient.put(`/api/venues/${id}`, { venueId: id, ...data }),

  delete: (id: string) =>
    apiClient.delete(`/api/venues/${id}`),
}
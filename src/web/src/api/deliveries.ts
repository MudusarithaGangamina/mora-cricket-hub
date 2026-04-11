import { apiClient } from './client'

export const deliveriesApi = {
  getInningsDeliveries: (inningsId: string) =>
    apiClient.get(`/api/deliveries/innings/${inningsId}`).then(r => r.data),

  getOverDeliveries: (inningsId: string, overNumber: number) =>
    apiClient.get(`/api/deliveries/innings/${inningsId}/over/${overNumber}`)
      .then(r => r.data),

  getOverSummaries: (inningsId: string) =>
    apiClient.get(`/api/deliveries/innings/${inningsId}/over-summaries`)
      .then(r => r.data),

  add: (data: object) =>
    apiClient.post<{ id: string }>('/api/deliveries', data).then(r => r.data),

  update: (id: string, data: object) =>
    apiClient.put(`/api/deliveries/${id}`, { deliveryId: id, ...data }),

  delete: (id: string, inningsId: string, overNumber: number) =>
    apiClient.delete(`/api/deliveries/${id}`, {
      params: { inningsId, overNumber }
    }),

  markComplete: (inningsId: string) =>
    apiClient.patch(`/api/deliveries/innings/${inningsId}/mark-complete`),
}
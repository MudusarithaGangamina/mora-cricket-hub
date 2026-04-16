import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { venuesApi } from '@/api/venues'

export const useVenues = () =>
  useQuery({ queryKey: ['venues'], queryFn: venuesApi.getAll })

export const useCreateVenue = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: venuesApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['venues'] }),
  })
}

export const useDeleteVenue = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => venuesApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['venues'] }),
  })
}
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { tournamentsApi } from '@/api/tournaments'

export const useTournaments = (seasonId?: string) =>
  useQuery({
    queryKey: ['tournaments', seasonId],
    queryFn: () => tournamentsApi.getAll(seasonId),
  })

export const useCreateTournament = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: tournamentsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tournaments'] }),
  })
}

export const useDeleteTournament = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => tournamentsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tournaments'] }),
  })
}


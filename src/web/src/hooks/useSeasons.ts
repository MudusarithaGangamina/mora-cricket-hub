import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { seasonsApi } from '@/api/seasons'

interface UpdateSeasonData {
  name: string
  startDate: string
  endDate?: string
}

export const useSeasons = () =>
  useQuery({ queryKey: ['seasons'], queryFn: seasonsApi.getAll })

export const useCreateSeason = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: seasonsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['seasons'] }),
  })
}

export const useUpdateSeason = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateSeasonData }) =>
      seasonsApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['seasons'] }),
  })
}

export const useDeleteSeason = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => seasonsApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['seasons'] }),
  })
}
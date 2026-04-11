import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { opponentsApi } from '@/api/opponents'

export const useOpponents = () =>
  useQuery({ queryKey: ['opponents'], queryFn: opponentsApi.getAll })

export const useOpponent = (id: string) =>
  useQuery({
    queryKey: ['opponent', id],
    queryFn: () => opponentsApi.getById(id),
    enabled: !!id,
  })

export const useCreateOpponent = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: opponentsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['opponents'] }),
  })
}
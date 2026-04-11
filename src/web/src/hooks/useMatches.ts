import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { matchesApi, type CreateMatchData } from '@/api/matches'

export const useMatches = (params?: object) =>
  useQuery({
    queryKey: ['matches', params],
    queryFn: () => matchesApi.getAll(params),
  })

export const useMatch = (id: string) =>
  useQuery({
    queryKey: ['match', id],
    queryFn: () => matchesApi.getById(id),
    enabled: !!id,
  })

export const useCreateMatch = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateMatchData) => matchesApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['matches'] }),
  })
}

export const useMatchScorecards = (matchId: string) =>
  useQuery({
    queryKey: ['scorecards', matchId],
    queryFn: () =>
      import('@/api/innings').then(m => m.inningsApi.getMatchScorecards(matchId)),
    enabled: !!matchId,
  })
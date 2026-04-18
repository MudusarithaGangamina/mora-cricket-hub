// hooks/useMatches.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  matchesApi,
  type CreateMatchData,
  type MatchDetail,
} from '@/api/matches'
import { inningsApi } from '@/api/innings'

export const useMatches = (params?: object) =>
  useQuery({
    queryKey: ['matches', params],
    queryFn:  () => matchesApi.getAll(params as any),
  })

export const useMatch = (id: string) =>
  useQuery<MatchDetail>({
    queryKey: ['match', id],
    queryFn:  () => matchesApi.getById(id),
    enabled:  !!id,
  })

export const useMatchSquad = (matchId: string) =>
  useQuery({
    queryKey: ['squad', matchId],
    queryFn:  () => matchesApi.getSquad(matchId),
    enabled:  !!matchId,
  })

export const useCreateMatch = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreateMatchData) => matchesApi.create(data),
    onSuccess:  () => qc.invalidateQueries({ queryKey: ['matches'] }),
  })
}

export const useMatchScorecards = (matchId: string) =>
  useQuery({
    queryKey: ['scorecards', matchId],
    queryFn:  () => inningsApi.getMatchScorecards(matchId),
    enabled:  !!matchId,
  })

  export const useUpdateMatch = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CreateMatchData }) =>
      matchesApi.update(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['match',   vars.id] })
      qc.invalidateQueries({ queryKey: ['matches']          })
    },
  })
}

export const useConfirmMatch = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => matchesApi.confirm(id),
    onSuccess: (_data, id) => {
      qc.invalidateQueries({ queryKey: ['match',   id] })
      qc.invalidateQueries({ queryKey: ['matches']     })
    },
  })
}

export const useMatchSummaryData = (matchId: string) =>
  useQuery({
    queryKey: ['match-summary', matchId],
    queryFn:  () => matchesApi.getSummaryData(matchId),
    enabled:  !!matchId,
  })
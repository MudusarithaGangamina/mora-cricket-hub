import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { inningsApi } from '@/api/innings'

export const useInningsScorecard = (inningsId: string) =>
  useQuery({
    queryKey: ['scorecard', inningsId],
    queryFn:  () => inningsApi.getScorecard(inningsId),
    enabled:  !!inningsId,
  })

export const useInningsEvents = (inningsId: string) =>
  useQuery({
    queryKey: ['innings-events', inningsId],
    queryFn:  () => inningsApi.getEvents(inningsId),
    enabled:  !!inningsId,
    // Poll every 30 seconds if a live match is in progress
    // This keeps the public view updated automatically
    refetchInterval: 30_000,
  })

export const useCompleteInnings = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: {
      id: string
      data: { endedAtOver: number; reason: string }
    }) => inningsApi.complete(id, data as any),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scorecards'] })
      qc.invalidateQueries({ queryKey: ['scorecard'] })
    },
  })
}

export const useConfirmInnings = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => inningsApi.confirm(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scorecards'] })
    },
  })
}

export const useUpdateInningsOvers = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: {
      id: string
      data: { maxOvers: number; target?: number }
    }) => inningsApi.updateOvers(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['scorecards'] })
    },
  })
}

export const useAddInningsEvent = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: {
      id: string
      data: {
        eventType: string
        atOver?: number
        teamScoreAtEvent?: number
        teamWicketsAtEvent?: number
        revisedOvers?: number
        description: string
        playerId?: string
      }
    }) => inningsApi.addEvent(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['innings-events', vars.id] })
    },
  })
}

export const useChangeBowler = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: {
      id: string
      data: {
        newBowlerId: string
        overNumber: number
        fromBallNumber: number
      }
    }) => inningsApi.changeBowler(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['innings-events', vars.id] })
    },
  })
}

export const useChangeKeeper = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: {
      id: string
      data: {
        newKeeperId: string
        overNumber: number
        ballNumber: number
      }
    }) => inningsApi.changeKeeper(id, data),
    onSuccess: (_data, vars) => {
      qc.invalidateQueries({ queryKey: ['innings-events', vars.id] })
    },
  })
}
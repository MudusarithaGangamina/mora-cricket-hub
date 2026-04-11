import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { playersApi } from '@/api/players'

interface CreatePlayerData {
  fullName: string
  shortName: string
  nickname?: string
  photoUrl?: string
  faculty?: string
  degree?: string
  batchYear: number
  battingStyle: string
  primaryBowlingStyle?: string
}

interface UpdatePlayerData extends CreatePlayerData {
  isActive: boolean
}

export const usePlayers = (activeOnly = false) =>
  useQuery({
    queryKey: ['players', activeOnly],
    queryFn: () => playersApi.getAll(activeOnly),
  })

export const usePlayersLookup = () =>
  useQuery({
    queryKey: ['players-lookup'],
    queryFn: () => playersApi.getLookup(),
  })

export const useCreatePlayer = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (data: CreatePlayerData) => playersApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['players'] })
      qc.invalidateQueries({ queryKey: ['players-lookup'] })
    },
  })
}

export const useUpdatePlayer = () => {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdatePlayerData }) =>
      playersApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['players'] })
      qc.invalidateQueries({ queryKey: ['players-lookup'] })
    },
  })
}
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib'
import type { CreateShortUrlPayload, ShortUrlItem, SystemStats } from '@/definitions'

const QUERY_KEYS = {
  urls: ['short-urls'] as const,
  stats: ['system-stats'] as const,
}

export const useShortUrlsQuery = () =>
  useQuery({
    queryKey: QUERY_KEYS.urls,
    queryFn: async () => {
      const { data } = await apiClient.get<ShortUrlItem[]>('/api/urls')
      return data
    },
  })

export const useSystemStatsQuery = () =>
  useQuery({
    queryKey: QUERY_KEYS.stats,
    queryFn: async () => {
      const { data } = await apiClient.get<SystemStats>('/api/system/stats')
      return data
    },
    refetchInterval: 10000,
  })

export const useCreateShortUrlMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreateShortUrlPayload) => {
      const { data } = await apiClient.post<ShortUrlItem>('/api/urls', payload)
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.urls })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats })
    },
  })
}

export const useDeleteShortUrlMutation = () => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/api/urls/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.urls })
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.stats })
    },
  })
}

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

interface SetupStatus {
  needs_setup: boolean;
}

export function useSetupStatus() {
  return useQuery<SetupStatus>({
    queryKey: ['setupStatus'],
    queryFn: async () => {
      const response = await apiClient.get<SetupStatus>('/auth/setup-status');
      return response.data;
    },
    staleTime: 1000 * 60, // 1 minute
    retry: 1,
  });
}

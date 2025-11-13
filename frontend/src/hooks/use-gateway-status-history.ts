import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';

interface GatewayInfo {
  id: number;
  gateway_uid: string;
  name: string | null;
}

interface DeviceStatusChange {
  id: number;
  gateway_id: number;
  status: string;
  uptime_seconds: number | null;
  created_at: string;
  gateway: GatewayInfo;
}

export function useRecentStatusChanges(limit: number = 10) {
  return useQuery({
    queryKey: ['gateway-status-history', 'recent', limit],
    queryFn: async () => {
      const response = await apiClient.get<DeviceStatusChange[]>(
        `/gateway-status-history/recent?limit=${limit}`,
      );
      return response.data;
    },
    refetchInterval: 5000, // Refetch every 5 seconds for near real-time updates
  });
}

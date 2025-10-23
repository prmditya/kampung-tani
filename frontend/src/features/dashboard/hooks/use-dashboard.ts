import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";

// ==================== TYPES ====================

export interface DashboardStats {
  total_gateways: number;
  active_gateways: number;
  offline_gateways: number;
  maintenance_gateways: number;
  total_sensors: number;
  active_sensors: number;
  total_farms: number;
  total_farmers: number;
  active_assignments: number;
  today_readings_count: number;
  week_readings_count: number;
}

export interface ActivityDataPoint {
  date: string;
  readings: number;
}

export interface DashboardActivity {
  data: ActivityDataPoint[];
}

export interface DashboardResponse {
  stats: DashboardStats;
  activity: DashboardActivity;
  generated_at: string;
}

// ==================== HOOKS ====================

export function useDashboard() {
  return useQuery<DashboardResponse>({
    queryKey: ["dashboard"],
    queryFn: async () => {
      const response = await apiClient.get<DashboardResponse>("/dashboard");
      return response.data;
    },
    staleTime: 30000, // Consider data fresh for 30 seconds
    refetchInterval: 60000, // Auto-refetch every minute
  });
}

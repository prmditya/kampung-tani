import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type {
  SensorResponse,
  SensorCreate,
  SensorUpdate,
  MessageResponse,
  PaginatedResponse,
  SensorDataResponse,
  SensorDataCreate,
} from "@/types/api";

// Query Keys
export const sensorKeys = {
  all: ["sensors"] as const,
  lists: () => [...sensorKeys.all, "list"] as const,
  list: (filters?: Record<string, unknown>) =>
    [...sensorKeys.lists(), filters] as const,
  details: () => [...sensorKeys.all, "detail"] as const,
  detail: (id: number) => [...sensorKeys.details(), id] as const,
  byGateway: (gatewayId: number) =>
    [...sensorKeys.all, "gateway", gatewayId] as const,
  data: (sensorId: number, filters?: Record<string, unknown>) =>
    [...sensorKeys.all, "data", sensorId, filters] as const,
  stats: (sensorId: number, hours?: number) =>
    [...sensorKeys.all, "stats", sensorId, hours] as const,
};

// ==================== GET ALL SENSORS ====================
export function useSensors(filters?: { skip?: number; limit?: number }) {
  return useQuery({
    queryKey: sensorKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.skip) params.append("skip", filters.skip.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const response = await apiClient.get<SensorResponse[]>(
        `/sensors?${params}`
      );
      return response.data;
    },
    // TODO: Integrate with API
    enabled: false,
  });
}

// ==================== GET SENSOR BY ID ====================
export function useSensor(id: number) {
  return useQuery({
    queryKey: sensorKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<SensorResponse>(`/sensors/${id}`);
      return response.data;
    },
    // TODO: Integrate with API
    enabled: false,
  });
}

// ==================== GET SENSORS BY GATEWAY ====================
export function useSensorsByGateway(
  gatewayId: number,
  filters?: {
    page?: number;
    size?: number;
    sensor_type?: string;
  }
) {
  return useQuery({
    queryKey: sensorKeys.byGateway(gatewayId),
    queryFn: async () => {
      const params = new URLSearchParams();
      params.append("gateway_id", gatewayId.toString());
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.size) params.append("size", filters.size.toString());
      if (filters?.sensor_type) params.append("sensor_type", filters.sensor_type);

      const response = await apiClient.get<PaginatedResponse<SensorResponse>>(
        `/sensors?${params}`
      );
      return response.data;
    },
    enabled: !!gatewayId && gatewayId > 0,
  });
}

// ==================== CREATE SENSOR ====================
export function useCreateSensor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: SensorCreate) => {
      const response = await apiClient.post<SensorResponse>("/sensors", data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: sensorKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: sensorKeys.byGateway(data.gateway_id),
      });
    },
    // TODO: Integrate with API
  });
}

// ==================== UPDATE SENSOR ====================
export function useUpdateSensor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: SensorUpdate }) => {
      const response = await apiClient.put<SensorResponse>(
        `/sensors/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: sensorKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: sensorKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: sensorKeys.byGateway(data.gateway_id),
      });
    },
    // TODO: Integrate with API
  });
}

// ==================== DELETE SENSOR ====================
export function useDeleteSensor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete<MessageResponse>(`/sensors/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: sensorKeys.lists() });
    },
    // TODO: Integrate with API
  });
}

// ==================== GET SENSOR DATA ====================
export function useSensorData(
  sensorId: number,
  filters?: {
    page?: number;
    size?: number;
    hours?: number;
  }
) {
  return useQuery({
    queryKey: sensorKeys.data(sensorId, filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.size) params.append("size", filters.size.toString());
      if (filters?.hours) params.append("hours", filters.hours.toString());

      const response = await apiClient.get<PaginatedResponse<SensorDataResponse>>(
        `/sensors/${sensorId}/data?${params}`
      );
      return response.data;
    },
    enabled: !!sensorId,
  });
}

// ==================== GET SENSOR STATS ====================
export function useSensorStats(sensorId: number, hours: number = 24) {
  return useQuery({
    queryKey: sensorKeys.stats(sensorId, hours),
    queryFn: async () => {
      const response = await apiClient.get<{
        sensor_id: number;
        sensor_uid: string;
        sensor_type: string;
        period_hours: number;
        statistics: {
          count: number;
          min_value: number | null;
          max_value: number | null;
          avg_value: number | null;
          first_reading: string | null;
          last_reading: string | null;
        };
      }>(`/sensors/${sensorId}/stats?hours=${hours}`);
      return response.data;
    },
    enabled: !!sensorId && hours > 0,
  });
}

// ==================== CREATE SENSOR DATA ====================
export function useCreateSensorData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      sensorId,
      data,
    }: {
      sensorId: number;
      data: SensorDataCreate;
    }) => {
      const response = await apiClient.post<SensorDataResponse>(
        `/sensors/${sensorId}/data`,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: sensorKeys.data(data.sensor_id),
      });
      queryClient.invalidateQueries({
        queryKey: sensorKeys.stats(data.sensor_id),
      });
    },
  });
}

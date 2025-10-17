import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type {
  SensorResponse,
  SensorCreate,
  SensorUpdate,
  MessageResponse,
} from "@/types/api";

// Query Keys
export const sensorKeys = {
  all: ["sensors"] as const,
  lists: () => [...sensorKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) =>
    [...sensorKeys.lists(), filters] as const,
  details: () => [...sensorKeys.all, "detail"] as const,
  detail: (id: number) => [...sensorKeys.details(), id] as const,
  byGateway: (gatewayId: number) =>
    [...sensorKeys.all, "gateway", gatewayId] as const,
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
export function useSensorsByGateway(gatewayId: number) {
  return useQuery({
    queryKey: sensorKeys.byGateway(gatewayId),
    queryFn: async () => {
      const response = await apiClient.get<SensorResponse[]>(
        `/sensors/gateway/${gatewayId}`
      );
      return response.data;
    },
    // TODO: Integrate with API
    enabled: false,
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

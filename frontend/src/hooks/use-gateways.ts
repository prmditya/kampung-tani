import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type {
  GatewayResponse,
  GatewayCreate,
  GatewayUpdate,
  MessageResponse,
} from "@/types/api";

// Query Keys
export const gatewayKeys = {
  all: ["gateways"] as const,
  lists: () => [...gatewayKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) =>
    [...gatewayKeys.lists(), filters] as const,
  details: () => [...gatewayKeys.all, "detail"] as const,
  detail: (id: number) => [...gatewayKeys.details(), id] as const,
};

// ==================== GET ALL GATEWAYS ====================
export function useGateways(filters?: { skip?: number; limit?: number }) {
  return useQuery({
    queryKey: gatewayKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.skip) params.append("skip", filters.skip.toString());
      if (filters?.limit) params.append("limit", filters.limit.toString());

      const response = await apiClient.get<GatewayResponse[]>(
        `/gateways?${params}`
      );
      return response.data;
    },
    // TODO: Integrate with API
    // Uncomment when ready to integrate
    enabled: false, // Set to true when integrating
  });
}

// ==================== GET GATEWAY BY ID ====================
export function useGateway(id: number) {
  return useQuery({
    queryKey: gatewayKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<GatewayResponse>(`/gateways/${id}`);
      return response.data;
    },
    // TODO: Integrate with API
    enabled: false, // Set to true when integrating
  });
}

// ==================== CREATE GATEWAY ====================
export function useCreateGateway() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GatewayCreate) => {
      const response = await apiClient.post<GatewayResponse>("/gateways", data);
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch gateways list
      queryClient.invalidateQueries({ queryKey: gatewayKeys.lists() });
    },
    // TODO: Integrate with API
    // Remove this line when integrating:
    // mutationFn: async () => { throw new Error("Not integrated yet"); },
  });
}

// ==================== UPDATE GATEWAY ====================
export function useUpdateGateway() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: GatewayUpdate;
    }) => {
      const response = await apiClient.put<GatewayResponse>(
        `/gateways/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate specific gateway and list
      queryClient.invalidateQueries({ queryKey: gatewayKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: gatewayKeys.lists() });
    },
    // TODO: Integrate with API
  });
}

// ==================== DELETE GATEWAY ====================
export function useDeleteGateway() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete<MessageResponse>(
        `/gateways/${id}`
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate gateways list
      queryClient.invalidateQueries({ queryKey: gatewayKeys.lists() });
    },
    // TODO: Integrate with API
  });
}

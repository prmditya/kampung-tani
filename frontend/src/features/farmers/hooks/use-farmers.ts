import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type {
  FarmerResponse,
  FarmerCreate,
  FarmerUpdate,
  MessageResponse,
  PaginatedResponse,
} from "@/types/api";

// Query Keys
export const farmerKeys = {
  all: ["farmers"] as const,
  lists: () => [...farmerKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) =>
    [...farmerKeys.lists(), filters] as const,
  details: () => [...farmerKeys.all, "detail"] as const,
  detail: (id: number) => [...farmerKeys.details(), id] as const,
};

// ==================== GET ALL FARMERS ====================
export function useFarmers(filters?: { page?: number; size?: number; search?: string }) {
  return useQuery({
    queryKey: farmerKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.size) params.append("size", filters.size.toString());
      if (filters?.search) params.append("search", filters.search);

      const response = await apiClient.get<PaginatedResponse<FarmerResponse>>(
        `/farmers?${params}`
      );
      return response.data;
    },
  });
}

// ==================== GET FARMER BY ID ====================
export function useFarmer(id: number) {
  return useQuery({
    queryKey: farmerKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<FarmerResponse>(`/farmers/${id}`);
      return response.data;
    },
  });
}

// ==================== CREATE FARMER ====================
export function useCreateFarmer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FarmerCreate) => {
      const response = await apiClient.post<FarmerResponse>("/farmers", data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmerKeys.lists() });
    },
  });
}

// ==================== UPDATE FARMER ====================
export function useUpdateFarmer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FarmerUpdate }) => {
      const response = await apiClient.put<FarmerResponse>(
        `/farmers/${id}`,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: farmerKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: farmerKeys.lists() });
    },
  });
}

// ==================== DELETE FARMER ====================
export function useDeleteFarmer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete<MessageResponse>(
        `/farmers/${id}`
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate farmers list
      queryClient.invalidateQueries({ queryKey: farmerKeys.lists() });

      // Also invalidate farms list because farms are cascade deleted
      queryClient.invalidateQueries({ queryKey: ["farms", "list"] });
    },
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type {
  FarmResponse,
  FarmCreate,
  FarmUpdate,
  MessageResponse,
  PaginatedResponse,
} from "@/types/api";

// Query Keys
export const farmKeys = {
  all: ["farms"] as const,
  lists: () => [...farmKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) => [...farmKeys.lists(), filters] as const,
  details: () => [...farmKeys.all, "detail"] as const,
  detail: (id: number) => [...farmKeys.details(), id] as const,
  byFarmer: (farmerId: number) =>
    [...farmKeys.all, "farmer", farmerId] as const,
};

// ==================== GET ALL FARMS ====================
export function useFarms(filters?: { page?: number; size?: number; search?: string }) {
  return useQuery({
    queryKey: farmKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.size) params.append("size", filters.size.toString());
      if (filters?.search) params.append("search", filters.search);

      const response = await apiClient.get<PaginatedResponse<FarmResponse>>(`/farms?${params}`);
      return response.data;
    },
  });
}

// ==================== GET FARM BY ID ====================
export function useFarm(id: number) {
  return useQuery({
    queryKey: farmKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<FarmResponse>(`/farms/${id}`);
      return response.data;
    },
  });
}

// ==================== GET FARMS BY FARMER ====================
export function useFarmsByFarmer(farmerId: number) {
  return useQuery({
    queryKey: farmKeys.byFarmer(farmerId),
    queryFn: async () => {
      const response = await apiClient.get<FarmResponse[]>(
        `/farms/farmer/${farmerId}`
      );
      return response.data;
    },
  });
}

// ==================== CREATE FARM ====================
export function useCreateFarm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: FarmCreate) => {
      const response = await apiClient.post<FarmResponse>("/farms", data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: farmKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: farmKeys.byFarmer(data.farmer_id),
      });
    },
  });
}

// ==================== UPDATE FARM ====================
export function useUpdateFarm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: FarmUpdate }) => {
      const response = await apiClient.put<FarmResponse>(`/farms/${id}`, data);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: farmKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: farmKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: farmKeys.byFarmer(data.farmer_id),
      });
    },
  });
}

// ==================== DELETE FARM ====================
export function useDeleteFarm() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete<MessageResponse>(`/farms/${id}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: farmKeys.lists() });
    },
  });
}

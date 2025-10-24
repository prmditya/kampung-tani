import apiClient from "@/lib/api-client";
import {
  GatewayAssignmentResponse,
  GatewayAssignmentCreate,
  GatewayAssignmentUpdate,
  MessageResponse,
  PaginatedResponse,
} from "@/types/api";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// Query Keys
export const assignmentKeys = {
  all: ["assignments"] as const,
  lists: () => [...assignmentKeys.all, "list"] as const,
  list: (filters?: Record<string, any>) =>
    [...assignmentKeys.lists(), filters] as const,
  details: () => [...assignmentKeys.all, "detail"] as const,
  detail: (id: number) => [...assignmentKeys.details(), id] as const,
  byGateway: (gatewayId: number) =>
    [...assignmentKeys.all, "gateway", gatewayId] as const,
};

// ==================== GET ALL ASSIGNMENT ====================
export default function useAssignments(filters?: {
  page?: number;
  size?: number;
  search?: string;
}) {
  return useQuery<PaginatedResponse<GatewayAssignmentResponse>>({
    queryKey: assignmentKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters?.page) params.append("page", filters.page.toString());
      if (filters?.size) params.append("size", filters.size.toString());
      if (filters?.search) params.append("search", filters.search);
      const response = await apiClient.get<
        PaginatedResponse<GatewayAssignmentResponse>
      >(`/gateway-assignments?${params}`);
      return response.data;
    },
    // Prevent refetching on window focus if we have data
    staleTime: 30000, // Consider data fresh for 30 seconds
  });
}

// =================== GET ASSIGNMENT BY ID ===================
export function useAssignment(id: number) {
  return useQuery<GatewayAssignmentResponse>({
    queryKey: assignmentKeys.detail(id),
    queryFn: async () => {
      const response = await apiClient.get<GatewayAssignmentResponse>(
        `/gateway-assignments/${id}`,
      );
      return response.data;
    },
  });
}

// =================== GET ACTIVE ASSIGNMENT BY GATEWAY ID ===================
export function useAssignmentByGateway(gatewayId: number) {
  return useQuery<GatewayAssignmentResponse | null>({
    queryKey: assignmentKeys.byGateway(gatewayId),
    queryFn: async () => {
      // Get all assignments and filter for active one for this gateway
      const response = await apiClient.get<
        PaginatedResponse<GatewayAssignmentResponse>
      >(`/gateway-assignments?size=100`);
      const activeAssignment = response.data.items.find(
        (a) => a.gateway_id === gatewayId && a.is_active,
      );
      return activeAssignment || null;
    },
    enabled: gatewayId > 0,
    staleTime: 30000,
  });
}

// ==================== CREATE ASSIGNMENT ====================
export function useCreateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: GatewayAssignmentCreate) => {
      const response = await apiClient.post<GatewayAssignmentResponse>(
        "/gateway-assignments",
        data,
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate and refetch assignments list
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
    },
  });
}

// ==================== UPDATE ASSIGNMENT ====================
export function useUpdateAssignment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      data,
    }: {
      id: number;
      data: GatewayAssignmentUpdate;
    }) => {
      const response = await apiClient.put<GatewayAssignmentResponse>(
        `/gateway-assignments/${id}`,
        data,
      );
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate specific assignment and list
      queryClient.invalidateQueries({
        queryKey: assignmentKeys.detail(data.id),
      });
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
    },
  });
}

// ==================== DELETE ASSIGNMENT ====================
export function useDeleteAssignment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: number) => {
      const response = await apiClient.delete<MessageResponse>(
        `/gateway-assignments/${id}`,
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate assignments list
      queryClient.invalidateQueries({ queryKey: assignmentKeys.lists() });
    },
  });
}

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/api-client";
import type {
  UserResponse,
  UserCreate,
  UserUpdate,
  MessageResponse,
  UserRole,
} from "@/types/api";

// Query Keys
export const userKeys = {
  all: ["users"] as const,
  lists: () => [...userKeys.all, "list"] as const,
  byRole: (role?: UserRole) => [...userKeys.all, "role", role] as const,
};

// ============== GET ALL USERS ==============
export function useGetUsers(role?: UserRole) {
  return useQuery({
    queryKey: userKeys.byRole(role),
    queryFn: async () => {
      const params = role ? { role } : {};
      const response = await apiClient.get<UserResponse[]>("/users", {
        params,
      });
      return response.data;
    },
  });
}

// ============== CREATE USER ==============
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: UserCreate) => {
      const response = await apiClient.post<UserResponse>("/users", user);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.byRole(data.role) });
    },
  });
}

// ============== UPDATE USER INFORMATION =============

export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: number;
      data: UserUpdate;
    }) => {
      const response = await apiClient.put<UserResponse>(
        `/users/${userId}`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

// ============== DELETE USER ==============
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: number) => {
      const response = await apiClient.delete<MessageResponse>(
        `/users/${userId}`
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.all });
    },
  });
}

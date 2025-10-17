import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import apiClient from "@/lib/api-client";
import axios from "axios";

interface LoginCredentials {
  username: string;
  password: string;
}

interface LoginResponse {
  access_token: string;
  expires_in: number;
  user: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

export function useLogin() {
  const router = useRouter();

  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: async (credentials: LoginCredentials) => {
      try {
        const response = await apiClient.post<LoginResponse>(
          "/auth/login",
          credentials
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message = error.response?.data?.detail || "Login failed. Please try again.";
          throw new Error(message);
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      // Store token in localStorage
      localStorage.setItem("token", data.access_token);

      // Redirect to dashboard
      router.push("/dashboard");
    },
  });
}

export function useLogout() {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post("/auth/logout");
      return response.data;
    },
    onSuccess: () => {
      // Remove token from localStorage
      localStorage.removeItem("token");

      // Redirect to login page
      router.push("/login");
    },
  });
}

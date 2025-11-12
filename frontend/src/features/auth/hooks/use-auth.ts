import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import axios from 'axios';
import type {
  UserUpdate,
  UserResponse,
  PasswordChange,
  MessageResponse,
} from '@/types/api';
import { toast } from 'sonner';

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
          '/auth/login',
          credentials,
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message =
            error.response?.data?.detail || 'Login failed. Please try again.';
          throw new Error(message);
        }
        throw error;
      }
    },
    onSuccess: (data) => {
      localStorage.setItem('token', data.access_token);
      const expirationTime = Date.now() + data.expires_in * 1000;
      localStorage.setItem('token_expiration', expirationTime.toString());
      localStorage.setItem('user', JSON.stringify(data.user));
      router.push('/dashboard');
      toast.success('Login successful!');
    },
    onError: (error) => {
      toast.error('Login Failed, Please try again! ');
    },
  });
}

export function useLogout() {
  const router = useRouter();

  return useMutation({
    mutationFn: async () => {
      const response = await apiClient.post('/auth/logout');
      return response.data;
    },
    onSuccess: () => {
      // Remove token, expiration, and user data from localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('token_expiration');
      localStorage.removeItem('user');

      // Redirect to login page
      router.push('/login');
    },
  });
}

export function useCurrentUser() {
  const [user, setUser] = useState<LoginResponse['user'] | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch {
        setUser(null);
      }
    }
  }, []);

  return user;
}

export function isSuperAdmin(user: LoginResponse['user'] | null): boolean {
  return user?.role === 'super admin';
}

export function useUpdateOwnProfile() {
  return useMutation({
    mutationFn: async (data: UserUpdate) => {
      const response = await apiClient.put<UserResponse>('/auth/me', data);
      return response.data;
    },
    onSuccess: (data) => {
      // Update user in localStorage
      const updatedUser = {
        id: data.id,
        username: data.username,
        email: data.email,
        role: data.role,
        created_at: data.created_at,
      };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: async (data: PasswordChange) => {
      try {
        const response = await apiClient.post<MessageResponse>(
          '/auth/change-password',
          data,
        );
        return response.data;
      } catch (error) {
        if (axios.isAxiosError(error)) {
          const message =
            error.response?.data?.detail ||
            'Failed to change password. Please try again.';
          throw new Error(message);
        }
        throw error;
      }
    },
  });
}

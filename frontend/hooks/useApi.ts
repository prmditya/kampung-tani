import { useState, useEffect, useCallback, useRef } from 'react';
import { API_CONFIG } from '@/lib/constants';

interface UseApiOptions {
  refreshInterval?: number;
  enabled?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

interface ApiState<T> {
  data: T | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

export function useApi<T>(
  endpoint: string,
  options: UseApiOptions = {}
) {
  const {
    refreshInterval = 0,
    enabled = true,
    onSuccess,
    onError
  } = options;

  const [state, setState] = useState<ApiState<T>>({
    data: null,
    isLoading: true,
    error: null,
    lastUpdated: null,
  });

  const abortControllerRef = useRef<AbortController | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (signal?: AbortSignal) => {
    if (!enabled) return;

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      // Get auth token from localStorage
      const token = localStorage.getItem('auth_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      
      // Add authorization header if token exists
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
        signal,
        headers,
      });

      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      setState({
        data,
        isLoading: false,
        error: null,
        lastUpdated: new Date(),
      });

      onSuccess?.(data);
    } catch (error: any) {
      if (error.name === 'AbortError') return;
      
      const errorMessage = error.message || 'An unexpected error occurred';
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      onError?.(error);
    }
  }, [endpoint, enabled, onSuccess, onError]);

  const refetch = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    fetchData(abortControllerRef.current.signal);
  }, [fetchData]);

  // Initial fetch and cleanup
  useEffect(() => {
    if (!enabled) return;

    abortControllerRef.current = new AbortController();
    fetchData(abortControllerRef.current.signal);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchData, enabled]);

  // Auto-refresh setup
  useEffect(() => {
    if (!enabled || !refreshInterval || refreshInterval <= 0) return;

    intervalRef.current = setInterval(() => {
      refetch();
    }, refreshInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [refetch, refreshInterval, enabled]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    ...state,
    refetch,
    isRefreshing: state.isLoading && state.data !== null,
  };
}
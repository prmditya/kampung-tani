import { useState, useEffect, useCallback } from 'react';

// ===== INTERFACES =====

interface SensorData {
  id: number;
  device_id: number;
  sensor_type: string;
  value: number;
  unit: string;
  metadata: any;
  timestamp: string;
}

interface Device {
  id: number;
  name: string;
  description: string;
  location: string;
  device_type: string;
  status: string;
  user_id: number;
  created_at: string;
  updated_at: string;
}

interface DeviceStatusHistory {
  status: string;
  uptime_seconds: number | null;
  created_at: string | null;
}

interface DeviceStats {
  total_devices: number;
  online_devices: number;
  offline_devices: number;
  maintenance_devices: number;
  recent_data_count: number;
  status_distribution: Array<{
    status: string;
    count: number;
  }>;
  type_distribution: Array<{
    device_type: string;
    count: number;
  }>;
}

interface ApiPaginationResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  status: string;
}

interface ApiResponse<T> {
  data: T;
  status: string;
}

interface SensorCalibration {
  id: number;
  device_id: number;
  device_name: string;
  sensor_type: string;
  param_name: string;
  param_value: number | null;
  updated_at: string | null;
}

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

interface UsePaginatedApiResult<T> {
  data: T[] | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  loading: boolean;
  error: string | null;
  refetch: (page?: number, limit?: number) => Promise<void>;
  nextPage: () => Promise<void>;
  prevPage: () => Promise<void>;
}

// ===== CONFIGURATION =====

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// ===== UTILITIES =====

const fetchApi = async <T>(endpoint: string, signal?: AbortSignal): Promise<T> => {
  // Get auth token from localStorage
  const token = localStorage.getItem('auth_token');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Add authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, { 
    signal,
    headers 
  });
  
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  
  const result = await response.json();
  
  if (result.error) {
    throw new Error(result.error);
  }
  
  return result;
};

// Generic hook factory untuk mengurangi code duplication
const createApiHook = <T>(endpoint: string) => {
  return (): UseApiResult<T> => {
    const [data, setData] = useState<T | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async (abortSignal?: AbortSignal) => {
      setLoading(true);
      try {
        setError(null);
        const result = await fetchApi<ApiResponse<T>>(endpoint, abortSignal);
        if (!abortSignal?.aborted) {
          setData(result.data);
        }
      } catch (err) {
        if (abortSignal?.aborted) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        console.error(`Error fetching ${endpoint}:`, err);
      } finally {
        if (!abortSignal?.aborted) {
          setLoading(false);
        }
      }
    }, []);

    const refetch = useCallback(async () => {
      setLoading(true);
      await fetchData();
    }, [fetchData]);

    useEffect(() => {
      const controller = new AbortController();
      fetchData(controller.signal);
      return () => controller.abort();
    }, [fetchData]);

    return { data, loading, error, refetch };
  };
};

// Generic hook factory untuk paginated API
const createPaginatedApiHook = <T>(baseEndpoint: string) => {
  return (initialPage = 1, initialLimit = 50): UsePaginatedApiResult<T> => {
    const [data, setData] = useState<T[] | null>(null);
    const [pagination, setPagination] = useState<{
      page: number;
      limit: number;
      total: number;
      pages: number;
    } | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [currentLimit, setCurrentLimit] = useState(initialLimit);

    const fetchData = useCallback(async (page = currentPage, limit = currentLimit, abortSignal?: AbortSignal) => {
      setLoading(true);
      try {
        setError(null);
        const endpoint = `${baseEndpoint}?page=${page}&limit=${limit}`;
        const result = await fetchApi<{items: T[], total: number, page: number, size: number, pages: number}>(endpoint, abortSignal);
        if (!abortSignal?.aborted) {
          setData(result.items);
          setPagination({
            page: result.page,
            limit: result.size,
            total: result.total,
            pages: result.pages
          });
          setCurrentPage(page);
          setCurrentLimit(limit);
        }
      } catch (err) {
        if (abortSignal?.aborted) {
          return;
        }
        setError(err instanceof Error ? err.message : 'Failed to fetch data');
        console.error(`Error fetching ${baseEndpoint}:`, err);
      } finally {
        if (!abortSignal?.aborted) {
          setLoading(false);
        }
      }
    }, [baseEndpoint, currentPage, currentLimit]);

    const refetch = useCallback(async (page?: number, limit?: number) => {
      setLoading(true);
      await fetchData(page, limit);
    }, [fetchData]);

    const nextPage = useCallback(async () => {
      if (pagination && currentPage < pagination.pages) {
        await refetch(currentPage + 1);
      }
    }, [pagination, currentPage, refetch]);

    const prevPage = useCallback(async () => {
      if (currentPage > 1) {
        await refetch(currentPage - 1);
      }
    }, [currentPage, refetch]);

    useEffect(() => {
      const controller = new AbortController();
      fetchData(initialPage, initialLimit, controller.signal);
      return () => controller.abort();
    }, []);

    return { data, pagination, loading, error, refetch, nextPage, prevPage };
  };
};

// ===== HOOKS =====

// Hook untuk sensor data dengan pagination dan auto-refresh
export const useSensorData = (autoRefresh = false, interval = 5000, page = 1, limit = 50): UsePaginatedApiResult<SensorData> => {
  const [data, setData] = useState<SensorData[] | null>(null);
  const [pagination, setPagination] = useState<{
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(page);
  const [currentLimit, setCurrentLimit] = useState(limit);

  const fetchData = useCallback(async (pageNum = currentPage, limitNum = currentLimit, abortSignal?: AbortSignal) => {
    setLoading(true);
    try {
      setError(null);
      const result = await fetchApi<{items: SensorData[], total: number, page: number, size: number, pages: number}>(`/sensors/?page=${pageNum}&limit=${limitNum}`, abortSignal);
      if (!abortSignal?.aborted) {
        setData(result.items);
        setPagination({
          page: result.page,
          limit: result.size,
          total: result.total,
          pages: result.pages
        });
        setCurrentPage(pageNum);
        setCurrentLimit(limitNum);
      }
    } catch (err) {
      if (abortSignal?.aborted) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch sensor data');
      console.error('Error fetching sensor data:', err);
    } finally {
      if (!abortSignal?.aborted) {
        setLoading(false);
      }
    }
  }, [currentPage, currentLimit]);

  const refetch = useCallback(async (pageNum?: number, limitNum?: number) => {
    setLoading(true);
    await fetchData(pageNum, limitNum);
  }, [fetchData]);

  const nextPage = useCallback(async () => {
    if (pagination && currentPage < pagination.pages) {
      await refetch(currentPage + 1);
    }
  }, [pagination, currentPage, refetch]);

  const prevPage = useCallback(async () => {
    if (currentPage > 1) {
      await refetch(currentPage - 1);
    }
  }, [currentPage, refetch]);

  useEffect(() => {
    let controller = new AbortController();
    fetchData(page, limit, controller.signal);

    let intervalId: ReturnType<typeof setInterval> | undefined;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        controller.abort();
        controller = new AbortController();
        fetchData(currentPage, currentLimit, controller.signal);
      }, interval);
    }

    return () => {
      controller.abort();
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [autoRefresh, interval]);

  return { data, pagination, loading, error, refetch, nextPage, prevPage };
};

// Hooks menggunakan factory untuk consistency - Updated untuk RESTful API
export const useDevices = createPaginatedApiHook<Device>('/devices/');
export const useSensorCalibrations = createApiHook<SensorCalibration[]>('/sensor-calibrations');

// Hook untuk device stats menggunakan RESTful endpoint
export const useDeviceStats = (autoRefresh = false, interval = 5000): UseApiResult<DeviceStats> => {
  const [data, setData] = useState<DeviceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (abortSignal?: AbortSignal) => {
    setLoading(true);
    try {
      setError(null);
      const result = await fetchApi<DeviceStats>('/devices/stats', abortSignal);
      if (!abortSignal?.aborted) {
        setData(result);
      }
    } catch (err) {
      if (abortSignal?.aborted) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch device stats');
      console.error('Error fetching device stats:', err);
    } finally {
      if (!abortSignal?.aborted) {
        setLoading(false);
      }
    }
  }, []);

  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    
    // Auto-refresh setup
    let intervalId: ReturnType<typeof setInterval> | undefined;
    if (autoRefresh) {
      intervalId = setInterval(() => {
        if (!controller.signal.aborted) {
          fetchData();
        }
      }, interval);
    }

    return () => {
      controller.abort();
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [fetchData, autoRefresh, interval]);

  return { data, loading, error, refetch };
};

// Hook untuk device status history (dengan parameter)
export const useDeviceStatusHistory = (deviceId: number | null): UseApiResult<DeviceStatusHistory[]> => {
  const [data, setData] = useState<DeviceStatusHistory[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (abortSignal?: AbortSignal) => {
    setLoading(true);
    if (!deviceId) {
      setData(null);
      setLoading(false);
      return;
    }

    try {
      setError(null);
      const result = await fetchApi<DeviceStatusHistory[]>(`/devices/${deviceId}/status-history`, abortSignal);
      if (!abortSignal?.aborted) {
        setData(result);
      }
    } catch (err) {
      if (abortSignal?.aborted) {
        return;
      }
      setError(err instanceof Error ? err.message : 'Failed to fetch device history');
      console.error('Error fetching device status history:', err);
    } finally {
      if (!abortSignal?.aborted) {
        setLoading(false);
      }
    }
  }, [deviceId]);

  const refetch = useCallback(async () => {
    setLoading(true);
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    return () => controller.abort();
  }, [fetchData]);

  return { data, loading, error, refetch };
};

// Export interfaces for external use
export type { 
  SensorData, 
  Device, 
  DeviceStatusHistory, 
  DeviceStats, 
  SensorCalibration, 
  UseApiResult, 
  UsePaginatedApiResult,
  ApiPaginationResponse,
  ApiResponse
};
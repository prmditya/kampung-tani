import { useState, useEffect, useCallback } from 'react';

// ===== INTERFACES =====

interface SensorData {
  id: number;
  device_id: number;
  device_name: string;
  user_name: string;
  created_at: string | null;
  // Sensor measurements
  moisture: number | null;
  temperature: number | null;
  conductivity: number | null;
  ph: number | null;
  nitrogen: number | null;
  phosphorus: number | null;
  potassium: number | null;
  salinity: number | null;
  tds: number | null;
}

interface Device {
  id: number;
  name: string;
  address: number;
  baud_rate: number;
  type: string;
  status: string;
  last_seen: string | null;
  uptime_seconds: number | null;
  user_name: string;
  created_at: string | null;
  updated_at: string | null;
}

interface DeviceStatusHistory {
  status: string;
  uptime_seconds: number | null;
  created_at: string | null;
}

interface DeviceStats {
  total_devices: number;
  status_counts: {
    online: number;
    offline: number;
    restarted: number;
  };
  recent_data_count: number;
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
  const response = await fetch(`${API_BASE_URL}${endpoint}`, { signal });
  
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
        const result = await fetchApi<ApiPaginationResponse<T>>(endpoint, abortSignal);
        if (!abortSignal?.aborted) {
          setData(result.data);
          setPagination(result.pagination);
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
      const result = await fetchApi<ApiPaginationResponse<SensorData>>(`/api/sensors/?page=${pageNum}&limit=${limitNum}`, abortSignal);
      if (!abortSignal?.aborted) {
        setData(result.data);
        setPagination(result.pagination);
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
export const useDevices = createPaginatedApiHook<Device>('/api/devices/');
export const useSensorCalibrations = createApiHook<SensorCalibration[]>('/api/sensor-calibrations');

// Hook untuk device stats menggunakan RESTful endpoint
export const useDeviceStats = (autoRefresh = false, interval = 5000): UseApiResult<DeviceStats> => {
  const [data, setData] = useState<DeviceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (abortSignal?: AbortSignal) => {
    setLoading(true);
    try {
      setError(null);
      const result = await fetchApi<ApiResponse<DeviceStats>>('/api/devices/stats', abortSignal);
      if (!abortSignal?.aborted) {
        setData(result.data);
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
      const result = await fetchApi<ApiResponse<DeviceStatusHistory[]>>(`/api/devices/${deviceId}/status-history`, abortSignal);
      if (!abortSignal?.aborted) {
        setData(result.data);
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
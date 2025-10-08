import { useState, useEffect, useCallback } from 'react';
import { API_CONFIG } from '@/shared/lib/constants';

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
  last_seen: string;
  user_id: number;
  created_at: string;
  updated_at: string;
  // Enhanced properties from API
  current_uptime_seconds?: number | null;
  current_uptime_formatted?: string | null;
  device_status?: string;
  uptime_description?: string;
}

interface DeviceStatusHistory {
  status: string;
  uptime_seconds: number | null;
  uptime_formatted?: string | null;
  created_at: string | null;
}

interface DeviceStatusHistoryResponse {
  device_id: number;
  device_name: string;
  device_status: string;
  current_uptime_seconds: number | null;
  current_uptime_formatted: string | null;
  uptime_description: string;
  history: DeviceStatusHistory[];
  total_records: number;
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

interface SensorCalibration {
  id: number;
  device_id: number;
  device_name: string;
  sensor_type: string;
  param_name: string;
  param_value: number | null;
  updated_at: string | null;
}

// Unified API result interfaces
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v3';

// ===== UTILITIES =====

const getAuthHeaders = (): Record<string, string> => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  
  // Check if we're in browser environment before accessing localStorage
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }
  
  return headers;
};

const fetchApi = async <T>(endpoint: string, signal?: AbortSignal): Promise<T> => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, { 
    signal,
    headers: getAuthHeaders()
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

// ===== HOOKS =====

// Unified hook for all API calls with optional auto-refresh
const useApiData = <T>(
  endpoint: string, 
  autoRefresh = false, 
  interval = 30000
): UseApiResult<T> => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (abortSignal?: AbortSignal) => {
    setLoading(true);
    try {
      setError(null);
      const result = await fetchApi<T>(endpoint, abortSignal);
      if (!abortSignal?.aborted) {
        setData(result);
      }
    } catch (err) {
      if (abortSignal?.aborted) return;
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      if (!abortSignal?.aborted) {
        setLoading(false);
      }
    }
  }, [endpoint]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  useEffect(() => {
    const controller = new AbortController();
    fetchData(controller.signal);
    
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
      if (intervalId) clearInterval(intervalId);
    };
  }, [fetchData, autoRefresh, interval]);

  return { data, loading, error, refetch };
};

// Sensor data with pagination
export const useSensorData = (
  autoRefresh = false, 
  interval = 5000, 
  page = 1, 
  limit = 50
): UsePaginatedApiResult<SensorData> => {
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
      const result = await fetchApi<{items: SensorData[], total: number, page: number, size: number, pages: number}>(`/sensors/?page=${pageNum}&size=${limitNum}`, abortSignal);
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
      if (abortSignal?.aborted) return;
      setError(err instanceof Error ? err.message : 'Failed to fetch sensor data');
    } finally {
      if (!abortSignal?.aborted) {
        setLoading(false);
      }
    }
  }, [currentPage, currentLimit]);

  const refetch = useCallback(async (pageNum?: number, limitNum?: number) => {
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
      if (intervalId) clearInterval(intervalId);
    };
  }, [autoRefresh, interval]);

  return { data, pagination, loading, error, refetch, nextPage, prevPage };
};

// Devices with pagination and enhanced uptime data
export const useDevices = (initialPage = 1, initialLimit = 50): UsePaginatedApiResult<Device> => {
  const [data, setData] = useState<Device[] | null>(null);
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
      const result = await fetchApi<{items: Device[], total: number, page: number, size: number, pages: number}>(`/devices?page=${page}&size=${limit}`, abortSignal);
      
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
      if (abortSignal?.aborted) return;
      setError(err instanceof Error ? err.message : 'Failed to fetch devices');
    } finally {
      if (!abortSignal?.aborted) {
        setLoading(false);
      }
    }
  }, [currentPage, currentLimit]);

  const refetch = useCallback(async (page?: number, limit?: number) => {
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

// Device stats with auto-refresh
export const useDeviceStats = (autoRefresh = false, interval = API_CONFIG.REFRESH_INTERVALS.DEVICE_STATUS): UseApiResult<DeviceStats> => {
  return useApiData<DeviceStats>('/devices/stats', autoRefresh, interval);
};

// Device status history
export const useDeviceStatusHistory = (deviceId: number | null): UseApiResult<DeviceStatusHistory[]> => {
  const endpoint = deviceId ? `/devices/${deviceId}/status-history` : '';
  const { data, loading, error, refetch } = useApiData<DeviceStatusHistoryResponse>(endpoint, false, 0);
  
  return {
    data: data?.history || null,
    loading: !deviceId ? false : loading,
    error,
    refetch
  };
};

// Enhanced devices with uptime data
export const useDevicesWithUptime = (initialPage = 1, initialLimit = 50): UsePaginatedApiResult<Device> & { devicesUptime: Record<number, any> } => {
  const [devicesUptime, setDevicesUptime] = useState<Record<number, any>>({});
  
  const devicesResult = useDevices(initialPage, initialLimit);
  const { data: devices } = devicesResult;

  // Fetch uptime data for all devices
  useEffect(() => {
    const fetchDevicesUptime = async () => {
      if (!devices?.length) return;
      
      const uptimeData: Record<number, any> = {};
      
      for (const device of devices) {
        try {
          const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v3'}/devices/${device.id}/status-history?limit=1`, {
            headers: getAuthHeaders(),
          });
          
          if (response.ok) {
            const data = await response.json();
            uptimeData[device.id] = data;
          }
        } catch (error) {
          console.error(`Error fetching uptime for device ${device.id}:`, error);
        }
      }
      
      setDevicesUptime(uptimeData);
    };

    fetchDevicesUptime();
  }, [devices]);

  // Custom refetch that also resets uptime data
  const refetchWithUptime = useCallback(async (page?: number, limit?: number) => {
    await devicesResult.refetch(page, limit);
    setDevicesUptime({});
  }, [devicesResult]);

  return {
    ...devicesResult,
    devicesUptime,
    refetch: refetchWithUptime
  };
};


// Export types
export type { 
  SensorData, 
  Device, 
  DeviceStatusHistory,
  DeviceStatusHistoryResponse, 
  DeviceStats, 
  UseApiResult, 
  UsePaginatedApiResult
};
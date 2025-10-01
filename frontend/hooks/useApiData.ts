import { useApi } from './useApi';
import { API_CONFIG } from '@/lib/constants';

// ===== SENSOR DATA HOOKS =====

export interface SensorData {
  id: number;
  device_id: number;
  device_name: string;
  user_name: string;
  created_at: string;
  moisture?: number;
  temperature?: number;
  conductivity?: number;
  ph?: number;
  nitrogen?: number;
  phosphorus?: number;
  potassium?: number;
  salinity?: number;
  tds?: number;
}

export function useSensorData(deviceId?: string) {
  const endpoint = deviceId 
    ? `/api/sensors/?device_id=${deviceId}&limit=20`
    : '/api/sensors/?limit=20';

  const response = useApi<{data: SensorData[], pagination: any, status: string}>(endpoint, {
    refreshInterval: API_CONFIG.REFRESH_INTERVALS.SENSOR_DATA,
  });

  return {
    ...response,
    data: response.data?.data || null, // Extract data from response.data.data
  };
}

export function useSensorHistory(
  deviceId: string,
  sensorType: string,
  limit: number = 50
) {
  const endpoint = `/api/sensors/history?device_id=${deviceId}&sensor_type=${sensorType}&limit=${limit}`;
  
  return useApi<SensorData[]>(endpoint, {
    enabled: !!deviceId && !!sensorType,
  });
}

// ===== DEVICE HOOKS =====

export interface Device {
  device_id: string;
  name: string;
  location: string;
  status: string;
  last_seen: string;
  uptime_percentage?: number;
}

export interface DeviceStats {
  total_devices: number;
  status_counts: {
    online: number;
    offline: number;
    restarted: number;
  };
  recent_data_count: number;
}

export function useDevices() {
  return useApi<Device[]>('/api/devices', {
    refreshInterval: API_CONFIG.REFRESH_INTERVALS.DEVICE_STATUS,
  });
}

export function useDeviceStats() {
  const response = useApi<{data: DeviceStats, status: string}>('/api/devices/stats', {
    refreshInterval: API_CONFIG.REFRESH_INTERVALS.DEVICE_STATS,
  });

  return {
    ...response,
    data: response.data?.data || null, // Extract data from response.data.data
  };
}

export function useDeviceStatus(deviceId: string) {
  return useApi<{
    device_id: string;
    status: string;
    uptime_percentage: number;
    last_restart: string | null;
    status_history: Array<{
      status: string;
      timestamp: string;
      duration_minutes: number;
    }>;
  }>(`/api/devices/${deviceId}/status`, {
    enabled: !!deviceId,
    refreshInterval: API_CONFIG.REFRESH_INTERVALS.DEVICE_STATUS,
  });
}

// ===== LEGACY COMPATIBILITY HOOKS =====

/**
 * @deprecated Use useSensorData instead
 */
export function useApiOptimized(endpoint: string, refreshInterval: number = 10000) {
  return useApi(endpoint, { refreshInterval });
}

/**
 * @deprecated Use useDevices instead
 */
export function useDevicesLegacy() {
  return useDevices();
}
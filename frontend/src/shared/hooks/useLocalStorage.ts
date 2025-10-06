import { useState, useEffect, useCallback } from 'react';

interface UseLocalStorageOptions<T> {
  defaultValue: T;
  serialize?: (value: T) => string;
  deserialize?: (value: string) => T;
}

export function useLocalStorage<T>(
  key: string,
  options: UseLocalStorageOptions<T>
) {
  const {
    defaultValue,
    serialize = JSON.stringify,
    deserialize = JSON.parse,
  } = options;

  // Get initial value from localStorage or use default
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    
    try {
      const item = window.localStorage.getItem(key);
      return item ? deserialize(item) : defaultValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return defaultValue;
    }
  });

  // Update localStorage when value changes
  const setStoredValue = useCallback((newValue: T | ((prev: T) => T)) => {
    try {
      // Allow value to be a function so we have the same API as useState
      const valueToStore = newValue instanceof Function ? newValue(value) : newValue;
      setValue(valueToStore);
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, serialize(valueToStore));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, serialize, value]);

  // Remove item from localStorage
  const removeValue = useCallback(() => {
    try {
      setValue(defaultValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, defaultValue]);

  return [value, setStoredValue, removeValue] as const;
}

// ===== THEME PREFERENCE HOOK =====

export function useThemePreference() {
  return useLocalStorage('theme-preference', {
    defaultValue: 'system' as 'light' | 'dark' | 'system',
  });
}

// ===== DASHBOARD PREFERENCES HOOK =====

export interface DashboardPreferences {
  autoRefresh: boolean;
  refreshInterval: number;
  compactView: boolean;
  showDescriptions: boolean;
}

export function useDashboardPreferences() {
  return useLocalStorage('dashboard-preferences', {
    defaultValue: {
      autoRefresh: true,
      refreshInterval: 10000,
      compactView: false,
      showDescriptions: true,
    } as DashboardPreferences,
  });
}

// ===== DEVICE FILTERS HOOK =====

export interface DeviceFilters {
  status: 'all' | 'online' | 'offline';
  location: string;
  sortBy: 'name' | 'status' | 'lastSeen';
  sortOrder: 'asc' | 'desc';
}

export function useDeviceFilters() {
  return useLocalStorage('device-filters', {
    defaultValue: {
      status: 'all',
      location: '',
      sortBy: 'name',
      sortOrder: 'asc',
    } as DeviceFilters,
  });
}
/**
 * Constants and configurations for Kampung Tani IoT Frontend
 */

// ===== API CONFIGURATION =====
export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
  REFRESH_INTERVALS: {
    SENSOR_DATA: 10000, // 10 seconds
    DEVICE_STATS: 10000, // 10 seconds
    DEVICE_STATUS: 30000, // 30 seconds
  },
  PAGINATION: {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 50,
    MAX_LIMIT: 200,
  },
} as const;

// ===== SENSOR CONFIGURATION =====
export const SENSOR_CONFIG = {
  NORMAL_RANGES: {
    moisture: { min: 30, max: 70 },
    temperature: { min: 20, max: 30 },
    ph: { min: 6.0, max: 7.5 },
    conductivity: { min: 100, max: 800 },
    nitrogen: { min: 20, max: 50 },
    phosphorus: { min: 10, max: 30 },
    potassium: { min: 80, max: 150 },
    salinity: { min: 0, max: 2 },
    light: { min: 200, max: 800 },
    tds: { min: 50, max: 500 },
  },
  UNITS: {
    moisture: '%',
    temperature: '°C',
    ph: '',
    conductivity: ' μS/cm',
    nitrogen: ' mg/kg',
    phosphorus: ' mg/kg',
    potassium: ' mg/kg',
    salinity: ' ppt',
    light: ' lux',
    tds: ' ppm',
  },
  DESCRIPTIONS: {
    moisture: 'Soil water content level',
    temperature: 'Ambient temperature',
    ph: 'Soil acidity level',
    conductivity: 'Electrical conductivity',
    nitrogen: 'Nitrogen content',
    phosphorus: 'Phosphorus content',
    potassium: 'Potassium content',
    salinity: 'Salt concentration',
    light: 'Light intensity',
    tds: 'Total dissolved solids',
  },
} as const;

// ===== THEME COLORS =====
export const THEME_COLORS = {
  SENSOR_CARDS: {
    moisture: {
      text: 'text-blue-700 dark:text-blue-300',
      bg: 'bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-100 dark:from-blue-900 dark:via-sky-900 dark:to-indigo-900',
      icon: 'bg-gradient-to-r from-blue-500 to-sky-600 dark:from-blue-400 dark:to-sky-500',
    },
    temperature: {
      text: 'text-orange-700 dark:text-orange-300',
      bg: 'bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-100 dark:from-orange-800 dark:via-amber-800 dark:to-yellow-800',
      icon: 'bg-gradient-to-r from-orange-500 to-red-500 dark:from-orange-400 dark:to-red-400',
    },
    ph: {
      text: 'text-purple-700 dark:text-purple-300',
      bg: 'bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-100 dark:from-purple-900 dark:via-indigo-900 dark:to-blue-900',
      icon: 'bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500',
    },
    conductivity: {
      text: 'text-amber-700 dark:text-amber-300',
      bg: 'bg-gradient-to-br from-amber-50 via-yellow-50 to-orange-100 dark:from-amber-800 dark:via-yellow-800 dark:to-orange-800',
      icon: 'bg-gradient-to-r from-amber-500 to-yellow-500 dark:from-amber-400 dark:to-yellow-400',
    },
    nitrogen: {
      text: 'text-green-700 dark:text-green-300',
      bg: 'bg-gradient-to-br from-green-50 via-emerald-50 to-lime-100 dark:from-green-900 dark:via-emerald-900 dark:to-lime-900',
      icon: 'bg-gradient-to-r from-green-500 to-emerald-600 dark:from-green-400 dark:to-emerald-500',
    },
    phosphorus: {
      text: 'text-indigo-700 dark:text-indigo-300',
      bg: 'bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100 dark:from-indigo-900 dark:via-blue-900 dark:to-purple-900',
      icon: 'bg-gradient-to-r from-indigo-500 to-blue-600 dark:from-indigo-400 dark:to-blue-500',
    },
    potassium: {
      text: 'text-pink-700 dark:text-pink-300',
      bg: 'bg-gradient-to-br from-pink-50 via-rose-50 to-red-100 dark:from-pink-900 dark:via-rose-900 dark:to-red-900',
      icon: 'bg-gradient-to-r from-pink-500 to-rose-600 dark:from-pink-400 dark:to-rose-500',
    },
    salinity: {
      text: 'text-blue-700 dark:text-blue-300',
      bg: 'bg-gradient-to-br from-sky-50 via-blue-50 to-indigo-100 dark:from-sky-900 dark:via-blue-900 dark:to-indigo-900',
      icon: 'bg-gradient-to-r from-sky-500 to-blue-600 dark:from-sky-400 dark:to-blue-500',
    },
    light: {
      text: 'text-yellow-700 dark:text-yellow-300',
      bg: 'bg-gradient-to-br from-yellow-50 via-amber-50 to-orange-100 dark:from-yellow-900 dark:via-amber-900 dark:to-orange-900',
      icon: 'bg-gradient-to-r from-yellow-500 to-amber-600 dark:from-yellow-400 dark:to-amber-500',
    },
    tds: {
      text: 'text-cyan-700 dark:text-cyan-300',
      bg: 'bg-gradient-to-br from-cyan-50 via-teal-50 to-blue-100 dark:from-cyan-900 dark:via-teal-900 dark:to-blue-900',
      icon: 'bg-gradient-to-r from-cyan-500 to-teal-600 dark:from-cyan-400 dark:to-teal-500',
    },
  },
  STATUS: {
    online: {
      bg: 'bg-emerald-50 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 border-emerald-200 dark:border-emerald-800',
      pulse: 'bg-emerald-500 dark:bg-emerald-400',
      iconBg: 'bg-emerald-100 dark:bg-emerald-800',
    },
    offline: {
      bg: 'bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
      pulse: 'bg-red-500 dark:bg-red-400',
      iconBg: 'bg-red-100 dark:bg-red-800',
    },
    restarted: {
      bg: 'bg-amber-50 dark:bg-amber-900 text-amber-800 dark:text-amber-200 border-amber-200 dark:border-amber-800',
      pulse: 'bg-amber-500 dark:bg-amber-400',
      iconBg: 'bg-amber-100 dark:bg-amber-800',
    },
  },
  STATS_CARDS: {
    total: {
      bg: 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-100 dark:from-blue-950 dark:via-indigo-950 dark:to-purple-950',
      border: 'border-blue-200 dark:border-blue-800',
      text: 'text-blue-800 dark:text-blue-200',
      value: 'text-blue-900 dark:text-blue-100',
      icon: 'bg-gradient-to-r from-blue-500 to-indigo-600 dark:from-blue-400 dark:to-indigo-500',
    },
    online: {
      bg: 'bg-gradient-to-br from-emerald-50 via-green-50 to-lime-100 dark:from-emerald-900 dark:via-green-900 dark:to-lime-900',
      border: 'border-emerald-200 dark:border-emerald-800',
      text: 'text-emerald-800 dark:text-emerald-200',
      value: 'text-emerald-900 dark:text-emerald-100',
      icon: 'bg-gradient-to-r from-emerald-500 to-green-600 dark:from-emerald-400 dark:to-green-500',
    },
    offline: {
      bg: 'bg-gradient-to-br from-red-50 via-rose-50 to-pink-100 dark:from-red-950 dark:via-rose-950 dark:to-pink-950',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-800 dark:text-red-200',
      value: 'text-red-900 dark:text-red-100',
      icon: 'bg-gradient-to-r from-red-500 to-rose-600 dark:from-red-400 dark:to-rose-500',
    },
    data: {
      bg: 'bg-gradient-to-br from-purple-50 via-indigo-50 to-blue-100 dark:from-purple-900 dark:via-indigo-900 dark:to-blue-900',
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-800 dark:text-purple-200',
      value: 'text-purple-900 dark:text-purple-100',
      icon: 'bg-gradient-to-r from-purple-500 to-indigo-600 dark:from-purple-400 dark:to-indigo-500',
    },
  },
} as const;

// ===== UI CONSTANTS =====
export const UI_CONSTANTS = {
  ANIMATION: {
    HOVER_SCALE: 'hover:scale-105',
    BUTTON_ACTIVE: 'active:scale-95',
    TRANSITION: 'transition-all duration-200',
    PULSE: 'animate-pulse',
    SPIN: 'animate-spin',
  },
  SHADOWS: {
    CARD: 'hover:shadow-lg',
    BUTTON: 'hover:shadow-lg',
    SMALL: 'shadow-sm',
    MEDIUM: 'shadow-md',
    LARGE: 'shadow-lg',
  },
  BORDERS: {
    RADIUS: {
      DEFAULT: 'rounded-lg',
      SMALL: 'rounded-md',
      LARGE: 'rounded-xl',
      FULL: 'rounded-full',
    },
  },
} as const;

// ===== DEVICE STATUS CONSTANTS =====
export const DEVICE_STATUS = {
  ONLINE: 'online',
  OFFLINE: 'offline',
  RESTARTED: 'restarted',
} as const;

// ===== SENSOR TYPES =====
export type SensorType = keyof typeof SENSOR_CONFIG.NORMAL_RANGES;
export type DeviceStatusType = keyof typeof THEME_COLORS.STATUS;
export type StatsCardType = keyof typeof THEME_COLORS.STATS_CARDS;

// ===== ROUTES =====
export const ROUTES = {
  DASHBOARD: '/dashboard',
  DEVICES: '/devices',
  TABLE: '/table',
  HOME: '/',
} as const;

// ===== DATE/TIME FORMAT =====
export const DATE_FORMATS = {
  FULL: {
    dateStyle: 'full' as const,
    timeStyle: 'medium' as const,
  },
  SHORT: {
    dateStyle: 'short' as const,
    timeStyle: 'short' as const,
  },
  TIME_ONLY: {
    hour: '2-digit' as const,
    minute: '2-digit' as const,
  },
} as const;
import { SENSOR_CONFIG, THEME_COLORS, DEVICE_STATUS, DATE_FORMATS } from './constants';
import type { SensorType, DeviceStatusType } from './constants';

// ===== SENSOR UTILITIES =====

/**
 * Check if sensor value is within normal range
 */
export function isValueInNormalRange(sensorType: SensorType, value: number): boolean {
  const range = SENSOR_CONFIG.NORMAL_RANGES[sensorType];
  if (!range) return true;
  return value >= range.min && value <= range.max;
}

/**
 * Get sensor status based on value range
 */
export function getSensorStatus(sensorType: SensorType, value: number): 'normal' | 'warning' | 'critical' {
  const range = SENSOR_CONFIG.NORMAL_RANGES[sensorType];
  if (!range) return 'normal';
  
  const { min, max } = range;
  const marginPercent = 0.1; // 10% margin for warning
  const warningMin = min + (max - min) * marginPercent;
  const warningMax = max - (max - min) * marginPercent;
  
  if (value < min || value > max) return 'critical';
  if (value < warningMin || value > warningMax) return 'warning';
  return 'normal';
}

/**
 * Format sensor value with appropriate unit
 */
export function formatSensorValue(sensorType: SensorType, value: number): string {
  const unit = SENSOR_CONFIG.UNITS[sensorType] || '';
  const decimals = sensorType === 'ph' ? 1 : 0;
  return `${value.toFixed(decimals)}${unit}`;
}

/**
 * Get sensor description
 */
export function getSensorDescription(sensorType: SensorType): string {
  return SENSOR_CONFIG.DESCRIPTIONS[sensorType] || '';
}

// ===== THEME UTILITIES =====

/**
 * Get sensor card theme colors
 */
export function getSensorCardTheme(sensorType: SensorType) {
  return THEME_COLORS.SENSOR_CARDS[sensorType] || THEME_COLORS.SENSOR_CARDS.moisture;
}

/**
 * Get device status theme colors
 */
export function getDeviceStatusTheme(status: DeviceStatusType) {
  return THEME_COLORS.STATUS[status] || THEME_COLORS.STATUS.offline;
}

/**
 * Get stats card theme colors
 */
export function getStatsCardTheme(type: keyof typeof THEME_COLORS.STATS_CARDS) {
  return THEME_COLORS.STATS_CARDS[type] || THEME_COLORS.STATS_CARDS.total;
}

// ===== DEVICE UTILITIES =====

/**
 * Check if device is online based on last seen timestamp
 */
export function isDeviceOnline(lastSeen: string, offlineThresholdMinutes: number = 5): boolean {
  const lastSeenTime = new Date(lastSeen).getTime();
  const now = Date.now();
  const thresholdMs = offlineThresholdMinutes * 60 * 1000;
  
  return (now - lastSeenTime) <= thresholdMs;
}

/**
 * Get device status based on last seen and status history
 */
export function getDeviceStatus(
  lastSeen: string, 
  hasRecentRestart: boolean = false,
  offlineThresholdMinutes: number = 5
): DeviceStatusType {
  if (hasRecentRestart) return DEVICE_STATUS.RESTARTED;
  return isDeviceOnline(lastSeen, offlineThresholdMinutes) ? DEVICE_STATUS.ONLINE : DEVICE_STATUS.OFFLINE;
}

/**
 * Calculate device uptime percentage
 */
export function calculateUptimePercentage(onlineMinutes: number, totalMinutes: number): number {
  if (totalMinutes === 0) return 0;
  return Math.round((onlineMinutes / totalMinutes) * 100);
}

// ===== DATE UTILITIES =====

/**
 * Format date with locale-specific formatting
 */
export function formatDate(
  date: string | Date, 
  format: keyof typeof DATE_FORMATS = 'SHORT',
  locale: string = 'id-ID'
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat(locale, DATE_FORMATS[format]).format(dateObj);
}

/**
 * Get relative time string (e.g., "2 minutes ago")
 */
export function getRelativeTime(date: string | Date, locale: string = 'id-ID'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' });
  
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return rtf.format(-days, 'day');
  if (hours > 0) return rtf.format(-hours, 'hour');
  if (minutes > 0) return rtf.format(-minutes, 'minute');
  return rtf.format(-seconds, 'second');
}

/**
 * Check if date is today
 */
export function isToday(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return dateObj.getDate() === today.getDate() &&
         dateObj.getMonth() === today.getMonth() &&
         dateObj.getFullYear() === today.getFullYear();
}

// ===== VALIDATION UTILITIES =====

/**
 * Validate if value is a valid number
 */
export function isValidNumber(value: any): boolean {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Validate if string is a valid date
 */
export function isValidDate(dateString: string): boolean {
  const date = new Date(dateString);
  return !isNaN(date.getTime());
}

/**
 * Safe number parsing with fallback
 */
export function safeParseNumber(value: any, fallback: number = 0): number {
  const parsed = Number(value);
  return isValidNumber(parsed) ? parsed : fallback;
}

// ===== ARRAY UTILITIES =====

/**
 * Group array of objects by a key
 */
export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = String(item[key]);
    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }
    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Remove duplicates from array based on a key
 */
export function uniqueBy<T>(array: T[], key: keyof T): T[] {
  const seen = new Set();
  return array.filter(item => {
    const keyValue = item[key];
    if (seen.has(keyValue)) {
      return false;
    }
    seen.add(keyValue);
    return true;
  });
}

// ===== STRING UTILITIES =====

/**
 * Capitalize first letter of string
 */
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Convert camelCase to Title Case
 */
export function camelToTitle(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, s => s.toUpperCase())
    .trim();
}

/**
 * Truncate string with ellipsis
 */
export function truncate(str: string, maxLength: number, suffix: string = '...'): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}
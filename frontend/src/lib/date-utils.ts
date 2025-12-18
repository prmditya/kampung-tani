/**
 * Date/Time Utilities
 * Handles UTC to local time conversion for timestamps from the backend
 */

/**
 * Parse a timestamp string from the backend as UTC.
 * Backend stores timestamps in UTC but without the 'Z' suffix,
 * so we need to append it to ensure JavaScript interprets it correctly.
 *
 * @param timestamp - ISO timestamp string from backend (e.g., "2024-12-17T07:25:20")
 * @returns Date object in UTC
 */
export function parseUTCTimestamp(timestamp: string | Date): Date {
  if (timestamp instanceof Date) {
    return timestamp;
  }

  // If the timestamp doesn't have timezone info, assume it's UTC and append 'Z'
  if (
    !timestamp.endsWith('Z') &&
    !timestamp.includes('+') &&
    !timestamp.includes('-', 10)
  ) {
    return new Date(timestamp + 'Z');
  }

  return new Date(timestamp);
}

/**
 * Format a UTC timestamp to local time string (WIB +7)
 *
 * @param timestamp - ISO timestamp string from backend
 * @param options - Intl.DateTimeFormat options
 * @returns Formatted local time string
 */
export function formatToWIB(
  timestamp: string | Date,
  options: Intl.DateTimeFormatOptions = {},
): string {
  const date = parseUTCTimestamp(timestamp);

  return date.toLocaleString('en-US', {
    timeZone: 'Asia/Jakarta',
    ...options,
  });
}

/**
 * Format a UTC timestamp to local time only (WIB +7)
 *
 * @param timestamp - ISO timestamp string from backend
 * @param options - Additional options
 * @returns Formatted local time string (HH:mm:ss)
 */
export function formatTimeToWIB(
  timestamp: string | Date,
  options: { hour12?: boolean; includeSeconds?: boolean } = {},
): string {
  const date = parseUTCTimestamp(timestamp);
  const { hour12 = false, includeSeconds = true } = options;

  const formatOptions: Intl.DateTimeFormatOptions = {
    timeZone: 'Asia/Jakarta',
    hour: '2-digit',
    minute: '2-digit',
    hour12,
  };

  if (includeSeconds) {
    formatOptions.second = '2-digit';
  }

  return date.toLocaleTimeString('en-GB', formatOptions);
}

/**
 * Format a UTC timestamp to date and time (WIB +7)
 *
 * @param timestamp - ISO timestamp string from backend
 * @returns Formatted date and time string
 */
export function formatDateTimeToWIB(timestamp: string | Date): string {
  const date = parseUTCTimestamp(timestamp);

  return date.toLocaleString('en-GB', {
    timeZone: 'Asia/Jakarta',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatDateTimeToISO = (date: Date | undefined) => {
  if (!date) return null;
  return date.toISOString();
};

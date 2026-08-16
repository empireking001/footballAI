import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Formats a UTC kickoff consistently for the site's configured default timezone. */
export function formatKickoff(iso: string, timeZone = 'Africa/Lagos'): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return 'Kickoff time unavailable';

  const dateKey = (value: Date) => new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(value);
  const dayKey = dateKey(date);
  const now = new Date();
  const todayKey = dateKey(now);
  const tomorrow = new Date(now);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const tomorrowKey = dateKey(tomorrow);
  const time = new Intl.DateTimeFormat('en-NG', {
    timeZone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZoneName: 'short',
  }).format(date);

  if (dayKey === todayKey) return `Today, ${time}`;
  if (dayKey === tomorrowKey) return `Tomorrow, ${time}`;
  return `${new Intl.DateTimeFormat('en-NG', {
    timeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(date)}, ${time}`;
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(
    amount,
  );
}

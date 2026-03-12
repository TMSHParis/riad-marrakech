import { MONTHS_FR } from './constants';
import type { Currency } from './types';

export function calculateNights(checkIn: string, checkOut: string): number {
  const start = new Date(checkIn);
  const end = new Date(checkOut);
  const diff = end.getTime() - start.getTime();
  return Math.max(0, Math.round(diff / (1000 * 60 * 60 * 24)));
}

export function toMAD(amount: number, currency: Currency, rate: number): number {
  return currency === 'MAD' ? amount : amount * rate;
}

export function toEUR(amount: number, currency: Currency, rate: number): number {
  return currency === 'EUR' ? amount : amount / rate;
}

export function formatMAD(amount: number): string {
  return new Intl.NumberFormat('fr-MA', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' MAD';
}

export function formatEUR(amount: number): string {
  return new Intl.NumberFormat('fr-FR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount) + ' €';
}

export function formatCurrency(amount: number, currency: Currency): string {
  return currency === 'MAD' ? formatMAD(amount) : formatEUR(amount);
}

export function formatDate(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export function formatDateShort(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return date.toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

export function getMonthYear(date: Date): string {
  return `${MONTHS_FR[date.getMonth()]} ${date.getFullYear()}`;
}

export function getMonthYearKey(dateStr: string): string {
  const date = new Date(dateStr + 'T00:00:00');
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
}

export function monthKeyToLabel(key: string): string {
  const [year, month] = key.split('-');
  return `${MONTHS_FR[parseInt(month) - 1]} ${year}`;
}

export function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

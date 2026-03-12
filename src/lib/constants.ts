import type { ExpenseCategory } from './types';

export const EXPENSE_CATEGORIES: {
  value: ExpenseCategory;
  label: string;
  icon: string;
}[] = [
  { value: 'produits_menagers', label: 'Produits ménagers', icon: 'spray-can' },
  { value: 'eau', label: 'Eau', icon: 'droplets' },
  { value: 'electricite', label: 'Électricité', icon: 'zap' },
  { value: 'gaz', label: 'Gaz', icon: 'flame' },
  { value: 'syndic', label: 'Syndic', icon: 'building' },
  { value: 'pressing', label: 'Pressing', icon: 'shirt' },
  { value: 'fibre', label: 'Fibre', icon: 'wifi' },
  { value: 'travaux', label: 'Travaux', icon: 'wrench' },
  { value: 'autre', label: 'Autre', icon: 'more-horizontal' },
];

export const MONTHS_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

export const DEFAULT_EXCHANGE_RATE = 10.80;

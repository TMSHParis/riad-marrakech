export type Currency = 'MAD' | 'EUR';

export interface Sejour {
  id: string;
  check_in: string;
  check_out: string;
  guest_name: string | null;
  amount: number;
  currency: Currency;
  notes: string | null;
  nights: number;
  created_at: string;
}

export interface Depense {
  id: string;
  amount: number;
  currency: Currency;
  category: ExpenseCategory;
  description: string | null;
  date: string;
  created_at: string;
}

export type ExpenseCategory =
  | 'produits_menagers'
  | 'eau'
  | 'electricite'
  | 'gaz'
  | 'syndic'
  | 'pressing'
  | 'fibre'
  | 'travaux'
  | 'autre';

export interface Settings {
  exchange_rate_eur_to_mad: number;
}

export interface Contact {
  id: string;
  name: string;
  fonction: string;
  phone: string;
  created_at: string;
}

export interface MonthlyStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  splitAmount: number;
  revenueMAD: number;
  expensesMAD: number;
}

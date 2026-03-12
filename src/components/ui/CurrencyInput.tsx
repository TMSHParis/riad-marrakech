'use client';

import type { Currency } from '@/lib/types';

interface CurrencyInputProps {
  amount: string;
  currency: Currency;
  onAmountChange: (amount: string) => void;
  onCurrencyChange: (currency: Currency) => void;
  label?: string;
}

export function CurrencyInput({
  amount,
  currency,
  onAmountChange,
  onCurrencyChange,
  label = 'Montant',
}: CurrencyInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-midnight mb-1.5">
        {label}
      </label>
      <div className="flex gap-2">
        <input
          type="number"
          inputMode="decimal"
          step="0.01"
          min="0"
          value={amount}
          onChange={(e) => onAmountChange(e.target.value)}
          placeholder="0.00"
          className="flex-1 px-4 py-2.5 rounded-xl border border-sand-200 bg-white text-midnight focus:outline-none focus:ring-2 focus:ring-terracotta-300 focus:border-transparent text-base"
          required
        />
        <div className="flex rounded-xl border border-sand-200 overflow-hidden">
          <button
            type="button"
            onClick={() => onCurrencyChange('MAD')}
            className={`px-3 py-2.5 text-sm font-medium transition-colors ${
              currency === 'MAD'
                ? 'bg-terracotta-500 text-white'
                : 'bg-white text-sand-500 hover:bg-sand-50'
            }`}
          >
            MAD
          </button>
          <button
            type="button"
            onClick={() => onCurrencyChange('EUR')}
            className={`px-3 py-2.5 text-sm font-medium transition-colors ${
              currency === 'EUR'
                ? 'bg-terracotta-500 text-white'
                : 'bg-white text-sand-500 hover:bg-sand-50'
            }`}
          >
            EUR
          </button>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useMemo } from 'react';
import type { Sejour, Depense, MonthlyStats } from '@/lib/types';
import { toMAD } from '@/lib/utils';

export function useDashboard(
  sejours: Sejour[],
  depenses: Depense[],
  exchangeRate: number,
  year: number,
  month: number // 0-indexed
) {
  const monthlyStats = useMemo((): MonthlyStats => {
    const monthSejours = sejours.filter((s) => {
      const d = new Date(s.check_in + 'T00:00:00');
      return d.getFullYear() === year && d.getMonth() === month;
    });

    const monthDepenses = depenses.filter((d) => {
      const date = new Date(d.date + 'T00:00:00');
      return date.getFullYear() === year && date.getMonth() === month;
    });

    const revenueMAD = monthSejours.reduce(
      (sum, s) => sum + toMAD(s.amount, s.currency, exchangeRate),
      0
    );

    const expensesMAD = monthDepenses.reduce(
      (sum, d) => sum + toMAD(d.amount, d.currency, exchangeRate),
      0
    );

    const netProfit = revenueMAD - expensesMAD;
    const splitAmount = netProfit / 2;

    return {
      totalRevenue: revenueMAD,
      totalExpenses: expensesMAD,
      netProfit,
      splitAmount,
      revenueMAD,
      expensesMAD,
    };
  }, [sejours, depenses, exchangeRate, year, month]);

  const yearlyStats = useMemo(() => {
    return Array.from({ length: 12 }, (_, m) => {
      const mSejours = sejours.filter((s) => {
        const d = new Date(s.check_in + 'T00:00:00');
        return d.getFullYear() === year && d.getMonth() === m;
      });

      const mDepenses = depenses.filter((d) => {
        const date = new Date(d.date + 'T00:00:00');
        return date.getFullYear() === year && date.getMonth() === m;
      });

      const revenue = mSejours.reduce(
        (sum, s) => sum + toMAD(s.amount, s.currency, exchangeRate),
        0
      );
      const expenses = mDepenses.reduce(
        (sum, d) => sum + toMAD(d.amount, d.currency, exchangeRate),
        0
      );

      return { month: m, revenue, expenses, net: revenue - expenses };
    });
  }, [sejours, depenses, exchangeRate, year]);

  return { monthlyStats, yearlyStats };
}

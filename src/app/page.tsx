'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useSejours } from '@/lib/hooks/useSejours';
import { useDepenses } from '@/lib/hooks/useDepenses';
import { useSettings } from '@/lib/hooks/useSettings';
import { useDashboard } from '@/lib/hooks/useDashboard';
import { formatMAD, formatEUR, toEUR, formatDateShort } from '@/lib/utils';
import { MONTHS_FR } from '@/lib/constants';
import { ChevronLeft, ChevronRight, TrendingUp, TrendingDown, Wallet, Users } from 'lucide-react';

const MONTH_ABBR = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'];

export default function Dashboard() {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());

  const { sejours, loading: sejoursLoading } = useSejours();
  const { depenses, loading: depensesLoading } = useDepenses();
  const { exchangeRate, loading: settingsLoading } = useSettings();

  const isLoading = sejoursLoading || depensesLoading || settingsLoading;

  const { monthlyStats, yearlyStats } = useDashboard(sejours, depenses, exchangeRate, year, month);

  const recentSejours = useMemo(() => {
    return sejours
      .filter((s) => {
        const d = new Date(s.check_in + 'T00:00:00');
        return d.getFullYear() === year && d.getMonth() === month;
      })
      .slice(0, 3);
  }, [sejours, year, month]);

  const maxYearlyValue = useMemo(() => {
    return Math.max(1, ...yearlyStats.map((s) => Math.max(s.revenue, s.expenses)));
  }, [yearlyStats]);

  function navigateMonth(direction: -1 | 1) {
    let newMonth = month + direction;
    let newYear = year;
    if (newMonth < 0) {
      newMonth = 11;
      newYear -= 1;
    } else if (newMonth > 11) {
      newMonth = 0;
      newYear += 1;
    }
    setMonth(newMonth);
    setYear(newYear);
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  const profit = monthlyStats.netProfit;
  const split = monthlyStats.splitAmount;
  const isPositive = profit >= 0;

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Header */}
      <div className="bg-gradient-to-br from-terracotta-500 to-terracotta-600 px-5 pt-12 pb-8 rounded-b-[2rem] shadow-lg">
        <div className="text-center">
          <h1 className="font-sans text-3xl font-bold text-white tracking-wide">
            Fusion
          </h1>
          <p className="text-terracotta-100 text-sm mt-1 tracking-widest uppercase">
            Gestion Airbnb
          </p>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center justify-between mt-6 bg-white/15 backdrop-blur-sm rounded-2xl px-4 py-3">
          <button
            onClick={() => navigateMonth(-1)}
            className="p-2 rounded-xl hover:bg-white/20 active:bg-white/30 transition-colors"
            aria-label="Mois précédent"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <span className="text-white font-semibold text-lg tracking-wide">
            {MONTHS_FR[month]} {year}
          </span>
          <button
            onClick={() => navigateMonth(1)}
            className="p-2 rounded-xl hover:bg-white/20 active:bg-white/30 transition-colors"
            aria-label="Mois suivant"
          >
            <ChevronRight className="w-5 h-5 text-white" />
          </button>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-5 pb-6">
        {/* Stat Cards */}
        <div className="grid grid-cols-3 gap-3">
          {/* Revenus */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand-100">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-7 h-7 rounded-lg bg-warm-orange/10 flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-warm-orange" />
              </div>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-sand-500 font-medium">
              Revenus
            </p>
            <p className="text-sm font-bold text-midnight mt-0.5 leading-tight">
              {formatMAD(monthlyStats.totalRevenue)}
            </p>
            <p className="text-[10px] text-sand-400 mt-0.5">
              {formatEUR(toEUR(monthlyStats.totalRevenue, 'MAD', exchangeRate))}
            </p>
          </div>

          {/* Depenses */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand-100">
            <div className="flex items-center gap-1.5 mb-2">
              <div className="w-7 h-7 rounded-lg bg-deep-red-500/10 flex items-center justify-center">
                <TrendingDown className="w-4 h-4 text-deep-red-500" />
              </div>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-sand-500 font-medium">
              Dépenses
            </p>
            <p className="text-sm font-bold text-midnight mt-0.5 leading-tight">
              {formatMAD(monthlyStats.totalExpenses)}
            </p>
            <p className="text-[10px] text-sand-400 mt-0.5">
              {formatEUR(toEUR(monthlyStats.totalExpenses, 'MAD', exchangeRate))}
            </p>
          </div>

          {/* Benefice */}
          <div className="bg-white rounded-2xl p-4 shadow-sm border border-sand-100">
            <div className="flex items-center gap-1.5 mb-2">
              <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                isPositive ? 'bg-olive-500/10' : 'bg-deep-red-500/10'
              }`}>
                <Wallet className={`w-4 h-4 ${isPositive ? 'text-olive-500' : 'text-deep-red-500'}`} />
              </div>
            </div>
            <p className="text-[10px] uppercase tracking-wider text-sand-500 font-medium">
              Bénéfice
            </p>
            <p className={`text-sm font-bold mt-0.5 leading-tight ${
              isPositive ? 'text-olive-500' : 'text-deep-red-500'
            }`}>
              {formatMAD(profit)}
            </p>
            <p className="text-[10px] text-sand-400 mt-0.5">
              {formatEUR(toEUR(profit, 'MAD', exchangeRate))}
            </p>
          </div>
        </div>

        {/* 50/50 Split Card */}
        <div className={`rounded-2xl p-5 shadow-md border ${
          isPositive
            ? 'bg-gradient-to-br from-olive-400/5 to-olive-500/10 border-olive-400/20'
            : 'bg-gradient-to-br from-deep-red-500/5 to-deep-red-500/10 border-deep-red-500/20'
        }`}>
          <div className="flex items-center gap-2 mb-4">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
              isPositive ? 'bg-olive-500/15' : 'bg-deep-red-500/15'
            }`}>
              <Users className={`w-4.5 h-4.5 ${isPositive ? 'text-olive-500' : 'text-deep-red-500'}`} />
            </div>
            <h2 className="font-sans text-lg font-bold text-midnight">
              Partage 50/50
            </h2>
          </div>

          <div className="flex items-stretch">
            {/* Kam */}
            <div className="flex-1 text-center py-3">
              <p className="text-xs uppercase tracking-wider text-sand-500 font-medium mb-1">
                Kam
              </p>
              <p className={`text-xl font-bold ${isPositive ? 'text-olive-500' : 'text-deep-red-500'}`}>
                {formatMAD(split)}
              </p>
              <p className="text-xs text-sand-400 mt-1">
                {formatEUR(toEUR(split, 'MAD', exchangeRate))}
              </p>
            </div>

            {/* Divider */}
            <div className="flex flex-col items-center justify-center px-3">
              <div className={`w-px h-full min-h-[60px] ${
                isPositive ? 'bg-olive-400/30' : 'bg-deep-red-500/30'
              }`} />
            </div>

            {/* Partenaire */}
            <div className="flex-1 text-center py-3">
              <p className="text-xs uppercase tracking-wider text-sand-500 font-medium mb-1">
                Amélia
              </p>
              <p className={`text-xl font-bold ${isPositive ? 'text-olive-500' : 'text-deep-red-500'}`}>
                {formatMAD(split)}
              </p>
              <p className="text-xs text-sand-400 mt-1">
                {formatEUR(toEUR(split, 'MAD', exchangeRate))}
              </p>
            </div>
          </div>
        </div>

        {/* Recent Stays */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-sand-100">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-sans text-lg font-bold text-midnight">
              Séjours récents
            </h2>
            <Link
              href="/sejours"
              className="text-xs font-medium text-terracotta-500 hover:text-terracotta-600 transition-colors"
            >
              Voir tout
            </Link>
          </div>

          {recentSejours.length === 0 ? (
            <p className="text-sm text-sand-400 text-center py-6">
              Aucun séjour ce mois
            </p>
          ) : (
            <div className="space-y-3">
              {recentSejours.map((sejour) => (
                <div
                  key={sejour.id}
                  className="flex items-center justify-between py-2.5 border-b border-sand-100 last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-midnight truncate">
                      {sejour.guest_name || 'Invité'}
                    </p>
                    <p className="text-xs text-sand-400 mt-0.5">
                      {formatDateShort(sejour.check_in)} — {formatDateShort(sejour.check_out)}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-warm-orange ml-3">
                    {sejour.currency === 'MAD'
                      ? formatMAD(sejour.amount)
                      : formatEUR(sejour.amount)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Yearly Overview */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-sand-100">
          <h2 className="font-sans text-lg font-bold text-midnight mb-4">
            Aperçu {year}
          </h2>

          <div className="space-y-2.5">
            {yearlyStats.map((stat, i) => {
              const revWidth = maxYearlyValue > 0 ? (stat.revenue / maxYearlyValue) * 100 : 0;
              const expWidth = maxYearlyValue > 0 ? (stat.expenses / maxYearlyValue) * 100 : 0;
              const isCurrent = i === month;

              return (
                <div key={i} className={`flex items-center gap-2.5 ${
                  isCurrent ? 'bg-terracotta-50 -mx-2 px-2 py-1.5 rounded-xl' : ''
                }`}>
                  <span className={`text-xs w-4 text-center font-semibold shrink-0 ${
                    isCurrent ? 'text-terracotta-500' : 'text-sand-400'
                  }`}>
                    {MONTH_ABBR[i]}
                  </span>
                  <div className="flex-1 flex flex-col gap-1">
                    <div
                      className="h-2.5 rounded-full bg-warm-orange/80 transition-all duration-500"
                      style={{ width: `${Math.max(revWidth, 0.5)}%` }}
                    />
                    <div
                      className="h-2.5 rounded-full bg-deep-red-500/60 transition-all duration-500"
                      style={{ width: `${Math.max(expWidth, 0.5)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-center gap-6 mt-4 pt-3 border-t border-sand-100">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-warm-orange/80" />
              <span className="text-[10px] text-sand-500">Revenus</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-deep-red-500/60" />
              <span className="text-[10px] text-sand-500">Dépenses</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-sand-50 animate-pulse">
      {/* Header skeleton */}
      <div className="bg-gradient-to-br from-terracotta-500 to-terracotta-600 px-5 pt-12 pb-8 rounded-b-[2rem]">
        <div className="text-center space-y-2">
          <div className="h-8 w-48 bg-white/20 rounded-lg mx-auto" />
          <div className="h-4 w-32 bg-white/15 rounded mx-auto" />
        </div>
        <div className="mt-6 bg-white/15 rounded-2xl px-4 py-5">
          <div className="h-5 w-36 bg-white/20 rounded mx-auto" />
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-5 pb-6">
        {/* Stat cards skeleton */}
        <div className="grid grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-4 shadow-sm border border-sand-100">
              <div className="w-7 h-7 bg-sand-100 rounded-lg mb-2" />
              <div className="h-2.5 w-12 bg-sand-100 rounded mb-2" />
              <div className="h-4 w-20 bg-sand-200 rounded mb-1" />
              <div className="h-2.5 w-14 bg-sand-100 rounded" />
            </div>
          ))}
        </div>

        {/* Split card skeleton */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-sand-100">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-8 h-8 bg-sand-100 rounded-xl" />
            <div className="h-5 w-28 bg-sand-200 rounded" />
          </div>
          <div className="flex items-center">
            <div className="flex-1 text-center space-y-2">
              <div className="h-3 w-10 bg-sand-100 rounded mx-auto" />
              <div className="h-6 w-24 bg-sand-200 rounded mx-auto" />
              <div className="h-3 w-16 bg-sand-100 rounded mx-auto" />
            </div>
            <div className="w-px h-16 bg-sand-200 mx-3" />
            <div className="flex-1 text-center space-y-2">
              <div className="h-3 w-16 bg-sand-100 rounded mx-auto" />
              <div className="h-6 w-24 bg-sand-200 rounded mx-auto" />
              <div className="h-3 w-16 bg-sand-100 rounded mx-auto" />
            </div>
          </div>
        </div>

        {/* Recent stays skeleton */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-sand-100">
          <div className="h-5 w-32 bg-sand-200 rounded mb-4" />
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex items-center justify-between py-3 border-b border-sand-100 last:border-0">
              <div className="space-y-1.5">
                <div className="h-3.5 w-24 bg-sand-200 rounded" />
                <div className="h-2.5 w-32 bg-sand-100 rounded" />
              </div>
              <div className="h-3.5 w-20 bg-sand-200 rounded" />
            </div>
          ))}
        </div>

        {/* Yearly overview skeleton */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-sand-100">
          <div className="h-5 w-28 bg-sand-200 rounded mb-4" />
          <div className="space-y-3">
            {[65, 40, 72, 55, 48, 60, 35, 70, 50, 45, 68, 52].map((w, i) => (
              <div key={i} className="flex items-center gap-2.5">
                <div className="w-4 h-3 bg-sand-100 rounded" />
                <div className="flex-1 space-y-1">
                  <div className="h-2.5 bg-sand-100 rounded-full" style={{ width: `${w}%` }} />
                  <div className="h-2.5 bg-sand-100 rounded-full" style={{ width: `${w * 0.6}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

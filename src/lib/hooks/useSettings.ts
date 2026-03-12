'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { DEFAULT_EXCHANGE_RATE } from '@/lib/constants';

export function useSettings() {
  const [exchangeRate, setExchangeRate] = useState(DEFAULT_EXCHANGE_RATE);
  const [loading, setLoading] = useState(true);

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('settings')
      .select('*')
      .eq('key', 'exchange_rate_eur_to_mad')
      .single();

    if (!error && data) {
      setExchangeRate(parseFloat(data.value));
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateExchangeRate = async (rate: number) => {
    const { error } = await supabase
      .from('settings')
      .upsert({
        key: 'exchange_rate_eur_to_mad',
        value: rate.toString(),
        updated_at: new Date().toISOString(),
      }, { onConflict: 'key' });

    if (!error) {
      setExchangeRate(rate);
    }
    return !error;
  };

  return { exchangeRate, loading, updateExchangeRate, refetch: fetchSettings };
}

'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Sejour, Currency } from '@/lib/types';

export function useSejours() {
  const [sejours, setSejours] = useState<Sejour[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSejours = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('sejours')
      .select('*')
      .order('check_in', { ascending: false });

    if (!error && data) {
      setSejours(data as Sejour[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchSejours();
  }, [fetchSejours]);

  const addSejour = async (sejour: {
    check_in: string;
    check_out: string;
    guest_name?: string;
    amount: number;
    currency: Currency;
    notes?: string;
  }) => {
    const { data, error } = await supabase
      .from('sejours')
      .insert([sejour])
      .select()
      .single();

    if (!error && data) {
      setSejours((prev) => [data as Sejour, ...prev]);
      return data as Sejour;
    }
    throw error;
  };

  const updateSejour = async (id: string, updates: Partial<Sejour>) => {
    const { data, error } = await supabase
      .from('sejours')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setSejours((prev) =>
        prev.map((s) => (s.id === id ? (data as Sejour) : s))
      );
      return data as Sejour;
    }
    throw error;
  };

  const deleteSejour = async (id: string) => {
    const { error } = await supabase.from('sejours').delete().eq('id', id);
    if (error) throw error;
    setSejours((prev) => prev.filter((s) => s.id !== id));
  };

  return { sejours, loading, addSejour, updateSejour, deleteSejour, refetch: fetchSejours };
}

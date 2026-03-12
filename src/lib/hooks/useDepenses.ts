'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Depense, Currency, ExpenseCategory } from '@/lib/types';

export function useDepenses() {
  const [depenses, setDepenses] = useState<Depense[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDepenses = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('depenses')
      .select('*')
      .order('date', { ascending: false });

    if (!error && data) {
      setDepenses(data as Depense[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchDepenses();
  }, [fetchDepenses]);

  const addDepense = async (depense: {
    amount: number;
    currency: Currency;
    category: ExpenseCategory;
    description?: string;
    date: string;
  }) => {
    const { data, error } = await supabase
      .from('depenses')
      .insert([depense])
      .select()
      .single();

    if (!error && data) {
      setDepenses((prev) => [data as Depense, ...prev]);
      return data as Depense;
    }
    throw error;
  };

  const updateDepense = async (id: string, updates: Partial<Depense>) => {
    const { data, error } = await supabase
      .from('depenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setDepenses((prev) =>
        prev.map((d) => (d.id === id ? (data as Depense) : d))
      );
      return data as Depense;
    }
    throw error;
  };

  const deleteDepense = async (id: string) => {
    const { error } = await supabase.from('depenses').delete().eq('id', id);
    if (error) throw error;
    setDepenses((prev) => prev.filter((d) => d.id !== id));
  };

  return { depenses, loading, addDepense, updateDepense, deleteDepense, refetch: fetchDepenses };
}

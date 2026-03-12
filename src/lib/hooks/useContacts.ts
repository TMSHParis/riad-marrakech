'use client';

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Contact } from '@/lib/types';

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContacts = useCallback(async () => {
    const { data, error } = await supabase
      .from('contacts')
      .select('*')
      .order('name', { ascending: true });

    if (!error && data) {
      setContacts(data as Contact[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  async function addContact(contact: Omit<Contact, 'id' | 'created_at'>) {
    const { data, error } = await supabase
      .from('contacts')
      .insert(contact)
      .select()
      .single();

    if (!error && data) {
      setContacts((prev) => [...prev, data as Contact].sort((a, b) => a.name.localeCompare(b.name)));
    }
    return !error;
  }

  async function updateContact(id: string, updates: Partial<Omit<Contact, 'id' | 'created_at'>>) {
    const { data, error } = await supabase
      .from('contacts')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (!error && data) {
      setContacts((prev) =>
        prev.map((c) => (c.id === id ? (data as Contact) : c)).sort((a, b) => a.name.localeCompare(b.name))
      );
    }
    return !error;
  }

  async function deleteContact(id: string) {
    const { error } = await supabase.from('contacts').delete().eq('id', id);
    if (!error) {
      setContacts((prev) => prev.filter((c) => c.id !== id));
    }
    return !error;
  }

  return { contacts, loading, addContact, updateContact, deleteContact };
}

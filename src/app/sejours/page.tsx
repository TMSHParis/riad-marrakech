'use client';

import { useState, useMemo } from 'react';
import { useSejours } from '@/lib/hooks/useSejours';
import { useSettings } from '@/lib/hooks/useSettings';
import { Modal } from '@/components/ui/Modal';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageHeader } from '@/components/layout/PageHeader';
import { formatDateShort, formatMAD, formatEUR, toMAD, toEUR, getMonthYearKey, monthKeyToLabel, todayStr } from '@/lib/utils';
import type { Sejour, Currency } from '@/lib/types';
import { Plus, Moon, Trash2, Edit3 } from 'lucide-react';

interface SejourFormData {
  check_in: string;
  check_out: string;
  guest_name: string;
  amount: string;
  currency: Currency;
  notes: string;
}

const emptyForm: SejourFormData = {
  check_in: todayStr(),
  check_out: todayStr(),
  guest_name: '',
  amount: '',
  currency: 'MAD',
  notes: '',
};

export default function SejoursPage() {
  const { sejours, loading, addSejour, updateSejour, deleteSejour } = useSejours();
  const { exchangeRate } = useSettings();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingSejour, setEditingSejour] = useState<Sejour | null>(null);
  const [form, setForm] = useState<SejourFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<Sejour | null>(null);

  // Group sejours by month
  const grouped = useMemo(() => {
    const groups: Record<string, Sejour[]> = {};
    for (const s of sejours) {
      const key = getMonthYearKey(s.check_in);
      if (!groups[key]) groups[key] = [];
      groups[key].push(s);
    }
    // Sort keys descending (most recent first)
    const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    return sortedKeys.map((key) => ({
      key,
      label: monthKeyToLabel(key),
      items: groups[key],
    }));
  }, [sejours]);

  function openAdd() {
    setEditingSejour(null);
    setForm({ ...emptyForm, check_in: todayStr(), check_out: todayStr() });
    setModalOpen(true);
  }

  function openEdit(sejour: Sejour) {
    setEditingSejour(sejour);
    setForm({
      check_in: sejour.check_in,
      check_out: sejour.check_out,
      guest_name: sejour.guest_name ?? '',
      amount: sejour.amount.toString(),
      currency: sejour.currency,
      notes: sejour.notes ?? '',
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingSejour(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.amount || parseFloat(form.amount) <= 0) return;

    setSaving(true);
    try {
      const payload = {
        check_in: form.check_in,
        check_out: form.check_out,
        guest_name: form.guest_name.trim() || undefined,
        amount: parseFloat(form.amount),
        currency: form.currency,
        notes: form.notes.trim() || undefined,
      };

      if (editingSejour) {
        await updateSejour(editingSejour.id, payload);
      } else {
        await addSejour(payload);
      }
      closeModal();
    } catch {
      // error handled silently
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteConfirm) return;
    try {
      await deleteSejour(deleteConfirm.id);
    } catch {
      // error handled silently
    }
    setDeleteConfirm(null);
  }

  function secondaryAmount(sejour: Sejour): string {
    if (sejour.currency === 'MAD') {
      return formatEUR(toEUR(sejour.amount, sejour.currency, exchangeRate));
    }
    return formatMAD(toMAD(sejour.amount, sejour.currency, exchangeRate));
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50">
        <PageHeader title="Séjours" />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-sand-200 border-t-terracotta-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 pb-28">
      <PageHeader
        title="Séjours"
        subtitle={`${sejours.length} séjour${sejours.length !== 1 ? 's' : ''} au total`}
      />

      {/* Empty state */}
      {sejours.length === 0 && (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-terracotta-50">
            <Moon size={28} className="text-terracotta-400" />
          </div>
          <h2 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-midnight">
            Aucun séjour
          </h2>
          <p className="mt-1.5 text-sm text-sand-500 max-w-[260px]">
            Ajoutez votre premier séjour en appuyant sur le bouton ci-dessous
          </p>
        </div>
      )}

      {/* Grouped stays list */}
      {grouped.map((group) => (
        <div key={group.key} className="mb-2">
          {/* Month header */}
          <div className="sticky top-0 z-10 bg-sand-50/95 backdrop-blur-sm px-5 py-2.5">
            <h2 className="font-[family-name:var(--font-playfair)] text-sm font-semibold text-terracotta-700 uppercase tracking-wide">
              {group.label}
            </h2>
          </div>

          {/* Stay cards */}
          <div className="px-4 space-y-3">
            {group.items.map((sejour) => (
              <div
                key={sejour.id}
                onClick={() => openEdit(sejour)}
                className="group relative bg-cream rounded-2xl px-4 py-3.5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer border border-sand-100 active:scale-[0.98]"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {/* Guest name */}
                    <p className="font-semibold text-midnight text-base truncate">
                      {sejour.guest_name || 'Voyageur'}
                    </p>

                    {/* Dates */}
                    <p className="text-sand-500 text-sm mt-0.5">
                      {formatDateShort(sejour.check_in)} → {formatDateShort(sejour.check_out)}
                    </p>
                  </div>

                  <div className="flex flex-col items-end gap-1.5 shrink-0">
                    {/* Amount */}
                    <p className="font-semibold text-olive-500 text-base">
                      {sejour.currency === 'MAD'
                        ? formatMAD(sejour.amount)
                        : formatEUR(sejour.amount)}
                    </p>

                    {/* Secondary currency */}
                    <p className="text-sand-400 text-xs">
                      {secondaryAmount(sejour)}
                    </p>
                  </div>
                </div>

                {/* Bottom row: nights badge + actions */}
                <div className="flex items-center justify-between mt-2.5">
                  <span className="inline-flex items-center gap-1 rounded-full bg-terracotta-50 px-2.5 py-0.5 text-xs font-medium text-terracotta-700">
                    <Moon size={12} />
                    {sejour.nights} nuit{sejour.nights !== 1 ? 's' : ''}
                  </span>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openEdit(sejour);
                      }}
                      className="p-1.5 rounded-full hover:bg-sand-100 transition-colors text-sand-400"
                      aria-label="Modifier"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(sejour);
                      }}
                      className="p-1.5 rounded-full hover:bg-red-50 transition-colors text-sand-400 hover:text-deep-red-500"
                      aria-label="Supprimer"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>

                {/* Notes preview */}
                {sejour.notes && (
                  <p className="text-sand-400 text-xs mt-2 truncate italic">
                    {sejour.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Floating Action Button */}
      <button
        onClick={openAdd}
        className="fixed bottom-24 right-5 z-[55] flex h-14 w-14 items-center justify-center rounded-full bg-terracotta-500 text-white shadow-lg shadow-terracotta-500/30 hover:bg-terracotta-600 active:scale-95 transition-all duration-200"
        aria-label="Ajouter un séjour"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingSejour ? 'Modifier le séjour' : 'Nouveau séjour'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Check-in */}
          <div>
            <label className="block text-sm font-medium text-midnight mb-1.5">
              Arrivée
            </label>
            <input
              type="date"
              value={form.check_in}
              onChange={(e) =>
                setForm((f) => ({ ...f, check_in: e.target.value }))
              }
              className="w-full px-4 py-2.5 rounded-xl border border-sand-200 bg-white text-midnight focus:outline-none focus:ring-2 focus:ring-terracotta-300 focus:border-transparent text-base"
              required
            />
          </div>

          {/* Check-out */}
          <div>
            <label className="block text-sm font-medium text-midnight mb-1.5">
              Départ
            </label>
            <input
              type="date"
              value={form.check_out}
              onChange={(e) =>
                setForm((f) => ({ ...f, check_out: e.target.value }))
              }
              min={form.check_in}
              className="w-full px-4 py-2.5 rounded-xl border border-sand-200 bg-white text-midnight focus:outline-none focus:ring-2 focus:ring-terracotta-300 focus:border-transparent text-base"
              required
            />
          </div>

          {/* Guest name */}
          <div>
            <label className="block text-sm font-medium text-midnight mb-1.5">
              Nom du voyageur
              <span className="text-sand-400 font-normal ml-1">(optionnel)</span>
            </label>
            <input
              type="text"
              value={form.guest_name}
              onChange={(e) =>
                setForm((f) => ({ ...f, guest_name: e.target.value }))
              }
              placeholder="Ex: Jean Dupont"
              className="w-full px-4 py-2.5 rounded-xl border border-sand-200 bg-white text-midnight placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-terracotta-300 focus:border-transparent text-base"
            />
          </div>

          {/* Amount + currency */}
          <CurrencyInput
            amount={form.amount}
            currency={form.currency}
            onAmountChange={(amount) => setForm((f) => ({ ...f, amount }))}
            onCurrencyChange={(currency) =>
              setForm((f) => ({ ...f, currency }))
            }
          />

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-midnight mb-1.5">
              Notes
              <span className="text-sand-400 font-normal ml-1">(optionnel)</span>
            </label>
            <textarea
              value={form.notes}
              onChange={(e) =>
                setForm((f) => ({ ...f, notes: e.target.value }))
              }
              placeholder="Remarques, détails..."
              rows={3}
              className="w-full px-4 py-2.5 rounded-xl border border-sand-200 bg-white text-midnight placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-terracotta-300 focus:border-transparent text-base resize-none"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving || !form.amount}
            className="w-full py-3 rounded-xl bg-terracotta-500 text-white font-semibold text-base hover:bg-terracotta-600 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {saving
              ? 'Enregistrement...'
              : editingSejour
                ? 'Mettre à jour'
                : 'Ajouter le séjour'}
          </button>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        title="Supprimer ce séjour ?"
        message={`Le séjour de ${deleteConfirm?.guest_name || 'ce voyageur'} sera définitivement supprimé.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </div>
  );
}

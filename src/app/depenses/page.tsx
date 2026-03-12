'use client';

import { useState, useMemo } from 'react';
import { useDepenses } from '@/lib/hooks/useDepenses';
import { useSettings } from '@/lib/hooks/useSettings';
import { Modal } from '@/components/ui/Modal';
import { CurrencyInput } from '@/components/ui/CurrencyInput';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { PageHeader } from '@/components/layout/PageHeader';
import { EXPENSE_CATEGORIES } from '@/lib/constants';
import { formatDate, formatMAD, formatEUR, toMAD, toEUR, getMonthYearKey, monthKeyToLabel, todayStr } from '@/lib/utils';
import type { Depense, Currency, ExpenseCategory } from '@/lib/types';
import { Plus, Trash2, Edit3 } from 'lucide-react';

const CATEGORY_EMOJIS: Record<ExpenseCategory, string> = {
  produits_menagers: '🧹',
  eau: '💧',
  electricite: '⚡',
  gaz: '🔥',
  syndic: '🏢',
  pressing: '👔',
  fibre: '📡',
  travaux: '🔧',
  autre: '📦',
};

function getCategoryLabel(category: ExpenseCategory): string {
  return EXPENSE_CATEGORIES.find((c) => c.value === category)?.label ?? category;
}

export default function DepensesPage() {
  const { depenses, loading, addDepense, updateDepense, deleteDepense } = useDepenses();
  const { exchangeRate } = useSettings();

  const [activeFilter, setActiveFilter] = useState<ExpenseCategory | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingDepense, setEditingDepense] = useState<Depense | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Depense | null>(null);

  // Form state
  const [formDate, setFormDate] = useState(todayStr());
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('autre');
  const [formAmount, setFormAmount] = useState('');
  const [formCurrency, setFormCurrency] = useState<Currency>('MAD');
  const [formDescription, setFormDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const filteredDepenses = useMemo(() => {
    if (activeFilter === 'all') return depenses;
    return depenses.filter((d) => d.category === activeFilter);
  }, [depenses, activeFilter]);

  const groupedByMonth = useMemo(() => {
    const groups: Record<string, Depense[]> = {};
    for (const dep of filteredDepenses) {
      const key = getMonthYearKey(dep.date);
      if (!groups[key]) groups[key] = [];
      groups[key].push(dep);
    }
    // Sort keys descending
    const sortedKeys = Object.keys(groups).sort((a, b) => b.localeCompare(a));
    return sortedKeys.map((key) => ({
      key,
      label: monthKeyToLabel(key),
      items: groups[key],
      totalMAD: groups[key].reduce((sum, d) => sum + toMAD(d.amount, d.currency, exchangeRate), 0),
    }));
  }, [filteredDepenses, exchangeRate]);

  function resetForm() {
    setFormDate(todayStr());
    setFormCategory('autre');
    setFormAmount('');
    setFormCurrency('MAD');
    setFormDescription('');
    setEditingDepense(null);
  }

  function openAddModal() {
    resetForm();
    setModalOpen(true);
  }

  function openEditModal(dep: Depense) {
    setEditingDepense(dep);
    setFormDate(dep.date);
    setFormCategory(dep.category);
    setFormAmount(dep.amount.toString());
    setFormCurrency(dep.currency);
    setFormDescription(dep.description ?? '');
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    resetForm();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const amount = parseFloat(formAmount);
    if (!amount || amount <= 0) return;

    setSaving(true);
    try {
      if (editingDepense) {
        await updateDepense(editingDepense.id, {
          date: formDate,
          category: formCategory,
          amount,
          currency: formCurrency,
          description: formDescription.trim() || null,
        });
      } else {
        await addDepense({
          date: formDate,
          category: formCategory,
          amount,
          currency: formCurrency,
          description: formDescription.trim() || undefined,
        });
      }
      closeModal();
    } catch {
      // Error handled silently
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      await deleteDepense(deleteTarget.id);
    } catch {
      // Error handled silently
    }
    setDeleteTarget(null);
  }

  return (
    <div className="min-h-screen bg-sand-50 pb-28">
      <PageHeader title="Dépenses" />

      {/* Category filter chips */}
      <div className="px-5 pb-4">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveFilter('all')}
            className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeFilter === 'all'
                ? 'bg-terracotta-500 text-white'
                : 'bg-sand-100 text-sand-500 hover:bg-sand-200'
            }`}
          >
            Tout
          </button>
          {EXPENSE_CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              onClick={() => setActiveFilter(cat.value)}
              className={`shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                activeFilter === cat.value
                  ? 'bg-terracotta-500 text-white'
                  : 'bg-sand-100 text-sand-500 hover:bg-sand-200'
              }`}
            >
              {CATEGORY_EMOJIS[cat.value]} {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-8 h-8 border-3 border-terracotta-200 border-t-terracotta-500 rounded-full animate-spin" />
        </div>
      ) : filteredDepenses.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20 px-5">
          <div className="text-5xl mb-4">📭</div>
          <p className="text-midnight font-sans text-lg font-semibold">
            Aucune dépense
          </p>
          <p className="text-sand-400 text-sm mt-1 text-center">
            {activeFilter === 'all'
              ? 'Ajoutez votre première dépense avec le bouton +'
              : `Aucune dépense dans la catégorie "${getCategoryLabel(activeFilter)}"`}
          </p>
        </div>
      ) : (
        /* Grouped expense list */
        <div className="px-5 space-y-6">
          {groupedByMonth.map((group) => (
            <div key={group.key}>
              {/* Month header */}
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-sans text-base font-bold text-midnight">
                  {group.label}
                </h2>
                <span className="text-sm font-semibold text-deep-red-500">
                  {formatMAD(group.totalMAD)}
                </span>
              </div>

              {/* Expense cards */}
              <div className="space-y-2.5">
                {group.items.map((dep) => {
                  const secondaryAmount =
                    dep.currency === 'MAD'
                      ? formatEUR(toEUR(dep.amount, dep.currency, exchangeRate))
                      : formatMAD(toMAD(dep.amount, dep.currency, exchangeRate));

                  return (
                    <div
                      key={dep.id}
                      onClick={() => openEditModal(dep)}
                      className="bg-cream rounded-2xl p-4 flex items-center gap-3.5 active:scale-[0.98] transition-transform cursor-pointer"
                    >
                      {/* Category emoji badge */}
                      <div className="w-11 h-11 rounded-xl bg-sand-100 flex items-center justify-center text-xl shrink-0">
                        {CATEGORY_EMOJIS[dep.category]}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-midnight font-medium text-sm truncate">
                          {dep.description || getCategoryLabel(dep.category)}
                        </p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-sand-100 text-sand-500 text-xs">
                            {getCategoryLabel(dep.category)}
                          </span>
                          <span className="text-sand-400 text-xs">
                            {formatDate(dep.date)}
                          </span>
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right shrink-0">
                        <p className="text-midnight font-semibold text-sm">
                          {dep.currency === 'MAD' ? formatMAD(dep.amount) : formatEUR(dep.amount)}
                        </p>
                        <p className="text-sand-400 text-xs mt-0.5">
                          {secondaryAmount}
                        </p>
                      </div>

                      {/* Delete button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteTarget(dep);
                        }}
                        className="p-2 rounded-xl text-sand-300 hover:text-deep-red-500 hover:bg-deep-red-50 transition-colors shrink-0"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={openAddModal}
        className="fixed bottom-24 right-5 z-[55] w-14 h-14 bg-terracotta-500 text-white rounded-full shadow-lg shadow-terracotta-500/30 flex items-center justify-center hover:bg-terracotta-600 active:scale-95 transition-all"
      >
        <Plus size={24} />
      </button>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingDepense ? 'Modifier la dépense' : 'Nouvelle dépense'}
      >
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Date */}
          <div>
            <label className="block text-sm font-medium text-midnight mb-1.5">
              Date
            </label>
            <input
              type="date"
              value={formDate}
              onChange={(e) => setFormDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-sand-200 bg-white text-midnight focus:outline-none focus:ring-2 focus:ring-terracotta-300 focus:border-transparent text-base"
              required
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-midnight mb-1.5">
              Catégorie
            </label>
            <select
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
              className="w-full px-4 py-2.5 rounded-xl border border-sand-200 bg-white text-midnight focus:outline-none focus:ring-2 focus:ring-terracotta-300 focus:border-transparent text-base appearance-none"
              required
            >
              {EXPENSE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {CATEGORY_EMOJIS[cat.value]} {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amount + Currency */}
          <CurrencyInput
            amount={formAmount}
            currency={formCurrency}
            onAmountChange={setFormAmount}
            onCurrencyChange={setFormCurrency}
          />

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-midnight mb-1.5">
              Description <span className="text-sand-400">(optionnel)</span>
            </label>
            <input
              type="text"
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Ex: Achat Javel et éponges"
              className="w-full px-4 py-2.5 rounded-xl border border-sand-200 bg-white text-midnight focus:outline-none focus:ring-2 focus:ring-terracotta-300 focus:border-transparent text-base placeholder:text-sand-300"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving || !formAmount || parseFloat(formAmount) <= 0}
            className="w-full py-3 rounded-xl bg-terracotta-500 text-white font-semibold text-base hover:bg-terracotta-600 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? 'Enregistrement...' : editingDepense ? 'Modifier' : 'Ajouter'}
          </button>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Supprimer la dépense"
        message={`Voulez-vous vraiment supprimer cette dépense de ${
          deleteTarget
            ? deleteTarget.currency === 'MAD'
              ? formatMAD(deleteTarget.amount)
              : formatEUR(deleteTarget.amount)
            : ''
        } ?`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

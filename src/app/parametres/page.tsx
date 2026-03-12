'use client';

import { useState, useEffect } from 'react';
import { useSettings } from '@/lib/hooks/useSettings';
import { PageHeader } from '@/components/layout/PageHeader';
import { RefreshCw, Check } from 'lucide-react';

export default function ParametresPage() {
  const { exchangeRate, loading, updateExchangeRate } = useSettings();
  const [rate, setRate] = useState<number>(exchangeRate);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!loading) {
      setRate(exchangeRate);
    }
  }, [exchangeRate, loading]);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js');
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    const success = await updateExchangeRate(rate);
    setSaving(false);
    if (success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-sand-50 pb-24">
      <PageHeader title="Paramètres" />

      <div className="px-5 space-y-6">
        {/* Exchange Rate Card */}
        <div className="bg-white border border-sand-200 rounded-2xl p-5">
          <h2 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-midnight mb-4">
            Taux de change
          </h2>

          <div className="flex items-center gap-3">
            <label className="text-sm text-midnight whitespace-nowrap">
              1 EUR =
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={rate}
              onChange={(e) => setRate(parseFloat(e.target.value) || 0)}
              className="w-24 rounded-xl border border-sand-200 px-3 py-2 text-sm text-midnight focus:outline-none focus:ring-2 focus:ring-terracotta-500/30 focus:border-terracotta-500"
            />
            <span className="text-sm font-medium text-midnight">MAD</span>
          </div>

          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="mt-4 flex items-center justify-center gap-2 rounded-xl bg-terracotta-500 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-terracotta-600 disabled:opacity-50"
          >
            {saving ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Enregistrement...
              </>
            ) : (
              'Enregistrer'
            )}
          </button>

          {saved && (
            <div className="mt-3 flex items-center gap-2 text-sm text-green-600">
              <Check className="h-4 w-4" />
              Taux de change mis à jour avec succès
            </div>
          )}
        </div>

        {/* App Info Section */}
        <div className="bg-white border border-sand-200 rounded-2xl p-5">
          <h2 className="font-[family-name:var(--font-playfair)] text-lg font-semibold text-midnight mb-4">
            À propos
          </h2>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-sand-500">Version</span>
              <span className="text-midnight font-medium">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sand-500">Application</span>
              <span className="text-midnight font-medium">Riad Marrakech</span>
            </div>
            <p className="text-sand-500 pt-1">
              Application de gestion de location Airbnb
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useContacts } from '@/lib/hooks/useContacts';
import { PageHeader } from '@/components/layout/PageHeader';
import { Modal } from '@/components/ui/Modal';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import type { Contact } from '@/lib/types';
import { Plus, Phone, Trash2, Edit3, User } from 'lucide-react';

interface ContactFormData {
  name: string;
  fonction: string;
  phone: string;
}

const emptyForm: ContactFormData = {
  name: '',
  fonction: '',
  phone: '',
};

export default function ContactsPage() {
  const { contacts, loading, addContact, updateContact, deleteContact } = useContacts();

  const [modalOpen, setModalOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [form, setForm] = useState<ContactFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);

  function openAdd() {
    setEditingContact(null);
    setForm({ ...emptyForm });
    setModalOpen(true);
  }

  function openEdit(contact: Contact) {
    setEditingContact(contact);
    setForm({
      name: contact.name,
      fonction: contact.fonction,
      phone: contact.phone,
    });
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
    setEditingContact(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.phone.trim()) return;

    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        fonction: form.fonction.trim(),
        phone: form.phone.trim(),
      };

      if (editingContact) {
        await updateContact(editingContact.id, payload);
      } else {
        await addContact(payload);
      }
      closeModal();
    } catch {
      // handled silently
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    await deleteContact(deleteTarget.id);
    setDeleteTarget(null);
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50">
        <PageHeader title="Contacts" />
        <div className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-3 border-sand-200 border-t-terracotta-500" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50 pb-28">
      <PageHeader
        title="Contacts"
        subtitle={`${contacts.length} numéro${contacts.length !== 1 ? 's' : ''} utile${contacts.length !== 1 ? 's' : ''}`}
      />

      {/* Empty state */}
      {contacts.length === 0 && (
        <div className="flex flex-col items-center justify-center px-6 py-20 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-terracotta-50">
            <Phone size={28} className="text-terracotta-400" />
          </div>
          <h2 className="text-lg font-semibold text-midnight">
            Aucun contact
          </h2>
          <p className="mt-1.5 text-sm text-sand-500 max-w-[260px]">
            Ajoutez vos numéros utiles (plombier, électricien, ménage...)
          </p>
        </div>
      )}

      {/* Contacts list */}
      {contacts.length > 0 && (
        <div className="px-4 space-y-3">
          {contacts.map((contact) => (
            <div
              key={contact.id}
              className="bg-cream rounded-2xl p-4 flex items-center gap-3.5 border border-sand-100 active:scale-[0.98] transition-transform"
            >
              {/* Avatar */}
              <div className="w-11 h-11 rounded-xl bg-terracotta-50 flex items-center justify-center shrink-0">
                <User size={20} className="text-terracotta-500" />
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <p className="text-midnight font-semibold text-base truncate">
                  {contact.name}
                </p>
                <p className="text-sand-500 text-sm truncate">
                  {contact.fonction}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 shrink-0">
                <a
                  href={`tel:${contact.phone}`}
                  className="p-2.5 rounded-xl bg-olive-500/10 text-olive-500 hover:bg-olive-500/20 transition-colors"
                  aria-label={`Appeler ${contact.name}`}
                >
                  <Phone size={18} />
                </a>
                <button
                  onClick={() => openEdit(contact)}
                  className="p-2 rounded-xl text-sand-400 hover:bg-sand-100 transition-colors"
                  aria-label="Modifier"
                >
                  <Edit3 size={16} />
                </button>
                <button
                  onClick={() => setDeleteTarget(contact)}
                  className="p-2 rounded-xl text-sand-300 hover:text-deep-red-500 hover:bg-red-50 transition-colors"
                  aria-label="Supprimer"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <button
        onClick={openAdd}
        className="fixed bottom-24 right-5 z-[55] flex h-14 w-14 items-center justify-center rounded-full bg-terracotta-500 text-white shadow-lg shadow-terracotta-500/30 hover:bg-terracotta-600 active:scale-95 transition-all duration-200"
        aria-label="Ajouter un contact"
      >
        <Plus size={26} strokeWidth={2.5} />
      </button>

      {/* Add/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={closeModal}
        title={editingContact ? 'Modifier le contact' : 'Nouveau contact'}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-midnight mb-1.5">
              Nom
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Ex: Mohammed"
              className="w-full px-4 py-2.5 rounded-xl border border-sand-200 bg-white text-midnight placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-terracotta-300 focus:border-transparent text-base"
              required
            />
          </div>

          {/* Fonction */}
          <div>
            <label className="block text-sm font-medium text-midnight mb-1.5">
              Fonction
            </label>
            <input
              type="text"
              value={form.fonction}
              onChange={(e) => setForm((f) => ({ ...f, fonction: e.target.value }))}
              placeholder="Ex: Plombier, Électricien, Ménage..."
              className="w-full px-4 py-2.5 rounded-xl border border-sand-200 bg-white text-midnight placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-terracotta-300 focus:border-transparent text-base"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-midnight mb-1.5">
              Téléphone
            </label>
            <input
              type="tel"
              value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
              placeholder="Ex: +212 6 12 34 56 78"
              className="w-full px-4 py-2.5 rounded-xl border border-sand-200 bg-white text-midnight placeholder:text-sand-300 focus:outline-none focus:ring-2 focus:ring-terracotta-300 focus:border-transparent text-base"
              required
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={saving || !form.name.trim() || !form.phone.trim()}
            className="w-full py-3 rounded-xl bg-terracotta-500 text-white font-semibold text-base hover:bg-terracotta-600 active:scale-[0.98] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {saving
              ? 'Enregistrement...'
              : editingContact
                ? 'Mettre à jour'
                : 'Ajouter le contact'}
          </button>
        </form>
      </Modal>

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Supprimer ce contact ?"
        message={`${deleteTarget?.name} sera définitivement supprimé.`}
        confirmLabel="Supprimer"
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

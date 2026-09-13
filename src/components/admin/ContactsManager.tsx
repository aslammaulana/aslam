import React, { useState } from 'react';
import { Plus, Edit2, Trash2, MessageCircle, Mail, Instagram, Linkedin, ExternalLink, Save, X } from 'lucide-react';
import { Contact, ContactType } from '../../types.ts';
import { ConfirmDialog } from './ConfirmDialog.tsx';

interface ContactsManagerProps {
  contacts: Contact[];
  onAdd: (contact: Omit<Contact, 'id'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Contact>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const ContactsManager: React.FC<ContactsManagerProps> = ({
  contacts,
  onAdd,
  onUpdate,
  onDelete
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(false);

  const [type, setType] = useState<ContactType>('whatsapp');
  const [value, setValue] = useState('');
  const [label, setLabel] = useState('');

  const openAddForm = () => {
    setEditingContact(null);
    setType('whatsapp');
    setValue('');
    setLabel('WhatsApp');
    setIsFormOpen(true);
  };

  const openEditForm = (contact: Contact) => {
    setEditingContact(contact);
    setType(contact.type);
    setValue(contact.value);
    setLabel(contact.label || contact.type);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingContact(null);
  };

  const handleTypeChange = (newType: ContactType) => {
    setType(newType);
    if (!label || label === 'WhatsApp' || label === 'Email' || label === 'Instagram' || label === 'LinkedIn') {
      const map: Record<ContactType, string> = {
        whatsapp: 'WhatsApp',
        email: 'Email',
        instagram: 'Instagram',
        linkedin: 'LinkedIn'
      };
      setLabel(map[newType]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;

    setLoading(true);
    try {
      if (editingContact) {
        await onUpdate(editingContact.id, {
          type,
          value: value.trim(),
          label: label.trim() || type
        });
      } else {
        await onAdd({
          type,
          value: value.trim(),
          label: label.trim() || type
        });
      }
      closeForm();
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setLoading(true);
    try {
      await onDelete(deleteTarget.id);
      setDeleteTarget(null);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (t: string) => {
    switch (t.toLowerCase()) {
      case 'whatsapp':
        return <MessageCircle className="w-5 h-5 text-emerald-600" />;
      case 'email':
        return <Mail className="w-5 h-5 text-blue-600" />;
      case 'instagram':
        return <Instagram className="w-5 h-5 text-pink-600" />;
      case 'linkedin':
        return <Linkedin className="w-5 h-5 text-blue-700" />;
      default:
        return <ExternalLink className="w-5 h-5 text-slate-600" />;
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Kelola Saluran Kontak</h2>
          <p className="text-sm text-slate-500 mt-1">
            Tautan langsung ke WhatsApp, Email, Instagram, dan LinkedIn di halaman publik.
          </p>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Kontak</span>
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <h3 className="text-lg font-bold text-slate-900">
              {editingContact ? 'Edit Kontak' : 'Tambah Kontak Baru'}
            </h3>
            <button
              type="button"
              onClick={closeForm}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Jenis Saluran Kontak <span className="text-red-500">*</span>
                </label>
                <select
                  value={type}
                  onChange={(e) => handleTypeChange(e.target.value as ContactType)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="whatsapp">WhatsApp (Nomor HP/Link)</option>
                  <option value="email">Email</option>
                  <option value="instagram">Instagram (Username/URL)</option>
                  <option value="linkedin">LinkedIn (URL Profil)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Label Tampilan
                </label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Contoh: WhatsApp / Email Utama"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Nilai Kontak / Tautan URL <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder={
                  type === 'whatsapp'
                    ? 'Contoh: 6281234567890'
                    : type === 'email'
                    ? 'Contoh: nama@domain.com'
                    : 'Contoh: https://instagram.com/username'
                }
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-slate-400">
                {type === 'whatsapp' && 'Untuk WhatsApp, masukkan nomor dengan kode negara (contoh 62812...) agar otomatis menjadi link chat wa.me.'}
                {type === 'email' && 'Masukkan alamat email yang valid untuk membuat tautan mailto langsung.'}
                {(type === 'instagram' || type === 'linkedin') && 'Masukkan URL lengkap atau link profil akun Anda.'}
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={closeForm}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading || !value.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Menyimpan...' : 'Simpan Kontak'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Contacts List */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {contacts.map((contact) => (
          <div
            key={contact.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 flex items-center justify-between gap-3 shadow-xs"
          >
            <div className="flex items-center gap-3.5 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center flex-shrink-0">
                {getIcon(contact.type)}
              </div>
              <div className="min-w-0">
                <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  {contact.label || contact.type}
                </h4>
                <p className="text-sm font-medium text-slate-900 truncate mt-0.5" title={contact.value}>
                  {contact.value}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1 flex-shrink-0">
              <button
                type="button"
                onClick={() => openEditForm(contact)}
                className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-slate-100 transition-colors"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(contact)}
                className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                title="Hapus"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Kontak"
        message={`Apakah Anda yakin ingin menghapus kontak "${deleteTarget?.label || deleteTarget?.type}"?`}
        confirmLabel="Ya, Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

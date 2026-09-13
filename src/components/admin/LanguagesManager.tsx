import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Languages as LanguageIcon, Check, X } from 'lucide-react';
import { Language } from '../../types.ts';
import { ConfirmDialog } from './ConfirmDialog.tsx';

interface LanguagesManagerProps {
  languages: Language[];
  onAdd: (lang: Omit<Language, 'id'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Language>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const LanguagesManager: React.FC<LanguagesManagerProps> = ({
  languages,
  onAdd,
  onUpdate,
  onDelete
}) => {
  const [newLanguage, setNewLanguage] = useState('');
  const [newLevel, setNewLevel] = useState('Intermediate');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLang, setEditLang] = useState('');
  const [editLevel, setEditLevel] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Language | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLanguage.trim()) return;
    setLoading(true);
    try {
      await onAdd({
        language_name: newLanguage.trim(),
        proficiency_level: newLevel.trim() || 'Fasih'
      });
      setNewLanguage('');
      setNewLevel('Intermediate');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (lang: Language) => {
    setEditingId(lang.id);
    setEditLang(lang.language_name);
    setEditLevel(lang.proficiency_level);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editLang.trim()) return;
    setLoading(true);
    try {
      await onUpdate(id, {
        language_name: editLang.trim(),
        proficiency_level: editLevel.trim()
      });
      setEditingId(null);
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

  return (
    <div className="max-w-4xl space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900">Kelola Bahasa</h2>
        <p className="text-sm text-slate-500 mt-1">
          Ditampilkan sebagai teks polos (misal: "Bahasa Indonesia — Native") tanpa progress bar.
        </p>
      </div>

      {/* Form Tambah Bahasa */}
      <form onSubmit={handleAdd} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            required
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
            placeholder="Nama Bahasa (contoh: Bahasa Indonesia, Bahasa Inggris, Bahasa Jepang)..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div className="w-full sm:w-56">
          <input
            type="text"
            required
            value={newLevel}
            onChange={(e) => setNewLevel(e.target.value)}
            placeholder="Level (contoh: Native, Intermediate, Dasar)..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !newLanguage.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah</span>
        </button>
      </form>

      {/* List Bahasa */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-3">
        {languages.map((lang) => {
          const isEditing = editingId === lang.id;

          if (isEditing) {
            return (
              <div key={lang.id} className="flex items-center gap-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <input
                  type="text"
                  value={editLang}
                  onChange={(e) => setEditLang(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none"
                  placeholder="Nama Bahasa"
                />
                <input
                  type="text"
                  value={editLevel}
                  onChange={(e) => setEditLevel(e.target.value)}
                  className="w-44 px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none"
                  placeholder="Level Kemahiran"
                />
                <button
                  type="button"
                  onClick={() => handleSaveEdit(lang.id)}
                  className="p-2 text-emerald-600 hover:bg-emerald-100 rounded-lg"
                  title="Simpan"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="p-2 text-slate-500 hover:bg-slate-200 rounded-lg"
                  title="Batal"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          }

          return (
            <div
              key={lang.id}
              className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:bg-slate-100/70 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100/70 text-blue-600 flex items-center justify-center">
                  <LanguageIcon className="w-4 h-4" />
                </div>
                <div className="text-sm font-medium text-slate-900">
                  <span>{lang.language_name}</span>
                  <span className="mx-2 text-slate-400">—</span>
                  <span className="text-slate-600 font-normal">{lang.proficiency_level}</span>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => startEdit(lang)}
                  className="p-1.5 text-slate-400 hover:text-blue-600 rounded-lg hover:bg-white transition-colors"
                  title="Edit"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(lang)}
                  className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg hover:bg-white transition-colors"
                  title="Hapus"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}

        {languages.length === 0 && (
          <div className="text-center py-8 text-slate-400 text-sm">
            Belum ada bahasa yang ditambahkan.
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Bahasa"
        message={`Apakah Anda yakin ingin menghapus "${deleteTarget?.language_name}"?`}
        confirmLabel="Ya, Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

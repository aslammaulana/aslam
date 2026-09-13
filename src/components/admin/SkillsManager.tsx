import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Check, X, Sparkles } from 'lucide-react';
import { Skill } from '../../types.ts';
import { ConfirmDialog } from './ConfirmDialog.tsx';

interface SkillsManagerProps {
  skills: Skill[];
  onAdd: (name: string) => Promise<void>;
  onUpdate: (id: string, name: string) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const SkillsManager: React.FC<SkillsManagerProps> = ({
  skills,
  onAdd,
  onUpdate,
  onDelete
}) => {
  const [newSkillName, setNewSkillName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;
    setLoading(true);
    try {
      await onAdd(newSkillName.trim());
      setNewSkillName('');
    } finally {
      setLoading(false);
    }
  };

  const startEdit = (skill: Skill) => {
    setEditingId(skill.id);
    setEditName(skill.name);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editName.trim()) return;
    setLoading(true);
    try {
      await onUpdate(id, editName.trim());
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
        <h2 className="text-xl font-bold text-slate-900">Kelola Keahlian (Skills)</h2>
        <p className="text-sm text-slate-500 mt-1">
          Daftar keahlian akan tampil sebagai chip sederhana tanpa progress bar di halaman utama.
        </p>
      </div>

      {/* Form Tambah Skill */}
      <form onSubmit={handleAdd} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <input
            type="text"
            required
            value={newSkillName}
            onChange={(e) => setNewSkillName(e.target.value)}
            placeholder="Ketik nama keahlian (contoh: Canva, Manajemen Waktu, Public Speaking)..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !newSkillName.trim()}
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Skill</span>
        </button>
      </form>

      {/* List Keahlian */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Daftar Keahlian ({skills.length})
          </h3>
        </div>

        {skills.length === 0 ? (
          <div className="text-center py-10 text-slate-400 text-sm">
            Belum ada keahlian yang ditambahkan.
          </div>
        ) : (
          <div className="flex flex-wrap gap-2.5">
            {skills.map((skill) => {
              const isEditing = editingId === skill.id;

              if (isEditing) {
                return (
                  <div key={skill.id} className="inline-flex items-center gap-1.5 p-1.5 rounded-xl bg-blue-50 border border-blue-300">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="px-2.5 py-1 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(skill.id)}
                      className="p-1.5 text-emerald-600 hover:bg-emerald-100 rounded-lg"
                      title="Simpan"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="p-1.5 text-slate-500 hover:bg-slate-200 rounded-lg"
                      title="Batal"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              }

              return (
                <div
                  key={skill.id}
                  className="group inline-flex items-center gap-2 pl-3.5 pr-2 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 text-sm font-medium hover:bg-slate-200/80 transition-all"
                >
                  <span>{skill.name}</span>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <button
                      type="button"
                      onClick={() => startEdit(skill)}
                      className="p-1 text-slate-400 hover:text-blue-600 rounded-md hover:bg-white transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(skill)}
                      className="p-1 text-slate-400 hover:text-red-600 rounded-md hover:bg-white transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Keahlian"
        message={`Apakah Anda yakin ingin menghapus keahlian "${deleteTarget?.name}"?`}
        confirmLabel="Ya, Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

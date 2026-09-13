import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Building2, Calendar, MapPin, Save, X } from 'lucide-react';
import { Experience } from '../../types.ts';
import { ConfirmDialog } from './ConfirmDialog.tsx';

interface ExperienceManagerProps {
  experiences: Experience[];
  onAdd: (exp: Omit<Experience, 'id'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Experience>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const ExperienceManager: React.FC<ExperienceManagerProps> = ({
  experiences,
  onAdd,
  onUpdate,
  onDelete
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExp, setEditingExp] = useState<Experience | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Experience | null>(null);
  const [loading, setLoading] = useState(false);

  const [institutionName, setInstitutionName] = useState('');
  const [yearRange, setYearRange] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const openAddForm = () => {
    setEditingExp(null);
    setInstitutionName('');
    setYearRange('');
    setLocation('');
    setDescription('');
    setIsFormOpen(true);
  };

  const openEditForm = (exp: Experience) => {
    setEditingExp(exp);
    setInstitutionName(exp.institution_name);
    setYearRange(exp.year_range);
    setLocation(exp.location);
    setDescription(exp.description);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingExp(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!institutionName.trim() || !yearRange.trim()) return;

    setLoading(true);
    try {
      if (editingExp) {
        await onUpdate(editingExp.id, {
          institution_name: institutionName.trim(),
          year_range: yearRange.trim(),
          location: location.trim(),
          description: description.trim()
        });
      } else {
        await onAdd({
          institution_name: institutionName.trim(),
          year_range: yearRange.trim(),
          location: location.trim(),
          description: description.trim()
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

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Kelola Pengalaman Kerja</h2>
          <p className="text-sm text-slate-500 mt-1">
            Riwayat institusi, rentang waktu, dan ringkasan tanggung jawab profesional.
          </p>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pengalaman</span>
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <h3 className="text-lg font-bold text-slate-900">
              {editingExp ? 'Edit Pengalaman' : 'Tambah Pengalaman Baru'}
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
                  Nama Instansi / Perusahaan <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={institutionName}
                  onChange={(e) => setInstitutionName(e.target.value)}
                  placeholder="Contoh: PT Kreatif Nusantara"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Rentang Tahun / Periode <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={yearRange}
                  onChange={(e) => setYearRange(e.target.value)}
                  placeholder="Contoh: 2022 — Sekarang atau 2020 — 2022"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Lokasi (Kota / Remote)
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Contoh: Jakarta / Online / Bandung"
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Deskripsi Tanggung Jawab / Pencapaian
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Uraikan fokus peran, pencapaian kerja, atau proyek utama yang dijalani..."
                className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
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
                disabled={loading || !institutionName.trim() || !yearRange.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Menyimpan...' : 'Simpan Pengalaman'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Experience List */}
      <div className="space-y-4">
        {experiences.map((exp) => (
          <div
            key={exp.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 shadow-xs"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900">{exp.institution_name}</h3>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                  {exp.year_range}
                </span>
              </div>
              {exp.location && (
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{exp.location}</span>
                </div>
              )}
              {exp.description && (
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{exp.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-start">
              <button
                type="button"
                onClick={() => openEditForm(exp)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(exp)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        ))}

        {experiences.length === 0 && !isFormOpen && (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400 text-sm">
            Belum ada pengalaman kerja yang ditambahkan.
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Pengalaman"
        message={`Apakah Anda yakin ingin menghapus pengalaman di "${deleteTarget?.institution_name}"?`}
        confirmLabel="Ya, Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

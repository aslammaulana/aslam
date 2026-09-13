import React, { useState } from 'react';
import { Save, CheckCircle2, User, HelpCircle } from 'lucide-react';
import { Profile } from '../../types.ts';
import { ImageUploader } from './ImageUploader.tsx';

interface ProfileManagerProps {
  profile: Profile;
  onSave: (updated: Partial<Profile>) => Promise<void>;
}

export const ProfileManager: React.FC<ProfileManagerProps> = ({ profile, onSave }) => {
  const [formData, setFormData] = useState<Profile>({ ...profile });
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg(false);
    try {
      await onSave(formData);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 4000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900">Kelola Profil Utama</h2>
        <p className="text-sm text-slate-500 mt-1">
          Informasi ini ditampilkan di Hero Section halaman depan portofolio Anda.
        </p>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2.5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-medium animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>Profil berhasil disimpan dan diperbarui di halaman publik!</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6 bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        
        {/* Foto Profil & Preview */}
        <div>
          <ImageUploader
            label="Foto Profil (Rasio 1:1, membulat halus)"
            currentImage={formData.avatar_url}
            onImageChange={(url) => setFormData((prev) => ({ ...prev, avatar_url: url }))}
            aspectRatio="square"
          />
        </div>

        {/* Nama Lengkap & Tagline */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.full_name}
              onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              placeholder="Contoh: Rania"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-400">
              Nama ini akan di-highlight dengan warna biru di hero section.
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">
              Tagline / Peran Profesional
            </label>
            <input
              type="text"
              value={formData.tagline}
              onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
              placeholder="Contoh: Graphic Designer & Content Creator"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Deskripsi Singkat */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1.5">
            Deskripsi Singkat (1–3 kalimat)
          </label>
          <textarea
            rows={3}
            value={formData.short_description}
            onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
            placeholder="Tuliskan ringkasan diri dan nilai profesional Anda..."
            className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {/* Status Label & Resume URL */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="flex items-center gap-1 mb-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Label Status (Opsional)
              </label>
              <span title="Jika dikosongkan, label status tidak akan muncul di bawah foto">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              </span>
            </div>
            <input
              type="text"
              value={formData.status_label || ''}
              onChange={(e) => setFormData({ ...formData, status_label: e.target.value })}
              placeholder="Contoh: Terbuka untuk Kolaborasi"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-400">
              Kosongkan jika tidak ingin menampilkan status aktif.
            </p>
          </div>

          <div>
            <div className="flex items-center gap-1 mb-1.5">
              <label className="block text-sm font-semibold text-slate-700">
                Link Resume (Google Drive)
              </label>
              <span title="Hanya jika diisi, tombol Resume akan dirender di homepage. Jika kosong, tombol hilang otomatis.">
                <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              </span>
            </div>
            <input
              type="url"
              value={formData.resume_url || ''}
              onChange={(e) => setFormData({ ...formData, resume_url: e.target.value })}
              placeholder="https://drive.google.com/file/d/.../view"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            />
            <p className="mt-1 text-xs text-slate-400">
              Tombol "Resume" di homepage bersifat kondisional, hanya muncul jika field ini terisi.
            </p>
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 text-white font-medium text-sm hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Menyimpan...' : 'Simpan Perubahan'}</span>
          </button>
        </div>

      </form>
    </div>
  );
};

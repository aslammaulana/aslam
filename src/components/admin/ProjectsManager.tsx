import React, { useState } from 'react';
import { Plus, Edit2, Trash2, ExternalLink, Folder, Save, X } from 'lucide-react';
import { Project } from '../../types.ts';
import { ImageUploader } from './ImageUploader.tsx';
import { ConfirmDialog } from './ConfirmDialog.tsx';

interface ProjectsManagerProps {
  projects: Project[];
  onAdd: (project: Omit<Project, 'id'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Project>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const ProjectsManager: React.FC<ProjectsManagerProps> = ({
  projects,
  onAdd,
  onUpdate,
  onDelete
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [projectLink, setProjectLink] = useState('');

  const openAddForm = () => {
    setEditingProject(null);
    setTitle('');
    setDescription('');
    setImageUrl(null);
    setProjectLink('');
    setIsFormOpen(true);
  };

  const openEditForm = (project: Project) => {
    setEditingProject(project);
    setTitle(project.title);
    setDescription(project.description || '');
    setImageUrl(project.image_url);
    setProjectLink(project.project_link || '');
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingProject(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      if (editingProject) {
        await onUpdate(editingProject.id, {
          title: title.trim(),
          description: description.trim(),
          image_url: imageUrl,
          project_link: projectLink.trim() || null
        });
      } else {
        await onAdd({
          title: title.trim(),
          description: description.trim(),
          image_url: imageUrl,
          project_link: projectLink.trim() || null
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
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Kelola Project & Portfolio</h2>
          <p className="text-sm text-slate-500 mt-1">
            Tambah dan perbarui karya, desain, dokumen kerja, atau video promosi Anda.
          </p>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Project Baru</span>
          </button>
        )}
      </div>

      {/* Form Tambah/Edit Project Modal / Expandable Card */}
      {isFormOpen && (
        <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <h3 className="text-lg font-bold text-slate-900">
              {editingProject ? 'Edit Proyek' : 'Tambah Proyek Baru'}
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
            {/* Image Uploader */}
            <ImageUploader
              label="Gambar Sampul Proyek (Opsional)"
              currentImage={imageUrl}
              onImageChange={(url) => setImageUrl(url)}
              aspectRatio="video"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Judul Proyek <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Desain Feed Instagram — Brand Kopi Lokal"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Link Eksternal (Website / Google Drive / Demo)
                </label>
                <input
                  type="url"
                  value={projectLink}
                  onChange={(e) => setProjectLink(e.target.value)}
                  placeholder="https://drive.google.com/... atau https://..."
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <p className="mt-1 text-xs text-slate-400">
                  Dapat berupa link Google Drive untuk karya video/musik/animasi.
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Deskripsi Singkat Proyek
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Jelaskan tujuan, kontribusi, atau hasil dari proyek ini..."
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
                disabled={loading || !title.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Menyimpan...' : 'Simpan Proyek'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Projects List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="bg-white border border-slate-200 rounded-2xl overflow-hidden flex flex-col justify-between shadow-xs hover:border-slate-300 transition-all"
          >
            {project.image_url ? (
              <div className="aspect-[16/10] w-full bg-slate-100 overflow-hidden">
                <img
                  src={project.image_url}
                  alt={project.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[16/10] w-full bg-slate-50 flex items-center justify-center text-slate-400 border-b border-slate-100">
                <Folder className="w-8 h-8 stroke-[1.5]" />
              </div>
            )}

            <div className="p-5 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="font-bold text-slate-900 line-clamp-1">{project.title}</h3>
                <p className="mt-1.5 text-xs text-slate-500 line-clamp-2">{project.description}</p>
                {project.project_link && (
                  <a
                    href={project.project_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:underline"
                  >
                    <span>Link Proyek</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>

              <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => openEditForm(project)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Edit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(project)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Hapus</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {projects.length === 0 && !isFormOpen && (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center">
          <Folder className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">Belum ada project</h3>
          <p className="text-sm text-slate-500 mt-1">
            Klik tombol "Tambah Project Baru" untuk menampilkan portofolio pertama Anda.
          </p>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Proyek"
        message={`Apakah Anda yakin ingin menghapus proyek "${deleteTarget?.title}"? Tindakan ini tidak dapat dibatalkan.`}
        confirmLabel="Ya, Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Award, Calendar, MapPin, Save, X } from 'lucide-react';
import { Course } from '../../types.ts';
import { ConfirmDialog } from './ConfirmDialog.tsx';

interface CoursesManagerProps {
  courses: Course[];
  onAdd: (course: Omit<Course, 'id'>) => Promise<void>;
  onUpdate: (id: string, updates: Partial<Course>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

export const CoursesManager: React.FC<CoursesManagerProps> = ({
  courses,
  onAdd,
  onUpdate,
  onDelete
}) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);

  const [courseName, setCourseName] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [year, setYear] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  const openAddForm = () => {
    setEditingCourse(null);
    setCourseName('');
    setOrganizer('');
    setYear('');
    setLocation('');
    setDescription('');
    setIsFormOpen(true);
  };

  const openEditForm = (course: Course) => {
    setEditingCourse(course);
    setCourseName(course.course_name);
    setOrganizer(course.organizer);
    setYear(course.year);
    setLocation(course.location);
    setDescription(course.description);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingCourse(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!courseName.trim()) return;

    setLoading(true);
    try {
      if (editingCourse) {
        await onUpdate(editingCourse.id, {
          course_name: courseName.trim(),
          organizer: organizer.trim(),
          year: year.trim(),
          location: location.trim(),
          description: description.trim()
        });
      } else {
        await onAdd({
          course_name: courseName.trim(),
          organizer: organizer.trim(),
          year: year.trim(),
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
          <h2 className="text-xl font-bold text-slate-900">Kelola Pelatihan & Kursus</h2>
          <p className="text-sm text-slate-500 mt-1">
            Riwayat sertifikasi, lokakarya, atau kursus profesional yang pernah diikuti.
          </p>
        </div>
        {!isFormOpen && (
          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-medium transition-colors cursor-pointer shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pelatihan</span>
          </button>
        )}
      </div>

      {isFormOpen && (
        <div className="bg-white border-2 border-blue-200 rounded-2xl p-6 sm:p-8 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-6">
            <h3 className="text-lg font-bold text-slate-900">
              {editingCourse ? 'Edit Pelatihan' : 'Tambah Pelatihan Baru'}
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
                  Nama Pelatihan / Kursus <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  placeholder="Contoh: Digital Marketing Fundamentals"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Penyelenggara
                </label>
                <input
                  type="text"
                  value={organizer}
                  onChange={(e) => setOrganizer(e.target.value)}
                  placeholder="Contoh: Skill Academy / Kemenparekraf"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Tahun Pelaksanaan
                </label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="Contoh: 2022"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Lokasi / Format
                </label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="Contoh: Online / Jakarta"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                Deskripsi Materi / Keterangan
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Rangkum topik yang dipelajari atau sertifikat yang diraih..."
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
                disabled={loading || !courseName.trim()}
                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-xl transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
              >
                <Save className="w-4 h-4" />
                <span>{loading ? 'Menyimpan...' : 'Simpan Pelatihan'}</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Courses List */}
      <div className="space-y-4">
        {courses.map((course) => (
          <div
            key={course.id}
            className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 shadow-xs"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900">{course.course_name}</h3>
                {course.year && (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {course.year}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                {course.organizer && <span>Oleh: <strong className="text-slate-700">{course.organizer}</strong></span>}
                {course.location && <span>• Lokasi: {course.location}</span>}
              </div>
              {course.description && (
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{course.description}</p>
              )}
            </div>

            <div className="flex items-center gap-2 self-end sm:self-start">
              <button
                type="button"
                onClick={() => openEditForm(course)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>Edit</span>
              </button>
              <button
                type="button"
                onClick={() => setDeleteTarget(course)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
              >
                <Trash2 className="w-3 h-3" />
                <span>Hapus</span>
              </button>
            </div>
          </div>
        ))}

        {courses.length === 0 && !isFormOpen && (
          <div className="bg-white border border-slate-200 rounded-2xl p-10 text-center text-slate-400 text-sm">
            Belum ada pelatihan atau sertifikasi yang ditambahkan.
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        title="Hapus Pelatihan"
        message={`Apakah Anda yakin ingin menghapus pelatihan "${deleteTarget?.course_name}"?`}
        confirmLabel="Ya, Hapus"
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};

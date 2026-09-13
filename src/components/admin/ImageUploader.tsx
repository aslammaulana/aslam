import React, { useState, useRef } from 'react';
import { UploadCloud, Image as ImageIcon, X, AlertCircle } from 'lucide-react';

interface ImageUploaderProps {
  label: string;
  currentImage: string | null;
  onImageChange: (url: string | null) => void;
  aspectRatio?: 'square' | 'video' | 'auto';
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  label,
  currentImage,
  onImageChange,
  aspectRatio = 'auto'
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [inputUrl, setInputUrl] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateAndProcessFile = (file: File) => {
    setErrorMsg(null);

    // Validate type (PRD Section 7.5: jpg/png/webp)
    const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setErrorMsg('Format file tidak didukung. Harap gunakan format JPG, PNG, atau WEBP.');
      return;
    }

    // Validate size <= 5MB (PRD Section 7.5)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setErrorMsg('Ukuran file melebihi batas maksimum 5MB.');
      return;
    }

    // Read and convert to Data URL for instant preview & storage
    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      if (result) {
        onImageChange(result);
      }
    };
    reader.onerror = () => {
      setErrorMsg('Gagal membaca file gambar.');
    };
    reader.readAsDataURL(file);
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndProcessFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      validateAndProcessFile(e.target.files[0]);
    }
  };

  const handleApplyUrl = () => {
    if (inputUrl.trim()) {
      onImageChange(inputUrl.trim());
      setInputUrl('');
      setShowUrlInput(false);
      setErrorMsg(null);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-700">{label}</label>
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs text-blue-600 hover:text-blue-700 font-medium underline"
        >
          {showUrlInput ? 'Unggah Berkas File' : 'Gunakan Link URL'}
        </button>
      </div>

      {errorMsg && (
        <div className="flex items-center gap-2 p-3 text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl">
          <AlertCircle className="w-4 h-4 flex-shrink-0 text-red-500" />
          <span>{errorMsg}</span>
        </div>
      )}

      {showUrlInput ? (
        <div className="flex gap-2">
          <input
            type="url"
            value={inputUrl}
            onChange={(e) => setInputUrl(e.target.value)}
            placeholder="https://example.com/gambar.jpg"
            className="flex-1 px-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
          <button
            type="button"
            onClick={handleApplyUrl}
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700"
          >
            Terapkan
          </button>
        </div>
      ) : null}

      {/* Image Preview & Upload Container */}
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-2xl p-4 transition-all text-center flex flex-col items-center justify-center ${
          dragActive
            ? 'border-blue-500 bg-blue-50/50'
            : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileChange}
          className="hidden"
        />

        {currentImage ? (
          <div className="relative group w-full flex flex-col items-center">
            <div
              className={`relative overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs ${
                aspectRatio === 'square'
                  ? 'w-36 h-36 sm:w-40 sm:h-40 aspect-square'
                  : 'w-full max-w-sm aspect-[16/10]'
              }`}
            >
              <img
                src={currentImage}
                alt="Preview"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-1.5 bg-white text-slate-800 text-xs font-medium rounded-lg shadow-sm hover:bg-slate-100"
                >
                  Ganti
                </button>
                <button
                  type="button"
                  onClick={() => onImageChange(null)}
                  className="px-3 py-1.5 bg-red-600 text-white text-xs font-medium rounded-lg shadow-sm hover:bg-red-700"
                >
                  Hapus
                </button>
              </div>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              Arahkan kursor atau sentuh untuk mengganti/menghapus gambar
            </p>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full py-6 flex flex-col items-center cursor-pointer select-none"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Klik untuk memilih atau seret gambar ke sini
            </p>
            <p className="mt-1 text-xs text-slate-500">
              Mendukung format JPG, PNG, WEBP (maks. 5MB)
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

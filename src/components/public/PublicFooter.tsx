import React from 'react';
import { Lock } from 'lucide-react';

interface PublicFooterProps {
  fullName: string;
  onNavigateAdmin?: () => void;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ fullName, onNavigateAdmin }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-100 bg-white py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <p className="text-sm text-slate-500">
          &copy; {currentYear} <span className="font-medium text-slate-700">{fullName}</span>. Seluruh hak cipta dilindungi.
        </p>
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span>Portofolio Profesional Pribadi</span>
          <span>&bull;</span>
          {onNavigateAdmin && (
            <button
              type="button"
              onClick={onNavigateAdmin}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-blue-600 font-medium transition-colors cursor-pointer"
              title="Akses Login Admin"
            >
              <Lock className="w-3 h-3 text-slate-400" />
              <span>Login Admin</span>
            </button>
          )}
        </div>
      </div>
    </footer>
  );
};

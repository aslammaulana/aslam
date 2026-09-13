import React from 'react';

interface PublicFooterProps {
  fullName: string;
}

export const PublicFooter: React.FC<PublicFooterProps> = ({ fullName }) => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full border-t border-slate-100 bg-white py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <p className="text-sm text-slate-500">
          &copy; {currentYear} <span className="font-medium text-slate-700">{fullName}</span>. Seluruh hak cipta dilindungi.
        </p>
        <p className="text-xs text-slate-400">
          Portofolio Profesional Pribadi &bull; Dirancang Bersih &amp; Terbuka
        </p>
      </div>
    </footer>
  );
};

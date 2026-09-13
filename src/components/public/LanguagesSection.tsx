import React from 'react';
import { Languages as LanguageIcon } from 'lucide-react';
import { Language } from '../../types.ts';

interface LanguagesSectionProps {
  languages: Language[];
}

export const LanguagesSection: React.FC<LanguagesSectionProps> = ({ languages }) => {
  if (!languages || languages.length === 0) return null;

  return (
    <section id="bahasa" className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 border-t border-slate-100">
      <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-16">
        
        {/* Section Heading */}
        <div className="w-full md:w-64 flex-shrink-0">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Bahasa</h2>
          <p className="mt-1 text-sm text-slate-500">
            Bahasa komunikasi yang dikuasai.
          </p>
        </div>

        {/* Languages List: Plain text without progress bars (PRD Section 5.6) */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {languages.map((lang) => (
              <div
                key={lang.id}
                className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/70"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
                  <LanguageIcon className="w-4 h-4" />
                </div>
                <div className="text-sm md:text-base font-medium text-slate-800">
                  <span className="font-semibold text-slate-900">{lang.language_name}</span>
                  <span className="mx-2 text-slate-400">—</span>
                  <span className="text-slate-600">{lang.proficiency_level}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

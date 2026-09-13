import React from 'react';
import { MapPin, Calendar, Building2 } from 'lucide-react';
import { Experience } from '../../types.ts';

interface ExperienceSectionProps {
  experiences: Experience[];
}

export const ExperienceSection: React.FC<ExperienceSectionProps> = ({ experiences }) => {
  if (!experiences || experiences.length === 0) return null;

  return (
    <section id="pengalaman" className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 border-t border-slate-100">
      <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-16">
        
        {/* Section Heading */}
        <div className="w-full md:w-64 flex-shrink-0">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Pengalaman Kerja</h2>
          <p className="mt-1 text-sm text-slate-500">
            Riwayat profesi dan tanggung jawab yang pernah dijalani.
          </p>
        </div>

        {/* Vertical Timeline List */}
        <div className="flex-1 space-y-8 relative before:absolute before:inset-0 before:left-3 md:before:left-3.5 before:w-0.5 before:bg-slate-200">
          {experiences.map((exp) => (
            <div key={exp.id} className="relative flex items-start pl-8 sm:pl-10 group">
              {/* Timeline dot */}
              <div className="absolute left-1.5 md:left-2 top-1.5 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-white border-2 border-blue-600 group-hover:scale-125 transition-transform" />

              <div className="w-full bg-slate-50/70 hover:bg-slate-50 border border-slate-200/80 rounded-2xl p-5 sm:p-6 transition-all">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                  <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-blue-600 flex-shrink-0" />
                    <span>{exp.institution_name}</span>
                  </h3>
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full w-fit">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{exp.year_range}</span>
                  </div>
                </div>

                {exp.location && (
                  <div className="mt-1.5 flex items-center gap-1 text-xs text-slate-500 font-medium">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{exp.location}</span>
                  </div>
                )}

                {exp.description && (
                  <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                    {exp.description}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
};

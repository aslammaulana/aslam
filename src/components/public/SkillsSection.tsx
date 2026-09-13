import React from 'react';
import { Skill } from '../../types.ts';

interface SkillsSectionProps {
  skills: Skill[];
}

export const SkillsSection: React.FC<SkillsSectionProps> = ({ skills }) => {
  if (!skills || skills.length === 0) return null;

  return (
    <section id="skills" className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 border-t border-slate-100">
      <div className="flex flex-col md:flex-row md:items-start gap-6 md:gap-16">
        
        {/* Section Heading */}
        <div className="w-full md:w-64 flex-shrink-0">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Keahlian</h2>
          <p className="mt-1 text-sm text-slate-500">
            Keterampilan dan perangkat kerja yang biasa digunakan.
          </p>
        </div>

        {/* Skills List: Simple chips, no levels, flex-wrap gap-2 */}
        <div className="flex-1">
          <div className="flex flex-wrap gap-2.5">
            {skills.map((skill) => (
              <span
                key={skill.id}
                className="inline-flex items-center px-4 py-2 rounded-xl bg-slate-100 text-slate-800 text-sm md:text-base font-medium border border-slate-200/80 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors"
              >
                {skill.name}
              </span>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
};

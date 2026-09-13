import React from 'react';
import { ExternalLink, Folder } from 'lucide-react';
import { Project } from '../../types.ts';

interface ProjectsSectionProps {
  projects: Project[];
}

export const ProjectsSection: React.FC<ProjectsSectionProps> = ({ projects }) => {
  if (!projects || projects.length === 0) return null;

  return (
    <section id="portfolio" className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 border-t border-slate-100">
      <div className="mb-8 md:mb-12">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">Portfolio & Proyek</h2>
        <p className="mt-2 text-base text-slate-500 max-w-2xl">
          Kumpulan hasil karya, materi kreatif, dan proyek terpilih yang telah diselesaikan.
        </p>
      </div>

      {/* Grid: 1 col on mobile, 2 col on tablet, 3 col on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project) => (
          <div
            key={project.id}
            className="flex flex-col bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-blue-300 hover:shadow-md transition-all group"
          >
            {/* Project Image */}
            {project.image_url ? (
              <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 border-b border-slate-100">
                <img
                  src={project.image_url}
                  alt={project.title}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="aspect-[16/10] w-full flex items-center justify-center bg-slate-50 border-b border-slate-100 text-slate-400">
                <Folder className="w-10 h-10 stroke-[1.5]" />
              </div>
            )}

            {/* Card Content */}
            <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">
                  {project.title}
                </h3>
                {project.description && (
                  <p className="mt-2 text-sm text-slate-600 line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>
                )}
              </div>

              {/* External Link (Google Drive / Website) */}
              {project.project_link && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <a
                    href={project.project_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    <span>Buka Proyek</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

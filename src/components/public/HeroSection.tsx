import React from 'react';
import { FileText, ArrowRight, Mail } from 'lucide-react';
import { Profile } from '../../types.ts';

interface HeroSectionProps {
  profile: Profile;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ profile }) => {
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const hasResume = profile.resume_url && profile.resume_url.trim().length > 0;

  return (
    <section id="tentang" className="w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 md:py-24">
      {/* Desktop (>= md) 2-column layout; Mobile (< md) 1-column layout */}
      <div className="flex flex-col md:flex-row items-center md:items-start gap-8 md:gap-12 lg:gap-16">
        
        {/* Left Column (Desktop) / Top Column (Mobile): Profile Photo & Status */}
        <div className="w-full max-w-[280px] sm:max-w-[320px] md:w-[320px] lg:w-[360px] flex-shrink-0 flex flex-col items-center">
          <div className="relative w-64 h-64 sm:w-72 sm:h-72 md:w-80 md:h-80 aspect-square overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-slate-100">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-blue-50 text-blue-600 font-bold text-5xl">
                {profile.full_name ? profile.full_name.charAt(0) : 'P'}
              </div>
            )}
          </div>

          {/* Status Label (bullet + text) */}
          {profile.status_label && profile.status_label.trim().length > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>{profile.status_label.replace(/^[•\s]+/, '')}</span>
            </div>
          )}
        </div>

        {/* Right Column (Desktop) / Bottom Content (Mobile): Details & Actions */}
        <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left">
          {/* 1. Badge kecil "Portofolio Profesional" */}
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-700 text-xs font-semibold uppercase tracking-wider mb-4">
            Portofolio Profesional
          </div>

          {/* 2. Nama besar dengan nama utama berwarna biru */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 leading-tight">
            Halo, saya <span className="text-blue-600">{profile.full_name}</span>
          </h1>

          {/* 3. Tagline / jabatan */}
          {profile.tagline && (
            <p className="mt-3 text-lg sm:text-xl font-medium text-slate-700">
              {profile.tagline}
            </p>
          )}

          {/* 4. Deskripsi singkat (1-3 kalimat) */}
          {profile.short_description && (
            <p className="mt-4 text-base sm:text-lg text-slate-600 leading-relaxed max-w-2xl">
              {profile.short_description}
            </p>
          )}

          {/* 5. Tombol aksi (horizontal, wrap di mobile) */}
          <div className="mt-8 flex flex-wrap items-center justify-center md:justify-start gap-3 w-full sm:w-auto">
            {/* Hubungi Saya - Primary solid blue */}
            <button
              onClick={() => scrollTo('kontak')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-blue-600 text-white font-medium text-sm sm:text-base hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-sm cursor-pointer"
            >
              <Mail className="w-4 h-4" />
              <span>Hubungi Saya</span>
            </button>

            {/* Lihat Project - Secondary/outline */}
            <button
              onClick={() => scrollTo('portfolio')}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-slate-300 text-slate-700 font-medium text-sm sm:text-base hover:bg-slate-50 hover:border-slate-400 transition-colors shadow-sm cursor-pointer"
            >
              <span>Lihat Project</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Resume - KONDISIONAL: hanya dirender jika resume_url diisi (PRD Section 5.1) */}
            {hasResume && (
              <a
                href={profile.resume_url!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 font-medium text-sm sm:text-base hover:bg-slate-200 transition-colors shadow-sm"
              >
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Resume</span>
              </a>
            )}
          </div>

        </div>

      </div>
    </section>
  );
};

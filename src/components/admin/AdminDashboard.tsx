import React, { useState } from 'react';
import {
  User,
  Sparkles,
  FolderKanban,
  Briefcase,
  GraduationCap,
  Languages as LanguageIcon,
  PhoneCall,
  LogOut,
  Globe,
  Menu,
  X,
  ShieldCheck,
  Server
} from 'lucide-react';
import { PortfolioData, Profile, Skill, Project, Experience, Course, Language, Contact } from '../../types.ts';
import { ProfileManager } from './ProfileManager.tsx';
import { SkillsManager } from './SkillsManager.tsx';
import { ProjectsManager } from './ProjectsManager.tsx';
import { ExperienceManager } from './ExperienceManager.tsx';
import { CoursesManager } from './CoursesManager.tsx';
import { LanguagesManager } from './LanguagesManager.tsx';
import { ContactsManager } from './ContactsManager.tsx';
import { KeepAliveStatus } from './KeepAliveStatus.tsx';

interface AdminDashboardProps {
  data: PortfolioData;
  onLogout: () => void;
  onNavigateHome: () => void;
  onUpdateProfile: (p: Partial<Profile>) => Promise<void>;
  onAddSkill: (name: string) => Promise<void>;
  onUpdateSkill: (id: string, name: string) => Promise<void>;
  onDeleteSkill: (id: string) => Promise<void>;
  onAddProject: (p: Omit<Project, 'id'>) => Promise<void>;
  onUpdateProject: (id: string, updates: Partial<Project>) => Promise<void>;
  onDeleteProject: (id: string) => Promise<void>;
  onAddExperience: (e: Omit<Experience, 'id'>) => Promise<void>;
  onUpdateExperience: (id: string, updates: Partial<Experience>) => Promise<void>;
  onDeleteExperience: (id: string) => Promise<void>;
  onAddCourse: (c: Omit<Course, 'id'>) => Promise<void>;
  onUpdateCourse: (id: string, updates: Partial<Course>) => Promise<void>;
  onDeleteCourse: (id: string) => Promise<void>;
  onAddLanguage: (l: Omit<Language, 'id'>) => Promise<void>;
  onUpdateLanguage: (id: string, updates: Partial<Language>) => Promise<void>;
  onDeleteLanguage: (id: string) => Promise<void>;
  onAddContact: (c: Omit<Contact, 'id'>) => Promise<void>;
  onUpdateContact: (id: string, updates: Partial<Contact>) => Promise<void>;
  onDeleteContact: (id: string) => Promise<void>;
}

type TabKey =
  | 'profile'
  | 'skills'
  | 'projects'
  | 'experiences'
  | 'courses'
  | 'languages'
  | 'contacts'
  | 'keepalive';

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  data,
  onLogout,
  onNavigateHome,
  onUpdateProfile,
  onAddSkill,
  onUpdateSkill,
  onDeleteSkill,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onAddExperience,
  onUpdateExperience,
  onDeleteExperience,
  onAddCourse,
  onUpdateCourse,
  onDeleteCourse,
  onAddLanguage,
  onUpdateLanguage,
  onDeleteLanguage,
  onAddContact,
  onUpdateContact,
  onDeleteContact
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('profile');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { key: 'profile' as TabKey, label: 'Profil Utama', icon: User, count: null },
    { key: 'skills' as TabKey, label: 'Keahlian (Skills)', icon: Sparkles, count: data.skills.length },
    { key: 'projects' as TabKey, label: 'Project & Portfolio', icon: FolderKanban, count: data.projects.length },
    { key: 'experiences' as TabKey, label: 'Pengalaman Kerja', icon: Briefcase, count: data.experiences.length },
    { key: 'courses' as TabKey, label: 'Pelatihan & Kursus', icon: GraduationCap, count: data.courses.length },
    { key: 'languages' as TabKey, label: 'Bahasa', icon: LanguageIcon, count: data.languages.length },
    { key: 'contacts' as TabKey, label: 'Saluran Kontak', icon: PhoneCall, count: data.contacts.length },
    { key: 'keepalive' as TabKey, label: 'Keep-Alive & Sistem', icon: Server, count: null },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Sidebar (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 lg:w-72 bg-white border-r border-slate-200 shrink-0">
        <div className="p-6 border-b border-slate-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
            P
          </div>
          <div>
            <h1 className="text-sm font-bold text-slate-900 leading-tight">Admin Dashboard</h1>
            <p className="text-xs text-slate-400">Portofolio Pribadi</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-blue-50 text-blue-700 border border-blue-100'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== null && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${isActive ? 'bg-blue-200/60 text-blue-800' : 'bg-slate-100 text-slate-500'}`}>
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <button
            type="button"
            onClick={onNavigateHome}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors cursor-pointer"
          >
            <Globe className="w-4 h-4 text-slate-400" />
            <span>Lihat Website Publik</span>
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar (Logout)</span>
          </button>
        </div>
      </aside>

      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-sm">
            P
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Admin Portofolio</h2>
            <p className="text-xs text-slate-500">
              {navItems.find((n) => n.key === activeTab)?.label}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onNavigateHome}
            title="Lihat Website"
            className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
          >
            <Globe className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 p-4 space-y-1 shadow-md z-20">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() => {
                  setActiveTab(item.key);
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm font-medium ${
                  isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {item.count !== null && (
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                    {item.count}
                  </span>
                )}
              </button>
            );
          })}
          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={onNavigateHome}
              className="text-xs font-medium text-blue-600 py-1"
            >
              Lihat Website Publik
            </button>
            <button
              type="button"
              onClick={onLogout}
              className="text-xs font-medium text-red-600 py-1"
            >
              Logout
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-10 overflow-y-auto max-w-6xl">
        {activeTab === 'profile' && (
          <ProfileManager profile={data.profile} onSave={onUpdateProfile} />
        )}
        {activeTab === 'skills' && (
          <SkillsManager
            skills={data.skills}
            onAdd={onAddSkill}
            onUpdate={onUpdateSkill}
            onDelete={onDeleteSkill}
          />
        )}
        {activeTab === 'projects' && (
          <ProjectsManager
            projects={data.projects}
            onAdd={onAddProject}
            onUpdate={onUpdateProject}
            onDelete={onDeleteProject}
          />
        )}
        {activeTab === 'experiences' && (
          <ExperienceManager
            experiences={data.experiences}
            onAdd={onAddExperience}
            onUpdate={onUpdateExperience}
            onDelete={onDeleteExperience}
          />
        )}
        {activeTab === 'courses' && (
          <CoursesManager
            courses={data.courses}
            onAdd={onAddCourse}
            onUpdate={onUpdateCourse}
            onDelete={onDeleteCourse}
          />
        )}
        {activeTab === 'languages' && (
          <LanguagesManager
            languages={data.languages}
            onAdd={onAddLanguage}
            onUpdate={onUpdateLanguage}
            onDelete={onDeleteLanguage}
          />
        )}
        {activeTab === 'contacts' && (
          <ContactsManager
            contacts={data.contacts}
            onAdd={onAddContact}
            onUpdate={onUpdateContact}
            onDelete={onDeleteContact}
          />
        )}
        {activeTab === 'keepalive' && <KeepAliveStatus />}
      </main>
    </div>
  );
};

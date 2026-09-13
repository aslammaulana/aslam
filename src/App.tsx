import React, { useState, useEffect } from 'react';
import { initialPortfolioData } from './defaultData.ts';
import { PortfolioData, Profile, Skill, Project, Experience, Course, Language, Contact } from './types.ts';
import {
  fetchPortfolioData,
  getCachedData,
  isAuthenticated,
  clearAdminToken,
  setAdminToken,
  setAdminUser,
  updateProfile,
  addSkill,
  updateSkill,
  deleteSkill,
  addProject,
  updateProject,
  deleteProject,
  addExperience,
  updateExperience,
  deleteExperience,
  addCourse,
  updateCourse,
  deleteCourse,
  addLanguage,
  updateLanguage,
  deleteLanguage,
  addContact,
  updateContact,
  deleteContact
} from './lib/api.ts';
import { supabase, isSupabaseConfigured } from './lib/supabase.ts';

// Public Components
import { PublicNavbar } from './components/public/PublicNavbar.tsx';
import { HeroSection } from './components/public/HeroSection.tsx';
import { SkillsSection } from './components/public/SkillsSection.tsx';
import { ProjectsSection } from './components/public/ProjectsSection.tsx';
import { ExperienceSection } from './components/public/ExperienceSection.tsx';
import { CoursesSection } from './components/public/CoursesSection.tsx';
import { LanguagesSection } from './components/public/LanguagesSection.tsx';
import { ContactSection } from './components/public/ContactSection.tsx';
import { PublicFooter } from './components/public/PublicFooter.tsx';

// Admin Components
import { AdminLogin } from './components/admin/AdminLogin.tsx';
import { AdminDashboard } from './components/admin/AdminDashboard.tsx';

export default function App() {
  const [data, setData] = useState<PortfolioData>(() => getCachedData());
  const [currentPath, setCurrentPath] = useState<string>('/');

  // Initialize Route & Data
  useEffect(() => {
    // 1. Detect route from browser location
    const detectPath = () => {
      const pathname = window.location.pathname.replace(/\/+$/, '') || '/';
      const rawHash = window.location.hash.replace(/^#\/?/, '').toLowerCase();
      const searchParams = new URLSearchParams(window.location.search);
      const queryRoute = (searchParams.get('route') || searchParams.get('path') || searchParams.get('p') || '').toLowerCase();
      const hasAdminParam = searchParams.has('admin') || searchParams.get('admin') === 'true' || searchParams.has('login');

      // 1. Check query parameters e.g. ?admin, ?route=/admin/login
      if (hasAdminParam || queryRoute.includes('admin') || queryRoute.includes('login')) {
        return '/admin/login';
      }
      if (queryRoute.includes('dashboard')) {
        return '/admin/dashboard';
      }

      // 2. Check hash route e.g. #admin, #/admin, #/admin/login, #login
      if (rawHash === 'admin' || rawHash === 'admin/login' || rawHash === 'login') {
        return '/admin/login';
      }
      if (rawHash === 'admin/dashboard' || rawHash === 'dashboard') {
        return '/admin/dashboard';
      }

      // 3. Check browser pathname e.g. /admin, /admin/login, /login
      if (pathname === '/admin' || pathname === '/admin/login' || pathname === '/login') {
        return '/admin/login';
      }
      if (pathname === '/admin/dashboard') {
        return '/admin/dashboard';
      }

      return '/';
    };

    const initialRoute = detectPath();
    setCurrentPath(initialRoute);

    // 2. Fetch Portfolio Data
    fetchPortfolioData().then((fetched) => {
      if (fetched) {
        setData(fetched);
      }
    });

    // 3. Listen to browser popstate
    const handlePopState = () => {
      const p = detectPath();
      setCurrentPath(p);
    };
    window.addEventListener('popstate', handlePopState);
    window.addEventListener('hashchange', handlePopState);

    // 4. Keyboard shortcut: Alt+A or Ctrl+Shift+A opens /admin/login
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.altKey && e.key.toLowerCase() === 'a') || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a')) {
        e.preventDefault();
        navigateTo(currentPath.startsWith('/admin') ? '/' : '/admin/login');
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    // 5. Supabase Auth State Change Listener
    let authSubscription: { unsubscribe: () => void } | null = null;
    if (isSupabaseConfigured()) {
      const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
        if ((event === 'SIGNED_IN' || event === 'INITIAL_SESSION' || event === 'TOKEN_REFRESHED') && session) {
          setAdminToken(session.access_token);
          setAdminUser({
            email: session.user?.email,
            id: session.user?.id
          });
        } else if (event === 'SIGNED_OUT') {
          clearAdminToken();
        }
      });
      authSubscription = authListener.subscription;
    }

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('hashchange', handlePopState);
      window.removeEventListener('keydown', handleKeyDown);
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  // Update Dynamic Document Title per PRD Section 6
  // Format: "{nama}" | Personal Portfolio Website
  useEffect(() => {
    const name = data.profile?.full_name?.trim() || 'Portfolio';
    document.title = `${name} | Personal Portfolio Website`;
  }, [data.profile?.full_name]);

  // Route Navigator helper
  const navigateTo = (path: string) => {
    setCurrentPath(path);
    try {
      window.history.pushState({}, '', path);
    } catch {
      window.location.hash = path;
    }
  };

  // Route Protection per PRD Section 7.1
  // If attempting to access /admin/dashboard without auth, redirect to /admin/login
  useEffect(() => {
    if (currentPath === '/admin/dashboard' && !isAuthenticated()) {
      navigateTo('/admin/login');
    }
  }, [currentPath]);

  // Auto-redirect: If user is already authenticated and lands on /admin/login, send them to dashboard
  useEffect(() => {
    if (isAuthenticated() && (currentPath === '/admin/login' || currentPath === '/admin')) {
      navigateTo('/admin/dashboard');
    }
  }, [currentPath, isAuthenticated]);

  // --- Handlers for CRUD Operations ---

  const handleUpdateProfile = async (updates: Partial<Profile>) => {
    const updated = await updateProfile(updates);
    setData((prev) => ({ ...prev, profile: updated }));
  };

  const handleAddSkill = async (name: string) => {
    const skill = await addSkill(name);
    setData((prev) => ({ ...prev, skills: [...prev.skills, skill] }));
  };

  const handleUpdateSkill = async (id: string, name: string) => {
    await updateSkill(id, name);
    setData((prev) => ({
      ...prev,
      skills: prev.skills.map((s) => (s.id === id ? { ...s, name } : s))
    }));
  };

  const handleDeleteSkill = async (id: string) => {
    await deleteSkill(id);
    setData((prev) => ({
      ...prev,
      skills: prev.skills.filter((s) => s.id !== id)
    }));
  };

  const handleAddProject = async (p: Omit<Project, 'id'>) => {
    const proj = await addProject(p);
    setData((prev) => ({ ...prev, projects: [...prev.projects, proj] }));
  };

  const handleUpdateProject = async (id: string, updates: Partial<Project>) => {
    await updateProject(id, updates);
    setData((prev) => ({
      ...prev,
      projects: prev.projects.map((p) => (p.id === id ? { ...p, ...updates } : p))
    }));
  };

  const handleDeleteProject = async (id: string) => {
    await deleteProject(id);
    setData((prev) => ({
      ...prev,
      projects: prev.projects.filter((p) => p.id !== id)
    }));
  };

  const handleAddExperience = async (e: Omit<Experience, 'id'>) => {
    const exp = await addExperience(e);
    setData((prev) => ({ ...prev, experiences: [...prev.experiences, exp] }));
  };

  const handleUpdateExperience = async (id: string, updates: Partial<Experience>) => {
    await updateExperience(id, updates);
    setData((prev) => ({
      ...prev,
      experiences: prev.experiences.map((e) => (e.id === id ? { ...e, ...updates } : e))
    }));
  };

  const handleDeleteExperience = async (id: string) => {
    await deleteExperience(id);
    setData((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((e) => e.id !== id)
    }));
  };

  const handleAddCourse = async (c: Omit<Course, 'id'>) => {
    const course = await addCourse(c);
    setData((prev) => ({ ...prev, courses: [...prev.courses, course] }));
  };

  const handleUpdateCourse = async (id: string, updates: Partial<Course>) => {
    await updateCourse(id, updates);
    setData((prev) => ({
      ...prev,
      courses: prev.courses.map((c) => (c.id === id ? { ...c, ...updates } : c))
    }));
  };

  const handleDeleteCourse = async (id: string) => {
    await deleteCourse(id);
    setData((prev) => ({
      ...prev,
      courses: prev.courses.filter((c) => c.id !== id)
    }));
  };

  const handleAddLanguage = async (l: Omit<Language, 'id'>) => {
    const lang = await addLanguage(l);
    setData((prev) => ({ ...prev, languages: [...prev.languages, lang] }));
  };

  const handleUpdateLanguage = async (id: string, updates: Partial<Language>) => {
    await updateLanguage(id, updates);
    setData((prev) => ({
      ...prev,
      languages: prev.languages.map((l) => (l.id === id ? { ...l, ...updates } : l))
    }));
  };

  const handleDeleteLanguage = async (id: string) => {
    await deleteLanguage(id);
    setData((prev) => ({
      ...prev,
      languages: prev.languages.filter((l) => l.id !== id)
    }));
  };

  const handleAddContact = async (c: Omit<Contact, 'id'>) => {
    const contact = await addContact(c);
    setData((prev) => ({ ...prev, contacts: [...prev.contacts, contact] }));
  };

  const handleUpdateContact = async (id: string, updates: Partial<Contact>) => {
    await updateContact(id, updates);
    setData((prev) => ({
      ...prev,
      contacts: prev.contacts.map((c) => (c.id === id ? { ...c, ...updates } : c))
    }));
  };

  const handleDeleteContact = async (id: string) => {
    await deleteContact(id);
    setData((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((c) => c.id !== id)
    }));
  };

  const handleLogout = () => {
    clearAdminToken();
    navigateTo('/admin/login');
  };

  // Render View based on Route
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col font-sans">
      {/* VIEW ROUTING */}
      {currentPath === '/admin/login' && (
        <AdminLogin
          onLoginSuccess={() => navigateTo('/admin/dashboard')}
          onNavigateHome={() => navigateTo('/')}
        />
      )}

      {currentPath === '/admin/dashboard' && (
        <AdminDashboard
          data={data}
          onLogout={handleLogout}
          onNavigateHome={() => navigateTo('/')}
          onUpdateProfile={handleUpdateProfile}
          onAddSkill={handleAddSkill}
          onUpdateSkill={handleUpdateSkill}
          onDeleteSkill={handleDeleteSkill}
          onAddProject={handleAddProject}
          onUpdateProject={handleUpdateProject}
          onDeleteProject={handleDeleteProject}
          onAddExperience={handleAddExperience}
          onUpdateExperience={handleUpdateExperience}
          onDeleteExperience={handleDeleteExperience}
          onAddCourse={handleAddCourse}
          onUpdateCourse={handleUpdateCourse}
          onDeleteCourse={handleDeleteCourse}
          onAddLanguage={handleAddLanguage}
          onUpdateLanguage={handleUpdateLanguage}
          onDeleteLanguage={handleDeleteLanguage}
          onAddContact={handleAddContact}
          onUpdateContact={handleUpdateContact}
          onDeleteContact={handleDeleteContact}
        />
      )}

      {currentPath !== '/admin/login' && currentPath !== '/admin/dashboard' && (
        <div className="flex-1 flex flex-col">
          {/* Public Navbar - Note: Zero links to admin per PRD Section 5.8 */}
          <PublicNavbar fullName={data.profile.full_name} />

          <main className="flex-1">
            {/* 5.1 Hero Section */}
            <HeroSection profile={data.profile} />

            {/* 5.2 Skills Section */}
            <SkillsSection skills={data.skills} />

            {/* 5.3 Projects Section */}
            <ProjectsSection projects={data.projects} />

            {/* 5.4 Experience Section */}
            <ExperienceSection experiences={data.experiences} />

            {/* 5.5 Course & Training Section */}
            <CoursesSection courses={data.courses} />

            {/* 5.6 Languages Section */}
            <LanguagesSection languages={data.languages} />

            {/* 5.7 Contact Section */}
            <ContactSection contacts={data.contacts} />
          </main>

          {/* Public Footer */}
          <PublicFooter
            fullName={data.profile.full_name}
            onNavigateAdmin={() => navigateTo('/admin/login')}
          />
        </div>
      )}
    </div>
  );
}

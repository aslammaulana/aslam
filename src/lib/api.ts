import { PortfolioData, Profile, Skill, Project, Experience, Course, Language, Contact } from '../types.ts';
import { initialPortfolioData } from '../defaultData.ts';
import {
  supabase,
  signInWithSupabase,
  signUpWithSupabase,
  signOutSupabase,
  isSupabaseConfigured,
  updateSupabaseConfig,
  getCurrentSupabaseUser
} from './supabase.ts';

const STORAGE_KEY = 'portfolio_data_cache_v1';
const AUTH_KEY = 'portfolio_admin_auth_session';
const USER_KEY = 'portfolio_admin_user_info';

export function getCachedData(): PortfolioData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('LocalStorage error, using default data:', e);
  }
  return initialPortfolioData;
}

export function setCachedData(data: PortfolioData): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }
}

// Fetch all portfolio data
export async function fetchPortfolioData(): Promise<PortfolioData> {
  // 1. Try Supabase database if configured
  if (isSupabaseConfigured()) {
    try {
      const [
        { data: profiles },
        { data: skills },
        { data: projects },
        { data: experiences },
        { data: courses },
        { data: languages },
        { data: contacts }
      ] = await Promise.all([
        supabase.from('profiles').select('*').limit(1),
        supabase.from('skills').select('*').order('order_index', { ascending: true }),
        supabase.from('projects').select('*').order('order_index', { ascending: true }),
        supabase.from('experiences').select('*').order('order_index', { ascending: true }),
        supabase.from('courses').select('*').order('order_index', { ascending: true }),
        supabase.from('languages').select('*').order('order_index', { ascending: true }),
        supabase.from('contacts').select('*').order('order_index', { ascending: true })
      ]);

      if (profiles && profiles.length > 0) {
        const cached = getCachedData();
        const fullData: PortfolioData = {
          profile: profiles[0] || cached.profile,
          skills: skills && skills.length > 0 ? skills : cached.skills,
          projects: projects && projects.length > 0 ? projects : cached.projects,
          experiences: experiences && experiences.length > 0 ? experiences : cached.experiences,
          courses: courses && courses.length > 0 ? courses : cached.courses,
          languages: languages && languages.length > 0 ? languages : cached.languages,
          contacts: contacts && contacts.length > 0 ? contacts : cached.contacts
        };
        setCachedData(fullData);
        return fullData;
      }
    } catch (e) {
      console.warn('Supabase fetch error, falling back:', e);
    }
  }

  // 2. Try server API /api/data (for localhost)
  try {
    const res = await fetch('/api/data');
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        setCachedData(data);
        return data;
      }
    }
  } catch (err) {
    console.warn('Network fetch error, falling back to cache:', err);
  }

  return getCachedData();
}

// Auth Helpers
export function getAdminToken(): string | null {
  return localStorage.getItem(AUTH_KEY);
}

export function setAdminToken(token: string): void {
  localStorage.setItem(AUTH_KEY, token);
}

export function getAdminUser(): { email?: string; id?: string } | null {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setAdminUser(user: { email?: string; id?: string } | null): void {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(USER_KEY);
  }
}

export function clearAdminToken(): void {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(USER_KEY);
  signOutSupabase();
}

export function isAuthenticated(): boolean {
  return !!getAdminToken();
}

export async function checkSupabaseServerConfig(): Promise<{ configured: boolean; supabaseUrl: string | null; supabaseAnonKey: string | null }> {
  try {
    const res = await fetch('/api/config/supabase');
    if (res.ok) {
      const data = await res.json();
      if (data.supabaseUrl && data.supabaseAnonKey) {
        updateSupabaseConfig(data.supabaseUrl, data.supabaseAnonKey);
      }
      return {
        configured: Boolean(data.configured),
        supabaseUrl: data.supabaseUrl || null,
        supabaseAnonKey: data.supabaseAnonKey || null,
      };
    }
  } catch (e) {
    console.warn('Failed to fetch /api/config/supabase:', e);
  }
  return {
    configured: isSupabaseConfigured(),
    supabaseUrl: null,
    supabaseAnonKey: null,
  };
}

export async function loginAdmin(email: string, password: string): Promise<{ success: boolean; message?: string; user?: any }> {
  // 1. Prioritize direct client-side Supabase authentication
  if (isSupabaseConfigured()) {
    const supabaseRes = await signInWithSupabase(email, password);
    if (supabaseRes.success && supabaseRes.session) {
      setAdminToken(supabaseRes.session.access_token);
      setAdminUser({
        email: supabaseRes.user?.email,
        id: supabaseRes.user?.id
      });
      return {
        success: true,
        user: supabaseRes.user
      };
    }
    return {
      success: false,
      message: supabaseRes.message || 'Autentikasi Supabase gagal. Periksa kembali email dan kata sandi Anda.'
    };
  }

  // 2. Fallback to server auth endpoint (for local dev server)
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password })
    });

    const data = await res.json();

    if (res.ok && data.ok) {
      if (data.token) {
        setAdminToken(data.token);
      }
      if (data.user) {
        setAdminUser({
          email: data.user.email,
          id: data.user.id
        });
      }
      // Also sync session with client Supabase SDK if configured
      if (data.token && data.refreshToken && isSupabaseConfigured()) {
        try {
          await supabase.auth.setSession({
            access_token: data.token,
            refresh_token: data.refreshToken
          });
        } catch (e) {
          console.warn('Failed to sync client Supabase session:', e);
        }
      }
      return {
        success: true,
        user: data.user
      };
    }

    if (data.message) {
      return {
        success: false,
        message: data.message
      };
    }
  } catch (err) {
    console.warn('Server auth endpoint failed:', err);
  }

  return {
    success: false,
    message: 'Supabase Authentication belum terkonfigurasi. Harap pastikan SUPABASE_URL dan SUPABASE_ANON_KEY telah dimasukkan di Vercel lalu lakukan Redeploy.'
  };
}

export async function registerAdmin(email: string, password: string): Promise<{ success: boolean; message?: string; requiresEmailConfirmation?: boolean }> {
  // 1. Prioritize direct client Supabase sign up
  if (isSupabaseConfigured()) {
    const res = await signUpWithSupabase(email, password);
    if (res.success) {
      if (res.session) {
        setAdminToken(res.session.access_token);
        setAdminUser({
          email: res.user?.email,
          id: res.user?.id
        });
      }
      return {
        success: true,
        requiresEmailConfirmation: res.requiresEmailConfirmation,
        message: res.message
      };
    }
    return {
      success: false,
      message: res.message || 'Pendaftaran akun di Supabase gagal.'
    };
  }

  // 2. Server sign up fallback
  try {
    const res = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.trim(), password })
    });

    const data = await res.json();

    if (res.ok && data.ok) {
      if (data.token) {
        setAdminToken(data.token);
      }
      if (data.user) {
        setAdminUser({
          email: data.user.email,
          id: data.user.id
        });
      }
      return {
        success: true,
        requiresEmailConfirmation: data.requiresEmailConfirmation,
        message: data.message
      };
    }

    if (data.message) {
      return {
        success: false,
        message: data.message
      };
    }
  } catch (err) {
    console.warn('Server sign up failed:', err);
  }

  return {
    success: false,
    message: 'Supabase Authentication belum terkonfigurasi. Harap atur SUPABASE_URL dan SUPABASE_ANON_KEY.'
  };
}

export async function verifyAdminSession(): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;

  // 1. Direct Supabase verification if client is configured
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        setAdminUser({
          email: data.user.email,
          id: data.user.id
        });
        return true;
      } else if (error) {
        // Token is expired / invalid
        clearAdminToken();
        return false;
      }
    } catch (e) {
      console.warn('Direct Supabase token check error:', e);
    }
  }

  // 2. Server verification fallback
  try {
    const res = await fetch('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (res.ok) {
      const data = await res.json();
      if (data.ok && data.user) {
        setAdminUser({
          email: data.user.email,
          id: data.user.id
        });
        return true;
      }
    }
  } catch (err) {
    console.warn('Failed to verify session on server:', err);
  }

  return isAuthenticated();
}

// Update Profile
export async function updateProfile(profile: Partial<Profile>): Promise<Profile> {
  const current = getCachedData();
  const updatedProfile: Profile = {
    ...current.profile,
    ...profile,
    updated_at: new Date().toISOString()
  };
  const updatedData = { ...current, profile: updatedProfile };
  setCachedData(updatedData);

  // 1. Sync to Supabase if configured
  if (isSupabaseConfigured()) {
    try {
      const payload: any = {
        full_name: updatedProfile.full_name,
        tagline: updatedProfile.tagline,
        short_description: updatedProfile.short_description,
        status_label: updatedProfile.status_label,
        avatar_url: updatedProfile.avatar_url,
        resume_url: updatedProfile.resume_url,
        updated_at: updatedProfile.updated_at
      };
      const { data: existing } = await supabase.from('profiles').select('id').limit(1);
      if (existing && existing.length > 0) {
        payload.id = existing[0].id;
        await supabase.from('profiles').update(payload).eq('id', existing[0].id);
      } else {
        await supabase.from('profiles').insert([payload]);
      }
    } catch (e) {
      console.warn('Supabase profile sync error:', e);
    }
  }

  // 2. Sync to local server
  try {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    if (res.ok) {
      const ct = res.headers.get('content-type') || '';
      if (ct.includes('application/json')) {
        const data = await res.json();
        return data.profile;
      }
    }
  } catch (err) {
    console.warn('Failed to sync profile to server:', err);
  }
  return updatedProfile;
}

// Skills CRUD
export async function addSkill(name: string): Promise<Skill> {
  const current = getCachedData();
  const newSkill: Skill = {
    id: 'skill-' + Date.now(),
    name,
    order_index: current.skills.length + 1
  };
  const updatedData = { ...current, skills: [...current.skills, newSkill] };
  setCachedData(updatedData);

  // Supabase persistence
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('skills').insert({
        name: newSkill.name,
        order_index: newSkill.order_index
      }).select();
      if (!error && data && data.length) {
        newSkill.id = data[0].id;
      }
    } catch (e) {
      console.warn('Supabase addSkill error:', e);
    }
  }

  // Server fallback
  try {
    const res = await fetch('/api/skills', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
    if (res.ok) {
      const data = await res.json();
      return data.skill;
    }
  } catch (err) {
    console.warn('Failed to save skill to server:', err);
  }
  return newSkill;
}

export async function updateSkill(id: string, name: string): Promise<void> {
  const current = getCachedData();
  const skills = current.skills.map((s) => (s.id === id ? { ...s, name } : s));
  setCachedData({ ...current, skills });

  // Supabase update
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('skills').update({ name }).eq('id', id);
    } catch (e) {
      console.warn('Supabase updateSkill error:', e);
    }
  }

  // Server fallback
  try {
    await fetch(`/api/skills/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name })
    });
  } catch (err) {
    console.warn('Failed to update skill on server:', err);
  }
}

export async function deleteSkill(id: string): Promise<void> {
  const current = getCachedData();
  const skills = current.skills.filter((s) => s.id !== id);
  setCachedData({ ...current, skills });

  // Supabase delete
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('skills').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteSkill error:', e);
    }
  }

  // Server delete fallback
  try {
    await fetch(`/api/skills/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('Failed to delete skill on server:', err);
  }
}

// Projects CRUD
export async function addProject(project: Omit<Project, 'id'>): Promise<Project> {
  const current = getCachedData();
  const newProject: Project = {
    ...project,
    id: 'proj-' + Date.now(),
    order_index: current.projects.length + 1
  };
  const updatedData = { ...current, projects: [...current.projects, newProject] };
  setCachedData(updatedData);

  // Supabase insert
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('projects').insert({
        ...project,
        order_index: newProject.order_index
      }).select();
      if (!error && data && data.length) {
        newProject.id = data[0].id;
      }
    } catch (e) {
      console.warn('Supabase addProject error:', e);
    }
  }

  try {
    const res = await fetch('/api/projects', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(project)
    });
    if (res.ok) {
      const data = await res.json();
      return data.project;
    }
  } catch (err) {
    console.warn('Failed to add project to server:', err);
  }
  return newProject;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<void> {
  const current = getCachedData();
  const projects = current.projects.map((p) => (p.id === id ? { ...p, ...updates } : p));
  setCachedData({ ...current, projects });

  // Supabase update
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('projects').update(updates).eq('id', id);
    } catch (e) {
      console.warn('Supabase updateProject error:', e);
    }
  }
  try {
    await fetch(`/api/projects/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  } catch (err) {
    console.warn('Failed to update project on server:', err);
  }
}

export async function deleteProject(id: string): Promise<void> {
  const current = getCachedData();
  const projects = current.projects.filter((p) => p.id !== id);
  setCachedData({ ...current, projects });
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('projects').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteProject error:', e);
    }
  }
  try {
    await fetch(`/api/projects/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('Failed to delete project on server:', err);
  }
}

// Experiences CRUD
export async function addExperience(exp: Omit<Experience, 'id'>): Promise<Experience> {
  const current = getCachedData();
  const newExp: Experience = {
    ...exp,
    id: 'exp-' + Date.now(),
    order_index: current.experiences.length + 1
  };
  setCachedData({ ...current, experiences: [...current.experiences, newExp] });

  // Supabase insert
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('experiences').insert({
        ...exp,
        order_index: newExp.order_index
      }).select();
      if (!error && data && data.length) {
        newExp.id = data[0].id;
      }
    } catch (e) {
      console.warn('Supabase addExperience error:', e);
    }
  }
  try {
    const res = await fetch('/api/experiences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(exp)
    });
    if (res.ok) {
      const data = await res.json();
      return data.experience;
    }
  } catch (err) {
    console.warn('Failed to add experience to server:', err);
  }
  return newExp;
}

export async function updateExperience(id: string, updates: Partial<Experience>): Promise<void> {
  const current = getCachedData();
  const experiences = current.experiences.map((e) => (e.id === id ? { ...e, ...updates } : e));
  setCachedData({ ...current, experiences });

  // Supabase update
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('experiences').update(updates).eq('id', id);
    } catch (e) {
      console.warn('Supabase updateExperience error:', e);
    }
  }
  // Server update fallback
  try {
    await fetch(`/api/experiences/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  } catch (err) {
    console.warn('Failed to update experience on server:', err);
  }
}

export async function deleteExperience(id: string): Promise<void> {
  const current = getCachedData();
  const experiences = current.experiences.filter((e) => e.id !== id);
  setCachedData({ ...current, experiences });

  // Supabase delete
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('experiences').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteExperience error:', e);
    }
  }
  // Server delete fallback
  try {
    await fetch(`/api/experiences/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('Failed to delete experience on server:', err);
  }
}

// Course & Training CRUD
export async function addCourse(course: Omit<Course, 'id'>): Promise<Course> {
  const current = getCachedData();
  const newCourse: Course = {
    ...course,
    id: 'course-' + Date.now(),
    order_index: current.courses.length + 1
  };
  setCachedData({ ...current, courses: [...current.courses, newCourse] });

  // Supabase insert
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('courses').insert({
        ...course,
        order_index: newCourse.order_index
      }).select();
      if (!error && data && data.length) {
        newCourse.id = data[0].id;
      }
    } catch (e) {
      console.warn('Supabase addCourse error:', e);
    }
  }

  // Server fallback
  try {
    const res = await fetch('/api/courses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(course)
    });
    if (res.ok) {
      const data = await res.json();
      return data.course;
    }
  } catch (err) {
    console.warn('Failed to add course to server:', err);
  }
  return newCourse;
}

export async function updateCourse(id: string, updates: Partial<Course>): Promise<void> {
  const current = getCachedData();
  const courses = current.courses.map((c) => (c.id === id ? { ...c, ...updates } : c));
  setCachedData({ ...current, courses });

  // Supabase update
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('courses').update(updates).eq('id', id);
    } catch (e) {
      console.warn('Supabase updateCourse error:', e);
    }
  }

  // Server update fallback
  try {
    await fetch(`/api/courses/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  } catch (err) {
    console.warn('Failed to update course on server:', err);
  }
}

export async function deleteCourse(id: string): Promise<void> {
  const current = getCachedData();
  const courses = current.courses.filter((c) => c.id !== id);
  setCachedData({ ...current, courses });

  // Supabase delete
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('courses').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteCourse error:', e);
    }
  }

  // Server delete fallback
  try {
    await fetch(`/api/courses/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('Failed to delete course on server:', err);
  }
}

// Languages CRUD
export async function addLanguage(lang: Omit<Language, 'id'>): Promise<Language> {
  const current = getCachedData();
  const newLang: Language = {
    ...lang,
    id: 'lang-' + Date.now(),
    order_index: current.languages.length + 1
  };
  setCachedData({ ...current, languages: [...current.languages, newLang] });

  // Supabase insert
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('languages').insert({
        ...lang,
        order_index: newLang.order_index
      }).select();
      if (!error && data && data.length) {
        newLang.id = data[0].id;
      }
    } catch (e) {
      console.warn('Supabase addLanguage error:', e);
    }
  }

  // Server fallback
  try {
    const res = await fetch('/api/languages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lang)
    });
    if (res.ok) {
      const data = await res.json();
      return data.language;
    }
  } catch (err) {
    console.warn('Failed to add language to server:', err);
  }
  return newLang;
}

export async function updateLanguage(id: string, updates: Partial<Language>): Promise<void> {
  const current = getCachedData();
  const languages = current.languages.map((l) => (l.id === id ? { ...l, ...updates } : l));
  setCachedData({ ...current, languages });

  // Supabase update
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('languages').update(updates).eq('id', id);
    } catch (e) {
      console.warn('Supabase updateLanguage error:', e);
    }
  }

  // Server update fallback
  try {
    await fetch(`/api/languages/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  } catch (err) {
    console.warn('Failed to update language on server:', err);
  }
}

export async function deleteLanguage(id: string): Promise<void> {
  const current = getCachedData();
  const languages = current.languages.filter((l) => l.id !== id);
  setCachedData({ ...current, languages });

  // Supabase delete
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('languages').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteLanguage error:', e);
    }
  }

  // Server delete fallback
  try {
    await fetch(`/api/languages/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('Failed to delete language on server:', err);
  }
}

// Contacts CRUD
export async function updateContact(id: string, updates: Partial<Contact>): Promise<void> {
  const current = getCachedData();
  const contacts = current.contacts.map((c) => (c.id === id ? { ...c, ...updates } : c));
  setCachedData({ ...current, contacts });

  // Supabase update
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('contacts').update(updates).eq('id', id);
    } catch (e) {
      console.warn('Supabase updateContact error:', e);
    }
  }

  // Server update fallback
  try {
    await fetch(`/api/contacts/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  } catch (err) {
    console.warn('Failed to update contact on server:', err);
  }
}

export async function addContact(contact: Omit<Contact, 'id'>): Promise<Contact> {
  const current = getCachedData();
  const newContact: Contact = {
    ...contact,
    id: 'contact-' + Date.now(),
    order_index: (contact as any).order_index ?? (current.contacts.length + 1)
  };
  setCachedData({ ...current, contacts: [...current.contacts, newContact] });

  // Supabase insert
  if (isSupabaseConfigured()) {
    try {
      const { data, error } = await supabase.from('contacts').insert({
        ...contact,
        order_index: newContact.order_index
      }).select();
      if (!error && data && data.length) {
        newContact.id = data[0].id;
      }
    } catch (e) {
      console.warn('Supabase addContact error:', e);
    }
  }

  // Server fallback
  try {
    const res = await fetch('/api/contacts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(contact)
    });
    if (res.ok) {
      const data = await res.json();
      return data.contact;
    }
  } catch (err) {
    console.warn('Failed to add contact on server:', err);
  }
  return newContact;
}

export async function deleteContact(id: string): Promise<void> {
  const current = getCachedData();
  const contacts = current.contacts.filter((c) => c.id !== id);
  setCachedData({ ...current, contacts });

  // Supabase delete
  if (isSupabaseConfigured()) {
    try {
      await supabase.from('contacts').delete().eq('id', id);
    } catch (e) {
      console.warn('Supabase deleteContact error:', e);
    }
  }

  // Server delete fallback
  try {
    await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
  } catch (err) {
    console.warn('Failed to delete contact on server:', err);
  }
}

// Keepalive test trigger
export async function testKeepAliveCron(secret?: string): Promise<{ ok: boolean; status: number; message: string }> {
  try {
    const headers: Record<string, string> = {};
    if (secret) {
      headers['Authorization'] = `Bearer ${secret}`;
    }
    const res = await fetch('/api/cron/keepalive', { headers });
    const data = await res.json();
    return {
      ok: res.ok && data.ok,
      status: res.status,
      message: res.ok ? 'Keep-alive berhasil! Respons: ' + JSON.stringify(data) : 'Gagal: ' + (data.error || res.statusText)
    };
  } catch (err: any) {
    return {
      ok: false,
      status: 500,
      message: 'Gagal menghubungi endpoint /api/cron/keepalive: ' + err.message
    };
  }
}

import { PortfolioData, Profile, Skill, Project, Experience, Course, Language, Contact } from '../types.ts';
import { initialPortfolioData } from '../defaultData.ts';

const STORAGE_KEY = 'portfolio_data_cache_v1';
const AUTH_KEY = 'portfolio_admin_auth_session';

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
  try {
    const res = await fetch('/api/data');
    if (res.ok) {
      const data = await res.json();
      setCachedData(data);
      return data;
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

export function clearAdminToken(): void {
  localStorage.removeItem(AUTH_KEY);
}

export function isAuthenticated(): boolean {
  return !!getAdminToken();
}

export async function loginAdmin(email: string, password: string): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      setAdminToken(data.token);
      return { success: true };
    }
    return { success: false, message: data.message || 'Login gagal. Periksa kembali email dan kata sandi.' };
  } catch (err) {
    // Client-side fallback authentication if backend is offline
    if (email === 'admin@portofolio.id' && (password === 'admin123' || password === 'admin_password_123')) {
      const fallbackToken = 'token_' + Date.now();
      setAdminToken(fallbackToken);
      return { success: true };
    }
    return { success: false, message: 'Gagal terhubung ke server autentikasi.' };
  }
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

  try {
    const res = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(profile)
    });
    if (res.ok) {
      const data = await res.json();
      return data.profile;
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
    id: 'contact-' + Date.now()
  };
  setCachedData({ ...current, contacts: [...current.contacts, newContact] });

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

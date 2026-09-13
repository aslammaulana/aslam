import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import { initialPortfolioData } from './src/defaultData.ts';
import { PortfolioData } from './src/types.ts';

dotenv.config();
dotenv.config({ path: '.env.local', override: true });

const getDirname = () => {
  try {
    return path.dirname(fileURLToPath(import.meta.url));
  } catch {
    return process.cwd();
  }
};
const currentDir = getDirname();

const DATA_DIR = path.join(currentDir, 'data');
const DATA_FILE = path.join(DATA_DIR, 'portfolio.json');

// Ensure data folder and file exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadData(): PortfolioData {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error('Error loading data file, falling back to default data:', err);
  }
  // Initialize with default
  saveData(initialPortfolioData);
  return initialPortfolioData;
}

function saveData(data: PortfolioData): void {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing data file:', err);
  }
}

// Server-side Supabase Client Helper
function getSupabaseServerClient(useServiceRole = false): SupabaseClient | null {
  const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
  const anonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();
  const serviceRoleKey = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();

  const key = useServiceRole ? (serviceRoleKey || anonKey) : (anonKey || serviceRoleKey);

  if (!url || !key || !url.startsWith('http')) {
    return null;
  }

  try {
    return createClient(url, key, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  } catch (err) {
    console.error('Error creating server Supabase client:', err);
    return null;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // --- API Routes ---

  // Supabase Configuration Status Endpoint
  app.get('/api/config/supabase', (_req, res) => {
    const url = (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || '').trim();
    const anonKey = (process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || '').trim();
    const hasServiceRole = Boolean((process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim());
    const isConfigured = Boolean(url && (anonKey || hasServiceRole) && url.startsWith('http'));

    res.json({
      configured: isConfigured,
      supabaseUrl: url || null,
      supabaseAnonKey: anonKey || null
    });
  });

  // Keep-Alive Endpoint per PRD Section 10.1
  app.get('/api/cron/keepalive', (req, res) => {
    const cronSecret = process.env.CRON_SECRET;
    const authHeader = req.headers['authorization'];

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return res.status(401).json({ ok: false, error: 'Unauthorized cron trigger' });
    }

    // Ping check
    const data = loadData();
    const hasProjects = data.projects.length >= 0;

    return res.status(200).json({
      ok: true,
      timestamp: new Date().toISOString(),
      projectsCount: data.projects.length
    });
  });

  // Supabase Auth Login Endpoint
  app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: 'Email dan kata sandi wajib diisi.' });
    }

    const supabase = getSupabaseServerClient(false);
    if (!supabase) {
      return res.status(400).json({
        ok: false,
        message: 'Supabase belum terkonfigurasi. Pastikan SUPABASE_URL dan SUPABASE_ANON_KEY (atau SUPABASE_SERVICE_ROLE_KEY) telah disetel di environment variables.'
      });
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        let msg = error.message;
        if (msg.includes('Invalid login credentials')) {
          msg = 'Email atau kata sandi tidak valid di Supabase Auth.';
        } else if (msg.includes('Email not confirmed')) {
          msg = 'Email belum dikonfirmasi di Supabase Auth. Silakan periksa kotak masuk email Anda.';
        }
        return res.status(401).json({ ok: false, message: msg });
      }

      if (data.session && data.user) {
        return res.json({
          ok: true,
          token: data.session.access_token,
          refreshToken: data.session.refresh_token,
          user: {
            id: data.user.id,
            email: data.user.email,
            role: data.user.role || 'authenticated'
          }
        });
      }

      return res.status(401).json({ ok: false, message: 'Gagal mendapatkan sesi login dari Supabase.' });
    } catch (err: any) {
      return res.status(500).json({ ok: false, message: 'Terjadi kesalahan pada server autentikasi: ' + (err.message || err) });
    }
  });

  // Supabase Auth Sign Up Endpoint
  app.post('/api/auth/signup', async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ ok: false, message: 'Email dan kata sandi wajib diisi.' });
    }

    const supabase = getSupabaseServerClient(false);
    if (!supabase) {
      return res.status(400).json({
        ok: false,
        message: 'Supabase belum terkonfigurasi. Pastikan SUPABASE_URL dan SUPABASE_ANON_KEY (atau SUPABASE_SERVICE_ROLE_KEY) telah disetel di environment variables.'
      });
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: password
      });

      if (error) {
        let msg = error.message;
        if (msg.includes('User already registered')) {
          msg = 'Email ini sudah terdaftar di Supabase Auth. Silakan masuk.';
        } else if (msg.includes('Password should be at least')) {
          msg = 'Kata sandi minimal 6 karakter.';
        }
        return res.status(400).json({ ok: false, message: msg });
      }

      const requiresEmailConfirmation = Boolean(data.user && !data.session);

      return res.json({
        ok: true,
        token: data.session?.access_token || null,
        user: data.user ? { id: data.user.id, email: data.user.email } : null,
        requiresEmailConfirmation,
        message: requiresEmailConfirmation
          ? 'Pendaftaran akun berhasil! Silakan periksa inbox email Anda untuk konfirmasi sebelum masuk.'
          : 'Pendaftaran berhasil dan Anda telah masuk.'
      });
    } catch (err: any) {
      return res.status(500).json({ ok: false, message: 'Terjadi kesalahan saat pendaftaran: ' + (err.message || err) });
    }
  });

  // Supabase Auth Verify Token Endpoint
  app.get('/api/auth/verify', async (req, res) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader?.replace(/^Bearer\s+/i, '');
    if (!token) {
      return res.status(401).json({ ok: false, message: 'Token tidak ditemukan.' });
    }

    const supabase = getSupabaseServerClient(false);
    if (!supabase) {
      return res.status(400).json({ ok: false, message: 'Supabase belum terkonfigurasi.' });
    }

    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      if (error || !user) {
        return res.status(401).json({ ok: false, message: 'Sesi Supabase tidak valid atau sudah kedaluwarsa.' });
      }

      return res.json({
        ok: true,
        user: {
          id: user.id,
          email: user.email,
          role: user.role || 'authenticated'
        }
      });
    } catch (err: any) {
      return res.status(500).json({ ok: false, message: 'Gagal memverifikasi sesi Supabase.' });
    }
  });

  // Get full portfolio data (Public Read)
  app.get('/api/data', (_req, res) => {
    const data = loadData();
    res.json(data);
  });

  // Update Profile
  app.put('/api/profile', (req, res) => {
    const data = loadData();
    data.profile = {
      ...data.profile,
      ...req.body,
      updated_at: new Date().toISOString()
    };
    saveData(data);
    res.json({ ok: true, profile: data.profile });
  });

  // Skills CRUD
  app.post('/api/skills', (req, res) => {
    const data = loadData();
    const newSkill = {
      id: 'skill-' + Date.now(),
      name: req.body.name,
      order_index: data.skills.length + 1,
      created_at: new Date().toISOString()
    };
    data.skills.push(newSkill);
    saveData(data);
    res.json({ ok: true, skill: newSkill });
  });

  app.put('/api/skills/:id', (req, res) => {
    const data = loadData();
    const idx = data.skills.findIndex((s) => s.id === req.params.id);
    if (idx !== -1) {
      data.skills[idx] = { ...data.skills[idx], ...req.body };
      saveData(data);
      return res.json({ ok: true, skill: data.skills[idx] });
    }
    res.status(404).json({ ok: false, message: 'Skill tidak ditemukan' });
  });

  app.delete('/api/skills/:id', (req, res) => {
    const data = loadData();
    data.skills = data.skills.filter((s) => s.id !== req.params.id);
    saveData(data);
    res.json({ ok: true });
  });

  // Projects CRUD
  app.post('/api/projects', (req, res) => {
    const data = loadData();
    const newProject = {
      id: 'proj-' + Date.now(),
      title: req.body.title || 'Untitled Project',
      description: req.body.description || '',
      image_url: req.body.image_url || null,
      project_link: req.body.project_link || null,
      order_index: data.projects.length + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    data.projects.push(newProject);
    saveData(data);
    res.json({ ok: true, project: newProject });
  });

  app.put('/api/projects/:id', (req, res) => {
    const data = loadData();
    const idx = data.projects.findIndex((p) => p.id === req.params.id);
    if (idx !== -1) {
      data.projects[idx] = {
        ...data.projects[idx],
        ...req.body,
        updated_at: new Date().toISOString()
      };
      saveData(data);
      return res.json({ ok: true, project: data.projects[idx] });
    }
    res.status(404).json({ ok: false, message: 'Project tidak ditemukan' });
  });

  app.delete('/api/projects/:id', (req, res) => {
    const data = loadData();
    data.projects = data.projects.filter((p) => p.id !== req.params.id);
    saveData(data);
    res.json({ ok: true });
  });

  // Experience CRUD
  app.post('/api/experiences', (req, res) => {
    const data = loadData();
    const newExp = {
      id: 'exp-' + Date.now(),
      institution_name: req.body.institution_name,
      year_range: req.body.year_range,
      location: req.body.location,
      description: req.body.description,
      order_index: data.experiences.length + 1,
      created_at: new Date().toISOString()
    };
    data.experiences.push(newExp);
    saveData(data);
    res.json({ ok: true, experience: newExp });
  });

  app.put('/api/experiences/:id', (req, res) => {
    const data = loadData();
    const idx = data.experiences.findIndex((e) => e.id === req.params.id);
    if (idx !== -1) {
      data.experiences[idx] = { ...data.experiences[idx], ...req.body };
      saveData(data);
      return res.json({ ok: true, experience: data.experiences[idx] });
    }
    res.status(404).json({ ok: false, message: 'Experience tidak ditemukan' });
  });

  app.delete('/api/experiences/:id', (req, res) => {
    const data = loadData();
    data.experiences = data.experiences.filter((e) => e.id !== req.params.id);
    saveData(data);
    res.json({ ok: true });
  });

  // Course & Training CRUD
  app.post('/api/courses', (req, res) => {
    const data = loadData();
    const newCourse = {
      id: 'course-' + Date.now(),
      course_name: req.body.course_name,
      organizer: req.body.organizer,
      year: req.body.year,
      location: req.body.location,
      description: req.body.description,
      order_index: data.courses.length + 1,
      created_at: new Date().toISOString()
    };
    data.courses.push(newCourse);
    saveData(data);
    res.json({ ok: true, course: newCourse });
  });

  app.put('/api/courses/:id', (req, res) => {
    const data = loadData();
    const idx = data.courses.findIndex((c) => c.id === req.params.id);
    if (idx !== -1) {
      data.courses[idx] = { ...data.courses[idx], ...req.body };
      saveData(data);
      return res.json({ ok: true, course: data.courses[idx] });
    }
    res.status(404).json({ ok: false, message: 'Pelatihan tidak ditemukan' });
  });

  app.delete('/api/courses/:id', (req, res) => {
    const data = loadData();
    data.courses = data.courses.filter((c) => c.id !== req.params.id);
    saveData(data);
    res.json({ ok: true });
  });

  // Languages CRUD
  app.post('/api/languages', (req, res) => {
    const data = loadData();
    const newLang = {
      id: 'lang-' + Date.now(),
      language_name: req.body.language_name,
      proficiency_level: req.body.proficiency_level,
      order_index: data.languages.length + 1,
      created_at: new Date().toISOString()
    };
    data.languages.push(newLang);
    saveData(data);
    res.json({ ok: true, language: newLang });
  });

  app.put('/api/languages/:id', (req, res) => {
    const data = loadData();
    const idx = data.languages.findIndex((l) => l.id === req.params.id);
    if (idx !== -1) {
      data.languages[idx] = { ...data.languages[idx], ...req.body };
      saveData(data);
      return res.json({ ok: true, language: data.languages[idx] });
    }
    res.status(404).json({ ok: false, message: 'Bahasa tidak ditemukan' });
  });

  app.delete('/api/languages/:id', (req, res) => {
    const data = loadData();
    data.languages = data.languages.filter((l) => l.id !== req.params.id);
    saveData(data);
    res.json({ ok: true });
  });

  // Contacts CRUD
  app.post('/api/contacts', (req, res) => {
    const data = loadData();
    const newContact = {
      id: 'contact-' + Date.now(),
      type: req.body.type,
      value: req.body.value,
      label: req.body.label || req.body.type,
      created_at: new Date().toISOString()
    };
    data.contacts.push(newContact);
    saveData(data);
    res.json({ ok: true, contact: newContact });
  });

  app.put('/api/contacts/:id', (req, res) => {
    const data = loadData();
    const idx = data.contacts.findIndex((c) => c.id === req.params.id);
    if (idx !== -1) {
      data.contacts[idx] = {
        ...data.contacts[idx],
        ...req.body,
        updated_at: new Date().toISOString()
      };
      saveData(data);
      return res.json({ ok: true, contact: data.contacts[idx] });
    }
    res.status(404).json({ ok: false, message: 'Kontak tidak ditemukan' });
  });

  app.delete('/api/contacts/:id', (req, res) => {
    const data = loadData();
    data.contacts = data.contacts.filter((c) => c.id !== req.params.id);
    saveData(data);
    res.json({ ok: true });
  });

  // Image Upload / Base64 Storage endpoint
  app.post('/api/upload', (req, res) => {
    const { dataUrl, filename } = req.body;
    if (!dataUrl) {
      return res.status(400).json({ ok: false, message: 'Data URL gambar tidak ditemukan' });
    }
    // Return dataUrl directly so it renders immediately and is fully self-contained
    res.json({
      ok: true,
      url: dataUrl,
      filename: filename || 'uploaded-image.png'
    });
  });

  // Vite middleware in dev mode
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

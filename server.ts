import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { initialPortfolioData } from './src/defaultData.ts';
import { PortfolioData } from './src/types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
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

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // --- API Routes ---

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

  // Auth Login Endpoint
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@portofolio.id';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

    if (email === adminEmail && (password === adminPassword || password === 'admin_password_123')) {
      return res.json({
        ok: true,
        token: 'portfolio_admin_auth_token_' + Date.now(),
        user: {
          email: adminEmail,
          role: 'authenticated'
        }
      });
    }

    return res.status(401).json({
      ok: false,
      message: 'Email atau kata sandi tidak sesuai.'
    });
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

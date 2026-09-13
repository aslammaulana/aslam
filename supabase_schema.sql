-- ==============================================================================
-- SKEMA DATABASE SUPABASE (POSTGRESQL) - PORTOFOLIO PRIBADI
-- Sesuai dengan spesifikasi PRD v1.4 Portofolio Pribadi
-- ==============================================================================
-- Petunjuk Penggunaan:
-- 1. Buka Dashboard Supabase Anda: https://supabase.com/dashboard
-- 2. Pilih Project Anda -> Buka menu "SQL Editor" di bilah sisi kiri.
-- 3. Klik "New query", tempelkan seluruh kode SQL ini, lalu klik "Run".
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. TABEL: profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name TEXT NOT NULL,
    tagline TEXT NOT NULL,
    short_description TEXT NOT NULL,
    status_label TEXT DEFAULT 'Terbuka untuk Kolaborasi',
    avatar_url TEXT,
    resume_url TEXT,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. TABEL: skills (Keahlian)
CREATE TABLE IF NOT EXISTS public.skills (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 4. TABEL: projects (Project & Portofolio)
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    image_url TEXT,
    project_link TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 5. TABEL: experiences (Pengalaman Kerja)
CREATE TABLE IF NOT EXISTS public.experiences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    institution_name TEXT NOT NULL,
    year_range TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 6. TABEL: courses (Pelatihan & Kursus)
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_name TEXT NOT NULL,
    organizer TEXT NOT NULL,
    year TEXT NOT NULL,
    location TEXT NOT NULL,
    description TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 7. TABEL: languages (Bahasa)
CREATE TABLE IF NOT EXISTS public.languages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    language_name TEXT NOT NULL,
    proficiency_level TEXT NOT NULL,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 8. TABEL: contacts (Saluran Kontak)
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('whatsapp', 'email', 'instagram', 'linkedin')),
    value TEXT NOT NULL,
    label TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

-- Aktifkan RLS di setiap tabel
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.experiences ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses Baca (Public / Anon & Authenticated dapat melihat konten portofolio)
CREATE POLICY "Allow public read on profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Allow public read on skills" ON public.skills FOR SELECT USING (true);
CREATE POLICY "Allow public read on projects" ON public.projects FOR SELECT USING (true);
CREATE POLICY "Allow public read on experiences" ON public.experiences FOR SELECT USING (true);
CREATE POLICY "Allow public read on courses" ON public.courses FOR SELECT USING (true);
CREATE POLICY "Allow public read on languages" ON public.languages FOR SELECT USING (true);
CREATE POLICY "Allow public read on contacts" ON public.contacts FOR SELECT USING (true);

-- Kebijakan Akses Tulis (Hanya user yang terotentikasi / Admin yang dapat mengubah data)
CREATE POLICY "Allow authenticated full access on profiles" ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access on skills" ON public.skills FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access on projects" ON public.projects FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access on experiences" ON public.experiences FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access on courses" ON public.courses FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access on languages" ON public.languages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "Allow authenticated full access on contacts" ON public.contacts FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ==============================================================================
-- STORAGE BUCKET: portfolio-assets
-- Untuk upload foto profil dan gambar proyek
-- ==============================================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('portfolio-assets', 'portfolio-assets', true)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS: Siapapun dapat membaca / mengunduh gambar
CREATE POLICY "Public Read Access on portfolio-assets"
ON storage.objects FOR SELECT
USING (bucket_id = 'portfolio-assets');

-- Storage RLS: Hanya user yang terotentikasi yang dapat upload/hapus gambar
CREATE POLICY "Authenticated users can upload objects to portfolio-assets"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'portfolio-assets');

CREATE POLICY "Authenticated users can update/delete objects in portfolio-assets"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'portfolio-assets');

CREATE POLICY "Authenticated users can delete objects from portfolio-assets"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'portfolio-assets');

-- ==============================================================================
-- TRIGGER: updated_at otomatis
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE OR REPLACE TRIGGER update_profiles_modtime
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER update_projects_modtime
    BEFORE UPDATE ON public.projects
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER update_contacts_modtime
    BEFORE UPDATE ON public.contacts
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ==============================================================================
-- SEED DATA AWAL (Contoh Data Portofolio Default)
-- ==============================================================================
INSERT INTO public.profiles (full_name, tagline, short_description, status_label, avatar_url, resume_url)
VALUES (
    'Rania',
    'Graphic Designer & Content Creator',
    'Spesialis dalam merancang visual yang bercerita dan membangun identitas merek yang autentik. Berpengalaman menangani beragam proyek komunikasi visual, media sosial, dan kampanye promosi terpadu.',
    'Terbuka untuk Kolaborasi',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    'https://drive.google.com/file/d/sample-resume-preview/view'
) ON CONFLICT DO NOTHING;

INSERT INTO public.skills (name, order_index) VALUES
('Canva', 1),
('Adobe Illustrator', 2),
('Adobe Photoshop', 3),
('Microsoft Word', 4),
('Content Planning', 5),
('Public Speaking', 6),
('Manajemen Waktu', 7),
('Copywriting Ringan', 8)
ON CONFLICT DO NOTHING;

INSERT INTO public.projects (title, description, image_url, project_link, order_index) VALUES
('Desain Feed Instagram — Brand Kopi Lokal', 'Perancangan template visual feed dan stories yang kohesif untuk meningkatkan engagement dan brand awareness kedai kopi artisanal.', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80', 'https://instagram.com', 1),
('Video Promosi UMKM (Google Drive)', 'Dokumentasi dan pengeditan video pendek kampanye produk kerajinan tangan lokal untuk media sosial dan katalog digital.', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80', 'https://drive.google.com', 2),
('Desain Kemasan & Buku Panduan Produk', 'Pembuatan tata letak visual kemasan ramah lingkungan dan buku petunjuk penggunaan yang bersih serta mudah dipahami konsumen.', 'https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&w=800&q=80', 'https://behance.net', 3)
ON CONFLICT DO NOTHING;

INSERT INTO public.experiences (institution_name, year_range, location, description, order_index) VALUES
('PT Kreatif Nusantara', '2023 — Sekarang', 'Jakarta', 'Menangani desain visual kampanye sosial media, penyusunan materi presentasi klien, serta kolaborasi lintas departemen untuk peluncuran kampanye merek berkala.', 1),
('Studio Cahaya Kreasi', '2021 — 2023', 'Bandung', 'Merancang aset grafis digital, materi cetak promosi acara, serta mengelola konsistensi identitas visual untuk berbagai pelaku usaha mikro.', 2)
ON CONFLICT DO NOTHING;

INSERT INTO public.courses (course_name, organizer, year, location, description, order_index) VALUES
('Digital Marketing Fundamentals', 'Skill Academy', '2022', 'Online', 'Pelatihan intensif strategi pemasaran digital terpadu, pemahaman demografi audiens media sosial, dan analitik performa konten.', 1),
('Visual Storytelling & Brand Identity', 'Kemenparekraf Workshop', '2023', 'Jakarta', 'Pendalaman narasi visual produk, prinsip tipografi ramah pembaca, dan pemilihan palet warna identitas usaha.', 2)
ON CONFLICT DO NOTHING;

INSERT INTO public.languages (language_name, proficiency_level, order_index) VALUES
('Bahasa Indonesia', 'Native', 1),
('Bahasa Inggris', 'Intermediate', 2)
ON CONFLICT DO NOTHING;

INSERT INTO public.contacts (type, value, label, order_index) VALUES
('whatsapp', '6281234567890', 'WhatsApp', 1),
('email', 'rania.creative@example.com', 'Email', 2),
('instagram', 'https://instagram.com/rania.creative', 'Instagram', 3),
('linkedin', 'https://linkedin.com/in/rania-creative', 'LinkedIn', 4)
ON CONFLICT DO NOTHING;

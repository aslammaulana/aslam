import { PortfolioData } from './types.ts';

export const initialPortfolioData: PortfolioData = {
  profile: {
    id: 'profile-main',
    full_name: 'Rania',
    tagline: 'Graphic Designer & Content Creator',
    short_description: 'Spesialis dalam merancang visual yang bercerita dan membangun identitas merek yang autentik. Berpengalaman menangani beragam proyek komunikasi visual, media sosial, dan kampanye promosi terpadu.',
    status_label: 'Terbuka untuk Kolaborasi',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    resume_url: 'https://drive.google.com/file/d/sample-resume-preview/view',
    updated_at: new Date().toISOString()
  },
  skills: [
    { id: 'skill-1', name: 'Canva', order_index: 1 },
    { id: 'skill-2', name: 'Adobe Illustrator', order_index: 2 },
    { id: 'skill-3', name: 'Adobe Photoshop', order_index: 3 },
    { id: 'skill-4', name: 'Microsoft Word', order_index: 4 },
    { id: 'skill-5', name: 'Content Planning', order_index: 5 },
    { id: 'skill-6', name: 'Public Speaking', order_index: 6 },
    { id: 'skill-7', name: 'Manajemen Waktu', order_index: 7 },
    { id: 'skill-8', name: 'Copywriting Ringan', order_index: 8 }
  ],
  projects: [
    {
      id: 'proj-1',
      title: 'Desain Feed Instagram — Brand Kopi Lokal',
      description: 'Perancangan template visual feed dan stories yang kohesif untuk meningkatkan engagement dan brand awareness kedai kopi artisanal.',
      image_url: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=800&q=80',
      project_link: 'https://instagram.com',
      order_index: 1
    },
    {
      id: 'proj-2',
      title: 'Video Promosi UMKM (Google Drive)',
      description: 'Dokumentasi dan pengeditan video pendek kampanye produk kerajinan tangan lokal untuk media sosial dan katalog digital.',
      image_url: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=800&q=80',
      project_link: 'https://drive.google.com',
      order_index: 2
    },
    {
      id: 'proj-3',
      title: 'Desain Kemasan & Buku Panduan Produk',
      description: 'Pembuatan tata letak visual kemasan ramah lingkungan dan buku petunjuk penggunaan yang bersih serta mudah dipahami konsumen.',
      image_url: 'https://images.unsplash.com/photo-1589365278144-c9e705f843ba?auto=format&fit=crop&w=800&q=80',
      project_link: 'https://behance.net',
      order_index: 3
    }
  ],
  experiences: [
    {
      id: 'exp-1',
      institution_name: 'PT Kreatif Nusantara',
      year_range: '2023 — Sekarang',
      location: 'Jakarta',
      description: 'Menangani desain visual kampanye sosial media, penyusunan materi presentasi klien, serta kolaborasi lintas departemen untuk peluncuran kampanye merek berkala.',
      order_index: 1
    },
    {
      id: 'exp-2',
      institution_name: 'Studio Cahaya Kreasi',
      year_range: '2021 — 2023',
      location: 'Bandung',
      description: 'Merancang aset grafis digital, materi cetak promosi acara, serta mengelola konsistensi identitas visual untuk berbagai pelaku usaha mikro.',
      order_index: 2
    }
  ],
  courses: [
    {
      id: 'course-1',
      course_name: 'Digital Marketing Fundamentals',
      organizer: 'Skill Academy',
      year: '2022',
      location: 'Online',
      description: 'Pelatihan intensif strategi pemasaran digital terpadu, pemahaman demografi audiens media sosial, dan analitik performa konten.',
      order_index: 1
    },
    {
      id: 'course-2',
      course_name: 'Visual Storytelling & Brand Identity',
      organizer: 'Kemenparekraf Workshop',
      year: '2023',
      location: 'Jakarta',
      description: 'Pendalaman narasi visual produk, prinsip tipografi ramah pembaca, dan pemilihan palet warna identitas usaha.',
      order_index: 2
    }
  ],
  languages: [
    {
      id: 'lang-1',
      language_name: 'Bahasa Indonesia',
      proficiency_level: 'Native',
      order_index: 1
    },
    {
      id: 'lang-2',
      language_name: 'Bahasa Inggris',
      proficiency_level: 'Intermediate',
      order_index: 2
    }
  ],
  contacts: [
    {
      id: 'contact-wa',
      type: 'whatsapp',
      value: '6281234567890',
      label: 'WhatsApp'
    },
    {
      id: 'contact-email',
      type: 'email',
      value: 'rania.creative@example.com',
      label: 'Email'
    },
    {
      id: 'contact-ig',
      type: 'instagram',
      value: 'https://instagram.com/rania.creative',
      label: 'Instagram'
    },
    {
      id: 'contact-li',
      type: 'linkedin',
      value: 'https://linkedin.com/in/rania-creative',
      label: 'LinkedIn'
    }
  ]
};

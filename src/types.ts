export interface Profile {
  id: string;
  full_name: string;
  tagline: string;
  short_description: string;
  status_label: string | null;
  avatar_url: string | null;
  resume_url: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Skill {
  id: string;
  name: string;
  order_index?: number;
  created_at?: string;
}

export interface Project {
  id: string;
  title: string;
  description: string;
  image_url: string | null;
  project_link: string | null;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Experience {
  id: string;
  institution_name: string;
  year_range: string;
  location: string;
  description: string;
  order_index?: number;
  created_at?: string;
}

export interface Course {
  id: string;
  course_name: string;
  organizer: string;
  year: string;
  location: string;
  description: string;
  order_index?: number;
  created_at?: string;
}

export interface Language {
  id: string;
  language_name: string;
  proficiency_level: string;
  order_index?: number;
  created_at?: string;
}

export type ContactType = 'whatsapp' | 'email' | 'instagram' | 'linkedin';

export interface Contact {
  id: string;
  type: ContactType;
  value: string;
  label?: string;
  order_index?: number;
  created_at?: string;
  updated_at?: string;
}

export interface PortfolioData {
  profile: Profile;
  skills: Skill[];
  projects: Project[];
  experiences: Experience[];
  courses: Course[];
  languages: Language[];
  contacts: Contact[];
}

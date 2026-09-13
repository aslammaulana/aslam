import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

const STORAGE_SUPABASE_URL = 'portfolio_supabase_url';
const STORAGE_SUPABASE_KEY = 'portfolio_supabase_anon_key';

// Static member expressions so Vite and esbuild can replace them at build time
const getInitialUrl = (): string => {
  let url = '';
  try {
    url = (import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || '') as string;
  } catch {}

  if (!url || typeof url !== 'string' || !url.trim()) {
    try {
      if (typeof process !== 'undefined' && process.env) {
        url = (process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '') as string;
      }
    } catch {}
  }

  if (!url || typeof url !== 'string' || !url.trim()) {
    try {
      url = localStorage.getItem(STORAGE_SUPABASE_URL) || '';
    } catch {}
  }

  return (url || '').trim();
};

const getInitialAnonKey = (): string => {
  let key = '';
  try {
    key = (import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || '') as string;
  } catch {}

  if (!key || typeof key !== 'string' || !key.trim()) {
    try {
      if (typeof process !== 'undefined' && process.env) {
        key = (process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '') as string;
      }
    } catch {}
  }

  if (!key || typeof key !== 'string' || !key.trim()) {
    try {
      key = localStorage.getItem(STORAGE_SUPABASE_KEY) || '';
    } catch {}
  }

  return (key || '').trim();
};

let currentUrl = getInitialUrl();
let currentAnonKey = getInitialAnonKey();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    currentUrl &&
    currentAnonKey &&
    !currentUrl.includes('placeholder') &&
    currentUrl.startsWith('http')
  );
};

export const getSupabaseConfig = (): { url: string; isConfigured: boolean } => {
  return {
    url: currentUrl || '',
    isConfigured: isSupabaseConfigured()
  };
};

// Create client with fallback placeholder to avoid runtime module crash
export let supabase: SupabaseClient = createClient(
  isSupabaseConfigured() ? currentUrl : 'https://placeholder-project.supabase.co',
  isSupabaseConfigured() ? currentAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'supabase_portfolio_auth_token',
    },
  }
);

export function updateSupabaseConfig(url: string, anonKey: string): boolean {
  if (url && anonKey && url.startsWith('http') && !url.includes('placeholder')) {
    currentUrl = url.trim();
    currentAnonKey = anonKey.trim();
    try {
      localStorage.setItem(STORAGE_SUPABASE_URL, currentUrl);
      localStorage.setItem(STORAGE_SUPABASE_KEY, currentAnonKey);
    } catch {}
    supabase = createClient(currentUrl, currentAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        storageKey: 'supabase_portfolio_auth_token',
      },
    });
    return true;
  }
  return false;
}

// Helper: Translate common Supabase Auth error messages to Indonesian
export function formatSupabaseAuthError(error: any): string {
  if (!error) return 'Terjadi kesalahan autentikasi.';
  const msg = error.message || String(error);

  if (msg.includes('Invalid login credentials') || msg.includes('invalid_grant')) {
    return 'Email atau kata sandi tidak valid. Pastikan akun telah dibuat dan password cocok di Supabase Auth.';
  }
  if (msg.includes('Email not confirmed')) {
    return 'Email belum dikonfirmasi di Supabase. Buka Supabase Dashboard > Authentication > Providers > Email, lalu matikan opsi "Confirm email" (atau periksa inbox email Anda untuk konfirmasi).';
  }
  if (msg.includes('User already registered')) {
    return 'Email ini sudah terdaftar di Supabase Auth.';
  }
  if (msg.includes('User not found')) {
    return 'Pengguna dengan email ini tidak ditemukan di Supabase Auth.';
  }
  if (msg.includes('Password should be at least')) {
    return 'Kata sandi minimal harus terdiri dari 6 karakter.';
  }
  if (msg.includes('Rate limit exceeded') || msg.includes('over_email_send_rate_limit')) {
    return 'Terlalu banyak percobaan. Harap tunggu beberapa saat sebelum mencoba lagi.';
  }
  if (msg.includes('NetworkError') || msg.includes('Failed to fetch')) {
    return 'Gagal terhubung ke Supabase. Periksa koneksi internet atau periksa kembali kebenaran SUPABASE_URL.';
  }

  return msg;
}

// Sign in with Supabase
export async function signInWithSupabase(email: string, password: string): Promise<{
  success: boolean;
  user?: User;
  session?: Session;
  message?: string;
}> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase belum dikonfigurasi. Harap atur SUPABASE_URL dan SUPABASE_ANON_KEY di environment.',
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      return {
        success: false,
        message: formatSupabaseAuthError(error),
      };
    }

    if (data.user && data.session) {
      return {
        success: true,
        user: data.user,
        session: data.session,
      };
    }

    return {
      success: false,
      message: 'Gagal mendapatkan data sesi login dari Supabase.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: formatSupabaseAuthError(err),
    };
  }
}

// Sign up new user in Supabase (if needed programmatically)
export async function signUpWithSupabase(email: string, password: string): Promise<{
  success: boolean;
  user?: User | null;
  session?: Session | null;
  message?: string;
  requiresEmailConfirmation?: boolean;
}> {
  if (!isSupabaseConfigured()) {
    return {
      success: false,
      message: 'Supabase belum dikonfigurasi. Harap atur SUPABASE_URL dan SUPABASE_ANON_KEY di environment.',
    };
  }

  try {
    const { data, error } = await supabase.auth.signUp({
      email: email.trim(),
      password,
    });

    if (error) {
      return {
        success: false,
        message: formatSupabaseAuthError(error),
      };
    }

    if (data.user && !data.session) {
      return {
        success: true,
        user: data.user,
        session: null,
        requiresEmailConfirmation: true,
        message: 'Akun berhasil dibuat! Silakan verifikasi email Anda atau hubungi admin.',
      };
    }

    return {
      success: true,
      user: data.user,
      session: data.session,
      requiresEmailConfirmation: false,
      message: 'Akun berhasil dibuat dan Anda telah berhasil masuk.',
    };
  } catch (err: any) {
    return {
      success: false,
      message: formatSupabaseAuthError(err),
    };
  }
}

// Sign out from Supabase
export async function signOutSupabase(): Promise<void> {
  if (isSupabaseConfigured()) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Error during Supabase sign out:', e);
    }
  }
}

// Get current Supabase user
export async function getCurrentSupabaseUser(): Promise<User | null> {
  if (!isSupabaseConfigured()) return null;
  try {
    const { data } = await supabase.auth.getUser();
    return data.user;
  } catch {
    return null;
  }
}

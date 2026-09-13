import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';

// Read client-side environment variables
const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || '').trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    !supabaseUrl.includes('placeholder') &&
    supabaseUrl.startsWith('http')
  );
};

// Create client with fallback placeholder to avoid runtime module crash
export const supabase: SupabaseClient = createClient(
  isSupabaseConfigured() ? supabaseUrl : 'https://placeholder-project.supabase.co',
  isSupabaseConfigured() ? supabaseAnonKey : 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
      storageKey: 'supabase_portfolio_auth_token',
    },
  }
);

// Helper: Translate common Supabase Auth error messages to Indonesian
export function formatSupabaseAuthError(error: any): string {
  if (!error) return 'Terjadi kesalahan autentikasi.';
  const msg = error.message || String(error);

  if (msg.includes('Invalid login credentials')) {
    return 'Email atau kata sandi tidak valid. Pastikan akun telah dibuat di Supabase Auth.';
  }
  if (msg.includes('Email not confirmed')) {
    return 'Email belum dikonfirmasi. Harap periksa kotak masuk email Anda atau matikan "Confirm email" di Supabase Dashboard.';
  }
  if (msg.includes('User already registered')) {
    return 'Email ini sudah terdaftar di Supabase Auth. Silakan gunakan tab Masuk.';
  }
  if (msg.includes('Password should be at least')) {
    return 'Kata sandi minimal harus terdiri dari 6 karakter.';
  }
  if (msg.includes('Rate limit exceeded') || msg.includes('over_email_send_rate_limit')) {
    return 'Terlalu banyak percobaan. Harap tunggu beberapa saat sebelum mencoba lagi.';
  }
  if (msg.includes('NetworkError') || msg.includes('Failed to fetch')) {
    return 'Gagal terhubung ke Supabase. Periksa koneksi internet atau validitas VITE_SUPABASE_URL.';
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
      message: 'Supabase belum dikonfigurasi. Harap atur VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di Settings / Environment.',
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

// Sign up new user in Supabase
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
      message: 'Supabase belum dikonfigurasi. Harap atur VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di Settings / Environment.',
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

    // If session is null, email confirmation is required
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

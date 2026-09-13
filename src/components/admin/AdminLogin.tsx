import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  AlertCircle,
  ArrowLeft,
  Database,
  LogIn,
  CheckCircle2,
  Sparkles,
  Settings,
  ChevronDown,
  ChevronUp,
  KeyRound
} from 'lucide-react';
import { loginAdmin, checkSupabaseServerConfig } from '../../lib/api.ts';
import { isSupabaseConfigured, getSupabaseConfig, updateSupabaseConfig } from '../../lib/supabase.ts';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onNavigateHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onNavigateHome }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Supabase connection state
  const [supabaseStatus, setSupabaseStatus] = useState<{ isConfigured: boolean; url: string }>({
    isConfigured: isSupabaseConfigured(),
    url: getSupabaseConfig().url
  });

  // Manual configuration toggle and form states
  const [showManualConfig, setShowManualConfig] = useState(false);
  const [manualUrl, setManualUrl] = useState('');
  const [manualAnonKey, setManualAnonKey] = useState('');
  const [manualConfigMsg, setManualConfigMsg] = useState<string | null>(null);

  // Check server configuration on mount
  useEffect(() => {
    checkSupabaseServerConfig()
      .then((cfg) => {
        setSupabaseStatus({
          isConfigured: isSupabaseConfigured(),
          url: getSupabaseConfig().url
        });
      })
      .catch(() => {
        setSupabaseStatus({
          isConfigured: isSupabaseConfigured(),
          url: getSupabaseConfig().url
        });
      });
  }, []);

  const handleSaveManualConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualUrl.trim().startsWith('http')) {
      setManualConfigMsg('URL Supabase harus diawali dengan http:// atau https://');
      return;
    }
    if (!manualAnonKey.trim()) {
      setManualConfigMsg('Anon Key Supabase tidak boleh kosong.');
      return;
    }

    const success = updateSupabaseConfig(manualUrl.trim(), manualAnonKey.trim());
    if (success) {
      setSupabaseStatus({
        isConfigured: true,
        url: manualUrl.trim()
      });
      setManualConfigMsg('Konfigurasi Supabase berhasil disimpan! Silakan masuk.');
      setErrorMsg(null);
      setTimeout(() => setManualConfigMsg(null), 3500);
    } else {
      setManualConfigMsg('Gagal mengonfigurasi Supabase. Periksa kembali URL dan Anon Key.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    setLoading(true);
    try {
      const res = await loginAdmin(email.trim(), password);
      if (res.success) {
        setSuccessMsg('Login berhasil! Mengalihkan ke dashboard...');
        setTimeout(() => {
          onLoginSuccess();
        }, 600);
      } else {
        setErrorMsg(res.message || 'Email atau kata sandi tidak cocok di Supabase Auth.');
      }
    } catch (err: any) {
      setErrorMsg('Terjadi kesalahan saat autentikasi: ' + (err.message || String(err)));
    } finally {
      setLoading(false);
    }
  };

  // Masked URL helper for preview
  const formatUrlPreview = (fullUrl: string) => {
    try {
      const parsed = new URL(fullUrl);
      return parsed.hostname;
    } catch {
      return fullUrl.length > 28 ? fullUrl.slice(0, 25) + '...' : fullUrl;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Back button */}
      <div className="max-w-md w-full mx-auto mb-4">
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Website Portofolio</span>
        </button>
      </div>

      <div className="max-w-md w-full mx-auto bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 shadow-sm">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100 shadow-xs">
            <Database className="w-6 h-6" />
          </div>

          {/* Connection Status Badge */}
          <div className="mb-3">
            {supabaseStatus.isConfigured ? (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200/70">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span>Supabase Terhubung</span>
                {supabaseStatus.url && (
                  <span className="text-[11px] text-emerald-600 font-mono">
                    ({formatUrlPreview(supabaseStatus.url)})
                  </span>
                )}
              </div>
            ) : (
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200/70">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                <span>Supabase Belum Terhubung</span>
              </div>
            )}
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Login Administrator
          </h1>
          <p className="mt-1.5 text-xs text-slate-500">
            Masuk dengan akun Supabase Authentication Anda.
          </p>
        </div>

        {/* Not Configured Notice */}
        {!supabaseStatus.isConfigured && (
          <div className="mb-5 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-semibold">Konfigurasi Supabase Belum Terdeteksi</p>
                <p className="text-amber-800 text-[11px] leading-relaxed">
                  Jika sudah memasukkan variabel ke Vercel, pastikan untuk melakukan <strong>Redeploy</strong> agar perubahan diterapkan pada build. Atau Anda dapat memasukkannya langsung melalui tombol di bawah.
                </p>
              </div>
            </div>
          </div>
        )}

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Pengguna Supabase
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kata Sandi
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-sm transition-colors disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-3"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Memverifikasi Akun Supabase...</span>
              </span>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                <span>Masuk ke Dashboard</span>
              </>
            )}
          </button>
        </form>

        {/* Collapsible Manual Supabase Setup */}
        <div className="mt-5 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setShowManualConfig(!showManualConfig)}
            className="w-full flex items-center justify-between text-xs text-slate-500 hover:text-slate-800 transition-colors cursor-pointer py-1"
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Pengaturan Koneksi Supabase Manual</span>
            </span>
            {showManualConfig ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>

          {showManualConfig && (
            <form onSubmit={handleSaveManualConfig} className="mt-3.5 p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3 text-xs">
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Jika environment variable di Vercel belum aktif atau ingin menguji coba secara langsung, Anda dapat menyimpan kredensial Supabase di browser ini:
              </p>

              {manualConfigMsg && (
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px]">
                  {manualConfigMsg}
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  SUPABASE_URL
                </label>
                <input
                  type="text"
                  value={manualUrl}
                  onChange={(e) => setManualUrl(e.target.value)}
                  placeholder="https://xxxxxxxx.supabase.co"
                  className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  SUPABASE_ANON_KEY
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={manualAnonKey}
                    onChange={(e) => setManualAnonKey(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsIn..."
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-800 text-xs focus:ring-1 focus:ring-emerald-500 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-medium text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5" />
                <span>Simpan & Terapkan Konfigurasi</span>
              </button>
            </form>
          )}
        </div>

        {/* Security & Authentication Info */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Supabase Auth GoTrue</span>
          </div>
          <span className="text-[11px] text-slate-400">JWT Protected Session</span>
        </div>
      </div>
    </div>
  );
};

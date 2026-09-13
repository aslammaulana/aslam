import React, { useState, useEffect } from 'react';
import {
  Lock,
  Mail,
  AlertCircle,
  ArrowLeft,
  Database,
  UserPlus,
  LogIn,
  CheckCircle2,
  KeyRound,
  Sparkles
} from 'lucide-react';
import { loginAdmin, registerAdmin, checkSupabaseServerConfig } from '../../lib/api.ts';
import { isSupabaseConfigured } from '../../lib/supabase.ts';

interface AdminLoginProps {
  onLoginSuccess: () => void;
  onNavigateHome: () => void;
}

export const AdminLogin: React.FC<AdminLoginProps> = ({ onLoginSuccess, onNavigateHome }) => {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [checkingConfig, setCheckingConfig] = useState(true);
  const [supabaseReady, setSupabaseReady] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    checkSupabaseServerConfig().then((cfg) => {
      setSupabaseReady(cfg.configured || isSupabaseConfigured());
      setCheckingConfig(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (mode === 'signup') {
      if (password.length < 6) {
        setErrorMsg('Kata sandi harus minimal 6 karakter.');
        return;
      }
      if (password !== confirmPassword) {
        setErrorMsg('Konfirmasi kata sandi tidak cocok.');
        return;
      }

      setLoading(true);
      try {
        const res = await registerAdmin(email.trim(), password);
        if (res.success) {
          if (res.requiresEmailConfirmation) {
            setSuccessMsg('Pendaftaran akun berhasil! Silakan periksa inbox email Anda untuk konfirmasi, lalu masuk.');
            setMode('signin');
          } else {
            setSuccessMsg('Pendaftaran berhasil! Mengalihkan ke dashboard...');
            setTimeout(() => {
              onLoginSuccess();
            }, 800);
          }
        } else {
          setErrorMsg(res.message || 'Pendaftaran akun Supabase gagal.');
        }
      } catch (err: any) {
        setErrorMsg('Terjadi kesalahan saat memproses pendaftaran.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // Sign In mode
    setLoading(true);
    try {
      const res = await loginAdmin(email.trim(), password);
      if (res.success) {
        setSuccessMsg('Login Supabase berhasil! Mengalihkan...');
        setTimeout(() => {
          onLoginSuccess();
        }, 500);
      } else {
        setErrorMsg(res.message || 'Email atau kata sandi tidak cocok di Supabase Auth.');
      }
    } catch (err: any) {
      setErrorMsg('Terjadi kesalahan saat menghubungi Supabase Auth.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Top Back button */}
      <div className="max-w-md w-full mx-auto mb-4">
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Website Portofolio</span>
        </button>
      </div>

      <div className="max-w-md w-full mx-auto bg-white border border-slate-200 rounded-3xl p-7 sm:p-9 shadow-sm">
        {/* Header with Supabase Badge */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-3 border border-emerald-100 shadow-xs">
            <Database className="w-6 h-6" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/70 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Supabase Authentication</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {mode === 'signin' ? 'Login Administrator' : 'Registrasi Admin Supabase'}
          </h1>
          <p className="mt-1.5 text-xs text-slate-500">
            {mode === 'signin'
              ? 'Masuk menggunakan akun pengguna dari Supabase Auth.'
              : 'Daftarkan user baru secara langsung ke Supabase Auth Anda.'}
          </p>
        </div>

        {/* Supabase Status Check */}
        {!checkingConfig && !supabaseReady && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
            <div className="flex items-center gap-1.5 font-semibold text-amber-950">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Konfigurasi Supabase Diperlukan</span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              Kredensial Supabase belum terdeteksi. Silakan atur variabel environment berikut di panel <strong>Settings</strong>:
            </p>
            <div className="bg-white/90 p-2.5 rounded-xl border border-amber-200 font-mono text-[11px] space-y-1 text-slate-700">
              <div>SUPABASE_URL=https://xyz.supabase.co</div>
              <div>SUPABASE_ANON_KEY=eyJhbGciOi...</div>
              <div>SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...</div>
            </div>
            <p className="text-[11px] text-amber-700">
              Dapatkan kredensial ini di Supabase Dashboard &gt; Project Settings &gt; API.
            </p>
          </div>
        )}

        {/* Tab Toggle: Masuk vs Daftar Baru */}
        <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === 'signin'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Masuk</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
              mode === 'signup'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Daftar Akun Baru</span>
          </button>
        </div>

        {errorMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="mb-5 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Email Supabase User
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nama@email.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Kata Sandi (Password)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Konfirmasi Kata Sandi
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-medium text-sm transition-colors disabled:opacity-50 cursor-pointer shadow-xs flex items-center justify-center gap-2 mt-2"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                <span>Memproses...</span>
              </span>
            ) : mode === 'signin' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Masuk dengan Supabase</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Daftarkan Akun ke Supabase</span>
              </>
            )}
          </button>
        </form>

        {/* Security & Authentication Info */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Supabase Auth GoTrue</span>
          </div>
          <span className="text-[11px] text-slate-400">JWT Token Session</span>
        </div>
      </div>
    </div>
  );
};

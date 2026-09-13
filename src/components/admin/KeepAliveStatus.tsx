import React, { useState } from 'react';
import { ShieldCheck, Play, CheckCircle2, AlertCircle, Clock, Database, Server } from 'lucide-react';
import { testKeepAliveCron } from '../../lib/api.ts';

export const KeepAliveStatus: React.FC = () => {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [secretInput, setSecretInput] = useState('');

  const handleTestPing = async () => {
    setTesting(true);
    setResult(null);
    try {
      const res = await testKeepAliveCron(secretInput.trim() || undefined);
      setResult(res);
    } catch (err: any) {
      setResult({ ok: false, message: 'Gagal menguji endpoint: ' + err.message });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="border-b border-slate-200 pb-4">
        <h2 className="text-xl font-bold text-slate-900">Sistem Keep-Alive &amp; Database</h2>
        <p className="text-sm text-slate-500 mt-1">
          Konfigurasi otomatisasi pencegah auto-pause database sesuai spesifikasi PRD Bagian 10.
        </p>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Server className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Endpoint Cron</p>
              <p className="text-sm font-bold text-slate-900 font-mono">/api/cron/keepalive</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500 leading-relaxed">
            Menjalankan query ringan untuk memelihara koneksi database tanpa beban data.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Jadwal Eksekusi</p>
              <p className="text-sm font-bold text-slate-900 font-mono">0 1 * * *</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500 leading-relaxed">
            Berjalan setiap hari pukul 08:00 WIB via Vercel Cron (dikonfigurasi di vercel.json).
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Proteksi Token</p>
              <p className="text-sm font-bold text-slate-900 font-mono">CRON_SECRET</p>
            </div>
          </div>
          <p className="mt-3 text-xs text-slate-500 leading-relaxed">
            Header otentikasi Bearer mencegah pemanggilan endpoint dari pihak luar.
          </p>
        </div>
      </div>

      {/* Manual Ping Tester */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-2">Uji Coba Ping Endpoint Cron</h3>
        <p className="text-sm text-slate-600 mb-6">
          Anda dapat mensimulasikan pemanggilan Vercel Cron untuk memastikan endpoint mengembalikan status HTTP 200 dan respons <code className="px-1.5 py-0.5 bg-slate-100 rounded text-blue-700 font-mono text-xs">{`{ ok: true }`}</code>.
        </p>

        <div className="space-y-4 max-w-xl">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
              Secret Token (Opsional untuk pengujian lokal)
            </label>
            <input
              type="text"
              value={secretInput}
              onChange={(e) => setSecretInput(e.target.value)}
              placeholder="Masukkan nilai CRON_SECRET jika dikonfigurasi di .env"
              className="w-full px-4 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <button
            type="button"
            onClick={handleTestPing}
            disabled={testing}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-sm font-medium transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
          >
            <Play className="w-4 h-4 fill-current" />
            <span>{testing ? 'Mengirim Ping...' : 'Jalankan Ping Sekarang'}</span>
          </button>

          {result && (
            <div
              className={`p-4 rounded-xl border text-sm flex items-start gap-3 mt-4 ${
                result.ok
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {result.ok ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              )}
              <div>
                <p className="font-semibold">{result.ok ? 'Sukses!' : 'Peringatan / Gagal'}</p>
                <p className="mt-1 font-mono text-xs break-all">{result.message}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

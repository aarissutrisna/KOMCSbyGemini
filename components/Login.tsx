
import React, { useState } from 'react';
import { User } from '../types';
import { useAuth, API_BASE_URL } from '../App';

interface LoginProps {
  onLogin: (user: User, token: string) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { darkMode, toggleDarkMode } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5s timeout for production

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      const result = await response.json();
      if (result.success) {
        onLogin(result.data.user, result.data.token);
      } else {
        setError(result.message || 'Kredensial tidak valid. Silakan periksa kembali.');
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Server tidak merespon. Pastikan backend Node.js dan MariaDB aktif.');
      } else {
        setError('Gagal terhubung ke server. Periksa koneksi internet atau firewall VPS.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-500">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden relative">
        
        {/* Decorative Background */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-600/5 blur-[120px] rounded-full -mr-48 -mt-48 pointer-events-none"></div>

        {/* Left Side: Branding */}
        <div className="bg-primary-900 dark:bg-slate-950 p-12 lg:p-20 text-white flex flex-col justify-center relative overflow-hidden order-last lg:order-first">
          <div className="relative z-10 space-y-8">
            <div className="inline-block px-4 py-1.5 bg-primary-800 rounded-full text-[10px] font-black tracking-[0.2em] text-primary-300 uppercase italic">Enterprise Edition</div>
            <h1 className="text-5xl lg:text-6xl font-display font-bold tracking-tight leading-none">KomCS <br/><span className="text-primary-400">PJB</span></h1>
            <p className="text-primary-100/70 text-lg leading-relaxed max-w-sm">
              Sistem Otomasi Komisi Terintegrasi. Akurat, Transparan, dan Aman.
            </p>
            
            <div className="pt-20 border-t border-white/10">
              <p className="text-[10px] font-black text-primary-400 uppercase tracking-widest mb-4">Infrastruktur Terverifikasi</p>
              <div className="flex gap-6 opacity-50">
                <span className="text-[10px] font-bold">Node.js v20</span>
                <span className="text-[10px] font-bold">MariaDB 11.4</span>
                <span className="text-[10px] font-bold">Ubuntu 24.04</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="p-10 lg:p-20 flex flex-col justify-center">
          <div className="mb-10 flex justify-between items-center">
            <h2 className="text-3xl font-display font-bold text-slate-800 dark:text-white tracking-tight">Masuk Sistem</h2>
            <button onClick={toggleDarkMode} className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-slate-400 transition-transform active:scale-90">
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-500/10 border border-rose-100 dark:border-rose-500/20 rounded-2xl text-rose-600 dark:text-rose-400 text-[11px] font-bold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">ID Akun</label>
              <input
                type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                className="w-full h-14 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold text-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                placeholder="Masukkan username"
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Kunci Akses</label>
              <input
                type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                className="w-full h-14 px-6 rounded-2xl bg-slate-50 dark:bg-slate-800 border-none text-sm font-bold text-slate-700 dark:text-slate-100 focus:ring-2 focus:ring-primary-500 transition-all outline-none"
                placeholder="••••••••"
                disabled={loading}
              />
            </div>
            <button
              disabled={loading} type="submit"
              className="w-full h-14 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl text-sm transition-all shadow-xl shadow-primary-600/30 active:scale-95 disabled:opacity-50 mt-10 uppercase tracking-widest"
            >
              {loading ? 'MENYINKRONKAN...' : 'AUTENTIKASI SISTEM'}
            </button>
          </form>
          
          <div className="mt-12 pt-8 border-t border-slate-50 dark:border-slate-800 text-center">
            <p className="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-[0.2em]">
              PT. PJB INTEGRITAS SISTEM © 2025
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;

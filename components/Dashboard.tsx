
import React, { useState, useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAuth } from '../App';
import { IDRCurrency } from '../constants';
import { UserRole } from '../types';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  
  // Logic: Set default branch based on role
  const initialBranch = user?.role === UserRole.ADMIN ? 'global' : (user?.branchId || 'global');
  
  const [filterMonth, setFilterMonth] = useState<number | 'all'>(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState<number | 'all'>(new Date().getFullYear());
  const [filterBranch, setFilterBranch] = useState<string>(initialBranch as string);

  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
  
  // Filter list cabang yang boleh dilihat
  const allBranches = [
    { id: 'global', name: '🌍 Ringkasan Global' },
    { id: 'cab-01', name: '🏠 Pusat PJB' },
    { id: 'cab-02', name: '🏬 Cabang Malang' }
  ];

  const availableBranches = useMemo(() => {
    if (user?.role === UserRole.ADMIN) return allBranches;
    // HRD & CS hanya bisa melihat cabangnya sendiri
    return allBranches.filter(b => b.id === user?.branchId);
  }, [user]);

  const chartData = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      name: months[i],
      omzet: Math.floor(Math.random() * 500000000) + 100000000,
      komisi: Math.floor(Math.random() * 5000000) + 1000000,
    }));
  }, [filterYear, filterBranch]);

  const stats = [
    { label: "Omzet Berjalan", value: 1245000000, trend: "+12%", status: 'success' },
    { label: "Komisi Tersedia", value: 4250000, trend: "IDR", status: 'primary' },
    { label: "Pencapaian Target", value: "94.5%", trend: "Goal", status: 'warning' },
    { label: "Total CS Hadir", value: "24/26", trend: "Hari", status: 'info' }
  ];

  const selectClass = "w-full h-12 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold rounded-2xl px-4 focus:ring-2 focus:ring-primary-500 transition-all outline-none text-slate-900 dark:text-slate-50 appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed";

  return (
    <div className="space-y-6 md:space-y-8 pb-20">
      <div className="flex flex-col gap-1 px-1">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">
          Statistik <span className="text-primary-600 dark:text-primary-400">Komisi</span>
        </h2>
        <p className="text-slate-500 dark:text-slate-300 text-sm font-medium">Monitoring performa {user?.role === UserRole.ADMIN ? 'Seluruh Cabang' : 'Cabang Anda'}.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row gap-4 items-stretch md:items-end">
        <div className="flex-1 space-y-2">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest px-1">Wilayah / Cabang</label>
          <div className="relative">
            <select 
              value={filterBranch}
              onChange={(e) => setFilterBranch(e.target.value)}
              className={selectClass}
              disabled={user?.role !== UserRole.ADMIN}
            >
              {availableBranches.map(b => <option key={b.id} value={b.id} className="dark:bg-slate-800 dark:text-slate-50">{b.name}</option>)}
            </select>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <label className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest px-1">Periode Waktu</label>
          <div className="grid grid-cols-2 gap-2">
            <select 
              value={filterMonth} 
              onChange={(e) => setFilterMonth(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
              className={selectClass}
            >
              <option value="all" className="dark:bg-slate-800 dark:text-slate-50">Tahunan</option>
              {months.map((m, i) => <option key={i} value={i+1} className="dark:bg-slate-800 dark:text-slate-50">{m}</option>)}
            </select>
            <select 
              value={filterYear} 
              onChange={(e) => setFilterYear(parseInt(e.target.value))}
              className={selectClass}
            >
              {[2024, 2025, 2026].map(y => <option key={y} value={y} className="dark:bg-slate-800 dark:text-slate-50">{y}</option>)}
            </select>
          </div>
        </div>
        <button className="h-12 md:px-10 bg-primary-600 hover:bg-primary-700 text-white font-black rounded-2xl text-sm transition-all active:scale-95 shadow-lg shadow-primary-600/30">
          Sync Data
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {stats.map((s, i) => (
          <div key={i} className="bg-white dark:bg-slate-800 p-5 md:p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 transition-all hover:shadow-md active:scale-[0.98]">
            <p className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-50 truncate">
                {typeof s.value === 'number' ? IDRCurrency.format(s.value) : s.value}
              </h3>
              <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                s.status === 'success' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400' :
                s.status === 'warning' ? 'bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400' :
                s.status === 'info' ? 'bg-sky-50 text-sky-600 dark:bg-sky-500/15 dark:text-sky-400' :
                'bg-primary-50 text-primary-600 dark:bg-primary-500/15 dark:text-primary-400'
              }`}>
                {s.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-5 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 gap-4">
            <h3 className="font-bold text-slate-800 dark:text-slate-50 text-lg">Tren Pendapatan Bulanan</h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-400">
                <div className="h-2 w-2 rounded-full bg-primary-500"></div> OMZET
              </div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-slate-400 dark:text-slate-400">
                <div className="h-2 w-2 rounded-full bg-emerald-500"></div> KOMISI
              </div>
            </div>
          </div>
          <div className="h-[250px] md:h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorOmzet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.3} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 10}} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    backgroundColor: '#1e293b', 
                    color: '#f8fafc',
                    fontSize: '12px'
                  }}
                  formatter={(val: number) => IDRCurrency.format(val)}
                />
                <Area type="monotone" dataKey="omzet" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorOmzet)" />
                <Area type="monotone" dataKey="komisi" stroke="#10b981" strokeWidth={2} fill="transparent" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700">
          <h3 className="font-bold text-slate-800 dark:text-slate-50 mb-6 text-lg">Target Monitoring</h3>
          <div className="space-y-6">
            {[
              { label: 'Pusat PJB', current: 1245, target: 1500, color: 'bg-primary-500', visible: user?.role === UserRole.ADMIN || user?.branchId === 'cab-01' },
              { label: 'Cabang Malang', current: 850, target: 1000, color: 'bg-emerald-500', visible: user?.role === UserRole.ADMIN || user?.branchId === 'cab-02' },
            ].filter(t => t.visible).map((t, i) => {
              const pct = Math.round((t.current / t.target) * 100);
              return (
                <div key={i} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold mb-1">
                    <span className="text-slate-600 dark:text-slate-300">{t.label}</span>
                    <span className="text-slate-900 dark:text-slate-50">{pct}%</span>
                  </div>
                  <div className="h-3 w-full bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${t.color} transition-all duration-1000`} style={{ width: `${pct}%` }}></div>
                  </div>
                  <p className="text-[10px] text-slate-400 dark:text-slate-400 font-medium">Sisa {IDRCurrency.format((t.target - t.current) * 1000000)} untuk target maksimal.</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;


import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { IDRCurrency } from '../constants';
import { UserRole, CommissionStatus } from '../types';

const AttendanceManager: React.FC = () => {
  const { user: currentUser, apiFetch } = useAuth();
  
  const [filterMonth, setFilterMonth] = useState(new Date().getMonth() + 1);
  const [filterYear, setFilterYear] = useState(new Date().getFullYear());
  const [filterBranch, setFilterBranch] = useState(currentUser?.role === UserRole.ADMIN ? '' : (currentUser?.branchId || ''));
  const [branches, setBranches] = useState<any[]>([]);
  const [attendanceData, setAttendanceData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  
  const [targetMin, setTargetMin] = useState(0);
  const [targetMax, setTargetMax] = useState(0);

  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  useEffect(() => {
    const fetchBranches = async () => {
      try {
        const res = await apiFetch('/branches');
        setBranches(res.data);
        if (currentUser?.role === UserRole.ADMIN && res.data.length > 0 && !filterBranch) {
          setFilterBranch(res.data[0].id);
        }
      } catch (e) {
        console.error("Gagal memuat daftar cabang");
      }
    };
    fetchBranches();
  }, []);

  const loadData = async () => {
    if (!filterBranch) return;
    setLoading(true);
    try {
      // Mengambil data report harian dari server
      const res = await apiFetch(`/attendance?branchId=${filterBranch}&month=${filterMonth}&year=${filterYear}`);
      // Mapping data dari backend ke format UI
      setAttendanceData(res.data || []);
    } catch (e) {
      console.error("Gagal sinkronisasi data absensi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const activeBranch = branches.find(b => b.id === filterBranch);
    if (activeBranch) {
      setTargetMin(activeBranch.target_min);
      setTargetMax(activeBranch.target_max);
    }
  }, [filterBranch, filterMonth, filterYear, branches]);

  const selectClass = "w-full h-11 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-bold rounded-2xl px-4 outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-slate-50 transition-all cursor-pointer disabled:opacity-50";

  return (
    <div className="space-y-6 md:space-y-8 pb-20">
      <div className="flex flex-col gap-1 px-1">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-slate-900 dark:text-white tracking-tight">Presensi & <span className="text-primary-600">Omzet</span></h2>
        <p className="text-slate-500 dark:text-slate-300 text-sm font-medium">Monitoring Ledger Harian Cabang.</p>
      </div>

      <div className="bg-white dark:bg-slate-800 p-4 md:p-6 rounded-3xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 dark:text-slate-400 uppercase tracking-widest px-1">Cabang</label>
            <select 
              value={filterBranch} 
              onChange={(e) => setFilterBranch(e.target.value)} 
              className={selectClass}
              disabled={currentUser?.role !== UserRole.ADMIN}
            >
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Periode</label>
            <div className="flex gap-2">
              <select value={filterMonth} onChange={(e) => setFilterMonth(parseInt(e.target.value))} className={selectClass}>
                {months.map((m, i) => <option key={i} value={i+1}>{m}</option>)}
              </select>
              <select value={filterYear} onChange={(e) => setFilterYear(parseInt(e.target.value))} className={selectClass}>
                {[2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          </div>
          <button onClick={loadData} disabled={loading} className="w-full h-11 bg-primary-600 text-white font-bold rounded-2xl text-sm shadow-lg shadow-primary-600/20 active:scale-95 disabled:opacity-50">
            {loading ? 'MENYINKRONKAN...' : 'REFRESH DATA'}
          </button>
        </div>
      </div>

      <div className="bg-primary-900 text-white p-5 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
        <div>
          <span className="text-[10px] font-black uppercase text-primary-400 tracking-widest">Target Aktif Cabang</span>
          <div className="flex gap-6 mt-1">
            <p className="text-sm font-bold">MIN: <span className="text-primary-200 font-mono">{IDRCurrency.format(targetMin)}</span></p>
            <p className="text-sm font-bold">MAX: <span className="text-primary-200 font-mono">{IDRCurrency.format(targetMax)}</span></p>
          </div>
        </div>
        <div className="text-[10px] font-bold bg-white/10 px-4 py-2 rounded-xl">DB STATUS: CONNECTED</div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {attendanceData.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-bold italic">Belum ada data input untuk periode ini.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Omzet</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Target</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {attendanceData.map((row, idx) => {
                const isMax = row.total >= targetMax;
                const isMin = row.total >= targetMin && !isMax;
                return (
                  <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                    <td className="px-6 py-4 text-xs font-bold text-slate-600 dark:text-slate-300">{row.tanggal}</td>
                    <td className="px-6 py-4 text-sm font-black text-slate-900 dark:text-slate-50">{IDRCurrency.format(row.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black ${isMax ? 'text-emerald-500' : isMin ? 'text-primary-500' : 'text-slate-300'}`}>
                        {isMax ? '● MAX' : isMin ? '● MIN' : '○ UNDER'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button className="text-[10px] font-black uppercase text-primary-600 hover:underline">Detail Ledger</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default AttendanceManager;

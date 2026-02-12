
import React, { useState, useEffect, useMemo } from 'react';
import { IDRCurrency } from '../constants';
import { useAuth } from '../App';
import { UserRole } from '../types';

const MutationManager: React.FC = () => {
  const { user: currentUser, apiFetch } = useAuth();
  
  const [filterUser, setFilterUser] = useState<string>(currentUser?.id as string);
  const [mutations, setMutations] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      // Ambil riwayat mutasi dari backend
      const res = await apiFetch(`/commissions/history?userId=${filterUser}`);
      setMutations(res.data || []);
      
      if (currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.HRD) {
        const userRes = await apiFetch('/users');
        setUsers(userRes.data || []);
      }
    } catch (e) {
      console.error("Gagal sinkronisasi ledger");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [filterUser]);

  const totals = useMemo(() => {
    const income = mutations.filter(m => m.tipe === 'IN').reduce((a, b) => a + parseInt(b.nominal), 0);
    const outcome = mutations.filter(m => m.tipe === 'OUT').reduce((a, b) => a + parseInt(b.nominal), 0);
    return { income, outcome, balance: income - outcome };
  }, [mutations]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 px-1">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Buku Besar Ledger</h2>
          <p className="text-sm text-slate-500">Log transaksi komisi terenkripsi.</p>
        </div>
        
        {(currentUser?.role === UserRole.ADMIN || currentUser?.role === UserRole.HRD) && (
          <select 
            value={filterUser} 
            onChange={(e) => setFilterUser(e.target.value)}
            className="h-10 px-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold"
          >
            {users.map(u => <option key={u.id} value={u.id}>{u.nama}</option>)}
          </select>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-emerald-50 dark:bg-emerald-500/10 p-6 rounded-3xl border border-emerald-100 dark:border-emerald-500/20">
          <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Total Akumulasi</p>
          <h3 className="text-2xl font-black text-emerald-700 dark:text-emerald-300 mt-1">+{IDRCurrency.format(totals.income)}</h3>
        </div>
        <div className="bg-rose-50 dark:bg-rose-500/10 p-6 rounded-3xl border border-rose-100 dark:border-rose-500/20">
          <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Total Penarikan</p>
          <h3 className="text-2xl font-black text-rose-700 dark:text-rose-300 mt-1">-{IDRCurrency.format(totals.outcome)}</h3>
        </div>
        <div className="bg-primary-900 p-6 rounded-3xl text-white shadow-xl">
          <p className="text-[10px] font-black text-primary-300 uppercase tracking-widest">Saldo Saat Ini</p>
          <h3 className="text-2xl font-black mt-1">{IDRCurrency.format(totals.balance)}</h3>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 text-center font-bold text-slate-400 animate-pulse">MEMUAT LEDGER...</div>
        ) : mutations.length === 0 ? (
          <div className="py-20 text-center text-slate-400 font-bold italic">Belum ada mutasi transaksi.</div>
        ) : (
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Tipe</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nominal</th>
                <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Saldo Akhir</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {mutations.map((m) => (
                <tr key={m.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/20 transition-colors">
                  <td className="px-6 py-4 text-xs font-bold text-slate-500">{m.tanggal}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${m.tipe === 'IN' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                      {m.tipe}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-sm font-black ${m.tipe === 'IN' ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {m.tipe === 'IN' ? '+' : '-'}{IDRCurrency.format(m.nominal)}
                  </td>
                  <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">{IDRCurrency.format(m.saldo_after)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default MutationManager;

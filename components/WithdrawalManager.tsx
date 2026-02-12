
import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { UserRole } from '../types';
import { IDRCurrency } from '../constants';

const WithdrawalManager: React.FC = () => {
  const { user, apiFetch } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const [wdAmount, setWdAmount] = useState(0);
  const [note, setNote] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    try {
      const [histRes, statsRes] = await Promise.all([
        apiFetch('/withdrawals/history'),
        apiFetch(`/commissions/stats?branchId=${user?.branchId || ''}&userId=${user?.id}`)
      ]);
      setHistory(histRes.data || []);
      // Asumsikan backend mengirim saldo saat ini di stats
      setBalance(statsRes.data?.current_balance || 0);
    } catch (e) {
      console.error("Gagal memuat data penarikan");
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async () => {
    if (wdAmount > balance) return alert('Saldo tidak mencukupi');
    if (wdAmount < 50000) return alert('Minimal penarikan Rp 50.000');
    
    setLoading(true);
    try {
      await apiFetch('/withdrawals/request', {
        method: 'POST',
        body: JSON.stringify({ amount: wdAmount, note })
      });
      setShowModal(false);
      loadData();
      alert('Pengajuan penarikan berhasil dikirim.');
    } catch (e: any) {
      alert(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Dana & Penarikan</h2>
          <p className="text-sm text-slate-500">Kelola pencairan komisi Anda.</p>
        </div>
        {user?.role === UserRole.CS && (
          <button 
            onClick={() => setShowModal(true)}
            className="bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary-600/20 active:scale-95"
          >
            Tarik Saldo
          </button>
        )}
      </div>

      <div className="bg-primary-900 p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        <p className="text-primary-300 text-[10px] font-black uppercase tracking-widest mb-2">Saldo Komisi Tersedia</p>
        <h3 className="text-4xl font-display font-bold">{IDRCurrency.format(balance)}</h3>
        <p className="mt-6 text-[10px] font-bold opacity-50 uppercase tracking-widest italic">Verifikasi Ledger Otomatis Aktif</p>
      </div>

      <div className="space-y-4">
        <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Riwayat Pengajuan</h4>
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-100 dark:border-slate-700 overflow-hidden">
          {history.length === 0 ? (
            <div className="py-10 text-center text-slate-400 italic font-bold">Belum ada riwayat penarikan.</div>
          ) : (
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
                <tr>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tanggal</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">Nominal</th>
                  <th className="px-6 py-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
                {history.map((h) => (
                  <tr key={h.id}>
                    <td className="px-6 py-4 text-xs font-bold text-slate-500">{h.tanggal}</td>
                    <td className="px-6 py-4 text-sm font-black text-primary-600">{IDRCurrency.format(h.nominal)}</td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[9px] font-black bg-slate-100 px-2 py-0.5 rounded uppercase">{h.keterangan?.includes('PENDING') ? 'PENDING' : 'SUKSES'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-700">
            <h3 className="text-2xl font-display font-bold mb-8">Form Penarikan</h3>
            <div className="space-y-6">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Nominal (IDR)</label>
                <input 
                  type="number" 
                  value={wdAmount} 
                  onChange={e => setWdAmount(parseInt(e.target.value) || 0)}
                  className="w-full h-14 px-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-2xl font-black text-primary-600 focus:ring-2 focus:ring-primary-500 outline-none"
                />
                <p className="text-[10px] font-bold text-slate-400 mt-2">SISA SALDO: {IDRCurrency.format(balance)}</p>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Catatan</label>
                <textarea 
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  className="w-full p-4 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl text-sm font-bold min-h-[100px] outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Opsional..."
                />
              </div>
              <div className="flex gap-4 pt-4">
                <button onClick={() => setShowModal(false)} className="flex-1 h-12 text-sm font-bold text-slate-400">Batal</button>
                <button 
                  disabled={loading || wdAmount > balance || wdAmount < 50000}
                  onClick={handleSubmit} 
                  className="flex-[2] h-12 bg-primary-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg disabled:opacity-30"
                >
                  {loading ? 'MEMPROSES...' : 'KIRIM PENGAJUAN'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WithdrawalManager;


import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { UserRole } from '../types';

interface UserData {
  id: string;
  username: string;
  nama: string;
  role: string;
  branch_id: string | null;
  faktor_pengali: number | string | null;
}

const UserManager: React.FC = () => {
  const { apiFetch } = useAuth();
  const [users, setUsers] = useState<UserData[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    username: '', 
    password: '', 
    role: 'CS', 
    branchId: '', 
    faktorPengali: 0.5 
  });

  const loadInitialData = async () => {
    setLoading(true);
    try {
      const [userRes, branchRes] = await Promise.all([
        apiFetch('/users'),
        apiFetch('/branches')
      ]);
      setUsers(userRes.data);
      setBranches(branchRes.data);
    } catch (e) {
      console.error("Gagal memuat data user/cabang:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleOpenModal = () => {
    setFormData({ name: '', username: '', password: '', role: 'CS', branchId: branches[0]?.id || '', faktorPengali: 0.5 });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await apiFetch('/users', {
        method: 'POST',
        body: JSON.stringify({
          nama: formData.name,
          username: formData.username,
          password: formData.password,
          role: formData.role,
          branchId: formData.branchId === 'Global' ? null : formData.branchId,
          faktorPengali: formData.role === 'CS' ? formData.faktorPengali : null
        })
      });
      setShowModal(false);
      loadInitialData();
    } catch (e: any) {
      alert(e.message);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Manajemen Pengguna</h2>
          <p className="text-sm text-slate-500">Otorisasi berbasis Role (RBAC).</p>
        </div>
        <button onClick={handleOpenModal} className="bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-lg shadow-primary-600/20 active:scale-95 transition-all">
          + User Baru
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center font-bold text-slate-400 animate-pulse">Menghubungkan ke Ledger...</div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Identitas</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Akses</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Faktor</th>
                <th className="px-6 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {users.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex flex-col">
                      <span className="text-sm font-bold text-slate-800 dark:text-slate-100">{u.nama}</span>
                      <span className="text-[10px] text-slate-400 font-mono italic">@{u.username}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-0.5 rounded text-[9px] font-black tracking-widest uppercase ${
                      u.role === 'ADMIN' ? 'bg-purple-50 text-purple-600 dark:bg-purple-500/10' :
                      u.role === 'HRD' ? 'bg-blue-50 text-blue-600 dark:bg-blue-500/10' :
                      'bg-slate-100 text-slate-600 dark:bg-slate-700'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-black text-primary-600 dark:text-primary-400 text-center">{u.faktor_pengali || '-'}</td>
                  <td className="px-6 py-4 text-right">
                     <span className="text-[9px] font-bold text-slate-300 italic">Managed by Ledger</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-display font-bold mb-8 text-slate-900 dark:text-white">Tambah Pengguna</h3>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Lengkap</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-none text-sm font-bold text-slate-700 dark:text-slate-200" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Username</label>
                  <input required type="text" value={formData.username} onChange={e => setFormData({...formData, username: e.target.value})} className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-none text-sm font-bold text-slate-700 dark:text-slate-200" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Password</label>
                  <input required type="password" value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-none text-sm font-bold text-slate-700 dark:text-slate-200" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Role</label>
                  <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full h-12 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-none text-xs font-bold">
                    <option value="ADMIN">ADMIN</option>
                    <option value="HRD">HRD</option>
                    <option value="CS">CS</option>
                  </select>
                </div>
                {formData.role === 'CS' && (
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Faktor Pengali</label>
                    <select value={formData.faktorPengali} onChange={e => setFormData({...formData, faktorPengali: parseFloat(e.target.value)})} className="w-full h-12 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-none text-xs font-bold text-primary-600">
                      <option value="0.75">0.75 (Utama)</option>
                      <option value="0.5">0.50 (Imbang)</option>
                      <option value="0.25">0.25 (Pendukung)</option>
                    </select>
                  </div>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Penempatan Cabang</label>
                <select value={formData.branchId} onChange={e => setFormData({...formData, branchId: e.target.value})} className="w-full h-12 px-3 rounded-xl bg-slate-50 dark:bg-slate-900 border-none text-xs font-bold">
                  <option value="Global">Global HQ</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
            </div>
            <div className="flex gap-4 mt-10">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-12 text-sm font-bold text-slate-400">Batal</button>
              <button type="submit" className="flex-[2] h-12 bg-primary-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-600/20">Simpan Data</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default UserManager;

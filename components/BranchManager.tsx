
import React, { useState, useEffect } from 'react';
import { IDRCurrency } from '../constants';
import { useAuth } from '../App';

interface BranchData {
  id: string;
  name: string;
  target_min: number;
  target_max: number;
  n8n_endpoint: string;
}

const BranchManager: React.FC = () => {
  const { apiFetch } = useAuth();
  const [branches, setBranches] = useState<BranchData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<BranchData | null>(null);
  const [formData, setFormData] = useState({ name: '', targetMin: 0, targetMax: 0, n8nEndpoint: '' });

  const loadBranches = async () => {
    setLoading(true);
    try {
      const res = await apiFetch('/branches');
      setBranches(res.data);
    } catch (e) {
      console.error("Gagal memuat cabang:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBranches();
  }, []);

  const handleOpenModal = (branch?: BranchData) => {
    if (branch) {
      setEditingBranch(branch);
      setFormData({ 
        name: branch.name, 
        targetMin: branch.target_min, 
        targetMax: branch.target_max, 
        n8nEndpoint: branch.n8n_endpoint 
      });
    } else {
      setEditingBranch(null);
      setFormData({ name: '', targetMin: 0, targetMax: 0, n8nEndpoint: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingBranch) {
        await apiFetch(`/branches/${editingBranch.id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        await apiFetch('/branches', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      setShowModal(false);
      loadBranches();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus cabang ini? Data akan di-soft delete di database.')) {
      try {
        await apiFetch(`/branches/${id}`, { method: 'DELETE' });
        loadBranches();
      } catch (e: any) {
        alert(e.message);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center px-1">
        <div>
          <h2 className="text-2xl font-display font-bold text-slate-900 dark:text-white">Pengaturan Cabang</h2>
          <p className="text-sm text-slate-500">Data sinkron langsung dengan MariaDB 11.4.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-primary-600 text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-primary-700 transition-all shadow-lg shadow-primary-600/20 active:scale-95"
        >
          + Cabang Baru
        </button>
      </div>

      {loading ? (
        <div className="py-20 text-center font-bold text-slate-400 animate-pulse">Menghubungkan ke Database...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {branches.map(b => (
            <div key={b.id} className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-6">
                 <h3 className="text-xl font-bold text-primary-900 dark:text-white">{b.name}</h3>
                 <div className="flex gap-3">
                   <button onClick={() => handleOpenModal(b)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-primary-600">Edit</button>
                   <button onClick={() => handleDelete(b.id)} className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-600">Hapus</button>
                 </div>
              </div>
              <div className="space-y-4">
                 <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Min</span>
                   <span className="font-bold text-slate-700 dark:text-slate-200">{IDRCurrency.format(b.target_min)}</span>
                 </div>
                 <div className="flex justify-between items-center p-3 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                   <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Target Max</span>
                   <span className="font-bold text-slate-700 dark:text-slate-200">{IDRCurrency.format(b.target_max)}</span>
                 </div>
                 <div className="mt-4 pt-4 border-t border-slate-50 dark:border-slate-700">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">n8n Webhook URL</p>
                    <p className="text-[10px] font-mono text-slate-500 break-all bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                      {b.n8n_endpoint || '-'}
                    </p>
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-800 w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl border border-slate-100 dark:border-slate-700 animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-display font-bold mb-8 text-slate-900 dark:text-white">{editingBranch ? 'Edit Cabang' : 'Tambah Cabang'}</h3>
            <div className="space-y-5">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Nama Cabang</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-none text-sm font-bold text-slate-700 dark:text-slate-200" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Min (IDR)</label>
                  <input required type="number" value={formData.targetMin} onChange={e => setFormData({...formData, targetMin: parseInt(e.target.value)})} className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-none text-sm font-bold text-slate-700 dark:text-slate-200" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Max (IDR)</label>
                  <input required type="number" value={formData.targetMax} onChange={e => setFormData({...formData, targetMax: parseInt(e.target.value)})} className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-none text-sm font-bold text-slate-700 dark:text-slate-200" />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">n8n Webhook URL</label>
                <input type="url" value={formData.n8nEndpoint} onChange={e => setFormData({...formData, n8nEndpoint: e.target.value})} className="w-full h-12 px-4 rounded-xl bg-slate-50 dark:bg-slate-900 border-none text-sm font-bold text-slate-700 dark:text-slate-200" placeholder="https://..." />
              </div>
            </div>
            <div className="flex gap-4 mt-10">
              <button type="button" onClick={() => setShowModal(false)} className="flex-1 h-12 text-sm font-bold text-slate-400">Batal</button>
              <button type="submit" className="flex-[2] h-12 bg-primary-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-primary-600/20">Simpan ke DB</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default BranchManager;

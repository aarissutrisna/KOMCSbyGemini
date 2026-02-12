
import React from 'react';
import { useAuth } from '../App';
import { UserRole } from '../types';
import { Icons } from '../constants';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isOpen }) => {
  const { user, logout, darkMode, toggleDarkMode } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Icons.Dashboard, roles: [UserRole.ADMIN, UserRole.HRD, UserRole.CS] },
    { id: 'branches', label: 'Daftar Cabang', icon: Icons.Branch, roles: [UserRole.ADMIN] },
    { id: 'users', label: 'Pengaturan User', icon: Icons.Users, roles: [UserRole.ADMIN] },
    { id: 'attendance', label: 'Absensi & Omzet', icon: Icons.Attendance, roles: [UserRole.ADMIN, UserRole.HRD, UserRole.CS] },
    { id: 'mutations', label: 'Mutasi Ledger', icon: Icons.Wallet, roles: [UserRole.ADMIN, UserRole.HRD, UserRole.CS] },
    { id: 'withdrawals', label: 'Penarikan Dana', icon: Icons.Wallet, roles: [UserRole.ADMIN, UserRole.HRD, UserRole.CS] },
  ];

  return (
    <div className={`
      fixed lg:relative inset-y-0 left-0 w-72 bg-primary-900 dark:bg-slate-900 text-white flex flex-col h-full z-50 
      transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
      ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
    `}>
      <div className="p-10 text-center border-b border-white/5">
        <h1 className="text-2xl font-display font-bold tracking-tight">KOMCS <span className="text-primary-400">PJB</span></h1>
        <p className="text-primary-300/40 text-[9px] mt-1 uppercase tracking-[0.3em] font-black italic">PRO ENTERPRISE</p>
      </div>

      <nav className="flex-1 px-4 py-8 space-y-1.5 overflow-y-auto hide-scrollbar">
        {menuItems.filter(item => user && item.roles.includes(user.role)).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all duration-300 group ${
              activeTab === item.id 
                ? 'bg-primary-600 text-white shadow-xl shadow-primary-950/20' 
                : 'text-primary-200/50 hover:bg-white/5 hover:text-white'
            }`}
          >
            <div className={`${activeTab === item.id ? 'text-white' : 'text-primary-500 group-hover:text-primary-300 transition-colors'}`}>
              <item.icon />
            </div>
            <span className="font-bold text-[13px] tracking-wide">{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="p-6 border-t border-white/5 space-y-4">
        {/* Professional Mode Toggles */}
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center justify-between px-5 py-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-colors text-[13px] font-bold"
        >
          <div className="flex items-center gap-3">
            {darkMode ? '☀️ Tema Terang' : '🌙 Tema Gelap'}
          </div>
          <div className={`w-10 h-5 rounded-full relative transition-colors ${darkMode ? 'bg-primary-500' : 'bg-slate-700'}`}>
            <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${darkMode ? 'left-6' : 'left-1'}`}></div>
          </div>
        </button>

        <button
          onClick={logout}
          className="w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-rose-300 hover:bg-rose-500/10 transition-all text-[13px] font-black uppercase tracking-widest"
        >
          <Icons.SignOut />
          <span>Keluar</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;

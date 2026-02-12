
import React from 'react';
import { useAuth } from '../App';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-20 glass-effect flex items-center justify-between px-4 md:px-10 shrink-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-95 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div className="hidden sm:flex items-center space-x-2.5">
          <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]"></div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.15em]">System Node Active</span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="text-right flex flex-col items-end">
          <p className="text-sm font-extrabold text-slate-900 dark:text-white leading-tight tracking-tight">{user?.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="px-2 py-0.5 rounded-lg bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 text-[9px] font-black uppercase tracking-tighter">
              {user?.role}
            </span>
            <span className="text-[10px] text-slate-400 font-bold opacity-70">
              {user?.branchId || 'Global HQ'}
            </span>
          </div>
        </div>
        <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-black text-lg shadow-lg shadow-primary-500/25 active:scale-95 transition-all cursor-pointer ring-2 ring-white dark:ring-slate-800">
          {user?.name.charAt(0)}
        </div>
      </div>
    </header>
  );
};

export default Header;


import React from 'react';
import { useAuth } from '../App';

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-30 h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 md:px-10 shrink-0">
      <div className="flex items-center gap-4">
        <button 
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 active:scale-95 transition-transform"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>
        <div className="hidden sm:flex items-center space-x-2">
          <div className="h-2 w-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]"></div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Server Connection Stable</span>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="text-right flex flex-col items-end">
          <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{user?.name}</p>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="px-1.5 py-0.5 rounded bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 text-[9px] font-extrabold uppercase tracking-tighter">
              {user?.role}
            </span>
            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[80px] md:max-w-none">
              {user?.branchId || 'Global HQ'}
            </span>
          </div>
        </div>
        <div className="relative group">
          <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-primary-500/20 active:scale-95 transition-transform cursor-pointer overflow-hidden">
            {user?.name.charAt(0)}
            <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

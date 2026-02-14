import React, { useState, useEffect, createContext, useContext } from 'react';
import { User, UserRole } from './types';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import BranchManager from './components/BranchManager';
import UserManager from './components/UserManager';
import AttendanceManager from './components/AttendanceManager';
import MutationManager from './components/MutationManager';
import WithdrawalManager from './components/WithdrawalManager';
import './index.css';

// API Configuration
export const API_BASE_URL = window.location.origin + '/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (user: User, token: string) => void;
  logout: () => void;
  darkMode: boolean;
  toggleDarkMode: () => void;
  apiFetch: (endpoint: string, options?: RequestInit) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const login = (u: User, t: string) => {
    setUser(u);
    setToken(t);
    localStorage.setItem('komcs_user', JSON.stringify(u));
    localStorage.setItem('komcs_token', t);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('komcs_user');
    localStorage.removeItem('komcs_token');
    setActiveTab('dashboard');
    setIsSidebarOpen(false);
  };

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const headers = {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    };

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, { 
        ...options, 
        headers,
        signal: controller.signal 
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        if (response.status === 401) {
          logout();
          throw new Error("Sesi berakhir, silakan login kembali.");
        }
        if (response.status === 404) throw new Error("API Endpoint tidak ditemukan (404). Periksa Nginx Proxy.");
        if (response.status === 502) throw new Error("Backend Offline (Bad Gateway).");
        
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Server Error (${response.status})`);
      }
      
      const result = await response.json();
      return result;
    } catch (err: any) {
      console.error("Fetch Error:", err);
      const msg = err.name === 'AbortError' ? "Request Timeout (8s)" : err.message;
      setGlobalError(msg);
      throw err;
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('komcs_user');
    const savedToken = localStorage.getItem('komcs_token');
    if (savedUser && savedToken) {
      setUser(JSON.parse(savedUser));
      setToken(savedToken);
    }
    
    const savedTheme = localStorage.getItem('komcs_theme');
    if (savedTheme === 'dark') setDarkMode(true);
    setIsInitializing(false);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('komcs_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('komcs_theme', 'light');
    }
  }, [darkMode]);

  if (isInitializing) return <div className="h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 text-primary-600 font-bold">Inisialisasi Sistem...</div>;

  return (
    <AuthContext.Provider value={{ user, token, login, logout, darkMode, toggleDarkMode, apiFetch }}>
      {globalError && (
        <div className="fixed top-4 right-4 z-[9999] bg-rose-600 text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 animate-in slide-in-from-right">
          <span className="font-bold text-sm">{globalError}</span>
          <button onClick={() => setGlobalError(null)} className="hover:scale-110 transition-transform">✕</button>
        </div>
      )}
      {!user ? (
        <Login onLogin={(u, t) => login(u, t)} />
      ) : (
        <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
          {isSidebarOpen && (
            <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)}></div>
          )}
          <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }} isOpen={isSidebarOpen} />
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <Header onMenuClick={() => setIsSidebarOpen(true)} />
            <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 hide-scrollbar">
              <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                {activeTab === 'dashboard' && <Dashboard />}
                {activeTab === 'branches' && user.role === UserRole.ADMIN && <BranchManager />}
                {activeTab === 'users' && user.role === UserRole.ADMIN && <UserManager />}
                {activeTab === 'attendance' && <AttendanceManager />}
                {activeTab === 'mutations' && <MutationManager />}
                {activeTab === 'withdrawals' && <WithdrawalManager />}
              </div>
            </main>
          </div>
        </div>
      )}
    </AuthContext.Provider>
  );
};

export default App;
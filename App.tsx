
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

// API Configuration
export const API_BASE_URL = '/api';

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

  // Global API Fetch dengan Timeout 3 Detik
  const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

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
      
      if (response.status === 401) {
        logout();
        throw new Error("Sesi berakhir, silakan login kembali.");
      }
      
      const result = await response.json();
      if (!result.success) throw new Error(result.message || "Terjadi kesalahan API");
      return result;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        throw new Error("Server tidak merespon (Timeout). Pastikan backend aktif.");
      }
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

  if (!user) {
    return (
      <AuthContext.Provider value={{ user, token, login, logout, darkMode, toggleDarkMode, apiFetch }}>
        <Login onLogin={(u, t) => login(u, t)} />
      </AuthContext.Provider>
    );
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'branches': return user.role === UserRole.ADMIN ? <BranchManager /> : null;
      case 'users': return user.role === UserRole.ADMIN ? <UserManager /> : null;
      case 'attendance': return <AttendanceManager />;
      case 'mutations': return <MutationManager />;
      case 'withdrawals': return <WithdrawalManager />;
      default: return <Dashboard />;
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, darkMode, toggleDarkMode, apiFetch }}>
      <div className="flex h-screen bg-slate-50 dark:bg-slate-950 overflow-hidden">
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm transition-opacity" onClick={() => setIsSidebarOpen(false)}></div>
        )}
        <Sidebar activeTab={activeTab} setActiveTab={(tab) => { setActiveTab(tab); setIsSidebarOpen(false); }} isOpen={isSidebarOpen} />
        <div className="flex-1 flex flex-col overflow-hidden relative">
          <Header onMenuClick={() => setIsSidebarOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-10 hide-scrollbar">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              {renderContent()}
            </div>
          </main>
        </div>
      </div>
    </AuthContext.Provider>
  );
};

export default App;

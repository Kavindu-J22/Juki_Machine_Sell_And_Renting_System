import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../services/api';
import {
  LayoutDashboard,
  Cpu,
  Users,
  FileText,
  DollarSign,
  Printer,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  ShieldCheck,
  UserCheck,
  Building2,
  ChevronRight,
  Globe,
  Briefcase,
  Wrench,
  CheckCircle2,
  Activity,
  AlertTriangle
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const { language, toggleLanguage, t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dbStatus, setDbStatus] = useState('online');

  useEffect(() => {
    checkDbHealth();
    const interval = setInterval(checkDbHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const checkDbHealth = async () => {
    try {
      const res = await api.get('/health');
      if (res.data?.status === 'online') {
        setDbStatus('online');
      } else {
        setDbStatus('syncing');
      }
    } catch (err) {
      setDbStatus('offline');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Role-based Navigation mapping
  const getNavigation = () => {
    const userRole = (user?.role || 'Admin').toLowerCase();

    if (userRole === 'client') {
      return [
        { name: t('dashboard'), path: '/', icon: LayoutDashboard, exact: true },
        { name: t('myEquipment'), path: '/client-portal', icon: Cpu },
        { name: t('serviceRequests'), path: '/service-requests', icon: Wrench }
      ];
    }

    if (userRole === 'partner') {
      return [
        { name: t('dashboard'), path: '/', icon: LayoutDashboard, exact: true },
        { name: t('partnerEquity'), path: '/finance', icon: DollarSign },
        { name: t('posDispatch'), path: '/sales-ledger', icon: FileText },
        { name: t('machineryMaster'), path: '/machines', icon: Cpu },
        { name: t('reports'), path: '/reports', icon: BarChart3 }
      ];
    }

    // Default Admin & Staff
    return [
      { name: t('dashboard'), path: '/', icon: LayoutDashboard, exact: true },
      { name: t('machineryMaster'), path: '/machines', icon: Cpu },
      { name: t('posDispatch'), path: '/sales-ledger', icon: FileText },
      { name: t('partnerEquity'), path: '/finance', icon: DollarSign },
      { name: t('clientCRM'), path: '/customers', icon: Users },
      { name: t('printableInvoice'), path: '/documents', icon: Printer },
      { name: t('reports'), path: '/reports', icon: BarChart3 },
      { name: t('settings'), path: '/settings', icon: Settings }
    ];
  };

  const navigation = getNavigation();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row font-sans">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-sky-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg">
            AG
          </div>
          <div>
            <h1 className="font-bold text-white text-sm leading-tight tracking-wide">ANUJAYA & GLOBAL</h1>
            <p className="text-[9px] text-indigo-400 font-mono uppercase">Apparel Machinery ERP</p>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={toggleLanguage}
            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-xs text-indigo-300 font-bold rounded-lg border border-slate-700 flex items-center space-x-1"
          >
            <Globe size={13} />
            <span>{language === 'en' ? 'සිංහල' : 'ENG'}</span>
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900/95 border-r border-slate-800/80 backdrop-blur-xl flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="hidden md:flex flex-col px-6 py-5 border-b border-slate-800/80 space-y-1">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-sky-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/25">
              AG
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base tracking-tight leading-none">
                ANUJAYA & GLOBAL
              </h1>
              <p className="text-[10px] text-amber-400 font-medium tracking-wide mt-1">
                Enterprises Consortium
              </p>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-4 bg-slate-800/50 rounded-2xl border border-slate-700/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white font-bold border border-indigo-400/30 shadow-md">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{user?.name}</p>
              <div className="flex items-center space-x-1 mt-1">
                {user?.role?.toLowerCase() === 'admin' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    <ShieldCheck size={11} className="mr-1" /> ADMIN
                  </span>
                )}
                {user?.role?.toLowerCase() === 'partner' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Briefcase size={11} className="mr-1" /> PARTNER ({user?.partnerName || 'Equity'})
                  </span>
                )}
                {user?.role?.toLowerCase() === 'client' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <UserCheck size={11} className="mr-1" /> CLIENT
                  </span>
                )}
                {user?.role?.toLowerCase() === 'staff' && (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                    <UserCheck size={11} className="mr-1" /> STAFF
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1.5 overflow-y-auto py-2">
          {navigation.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/30 font-bold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {isActive && <ChevronRight size={14} className="text-white/70" />}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer: Language Toggle & DB Connectivity Indicator */}
        <div className="p-4 border-t border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between px-2 text-xs">
            <span className="text-slate-400 text-[11px]">Database Status:</span>
            {dbStatus === 'online' && (
              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 size={11} className="mr-1" /> {t('dbConnected')}
              </span>
            )}
            {dbStatus === 'syncing' && (
              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Activity size={11} className="mr-1 animate-spin" /> {t('dbSyncing')}
              </span>
            )}
            {dbStatus === 'offline' && (
              <span className="inline-flex items-center text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <AlertTriangle size={11} className="mr-1" /> {t('dbOffline')}
              </span>
            )}
          </div>

          <button
            onClick={toggleLanguage}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-slate-800/80 hover:bg-slate-700 text-xs font-bold text-indigo-300 rounded-xl border border-slate-700 transition-all"
          >
            <Globe size={14} />
            <span>Language: {language === 'en' ? 'English ➔ සිංහල' : 'සිංහල ➔ English'}</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
          >
            <LogOut size={14} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-3.5 bg-slate-900/60 border-b border-slate-800/80 backdrop-blur-md">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Building2 size={15} className="text-indigo-400" />
            <span className="font-bold text-slate-300">ANUJAYA & GLOBAL ENTERPRISES</span>
            <span>/</span>
            <span className="text-indigo-300 font-semibold capitalize">
              {location.pathname === '/' ? t('dashboard') : location.pathname.substring(1)}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Live Exchange Rate Anchor Display */}
            <div className="px-3 py-1 bg-indigo-950/40 rounded-xl border border-indigo-500/30 flex items-center space-x-2 text-xs">
              <span className="text-slate-400">{t('liveRate')}:</span>
              <span className="text-amber-400 font-extrabold font-mono">1 USD = 330 LKR</span>
            </div>

            <div className="text-right">
              <p className="text-[11px] text-slate-400">{t('welcomeBack')}</p>
              <p className="text-xs font-bold text-slate-100">{user?.name}</p>
            </div>
          </div>
        </header>

        {/* Main Content Route Shell */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

import React, { useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
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
  ChevronRight
} from 'lucide-react';

const DashboardLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navigation = [
    { name: 'Dashboard Overview', path: '/', icon: LayoutDashboard, exact: true },
    { name: 'Machines & Inventory', path: '/machines', icon: Cpu },
    { name: 'Customer Registry', path: '/customers', icon: Users },
    { name: 'Rental Contracts', path: '/rentals', icon: FileText, badge: 'Phase 2' },
    { name: 'Financials & Naya', path: '/finance', icon: DollarSign, badge: 'Phase 3' },
    { name: 'Print Documents', path: '/documents', icon: Printer, badge: 'Phase 3' },
    { name: 'Reports & Analytics', path: '/reports', icon: BarChart3, badge: 'Phase 4' },
    { name: 'Company Settings', path: '/settings', icon: Settings, adminOnly: true },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <div className="md:hidden flex items-center justify-between p-4 bg-slate-900/90 border-b border-slate-800 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/30">
            J
          </div>
          <div>
            <h1 className="font-bold text-white text-base leading-tight">JUKI SYSTEM</h1>
            <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider">Sri Lanka Enterprise</p>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-slate-400 hover:text-white rounded-lg bg-slate-800"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900/95 border-r border-slate-800/80 backdrop-blur-xl flex flex-col transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="hidden md:flex items-center space-x-3.5 px-6 py-5 border-b border-slate-800/80">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-indigo-500/25">
            J
          </div>
          <div>
            <h1 className="font-extrabold text-white text-lg tracking-tight">JUKI SYSTEM</h1>
            <p className="text-[11px] text-indigo-400 font-medium tracking-wide">Rental & Inventory Hub</p>
          </div>
        </div>

        {/* User Info Card in Sidebar */}
        <div className="p-4 mx-3 my-4 bg-slate-800/40 rounded-xl border border-slate-700/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-indigo-400 font-bold border border-slate-600">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-200 truncate">{user?.name}</p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                {user?.role === 'Admin' ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <ShieldCheck size={11} className="mr-1" /> Admin
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <UserCheck size={11} className="mr-1" /> Staff
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto py-2">
          {navigation.map((item) => {
            if (item.adminOnly && user?.role !== 'Admin') return null;

            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`group flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white shadow-md shadow-indigo-600/20 font-semibold'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <item.icon
                    className={`w-5 h-5 transition-colors ${
                      isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'
                    }`}
                  />
                  <span>{item.name}</span>
                </div>
                {item.badge ? (
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700">
                    {item.badge}
                  </span>
                ) : (
                  isActive && <ChevronRight size={14} className="text-white/70" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Logout */}
        <div className="p-4 border-t border-slate-800/80">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-medium text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 transition-all"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Desktop Top Header Bar */}
        <header className="hidden md:flex items-center justify-between px-8 py-4 bg-slate-900/40 border-b border-slate-800/60 backdrop-blur-md">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Building2 size={15} className="text-indigo-400" />
            <span>Juki Sewing Machine Centre</span>
            <span>/</span>
            <span className="text-slate-200 font-medium capitalize">
              {location.pathname === '/' ? 'Dashboard' : location.pathname.substring(1)}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-xs text-slate-400">Logged in as</p>
              <p className="text-sm font-semibold text-slate-200">{user?.name}</p>
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-sky-400 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20">
              {user?.name?.charAt(0) || 'U'}
            </div>
          </div>
        </header>

        {/* Route Page Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;

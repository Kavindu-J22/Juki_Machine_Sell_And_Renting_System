import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Lock, Mail, Eye, EyeOff, Loader2, Shield, Sparkles, Building2, Briefcase, UserCheck } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in both email and password.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      await login(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(
        err.response?.data?.message ||
        'Invalid login credentials. Please check your email and password.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDemoFill = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans">
      {/* Background Ambient Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-sky-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-lg relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 via-indigo-600 to-sky-400 text-white font-black text-3xl shadow-xl shadow-indigo-500/30 mb-3 border border-indigo-400/30">
            AG
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            ANUJAYA & GLOBAL ENTERPRISES
          </h1>
          <p className="text-xs text-amber-400 font-semibold mt-1">
            Industrial Apparel Machinery & Logistics Consortium ERP
          </p>
        </div>

        {/* Login Glass Panel */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800/80 shadow-2xl shadow-slate-950">
          <div className="flex items-center space-x-2 pb-4 mb-6 border-b border-slate-800">
            <Shield className="w-5 h-5 text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
              Consortium Role Authentication
            </h2>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start space-x-3">
              <span className="text-base">⚠️</span>
              <p className="flex-1">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Email Field */}
            <div>
              <label className="block text-slate-300 uppercase tracking-wider font-bold mb-1">
                Email Credentials
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Mail size={16} />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@anujayaglobal.lk"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-slate-300 uppercase tracking-wider font-bold mb-1">
                Password / Security PIN
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                  <Lock size={16} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/90 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Sign In to Consortium Portal</span>
              )}
            </button>
          </form>

          {/* Seed Accounts Demo Switcher */}
          <div className="mt-6 pt-5 border-t border-slate-800 space-y-2">
            <div className="flex items-center space-x-1.5 text-xs text-slate-400 mb-2">
              <Sparkles size={14} className="text-amber-400" />
              <span className="font-bold text-slate-300">Auto-Seeded Role Credentials:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleDemoFill('admin@anujayaglobal.lk', 'admin123')}
                className="p-2.5 bg-indigo-950/40 hover:bg-indigo-900/60 text-indigo-300 rounded-xl border border-indigo-500/30 text-left transition-all"
              >
                <div className="font-bold text-white flex items-center space-x-1">
                  <Shield size={12} className="text-indigo-400" />
                  <span>Consortium Admin</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">admin123</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('anujaya@anujayaglobal.lk', 'partner123')}
                className="p-2.5 bg-amber-950/40 hover:bg-amber-900/60 text-amber-300 rounded-xl border border-amber-500/30 text-left transition-all"
              >
                <div className="font-bold text-white flex items-center space-x-1">
                  <Briefcase size={12} className="text-amber-400" />
                  <span>Partner Anujaya</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">partner123</div>
              </button>

              <button
                type="button"
                onClick={() => handleDemoFill('mas@apparel.lk', 'client123')}
                className="p-2.5 bg-emerald-950/40 hover:bg-emerald-900/60 text-emerald-300 rounded-xl border border-emerald-500/30 text-left transition-all"
              >
                <div className="font-bold text-white flex items-center space-x-1">
                  <UserCheck size={12} className="text-emerald-400" />
                  <span>Apparel Client MAS</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono mt-0.5 truncate">client123</div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-xs text-slate-500 mt-6 flex items-center justify-center space-x-1">
          <Building2 size={13} />
          <span>Katunayake Free Trade Zone Complex • Sri Lanka</span>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

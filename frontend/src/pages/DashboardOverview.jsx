import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { notificationService } from '../services/notificationService';
import {
  Cpu,
  Users,
  FileText,
  Building2,
  CheckCircle2,
  ArrowUpRight,
  TrendingUp,
  Clock,
  ShieldCheck,
  AlertCircle,
  Activity,
  Bell,
  Mail,
  Send,
  Loader2
} from 'lucide-react';

const DashboardOverview = () => {
  const { user } = useAuth();
  const [healthStatus, setHealthStatus] = useState(null);
  const [loadingHealth, setLoadingHealth] = useState(true);

  // Alerts widget state
  const [alertData, setAlertData] = useState(null);
  const [loadingAlerts, setLoadingAlerts] = useState(true);
  const [sendingEmailId, setSendingEmailId] = useState(null);

  useEffect(() => {
    fetchHealth();
    fetchAlerts();
  }, []);

  const fetchHealth = async () => {
    try {
      const res = await api.get('/health');
      setHealthStatus(res.data);
    } catch (err) {
      setHealthStatus({ status: 'offline' });
    } finally {
      setLoadingHealth(false);
    }
  };

  const fetchAlerts = async () => {
    try {
      setLoadingAlerts(true);
      const res = await notificationService.getAlerts();
      if (res.success) {
        setAlertData(res.data);
      }
    } catch (err) {
      console.error('Error fetching alerts:', err);
    } finally {
      setLoadingAlerts(false);
    }
  };

  const handleSendReminder = async (rentalId, customerEmail) => {
    try {
      setSendingEmailId(rentalId);
      const res = await notificationService.sendEmailReminder(rentalId, customerEmail);
      if (res.success) {
        alert(res.message);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error sending email reminder');
    } finally {
      setSendingEmailId(null);
    }
  };

  const stats = [
    {
      title: 'Total Machine Units',
      value: '48',
      subtitle: '36 Available • 12 Rented',
      icon: Cpu,
      color: 'from-indigo-500 to-indigo-600',
      change: '+4 this month'
    },
    {
      title: 'Active Customers',
      value: '24',
      subtitle: 'Garment factories & shops',
      icon: Users,
      color: 'from-emerald-500 to-emerald-600',
      change: '+2 new'
    },
    {
      title: 'Active Rental Agreements',
      value: '18',
      subtitle: 'Monthly recurring billing',
      icon: FileText,
      color: 'from-sky-500 to-blue-600',
      change: 'Phase 3 Ready'
    },
    {
      title: 'Monthly Rental Revenue',
      value: 'LKR 840,000',
      subtitle: 'Estimated active cashflow',
      icon: TrendingUp,
      color: 'from-purple-500 to-pink-600',
      change: 'Phase 3 Active'
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/60 via-slate-900 to-slate-900 border border-indigo-500/20 p-6 sm:p-8">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold mb-3">
              <ShieldCheck size={14} />
              <span>Phase 3 System Active • {user?.role} Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Welcome back, {user?.name}!
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-xl">
              Enterprise Sewing Machine Rental, Financials & Automated Alerts System for Sri Lanka operations.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/finance"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-2"
            >
              <span>Manage Financials</span>
              <ArrowUpRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* AUTOMATED PAYMENT ALERTS WIDGET (COLOR-CODED BADGES) */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Automated Payment Due Alerts</h2>
              <p className="text-xs text-slate-400">
                Live monitoring of customer due dates with automated Nodemailer email reminders.
              </p>
            </div>
          </div>

          {alertData && (
            <div className="flex items-center space-x-2 flex-wrap">
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                🟢 7 Days: {alertData.sevenDays?.length || 0}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                🟡 3 Days: {alertData.threeDays?.length || 0}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-500/10 text-orange-400 border border-orange-500/20">
                🟠 Today: {alertData.dueToday?.length || 0}
              </span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                🔴 Overdue: {alertData.overdue?.length || 0}
              </span>
            </div>
          )}
        </div>

        {/* Alerts List Grid */}
        {loadingAlerts ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
          </div>
        ) : !alertData ||
          (alertData.overdue.length === 0 &&
            alertData.dueToday.length === 0 &&
            alertData.threeDays.length === 0 &&
            alertData.sevenDays.length === 0) ? (
          <div className="p-6 bg-slate-900/60 rounded-2xl text-center border border-slate-800">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p className="text-xs text-slate-300 font-medium">
              No upcoming or overdue payment alerts! All customer rentals are up to date.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* OVERDUE ALERTS (🔴) */}
            {alertData.overdue.map((item) => (
              <div
                key={item._id}
                className="p-4 bg-rose-950/20 rounded-2xl border border-rose-500/30 flex items-center justify-between"
              >
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">
                    🔴 OVERDUE ({Math.abs(item.daysRemaining)} Days Late)
                  </span>
                  <h4 className="font-bold text-slate-100 text-sm mt-1.5">{item.customer?.name}</h4>
                  <p className="text-xs text-slate-400 font-mono">
                    Due Date: {new Date(item.dueDate).toLocaleDateString()} • LKR {(item.monthlyRentAmount || 0).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleSendReminder(item._id, item.customer?.email)}
                  disabled={sendingEmailId === item._id}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all disabled:opacity-50"
                >
                  {sendingEmailId === item._id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Mail size={12} />
                  )}
                  <span>Send Email</span>
                </button>
              </div>
            ))}

            {/* DUE TODAY ALERTS (🟠) */}
            {alertData.dueToday.map((item) => (
              <div
                key={item._id}
                className="p-4 bg-orange-950/20 rounded-2xl border border-orange-500/30 flex items-center justify-between"
              >
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    🟠 DUE TODAY
                  </span>
                  <h4 className="font-bold text-slate-100 text-sm mt-1.5">{item.customer?.name}</h4>
                  <p className="text-xs text-slate-400 font-mono">
                    Due Date: Today • LKR {(item.monthlyRentAmount || 0).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleSendReminder(item._id, item.customer?.email)}
                  disabled={sendingEmailId === item._id}
                  className="px-3 py-1.5 bg-orange-600 hover:bg-orange-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all disabled:opacity-50"
                >
                  {sendingEmailId === item._id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Mail size={12} />
                  )}
                  <span>Send Email</span>
                </button>
              </div>
            ))}

            {/* 3 DAYS REMAINING ALERTS (🟡) */}
            {alertData.threeDays.map((item) => (
              <div
                key={item._id}
                className="p-4 bg-amber-950/20 rounded-2xl border border-amber-500/30 flex items-center justify-between"
              >
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    🟡 3 DAYS REMAINING ({item.daysRemaining} Days Left)
                  </span>
                  <h4 className="font-bold text-slate-100 text-sm mt-1.5">{item.customer?.name}</h4>
                  <p className="text-xs text-slate-400 font-mono">
                    Due Date: {new Date(item.dueDate).toLocaleDateString()} • LKR {(item.monthlyRentAmount || 0).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleSendReminder(item._id, item.customer?.email)}
                  disabled={sendingEmailId === item._id}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all disabled:opacity-50"
                >
                  {sendingEmailId === item._id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Mail size={12} />
                  )}
                  <span>Send Email</span>
                </button>
              </div>
            ))}

            {/* 7 DAYS REMAINING ALERTS (🟢) */}
            {alertData.sevenDays.map((item) => (
              <div
                key={item._id}
                className="p-4 bg-emerald-950/20 rounded-2xl border border-emerald-500/30 flex items-center justify-between"
              >
                <div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    🟢 7 DAYS REMAINING ({item.daysRemaining} Days Left)
                  </span>
                  <h4 className="font-bold text-slate-100 text-sm mt-1.5">{item.customer?.name}</h4>
                  <p className="text-xs text-slate-400 font-mono">
                    Due Date: {new Date(item.dueDate).toLocaleDateString()} • LKR {(item.monthlyRentAmount || 0).toLocaleString()}
                  </p>
                </div>
                <button
                  onClick={() => handleSendReminder(item._id, item.customer?.email)}
                  disabled={sendingEmailId === item._id}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all disabled:opacity-50"
                >
                  {sendingEmailId === item._id ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Mail size={12} />
                  )}
                  <span>Send Email</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Key Metric Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-indigo-500/30 transition-all group"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-medium text-slate-400">{stat.title}</span>
              <div className={`w-9 h-9 rounded-xl bg-gradient-to-tr ${stat.color} flex items-center justify-center text-white shadow-md`}>
                <stat.icon size={18} />
              </div>
            </div>
            <div className="text-2xl font-black text-white tracking-tight">{stat.value}</div>
            <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/50 text-xs">
              <span className="text-slate-400">{stat.subtitle}</span>
              <span className="text-indigo-400 font-medium">{stat.change}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardOverview;

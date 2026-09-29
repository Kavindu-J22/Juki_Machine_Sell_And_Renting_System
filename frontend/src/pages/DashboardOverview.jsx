import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';
import { machineService } from '../services/machineService';
import { salesLedgerService } from '../services/salesLedgerService';
import { partnerService } from '../services/partnerService';
import {
  Cpu,
  Users,
  FileText,
  DollarSign,
  ShieldCheck,
  TrendingUp,
  ArrowUpRight,
  Briefcase,
  Wrench,
  CheckCircle2,
  Clock,
  AlertCircle,
  Building2
} from 'lucide-react';

const DashboardOverview = () => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [stats, setStats] = useState({
    totalMachines: 0,
    availableSets: 0,
    totalDispatches: 0,
    totalRevenueLkr: 0,
    partnerNetLkr: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOverviewData();
  }, [user]);

  const loadOverviewData = async () => {
    try {
      setLoading(true);

      let totalMachines = 0;
      let availableSets = 0;
      try {
        const resMachines = await machineService.getMachines();
        if (resMachines?.success) {
          totalMachines = resMachines.data.reduce((acc, m) => acc + (m.initialBatchSets || 1), 0);
          availableSets = resMachines.data.reduce((acc, m) => acc + (m.availableSets || 0), 0);
        }
      } catch (e) {
        console.warn('Machine fetch skipped:', e.message);
      }

      let totalDispatches = 0;
      let totalRevenueLkr = 0;
      try {
        const resDispatches = await salesLedgerService.getDispatches();
        if (resDispatches?.success) {
          totalDispatches = resDispatches.data.length;
          totalRevenueLkr = resDispatches.data.reduce((acc, d) => acc + (d.grandTotalLkr || 0), 0);
        }
      } catch (e) {
        console.warn('Dispatch fetch skipped:', e.message);
      }

      let partnerNetLkr = 0;
      try {
        const resPartners = await partnerService.getPartnerDashboard(user?.partnerName || 'Anujaya');
        if (resPartners?.success) {
          partnerNetLkr = resPartners.data.summary?.totalConsortiumNet || 0;
        }
      } catch (e) {
        console.warn('Partner dashboard fetch skipped:', e.message);
      }

      setStats({
        totalMachines,
        availableSets,
        totalDispatches,
        totalRevenueLkr,
        partnerNetLkr
      });
    } catch (err) {
      console.error('Error loading overview:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900/80 via-slate-900 to-slate-900 border border-indigo-500/30 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold mb-3">
              <ShieldCheck size={14} />
              <span>ANUJAYA & GLOBAL ENTERPRISES ERP • {user?.role} Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t('welcomeBack')}, {user?.name}!
            </h1>
            <p className="text-slate-400 text-xs mt-1 max-w-xl">
              Industrial Apparel Machinery & Logistics Consortium Management System.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/sales-ledger"
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 transition-all flex items-center space-x-1.5"
            >
              <span>{t('posDispatch')}</span>
              <ArrowUpRight size={14} />
            </Link>
            {(user?.role?.toLowerCase() === 'admin' || user?.role?.toLowerCase()?.includes('admin')) && (
              <Link
                to="/settings"
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 hover:text-white border border-slate-700 text-xs font-bold rounded-xl transition-all flex items-center space-x-1.5"
              >
                <Building2 size={14} />
                <span>{t('companySettings')}</span>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase">{t('initialBatchSets')}</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Cpu size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">{stats.totalMachines} Sets</p>
          <p className="text-xs text-emerald-400 font-bold">{stats.availableSets} Available Stock</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase">{t('posDispatch')}</span>
            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
              <FileText size={16} />
            </div>
          </div>
          <p className="text-2xl font-black text-white font-mono">{stats.totalDispatches} Orders</p>
          <p className="text-xs text-slate-400 font-bold">Invoices Processed</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase">Consortium Turnover</span>
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <DollarSign size={16} />
            </div>
          </div>
          <p className="text-xl font-black text-amber-400 font-mono">
            LKR {stats.totalRevenueLkr.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 font-bold">VAT / SVAT Included</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-bold uppercase">{t('realizedNet')}</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
              <TrendingUp size={16} />
            </div>
          </div>
          <p className="text-xl font-black text-emerald-400 font-mono">
            LKR {stats.partnerNetLkr.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 font-bold">50/50 Consortium Profit Split</p>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;

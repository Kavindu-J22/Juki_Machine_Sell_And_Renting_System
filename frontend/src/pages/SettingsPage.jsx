import React, { useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Settings,
  RefreshCw,
  Download,
  Upload,
  Save,
  Loader2,
  Building2,
  DollarSign,
  ShieldCheck,
  FileJson,
  X,
  Users,
  Plus,
  Trash2,
  Pencil,
  CheckCircle2,
  AlertTriangle,
  Briefcase,
  UserCheck,
  Eye,
  EyeOff,
  KeyRound
} from 'lucide-react';

const TABS = [
  { id: 'company', label: 'Company Settings', icon: Building2 },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'backup', label: 'Backup & Restore', icon: FileJson }
];

const ROLE_COLORS = {
  Admin: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
  Partner: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  Staff: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  Client: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
};

const SettingsPage = () => {
  const { t } = useLanguage();
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('company');

  // Company Settings state
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recalculatingRate, setRecalculatingRate] = useState(false);

  // User Management state
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [deletingUserId, setDeletingUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [userForm, setUserForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'Staff',
    partnerName: ''
  });
  const [userSubmitting, setUserSubmitting] = useState(false);

  // Restore Modal
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreText, setRestoreText] = useState('');
  const [restoring, setRestoring] = useState(false);

  const isAdmin =
    currentUser?.role === 'Admin' ||
    currentUser?.role?.toLowerCase()?.includes('admin');

  useEffect(() => {
    loadSettings();
    if (isAdmin) loadUsers();
  }, [isAdmin]);

  // ── Company Settings ─────────────────────────────────────────────
  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsService.getSettings();
      if (res.data) setSettings(res.data);
    } catch (err) {
      console.error('Error loading settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await settingsService.updateSettings(settings);
      if (res.success) {
        alert(res.message || 'Settings saved successfully');
        loadSettings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateExchangeRate = async () => {
    const rate = prompt('Enter New Global USD-to-LKR Exchange Rate Anchor:', settings?.usdToLkrRate || 330);
    if (!rate || isNaN(rate)) return;
    try {
      setRecalculatingRate(true);
      const res = await settingsService.updateExchangeRate(Number(rate));
      if (res.success) {
        alert(res.message);
        loadSettings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating exchange rate');
    } finally {
      setRecalculatingRate(false);
    }
  };

  // ── User Management ──────────────────────────────────────────────
  const loadUsers = async () => {
    try {
      setUsersLoading(true);
      const res = await api.get('/auth/users');
      if (res.data?.success) setUsers(res.data.data);
    } catch (err) {
      console.error('Error loading users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const openCreateUserModal = () => {
    setEditingUser(null);
    setUserForm({ name: '', email: '', password: '', role: 'Staff', partnerName: '' });
    setShowPassword(false);
    setShowUserModal(true);
  };

  const openEditUserModal = (u) => {
    setEditingUser(u);
    setUserForm({ name: u.name, email: u.email, password: '', role: u.role, partnerName: u.partnerName || '' });
    setShowPassword(false);
    setShowUserModal(true);
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    try {
      setUserSubmitting(true);
      let res;
      if (editingUser) {
        const payload = { name: userForm.name, role: userForm.role, partnerName: userForm.partnerName };
        const r = await api.put(`/auth/users/${editingUser._id}`, payload);
        res = r.data;
      } else {
        if (!userForm.password) { alert('Password is required for new users.'); return; }
        const r = await api.post('/auth/users', userForm);
        res = r.data;
      }

      if (res.success) {
        alert(res.message);
        setShowUserModal(false);
        loadUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving user');
    } finally {
      setUserSubmitting(false);
    }
  };

  const handleDeleteUser = async (u) => {
    if (!window.confirm(`Permanently delete user account '${u.name}' (${u.email})? This action cannot be undone.`)) return;
    try {
      setDeletingUserId(u._id);
      const res = await api.delete(`/auth/users/${u._id}`);
      if (res.data?.success) {
        alert(res.data.message);
        loadUsers();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting user');
    } finally {
      setDeletingUserId(null);
    }
  };

  // ── Backup / Restore ─────────────────────────────────────────────
  const handleBackup = async () => {
    try {
      const data = await settingsService.getBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `AnujayaGlobal_ERP_Backup_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Error generating database backup');
    }
  };

  const handleRestore = async () => {
    try {
      setRestoring(true);
      let backupObj = JSON.parse(restoreText);
      const res = await settingsService.restoreBackup(backupObj);
      if (res.success) {
        alert(res.message);
        setShowRestoreModal(false);
        setRestoreText('');
        loadSettings();
      }
    } catch (err) {
      alert('Error restoring database backup. Please ensure valid JSON format.');
    } finally {
      setRestoring(false);
    }
  };

  if (!isAdmin) {
    return (
      <div className="glass-panel p-12 rounded-3xl border border-rose-500/30 text-center max-w-lg mx-auto my-12 space-y-4">
        <ShieldCheck className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Administrator Access Only</h2>
        <p className="text-xs text-slate-400">
          Company Settings and System Administration are strictly restricted to Consortium Administrator accounts.
        </p>
        <a
          href="/"
          className="inline-block px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition-all shadow-lg shadow-indigo-600/30"
        >
          Return to Dashboard
        </a>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-3">
            <Settings className="text-indigo-400" />
            <span>{t('settings')} & Admin Panel</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Company profile, exchange rate anchor, user management, and system backup/restore.
          </p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex items-center space-x-2 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 w-max">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id);
              if (tab.id === 'users' && isAdmin) loadUsers();
            }}
            className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <tab.icon size={14} />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ── COMPANY SETTINGS TAB ── */}
      {activeTab === 'company' && (
        <>
          {loading || !settings ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : (
            <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
              {/* Exchange Rate */}
              <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-slate-900 to-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    DYNAMIC RECALCULATION ENGINE
                  </span>
                  <h3 className="text-lg font-black text-white">
                    Global USD-to-LKR Exchange Rate Anchor
                  </h3>
                  <p className="text-slate-400 text-xs max-w-lg">
                    Updating this rate dynamically recalculates landed costs, wholesale benchmarks, and retail profit margins across all machinery SKUs in MongoDB instantly.
                  </p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="px-5 py-3 bg-slate-900 rounded-2xl border border-indigo-500/30 text-center font-mono">
                    <span className="text-slate-400 text-[10px] uppercase block">Current Anchor</span>
                    <span className="text-amber-400 font-extrabold text-xl">
                      1 USD = {settings.usdToLkrRate || 330} LKR
                    </span>
                  </div>
                  {isAdmin && (
                    <button
                      type="button"
                      onClick={handleUpdateExchangeRate}
                      disabled={recalculatingRate}
                      className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
                    >
                      <RefreshCw size={16} className={recalculatingRate ? 'animate-spin' : ''} />
                      <span>Update Exchange Rate</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Consortium Profile */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Building2 size={18} className="text-indigo-400" />
                  <span>Consortium Details & Tax Identifiers</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 uppercase font-bold mb-1">Company Name</label>
                    <input
                      type="text"
                      value={settings.companyName || ''}
                      onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                      disabled={!isAdmin}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-bold disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 uppercase font-bold mb-1">Consortium Tagline</label>
                    <input
                      type="text"
                      value={settings.tagline || ''}
                      onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                      disabled={!isAdmin}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 uppercase font-bold mb-1">Phone</label>
                    <input
                      type="text"
                      value={settings.phone || ''}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      disabled={!isAdmin}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 uppercase font-bold mb-1">Email</label>
                    <input
                      type="text"
                      value={settings.email || ''}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      disabled={!isAdmin}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 disabled:opacity-60"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-slate-400 uppercase font-bold mb-1">Address</label>
                    <input
                      type="text"
                      value={settings.address || ''}
                      onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                      disabled={!isAdmin}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 uppercase font-bold mb-1">VAT Number</label>
                    <input
                      type="text"
                      value={settings.taxDetails?.vatNumber || ''}
                      onChange={(e) => setSettings({ ...settings, taxDetails: { ...settings.taxDetails, vatNumber: e.target.value } })}
                      disabled={!isAdmin}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 uppercase font-bold mb-1">SVAT Number</label>
                    <input
                      type="text"
                      value={settings.taxDetails?.svatNumber || ''}
                      onChange={(e) => setSettings({ ...settings, taxDetails: { ...settings.taxDetails, svatNumber: e.target.value } })}
                      disabled={!isAdmin}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>

              {/* Partner Equity Split */}
              <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <DollarSign size={18} className="text-emerald-400" />
                  <span>Partner Equity Shareholding Split</span>
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-slate-400 uppercase font-bold mb-1">Anujaya Share (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={settings.partnerEquity?.anujayaSharePercent || 50}
                      onChange={(e) => setSettings({ ...settings, partnerEquity: { ...settings.partnerEquity, anujayaSharePercent: Number(e.target.value) } })}
                      disabled={!isAdmin}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-amber-400 font-extrabold font-mono disabled:opacity-60"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 uppercase font-bold mb-1">Global Share (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      value={settings.partnerEquity?.globalSharePercent || 50}
                      onChange={(e) => setSettings({ ...settings, partnerEquity: { ...settings.partnerEquity, globalSharePercent: Number(e.target.value) } })}
                      disabled={!isAdmin}
                      className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-amber-400 font-extrabold font-mono disabled:opacity-60"
                    />
                  </div>
                </div>
              </div>

              {isAdmin && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
                  >
                    <Save size={16} />
                    <span>{saving ? 'Saving...' : 'Save Consortium Settings'}</span>
                  </button>
                </div>
              )}
            </form>
          )}
        </>
      )}

      {/* ── USER MANAGEMENT TAB ── */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {!isAdmin ? (
            <div className="glass-panel p-8 rounded-3xl border border-rose-500/30 text-center">
              <ShieldCheck className="w-10 h-10 text-rose-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-rose-300">Admin Access Required</h3>
              <p className="text-xs text-slate-400 mt-1">Only Administrators can manage system user accounts.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <Users size={18} className="text-indigo-400" />
                  <span>System User Accounts</span>
                  <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    {users.length} users
                  </span>
                </h3>
                <button
                  onClick={openCreateUserModal}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5"
                >
                  <Plus size={15} />
                  <span>Create User</span>
                </button>
              </div>

              {usersLoading ? (
                <div className="flex items-center justify-center p-12">
                  <Loader2 className="w-7 h-7 text-indigo-500 animate-spin" />
                </div>
              ) : (
                <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase border-b border-slate-800">
                        <tr>
                          <th className="p-4">Name</th>
                          <th className="p-4">Email</th>
                          <th className="p-4">Role</th>
                          <th className="p-4">Partner</th>
                          <th className="p-4 text-center">Joined</th>
                          <th className="p-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60">
                        {users.map((u) => (
                          <tr key={u._id} className="hover:bg-slate-900/40 transition-all">
                            <td className="p-4 font-bold text-white flex items-center space-x-2">
                              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white font-black text-xs flex-shrink-0">
                                {u.name?.charAt(0) || 'U'}
                              </div>
                              <span>{u.name}</span>
                              {(u._id === currentUser?._id || u._id === currentUser?.id) && (
                                <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                                  YOU
                                </span>
                              )}
                            </td>
                            <td className="p-4 font-mono text-slate-400">{u.email}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-1 rounded text-[10px] font-bold border ${ROLE_COLORS[u.role] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                                {u.role === 'Admin' && <ShieldCheck size={10} className="inline mr-1" />}
                                {u.role === 'Partner' && <Briefcase size={10} className="inline mr-1" />}
                                {u.role === 'Staff' && <UserCheck size={10} className="inline mr-1" />}
                                {u.role}
                              </span>
                            </td>
                            <td className="p-4 text-slate-400 font-medium">
                              {u.partnerName || <span className="text-slate-600 italic">—</span>}
                            </td>
                            <td className="p-4 text-center text-slate-500">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center space-x-2">
                                <button
                                  onClick={() => openEditUserModal(u)}
                                  className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg border border-indigo-500/30 transition-all font-bold flex items-center space-x-1"
                                >
                                  <Pencil size={12} />
                                  <span>Edit</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteUser(u)}
                                  disabled={deletingUserId === u._id || u._id === currentUser?._id || u._id === currentUser?.id}
                                  className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg border border-rose-500/30 transition-all font-bold flex items-center space-x-1 disabled:opacity-40"
                                >
                                  {deletingUserId === u._id ? (
                                    <Loader2 size={12} className="animate-spin" />
                                  ) : (
                                    <Trash2 size={12} />
                                  )}
                                  <span>Delete</span>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── BACKUP & RESTORE TAB ── */}
      {activeTab === 'backup' && (
        <div className="space-y-5">
          {!isAdmin ? (
            <div className="glass-panel p-8 rounded-3xl border border-rose-500/30 text-center">
              <ShieldCheck className="w-10 h-10 text-rose-400 mx-auto mb-3" />
              <h3 className="text-base font-bold text-rose-300">Admin Access Required</h3>
              <p className="text-xs text-slate-400 mt-1">Only Administrators can backup or restore database data.</p>
            </div>
          ) : (
            <>
              {/* Download Backup */}
              <div className="glass-panel p-6 rounded-3xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/30 to-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Download size={18} className="text-emerald-400" />
                    <span>Export JSON Database Backup</span>
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md">
                    Download a complete snapshot of your ERP data including settings, machinery master, sales ledger, partner ledger, and customer records.
                  </p>
                </div>
                <button
                  onClick={handleBackup}
                  className="px-5 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center space-x-2 whitespace-nowrap"
                >
                  <Download size={16} />
                  <span>{t('backup')}</span>
                </button>
              </div>

              {/* Restore */}
              <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/20 to-slate-900 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Upload size={18} className="text-amber-400" />
                    <span>Restore JSON Database Backup</span>
                  </h3>
                  <p className="text-xs text-slate-400 max-w-md">
                    ⚠️ Warning: Restoring will overwrite existing data. Ensure you have downloaded the latest backup before proceeding.
                  </p>
                </div>
                <button
                  onClick={() => setShowRestoreModal(true)}
                  className="px-5 py-3 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-2xl shadow-lg shadow-amber-600/30 flex items-center space-x-2 whitespace-nowrap"
                >
                  <Upload size={16} />
                  <span>{t('restore')}</span>
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── CREATE / EDIT USER MODAL ── */}
      {showUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl border border-slate-800 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <KeyRound size={16} className="text-indigo-400" />
                <span>{editingUser ? `Edit User: ${editingUser.name}` : 'Create New User Account'}</span>
              </h3>
              <button onClick={() => setShowUserModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kamal Perera"
                  value={userForm.name}
                  onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-medium"
                />
              </div>

              {!editingUser && (
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="user@anujayaglobal.lk"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono"
                  />
                </div>
              )}

              {!editingUser && (
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Password *</label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="Minimum 6 characters"
                      value={userForm.password}
                      onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                      className="w-full px-3 py-2 pr-10 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                    </button>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">System Role *</label>
                <select
                  value={userForm.role}
                  onChange={(e) => setUserForm({ ...userForm, role: e.target.value, partnerName: '' })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-bold"
                >
                  <option value="Admin">Admin (Full Access)</option>
                  <option value="Partner">Partner (Equity Access)</option>
                  <option value="Staff">Staff (Operational)</option>
                  <option value="Client">Client (Portal Only)</option>
                </select>
              </div>

              {userForm.role === 'Partner' && (
                <div>
                  <label className="block text-slate-400 font-bold uppercase mb-1">Partner Company</label>
                  <select
                    value={userForm.partnerName}
                    onChange={(e) => setUserForm({ ...userForm, partnerName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
                  >
                    <option value="">Select Partner</option>
                    <option value="Anujaya">Anujaya Enterprises</option>
                    <option value="Global">Global Enterprises</option>
                  </select>
                </div>
              )}

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 space-y-1">
                <p className="font-bold text-slate-300">Role Permissions:</p>
                <p>• <strong className="text-indigo-300">Admin</strong>: Full access to all modules, settings, and user management</p>
                <p>• <strong className="text-amber-300">Partner</strong>: Access to equity dashboard, sales, machinery, and reports</p>
                <p>• <strong className="text-sky-300">Staff</strong>: Access to core operational modules (no settings/finance)</p>
                <p>• <strong className="text-emerald-300">Client</strong>: Portal-only access for equipment and service requests</p>
              </div>

              <div className="flex justify-end space-x-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUserModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={userSubmitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
                >
                  {userSubmitting ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle2 size={14} />}
                  <span>{userSubmitting ? 'Saving...' : editingUser ? 'Update User' : 'Create Account'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Restore JSON Modal */}
      {showRestoreModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <FileJson size={18} className="text-indigo-400" />
                <span>Restore Database JSON Backup</span>
              </h3>
              <button onClick={() => setShowRestoreModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <div className="p-3 rounded-xl bg-amber-900/20 border border-amber-500/30 flex items-start space-x-2">
              <AlertTriangle size={14} className="text-amber-400 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-300">
                Warning: This will overwrite existing data. This action cannot be undone. Ensure you have a current backup before proceeding.
              </p>
            </div>

            <textarea
              rows={8}
              placeholder="Paste JSON backup payload here..."
              value={restoreText}
              onChange={(e) => setRestoreText(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowRestoreModal(false)}
                className="px-4 py-2 text-slate-400 hover:text-white text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRestore}
                disabled={restoring || !restoreText.trim()}
                className="px-5 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-600/30"
              >
                {restoring ? 'Restoring...' : 'Restore System'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;

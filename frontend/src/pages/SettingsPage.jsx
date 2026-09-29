import React, { useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService';
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
  X
} from 'lucide-react';

const SettingsPage = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recalculatingRate, setRecalculatingRate] = useState(false);

  // Restore Modal
  const [showRestoreModal, setShowRestoreModal] = useState(false);
  const [restoreText, setRestoreText] = useState('');
  const [restoring, setRestoring] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsService.getSettings();
      if (res.data) {
        setSettings(res.data);
      }
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
        alert(res.message);
        loadSettings();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating settings');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateExchangeRate = async () => {
    const rate = prompt('Enter New Global USD-to-LKR Exchange Rate Anchor:', settings.usdToLkrRate || 330);
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-3">
            <Settings className="text-indigo-400" />
            <span>{t('settings')}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Global USD exchange rate anchor, consortium partner equity split percentages, and JSON backup/restore.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleBackup}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center space-x-1.5"
          >
            <Download size={14} />
            <span>{t('backup')}</span>
          </button>

          <button
            onClick={() => setShowRestoreModal(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center space-x-1.5"
          >
            <Upload size={14} />
            <span>{t('restore')}</span>
          </button>
        </div>
      </div>

      {loading || !settings ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : (
        <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
          {/* Live Exchange Rate Sync Anchor Box */}
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

              <button
                type="button"
                onClick={handleUpdateExchangeRate}
                disabled={recalculatingRate}
                className="px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-600/30 flex items-center space-x-2"
              >
                <RefreshCw size={16} className={recalculatingRate ? 'animate-spin' : ''} />
                <span>Update Exchange Rate</span>
              </button>
            </div>
          </div>

          {/* Consortium Profile & Tax Details */}
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
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">Consortium Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">VAT Number</label>
                <input
                  type="text"
                  value={settings.taxDetails?.vatNumber || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      taxDetails: { ...settings.taxDetails, vatNumber: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-400 uppercase font-bold mb-1">SVAT Number</label>
                <input
                  type="text"
                  value={settings.taxDetails?.svatNumber || ''}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      taxDetails: { ...settings.taxDetails, svatNumber: e.target.value }
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono"
                />
              </div>
            </div>
          </div>

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
        </form>
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
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30"
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

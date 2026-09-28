import React, { useState, useEffect } from 'react';
import { settingsService } from '../services/settingsService';
import { useAuth } from '../context/AuthContext';
import { Building2, Save, Check, Loader2, ShieldAlert, Receipt, Globe, Phone, Mail, FileText } from 'lucide-react';

const SettingsPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    phone: '',
    email: '',
    registrationNumber: '',
    logoUrl: '',
    taxDetails: {
      taxId: '',
      vatNumber: '',
      taxRatePercentage: 18
    }
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await settingsService.getSettings();
      if (res.success && res.data) {
        setFormData({
          companyName: res.data.companyName || '',
          address: res.data.address || '',
          phone: res.data.phone || '',
          email: res.data.email || '',
          registrationNumber: res.data.registrationNumber || '',
          logoUrl: res.data.logoUrl || '',
          taxDetails: {
            taxId: res.data.taxDetails?.taxId || '',
            vatNumber: res.data.taxDetails?.vatNumber || '',
            taxRatePercentage: res.data.taxDetails?.taxRatePercentage ?? 18
          }
        });
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to load company settings.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('taxDetails.')) {
      const field = name.split('.')[1];
      setFormData((prev) => ({
        ...prev,
        taxDetails: {
          ...prev.taxDetails,
          [field]: field === 'taxRatePercentage' ? Number(value) : value
        }
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');
    setSaving(true);

    try {
      const res = await settingsService.updateSettings(formData);
      if (res.success) {
        setSuccessMessage('Company details updated successfully!');
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'Failed to update settings. Admin access required.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-3">
            <Building2 className="text-indigo-400" />
            <span>Company Global Settings</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Configure business identity, registration numbers, and tax parameters for agreements and invoices.
          </p>
        </div>

        {user?.role === 'Admin' ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Check size={14} className="mr-1" /> Admin Edit Access
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <ShieldAlert size={14} className="mr-1" /> View Only (Staff)
          </span>
        )}
      </div>

      {/* Notifications */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm flex items-center space-x-3">
          <Check className="w-5 h-5 text-emerald-400 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-sm flex items-center space-x-3">
          <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Company Profile Section */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center space-x-2 text-indigo-400 border-b border-slate-800 pb-3">
            <Building2 size={18} />
            <h2 className="font-semibold text-slate-200">Business Identity & Contact</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                Company Name
              </label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                disabled={user?.role !== 'Admin'}
                required
                className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                Registration Number (PV No)
              </label>
              <div className="relative">
                <FileText size={16} className="absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  name="registrationNumber"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  disabled={user?.role !== 'Admin'}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                Phone Contact
              </label>
              <div className="relative">
                <Phone size={16} className="absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={user?.role !== 'Admin'}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                Official Email
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={user?.role !== 'Admin'}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                Office / Workshop Address
              </label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                disabled={user?.role !== 'Admin'}
                className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                Company Logo URL
              </label>
              <div className="relative">
                <Globe size={16} className="absolute left-3.5 top-3 text-slate-500" />
                <input
                  type="url"
                  name="logoUrl"
                  value={formData.logoUrl}
                  onChange={handleChange}
                  disabled={user?.role !== 'Admin'}
                  placeholder="https://example.com/logo.png"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Tax & Financial Details Section */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <div className="flex items-center space-x-2 text-indigo-400 border-b border-slate-800 pb-3">
            <Receipt size={18} />
            <h2 className="font-semibold text-slate-200">Tax & Invoice Parameters</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                Tax Identification Number (TIN)
              </label>
              <input
                type="text"
                name="taxDetails.taxId"
                value={formData.taxDetails.taxId}
                onChange={handleChange}
                disabled={user?.role !== 'Admin'}
                className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                VAT Registration Number
              </label>
              <input
                type="text"
                name="taxDetails.vatNumber"
                value={formData.taxDetails.vatNumber}
                onChange={handleChange}
                disabled={user?.role !== 'Admin'}
                className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 uppercase tracking-wider mb-2">
                Default Tax Rate (%)
              </label>
              <input
                type="number"
                name="taxDetails.taxRatePercentage"
                value={formData.taxDetails.taxRatePercentage}
                onChange={handleChange}
                disabled={user?.role !== 'Admin'}
                min="0"
                max="100"
                className="w-full px-4 py-2.5 bg-slate-900/90 border border-slate-700 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60"
              />
            </div>
          </div>
        </div>

        {/* Action Button */}
        {user?.role === 'Admin' && (
          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm rounded-xl shadow-lg shadow-indigo-600/30 flex items-center space-x-2 transition-all disabled:opacity-50"
            >
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving Settings...</span>
                </>
              ) : (
                <>
                  <Save size={16} />
                  <span>Save Settings Changes</span>
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default SettingsPage;

import React, { useState, useEffect } from 'react';
import { machineService } from '../services/machineService';
import { settingsService } from '../services/settingsService';
import { useLanguage } from '../context/LanguageContext';
import {
  Cpu,
  Plus,
  Search,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Download,
  Upload,
  RefreshCw,
  Calculator,
  Eye,
  X,
  FileSpreadsheet,
  Globe,
  Tag,
  DollarSign,
  Pencil,
  Trash2
} from 'lucide-react';

const InventoryPage = () => {
  const { t } = useLanguage();
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [partnerFilter, setPartnerFilter] = useState('');

  // Live Exchange Rate Anchor state
  const [usdRate, setUsdRate] = useState(330);
  const [updatingRate, setUpdatingRate] = useState(false);

  // Add / Edit Machine Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // CSV Import Modal state
  const [showImportModal, setShowImportModal] = useState(false);
  const [csvJsonText, setCsvJsonText] = useState('');
  const [importing, setImporting] = useState(false);

  // Machine Form Data with complete field persistence
  const [formData, setFormData] = useState({
    sku: '',
    brand: 'Juki',
    model: '',
    modelSpecs: '',
    initialBatchSets: 1,
    unit: 'Set',
    fobUsd: 0,
    customsDutyLkr: 0,
    wholesaleBenchmarkLkr: 0,
    retailBenchmarkLkr: 0,
    serialNumbers: '',
    partnerShare: 'Consortium',
    status: 'Available'
  });

  useEffect(() => {
    fetchSettings();
    loadMachines();
  }, [searchQuery, statusFilter, partnerFilter]);

  const fetchSettings = async () => {
    try {
      const res = await settingsService.getSettings();
      if (res.data?.usdToLkrRate) {
        setUsdRate(res.data.usdToLkrRate);
      }
    } catch (err) {
      console.error('Error fetching exchange rate:', err);
    }
  };

  const loadMachines = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (partnerFilter) filters.partnerShare = partnerFilter;
      if (searchQuery) filters.q = searchQuery;

      const res = await machineService.getMachines(filters);
      if (res.success) {
        setMachines(res.data);
      }
    } catch (err) {
      console.error('Error loading machines:', err);
    } finally {
      setLoading(false);
    }
  };

  // Live USD Exchange Rate sync handler
  const handleUpdateExchangeRate = async () => {
    const newRate = prompt('Enter new USD-to-LKR Exchange Rate Anchor:', usdRate);
    if (!newRate || isNaN(newRate)) return;

    try {
      setUpdatingRate(true);
      const res = await settingsService.updateExchangeRate(Number(newRate));
      if (res.success) {
        setUsdRate(Number(newRate));
        alert(res.message);
        loadMachines();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating exchange rate');
    } finally {
      setUpdatingRate(false);
    }
  };

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({
      sku: '',
      brand: 'Juki',
      model: '',
      modelSpecs: '',
      initialBatchSets: 1,
      unit: 'Set',
      fobUsd: 0,
      customsDutyLkr: 0,
      wholesaleBenchmarkLkr: 0,
      retailBenchmarkLkr: 0,
      serialNumbers: '',
      partnerShare: 'Consortium',
      status: 'Available'
    });
    setShowAddModal(true);
  };

  const handleOpenEditModal = (machine) => {
    setEditingId(machine._id);
    setFormData({
      sku: machine.sku || '',
      brand: machine.brand || 'Juki',
      model: machine.model || '',
      modelSpecs: machine.modelSpecs || '',
      initialBatchSets: machine.initialBatchSets || 1,
      unit: machine.unit || 'Set',
      fobUsd: machine.fobUsd || 0,
      customsDutyLkr: machine.customsDutyLkr || 0,
      wholesaleBenchmarkLkr: machine.wholesaleBenchmarkLkr || 0,
      retailBenchmarkLkr: machine.retailBenchmarkLkr || 0,
      serialNumbers: Array.isArray(machine.serialNumbers)
        ? machine.serialNumbers.join(', ')
        : machine.serialNumber || '',
      partnerShare: machine.partnerShare || 'Consortium',
      status: machine.status || 'Available'
    });
    setShowAddModal(true);
  };

  const handleSaveMachine = async (e) => {
    e.preventDefault();
    if (!formData.model) {
      alert('Machine Model is required.');
      return;
    }

    try {
      setSubmitting(true);
      let res;
      if (editingId) {
        res = await machineService.updateMachine(editingId, formData);
      } else {
        res = await machineService.createMachine(formData);
      }

      if (res.success) {
        setShowAddModal(false);
        setEditingId(null);
        alert(res.message);
        loadMachines();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving machine details');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMachine = async (machine) => {
    if (
      !window.confirm(
        `Are you sure you want to delete Equipment SKU '${machine.sku}' (${machine.brand} ${machine.model})?`
      )
    ) {
      return;
    }

    try {
      setDeletingId(machine._id);
      const res = await machineService.deleteMachine(machine._id);
      if (res.success) {
        alert(res.message);
        loadMachines();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting equipment SKU');
    } finally {
      setDeletingId(null);
    }
  };

  // CSV Export trigger
  const handleExportCsv = async () => {
    try {
      const blob = await machineService.exportCsv();
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `MachineryMaster_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Error exporting CSV file');
    }
  };

  // CSV / JSON Import handler
  const handleImportCsv = async () => {
    try {
      setImporting(true);
      let items = [];
      try {
        items = JSON.parse(csvJsonText);
      } catch (e) {
        alert('Please paste a valid JSON array of inventory items.');
        setImporting(false);
        return;
      }

      const res = await machineService.importCsv(items);
      if (res.success) {
        alert(res.message);
        setShowImportModal(false);
        setCsvJsonText('');
        loadMachines();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error importing inventory');
    } finally {
      setImporting(false);
    }
  };

  // Landed Cost preview calculation
  const landedCostPreview = Math.round(
    (Number(formData.fobUsd) || 0) * usdRate + (Number(formData.customsDutyLkr) || 0)
  );

  return (
    <div className="space-y-6">
      {/* Header & Live Exchange Rate Anchor Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-3">
            <Cpu className="text-indigo-400" />
            <span>{t('machineryMaster')}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Complete field persistence: SKUs, FOB USD, Customs duty, landed costs, wholesale & retail benchmarks.
          </p>
        </div>

        <div className="flex items-center space-x-3 flex-wrap gap-2">
          {/* Live Exchange Rate Sync Banner */}
          <button
            onClick={handleUpdateExchangeRate}
            disabled={updatingRate}
            className="px-3.5 py-2 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/30 rounded-xl text-xs font-bold flex items-center space-x-2 transition-all"
          >
            <RefreshCw size={14} className={updatingRate ? 'animate-spin' : ''} />
            <span>
              USD Anchor: <strong className="text-amber-400">1 USD = {usdRate} LKR</strong>
            </span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center space-x-1.5"
          >
            <Download size={14} />
            <span>{t('exportCsv')}</span>
          </button>

          <button
            onClick={() => setShowImportModal(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center space-x-1.5"
          >
            <Upload size={14} />
            <span>{t('importCsv')}</span>
          </button>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5"
          >
            <Plus size={16} />
            <span>{t('addMachine')}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3.5 top-2.5 text-slate-500" size={16} />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="Available">Available</option>
            <option value="Low Stock">Low Stock</option>
            <option value="Out of Stock">Out of Stock</option>
            <option value="Rented">Rented</option>
          </select>

          <select
            value={partnerFilter}
            onChange={(e) => setPartnerFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Shareholdings</option>
            <option value="Consortium">Consortium 50/50</option>
            <option value="Anujaya">Anujaya Enterprises</option>
            <option value="Global">Global Enterprises</option>
          </select>
        </div>
      </div>

      {/* Machinery Master Inventory Table */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : machines.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center border border-slate-800">
          <Cpu className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">No machinery matching criteria</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click "Register Equipment SKU" to create new inventory items with complete field persistence.
          </p>
        </div>
      ) : (
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 text-slate-400 font-bold uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="p-4">SKU / Model</th>
                  <th className="p-4">Brand & Specs</th>
                  <th className="p-4 text-center">Batch / Available</th>
                  <th className="p-4 text-right">FOB USD</th>
                  <th className="p-4 text-right">Landed Cost (LKR)</th>
                  <th className="p-4 text-right">Wholesale / Retail</th>
                  <th className="p-4 text-center">Shareholding</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {machines.map((machine) => (
                  <tr key={machine._id} className="hover:bg-slate-900/40 transition-all">
                    <td className="p-4 font-bold text-white">
                      <span className="px-2 py-0.5 rounded text-[10px] bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 block w-max mb-1">
                        {machine.sku}
                      </span>
                      {machine.model}
                    </td>
                    <td className="p-4 font-sans">
                      <p className="font-semibold text-slate-200">{machine.brand}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-xs">
                        {machine.modelSpecs || 'Industrial Sewing Equipment'}
                      </p>
                    </td>
                    <td className="p-4 text-center font-bold">
                      <span className="text-emerald-400">{machine.availableSets}</span> /{' '}
                      <span className="text-slate-400">{machine.initialBatchSets} {machine.unit || 'Set'}</span>
                    </td>
                    <td className="p-4 text-right font-bold text-sky-400">
                      ${(machine.fobUsd || 0).toLocaleString()}
                    </td>
                    <td className="p-4 text-right font-extrabold text-amber-400">
                      LKR {(machine.landedCostLkr || 0).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <p className="text-slate-300">W: LKR {(machine.wholesaleBenchmarkLkr || 0).toLocaleString()}</p>
                      <p className="text-indigo-400 font-bold">R: LKR {(machine.retailBenchmarkLkr || 0).toLocaleString()}</p>
                    </td>
                    <td className="p-4 text-center font-sans">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-800 text-indigo-300 border border-slate-700">
                        {machine.partnerShare}
                      </span>
                    </td>
                    <td className="p-4 text-center font-sans">
                      {machine.status === 'Available' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                          Available
                        </span>
                      )}
                      {machine.status === 'Low Stock' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                          Low Stock
                        </span>
                      )}
                      {machine.status === 'Out of Stock' && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                          Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center font-sans">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleOpenEditModal(machine)}
                          className="px-2.5 py-1 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white rounded-lg border border-indigo-500/30 transition-all font-bold flex items-center space-x-1"
                          title="Edit Equipment SKU"
                        >
                          <Pencil size={13} />
                          <span>Edit</span>
                        </button>
                        <button
                          onClick={() => handleDeleteMachine(machine)}
                          disabled={deletingId === machine._id}
                          className="px-2.5 py-1 bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white rounded-lg border border-rose-500/30 transition-all font-bold flex items-center space-x-1 disabled:opacity-50"
                          title="Delete Equipment SKU"
                        >
                          {deletingId === machine._id ? (
                            <Loader2 size={13} className="animate-spin" />
                          ) : (
                            <Trash2 size={13} />
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

      {/* Add / Edit Equipment Modal with complete field persistence */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editingId ? 'Edit Equipment SKU in Machinery Master' : 'Register Equipment SKU in Machinery Master'}
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveMachine} className="space-y-4 text-xs">
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">SKU Code *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. JK-DDL-8700"
                    value={formData.sku}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Brand *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Juki"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DDL-8700"
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Model Specifications</label>
                <input
                  type="text"
                  placeholder="e.g. Single Needle High Speed Lockstitch Machine"
                  value={formData.modelSpecs}
                  onChange={(e) => setFormData({ ...formData, modelSpecs: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Initial Batch Sets</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.initialBatchSets}
                    onChange={(e) => setFormData({ ...formData, initialBatchSets: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Unit</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
                  >
                    <option value="Set">Set</option>
                    <option value="Pcs">Pcs</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Partner Shareholding</label>
                  <select
                    value={formData.partnerShare}
                    onChange={(e) => setFormData({ ...formData, partnerShare: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
                  >
                    <option value="Consortium">Consortium 50/50</option>
                    <option value="Anujaya">Anujaya Enterprises</option>
                    <option value="Global">Global Enterprises</option>
                  </select>
                </div>
              </div>

              {/* FOB & Duty Landed Cost Live Preview */}
              <div className="p-4 rounded-2xl bg-indigo-950/30 border border-indigo-500/30 space-y-3">
                <div className="flex items-center space-x-2 text-indigo-300 font-bold">
                  <Calculator size={14} />
                  <span>Costing & Margin Benchmarks (1 USD = {usdRate} LKR)</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-slate-400">Factory FOB (USD)</label>
                    <input
                      type="number"
                      value={formData.fobUsd}
                      onChange={(e) => setFormData({ ...formData, fobUsd: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400">Customs Duty (LKR)</label>
                    <input
                      type="number"
                      value={formData.customsDutyLkr}
                      onChange={(e) => setFormData({ ...formData, customsDutyLkr: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400">Calculated Landed Cost</label>
                    <div className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-amber-400 font-extrabold font-mono">
                      LKR {landedCostPreview.toLocaleString()}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-slate-400">Wholesale Benchmark (LKR)</label>
                    <input
                      type="number"
                      placeholder={`Est: LKR ${Math.round(landedCostPreview * 1.25).toLocaleString()}`}
                      value={formData.wholesaleBenchmarkLkr}
                      onChange={(e) => setFormData({ ...formData, wholesaleBenchmarkLkr: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400">Retail Benchmark (LKR)</label>
                    <input
                      type="number"
                      placeholder={`Est: LKR ${Math.round(landedCostPreview * 1.45).toLocaleString()}`}
                      value={formData.retailBenchmarkLkr}
                      onChange={(e) => setFormData({ ...formData, retailBenchmarkLkr: Number(e.target.value) })}
                      className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Initial Tracked Serials (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="SN-8700-01, SN-8700-02, SN-8700-03..."
                  value={formData.serialNumbers}
                  onChange={(e) => setFormData({ ...formData, serialNumbers: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30"
                >
                  {submitting ? 'Saving...' : editingId ? 'Update Equipment SKU' : 'Save Equipment SKU'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CSV / JSON Import Modal */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-xl w-full p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center space-x-2">
                <FileSpreadsheet size={18} className="text-indigo-400" />
                <span>Import Inventory Items (JSON Array)</span>
              </h3>
              <button onClick={() => setShowImportModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Paste JSON array of inventory items with fields: <code>sku, brand, model, fobUsd, customsDutyLkr</code>.
            </p>

            <textarea
              rows={8}
              placeholder={`[\n  {\n    "sku": "JK-DDL-8700",\n    "brand": "Juki",\n    "model": "DDL-8700",\n    "fobUsd": 420,\n    "customsDutyLkr": 18500\n  }\n]`}
              value={csvJsonText}
              onChange={(e) => setCsvJsonText(e.target.value)}
              className="w-full p-3 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />

            <div className="flex justify-end space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setShowImportModal(false)}
                className="px-4 py-2 text-slate-400 hover:text-white text-xs font-medium"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleImportCsv}
                disabled={importing || !csvJsonText.trim()}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 disabled:opacity-50"
              >
                {importing ? 'Importing...' : 'Import Data'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;

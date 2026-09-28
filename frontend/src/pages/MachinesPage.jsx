import React, { useState, useEffect } from 'react';
import { machineService } from '../services/machineService';
import { rentalService } from '../services/rentalService';
import {
  Cpu,
  Plus,
  Search,
  Loader2,
  CheckCircle2,
  Clock,
  Wrench,
  ShieldX,
  Globe,
  Tag,
  DollarSign,
  Building,
  RotateCcw,
  X,
  Eye,
  Calculator,
  UserCheck
} from 'lucide-react';

const MachinesPage = () => {
  const [machines, setMachines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  
  // Serial search lookup modal
  const [serialSearchInput, setSerialSearchInput] = useState('');
  const [serialLookupData, setSerialLookupData] = useState(null);
  const [searchingSerial, setSearchingSerial] = useState(false);
  const [showSerialModal, setShowSerialModal] = useState(false);

  // Add / Edit Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [returningId, setReturningId] = useState(null);

  const [formData, setFormData] = useState({
    serialNumber: '',
    brand: 'Juki',
    model: '',
    status: 'Available',
    isPartnerMachine: false,
    partnerDetails: { partnerName: '', partnerRentCost: 0 },
    sourceType: 'Local',
    importDetails: { shippingCost: 0, taxCost: 0, customDuty: 0 }
  });

  useEffect(() => {
    loadMachines();
  }, [searchQuery, statusFilter, sourceFilter]);

  const loadMachines = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (statusFilter) filters.status = statusFilter;
      if (sourceFilter) filters.sourceType = sourceFilter;
      if (searchQuery) filters.q = searchQuery;

      const res = await machineService.getMachines(filters);
      if (res.success) {
        setMachines(res.data);
      }
    } catch (err) {
      console.error('Error fetching machines:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSerialSearch = async (e) => {
    e.preventDefault();
    if (!serialSearchInput.trim()) return;

    try {
      setSearchingSerial(true);
      const res = await machineService.searchBySerialNumber(serialSearchInput.trim());
      if (res.success) {
        setSerialLookupData(res.data);
        setShowSerialModal(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || `Serial number '${serialSearchInput}' not found.`);
    } finally {
      setSearchingSerial(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.serialNumber || !formData.model) {
      alert('Serial Number and Model are required.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await machineService.createMachine(formData);
      if (res.success) {
        setShowAddModal(false);
        setFormData({
          serialNumber: '',
          brand: 'Juki',
          model: '',
          status: 'Available',
          isPartnerMachine: false,
          partnerDetails: { partnerName: '', partnerRentCost: 0 },
          sourceType: 'Local',
          importDetails: { shippingCost: 0, taxCost: 0, customDuty: 0 }
        });
        loadMachines();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error registering machine');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturnMachine = async (machine) => {
    // Find active rental associated with machine
    try {
      setReturningId(machine._id);
      // Fetch machine profile with active rental
      const res = await machineService.getMachineById(machine._id);
      if (res.success && res.data.activeRental) {
        const rentalId = res.data.activeRental._id;
        const returnRes = await rentalService.returnRental(rentalId);
        if (returnRes.success) {
          alert(`Success: ${returnRes.message}`);
          loadMachines();
        }
      } else {
        alert('No active rental record found for this machine.');
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing machine return');
    } finally {
      setReturningId(null);
    }
  };

  // Dynamic Landing Cost calculation preview
  const landingCostPreview =
    (Number(formData.importDetails.shippingCost) || 0) +
    (Number(formData.importDetails.taxCost) || 0) +
    (Number(formData.importDetails.customDuty) || 0);

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Available':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={12} className="mr-1" /> Available
          </span>
        );
      case 'Rented':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Clock size={12} className="mr-1" /> Rented
          </span>
        );
      case 'Maintenance':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Wrench size={12} className="mr-1" /> Maintenance
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-sky-500/10 text-sky-400 border border-sky-500/20">
            <Building size={12} className="mr-1" /> Partner Allocated
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-3">
            <Cpu className="text-indigo-400" />
            <span>Machine Inventory & Landing Cost Manager</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Track Juki sewing machines, serial lookup, China import landing duty calculations, and partner sub-lease costs.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all"
          >
            <Plus size={16} />
            <span>Add New Machine</span>
          </button>
        </div>
      </div>

      {/* Instant Serial Number Lookup Bar & General Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Direct Serial Lookup Tool */}
        <div className="lg:col-span-1 glass-card p-4 rounded-2xl border border-indigo-500/30 bg-indigo-950/20">
          <label className="block text-xs font-bold text-indigo-300 uppercase mb-2 flex items-center space-x-1.5">
            <Search size={14} />
            <span>Direct Serial Number Lookup</span>
          </label>
          <form onSubmit={handleSerialSearch} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter S/N e.g. JK-99201..."
              value={serialSearchInput}
              onChange={(e) => setSerialSearchInput(e.target.value)}
              className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
            <button
              type="submit"
              disabled={searchingSerial}
              className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-all disabled:opacity-50"
            >
              {searchingSerial ? <Loader2 size={14} className="animate-spin" /> : 'Lookup'}
            </button>
          </form>
        </div>

        {/* General Search & Filters */}
        <div className="lg:col-span-2 flex flex-col sm:flex-row gap-3 justify-between items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-3 text-slate-500" size={18} />
            <input
              type="text"
              placeholder="Search model, brand, machine ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              <option value="Rented">Rented</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Partner-Allocated">Partner Allocated</option>
            </select>

            <select
              value={sourceFilter}
              onChange={(e) => setSourceFilter(e.target.value)}
              className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Sources</option>
              <option value="Local">Local</option>
              <option value="China">China Import</option>
            </select>
          </div>
        </div>
      </div>

      {/* Machine Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : machines.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center border border-slate-800">
          <Cpu className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">No machines match criteria</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Click "Add New Machine" to insert local, imported, or partner-owned equipment into inventory.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {machines.map((machine) => (
            <div
              key={machine._id}
              className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-indigo-500/30 transition-all space-y-4 relative"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-sky-400 bg-sky-500/10 px-2 py-0.5 rounded border border-sky-500/20">
                    {machine.machineId}
                  </span>
                  <h3 className="font-bold text-slate-100 text-base mt-1.5">
                    {machine.brand} {machine.model}
                  </h3>
                </div>
                {getStatusBadge(machine.status)}
              </div>

              <div className="space-y-2 text-xs text-slate-400 border-t border-slate-800/60 pt-3">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Serial Number:</span>
                  <span className="font-mono text-slate-200 font-bold bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                    {machine.serialNumber}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Origin / Source:</span>
                  <span className="text-slate-300 font-medium">
                    {machine.sourceType === 'China' ? '🇨🇳 China Import' : '🇱🇰 Local'}
                  </span>
                </div>

                {machine.sourceType === 'China' && (
                  <div className="flex items-center justify-between bg-slate-900/60 p-2 rounded-lg text-[11px]">
                    <span className="text-slate-400">Total Landing Cost:</span>
                    <span className="text-amber-400 font-bold">
                      LKR {(machine.importDetails?.totalLandingCost || 0).toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-slate-500">Partner Sub-Lease:</span>
                  {machine.isPartnerMachine ? (
                    <span className="text-purple-400 font-medium truncate max-w-[150px]">
                      {machine.partnerDetails?.partnerName || 'Partner'} (LKR {machine.partnerDetails?.partnerRentCost}/mo)
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-medium">Company Stock</span>
                  )}
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-3 border-t border-slate-800/50 flex items-center justify-between">
                <button
                  onClick={() => {
                    setSerialSearchInput(machine.serialNumber);
                    machineService.searchBySerialNumber(machine.serialNumber).then((res) => {
                      if (res.success) {
                        setSerialLookupData(res.data);
                        setShowSerialModal(true);
                      }
                    });
                  }}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center space-x-1"
                >
                  <Eye size={13} />
                  <span>View History</span>
                </button>

                {machine.status === 'Rented' && (
                  <button
                    onClick={() => handleReturnMachine(machine)}
                    disabled={returningId === machine._id}
                    className="px-3 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl text-xs font-semibold flex items-center space-x-1 transition-all disabled:opacity-50"
                  >
                    {returningId === machine._id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <RotateCcw size={13} />
                    )}
                    <span>Return Machine</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Serial Number Direct Lookup Modal */}
      {showSerialModal && serialLookupData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-xl w-full p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs font-mono text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
                  {serialLookupData.machine.machineId}
                </span>
                <h3 className="text-xl font-bold text-white mt-2">
                  {serialLookupData.machine.brand} {serialLookupData.machine.model}
                </h3>
                <p className="text-xs font-mono text-slate-400 mt-0.5">
                  Serial Number: {serialLookupData.machine.serialNumber}
                </p>
              </div>
              <button onClick={() => setShowSerialModal(false)} className="text-slate-400 hover:text-white">
                <X size={22} />
              </button>
            </div>

            {/* Current Holder Information */}
            <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center space-x-2">
                <UserCheck size={16} className="text-indigo-400" />
                <span>Current Holder / Assignment Status</span>
              </h4>

              {serialLookupData.currentHolder ? (
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-white">{serialLookupData.currentHolder.name}</p>
                    <p className="text-xs text-slate-400">Phone: {serialLookupData.currentHolder.phone}</p>
                  </div>
                  <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-400 rounded-full text-xs font-semibold border border-indigo-500/20">
                    Currently Rented
                  </span>
                </div>
              ) : (
                <p className="text-xs text-emerald-400 font-medium">
                  ✓ Machine is currently in warehouse (Available for Rental).
                </p>
              )}
            </div>

            {/* Complete Rental History */}
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
                Full Machine Rental History ({serialLookupData.rentalHistory.length} Contracts)
              </h4>
              {serialLookupData.rentalHistory.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-4 bg-slate-900/60 rounded-xl text-center border border-slate-800">
                  No previous rentals logged for this unit.
                </p>
              ) : (
                <div className="space-y-3">
                  {serialLookupData.rentalHistory.map((rent) => (
                    <div
                      key={rent._id}
                      className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-mono font-bold text-indigo-400">{rent.rentalId}</span>
                        <p className="text-slate-300 font-medium mt-0.5">{rent.customer?.name || 'Customer'}</p>
                        <p className="text-slate-500 text-[10px]">
                          Started: {new Date(rent.startDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          rent.status === 'Active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {rent.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Machine Form Modal with Local vs China & Partner Toggles */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Register Equipment Unit</h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-sm">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase mb-1">Brand *</label>
                  <input
                    type="text"
                    required
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="e.g. Juki"
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase mb-1">Model *</label>
                  <input
                    type="text"
                    required
                    value={formData.model}
                    onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                    placeholder="e.g. DDL-8700"
                    className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase mb-1">Unique Serial Number *</label>
                <input
                  type="text"
                  required
                  value={formData.serialNumber}
                  onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                  placeholder="e.g. JK-99201982"
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono"
                />
              </div>

              {/* Source Type Toggle: Local vs China */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-slate-300 uppercase">Procurement Source</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, sourceType: 'Local' })}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all border ${
                      formData.sourceType === 'Local'
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    🇱🇰 Local Sourced
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, sourceType: 'China' })}
                    className={`py-2 rounded-xl text-xs font-semibold transition-all border ${
                      formData.sourceType === 'China'
                        ? 'bg-indigo-600 text-white border-indigo-500'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}
                  >
                    🇨🇳 China Import
                  </button>
                </div>

                {/* Dynamic Landing Cost Fields for China Imports */}
                {formData.sourceType === 'China' && (
                  <div className="space-y-3 pt-3 border-t border-slate-800/80">
                    <div className="flex items-center space-x-1.5 text-xs text-amber-400 font-bold">
                      <Calculator size={14} />
                      <span>Import Landing Cost Parameters (LKR)</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400">Shipping Cost</label>
                        <input
                          type="number"
                          value={formData.importDetails.shippingCost}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              importDetails: { ...formData.importDetails, shippingCost: Number(e.target.value) }
                            })
                          }
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400">Tax Cost</label>
                        <input
                          type="number"
                          value={formData.importDetails.taxCost}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              importDetails: { ...formData.importDetails, taxCost: Number(e.target.value) }
                            })
                          }
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400">Custom Duty</label>
                        <input
                          type="number"
                          value={formData.importDetails.customDuty}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              importDetails: { ...formData.importDetails, customDuty: Number(e.target.value) }
                            })
                          }
                          className="w-full px-2.5 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs"
                        />
                      </div>
                    </div>

                    <div className="p-2.5 rounded-xl bg-indigo-950/40 border border-indigo-500/30 flex items-center justify-between text-xs">
                      <span className="text-indigo-300 font-medium">Calculated Total Landing Cost:</span>
                      <span className="text-amber-400 font-extrabold text-sm">
                        LKR {landingCostPreview.toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Partner Machine Option */}
              <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isPartnerMachine}
                    onChange={(e) => setFormData({ ...formData, isPartnerMachine: e.target.checked })}
                    className="w-4 h-4 rounded text-indigo-600 bg-slate-900 border-slate-700"
                  />
                  <span className="text-xs font-semibold text-slate-200">
                    This is a Partner Sub-leased Machine
                  </span>
                </label>

                {formData.isPartnerMachine && (
                  <div className="grid grid-cols-2 gap-3 pt-2">
                    <div>
                      <label className="block text-[11px] text-slate-400">Partner Company Name</label>
                      <input
                        type="text"
                        value={formData.partnerDetails.partnerName}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            partnerDetails: { ...formData.partnerDetails, partnerName: e.target.value }
                          })
                        }
                        placeholder="e.g. Singer Lanka"
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-slate-400">Monthly Partner Rent Cost (LKR)</label>
                      <input
                        type="number"
                        value={formData.partnerDetails.partnerRentCost}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            partnerDetails: { ...formData.partnerDetails, partnerRentCost: Number(e.target.value) }
                          })
                        }
                        placeholder="18000"
                        className="w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-indigo-600/30"
                >
                  {submitting ? 'Registering...' : 'Register Equipment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MachinesPage;

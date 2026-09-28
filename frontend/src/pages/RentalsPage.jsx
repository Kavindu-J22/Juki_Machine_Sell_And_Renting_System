import React, { useState, useEffect } from 'react';
import { rentalService } from '../services/rentalService';
import { customerService } from '../services/customerService';
import { machineService } from '../services/machineService';
import {
  FileText,
  Plus,
  Loader2,
  CheckCircle2,
  Clock,
  RotateCcw,
  Calendar,
  DollarSign,
  UserCheck,
  Cpu,
  X,
  AlertCircle
} from 'lucide-react';

const RentalsPage = () => {
  const [rentals, setRentals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  
  // Create Rental Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [availableMachines, setAvailableMachines] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [returningId, setReturningId] = useState(null);

  const [formData, setFormData] = useState({
    customerId: '',
    machineIds: [],
    startDate: new Date().toISOString().split('T')[0],
    dueDate: '',
    monthlyRentAmount: '',
    depositAmount: 0
  });

  useEffect(() => {
    loadRentals();
  }, [statusFilter]);

  const loadRentals = async () => {
    try {
      setLoading(true);
      const res = await rentalService.getRentals(statusFilter);
      if (res.success) {
        setRentals(res.data);
      }
    } catch (err) {
      console.error('Error fetching rentals:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreateModal = async () => {
    try {
      // Fetch customers & available machines
      const custRes = await customerService.getCustomers('', 'Active');
      const macRes = await machineService.getMachines({ status: 'Available' });

      if (custRes.success) setCustomers(custRes.data);
      if (macRes.success) setAvailableMachines(macRes.data);

      // Default due date to +30 days
      const d = new Date();
      d.setDate(d.getDate() + 30);
      const defaultDue = d.toISOString().split('T')[0];

      setFormData({
        customerId: '',
        machineIds: [],
        startDate: new Date().toISOString().split('T')[0],
        dueDate: defaultDue,
        monthlyRentAmount: '',
        depositAmount: 0
      });

      setShowCreateModal(true);
    } catch (err) {
      alert('Error fetching customer or machine lists');
    }
  };

  const handleMachineToggle = (machineId) => {
    setFormData((prev) => {
      const exists = prev.machineIds.includes(machineId);
      const updated = exists
        ? prev.machineIds.filter((id) => id !== machineId)
        : [...prev.machineIds, machineId];
      return { ...prev, machineIds: updated };
    });
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!formData.customerId || !formData.machineIds.length || !formData.dueDate || !formData.monthlyRentAmount) {
      alert('Please fill in Customer, select at least one Machine, Due Date, and Monthly Rent Amount.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await rentalService.createRental(formData);
      if (res.success) {
        setShowCreateModal(false);
        loadRentals();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error creating rental contract');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReturn = async (rentalId) => {
    if (!window.confirm('Are you sure you want to mark this rental contract as RETURNED and restore assigned machines to available inventory?')) {
      return;
    }

    try {
      setReturningId(rentalId);
      const res = await rentalService.returnRental(rentalId);
      if (res.success) {
        alert(res.message);
        loadRentals();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error returning rental');
    } finally {
      setReturningId(null);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Clock size={12} className="mr-1" /> Active Rental
          </span>
        );
      case 'Returned':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            <CheckCircle2 size={12} className="mr-1" /> Returned
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertCircle size={12} className="mr-1" /> Overdue
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
            <FileText className="text-indigo-400" />
            <span>Rental Contracts & Equipment Assignments</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Assign Juki sewing machines to garment clients, manage monthly billing rates, deposits, and process returns.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all"
        >
          <Plus size={16} />
          <span>New Rental Contract</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2">
        {['', 'Active', 'Returned', 'Overdue'].map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
              statusFilter === status
                ? 'bg-indigo-600 text-white font-semibold'
                : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
            }`}
          >
            {status === '' ? 'All Contracts' : status}
          </button>
        ))}
      </div>

      {/* Rentals List */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : rentals.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center border border-slate-800">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">No rental contracts found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Click "New Rental Contract" to pair an available machine with a registered customer.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {rentals.map((rental) => (
            <div
              key={rental._id}
              className="glass-panel p-6 rounded-3xl border border-slate-800/80 hover:border-indigo-500/30 transition-all space-y-4"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
                    {rental.rentalId}
                  </span>
                  <h3 className="font-bold text-slate-100 text-lg mt-2 flex items-center space-x-2">
                    <UserCheck size={18} className="text-indigo-400" />
                    <span>{rental.customer?.name || 'Customer'}</span>
                  </h3>
                  <p className="text-xs text-slate-400">Phone: {rental.customer?.phone}</p>
                </div>
                {getStatusBadge(rental.status)}
              </div>

              {/* Assigned Machines */}
              <div className="p-3 bg-slate-900/90 rounded-2xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
                  <Cpu size={13} className="text-indigo-400" />
                  <span>Assigned Machines ({rental.machines?.length || 0})</span>
                </span>
                <div className="flex flex-wrap gap-2">
                  {rental.machines?.map((mac) => (
                    <span
                      key={mac._id}
                      className="px-2.5 py-1 bg-slate-800 text-slate-200 rounded-lg text-xs font-medium border border-slate-700 flex items-center space-x-1.5"
                    >
                      <span className="font-bold text-white">{mac.brand} {mac.model}</span>
                      <span className="text-indigo-400 font-mono text-[11px]">({mac.serialNumber})</span>
                    </span>
                  ))}
                </div>
              </div>

              {/* Financial & Contract Timeline Details */}
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-300 bg-slate-900/40 p-3 rounded-2xl border border-slate-800/60">
                <div>
                  <span className="text-slate-500 block">Monthly Rate</span>
                  <span className="text-indigo-400 font-bold text-sm">
                    LKR {(rental.monthlyRentAmount || 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Security Deposit</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    LKR {(rental.depositAmount || 0).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Start Date</span>
                  <span className="font-mono text-slate-200">
                    {new Date(rental.startDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block">Due Date</span>
                  <span className="font-mono text-slate-200">
                    {new Date(rental.dueDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              {/* Action Button */}
              {rental.status === 'Active' && (
                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => handleReturn(rental._id)}
                    disabled={returningId === rental._id}
                    className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 font-semibold text-xs rounded-xl flex items-center space-x-1.5 transition-all disabled:opacity-50"
                  >
                    {returningId === rental._id ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <RotateCcw size={14} />
                    )}
                    <span>Execute Machine Return</span>
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Create Rental Contract Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-lg w-full p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Create Rental Contract</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-sm">
              {/* Select Customer */}
              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase mb-1">
                  Select Customer / Factory *
                </label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.phone}) - {c.customerId}
                    </option>
                  ))}
                </select>
              </div>

              {/* Select Available Machines */}
              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase mb-1">
                  Select Available Machine(s) * ({formData.machineIds.length} selected)
                </label>
                {availableMachines.length === 0 ? (
                  <p className="text-xs text-rose-400 italic p-3 bg-rose-500/10 rounded-xl border border-rose-500/20">
                    No available machines in warehouse stock! Register new machines or return existing ones first.
                  </p>
                ) : (
                  <div className="max-h-36 overflow-y-auto p-2 bg-slate-900 border border-slate-700 rounded-xl space-y-1.5">
                    {availableMachines.map((m) => (
                      <label
                        key={m._id}
                        className={`flex items-center justify-between p-2 rounded-lg cursor-pointer transition-colors ${
                          formData.machineIds.includes(m._id)
                            ? 'bg-indigo-600/30 border border-indigo-500/50 text-white'
                            : 'hover:bg-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.machineIds.includes(m._id)}
                            onChange={() => handleMachineToggle(m._id)}
                            className="rounded text-indigo-600 bg-slate-950 border-slate-700"
                          />
                          <span className="font-bold text-xs">{m.brand} {m.model}</span>
                        </div>
                        <span className="text-[11px] font-mono text-indigo-400">S/N: {m.serialNumber}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>

              {/* Start & Due Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase mb-1">Start Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase mb-1">Due Date *</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs"
                  />
                </div>
              </div>

              {/* Monthly Rate & Deposit */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase mb-1">Monthly Rent (LKR) *</label>
                  <input
                    type="number"
                    required
                    value={formData.monthlyRentAmount}
                    onChange={(e) => setFormData({ ...formData, monthlyRentAmount: e.target.value })}
                    placeholder="25000"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase mb-1">Security Deposit (LKR)</label>
                  <input
                    type="number"
                    value={formData.depositAmount}
                    onChange={(e) => setFormData({ ...formData, depositAmount: e.target.value })}
                    placeholder="50000"
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-semibold"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs shadow-lg shadow-indigo-600/30"
                >
                  {submitting ? 'Creating Contract...' : 'Create Contract'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default RentalsPage;

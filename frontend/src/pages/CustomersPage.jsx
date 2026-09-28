import React, { useState, useEffect } from 'react';
import { customerService } from '../services/customerService';
import {
  Users,
  Plus,
  Search,
  Loader2,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  AlertTriangle,
  CheckCheck,
  Edit2,
  Eye,
  X,
  FileText,
  Cpu,
  Building
} from 'lucide-react';

const CustomersPage = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  
  // Modals state
  const [showAddModal, setShowAddModal] = useState(false);
  const [editCustomer, setEditCustomer] = useState(null);
  const [viewCustomerProfile, setViewCustomerProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    nic: '',
    phone: '',
    address: '',
    status: 'Active'
  });

  useEffect(() => {
    loadCustomers();
  }, [searchQuery, statusFilter]);

  const loadCustomers = async () => {
    try {
      setLoading(true);
      const res = await customerService.getCustomers(searchQuery, statusFilter);
      if (res.success) {
        setCustomers(res.data);
      }
    } catch (err) {
      console.error('Error loading customers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenAdd = () => {
    setEditCustomer(null);
    setFormData({ name: '', nic: '', phone: '', address: '', status: 'Active' });
    setShowAddModal(true);
  };

  const handleOpenEdit = (customer, e) => {
    e.stopPropagation();
    setEditCustomer(customer);
    setFormData({
      name: customer.name,
      nic: customer.nic || '',
      phone: customer.phone,
      address: customer.address || '',
      status: customer.status || 'Active'
    });
    setShowAddModal(true);
  };

  const handleOpenProfile = async (customer) => {
    try {
      setLoadingProfile(true);
      const res = await customerService.getCustomerById(customer._id);
      if (res.success) {
        setViewCustomerProfile(res.data);
      }
    } catch (err) {
      alert('Error fetching customer profile details');
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone) {
      alert('Please fill in required fields (Name & Phone)');
      return;
    }

    try {
      setSubmitting(true);
      if (editCustomer) {
        await customerService.updateCustomer(editCustomer._id, formData);
      } else {
        await customerService.createCustomer(formData);
      }
      setShowAddModal(false);
      loadCustomers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving customer data');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 size={12} className="mr-1" /> Active
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Clock size={12} className="mr-1" /> Pending
          </span>
        );
      case 'Overdue':
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <AlertTriangle size={12} className="mr-1" /> Overdue
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            <CheckCheck size={12} className="mr-1" /> Completed
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
            <Users className="text-indigo-400" />
            <span>Customer & Client Registry</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manage Sri Lanka garment factories, sub-lease clients, NIC validation, and assigned equipment history.
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all"
        >
          <Plus size={16} />
          <span>Register New Customer</span>
        </button>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-stretch sm:items-center">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-3 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search by customer name, phone, NIC or ID (e.g. CUST-2026-0001)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center space-x-2">
          {['', 'Active', 'Pending', 'Overdue', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                statusFilter === status
                  ? 'bg-indigo-600 text-white font-semibold'
                  : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
              }`}
            >
              {status === '' ? 'All Status' : status}
            </button>
          ))}
        </div>
      </div>

      {/* Customer List Grid */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : customers.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center border border-slate-800">
          <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-300">No matching customers found</h3>
          <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search term or click "Register New Customer" to record a new client.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {customers.map((customer) => (
            <div
              key={customer._id}
              onClick={() => handleOpenProfile(customer)}
              className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-indigo-500/40 transition-all cursor-pointer group relative overflow-hidden"
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
                    {customer.customerId}
                  </span>
                  <h3 className="font-bold text-slate-100 text-base mt-1.5 group-hover:text-indigo-300 transition-colors">
                    {customer.name}
                  </h3>
                </div>
                {getStatusBadge(customer.status)}
              </div>

              <div className="space-y-2 text-xs text-slate-400 border-t border-slate-800/60 pt-3 mt-3">
                <div className="flex items-center space-x-2">
                  <Phone size={14} className="text-slate-500" />
                  <span className="text-slate-200 font-mono">{customer.phone}</span>
                </div>
                {customer.nic && (
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-slate-500">NIC:</span>
                    <span className="font-mono text-slate-300">{customer.nic}</span>
                  </div>
                )}
                {customer.address && (
                  <div className="flex items-start space-x-2">
                    <MapPin size={14} className="text-slate-500 shrink-0 mt-0.5" />
                    <span className="truncate text-slate-300">{customer.address}</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-800/40 mt-3 text-[11px]">
                <span className="text-indigo-400 font-medium flex items-center space-x-1">
                  <Eye size={12} />
                  <span>View Full Profile</span>
                </span>
                <button
                  onClick={(e) => handleOpenEdit(customer, e)}
                  className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <Edit2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Customer Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                {editCustomer ? 'Edit Customer Info' : 'Register New Customer'}
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase mb-1">
                  Customer / Factory Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Brandix Garment Workshop"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase mb-1">
                  Phone Number *
                </label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+94 77 123 4567"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase mb-1">
                  NIC / Business Reg No
                </label>
                <input
                  type="text"
                  value={formData.nic}
                  onChange={(e) => setFormData({ ...formData, nic: e.target.value })}
                  placeholder="e.g. 198510293847 or PV-9901"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Factory Street, Katunayake, Sri Lanka"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase mb-1">
                  Account Status
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="Active">Active</option>
                  <option value="Pending">Pending</option>
                  <option value="Overdue">Overdue</option>
                  <option value="Completed">Completed</option>
                </select>
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
                  {submitting ? 'Saving...' : editCustomer ? 'Update Customer' : 'Register Customer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Customer Profile View Modal / Drawer */}
      {viewCustomerProfile && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
                  {viewCustomerProfile.customer.customerId}
                </span>
                <h2 className="text-xl font-extrabold text-white mt-2">
                  {viewCustomerProfile.customer.name}
                </h2>
                <div className="flex items-center space-x-3 text-xs text-slate-400 mt-1">
                  <span>Phone: {viewCustomerProfile.customer.phone}</span>
                  {viewCustomerProfile.customer.nic && (
                    <span>• NIC: {viewCustomerProfile.customer.nic}</span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setViewCustomerProfile(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X size={22} />
              </button>
            </div>

            {/* Quick Stats Summary */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-400">Total Contracts</span>
                <p className="text-lg font-bold text-white mt-0.5">
                  {viewCustomerProfile.stats.totalRentals}
                </p>
              </div>
              <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/30">
                <span className="text-xs text-indigo-300">Active Contracts</span>
                <p className="text-lg font-bold text-indigo-400 mt-0.5">
                  {viewCustomerProfile.stats.activeRentalsCount}
                </p>
              </div>
              <div className="p-3 bg-emerald-950/40 rounded-xl border border-emerald-500/30">
                <span className="text-xs text-emerald-300">Assigned Machines</span>
                <p className="text-lg font-bold text-emerald-400 mt-0.5">
                  {viewCustomerProfile.stats.currentlyAssignedMachinesCount}
                </p>
              </div>
            </div>

            {/* Assigned Machines Section */}
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center space-x-2">
                <Cpu size={16} className="text-indigo-400" />
                <span>Currently Assigned Machine Units</span>
              </h3>
              {viewCustomerProfile.assignedMachines.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-4 bg-slate-900/60 rounded-xl text-center border border-slate-800">
                  No active machines currently assigned to this customer.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {viewCustomerProfile.assignedMachines.map((machine) => (
                    <div
                      key={machine._id}
                      className="p-3 bg-slate-900/90 rounded-xl border border-slate-800 flex items-center justify-between"
                    >
                      <div>
                        <p className="text-xs font-bold text-white">
                          {machine.brand} {machine.model}
                        </p>
                        <p className="text-[11px] font-mono text-indigo-400 mt-0.5">
                          S/N: {machine.serialNumber}
                        </p>
                      </div>
                      <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 font-semibold">
                        In Use
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Rental History Timeline */}
            <div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 flex items-center space-x-2">
                <FileText size={16} className="text-indigo-400" />
                <span>Rental Contract History</span>
              </h3>
              {viewCustomerProfile.rentals.length === 0 ? (
                <p className="text-xs text-slate-500 italic p-4 bg-slate-900/60 rounded-xl text-center border border-slate-800">
                  No previous rental contracts found for this client.
                </p>
              ) : (
                <div className="space-y-3">
                  {viewCustomerProfile.rentals.map((rental) => (
                    <div
                      key={rental._id}
                      className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-indigo-400">{rental.rentalId}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            rental.status === 'Active'
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {rental.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-slate-400 pt-1">
                        <div>Monthly Rent: <span className="text-slate-200 font-semibold">LKR {rental.monthlyRentAmount.toLocaleString()}</span></div>
                        <div>Deposit: <span className="text-slate-200 font-semibold">LKR {rental.depositAmount.toLocaleString()}</span></div>
                        <div>Start Date: {new Date(rental.startDate).toLocaleDateString()}</div>
                        <div>Due Date: {new Date(rental.dueDate).toLocaleDateString()}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersPage;

import React, { useState, useEffect } from 'react';
import { clientPortalService } from '../services/clientPortalService';
import { useLanguage } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import {
  Cpu,
  Wrench,
  FileText,
  ShieldCheck,
  Plus,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  UserCheck,
  Building2
} from 'lucide-react';

const ClientPortalPage = () => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Service Request Modal state
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [ticketForm, setTicketForm] = useState({
    machineSerial: '',
    machineModel: '',
    issueTitle: '',
    issueDescription: '',
    priority: 'Medium'
  });

  useEffect(() => {
    loadPortalData();
  }, []);

  const loadPortalData = async () => {
    try {
      setLoading(true);
      const res = await clientPortalService.getClientDashboard();
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching client portal data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileRequest = async (e) => {
    e.preventDefault();
    if (!ticketForm.machineSerial || !ticketForm.issueTitle) {
      alert('Machine serial number and issue title are required.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await clientPortalService.createServiceRequest(ticketForm);
      if (res.success) {
        setShowTicketModal(false);
        alert(res.message);
        setTicketForm({
          machineSerial: '',
          machineModel: '',
          issueTitle: '',
          issueDescription: '',
          priority: 'Medium'
        });
        loadPortalData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error filing service ticket');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-900 border border-emerald-500/30 p-6 sm:p-8">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-3">
              <ShieldCheck size={14} />
              <span>{t('clientPortal')} • {data?.customer?.factoryName || 'Apparel Factory'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {t('welcomeBack')}, {user?.name}!
            </h1>
            <p className="text-slate-400 text-xs mt-1 max-w-xl">
              Track your apparel factory's purchased machinery, active warranty status, tracked serial numbers, and file service tickets directly with Anujaya & Global Consortium.
            </p>
          </div>

          <button
            onClick={() => setShowTicketModal(true)}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all"
          >
            <Wrench size={16} />
            <span>{t('fileRequest')}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
      ) : !data ? (
        <p className="text-slate-400 text-xs">Error loading client portal equipment data.</p>
      ) : (
        <div className="space-y-6">
          {/* Purchased Equipment & Serials Table */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Cpu size={18} className="text-emerald-400" />
              <span>Purchased Machinery & Active Serials ({data.equipmentHistory.length} Units)</span>
            </h3>

            {data.equipmentHistory.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 bg-slate-900/60 rounded-xl text-center border border-slate-800">
                No machinery dispatch history recorded for your factory account.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 font-mono">
                  <thead className="bg-slate-900 text-slate-400 font-bold uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Invoice No</th>
                      <th className="p-3">SKU & Model</th>
                      <th className="p-3 text-center">Qty</th>
                      <th className="p-3">Tracked Serial Numbers</th>
                      <th className="p-3 text-center">Warranty Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {data.equipmentHistory.map((item, idx) => (
                      <tr key={idx} className="hover:bg-slate-900/40">
                        <td className="p-3 font-bold text-indigo-400">{item.invoiceNo}</td>
                        <td className="p-3 font-sans">
                          <p className="font-bold text-white">{item.brand} {item.model}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{item.sku}</p>
                        </td>
                        <td className="p-3 text-center font-bold text-emerald-400">{item.qty}</td>
                        <td className="p-3 text-sky-300 font-bold">
                          {item.serialsTracked?.length > 0
                            ? item.serialsTracked.join(', ')
                            : 'N/A'}
                        </td>
                        <td className="p-3 text-center font-sans">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            ✓ {item.warrantyMonths || 12} Months Active
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Filed Service Tickets */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Wrench size={18} className="text-amber-400" />
              <span>Service & Warranty Tickets ({data.serviceRequests.length})</span>
            </h3>

            {data.serviceRequests.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 bg-slate-900/60 rounded-xl text-center border border-slate-800">
                No active service tickets. Click "File Service Ticket" if any equipment requires maintenance.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.serviceRequests.map((req) => (
                  <div key={req._id} className="p-4 bg-slate-900/80 rounded-2xl border border-slate-800 space-y-2 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-indigo-400">{req.ticketNo}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                        {req.status}
                      </span>
                    </div>
                    <h4 className="font-bold text-white text-sm">{req.issueTitle}</h4>
                    <p className="text-slate-400 font-mono text-[11px]">
                      Serial: {req.machineSerial} {req.machineModel && `(${req.machineModel})`}
                    </p>
                    <p className="text-slate-400 text-[11px]">{req.issueDescription}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Service Request Modal */}
      {showTicketModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">File Equipment Service Ticket</h3>
              <button onClick={() => setShowTicketModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleFileRequest} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Machine Serial Number *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SN-8700-01"
                  value={ticketForm.machineSerial}
                  onChange={(e) => setTicketForm({ ...ticketForm, machineSerial: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Issue Title / Description *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thread tension timing adjustment required"
                  value={ticketForm.issueTitle}
                  onChange={(e) => setTicketForm({ ...ticketForm, issueTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-semibold"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Priority Level</label>
                <select
                  value={ticketForm.priority}
                  onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-bold"
                >
                  <option value="Low">Low Priority</option>
                  <option value="Medium">Medium Priority</option>
                  <option value="High">High Priority (Line Down)</option>
                  <option value="Urgent">Urgent Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Additional Notes</label>
                <textarea
                  rows={3}
                  placeholder="Provide any additional symptoms or context..."
                  value={ticketForm.issueDescription}
                  onChange={(e) => setTicketForm({ ...ticketForm, issueDescription: e.target.value })}
                  className="w-full p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowTicketModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30"
                >
                  {submitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ClientPortalPage;

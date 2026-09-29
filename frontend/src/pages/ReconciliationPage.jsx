import React, { useState, useEffect } from 'react';
import { partnerService } from '../services/partnerService';
import { useLanguage } from '../context/LanguageContext';
import {
  DollarSign,
  Plus,
  Printer,
  Loader2,
  TrendingUp,
  Building2,
  Briefcase,
  X,
  CheckCircle2,
  ArrowUpRight,
  CreditCard
} from 'lucide-react';

const ReconciliationPage = () => {
  const { t } = useLanguage();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentPartnerView, setCurrentPartnerView] = useState('Anujaya');

  // Capital Draw Modal
  const [showDrawModal, setShowDrawModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [drawForm, setDrawForm] = useState({
    partnerName: 'Anujaya',
    type: 'Capital Draw',
    amountLkr: '',
    paymentReference: '',
    paymentMethod: 'Bank Wire',
    notes: ''
  });

  // Audit Statement Modal
  const [showAuditModal, setShowAuditModal] = useState(false);
  const [auditData, setAuditData] = useState(null);

  useEffect(() => {
    loadDashboard();
  }, [currentPartnerView]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const res = await partnerService.getPartnerDashboard(currentPartnerView);
      if (res.success) {
        setData(res.data);
      }
    } catch (err) {
      console.error('Error fetching partner equity dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogDraw = async (e) => {
    e.preventDefault();
    if (!drawForm.amountLkr) return;

    try {
      setSubmitting(true);
      const res = await partnerService.logCapitalDraw(drawForm);
      if (res.success) {
        setShowDrawModal(false);
        alert(res.message);
        setDrawForm({
          partnerName: 'Anujaya',
          type: 'Capital Draw',
          amountLkr: '',
          paymentReference: '',
          paymentMethod: 'Bank Wire',
          notes: ''
        });
        loadDashboard();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error logging capital draw');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFetchAuditStatement = async () => {
    try {
      const res = await partnerService.getAuditStatement();
      if (res.success) {
        setAuditData(res.data);
        setShowAuditModal(true);
      }
    } catch (err) {
      alert('Error loading audit statement');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-3">
            <DollarSign className="text-emerald-400" />
            <span>{t('partnerEquity')}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated net profit split between Anujaya Enterprises and Global Enterprises, capital draws & audit statements.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={handleFetchAuditStatement}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center space-x-1.5"
          >
            <Printer size={14} />
            <span>Financial Audit Statement</span>
          </button>

          <button
            onClick={() => setShowDrawModal(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center space-x-1.5"
          >
            <Plus size={16} />
            <span>{t('logDraw')}</span>
          </button>
        </div>
      </div>

      {/* Partner View Toggle */}
      <div className="flex items-center space-x-3 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800 w-max">
        <button
          onClick={() => setCurrentPartnerView('Anujaya')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            currentPartnerView === 'Anujaya'
              ? 'bg-indigo-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🏢 Anujaya Enterprises Dashboard
        </button>
        <button
          onClick={() => setCurrentPartnerView('Global')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            currentPartnerView === 'Global'
              ? 'bg-amber-600 text-white shadow-md'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          🌐 Global Enterprises Dashboard
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
        </div>
      ) : !data ? (
        <p className="text-slate-400 text-xs">Error loading partner equity data.</p>
      ) : (
        <div className="space-y-6">
          {/* Equity Accounts Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Anujaya Card */}
            <div className="glass-panel p-6 rounded-3xl border border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 to-slate-900 space-y-4">
              <div className="flex items-center justify-between border-b border-indigo-500/20 pb-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    50% SHAREHOLDING
                  </span>
                  <h3 className="text-lg font-black text-white mt-1">Anujaya Enterprises</h3>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 font-bold">
                  AE
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span>Realized Net Earnings:</span>
                  <span className="text-emerald-400 font-bold">
                    LKR {(data.summary.anujaya.realizedNetEarnings || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Capital Draws / Disbursements:</span>
                  <span className="text-rose-400 font-bold">
                    - LKR {(data.summary.anujaya.capitalDraws || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-indigo-500/20 text-sm font-extrabold">
                  <span className="text-white">Unsettled Equity Balance:</span>
                  <span className="text-amber-400">
                    LKR {(data.summary.anujaya.unsettledEquityBalance || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Global Card */}
            <div className="glass-panel p-6 rounded-3xl border border-amber-500/30 bg-gradient-to-br from-amber-950/30 to-slate-900 space-y-4">
              <div className="flex items-center justify-between border-b border-amber-500/20 pb-3">
                <div>
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    50% SHAREHOLDING
                  </span>
                  <h3 className="text-lg font-black text-white mt-1">Global Enterprises</h3>
                </div>
                <div className="w-10 h-10 rounded-2xl bg-amber-600/20 border border-amber-500/30 flex items-center justify-center text-amber-400 font-bold">
                  GE
                </div>
              </div>

              <div className="space-y-2 text-xs font-mono">
                <div className="flex justify-between text-slate-300">
                  <span>Realized Net Earnings:</span>
                  <span className="text-emerald-400 font-bold">
                    LKR {(data.summary.global.realizedNetEarnings || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-slate-300">
                  <span>Capital Draws / Disbursements:</span>
                  <span className="text-rose-400 font-bold">
                    - LKR {(data.summary.global.capitalDraws || 0).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between pt-2 border-t border-amber-500/20 text-sm font-extrabold">
                  <span className="text-white">Unsettled Equity Balance:</span>
                  <span className="text-amber-400">
                    LKR {(data.summary.global.unsettledEquityBalance || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Partner Transaction Ledger Table */}
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Briefcase size={18} className="text-emerald-400" />
              <span>
                {currentPartnerView} Enterprises Capital Draws & Disbursement History
              </span>
            </h3>

            {data.recentTransactions.length === 0 ? (
              <p className="text-xs text-slate-500 italic p-4 bg-slate-900/60 rounded-xl text-center border border-slate-800">
                No capital draws logged for {currentPartnerView} Enterprises yet.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 font-mono">
                  <thead className="bg-slate-900 text-slate-400 font-bold uppercase border-b border-slate-800">
                    <tr>
                      <th className="p-3">Date</th>
                      <th className="p-3">Transaction Type</th>
                      <th className="p-3">Payment Reference</th>
                      <th className="p-3 text-right">Amount (LKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {data.recentTransactions.map((tx) => (
                      <tr key={tx._id} className="hover:bg-slate-900/40">
                        <td className="p-3 text-slate-400">
                          {new Date(tx.date).toLocaleDateString()}
                        </td>
                        <td className="p-3 font-bold text-white">{tx.type}</td>
                        <td className="p-3 text-sky-400 font-bold">
                          {tx.paymentReference || 'Internal Ref'} ({tx.paymentMethod})
                        </td>
                        <td className="p-3 text-right font-extrabold text-rose-400">
                          - LKR {tx.amountLkr.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Log Capital Draw Modal */}
      {showDrawModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Log Partner Capital Draw / Disbursement</h3>
              <button onClick={() => setShowDrawModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleLogDraw} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Partner Account *</label>
                <select
                  value={drawForm.partnerName}
                  onChange={(e) => setDrawForm({ ...drawForm, partnerName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-bold"
                >
                  <option value="Anujaya">Anujaya Enterprises</option>
                  <option value="Global">Global Enterprises</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Draw Amount (LKR) *</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 150000"
                  value={drawForm.amountLkr}
                  onChange={(e) => setDrawForm({ ...drawForm, amountLkr: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-amber-400 font-extrabold font-mono text-base"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Payment Method</label>
                <select
                  value={drawForm.paymentMethod}
                  onChange={(e) => setDrawForm({ ...drawForm, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-semibold"
                >
                  <option value="Bank Wire">Bank Wire Transfer</option>
                  <option value="SLIPS">SLIPS Online</option>
                  <option value="Cheque">Company Cheque</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 font-bold uppercase mb-1">Payment Ref / Wire #</label>
                <input
                  type="text"
                  placeholder="e.g. BANK-WIRE-REF-99201"
                  value={drawForm.paymentReference}
                  onChange={(e) => setDrawForm({ ...drawForm, paymentReference: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDrawModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30"
                >
                  {submitting ? 'Logging...' : 'Confirm Draw'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Financial Audit Statement Modal */}
      {showAuditModal && auditData && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 max-w-3xl w-full p-8 rounded-2xl shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto font-sans print:m-0 print:p-0">
            <div className="flex items-center justify-between border-b pb-4 print:hidden">
              <span className="text-xs font-bold text-slate-500">Official Financial Audit Statement</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1"
                >
                  <Printer size={14} />
                  <span>Print Audit Statement</span>
                </button>
                <button onClick={() => setShowAuditModal(false)} className="text-slate-500 hover:text-slate-900 p-1">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="border-b-2 border-slate-900 pb-4">
              <h1 className="text-xl font-extrabold text-slate-900">ANUJAYA & GLOBAL ENTERPRISES</h1>
              <p className="text-xs font-bold text-indigo-900">Consortium Financial Audit Statement</p>
              <p className="text-[11px] text-slate-600 mt-1">
                Generated: {new Date(auditData.generatedAt).toLocaleString()} | Tax Reg: PV-99201-CONSORTIUM
              </p>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <h3 className="font-bold text-slate-900 text-sm uppercase">Consortium Sales Ledger Summary</h3>
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-slate-100 border-b">
                    <th className="p-2 text-left">Invoice No</th>
                    <th className="p-2 text-left">Client</th>
                    <th className="p-2 text-right">Grand Total</th>
                    <th className="p-2 text-right">Realized Net</th>
                  </tr>
                </thead>
                <tbody className="divide-y border-b">
                  {auditData.salesSummary.map((s) => (
                    <tr key={s._id}>
                      <td className="p-2 font-bold">{s.invoiceNo}</td>
                      <td className="p-2 font-sans">{s.customerDetails?.name}</td>
                      <td className="p-2 text-right">{(s.grandTotalLkr || 0).toLocaleString()}</td>
                      <td className="p-2 text-right font-bold text-emerald-700">
                        {(s.realizedNetLkr || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
              <div className="border-t border-slate-400 pt-2">
                <p className="font-bold">Anujaya Representative Auditor</p>
              </div>
              <div className="border-t border-slate-400 pt-2">
                <p className="font-bold">Global Representative Auditor</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReconciliationPage;

import React, { useState, useEffect } from 'react';
import { salesLedgerService } from '../services/salesLedgerService';
import { machineService } from '../services/machineService';
import { customerService } from '../services/customerService';
import { useLanguage } from '../context/LanguageContext';
import {
  FileText,
  Plus,
  Search,
  Loader2,
  Printer,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  CreditCard,
  Building,
  UserCheck,
  ShieldCheck,
  Building2,
  Check,
  Download
} from 'lucide-react';

// Amount-in-words generator for LKR
const numberToWords = (num) => {
  if (!num) return 'Zero Rupees Only';
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const inWords = (n) => {
    if ((n = n.toString()).length > 9) return 'overflow';
    let nArr = ('000000000' + n).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!nArr) return '';
    let str = '';
    str += nArr[1] != 0 ? (a[Number(nArr[1])] || b[nArr[1][0]] + ' ' + a[nArr[1][1]]) + 'Crore ' : '';
    str += nArr[2] != 0 ? (a[Number(nArr[2])] || b[nArr[2][0]] + ' ' + a[nArr[2][1]]) + 'Lakh ' : '';
    str += nArr[3] != 0 ? (a[Number(nArr[3])] || b[nArr[3][0]] + ' ' + a[nArr[3][1]]) + 'Thousand ' : '';
    str += nArr[4] != 0 ? (a[Number(nArr[4])] || b[nArr[4][0]] + ' ' + a[nArr[4][1]]) + 'Hundred ' : '';
    str += nArr[5] != 0 ? (str != '' ? 'and ' : '') + (a[Number(nArr[5])] || b[nArr[5][0]] + ' ' + a[nArr[5][1]]) : '';
    return str;
  };

  return `${inWords(num).trim()} LKR Only`;
};

const SalesLedgerPage = () => {
  const { t } = useLanguage();
  const [dispatches, setDispatches] = useState([]);
  const [machines, setMachines] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // POS Dispatch Modal state
  const [showDispatchModal, setShowDispatchModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Printable Invoice Modal state
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [activeInvoice, setActiveInvoice] = useState(null);

  // Payment Collection Modal state
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [collectionTarget, setCollectionTarget] = useState(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Bank Wire');
  const [paymentRef, setPaymentRef] = useState('');

  // POS Form Data
  const [dispatchForm, setDispatchForm] = useState({
    customer: '',
    customerDetails: { name: '', factoryName: '', email: '', phone: '', address: '', taxId: '' },
    items: [{ machine: '', sku: '', brand: 'Juki', model: '', qty: 1, unitPriceLkr: 0, serialsTracked: '' }],
    isSvatExempt: false,
    paymentStatus: 'Pending',
    amountPaidLkr: 0,
    warrantyMonths: 12,
    notes: ''
  });

  useEffect(() => {
    loadData();
  }, [searchQuery, statusFilter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (statusFilter) filters.paymentStatus = statusFilter;
      if (searchQuery) filters.q = searchQuery;

      const [resDispatches, resMachines, resCustomers] = await Promise.all([
        salesLedgerService.getDispatches(filters),
        machineService.getMachines(),
        customerService.getCustomers()
      ]);

      if (resDispatches.success) setDispatches(resDispatches.data);
      if (resMachines.success) setMachines(resMachines.data);
      if (resCustomers.success) setCustomers(resCustomers.data);
    } catch (err) {
      console.error('Error loading sales ledger:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCustomerSelect = (e) => {
    const custId = e.target.value;
    const cust = customers.find((c) => c._id === custId);
    if (cust) {
      setDispatchForm({
        ...dispatchForm,
        customer: cust._id,
        customerDetails: {
          name: cust.name,
          factoryName: cust.factoryName || cust.name,
          email: cust.email || '',
          phone: cust.phone || '',
          address: cust.address || '',
          taxId: cust.taxId || ''
        }
      });
    }
  };

  const handleItemMachineChange = (index, machineId) => {
    const m = machines.find((item) => item._id === machineId);
    const updatedItems = [...dispatchForm.items];
    if (m) {
      updatedItems[index] = {
        ...updatedItems[index],
        machine: m._id,
        sku: m.sku,
        brand: m.brand,
        model: m.model,
        unitPriceLkr: m.retailBenchmarkLkr || m.wholesaleBenchmarkLkr || 0
      };
    }
    setDispatchForm({ ...dispatchForm, items: updatedItems });
  };

  const handleCreateDispatch = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const res = await salesLedgerService.createDispatch(dispatchForm);
      if (res.success) {
        setShowDispatchModal(false);
        alert(res.message);
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording sales dispatch');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRecordCollection = async (e) => {
    e.preventDefault();
    if (!collectionTarget || !paymentAmount) return;

    try {
      const res = await salesLedgerService.recordCollection(collectionTarget._id, {
        amount: Number(paymentAmount),
        paymentMethod,
        reference: paymentRef
      });
      if (res.success) {
        setShowPaymentModal(false);
        alert(res.message);
        loadData();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording payment collection');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-3">
            <FileText className="text-indigo-400" />
            <span>{t('posDispatch')}</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Commercial Tax Invoicing, serial number tracking, payment collection, and consortium net profit split.
          </p>
        </div>

        <button
          onClick={() => setShowDispatchModal(true)}
          className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all"
        >
          <Plus size={16} />
          <span>{t('createDispatch')}</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
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

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full sm:w-auto"
        >
          <option value="">All Payment Statuses</option>
          <option value="Paid">{t('paid')}</option>
          <option value="Partial">{t('partial')}</option>
          <option value="Pending">{t('pending')}</option>
        </select>
      </div>

      {/* Dispatches & Invoices List */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : dispatches.length === 0 ? (
        <div className="glass-panel p-12 rounded-3xl text-center border border-slate-800">
          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">No dispatches logged</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Click "Create POS Dispatch" to record new machinery sales dispatches and print commercial tax invoices.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {dispatches.map((inv) => (
            <div
              key={inv._id}
              className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-indigo-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center space-x-3">
                  <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    {inv.invoiceNo}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(inv.dispatchDate).toLocaleDateString()}
                  </span>
                  {inv.paymentStatus === 'Paid' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                      ✓ {t('paid')}
                    </span>
                  )}
                  {inv.paymentStatus === 'Partial' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      🟡 {t('partial')}
                    </span>
                  )}
                  {inv.paymentStatus === 'Pending' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                      🔴 {t('pending')}
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-white">
                  {inv.customerDetails?.name || 'Apparel Factory'}
                </h3>
                <p className="text-xs text-slate-400 font-mono">
                  {inv.items.map((i) => `${i.brand} ${i.model} (${i.qty} Sets)`).join(' • ')}
                </p>

                {inv.items.some((i) => i.serialsTracked?.length > 0) && (
                  <p className="text-[11px] text-sky-400 font-mono">
                    Serials Tracked: {inv.items.flatMap((i) => i.serialsTracked).join(', ')}
                  </p>
                )}
              </div>

              {/* Financial Snapshot */}
              <div className="text-left md:text-right font-mono space-y-1">
                <p className="text-xs text-slate-400">Grand Total (VAT Included):</p>
                <p className="text-lg font-black text-amber-400">
                  LKR {inv.grandTotalLkr.toLocaleString()}
                </p>

                {inv.outstandingBalanceLkr > 0 ? (
                  <p className="text-xs text-rose-400 font-bold">
                    Outstanding Balance: LKR {inv.outstandingBalanceLkr.toLocaleString()}
                  </p>
                ) : (
                  <p className="text-xs text-emerald-400 font-bold">✓ Fully Settled</p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
                {inv.outstandingBalanceLkr > 0 && (
                  <button
                    onClick={() => {
                      setCollectionTarget(inv);
                      setPaymentAmount(inv.outstandingBalanceLkr.toString());
                      setShowPaymentModal(true);
                    }}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center space-x-1"
                  >
                    <CreditCard size={13} />
                    <span>Collect Payment</span>
                  </button>
                )}

                <button
                  onClick={() => {
                    setActiveInvoice(inv);
                    setShowInvoiceModal(true);
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-indigo-300 rounded-xl text-xs font-bold border border-slate-700 flex items-center space-x-1"
                >
                  <Printer size={13} />
                  <span>{t('print')}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* POS Dispatch Form Modal */}
      {showDispatchModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-2xl w-full p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Record POS Machinery Sales Dispatch</h3>
              <button onClick={() => setShowDispatchModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateDispatch} className="space-y-4 text-xs">
              {/* Select Client */}
              <div>
                <label className="block font-bold text-slate-300 uppercase mb-1">Select Apparel Factory Client *</label>
                <select
                  required
                  onChange={handleCustomerSelect}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-semibold"
                >
                  <option value="">-- Choose Apparel Client --</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.factoryName || c.region})
                    </option>
                  ))}
                </select>
              </div>

              {/* Line Items */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-900/80 border border-slate-800">
                <label className="block font-bold text-slate-300 uppercase">Machinery Line Items</label>
                {dispatchForm.items.map((item, idx) => (
                  <div key={idx} className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-800">
                    <div className="sm:col-span-2">
                      <label className="block text-[10px] text-slate-400">Select Equipment SKU</label>
                      <select
                        required
                        value={item.machine}
                        onChange={(e) => handleItemMachineChange(idx, e.target.value)}
                        className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100"
                      >
                        <option value="">-- Choose Machine SKU --</option>
                        {machines.map((m) => (
                          <option key={m._id} value={m._id}>
                            {m.sku} - {m.brand} {m.model} (Avail: {m.availableSets})
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400">Qty (Sets)</label>
                      <input
                        type="number"
                        min="1"
                        value={item.qty}
                        onChange={(e) => {
                          const updated = [...dispatchForm.items];
                          updated[idx].qty = Number(e.target.value);
                          setDispatchForm({ ...dispatchForm, items: updated });
                        }}
                        className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400">Unit Price (LKR)</label>
                      <input
                        type="number"
                        value={item.unitPriceLkr}
                        onChange={(e) => {
                          const updated = [...dispatchForm.items];
                          updated[idx].unitPriceLkr = Number(e.target.value);
                          setDispatchForm({ ...dispatchForm, items: updated });
                        }}
                        className="w-full px-2 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="block text-[10px] text-slate-400">Tracked Machine Serials (Comma-separated)</label>
                      <input
                        type="text"
                        placeholder="SN-8700-01, SN-8700-02..."
                        value={item.serialsTracked}
                        onChange={(e) => {
                          const updated = [...dispatchForm.items];
                          updated[idx].serialsTracked = e.target.value;
                          setDispatchForm({ ...dispatchForm, items: updated });
                        }}
                        className="w-full px-2.5 py-1 bg-slate-950 border border-slate-700 rounded-lg text-slate-100 font-mono text-[11px]"
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Tax & Initial Payment */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={dispatchForm.isSvatExempt}
                      onChange={(e) => setDispatchForm({ ...dispatchForm, isSvatExempt: e.target.checked })}
                      className="w-4 h-4 text-indigo-600 rounded"
                    />
                    <span className="font-semibold text-slate-200">SVAT Exempt Export Order</span>
                  </label>
                </div>

                <div>
                  <label className="block font-bold text-slate-300 uppercase mb-1">Initial Collected Amount (LKR)</label>
                  <input
                    type="number"
                    value={dispatchForm.amountPaidLkr}
                    onChange={(e) => setDispatchForm({ ...dispatchForm, amountPaidLkr: Number(e.target.value) })}
                    placeholder="0 if Credit / Pending"
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowDispatchModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30"
                >
                  {submitting ? 'Generating Invoice...' : 'Complete POS Dispatch'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable A4 Commercial Tax Invoice Modal */}
      {showInvoiceModal && activeInvoice && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-white text-slate-900 max-w-3xl w-full p-8 rounded-2xl shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto font-sans print:m-0 print:p-0 print:shadow-none print:max-w-none">
            {/* Action Bar (Hidden during printing) */}
            <div className="flex items-center justify-between border-b pb-4 print:hidden">
              <span className="text-xs font-bold text-slate-500">Commercial Tax Invoice A4 Preview</span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePrint}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl flex items-center space-x-1.5 shadow"
                >
                  <Printer size={14} />
                  <span>Print A4 Invoice</span>
                </button>
                <button onClick={() => setShowInvoiceModal(false)} className="text-slate-500 hover:text-slate-900 p-1">
                  <X size={20} />
                </button>
              </div>
            </div>

            {/* Consortium Official Invoice Header */}
            <div className="flex justify-between items-start border-b-2 border-indigo-900 pb-4">
              <div>
                <h1 className="text-xl font-extrabold text-indigo-950 tracking-tight">
                  ANUJAYA & GLOBAL ENTERPRISES
                </h1>
                <p className="text-xs font-semibold text-indigo-700">
                  Industrial Apparel Machinery & Logistics Consortium
                </p>
                <p className="text-[11px] text-slate-600 mt-1 max-w-md">
                  Consortium Complex, No. 458, Katunayake FTZ Road, Seeduwa, Sri Lanka<br />
                  Tel: +94 11 488 9900 | Reg: PV-99201-CONSORTIUM
                </p>
              </div>
              <div className="text-right">
                <span className="inline-block px-3 py-1 bg-indigo-100 text-indigo-950 font-black text-sm rounded">
                  TAX INVOICE
                </span>
                <p className="text-xs font-mono font-bold text-slate-900 mt-2">
                  Invoice No: {activeInvoice.invoiceNo}
                </p>
                <p className="text-xs text-slate-600">
                  Date: {new Date(activeInvoice.dispatchDate).toLocaleDateString()}
                </p>
                <p className="text-[11px] font-mono text-slate-500 mt-1">
                  TIN: 900293847 | SVAT: 100293
                </p>
              </div>
            </div>

            {/* Bill To Customer Block */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs flex justify-between">
              <div>
                <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">BILLED TO (APPAREL FACTORY):</p>
                <p className="font-extrabold text-slate-900 text-sm mt-0.5">{activeInvoice.customerDetails?.name}</p>
                <p className="text-slate-600">{activeInvoice.customerDetails?.address || 'Katunayake FTZ, Sri Lanka'}</p>
                <p className="text-slate-600">Tel: {activeInvoice.customerDetails?.phone}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">WARRANTY COVERAGE:</p>
                <p className="font-bold text-slate-800">{activeInvoice.warrantyMonths || 12} Months Consortium Warranty</p>
                <p className="font-bold text-slate-500 uppercase tracking-wider text-[10px] mt-2">PAYMENT STATUS:</p>
                <span className="font-black text-indigo-900 uppercase">{activeInvoice.paymentStatus}</span>
              </div>
            </div>

            {/* Itemized Table */}
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-indigo-950 text-white font-bold uppercase tracking-wider">
                  <th className="p-2.5">SKU / Model</th>
                  <th className="p-2.5">Description & Serials</th>
                  <th className="p-2.5 text-center">Qty</th>
                  <th className="p-2.5 text-right">Unit Price (LKR)</th>
                  <th className="p-2.5 text-right">Total (LKR)</th>
                </tr>
              </thead>
              <tbody className="divide-y border-b font-mono">
                {activeInvoice.items.map((item, i) => (
                  <tr key={i}>
                    <td className="p-2.5 font-bold">{item.sku}</td>
                    <td className="p-2.5 font-sans">
                      <p className="font-bold text-slate-900">{item.brand} {item.model}</p>
                      {item.serialsTracked?.length > 0 && (
                        <p className="text-[10px] text-indigo-700 font-mono mt-0.5">
                          S/N: {item.serialsTracked.join(', ')}
                        </p>
                      )}
                    </td>
                    <td className="p-2.5 text-center font-bold">{item.qty}</td>
                    <td className="p-2.5 text-right">{(item.unitPriceLkr || 0).toLocaleString()}</td>
                    <td className="p-2.5 text-right font-bold">{(item.totalLkr || 0).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* Totals & Amount in Words */}
            <div className="flex justify-between items-start text-xs border-t pt-4">
              <div className="max-w-md">
                <p className="font-bold text-slate-500 uppercase text-[10px]">AMOUNT IN WORDS:</p>
                <p className="font-bold text-indigo-950 italic mt-0.5">
                  {numberToWords(activeInvoice.grandTotalLkr)}
                </p>
              </div>

              <div className="w-64 space-y-1.5 text-right font-mono">
                <div className="flex justify-between text-slate-600">
                  <span>Subtotal:</span>
                  <span>LKR {(activeInvoice.subtotalLkr || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>VAT ({activeInvoice.vatRate || 18}%):</span>
                  <span>LKR {(activeInvoice.vatAmountLkr || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between font-extrabold text-sm text-indigo-950 border-t border-b py-1">
                  <span>GRAND TOTAL:</span>
                  <span>LKR {(activeInvoice.grandTotalLkr || 0).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Consortium Signature Blocks */}
            <div className="grid grid-cols-2 gap-8 pt-12 text-center text-xs">
              <div className="border-t border-slate-400 pt-2">
                <p className="font-bold text-slate-800">Authorized Signature (Anujaya Representative)</p>
                <p className="text-[10px] text-slate-500">ANUJAYA ENTERPRISES</p>
              </div>
              <div className="border-t border-slate-400 pt-2">
                <p className="font-bold text-slate-800">Authorized Signature (Global Representative)</p>
                <p className="text-[10px] text-slate-500">GLOBAL ENTERPRISES</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Payment Collection Modal */}
      {showPaymentModal && collectionTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white">Record Payment Collection</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleRecordCollection} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400">Invoice Number</label>
                <input
                  type="text"
                  disabled
                  value={collectionTarget.invoiceNo}
                  className="w-full px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-indigo-400 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-slate-400">Payment Collection Amount (LKR) *</label>
                <input
                  type="number"
                  required
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-amber-400 font-extrabold font-mono text-base"
                />
              </div>

              <div>
                <label className="block text-slate-400">Payment Method</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-semibold"
                >
                  <option value="Bank Wire">Bank Wire Transfer</option>
                  <option value="SLIPS">SLIPS Online</option>
                  <option value="Cheque">Company Cheque</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400">Payment Ref / Cheque #</label>
                <input
                  type="text"
                  placeholder="e.g. SLIPS-992019"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/30"
                >
                  Confirm Collection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesLedgerPage;

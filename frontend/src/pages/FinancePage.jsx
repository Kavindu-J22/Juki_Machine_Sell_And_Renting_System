import React, { useState, useEffect } from 'react';
import { paymentService } from '../services/paymentService';
import { expenseService } from '../services/expenseService';
import { customerService } from '../services/customerService';
import { rentalService } from '../services/rentalService';
import {
  DollarSign,
  Plus,
  Loader2,
  CheckCircle2,
  Clock,
  TrendingDown,
  TrendingUp,
  Receipt,
  Users,
  CreditCard,
  Building,
  UserCheck,
  Search,
  X,
  Check,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

const FinancePage = () => {
  const [activeTab, setActiveTab] = useState('payments'); // 'payments' | 'expenses'

  // Payments State
  const [payments, setPayments] = useState([]);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [customerConsolidatedData, setCustomerConsolidatedData] = useState(null);
  const [loadingConsolidated, setLoadingConsolidated] = useState(false);

  // Payment Form State
  const [paymentForm, setPaymentForm] = useState({
    customerId: '',
    rentalId: '',
    previousBalance: 0,
    newCharges: 0,
    amountPaid: '',
    paymentMethod: 'Cash',
    remarks: ''
  });
  const [customerActiveRentals, setCustomerActiveRentals] = useState([]);
  const [submittingPayment, setSubmittingPayment] = useState(false);

  // Expenses & Naya State
  const [expenses, setExpenses] = useState([]);
  const [expenseSummary, setExpenseSummary] = useState(null);
  const [loadingExpenses, setLoadingExpenses] = useState(true);
  const [expenseTypeFilter, setExpenseTypeFilter] = useState('');
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [submittingExpense, setSubmittingExpense] = useState(false);

  const [expenseForm, setExpenseForm] = useState({
    expenseType: 'Salary',
    recipientName: '',
    amount: '',
    notes: '',
    status: 'Pending'
  });

  useEffect(() => {
    if (activeTab === 'payments') {
      loadPayments();
      loadCustomers();
    } else {
      loadExpenses();
    }
  }, [activeTab, expenseTypeFilter]);

  const loadPayments = async () => {
    try {
      setLoadingPayments(true);
      const res = await paymentService.getPayments();
      if (res.success) setPayments(res.data);
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoadingPayments(false);
    }
  };

  const loadCustomers = async () => {
    try {
      const res = await customerService.getCustomers();
      if (res.success) setCustomers(res.data);
    } catch (err) {
      console.error('Error fetching customers:', err);
    }
  };

  const loadExpenses = async () => {
    try {
      setLoadingExpenses(true);
      const res = await expenseService.getExpenses(expenseTypeFilter);
      if (res.success) {
        setExpenses(res.data);
        setExpenseSummary(res.summary);
      }
    } catch (err) {
      console.error('Error fetching expenses:', err);
    } finally {
      setLoadingExpenses(false);
    }
  };

  const handleCustomerSelectForConsolidated = async (custId) => {
    setSelectedCustomerId(custId);
    if (!custId) {
      setCustomerConsolidatedData(null);
      return;
    }
    try {
      setLoadingConsolidated(true);
      const res = await paymentService.getCustomerPayments(custId);
      if (res.success) {
        setCustomerConsolidatedData(res.data);
      }
    } catch (err) {
      alert('Error fetching customer consolidated payment history');
    } finally {
      setLoadingConsolidated(false);
    }
  };

  // Payment Form customer change
  const handlePaymentCustomerChange = async (custId) => {
    setPaymentForm((prev) => ({ ...prev, customerId: custId, previousBalance: 0 }));
    if (!custId) {
      setCustomerActiveRentals([]);
      return;
    }
    try {
      const res = await rentalService.getRentals('Active', custId);
      if (res.success) {
        setCustomerActiveRentals(res.data);
        if (res.data.length > 0) {
          const sumRent = res.data.reduce((s, r) => s + r.monthlyRentAmount, 0);
          setPaymentForm((prev) => ({
            ...prev,
            rentalId: res.data[0]._id,
            newCharges: sumRent
          }));
        }
      }
      // Fetch latest balance
      const payRes = await paymentService.getCustomerPayments(custId);
      if (payRes.success && payRes.data.summary) {
        setPaymentForm((prev) => ({
          ...prev,
          previousBalance: payRes.data.summary.latestBalance || 0
        }));
      }
    } catch (err) {
      console.error('Error loading customer rentals for payment form:', err);
    }
  };

  // Live Formula Calculation: Balance = Previous Balance + New Charges - Payment
  const liveCalculatedNewBalance =
    (Number(paymentForm.previousBalance) || 0) +
    (Number(paymentForm.newCharges) || 0) -
    (Number(paymentForm.amountPaid) || 0);

  const handleCreatePayment = async (e) => {
    e.preventDefault();
    if (!paymentForm.customerId || !paymentForm.amountPaid) {
      alert('Customer and Amount Paid are required.');
      return;
    }
    try {
      setSubmittingPayment(true);
      const res = await paymentService.createPayment(paymentForm);
      if (res.success) {
        alert(res.message);
        setShowPaymentModal(false);
        loadPayments();
        if (selectedCustomerId === paymentForm.customerId) {
          handleCustomerSelectForConsolidated(selectedCustomerId);
        }
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording payment');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const handleCreateExpense = async (e) => {
    e.preventDefault();
    if (!expenseForm.recipientName || !expenseForm.amount) {
      alert('Recipient Name and Amount are required.');
      return;
    }
    try {
      setSubmittingExpense(true);
      const res = await expenseService.createExpense(expenseForm);
      if (res.success) {
        setShowExpenseModal(false);
        setExpenseForm({
          expenseType: 'Salary',
          recipientName: '',
          amount: '',
          notes: '',
          status: 'Pending'
        });
        loadExpenses();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error recording expense');
    } finally {
      setSubmittingExpense(false);
    }
  };

  const handleToggleExpenseStatus = async (expense) => {
    const newStatus = expense.status === 'Pending' ? 'Paid' : 'Pending';
    try {
      const res = await expenseService.updateExpense(expense._id, { status: newStatus });
      if (res.success) {
        loadExpenses();
      }
    } catch (err) {
      alert('Error updating expense status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-3">
            <DollarSign className="text-indigo-400" />
            <span>Financials, Payments & Expense Hub</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Rent collection formulas, consolidated customer payment history, staff salaries, partner payables & creditor (Naya) tracking.
          </p>
        </div>

        {/* Tab Switcher Buttons */}
        <div className="flex items-center space-x-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setActiveTab('payments')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'payments'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Rent Payments & Balances
          </button>
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'expenses'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Expenses, Salaries & Naya
          </button>
        </div>
      </div>

      {/* TAB 1: RENT PAYMENTS & CONSOLIDATED CUSTOMER VIEW */}
      {activeTab === 'payments' && (
        <div className="space-y-6">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1 max-w-md">
              <select
                value={selectedCustomerId}
                onChange={(e) => handleCustomerSelectForConsolidated(e.target.value)}
                className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-sm focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">-- Select Customer for Consolidated Total View --</option>
                {customers.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name} ({c.phone}) - {c.customerId}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowPaymentModal(true)}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center space-x-2 transition-all"
            >
              <Plus size={16} />
              <span>Record Rent Payment</span>
            </button>
          </div>

          {/* Consolidated Customer Payment View Card */}
          {selectedCustomerId && (
            <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-indigo-500/30 space-y-5 bg-indigo-950/20">
              {loadingConsolidated ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="w-6 h-6 text-indigo-400 animate-spin" />
                </div>
              ) : customerConsolidatedData ? (
                <>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                    <div>
                      <span className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded border border-indigo-500/20">
                        {customerConsolidatedData.customer.customerId}
                      </span>
                      <h2 className="text-xl font-bold text-white mt-1.5">
                        Consolidated Payment Summary: {customerConsolidatedData.customer.name}
                      </h2>
                      <p className="text-xs text-slate-400">Phone: {customerConsolidatedData.customer.phone}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Current Outstanding Balance</span>
                      <span
                        className={`text-xl font-extrabold font-mono ${
                          customerConsolidatedData.summary.latestBalance > 0
                            ? 'text-rose-400'
                            : 'text-emerald-400'
                        }`}
                      >
                        LKR {customerConsolidatedData.summary.latestBalance.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Consolidated Metrics Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
                      <span className="text-xs text-slate-400">Rented Machines Held</span>
                      <p className="text-lg font-bold text-white mt-1">
                        {customerConsolidatedData.summary.currentlyRentedMachinesCount} Units
                      </p>
                    </div>
                    <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
                      <span className="text-xs text-slate-400">Combined Monthly Rent Sum</span>
                      <p className="text-lg font-bold text-indigo-400 mt-1">
                        LKR {customerConsolidatedData.summary.activeMonthlyRentSum.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
                      <span className="text-xs text-slate-400">Total Lifetime Amount Paid</span>
                      <p className="text-lg font-bold text-emerald-400 mt-1">
                        LKR {customerConsolidatedData.summary.totalAmountPaidSum.toLocaleString()}
                      </p>
                    </div>
                    <div className="p-4 bg-slate-900/90 rounded-2xl border border-slate-800">
                      <span className="text-xs text-slate-400">Total Payment Entries</span>
                      <p className="text-lg font-bold text-white mt-1">
                        {customerConsolidatedData.summary.totalPaymentsCount} Records
                      </p>
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          )}

          {/* Payment Transactions Table */}
          {loadingPayments ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : payments.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl text-center border border-slate-800">
              <Receipt className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-300">No rent payment transactions logged</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                Click "Record Rent Payment" to log customer rent receipts and compute updated balances.
              </p>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 uppercase text-[11px] text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Payment ID</th>
                      <th className="py-3.5 px-4 font-semibold">Customer</th>
                      <th className="py-3.5 px-4 font-semibold">Payment Date</th>
                      <th className="py-3.5 px-4 font-semibold">Method</th>
                      <th className="py-3.5 px-4 font-semibold">Prev Balance</th>
                      <th className="py-3.5 px-4 font-semibold">Amount Paid</th>
                      <th className="py-3.5 px-4 font-semibold">New Balance</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {payments.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-400">{p.paymentId}</td>
                        <td className="py-3 px-4 font-semibold text-white">{p.customer?.name || 'Customer'}</td>
                        <td className="py-3 px-4 font-mono">{new Date(p.paymentDate).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 bg-slate-800 rounded font-semibold text-[10px]">
                            {p.paymentMethod}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono">LKR {(p.previousBalance || 0).toLocaleString()}</td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                          LKR {p.amountPaid.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-200">
                          LKR {(p.newBalance || 0).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: EXPENSES, SALARIES & OUTSIDE CREDITORS (NAYA) */}
      {activeTab === 'expenses' && (
        <div className="space-y-6">
          {/* Summary Breakdown Cards */}
          {expenseSummary && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400">Staff Salaries</span>
                <p className="text-xl font-bold text-indigo-400 mt-1">
                  LKR {expenseSummary.totalSalaries.toLocaleString()}
                </p>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400">Partner Rent Payables</span>
                <p className="text-xl font-bold text-purple-400 mt-1">
                  LKR {expenseSummary.totalPartnerRentPayables.toLocaleString()}
                </p>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 bg-rose-950/10">
                <span className="text-xs text-rose-300">Outside Creditors (Naya)</span>
                <p className="text-xl font-bold text-rose-400 mt-1">
                  LKR {expenseSummary.totalCreditorsNaya.toLocaleString()}
                </p>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 bg-amber-950/10">
                <span className="text-xs text-amber-300">Total Pending Payables</span>
                <p className="text-xl font-bold text-amber-400 mt-1">
                  LKR {expenseSummary.totalPendingAmount.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {/* Filters & Action Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-2">
              {['', 'Salary', 'Partner-Rent', 'Creditor-Naya', 'Other'].map((type) => (
                <button
                  key={type}
                  onClick={() => setExpenseTypeFilter(type)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    expenseTypeFilter === type
                      ? 'bg-indigo-600 text-white font-semibold'
                      : 'bg-slate-900 text-slate-400 hover:bg-slate-800'
                  }`}
                >
                  {type === '' ? 'All Expenses' : type}
                </button>
              ))}
            </div>

            <button
              onClick={() => setShowExpenseModal(true)}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all"
            >
              <Plus size={16} />
              <span>Record Expense / Naya</span>
            </button>
          </div>

          {/* Expenses Table */}
          {loadingExpenses ? (
            <div className="flex items-center justify-center p-12">
              <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            </div>
          ) : expenses.length === 0 ? (
            <div className="glass-panel p-12 rounded-3xl text-center border border-slate-800">
              <CreditCard className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-lg font-bold text-slate-300">No expense or Naya entries recorded</h3>
              <p className="text-sm text-slate-500 mt-1 max-w-sm mx-auto">
                Click "Record Expense / Naya" to log staff salaries, partner company sub-lease rents, or creditor payables.
              </p>
            </div>
          ) : (
            <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/80 uppercase text-[11px] text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4 font-semibold">Expense ID</th>
                      <th className="py-3.5 px-4 font-semibold">Type</th>
                      <th className="py-3.5 px-4 font-semibold">Recipient / Payee</th>
                      <th className="py-3.5 px-4 font-semibold">Amount</th>
                      <th className="py-3.5 px-4 font-semibold">Date</th>
                      <th className="py-3.5 px-4 font-semibold">Status</th>
                      <th className="py-3.5 px-4 font-semibold text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {expenses.map((e) => (
                      <tr key={e._id} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-400">{e.expenseId}</td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              e.expenseType === 'Salary'
                                ? 'bg-indigo-500/10 text-indigo-400'
                                : e.expenseType === 'Creditor-Naya'
                                ? 'bg-rose-500/10 text-rose-400'
                                : 'bg-purple-500/10 text-purple-400'
                            }`}
                          >
                            {e.expenseType}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-semibold text-white">{e.recipientName}</td>
                        <td className="py-3 px-4 font-mono font-bold text-slate-100">
                          LKR {e.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-mono">{new Date(e.date).toLocaleDateString()}</td>
                        <td className="py-3 px-4">
                          {e.status === 'Paid' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                              <Check size={10} className="mr-1" /> Paid
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                              <Clock size={10} className="mr-1" /> Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            onClick={() => handleToggleExpenseStatus(e)}
                            className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-[11px] font-medium transition-colors"
                          >
                            Toggle Status
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Record Payment Modal with Live Balance Formula */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Record Rent Payment</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreatePayment} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase mb-1">Select Customer *</label>
                <select
                  required
                  value={paymentForm.customerId}
                  onChange={(e) => handlePaymentCustomerChange(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
                >
                  <option value="">-- Choose Customer --</option>
                  {customers.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase mb-1">Previous Balance</label>
                  <input
                    type="number"
                    value={paymentForm.previousBalance}
                    onChange={(e) => setPaymentForm({ ...paymentForm, previousBalance: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 uppercase mb-1">New Charges</label>
                  <input
                    type="number"
                    value={paymentForm.newCharges}
                    onChange={(e) => setPaymentForm({ ...paymentForm, newCharges: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-mono text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase mb-1">Amount Paid (LKR) *</label>
                <input
                  type="number"
                  required
                  value={paymentForm.amountPaid}
                  onChange={(e) => setPaymentForm({ ...paymentForm, amountPaid: e.target.value })}
                  placeholder="25000"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-bold text-base"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase mb-1">Payment Method</label>
                <select
                  value={paymentForm.paymentMethod}
                  onChange={(e) => setPaymentForm({ ...paymentForm, paymentMethod: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

              {/* Formula Preview Box */}
              <div className="p-3 bg-indigo-950/40 rounded-xl border border-indigo-500/30 space-y-1 text-xs">
                <span className="text-slate-400 block text-[11px]">Live Balance Calculation Formula:</span>
                <p className="font-mono text-slate-300 text-[11px]">
                  Balance = {paymentForm.previousBalance} + {paymentForm.newCharges} - {paymentForm.amountPaid || 0}
                </p>
                <div className="flex justify-between items-center pt-1 border-t border-indigo-500/20">
                  <span className="font-semibold text-slate-200">New Balance:</span>
                  <span className="font-bold font-mono text-amber-400 text-sm">
                    LKR {liveCalculatedNewBalance.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowPaymentModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPayment}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-xl text-xs"
                >
                  {submittingPayment ? 'Recording...' : 'Submit Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Expense Modal */}
      {showExpenseModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="glass-panel max-w-md w-full p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">Record Expense / Naya</h3>
              <button onClick={() => setShowExpenseModal(false)} className="text-slate-400 hover:text-white">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase mb-1">Expense Type *</label>
                <select
                  value={expenseForm.expenseType}
                  onChange={(e) => setExpenseForm({ ...expenseForm, expenseType: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
                >
                  <option value="Salary">Staff Salary</option>
                  <option value="Partner-Rent">Partner Sub-lease Rent</option>
                  <option value="Creditor-Naya">Outside Creditor (Naya)</option>
                  <option value="Other">Other Expense</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase mb-1">
                  Recipient / Payee Name *
                </label>
                <input
                  type="text"
                  required
                  value={expenseForm.recipientName}
                  onChange={(e) => setExpenseForm({ ...expenseForm, recipientName: e.target.value })}
                  placeholder="e.g. Kamal Perera (Technician) or Singer Lanka"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase mb-1">Amount (LKR) *</label>
                <input
                  type="number"
                  required
                  value={expenseForm.amount}
                  onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                  placeholder="45000"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 uppercase mb-1">Notes / Remarks</label>
                <input
                  type="text"
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  placeholder="September salary payment"
                  className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowExpenseModal(false)}
                  className="px-4 py-2 text-slate-400 hover:text-white text-xs font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingExpense}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-xs"
                >
                  {submittingExpense ? 'Saving...' : 'Record Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FinancePage;

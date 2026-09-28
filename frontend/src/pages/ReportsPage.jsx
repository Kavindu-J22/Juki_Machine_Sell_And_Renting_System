import React, { useState, useEffect } from 'react';
import { reportService } from '../services/reportService';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Filter,
  Loader2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Cpu,
  Users,
  AlertCircle,
  BarChart3,
  CheckCircle2,
  PieChart
} from 'lucide-react';

const ReportsPage = () => {
  const [reportType, setReportType] = useState('daily-income');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [exportingPDF, setExportingPDF] = useState(false);
  const [exportingExcel, setExportingExcel] = useState(false);

  useEffect(() => {
    fetchReportData();
  }, [reportType]);

  const fetchReportData = async () => {
    try {
      setLoading(true);
      const res = await reportService.getReport(reportType, startDate, endDate);
      if (res.success) {
        setReportData(res);
      }
    } catch (err) {
      console.error('Error loading report:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyFilter = (e) => {
    e.preventDefault();
    fetchReportData();
  };

  const handleDownloadPDF = async () => {
    try {
      setExportingPDF(true);
      await reportService.downloadPDF(reportType, startDate, endDate);
    } catch (err) {
      alert('Error exporting PDF document');
    } finally {
      setExportingPDF(false);
    }
  };

  const handleDownloadExcel = async () => {
    try {
      setExportingExcel(true);
      await reportService.downloadExcel(reportType, startDate, endDate);
    } catch (err) {
      alert('Error exporting Excel document');
    } finally {
      setExportingExcel(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-white flex items-center space-x-3">
            <BarChart3 className="text-indigo-400" />
            <span>Reports, Analytics & Export Hub</span>
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Generate custom date-filtered reports, profit & loss statements, fleet utilization metrics, and export to PDF or Excel.
          </p>
        </div>

        {/* Export Buttons */}
        <div className="flex items-center space-x-3">
          <button
            onClick={handleDownloadPDF}
            disabled={exportingPDF}
            className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-rose-600/20 flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            {exportingPDF ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Download size={14} />
            )}
            <span>Download PDF</span>
          </button>

          <button
            onClick={handleDownloadExcel}
            disabled={exportingExcel}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center space-x-2 transition-all disabled:opacity-50"
          >
            {exportingExcel ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <FileSpreadsheet size={14} />
            )}
            <span>Export Excel (.xlsx)</span>
          </button>
        </div>
      </div>

      {/* Date Range & Report Selector Controls */}
      <form onSubmit={handleApplyFilter} className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">
              Select Report Type
            </label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs font-medium focus:ring-2 focus:ring-indigo-500"
            >
              <option value="daily-income">💰 Daily Income Report</option>
              <option value="monthly-income">📅 Monthly Income Overview</option>
              <option value="customer-payments">💳 Customer Payments History</option>
              <option value="machine-rentals">🤖 Machine Rental History</option>
              <option value="outstanding">⚠️ Outstanding Balances & Arrears</option>
              <option value="overdue">🔴 Overdue Rentals List</option>
              <option value="utilization">📊 Machine Fleet Utilization</option>
              <option value="profit-expense">📈 Comprehensive Profit & Loss</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-slate-100 text-xs"
            />
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-1.5 transition-all"
            >
              <Filter size={14} />
              <span>Apply Filters</span>
            </button>
          </div>
        </div>
      </form>

      {/* DYNAMIC REPORT DISPLAY CONTENT */}
      {loading ? (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      ) : reportData ? (
        <div className="space-y-6">
          {/* Summary Metric Banner */}
          {reportType === 'profit-expense' && reportData.financials && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/20">
                <span className="text-xs text-emerald-300 font-medium">Gross Revenue Collected</span>
                <p className="text-2xl font-black text-emerald-400 mt-1">
                  LKR {reportData.financials.grossRevenue.toLocaleString()}
                </p>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 bg-rose-950/20">
                <span className="text-xs text-rose-300 font-medium">Operating Expenses (Salaries, Rent, Naya)</span>
                <p className="text-2xl font-black text-rose-400 mt-1">
                  LKR {reportData.financials.expenses.totalOperatingExpenses.toLocaleString()}
                </p>
              </div>

              <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 bg-indigo-950/20">
                <span className="text-xs text-indigo-300 font-medium">Net Profit (Profit Margin: {reportData.financials.profitMarginPercentage}%)</span>
                <p className="text-2xl font-black text-white mt-1">
                  LKR {reportData.financials.netProfit.toLocaleString()}
                </p>
              </div>
            </div>
          )}

          {reportType === 'utilization' && reportData.summary && (
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              <div className="glass-panel p-5 rounded-2xl border border-slate-800">
                <span className="text-xs text-slate-400">Total Fleet Units</span>
                <p className="text-xl font-bold text-white mt-1">{reportData.summary.totalMachines} Units</p>
              </div>
              <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 bg-emerald-950/10">
                <span className="text-xs text-emerald-300">Available Stock</span>
                <p className="text-xl font-bold text-emerald-400 mt-1">{reportData.summary.availableCount} Units</p>
              </div>
              <div className="glass-panel p-5 rounded-2xl border border-indigo-500/30 bg-indigo-950/10">
                <span className="text-xs text-indigo-300">Active Rented</span>
                <p className="text-xl font-bold text-indigo-400 mt-1">{reportData.summary.rentedCount} Units</p>
              </div>
              <div className="glass-panel p-5 rounded-2xl border border-sky-500/30 bg-sky-950/10">
                <span className="text-xs text-sky-300">Fleet Utilization Rate</span>
                <p className="text-xl font-bold text-sky-400 mt-1">{reportData.summary.utilizationRatePercentage}%</p>
              </div>
            </div>
          )}

          {/* Data Table View */}
          <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden">
            <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-white text-sm uppercase tracking-wider">
                {reportData.reportType}
              </h3>
              <span className="text-xs text-slate-400 font-mono">
                {reportData.count || reportData.data?.length || 0} Records Found
              </span>
            </div>

            <div className="overflow-x-auto">
              {reportType === 'daily-income' || reportType === 'monthly-income' ? (
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/60 uppercase text-[11px] text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Period / Date</th>
                      <th className="py-3 px-4 text-center">Transactions Count</th>
                      <th className="py-3 px-4 text-right">Total Income (LKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {reportData.data?.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-indigo-400">{row._id}</td>
                        <td className="py-3 px-4 text-center">{row.count}</td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                          LKR {row.totalAmount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : reportType === 'outstanding' ? (
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-900/60 uppercase text-[11px] text-slate-400 border-b border-slate-800">
                    <tr>
                      <th className="py-3 px-4">Customer ID</th>
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4">Phone</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Arrears Balance (LKR)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {reportData.data?.map((row, idx) => (
                      <tr key={idx} className="hover:bg-slate-800/40 transition-colors">
                        <td className="py-3 px-4 font-mono text-indigo-400 font-bold">{row.customer?.customerId}</td>
                        <td className="py-3 px-4 font-bold text-white">{row.customer?.name}</td>
                        <td className="py-3 px-4 font-mono">{row.customer?.phone}</td>
                        <td className="py-3 px-4">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            {row.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-rose-400">
                          LKR {row.currentBalance.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-6 text-center text-xs text-slate-400">
                  Data loaded successfully. Click "Download PDF" or "Export Excel" above to generate the full document.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default ReportsPage;

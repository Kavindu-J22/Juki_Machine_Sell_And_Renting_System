const mongoose = require('mongoose');
const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const Payment = require('../models/Payment');
const Rental = require('../models/Rental');
const Machine = require('../models/Machine');
const Customer = require('../models/Customer');
const Expense = require('../models/Expense');
const CompanySettings = require('../models/CompanySettings');

// Helper to parse date filters
const parseDateRange = (startDateStr, endDateStr) => {
  let start = startDateStr ? new Date(startDateStr) : new Date(0); // Epoch start
  let end = endDateStr ? new Date(endDateStr) : new Date(); // Default to now
  end.setHours(23, 59, 59, 999);
  return { start, end };
};

// 1. Daily Income Report
exports.getDailyIncome = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { start, end } = parseDateRange(startDate, endDate);

    const result = await Payment.aggregate([
      {
        $match: {
          paymentDate: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$paymentDate' } },
          totalAmount: { $sum: '$amountPaid' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    const totalIncome = result.reduce((sum, r) => sum + r.totalAmount, 0);

    res.status(200).json({
      success: true,
      reportType: 'Daily Income Report',
      dateRange: { start, end },
      totalIncome,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating daily income report'
    });
  }
};

// 2. Monthly Income Report
exports.getMonthlyIncome = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { start, end } = parseDateRange(startDate, endDate);

    const result = await Payment.aggregate([
      {
        $match: {
          paymentDate: { $gte: start, $lte: end }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$paymentDate' } },
          totalAmount: { $sum: '$amountPaid' },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: -1 } }
    ]);

    const totalIncome = result.reduce((sum, r) => sum + r.totalAmount, 0);

    res.status(200).json({
      success: true,
      reportType: 'Monthly Income Report',
      dateRange: { start, end },
      totalIncome,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating monthly income report'
    });
  }
};

// 3. Customer Payments Report
exports.getCustomerPaymentsReport = async (req, res) => {
  try {
    const { startDate, endDate, customerId } = req.query;
    const { start, end } = parseDateRange(startDate, endDate);

    let match = {
      paymentDate: { $gte: start, $lte: end }
    };
    if (customerId) {
      match.customer = new mongoose.Types.ObjectId(customerId);
    }

    const payments = await Payment.find(match)
      .populate('customer')
      .sort({ paymentDate: -1 });

    const totalAmount = payments.reduce((sum, p) => sum + p.amountPaid, 0);

    res.status(200).json({
      success: true,
      reportType: 'Customer Payments Report',
      dateRange: { start, end },
      totalAmount,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating customer payments report'
    });
  }
};

// 4. Machine Rentals Report
exports.getMachineRentalsReport = async (req, res) => {
  try {
    const { startDate, endDate, status } = req.query;
    const { start, end } = parseDateRange(startDate, endDate);

    let match = {
      createdAt: { $gte: start, $lte: end }
    };
    if (status) match.status = status;

    const rentals = await Rental.find(match)
      .populate('customer')
      .populate('machines')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reportType: 'Machine Rentals History Report',
      dateRange: { start, end },
      count: rentals.length,
      data: rentals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating machine rentals report'
    });
  }
};

// 5. Outstanding Balances & Arrears Report
exports.getOutstandingReport = async (req, res) => {
  try {
    const customers = await Customer.find({ status: { $in: ['Active', 'Overdue'] } });
    
    let outstandingList = [];
    let grandTotalArrears = 0;

    for (let c of customers) {
      const latestPayment = await Payment.findOne({ customer: c._id }).sort({ paymentDate: -1 });
      const currentBalance = latestPayment ? latestPayment.newBalance : 0;
      
      if (currentBalance > 0 || c.status === 'Overdue') {
        outstandingList.push({
          customer: c,
          currentBalance,
          status: c.status,
          lastPaymentDate: latestPayment ? latestPayment.paymentDate : null
        });
        grandTotalArrears += currentBalance;
      }
    }

    res.status(200).json({
      success: true,
      reportType: 'Outstanding Balances & Arrears Report',
      grandTotalArrears,
      count: outstandingList.length,
      data: outstandingList
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating outstanding report'
    });
  }
};

// 6. Overdue Rentals Report
exports.getOverdueReport = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const overdueRentals = await Rental.find({
      $or: [{ status: 'Overdue' }, { dueDate: { $lt: today }, status: 'Active' }]
    })
      .populate('customer')
      .populate('machines')
      .sort({ dueDate: 1 });

    res.status(200).json({
      success: true,
      reportType: 'Overdue Rentals Report',
      count: overdueRentals.length,
      data: overdueRentals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating overdue report'
    });
  }
};

// 7. Machine Utilization Report
exports.getUtilizationReport = async (req, res) => {
  try {
    const totalMachines = await Machine.countDocuments();
    const availableCount = await Machine.countDocuments({ status: 'Available' });
    const rentedCount = await Machine.countDocuments({ status: 'Rented' });
    const maintenanceCount = await Machine.countDocuments({ status: 'Maintenance' });
    const partnerAllocatedCount = await Machine.countDocuments({ status: 'Partner-Allocated' });

    const utilizationRate = totalMachines > 0 ? ((rentedCount / totalMachines) * 100).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      reportType: 'Machine Utilization & Fleet Metrics',
      summary: {
        totalMachines,
        availableCount,
        rentedCount,
        maintenanceCount,
        partnerAllocatedCount,
        utilizationRatePercentage: Number(utilizationRate)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating utilization report'
    });
  }
};

// 8. Machine Maintenance Report
exports.getMaintenanceReport = async (req, res) => {
  try {
    const maintenanceMachines = await Machine.find({ status: 'Maintenance' }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      reportType: 'Machine Maintenance & Repair Log',
      count: maintenanceMachines.length,
      data: maintenanceMachines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating maintenance report'
    });
  }
};

// 9. Comprehensive Profit & Expense Report
exports.getProfitExpenseReport = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const { start, end } = parseDateRange(startDate, endDate);

    // Total Revenue (Payments collected)
    const paymentAgg = await Payment.aggregate([
      { $match: { paymentDate: { $gte: start, $lte: end } } },
      { $group: { _id: null, total: { $sum: '$amountPaid' } } }
    ]);
    const grossRevenue = paymentAgg.length > 0 ? paymentAgg[0].total : 0;

    // Expenses breakdown
    const expenses = await Expense.find({ date: { $gte: start, $lte: end } });

    const totalSalaries = expenses
      .filter((e) => e.expenseType === 'Salary')
      .reduce((s, e) => s + e.amount, 0);

    const totalPartnerRent = expenses
      .filter((e) => e.expenseType === 'Partner-Rent')
      .reduce((s, e) => s + e.amount, 0);

    const totalCreditorNaya = expenses
      .filter((e) => e.expenseType === 'Creditor-Naya')
      .reduce((s, e) => s + e.amount, 0);

    const totalOtherExpenses = expenses
      .filter((e) => e.expenseType === 'Other')
      .reduce((s, e) => s + e.amount, 0);

    const totalOperatingExpenses = totalSalaries + totalPartnerRent + totalCreditorNaya + totalOtherExpenses;
    const netProfit = grossRevenue - totalOperatingExpenses;
    const profitMargin = grossRevenue > 0 ? ((netProfit / grossRevenue) * 100).toFixed(1) : 0;

    res.status(200).json({
      success: true,
      reportType: 'Comprehensive Profit & Loss Statement',
      dateRange: { start, end },
      financials: {
        grossRevenue,
        expenses: {
          totalSalaries,
          totalPartnerRent,
          totalCreditorNaya,
          totalOtherExpenses,
          totalOperatingExpenses
        },
        netProfit,
        profitMarginPercentage: Number(profitMargin)
      },
      expenseRecords: expenses
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating profit & expense report'
    });
  }
};

// 10. PDF Export Endpoint (Native PDF generation via PDFKit)
exports.exportReportPDF = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;
    const { start, end } = parseDateRange(startDate, endDate);
    const company = await CompanySettings.findOne() || { companyName: 'Juki Sewing Machine Centre' };

    const doc = new PDFDocument({ margin: 40, size: 'A4' });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${reportType || 'Report'}_${Date.now()}.pdf`
    );

    doc.pipe(res);

    // Header Title
    doc
      .fontSize(20)
      .fillColor('#1e293b')
      .text(company.companyName, { align: 'center' });
    doc
      .fontSize(10)
      .fillColor('#64748b')
      .text('Sri Lanka Enterprise Sewing Machine Operations', { align: 'center' });
    doc.moveDown();

    doc
      .fontSize(14)
      .fillColor('#4338ca')
      .text(`REPORT: ${(reportType || 'SUMMARY').toUpperCase()}`, { align: 'left' });
    doc
      .fontSize(9)
      .fillColor('#475569')
      .text(`Generated On: ${new Date().toLocaleString()} | Period: ${start.toLocaleDateString()} to ${end.toLocaleDateString()}`);
    doc.moveDown();

    // Report content based on type
    if (reportType === 'daily-income' || reportType === 'monthly-income') {
      const payments = await Payment.find({ paymentDate: { $gte: start, $lte: end } }).populate('customer');
      doc.fontSize(11).fillColor('#0f172a').text(`Total Transactions Recorded: ${payments.length}`);
      const sum = payments.reduce((s, p) => s + p.amountPaid, 0);
      doc.fontSize(12).fillColor('#16a34a').text(`Total Collected Revenue: LKR ${sum.toLocaleString()}`).moveDown();

      doc.fontSize(10).fillColor('#334155').text('Transaction Log:');
      payments.forEach((p, idx) => {
        doc.fontSize(9).fillColor('#1e293b').text(`${idx + 1}. [${p.paymentId}] ${p.customer?.name || 'Client'} - LKR ${p.amountPaid.toLocaleString()} (${p.paymentMethod})`);
      });
    } else {
      const customers = await Customer.find().limit(50);
      doc.fontSize(11).fillColor('#0f172a').text(`Total Registered Customers: ${customers.length}`).moveDown();
      customers.forEach((c, idx) => {
        doc.fontSize(9).fillColor('#334155').text(`${idx + 1}. ${c.customerId} - ${c.name} (${c.phone}) - Status: ${c.status}`);
      });
    }

    doc.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error exporting PDF report'
    });
  }
};

// 11. Excel Export Endpoint (Native .xlsx workbook via ExcelJS)
exports.exportReportExcel = async (req, res) => {
  try {
    const { reportType, startDate, endDate } = req.query;
    const { start, end } = parseDateRange(startDate, endDate);

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(reportType || 'Report');

    if (reportType === 'daily-income' || reportType === 'monthly-income') {
      worksheet.columns = [
        { header: 'Payment ID', key: 'paymentId', width: 18 },
        { header: 'Customer Name', key: 'customer', width: 25 },
        { header: 'Date', key: 'date', width: 15 },
        { header: 'Method', key: 'method', width: 15 },
        { header: 'Amount Paid (LKR)', key: 'amount', width: 20 },
        { header: 'New Balance (LKR)', key: 'balance', width: 20 }
      ];

      const payments = await Payment.find({ paymentDate: { $gte: start, $lte: end } }).populate('customer');
      payments.forEach((p) => {
        worksheet.addRow({
          paymentId: p.paymentId,
          customer: p.customer?.name || 'Customer',
          date: new Date(p.paymentDate).toLocaleDateString(),
          method: p.paymentMethod,
          amount: p.amountPaid,
          balance: p.newBalance
        });
      });
    } else {
      worksheet.columns = [
        { header: 'Customer ID', key: 'customerId', width: 18 },
        { header: 'Name', key: 'name', width: 25 },
        { header: 'NIC', key: 'nic', width: 18 },
        { header: 'Phone', key: 'phone', width: 18 },
        { header: 'Status', key: 'status', width: 15 }
      ];

      const customers = await Customer.find();
      customers.forEach((c) => {
        worksheet.addRow({
          customerId: c.customerId,
          name: c.name,
          nic: c.nic || '',
          phone: c.phone,
          status: c.status
        });
      });
    }

    // Styling header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE2E8F0' }
    };

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename=${reportType || 'Report'}_${Date.now()}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error exporting Excel report'
    });
  }
};

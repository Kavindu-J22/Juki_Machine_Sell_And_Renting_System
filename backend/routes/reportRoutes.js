const express = require('express');
const {
  getDailyIncome,
  getMonthlyIncome,
  getCustomerPaymentsReport,
  getMachineRentalsReport,
  getOutstandingReport,
  getOverdueReport,
  getUtilizationReport,
  getMaintenanceReport,
  getProfitExpenseReport,
  exportReportPDF,
  exportReportExcel
} = require('../controllers/reportController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/daily-income', protect, getDailyIncome);
router.get('/monthly-income', protect, getMonthlyIncome);
router.get('/customer-payments', protect, getCustomerPaymentsReport);
router.get('/machine-rentals', protect, getMachineRentalsReport);
router.get('/outstanding', protect, getOutstandingReport);
router.get('/overdue', protect, getOverdueReport);
router.get('/utilization', protect, getUtilizationReport);
router.get('/maintenance', protect, getMaintenanceReport);
router.get('/profit-expense', protect, getProfitExpenseReport);

router.get('/export/pdf', protect, exportReportPDF);
router.get('/export/excel', protect, exportReportExcel);

module.exports = router;

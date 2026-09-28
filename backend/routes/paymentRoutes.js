const express = require('express');
const {
  createPayment,
  getPayments,
  getCustomerPayments
} = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(protect, getPayments)
  .post(protect, createPayment);

router.get('/customer/:customerId', protect, getCustomerPayments);

module.exports = router;

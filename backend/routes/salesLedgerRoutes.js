const express = require('express');
const {
  createDispatch,
  getDispatches,
  recordCollection,
  getInvoiceById
} = require('../controllers/salesLedgerController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.route('/')
  .post(authorize('Admin', 'Staff'), createDispatch)
  .get(getDispatches);

router.route('/:id')
  .get(getInvoiceById);

router.route('/:id/payment')
  .post(authorize('Admin', 'Staff'), recordCollection);

module.exports = router;

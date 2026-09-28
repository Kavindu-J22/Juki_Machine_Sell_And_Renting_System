const express = require('express');
const {
  getCustomers,
  createCustomer,
  getCustomerById,
  updateCustomer
} = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(protect, getCustomers)
  .post(protect, createCustomer);

router
  .route('/:id')
  .get(protect, getCustomerById)
  .put(protect, updateCustomer);

module.exports = router;

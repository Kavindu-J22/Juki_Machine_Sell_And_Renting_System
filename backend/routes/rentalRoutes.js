const express = require('express');
const {
  createRental,
  getRentals,
  getRentalById,
  returnRental
} = require('../controllers/rentalController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router
  .route('/')
  .get(protect, getRentals)
  .post(protect, createRental);

router.post('/:rentalId/return', protect, returnRental);

router.route('/:id').get(protect, getRentalById);

module.exports = router;

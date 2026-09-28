const express = require('express');
const {
  getMachines,
  createMachine,
  searchBySerialNumber,
  getMachineById,
  updateMachine
} = require('../controllers/machineController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/search', protect, searchBySerialNumber);

router
  .route('/')
  .get(protect, getMachines)
  .post(protect, createMachine);

router
  .route('/:id')
  .get(protect, getMachineById)
  .put(protect, updateMachine);

module.exports = router;

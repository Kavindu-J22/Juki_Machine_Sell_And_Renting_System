const express = require('express');
const {
  getMachines,
  createMachine,
  searchBySerialNumber,
  getMachineById,
  updateMachine,
  deleteMachine,
  exportCsv,
  importCsv
} = require('../controllers/machineController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/search', searchBySerialNumber);
router.get('/export/csv', authorize('Admin'), exportCsv);
router.post('/import/csv', authorize('Admin'), importCsv);

router
  .route('/')
  .get(getMachines)
  .post(authorize('Admin', 'Staff'), createMachine);

router
  .route('/:id')
  .get(getMachineById)
  .put(authorize('Admin', 'Staff'), updateMachine)
  .delete(authorize('Admin', 'Staff'), deleteMachine);

module.exports = router;

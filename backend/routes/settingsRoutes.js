const express = require('express');
const {
  getSettings,
  updateSettings,
  updateExchangeRate,
  backupDatabase,
  restoreDatabase
} = require('../controllers/settingsController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/', getSettings);
router.put('/', authorize('Admin'), updateSettings);
router.put('/exchange-rate', authorize('Admin'), updateExchangeRate);
router.get('/backup', authorize('Admin'), backupDatabase);
router.post('/restore', authorize('Admin'), restoreDatabase);

module.exports = router;

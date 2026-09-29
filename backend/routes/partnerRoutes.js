const express = require('express');
const {
  getPartnerDashboard,
  logCapitalDraw,
  getAuditStatement
} = require('../controllers/partnerController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/dashboard', getPartnerDashboard);
router.post('/capital-draw', authorize('Admin', 'Partner'), logCapitalDraw);
router.get('/audit-statement', getAuditStatement);

module.exports = router;

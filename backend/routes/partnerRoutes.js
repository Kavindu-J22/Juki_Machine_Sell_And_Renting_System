const express = require('express');
const {
  getPartnerDashboard,
  logCapitalDraw,
  getAuditStatement
} = require('../controllers/partnerController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/dashboard', authorize('Admin', 'Partner'), getPartnerDashboard);
router.post('/capital-draw', authorize('Admin'), logCapitalDraw);
router.get('/audit-statement', authorize('Admin', 'Partner'), getAuditStatement);

module.exports = router;

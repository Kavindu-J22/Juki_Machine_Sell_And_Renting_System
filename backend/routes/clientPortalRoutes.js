const express = require('express');
const {
  getClientDashboard,
  createServiceRequest
} = require('../controllers/clientPortalController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

router.get('/dashboard', authorize('Client', 'Admin'), getClientDashboard);
router.post('/service-request', authorize('Client', 'Admin'), createServiceRequest);

module.exports = router;

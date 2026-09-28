const express = require('express');
const { getAlerts, sendEmailReminder } = require('../controllers/notificationController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/alerts', protect, getAlerts);
router.post('/send-reminder', protect, sendEmailReminder);

module.exports = router;

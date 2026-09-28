const express = require('express');
const {
  generateAgreementDocument,
  generateDeliveryNote,
  generateQuotation,
  generateReturnNote
} = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/agreement/:rentalId', protect, generateAgreementDocument);
router.get('/delivery-note/:rentalId', protect, generateDeliveryNote);
router.post('/quotation', protect, generateQuotation);
router.get('/return-note/:rentalId', protect, generateReturnNote);

module.exports = router;

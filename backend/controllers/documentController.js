const CompanySettings = require('../models/CompanySettings');
const Rental = require('../models/Rental');
const Customer = require('../models/Customer');
const Machine = require('../models/Machine');

// Helper to get company details
const getCompany = async () => {
  let company = await CompanySettings.findOne();
  if (!company) {
    company = await CompanySettings.create({});
  }
  return company;
};

// @desc    Get Agreement Sheet document data payload
// @route   GET /api/documents/agreement/:rentalId
// @access  Private
exports.generateAgreementDocument = async (req, res) => {
  try {
    const { rentalId } = req.params;
    const company = await getCompany();

    const rental = await Rental.findById(rentalId)
      .populate('customer')
      .populate('machines');

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental contract not found'
      });
    }

    res.status(200).json({
      success: true,
      documentType: 'Agreement Sheet',
      data: {
        company,
        rental,
        customer: rental.customer,
        machines: rental.machines,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating agreement document'
    });
  }
};

// @desc    Get Delivery Note document data payload
// @route   GET /api/documents/delivery-note/:rentalId
// @access  Private
exports.generateDeliveryNote = async (req, res) => {
  try {
    const { rentalId } = req.params;
    const company = await getCompany();

    const rental = await Rental.findById(rentalId)
      .populate('customer')
      .populate('machines');

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental contract not found'
      });
    }

    res.status(200).json({
      success: true,
      documentType: 'Delivery Note',
      data: {
        company,
        deliveryNoteId: `DN-${rental.rentalId.replace('RENT-', '')}`,
        rental,
        customer: rental.customer,
        machines: rental.machines,
        dispatchDate: rental.startDate,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating delivery note'
    });
  }
};

// @desc    Get Quotation document data payload
// @route   POST /api/documents/quotation
// @access  Private
exports.generateQuotation = async (req, res) => {
  try {
    const { customerName, customerPhone, items, validDays } = req.body;
    const company = await getCompany();

    const currentYear = new Date().getFullYear();
    const quotationNo = `QTN-${currentYear}-${Math.floor(1000 + Math.random() * 9000)}`;

    const validUntil = new Date();
    validUntil.setDate(validUntil.getDate() + (Number(validDays) || 14));

    res.status(200).json({
      success: true,
      documentType: 'Quotation',
      data: {
        company,
        quotationNo,
        customerName: customerName || 'Valued Client',
        customerPhone: customerPhone || '',
        items: items || [],
        issueDate: new Date(),
        validUntil,
        quotationFooter: company.quotationFooter
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating quotation document'
    });
  }
};

// @desc    Get Return Note document data payload
// @route   GET /api/documents/return-note/:rentalId
// @access  Private
exports.generateReturnNote = async (req, res) => {
  try {
    const { rentalId } = req.params;
    const company = await getCompany();

    const rental = await Rental.findById(rentalId)
      .populate('customer')
      .populate('machines');

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental contract not found'
      });
    }

    res.status(200).json({
      success: true,
      documentType: 'Return Note',
      data: {
        company,
        returnNoteId: `RN-${rental.rentalId.replace('RENT-', '')}`,
        rental,
        customer: rental.customer,
        machines: rental.machines,
        returnedAt: rental.returnDate || new Date()
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error generating return note'
    });
  }
};

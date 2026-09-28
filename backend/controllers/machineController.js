const Machine = require('../models/Machine');
const Rental = require('../models/Rental');

// @desc    Register a new machine (Local / China import or Partner Sub-lease)
// @route   POST /api/machines
// @access  Private
exports.createMachine = async (req, res) => {
  try {
    const {
      serialNumber,
      brand,
      model,
      status,
      isPartnerMachine,
      partnerDetails,
      sourceType,
      importDetails
    } = req.body;

    if (!serialNumber || !model) {
      return res.status(400).json({
        success: false,
        message: 'Serial number and machine model are required.'
      });
    }

    // Check duplicate serial number
    const existingMachine = await Machine.findOne({
      serialNumber: serialNumber.trim()
    });

    if (existingMachine) {
      return res.status(400).json({
        success: false,
        message: `Machine with serial number '${serialNumber}' already exists.`
      });
    }

    // Auto-generate Machine ID format: MAC-YYYY-XXXX
    const currentYear = new Date().getFullYear();
    const count = await Machine.countDocuments();
    const machineId = `MAC-${currentYear}-${(count + 1).toString().padStart(4, '0')}`;

    // Auto-calculate Total Landing Cost if imported
    let calculatedImportDetails = {
      shippingCost: 0,
      taxCost: 0,
      customDuty: 0,
      totalLandingCost: 0
    };

    if (importDetails) {
      const shipping = Number(importDetails.shippingCost) || 0;
      const tax = Number(importDetails.taxCost) || 0;
      const duty = Number(importDetails.customDuty) || 0;
      calculatedImportDetails = {
        shippingCost: shipping,
        taxCost: tax,
        customDuty: duty,
        totalLandingCost: shipping + tax + duty
      };
    }

    const machine = await Machine.create({
      machineId,
      serialNumber: serialNumber.trim(),
      brand: brand ? brand.trim() : 'Juki',
      model: model.trim(),
      status: status || (isPartnerMachine ? 'Partner-Allocated' : 'Available'),
      isPartnerMachine: Boolean(isPartnerMachine),
      partnerDetails: isPartnerMachine
        ? {
            partnerName: partnerDetails?.partnerName || partnerDetails?.name || '',
            partnerRentCost: Number(partnerDetails?.partnerRentCost || partnerDetails?.rentCost) || 0
          }
        : { partnerName: '', partnerRentCost: 0 },
      sourceType: sourceType || 'Local',
      importDetails: calculatedImportDetails
    });

    res.status(201).json({
      success: true,
      data: machine,
      message: 'Machine registered successfully in inventory'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating machine'
    });
  }
};

// @desc    Get all machines with filters & search
// @route   GET /api/machines
// @access  Private
exports.getMachines = async (req, res) => {
  try {
    const { status, brand, sourceType, isPartnerMachine, q } = req.query;

    let filter = {};

    if (status) filter.status = status;
    if (brand) filter.brand = new RegExp(brand, 'i');
    if (sourceType) filter.sourceType = sourceType;
    if (isPartnerMachine !== undefined) {
      filter.isPartnerMachine = isPartnerMachine === 'true';
    }

    if (q) {
      const searchRegex = new RegExp(q, 'i');
      filter.$or = [
        { serialNumber: searchRegex },
        { model: searchRegex },
        { brand: searchRegex },
        { machineId: searchRegex }
      ];
    }

    const machines = await Machine.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: machines.length,
      data: machines
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching machines'
    });
  }
};

// @desc    Direct lookup machine by serial number (with current holder & full rental history)
// @route   GET /api/machines/search?serialNumber=...
// @access  Private
exports.searchBySerialNumber = async (req, res) => {
  try {
    const { serialNumber } = req.query;

    if (!serialNumber) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a serialNumber query parameter'
      });
    }

    const machine = await Machine.findOne({
      serialNumber: new RegExp(`^${serialNumber.trim()}$`, 'i')
    });

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: `No machine found with serial number '${serialNumber}'`
      });
    }

    // Find all rentals involving this machine
    const rentalHistory = await Rental.find({ machines: machine._id })
      .populate('customer')
      .sort({ createdAt: -1 });

    const activeRental = rentalHistory.find((r) => r.status === 'Active');

    res.status(200).json({
      success: true,
      data: {
        machine,
        currentHolder: activeRental ? activeRental.customer : null,
        activeRental: activeRental || null,
        rentalHistory
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error searching machine by serial number'
    });
  }
};

// @desc    Get single machine by ID
// @route   GET /api/machines/:id
// @access  Private
exports.getMachineById = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    const rentalHistory = await Rental.find({ machines: machine._id })
      .populate('customer')
      .sort({ createdAt: -1 });

    const activeRental = rentalHistory.find((r) => r.status === 'Active');

    res.status(200).json({
      success: true,
      data: {
        machine,
        currentHolder: activeRental ? activeRental.customer : null,
        activeRental: activeRental || null,
        rentalHistory
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching machine details'
    });
  }
};

// @desc    Update machine details
// @route   PUT /api/machines/:id
// @access  Private
exports.updateMachine = async (req, res) => {
  try {
    let machine = await Machine.findById(req.params.id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    // Recalculate landing cost if importDetails provided
    if (req.body.importDetails) {
      const shipping = Number(req.body.importDetails.shippingCost) || 0;
      const tax = Number(req.body.importDetails.taxCost) || 0;
      const duty = Number(req.body.importDetails.customDuty) || 0;
      req.body.importDetails.totalLandingCost = shipping + tax + duty;
    }

    machine = await Machine.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: machine,
      message: 'Machine details updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating machine'
    });
  }
};

const Machine = require('../models/Machine');
const Rental = require('../models/Rental');
const CompanySettings = require('../models/CompanySettings');

// @desc    Register a new machine / SKU in Machinery Master
// @route   POST /api/machines
// @access  Private (Admin, Staff)
exports.createMachine = async (req, res) => {
  try {
    const {
      sku,
      serialNumber,
      brand,
      model,
      modelSpecs,
      initialBatchSets,
      unit,
      fobUsd,
      customsDutyLkr,
      wholesaleBenchmarkLkr,
      retailBenchmarkLkr,
      serialNumbers,
      partnerShare,
      status,
      isPartnerMachine,
      partnerDetails,
      sourceType,
      importDetails
    } = req.body;

    if (!model) {
      return res.status(400).json({
        success: false,
        message: 'Machine model is required.'
      });
    }

    // Get current USD to LKR Exchange Rate
    const settings = await CompanySettings.findOne();
    const rate = settings?.usdToLkrRate || 330;

    const fob = Number(fobUsd) || 0;
    const duty = Number(customsDutyLkr) || Number(importDetails?.customDuty) || 0;
    const landedCostLkr = Math.round(fob * rate + duty);

    // SKU generation if missing
    const currentYear = new Date().getFullYear();
    const count = await Machine.countDocuments();
    const generatedSku = sku || `JK-SKU-${(count + 1).toString().padStart(4, '0')}`;
    const machineId = `MAC-${currentYear}-${(count + 1).toString().padStart(4, '0')}`;

    const batchSets = Number(initialBatchSets) || 1;
    const serialList = Array.isArray(serialNumbers)
      ? serialNumbers
      : typeof serialNumbers === 'string' && serialNumbers.trim()
      ? serialNumbers.split(',').map((s) => s.trim())
      : serialNumber
      ? [serialNumber.trim()]
      : [];

    const machine = await Machine.create({
      machineId,
      sku: generatedSku.trim(),
      serialNumber: serialNumber ? serialNumber.trim() : (serialList[0] || generatedSku),
      brand: brand ? brand.trim() : 'Juki',
      model: model.trim(),
      modelSpecs: modelSpecs ? modelSpecs.trim() : '',
      initialBatchSets: batchSets,
      dispatchedCounts: 0,
      availableSets: batchSets,
      unit: unit || 'Set',
      fobUsd: fob,
      customsDutyLkr: duty,
      landedCostLkr: landedCostLkr || Number(importDetails?.totalLandingCost) || 0,
      wholesaleBenchmarkLkr: Number(wholesaleBenchmarkLkr) || Math.round(landedCostLkr * 1.25),
      retailBenchmarkLkr: Number(retailBenchmarkLkr) || Math.round(landedCostLkr * 1.45),
      serialNumbers: serialList,
      partnerShare: partnerShare || 'Consortium',
      status: status || 'Available',
      isPartnerMachine: Boolean(isPartnerMachine),
      partnerDetails: isPartnerMachine
        ? {
            partnerName: partnerDetails?.partnerName || '',
            partnerRentCost: Number(partnerDetails?.partnerRentCost) || 0
          }
        : { partnerName: '', partnerRentCost: 0 },
      sourceType: sourceType || 'Local',
      importDetails: {
        shippingCost: Number(importDetails?.shippingCost) || 0,
        taxCost: Number(importDetails?.taxCost) || 0,
        customDuty: duty,
        totalLandingCost: landedCostLkr
      }
    });

    res.status(201).json({
      success: true,
      data: machine,
      message: 'Equipment registered successfully in Machinery Master'
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
    const { status, brand, sourceType, isPartnerMachine, partnerShare, q } = req.query;

    let filter = {};

    if (status) filter.status = status;
    if (brand) filter.brand = new RegExp(brand, 'i');
    if (sourceType) filter.sourceType = sourceType;
    if (partnerShare) filter.partnerShare = partnerShare;
    if (isPartnerMachine !== undefined) {
      filter.isPartnerMachine = isPartnerMachine === 'true';
    }

    if (q) {
      const searchRegex = new RegExp(q, 'i');
      filter.$or = [
        { sku: searchRegex },
        { serialNumber: searchRegex },
        { serialNumbers: searchRegex },
        { model: searchRegex },
        { modelSpecs: searchRegex },
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

// @desc    Direct lookup machine by serial number
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

    const searchRegex = new RegExp(`^${serialNumber.trim()}$`, 'i');
    const machine = await Machine.findOne({
      $or: [{ serialNumber: searchRegex }, { serialNumbers: searchRegex }, { sku: searchRegex }]
    });

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: `No machine found with serial/SKU '${serialNumber}'`
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
      message: error.message || 'Server error searching machine'
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
// @access  Private (Admin, Staff)
exports.updateMachine = async (req, res) => {
  try {
    let machine = await Machine.findById(req.params.id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    // Recalculate landed cost if FOB or Duty updated
    const settings = await CompanySettings.findOne();
    const rate = settings?.usdToLkrRate || 330;

    const fob = req.body.fobUsd !== undefined ? Number(req.body.fobUsd) : machine.fobUsd;
    const duty = req.body.customsDutyLkr !== undefined ? Number(req.body.customsDutyLkr) : machine.customsDutyLkr;
    req.body.landedCostLkr = Math.round(fob * rate + duty);

    if (req.body.serialNumbers && typeof req.body.serialNumbers === 'string') {
      req.body.serialNumbers = req.body.serialNumbers.split(',').map((s) => s.trim());
    }

    if (req.body.initialBatchSets !== undefined) {
      const dispatched = machine.dispatchedCounts || 0;
      req.body.availableSets = Math.max(0, Number(req.body.initialBatchSets) - dispatched);
      if (req.body.availableSets === 0) {
        req.body.status = 'Out of Stock';
      } else if (req.body.availableSets < 5 && machine.status !== 'Rented' && machine.status !== 'Maintenance') {
        req.body.status = 'Low Stock';
      } else if (machine.status !== 'Rented' && machine.status !== 'Maintenance') {
        req.body.status = 'Available';
      }
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

// @desc    Delete machine
// @route   DELETE /api/machines/:id
// @access  Private (Admin, Staff)
exports.deleteMachine = async (req, res) => {
  try {
    const machine = await Machine.findById(req.params.id);

    if (!machine) {
      return res.status(404).json({
        success: false,
        message: 'Machine not found'
      });
    }

    await Machine.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: `Equipment SKU ${machine.sku} (${machine.brand} ${machine.model}) deleted successfully`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting machine'
    });
  }
};

// @desc    Export Machinery Master to CSV
// @route   GET /api/machines/export/csv
// @access  Private (Admin)
exports.exportCsv = async (req, res) => {
  try {
    const machines = await Machine.find().sort({ createdAt: -1 });

    let csv = 'SKU,Brand,Model,ModelSpecs,BatchSets,Dispatched,Available,FOB_USD,Duty_LKR,LandedCost_LKR,Wholesale_LKR,Retail_LKR,PartnerShare,Status,SerialNumbers\n';

    machines.forEach((m) => {
      const serials = (m.serialNumbers || []).join(';');
      csv += `"${m.sku}","${m.brand}","${m.model}","${m.modelSpecs || ''}",${m.initialBatchSets},${m.dispatchedCounts},${m.availableSets},${m.fobUsd},${m.customsDutyLkr},${m.landedCostLkr},${m.wholesaleBenchmarkLkr},${m.retailBenchmarkLkr},"${m.partnerShare}","${m.status}","${serials}"\n`;
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=MachineryMaster_Export.csv');
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error exporting CSV'
    });
  }
};

// @desc    Import Machinery Master from CSV / JSON array
// @route   POST /api/machines/import/csv
// @access  Private (Admin)
exports.importCsv = async (req, res) => {
  try {
    const { items } = req.body;

    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        message: 'Request body must contain an array of inventory items in "items".'
      });
    }

    const settings = await CompanySettings.findOne();
    const rate = settings?.usdToLkrRate || 330;

    let importedCount = 0;
    for (const item of items) {
      const fob = Number(item.fobUsd || item.FOB_USD) || 0;
      const duty = Number(item.customsDutyLkr || item.Duty_LKR) || 0;
      const landed = Math.round(fob * rate + duty);

      const sku = item.sku || item.SKU || `JK-SKU-${Date.now().toString().slice(-4)}`;
      const batchSets = Number(item.initialBatchSets || item.BatchSets) || 1;

      await Machine.findOneAndUpdate(
        { sku },
        {
          sku,
          brand: item.brand || item.Brand || 'Juki',
          model: item.model || item.Model || 'Standard Lockstitch',
          modelSpecs: item.modelSpecs || item.ModelSpecs || '',
          initialBatchSets: batchSets,
          unit: item.unit || 'Set',
          fobUsd: fob,
          customsDutyLkr: duty,
          landedCostLkr: landed,
          wholesaleBenchmarkLkr: Number(item.wholesaleBenchmarkLkr || item.Wholesale_LKR) || Math.round(landed * 1.25),
          retailBenchmarkLkr: Number(item.retailBenchmarkLkr || item.Retail_LKR) || Math.round(landed * 1.45),
          partnerShare: item.partnerShare || item.PartnerShare || 'Consortium',
          status: item.status || item.Status || 'Available'
        },
        { upsert: true, new: true }
      );
      importedCount++;
    }

    res.status(200).json({
      success: true,
      count: importedCount,
      message: `Successfully imported ${importedCount} machinery master items.`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error importing inventory'
    });
  }
};

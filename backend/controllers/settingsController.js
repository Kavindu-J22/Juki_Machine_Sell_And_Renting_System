const CompanySettings = require('../models/CompanySettings');
const Machine = require('../models/Machine');
const SalesLedger = require('../models/SalesLedger');
const PartnerLedger = require('../models/PartnerLedger');
const Customer = require('../models/Customer');

// @desc    Get company settings
// @route   GET /api/settings
// @access  Private
exports.getSettings = async (req, res) => {
  try {
    let settings = await CompanySettings.findOne();

    if (!settings) {
      settings = await CompanySettings.create({});
    }

    res.status(200).json({
      success: true,
      data: settings
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching settings'
    });
  }
};

// @desc    Update company settings
// @route   PUT /api/settings
// @access  Private/Admin
exports.updateSettings = async (req, res) => {
  try {
    let settings = await CompanySettings.findOne();

    if (!settings) {
      settings = await CompanySettings.create(req.body);
    } else {
      settings = await CompanySettings.findByIdAndUpdate(settings._id, req.body, {
        new: true,
        runValidators: true
      });
    }

    res.status(200).json({
      success: true,
      data: settings,
      message: 'Consortium settings updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating settings'
    });
  }
};

// @desc    Update Global USD-to-LKR Exchange Rate Anchor & Recalculate Inventory Landed Costs
// @route   PUT /api/settings/exchange-rate
// @access  Private/Admin
exports.updateExchangeRate = async (req, res) => {
  try {
    const { usdToLkrRate } = req.body;
    const newRate = Number(usdToLkrRate);

    if (!newRate || newRate <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid exchange rate number.'
      });
    }

    let settings = await CompanySettings.findOne();
    if (!settings) {
      settings = await CompanySettings.create({ usdToLkrRate: newRate });
    } else {
      settings.usdToLkrRate = newRate;
      await settings.save();
    }

    // Recalculate landed costs for all machinery in database
    const machines = await Machine.find();
    let updatedCount = 0;

    for (const machine of machines) {
      const fob = machine.fobUsd || 0;
      const duty = machine.customsDutyLkr || 0;
      const newLandedCost = Math.round(fob * newRate + duty);

      machine.landedCostLkr = newLandedCost;
      machine.wholesaleBenchmarkLkr = Math.round(newLandedCost * 1.25);
      machine.retailBenchmarkLkr = Math.round(newLandedCost * 1.45);
      await machine.save();
      updatedCount++;
    }

    res.status(200).json({
      success: true,
      data: {
        usdToLkrRate: newRate,
        recalculatedMachinesCount: updatedCount
      },
      message: `Global exchange rate updated to 1 USD = ${newRate} LKR. Instant landed cost recalculation completed for ${updatedCount} equipment SKUs.`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating exchange rate'
    });
  }
};

// @desc    JSON Backup of complete database
// @route   GET /api/settings/backup
// @access  Private/Admin
exports.backupDatabase = async (req, res) => {
  try {
    const settings = await CompanySettings.findOne();
    const machines = await Machine.find();
    const sales = await SalesLedger.find();
    const partnerLedgers = await PartnerLedger.find();
    const customers = await Customer.find();

    const backup = {
      version: '2.0.0',
      system: 'Anujaya & Global Enterprises ERP',
      exportedAt: new Date(),
      settings,
      machines,
      sales,
      partnerLedgers,
      customers
    };

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename=AnujayaGlobal_ERP_Backup.json');
    res.status(200).json(backup);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error generating database backup'
    });
  }
};

// @desc    JSON Restore of database
// @route   POST /api/settings/restore
// @access  Private/Admin
exports.restoreDatabase = async (req, res) => {
  try {
    const { machines, sales, partnerLedgers, customers, settings } = req.body;

    if (settings) {
      await CompanySettings.deleteMany({});
      await CompanySettings.create(settings);
    }

    if (Array.isArray(machines)) {
      await Machine.deleteMany({});
      await Machine.insertMany(machines);
    }

    if (Array.isArray(sales)) {
      await SalesLedger.deleteMany({});
      await SalesLedger.insertMany(sales);
    }

    if (Array.isArray(partnerLedgers)) {
      await PartnerLedger.deleteMany({});
      await PartnerLedger.insertMany(partnerLedgers);
    }

    if (Array.isArray(customers)) {
      await Customer.deleteMany({});
      await Customer.insertMany(customers);
    }

    res.status(200).json({
      success: true,
      message: 'System database successfully restored from JSON backup package.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error restoring database'
    });
  }
};

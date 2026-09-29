const SalesLedger = require('../models/SalesLedger');
const Machine = require('../models/Machine');
const Customer = require('../models/Customer');
const CompanySettings = require('../models/CompanySettings');

// @desc    Create POS Sales Dispatch & Tax Invoice
// @route   POST /api/sales-ledger
// @access  Private (Admin, Staff)
exports.createDispatch = async (req, res) => {
  try {
    const {
      customer,
      customerDetails,
      items,
      isSvatExempt,
      paymentStatus,
      amountPaidLkr,
      warrantyMonths,
      notes
    } = req.body;

    if (!items || !items.length) {
      return res.status(400).json({
        success: false,
        message: 'Sales dispatch must include at least one machinery line item.'
      });
    }

    // Auto generate Invoice No: INV-2026-XXXX
    const year = new Date().getFullYear();
    const count = await SalesLedger.countDocuments();
    const invoiceNo = `INV-${year}-${(count + 1).toString().padStart(4, '0')}`;

    // Get consortium settings
    const settings = await CompanySettings.findOne();
    const vatRate = isSvatExempt ? 0 : settings?.taxDetails?.taxRatePercentage || 18;

    let subtotalLkr = 0;
    let totalCogsLkr = 0;
    const processedItems = [];

    // Process each item and validate/deduct inventory stock
    for (const item of items) {
      const machineDoc = await Machine.findById(item.machine || item._id);
      if (machineDoc) {
        if (machineDoc.availableSets < (item.qty || 1)) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for SKU ${machineDoc.sku} (${machineDoc.model}). Available: ${machineDoc.availableSets}, Requested: ${item.qty || 1}`
          });
        }

        // Deduct inventory count
        machineDoc.dispatchedCounts = (machineDoc.dispatchedCounts || 0) + Number(item.qty || 1);
        await machineDoc.save();

        const unitPrice = Number(item.unitPriceLkr) || machineDoc.retailBenchmarkLkr || 0;
        const qty = Number(item.qty) || 1;
        const itemTotal = unitPrice * qty;
        const itemCogs = (machineDoc.landedCostLkr || 0) * qty;

        subtotalLkr += itemTotal;
        totalCogsLkr += itemCogs;

        processedItems.push({
          machine: machineDoc._id,
          sku: machineDoc.sku,
          brand: machineDoc.brand,
          model: machineDoc.model,
          qty,
          unitPriceLkr: unitPrice,
          totalLkr: itemTotal,
          serialsTracked: Array.isArray(item.serialsTracked)
            ? item.serialsTracked
            : item.serialsTracked
            ? item.serialsTracked.split(',').map((s) => s.trim())
            : [],
          cogsLkr: itemCogs
        });
      } else {
        // Direct custom item
        const unitPrice = Number(item.unitPriceLkr) || 0;
        const qty = Number(item.qty) || 1;
        const itemTotal = unitPrice * qty;
        const itemCogs = Number(item.cogsLkr) || 0;

        subtotalLkr += itemTotal;
        totalCogsLkr += itemCogs;

        processedItems.push({
          sku: item.sku || 'CUSTOM-SKU',
          brand: item.brand || 'Consortium',
          model: item.model || 'Machinery Unit',
          qty,
          unitPriceLkr: unitPrice,
          totalLkr: itemTotal,
          serialsTracked: Array.isArray(item.serialsTracked)
            ? item.serialsTracked
            : item.serialsTracked
            ? item.serialsTracked.split(',').map((s) => s.trim())
            : [],
          cogsLkr: itemCogs
        });
      }
    }

    const vatAmountLkr = Math.round((subtotalLkr * vatRate) / 100);
    const grandTotalLkr = subtotalLkr + vatAmountLkr;
    const realizedNetLkr = grandTotalLkr - totalCogsLkr;

    const paid = Number(amountPaidLkr) || 0;
    const outstanding = Math.max(0, grandTotalLkr - paid);

    let status = paymentStatus || 'Pending';
    if (paid >= grandTotalLkr) {
      status = 'Paid';
    } else if (paid > 0) {
      status = 'Partial';
    }

    // 50/50 Partner Profit Split
    const anujayaShare = settings?.partnerEquity?.anujayaSharePercent || 50;
    const globalShare = settings?.partnerEquity?.globalSharePercent || 50;

    const partnerSplit = {
      anujayaNet: Math.round((realizedNetLkr * anujayaShare) / 100),
      globalNet: Math.round((realizedNetLkr * globalShare) / 100)
    };

    const paymentLogs = [];
    if (paid > 0) {
      paymentLogs.push({
        amount: paid,
        date: new Date(),
        paymentMethod: 'Initial Dispatch Payment',
        reference: `INV-${invoiceNo}`,
        notes: 'Initial payment recorded at POS dispatch'
      });
    }

    const dispatchRecord = await SalesLedger.create({
      invoiceNo,
      customer: customer || null,
      customerDetails: customerDetails || {
        name: 'Apparel Factory Client',
        factoryName: 'Partner Apparel Ltd'
      },
      items: processedItems,
      subtotalLkr,
      vatRate,
      vatAmountLkr,
      svatNumber: isSvatExempt ? settings?.taxDetails?.svatNumber || 'SVAT-100293' : '',
      isSvatExempt: Boolean(isSvatExempt),
      grandTotalLkr,
      totalCogsLkr,
      realizedNetLkr,
      paymentStatus: status,
      amountPaidLkr: paid,
      outstandingBalanceLkr: outstanding,
      partnerSplit,
      paymentLogs,
      warrantyMonths: Number(warrantyMonths) || 12,
      notes: notes || '',
      createdBy: req.user?._id
    });

    // Update customer total turnover and outstanding balance if linked
    if (customer) {
      const custDoc = await Customer.findById(customer);
      if (custDoc) {
        custDoc.totalTurnover = (custDoc.totalTurnover || 0) + grandTotalLkr;
        custDoc.outstandingBalance = (custDoc.outstandingBalance || 0) + outstanding;
        await custDoc.save();
      }
    }

    res.status(201).json({
      success: true,
      data: dispatchRecord,
      message: 'Sales dispatch recorded successfully. Tax invoice generated.'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating sales dispatch'
    });
  }
};

// @desc    Get all sales dispatches & invoices
// @route   GET /api/sales-ledger
// @access  Private
exports.getDispatches = async (req, res) => {
  try {
    const { paymentStatus, customerId, q } = req.query;

    let filter = {};

    if (paymentStatus) filter.paymentStatus = paymentStatus;
    if (customerId) filter.customer = customerId;

    // Filter by Partner shareholding if Partner logged in
    if (req.user?.role === 'Partner' && req.user?.partnerName) {
      // Partner sees all consortium dispatches relevant to their equity
    }

    // Filter by Client customer account if Client logged in
    if (req.user?.role === 'Client' && req.user?.customerRef) {
      filter.customer = req.user.customerRef;
    }

    if (q) {
      const searchRegex = new RegExp(q, 'i');
      filter.$or = [
        { invoiceNo: searchRegex },
        { 'customerDetails.name': searchRegex },
        { 'customerDetails.factoryName': searchRegex }
      ];
    }

    const dispatches = await SalesLedger.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: dispatches.length,
      data: dispatches
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching dispatches'
    });
  }
};

// @desc    Record partial or full payment collection
// @route   POST /api/sales-ledger/:id/payment
// @access  Private (Admin, Staff)
exports.recordCollection = async (req, res) => {
  try {
    const { amount, paymentMethod, reference, notes } = req.body;
    const dispatch = await SalesLedger.findById(req.params.id);

    if (!dispatch) {
      return res.status(404).json({
        success: false,
        message: 'Invoice dispatch record not found'
      });
    }

    const collectionAmount = Number(amount) || 0;
    if (collectionAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please specify a valid payment collection amount.'
      });
    }

    dispatch.amountPaidLkr += collectionAmount;
    dispatch.outstandingBalanceLkr = Math.max(0, dispatch.grandTotalLkr - dispatch.amountPaidLkr);

    if (dispatch.outstandingBalanceLkr === 0) {
      dispatch.paymentStatus = 'Paid';
    } else {
      dispatch.paymentStatus = 'Partial';
    }

    dispatch.paymentLogs.push({
      amount: collectionAmount,
      date: new Date(),
      paymentMethod: paymentMethod || 'Bank Wire',
      reference: reference || '',
      notes: notes || ''
    });

    await dispatch.save();

    // Update customer outstanding balance if linked
    if (dispatch.customer) {
      const custDoc = await Customer.findById(dispatch.customer);
      if (custDoc) {
        custDoc.outstandingBalance = Math.max(0, (custDoc.outstandingBalance || 0) - collectionAmount);
        await custDoc.save();
      }
    }

    res.status(200).json({
      success: true,
      data: dispatch,
      message: `Payment collection of LKR ${collectionAmount.toLocaleString()} recorded successfully.`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error recording payment collection'
    });
  }
};

// @desc    Get single invoice details for printing
// @route   GET /api/sales-ledger/:id
// @access  Private
exports.getInvoiceById = async (req, res) => {
  try {
    const dispatch = await SalesLedger.findById(req.params.id);
    if (!dispatch) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found'
      });
    }

    const settings = await CompanySettings.findOne();

    res.status(200).json({
      success: true,
      data: {
        invoice: dispatch,
        consortium: settings
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching invoice'
    });
  }
};

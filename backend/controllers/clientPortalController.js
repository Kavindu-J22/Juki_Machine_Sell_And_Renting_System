const SalesLedger = require('../models/SalesLedger');
const ServiceRequest = require('../models/ServiceRequest');
const Customer = require('../models/Customer');

// @desc    Get Client Dashboard Stats & Purchased Machinery History
// @route   GET /api/client-portal/dashboard
// @access  Private (Client, Admin)
exports.getClientDashboard = async (req, res) => {
  try {
    const customerId = req.user?.customerRef || req.query.customerId;

    if (!customerId) {
      return res.status(400).json({
        success: false,
        message: 'No client customer account linked to user.'
      });
    }

    const customer = await Customer.findById(customerId);
    const dispatches = await SalesLedger.find({ customer: customerId }).sort({ createdAt: -1 });
    const serviceRequests = await ServiceRequest.find({ client: customerId }).sort({ createdAt: -1 });

    // Extract purchased machines and active serial numbers
    const equipmentHistory = [];
    dispatches.forEach((dispatch) => {
      dispatch.items.forEach((item) => {
        equipmentHistory.push({
          invoiceNo: dispatch.invoiceNo,
          dispatchDate: dispatch.dispatchDate,
          sku: item.sku,
          brand: item.brand,
          model: item.model,
          qty: item.qty,
          serialsTracked: item.serialsTracked || [],
          warrantyMonths: dispatch.warrantyMonths || 12,
          paymentStatus: dispatch.paymentStatus
        });
      });
    });

    res.status(200).json({
      success: true,
      data: {
        customer,
        equipmentHistory,
        invoices: dispatches,
        serviceRequests
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching client dashboard'
    });
  }
};

// @desc    File a Service / Maintenance Request for a Machine Unit
// @route   POST /api/client-portal/service-request
// @access  Private (Client, Admin)
exports.createServiceRequest = async (req, res) => {
  try {
    const customerId = req.user?.customerRef || req.body.customerId;
    const { machineSerial, machineModel, issueTitle, issueDescription, priority } = req.body;

    if (!machineSerial || !issueTitle) {
      return res.status(400).json({
        success: false,
        message: 'Machine serial number and issue title are required.'
      });
    }

    const customer = await Customer.findById(customerId);
    const count = await ServiceRequest.countDocuments();
    const ticketNo = `SR-${new Date().getFullYear()}-${(count + 1).toString().padStart(4, '0')}`;

    const serviceTicket = await ServiceRequest.create({
      ticketNo,
      client: customerId,
      clientName: customer?.name || req.user?.name || 'Apparel Factory',
      machineSerial,
      machineModel: machineModel || '',
      issueTitle,
      issueDescription: issueDescription || '',
      priority: priority || 'Medium',
      status: 'Open'
    });

    res.status(201).json({
      success: true,
      data: serviceTicket,
      message: `Service ticket ${ticketNo} filed successfully.`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error filing service request'
    });
  }
};

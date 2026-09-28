const Customer = require('../models/Customer');
const Rental = require('../models/Rental');
const Machine = require('../models/Machine');

// @desc    Register new customer
// @route   POST /api/customers
// @access  Private
exports.createCustomer = async (req, res) => {
  try {
    const { name, nic, phone, address, status } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Customer name and phone number are required.'
      });
    }

    // Auto-generate customer ID format: CUST-YYYY-XXXX
    const currentYear = new Date().getFullYear();
    const count = await Customer.countDocuments();
    const customerId = `CUST-${currentYear}-${(count + 1).toString().padStart(4, '0')}`;

    const customer = await Customer.create({
      customerId,
      name,
      nic: nic ? nic.trim() : '',
      phone: phone.trim(),
      address: address ? address.trim() : '',
      status: status || 'Active'
    });

    res.status(201).json({
      success: true,
      data: customer,
      message: 'Customer registered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating customer'
    });
  }
};

// @desc    Get all customers with search & status filters
// @route   GET /api/customers
// @access  Private
exports.getCustomers = async (req, res) => {
  try {
    const { q, status } = req.query;

    let filter = {};

    if (status) {
      filter.status = status;
    }

    if (q) {
      const searchRegex = new RegExp(q, 'i');
      filter.$or = [
        { name: searchRegex },
        { phone: searchRegex },
        { nic: searchRegex },
        { customerId: searchRegex }
      ];
    }

    const customers = await Customer.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: customers.length,
      data: customers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching customers'
    });
  }
};

// @desc    Get single customer profile with full rental history & assigned machines
// @route   GET /api/customers/:id
// @access  Private
exports.getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Fetch all rentals for this customer
    const rentals = await Rental.find({ customer: customer._id })
      .populate('machines')
      .sort({ createdAt: -1 });

    // Extract active assigned machines
    const activeRentals = rentals.filter((r) => r.status === 'Active');
    const assignedMachines = activeRentals.flatMap((r) => r.machines);

    res.status(200).json({
      success: true,
      data: {
        customer,
        rentals,
        assignedMachines,
        stats: {
          totalRentals: rentals.length,
          activeRentalsCount: activeRentals.length,
          currentlyAssignedMachinesCount: assignedMachines.length
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching customer details'
    });
  }
};

// @desc    Update customer details
// @route   PUT /api/customers/:id
// @access  Private
exports.updateCustomer = async (req, res) => {
  try {
    let customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: customer,
      message: 'Customer profile updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating customer'
    });
  }
};

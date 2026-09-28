const mongoose = require('mongoose');
const Rental = require('../models/Rental');
const Machine = require('../models/Machine');
const Customer = require('../models/Customer');

// @desc    Create a new rental contract (Assign machine(s) to customer)
// @route   POST /api/rentals
// @access  Private
exports.createRental = async (req, res) => {
  try {
    const {
      customerId,
      machineIds,
      startDate,
      dueDate,
      monthlyRentAmount,
      depositAmount
    } = req.body;

    if (!customerId || !machineIds || !machineIds.length || !dueDate || !monthlyRentAmount) {
      return res.status(400).json({
        success: false,
        message: 'Customer, at least one machine, due date, and monthly rent amount are required.'
      });
    }

    // Verify customer exists
    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Verify all machines exist and are available
    const machines = await Machine.find({ _id: { $in: machineIds } });
    if (machines.length !== machineIds.length) {
      return res.status(400).json({
        success: false,
        message: 'One or more selected machines do not exist.'
      });
    }

    const unavailableMachines = machines.filter((m) => m.status !== 'Available');
    if (unavailableMachines.length > 0) {
      const serials = unavailableMachines.map((m) => m.serialNumber).join(', ');
      return res.status(400).json({
        success: false,
        message: `Machine(s) [${serials}] are currently not Available for rental.`
      });
    }

    // Auto-generate Rental ID format: RENT-YYYY-XXXX
    const currentYear = new Date().getFullYear();
    const count = await Rental.countDocuments();
    const rentalId = `RENT-${currentYear}-${(count + 1).toString().padStart(4, '0')}`;

    // Create rental record
    const rental = await Rental.create({
      rentalId,
      customer: customer._id,
      machines: machineIds,
      startDate: startDate || new Date(),
      dueDate: new Date(dueDate),
      monthlyRentAmount: Number(monthlyRentAmount),
      depositAmount: Number(depositAmount) || 0,
      status: 'Active'
    });

    // Update machines' status to 'Rented'
    await Machine.updateMany(
      { _id: { $in: machineIds } },
      { $set: { status: 'Rented' } }
    );

    // Update customer status to Active
    if (customer.status !== 'Active') {
      customer.status = 'Active';
      await customer.save();
    }

    const populatedRental = await Rental.findById(rental._id)
      .populate('customer')
      .populate('machines');

    res.status(201).json({
      success: true,
      data: populatedRental,
      message: 'Rental contract created and machines assigned successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating rental contract'
    });
  }
};

// @desc    Get all rental contracts
// @route   GET /api/rentals
// @access  Private
exports.getRentals = async (req, res) => {
  try {
    const { status, customerId } = req.query;

    let filter = {};
    if (status) filter.status = status;
    if (customerId) filter.customer = customerId;

    const rentals = await Rental.find(filter)
      .populate('customer')
      .populate('machines')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: rentals.length,
      data: rentals
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching rentals'
    });
  }
};

// @desc    Get single rental contract
// @route   GET /api/rentals/:id
// @access  Private
exports.getRentalById = async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id)
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
      data: rental
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching rental contract'
    });
  }
};

// @desc    Process Machine Return & Stock Adjustment
// @route   POST /api/rentals/:rentalId/return
// @access  Private
exports.returnRental = async (req, res) => {
  try {
    const { rentalId } = req.params;

    // Find rental by rentalId or _id
    const rental = await Rental.findOne({
      $or: [{ _id: mongoose.isValidObjectId(rentalId) ? rentalId : null }, { rentalId }]
    }).populate('machines');

    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental contract not found'
      });
    }

    if (rental.status === 'Returned') {
      return res.status(400).json({
        success: false,
        message: 'This rental contract has already been marked as Returned.'
      });
    }

    const returnDate = new Date();

    // 1. Update rental status to 'Returned' & set returnDate
    rental.status = 'Returned';
    rental.returnDate = returnDate;
    await rental.save();

    // 2. Update machine status back to 'Available'
    const machineIds = rental.machines.map((m) => m._id);
    await Machine.updateMany(
      { _id: { $in: machineIds } },
      { $set: { status: 'Available' } }
    );

    // Calculate days rented and billing cycle adjustment summary
    const startMs = new Date(rental.startDate).getTime();
    const returnMs = returnDate.getTime();
    const diffDays = Math.ceil((returnMs - startMs) / (1000 * 60 * 60 * 24));

    // Check if customer has any remaining active rentals
    const otherActiveRentals = await Rental.countDocuments({
      customer: rental.customer,
      status: 'Active'
    });

    if (otherActiveRentals === 0) {
      await Customer.findByIdAndUpdate(rental.customer, { status: 'Completed' });
    }

    res.status(200).json({
      success: true,
      data: {
        rental,
        returnedMachinesCount: machineIds.length,
        daysRented: diffDays,
        billingAdjustment: {
          status: 'Billing Stopped',
          stoppedFromDate: returnDate,
          monthlyRateWas: rental.monthlyRentAmount
        }
      },
      message: `Machine return processed successfully! ${machineIds.length} unit(s) restored to Available stock.`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error processing machine return'
    });
  }
};

const Payment = require('../models/Payment');
const Customer = require('../models/Customer');
const Rental = require('../models/Rental');

// @desc    Add a new rent payment
// @route   POST /api/payments
// @access  Private
exports.createPayment = async (req, res) => {
  try {
    const {
      customerId,
      rentalId,
      amountPaid,
      newCharges,
      previousBalance,
      paymentMethod,
      remarks
    } = req.body;

    if (!customerId || !amountPaid) {
      return res.status(400).json({
        success: false,
        message: 'Customer and amount paid are required.'
      });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    const prevBal = Number(previousBalance) || 0;
    const addedCharges = Number(newCharges) || 0;
    const paid = Number(amountPaid) || 0;

    // Formula: Balance = Previous Balance + New Charges - Payment
    const calculatedNewBalance = prevBal + addedCharges - paid;

    // Auto-generate Payment ID: PAY-YYYY-XXXX
    const currentYear = new Date().getFullYear();
    const count = await Payment.countDocuments();
    const paymentId = `PAY-${currentYear}-${(count + 1).toString().padStart(4, '0')}`;

    const payment = await Payment.create({
      paymentId,
      customer: customer._id,
      rental: rentalId || null,
      amountPaid: paid,
      paymentDate: new Date(),
      paymentMethod: paymentMethod || 'Cash',
      previousBalance: prevBal,
      newBalance: calculatedNewBalance,
      remarks: remarks ? remarks.trim() : ''
    });

    // Update customer status if overdue/settled
    if (calculatedNewBalance <= 0 && customer.status === 'Overdue') {
      customer.status = 'Active';
      await customer.save();
    }

    const populatedPayment = await Payment.findById(payment._id)
      .populate('customer')
      .populate({
        path: 'rental',
        populate: { path: 'machines' }
      });

    res.status(201).json({
      success: true,
      data: populatedPayment,
      message: `Payment of LKR ${paid.toLocaleString()} recorded successfully! New Balance: LKR ${calculatedNewBalance.toLocaleString()}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error recording payment'
    });
  }
};

// @desc    Get all payments
// @route   GET /api/payments
// @access  Private
exports.getPayments = async (req, res) => {
  try {
    const payments = await Payment.find()
      .populate('customer')
      .populate('rental')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      data: payments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching payments'
    });
  }
};

// @desc    Get customer payment history & consolidated total across all rented machines
// @route   GET /api/payments/customer/:customerId
// @access  Private
exports.getCustomerPayments = async (req, res) => {
  try {
    const { customerId } = req.params;

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found'
      });
    }

    // Fetch all payments for this customer
    const payments = await Payment.find({ customer: customer._id })
      .populate('rental')
      .sort({ paymentDate: -1 });

    // Fetch all rentals for customer
    const rentals = await Rental.find({ customer: customer._id })
      .populate('machines')
      .sort({ createdAt: -1 });

    // Calculate consolidated totals
    const totalAmountPaid = payments.reduce((sum, p) => sum + p.amountPaid, 0);
    const totalMonthlyRentSum = rentals
      .filter((r) => r.status === 'Active')
      .reduce((sum, r) => sum + r.monthlyRentAmount, 0);

    const totalMachinesCount = rentals
      .filter((r) => r.status === 'Active')
      .reduce((sum, r) => sum + r.machines.length, 0);

    res.status(200).json({
      success: true,
      data: {
        customer,
        payments,
        rentals,
        summary: {
          totalPaymentsCount: payments.length,
          totalAmountPaidSum: totalAmountPaid,
          activeMonthlyRentSum: totalMonthlyRentSum,
          currentlyRentedMachinesCount: totalMachinesCount,
          latestBalance: payments.length > 0 ? payments[0].newBalance : 0
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching customer payment history'
    });
  }
};

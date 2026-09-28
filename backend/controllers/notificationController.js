const Rental = require('../models/Rental');
const Customer = require('../models/Customer');
const { sendPaymentReminderEmail } = require('../utils/emailSender');

// @desc    Get color-coded payment alert groups (7 days, 3 days, due today, overdue)
// @route   GET /api/notifications/alerts
// @access  Private
exports.getAlerts = async (req, res) => {
  try {
    const activeRentals = await Rental.find({ status: { $in: ['Active', 'Overdue'] } })
      .populate('customer')
      .populate('machines');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const alerts = {
      sevenDays: [],  // 5 to 7 days remaining
      threeDays: [],  // 1 to 4 days remaining
      dueToday: [],   // 0 days remaining
      overdue: []     // Past due date
    };

    for (let rental of activeRentals) {
      const dueDate = new Date(rental.dueDate);
      dueDate.setHours(0, 0, 0, 0);

      const diffTime = dueDate.getTime() - today.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      const rentalObj = rental.toObject();
      rentalObj.daysRemaining = diffDays;

      if (diffDays < 0) {
        rentalObj.alertCategory = 'OVERDUE';
        alerts.overdue.push(rentalObj);
        // Auto update rental status if overdue
        if (rental.status !== 'Overdue') {
          rental.status = 'Overdue';
          await rental.save();
        }
      } else if (diffDays === 0) {
        rentalObj.alertCategory = 'DUE_TODAY';
        alerts.dueToday.push(rentalObj);
      } else if (diffDays >= 1 && diffDays <= 4) {
        rentalObj.alertCategory = '3_DAYS';
        alerts.threeDays.push(rentalObj);
      } else if (diffDays >= 5 && diffDays <= 7) {
        rentalObj.alertCategory = '7_DAYS';
        alerts.sevenDays.push(rentalObj);
      }
    }

    res.status(200).json({
      success: true,
      counts: {
        sevenDaysCount: alerts.sevenDays.length,
        threeDaysCount: alerts.threeDays.length,
        dueTodayCount: alerts.dueToday.length,
        overdueCount: alerts.overdue.length,
        totalAlertsCount:
          alerts.sevenDays.length +
          alerts.threeDays.length +
          alerts.dueToday.length +
          alerts.overdue.length
      },
      data: alerts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error computing payment alerts'
    });
  }
};

// @desc    Send automated email reminder to customer using Nodemailer
// @route   POST /api/notifications/send-reminder
// @access  Private
exports.sendEmailReminder = async (req, res) => {
  try {
    const { rentalId, recipientEmail } = req.body;

    if (!rentalId) {
      return res.status(400).json({
        success: false,
        message: 'Rental ID is required.'
      });
    }

    const rental = await Rental.findById(rentalId).populate('customer').populate('machines');
    if (!rental) {
      return res.status(404).json({
        success: false,
        message: 'Rental contract not found'
      });
    }

    const targetEmail = recipientEmail || rental.customer?.email || 'kavindujayasingheit@gmail.com';
    const customerName = rental.customer?.name || 'Valued Customer';

    // Determine alert category
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(rental.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    const diffDays = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    let category = 'NOTICE';
    if (diffDays < 0) category = 'OVERDUE';
    else if (diffDays === 0) category = 'DUE_TODAY';
    else if (diffDays <= 4) category = '3_DAYS';
    else if (diffDays <= 7) category = '7_DAYS';

    const result = await sendPaymentReminderEmail(targetEmail, customerName, rental, category);

    res.status(200).json({
      success: true,
      message: `Email reminder sent successfully to ${targetEmail}`,
      details: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Error dispatching email reminder'
    });
  }
};

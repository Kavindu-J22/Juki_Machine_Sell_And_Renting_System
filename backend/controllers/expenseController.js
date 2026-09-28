const Expense = require('../models/Expense');

// @desc    Add new expense / salary / creditor entry (Naya)
// @route   POST /api/expenses
// @access  Private
exports.createExpense = async (req, res) => {
  try {
    const { expenseType, recipientName, amount, date, notes, status } = req.body;

    if (!expenseType || !recipientName || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Expense type, recipient name, and amount are required.'
      });
    }

    // Auto-generate Expense ID: EXP-YYYY-XXXX
    const currentYear = new Date().getFullYear();
    const count = await Expense.countDocuments();
    const expenseId = `EXP-${currentYear}-${(count + 1).toString().padStart(4, '0')}`;

    const expense = await Expense.create({
      expenseId,
      expenseType,
      recipientName: recipientName.trim(),
      amount: Number(amount),
      date: date || new Date(),
      notes: notes ? notes.trim() : '',
      status: status || 'Pending'
    });

    res.status(201).json({
      success: true,
      data: expense,
      message: 'Expense / Naya entry recorded successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error creating expense'
    });
  }
};

// @desc    Get expenses with filter & summary breakdown
// @route   GET /api/expenses
// @access  Private
exports.getExpenses = async (req, res) => {
  try {
    const { expenseType, status } = req.query;

    let filter = {};
    if (expenseType) filter.expenseType = expenseType;
    if (status) filter.status = status;

    const expenses = await Expense.find(filter).sort({ date: -1 });

    // Calculate category breakdown sums
    const allExpenses = await Expense.find();

    const summary = {
      totalSalaries: allExpenses
        .filter((e) => e.expenseType === 'Salary')
        .reduce((sum, e) => sum + e.amount, 0),
      totalPartnerRentPayables: allExpenses
        .filter((e) => e.expenseType === 'Partner-Rent')
        .reduce((sum, e) => sum + e.amount, 0),
      totalCreditorsNaya: allExpenses
        .filter((e) => e.expenseType === 'Creditor-Naya')
        .reduce((sum, e) => sum + e.amount, 0),
      totalOtherExpenses: allExpenses
        .filter((e) => e.expenseType === 'Other')
        .reduce((sum, e) => sum + e.amount, 0),
      totalPendingAmount: allExpenses
        .filter((e) => e.status === 'Pending')
        .reduce((sum, e) => sum + e.amount, 0),
      totalPaidAmount: allExpenses
        .filter((e) => e.status === 'Paid')
        .reduce((sum, e) => sum + e.amount, 0),
      grandTotalAmount: allExpenses.reduce((sum, e) => sum + e.amount, 0)
    };

    res.status(200).json({
      success: true,
      count: expenses.length,
      data: expenses,
      summary
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching expenses'
    });
  }
};

// @desc    Update expense status or details
// @route   PUT /api/expenses/:id
// @access  Private
exports.updateExpense = async (req, res) => {
  try {
    let expense = await Expense.findById(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense entry not found'
      });
    }

    expense = await Expense.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: expense,
      message: 'Expense entry updated successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error updating expense'
    });
  }
};

// @desc    Delete expense entry
// @route   DELETE /api/expenses/:id
// @access  Private
exports.deleteExpense = async (req, res) => {
  try {
    const expense = await Expense.findByIdAndDelete(req.params.id);

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: 'Expense entry not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Expense entry deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error deleting expense'
    });
  }
};

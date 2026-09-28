const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema(
  {
    expenseId: {
      type: String,
      required: true,
      unique: true
    },
    expenseType: {
      type: String,
      enum: ['Salary', 'Partner-Rent', 'Creditor-Naya', 'Other'],
      required: [true, 'Please specify expense type']
    },
    recipientName: {
      type: String,
      required: [true, 'Please specify recipient name (Staff / Partner / Creditor)'],
      trim: true
    },
    amount: {
      type: Number,
      required: [true, 'Please specify expense amount']
    },
    date: {
      type: Date,
      default: Date.now
    },
    notes: {
      type: String,
      trim: true,
      default: ''
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending'],
      default: 'Pending'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Expense', expenseSchema);

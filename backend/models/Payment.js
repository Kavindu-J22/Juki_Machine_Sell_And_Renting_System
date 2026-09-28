const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    paymentId: {
      type: String,
      required: true,
      unique: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Please assign a customer']
    },
    rental: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Rental'
    },
    amountPaid: {
      type: Number,
      required: [true, 'Please specify amount paid']
    },
    paymentDate: {
      type: Date,
      default: Date.now
    },
    paymentMethod: {
      type: String,
      enum: ['Cash', 'Bank Transfer', 'Cheque'],
      default: 'Cash'
    },
    previousBalance: {
      type: Number,
      default: 0
    },
    newBalance: {
      type: Number,
      default: 0
    },
    remarks: {
      type: String,
      trim: true,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Payment', paymentSchema);

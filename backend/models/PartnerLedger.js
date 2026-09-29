const mongoose = require('mongoose');

const partnerLedgerSchema = new mongoose.Schema(
  {
    partnerName: {
      type: String,
      enum: ['Anujaya', 'Global'],
      required: true
    },
    type: {
      type: String,
      enum: ['Capital Draw', 'Disbursement', 'Capital Contribution', 'Equity Adjustment'],
      required: true
    },
    amountLkr: {
      type: Number,
      required: true
    },
    date: {
      type: Date,
      default: Date.now
    },
    paymentReference: {
      type: String,
      default: '',
      trim: true
    },
    paymentMethod: {
      type: String,
      enum: ['Bank Wire', 'SLIPS', 'Cheque', 'Cash', 'Internal Transfer'],
      default: 'Bank Wire'
    },
    notes: {
      type: String,
      default: ''
    },
    recordedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('PartnerLedger', partnerLedgerSchema);

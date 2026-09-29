const mongoose = require('mongoose');

const salesLedgerSchema = new mongoose.Schema(
  {
    invoiceNo: {
      type: String,
      required: true,
      unique: true
    },
    dispatchDate: {
      type: Date,
      default: Date.now
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    },
    customerDetails: {
      name: { type: String, required: true },
      factoryName: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      address: { type: String, default: '' },
      taxId: { type: String, default: '' }
    },
    items: [
      {
        machine: { type: mongoose.Schema.Types.ObjectId, ref: 'Machine' },
        sku: { type: String, required: true },
        brand: { type: String, default: 'Juki' },
        model: { type: String, required: true },
        qty: { type: Number, required: true, default: 1 },
        unitPriceLkr: { type: Number, required: true },
        totalLkr: { type: Number, required: true },
        serialsTracked: { type: [String], default: [] },
        cogsLkr: { type: Number, default: 0 }
      }
    ],
    subtotalLkr: {
      type: Number,
      required: true
    },
    vatRate: {
      type: Number,
      default: 18
    },
    vatAmountLkr: {
      type: Number,
      default: 0
    },
    svatNumber: {
      type: String,
      default: ''
    },
    isSvatExempt: {
      type: Boolean,
      default: false
    },
    grandTotalLkr: {
      type: Number,
      required: true
    },
    totalCogsLkr: {
      type: Number,
      default: 0
    },
    realizedNetLkr: {
      type: Number,
      default: 0
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Partial', 'Pending'],
      default: 'Pending'
    },
    amountPaidLkr: {
      type: Number,
      default: 0
    },
    outstandingBalanceLkr: {
      type: Number,
      default: 0
    },
    partnerSplit: {
      anujayaNet: { type: Number, default: 0 },
      globalNet: { type: Number, default: 0 }
    },
    paymentLogs: [
      {
        amount: { type: Number, required: true },
        date: { type: Date, default: Date.now },
        paymentMethod: { type: String, default: 'Bank Transfer' },
        reference: { type: String, default: '' },
        notes: { type: String, default: '' }
      }
    ],
    warrantyMonths: {
      type: Number,
      default: 12
    },
    notes: {
      type: String,
      default: ''
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('SalesLedger', salesLedgerSchema);

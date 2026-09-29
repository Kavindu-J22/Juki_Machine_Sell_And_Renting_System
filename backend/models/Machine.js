const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema(
  {
    machineId: {
      type: String,
      required: true,
      unique: true
    },
    sku: {
      type: String,
      required: [true, 'Please add a unique SKU'],
      trim: true
    },
    serialNumber: {
      type: String,
      trim: true,
      default: ''
    },
    brand: {
      type: String,
      required: [true, 'Please specify brand (e.g. Juki, Singer, Brother)'],
      default: 'Juki',
      trim: true
    },
    model: {
      type: String,
      required: [true, 'Please specify machine model'],
      trim: true
    },
    modelSpecs: {
      type: String,
      default: ''
    },
    initialBatchSets: {
      type: Number,
      default: 1
    },
    dispatchedCounts: {
      type: Number,
      default: 0
    },
    availableSets: {
      type: Number,
      default: 1
    },
    unit: {
      type: String,
      default: 'Set'
    },
    fobUsd: {
      type: Number,
      default: 0
    },
    customsDutyLkr: {
      type: Number,
      default: 0
    },
    landedCostLkr: {
      type: Number,
      default: 0
    },
    wholesaleBenchmarkLkr: {
      type: Number,
      default: 0
    },
    retailBenchmarkLkr: {
      type: Number,
      default: 0
    },
    serialNumbers: {
      type: [String],
      default: []
    },
    partnerShare: {
      type: String,
      enum: ['Anujaya', 'Global', 'Consortium'],
      default: 'Consortium'
    },
    status: {
      type: String,
      enum: ['Available', 'Low Stock', 'Out of Stock', 'Rented', 'Maintenance', 'Partner-Allocated'],
      default: 'Available'
    },
    isPartnerMachine: {
      type: Boolean,
      default: false
    },
    partnerDetails: {
      partnerName: { type: String, default: '' },
      partnerRentCost: { type: Number, default: 0 }
    },
    sourceType: {
      type: String,
      enum: ['Local', 'China'],
      default: 'Local'
    },
    importDetails: {
      shippingCost: { type: Number, default: 0 },
      taxCost: { type: Number, default: 0 },
      customDuty: { type: Number, default: 0 },
      totalLandingCost: { type: Number, default: 0 }
    }
  },
  {
    timestamps: true
  }
);

// Calculate availableSets before saving
machineSchema.pre('save', function (next) {
  this.availableSets = Math.max(0, (this.initialBatchSets || 1) - (this.dispatchedCounts || 0));
  if (this.availableSets === 0) {
    this.status = 'Out of Stock';
  } else if (this.availableSets < 5 && this.status !== 'Rented' && this.status !== 'Maintenance') {
    this.status = 'Low Stock';
  } else if (this.status !== 'Rented' && this.status !== 'Maintenance') {
    this.status = 'Available';
  }
  next();
});

module.exports = mongoose.model('Machine', machineSchema);

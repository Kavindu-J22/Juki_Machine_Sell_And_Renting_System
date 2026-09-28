const mongoose = require('mongoose');

const machineSchema = new mongoose.Schema(
  {
    machineId: {
      type: String,
      required: true,
      unique: true
    },
    serialNumber: {
      type: String,
      required: [true, 'Please add a unique serial number'],
      unique: true,
      trim: true
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
    status: {
      type: String,
      enum: ['Available', 'Rented', 'Maintenance', 'Partner-Allocated'],
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

module.exports = mongoose.model('Machine', machineSchema);

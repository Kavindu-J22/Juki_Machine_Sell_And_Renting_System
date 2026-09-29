const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    customerId: {
      type: String,
      required: true,
      unique: true
    },
    name: {
      type: String,
      required: [true, 'Please add customer name'],
      trim: true
    },
    factoryName: {
      type: String,
      default: '',
      trim: true
    },
    email: {
      type: String,
      default: '',
      trim: true
    },
    nicOrRegNumber: {
      type: String,
      trim: true,
      default: ''
    },
    phone: {
      type: String,
      required: [true, 'Please add customer phone number'],
      trim: true
    },
    address: {
      type: String,
      trim: true,
      default: ''
    },
    region: {
      type: String,
      default: 'Western Province',
      trim: true
    },
    taxId: {
      type: String,
      default: '',
      trim: true
    },
    totalTurnover: {
      type: Number,
      default: 0
    },
    outstandingBalance: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Active', 'Pending', 'Overdue', 'Completed'],
      default: 'Active'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Customer', customerSchema);

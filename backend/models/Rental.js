const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema(
  {
    rentalId: {
      type: String,
      required: true,
      unique: true
    },
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: [true, 'Please assign a customer']
    },
    machines: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Machine',
        required: [true, 'Please assign at least one machine']
      }
    ],
    startDate: {
      type: Date,
      required: [true, 'Please specify rental start date'],
      default: Date.now
    },
    dueDate: {
      type: Date,
      required: [true, 'Please specify next payment / due date']
    },
    monthlyRentAmount: {
      type: Number,
      required: [true, 'Please specify monthly rent amount']
    },
    depositAmount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Active', 'Returned', 'Overdue'],
      default: 'Active'
    },
    returnDate: {
      type: Date
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Rental', rentalSchema);

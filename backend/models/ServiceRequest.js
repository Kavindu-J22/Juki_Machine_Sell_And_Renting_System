const mongoose = require('mongoose');

const serviceRequestSchema = new mongoose.Schema(
  {
    ticketNo: {
      type: String,
      required: true,
      unique: true
    },
    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    clientName: {
      type: String,
      required: true
    },
    machineSerial: {
      type: String,
      required: true
    },
    machineModel: {
      type: String,
      default: ''
    },
    issueTitle: {
      type: String,
      required: true
    },
    issueDescription: {
      type: String,
      default: ''
    },
    priority: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Urgent'],
      default: 'Medium'
    },
    status: {
      type: String,
      enum: ['Open', 'In Progress', 'Resolved', 'Closed'],
      default: 'Open'
    },
    resolutionNotes: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('ServiceRequest', serviceRequestSchema);

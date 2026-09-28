const mongoose = require('mongoose');

const companySettingsSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Please add company name'],
      default: 'Juki Sewing Machine Centre (Pvt) Ltd'
    },
    address: {
      type: String,
      default: 'No. 145, Main Street, Colombo 11, Sri Lanka'
    },
    phone: {
      type: String,
      default: '+94 11 234 5678'
    },
    email: {
      type: String,
      default: 'sales@jukirentals.lk'
    },
    registrationNumber: {
      type: String,
      default: 'PV-98765-SL'
    },
    logoUrl: {
      type: String,
      default: ''
    },
    taxDetails: {
      taxId: { type: String, default: 'TIN-100293847' },
      vatNumber: { type: String, default: 'VAT-99201' },
      taxRatePercentage: { type: Number, default: 18 }
    },
    bankDetails: {
      bankName: { type: String, default: 'Commercial Bank of Ceylon' },
      branch: { type: String, default: 'Colombo Main Branch' },
      accountNumber: { type: String, default: '1000-2938-4720' },
      accountName: { type: String, default: 'Juki Sewing Machine Centre' }
    },
    agreementTerms: {
      type: String,
      default:
        '1. The machine remains the sole property of Juki Sewing Centre.\n2. Rent must be paid monthly in advance by the due date.\n3. Any damages due to improper operation will be billed to the customer.\n4. Machine must be returned upon termination of agreement.'
    },
    quotationFooter: {
      type: String,
      default: 'Thank you for choosing Juki Sewing Centre! Quotation valid for 14 days.'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('CompanySettings', companySettingsSchema);

const mongoose = require('mongoose');

const companySettingsSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: [true, 'Please add company name'],
      default: 'ANUJAYA & GLOBAL ENTERPRISES'
    },
    tagline: {
      type: String,
      default: 'Industrial Apparel Machinery & Logistics Consortium'
    },
    address: {
      type: String,
      default: 'Consortium Complex, No. 458, Katunayake Free Trade Zone Rd, Seeduwa, Sri Lanka'
    },
    phone: {
      type: String,
      default: '+94 11 488 9900 / +94 77 123 4567'
    },
    email: {
      type: String,
      default: 'info@anujayaglobal.lk'
    },
    registrationNumber: {
      type: String,
      default: 'PV-99201-CONSORTIUM'
    },
    usdToLkrRate: {
      type: Number,
      default: 330
    },
    taxDetails: {
      taxId: { type: String, default: 'TIN-900293847' },
      vatNumber: { type: String, default: 'VAT-88201-LK' },
      svatNumber: { type: String, default: 'SVAT-100293' },
      taxRatePercentage: { type: Number, default: 18 }
    },
    partnerEquity: {
      anujayaSharePercent: { type: Number, default: 50 },
      globalSharePercent: { type: Number, default: 50 }
    },
    bankDetails: {
      bankName: { type: String, default: 'Commercial Bank of Ceylon PLC' },
      branch: { type: String, default: 'Katunayake FTZ Branch' },
      accountNumber: { type: String, default: '1000-8849-2910' },
      accountName: { type: String, default: 'Anujaya & Global Enterprises Consortium' }
    },
    agreementTerms: {
      type: String,
      default:
        '1. Equipment remains property of Anujaya & Global Enterprises Consortium.\n2. Warranty covers manufacturing defects for 12 months.\n3. All sales & dispatches subject to VAT/SVAT compliance.'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('CompanySettings', companySettingsSchema);

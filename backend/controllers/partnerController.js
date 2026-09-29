const PartnerLedger = require('../models/PartnerLedger');
const SalesLedger = require('../models/SalesLedger');
const CompanySettings = require('../models/CompanySettings');

// @desc    Get Consortium Partner Equity Summary & Dashboards
// @route   GET /api/partners/dashboard
// @access  Private (Admin, Partner)
exports.getPartnerDashboard = async (req, res) => {
  try {
    const settings = await CompanySettings.findOne();
    const targetPartner = req.query.partnerName || req.user?.partnerName || 'Anujaya';

    // 1. Calculate Total Realized Net Earnings from SalesLedger
    const sales = await SalesLedger.find();
    let totalRealizedNet = 0;
    let anujayaRealizedNet = 0;
    let globalRealizedNet = 0;

    sales.forEach((s) => {
      totalRealizedNet += s.realizedNetLkr || 0;
      anujayaRealizedNet += s.partnerSplit?.anujayaNet || (s.realizedNetLkr * 0.5) || 0;
      globalRealizedNet += s.partnerSplit?.globalNet || (s.realizedNetLkr * 0.5) || 0;
    });

    // 2. Fetch all Partner Ledger Transactions (Capital Draws, Disbursements)
    const ledger = await PartnerLedger.find().sort({ date: -1 });

    let anujayaCapitalDraws = 0;
    let globalCapitalDraws = 0;

    ledger.forEach((tx) => {
      if (tx.partnerName === 'Anujaya' && (tx.type === 'Capital Draw' || tx.type === 'Disbursement')) {
        anujayaCapitalDraws += tx.amountLkr;
      } else if (tx.partnerName === 'Global' && (tx.type === 'Capital Draw' || tx.type === 'Disbursement')) {
        globalCapitalDraws += tx.amountLkr;
      }
    });

    const anujayaBalance = anujayaRealizedNet - anujayaCapitalDraws;
    const globalBalance = globalRealizedNet - globalCapitalDraws;

    // Filter transactions for target partner
    const partnerTransactions = ledger.filter((tx) => tx.partnerName === targetPartner);

    res.status(200).json({
      success: true,
      data: {
        summary: {
          totalConsortiumNet: totalRealizedNet,
          anujaya: {
            partnerName: 'Anujaya Enterprises',
            sharePercent: settings?.partnerEquity?.anujayaSharePercent || 50,
            realizedNetEarnings: anujayaRealizedNet,
            capitalDraws: anujayaCapitalDraws,
            unsettledEquityBalance: anujayaBalance
          },
          global: {
            partnerName: 'Global Enterprises',
            sharePercent: settings?.partnerEquity?.globalSharePercent || 50,
            realizedNetEarnings: globalRealizedNet,
            capitalDraws: globalCapitalDraws,
            unsettledEquityBalance: globalBalance
          }
        },
        currentViewPartner: targetPartner,
        recentTransactions: partnerTransactions
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching partner dashboard'
    });
  }
};

// @desc    Log Capital Draw / Disbursement
// @route   POST /api/partners/capital-draw
// @access  Private (Admin)
exports.logCapitalDraw = async (req, res) => {
  try {
    const { partnerName, type, amountLkr, paymentReference, paymentMethod, notes } = req.body;

    if (!partnerName || !amountLkr) {
      return res.status(400).json({
        success: false,
        message: 'Partner name and draw amount are required.'
      });
    }

    const draw = await PartnerLedger.create({
      partnerName,
      type: type || 'Capital Draw',
      amountLkr: Number(amountLkr),
      paymentReference: paymentReference || '',
      paymentMethod: paymentMethod || 'Bank Wire',
      notes: notes || '',
      recordedBy: req.user?._id
    });

    res.status(201).json({
      success: true,
      data: draw,
      message: `Capital draw of LKR ${Number(amountLkr).toLocaleString()} logged for ${partnerName} Enterprises.`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error logging capital draw'
    });
  }
};

// @desc    Get Financial Audit Statement
// @route   GET /api/partners/audit-statement
// @access  Private (Admin, Partner)
exports.getAuditStatement = async (req, res) => {
  try {
    const settings = await CompanySettings.findOne();
    const sales = await SalesLedger.find().sort({ createdAt: -1 });
    const ledger = await PartnerLedger.find().sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: {
        consortium: settings,
        generatedAt: new Date(),
        salesSummary: sales,
        partnerLedger: ledger
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || 'Server error generating audit statement'
    });
  }
};

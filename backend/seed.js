const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const CompanySettings = require('./models/CompanySettings');
const Machine = require('./models/Machine');
const Customer = require('./models/Customer');
const SalesLedger = require('./models/SalesLedger');
const PartnerLedger = require('./models/PartnerLedger');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();
    console.log('🌱 Seeding Anujaya & Global Enterprises ERP Database...');

    // 1. Consortium Settings
    let settings = await CompanySettings.findOne();
    if (!settings) {
      settings = await CompanySettings.create({
        companyName: 'ANUJAYA & GLOBAL ENTERPRISES',
        tagline: 'Industrial Apparel Machinery & Logistics Consortium',
        address: 'Consortium Complex, No. 458, Katunayake Free Trade Zone Rd, Seeduwa, Sri Lanka',
        phone: '+94 11 488 9900 / +94 77 123 4567',
        email: 'info@anujayaglobal.lk',
        registrationNumber: 'PV-99201-CONSORTIUM',
        usdToLkrRate: 330,
        taxDetails: {
          taxId: 'TIN-900293847',
          vatNumber: 'VAT-88201-LK',
          svatNumber: 'SVAT-100293',
          taxRatePercentage: 18
        },
        partnerEquity: {
          anujayaSharePercent: 50,
          globalSharePercent: 50
        }
      });
      console.log('✅ Default Consortium Settings seeded');
    }

    // 2. Customers / Apparel Factories
    let masCustomer = await Customer.findOne({ email: 'info@masapparel.lk' });
    if (!masCustomer) {
      masCustomer = await Customer.create({
        customerId: `CUST-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        name: 'MAS Activeware (Pvt) Ltd',
        nicOrRegNumber: 'PV-10029',
        phone: '+94 11 470 1000',
        email: 'info@masapparel.lk',
        address: 'Katunayake Free Trade Zone, Phase 2, Sri Lanka',
        factoryName: 'MAS Katunayake Plant',
        region: 'Western Province / FTZ',
        totalTurnover: 4500000,
        outstandingBalance: 350000
      });
      console.log('✅ Seeded Customer: MAS Activeware');
    }

    let brandixCustomer = await Customer.findOne({ email: 'contact@brandix.com' });
    if (!brandixCustomer) {
      brandixCustomer = await Customer.create({
        customerId: `CUST-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        name: 'Brandix Apparel Limited',
        nicOrRegNumber: 'PV-88291',
        phone: '+94 11 472 7000',
        email: 'contact@brandix.com',
        address: 'No. 25, Rheinland Place, Colombo 03, Sri Lanka',
        factoryName: 'Brandix Seeduwa Complex',
        region: 'Western Province',
        totalTurnover: 6200000,
        outstandingBalance: 0
      });
      console.log('✅ Seeded Customer: Brandix Apparel');
    }

    // 3. User Credentials Seeding
    const seedUser = async (name, email, password, role, partnerName = '', customerRef = null) => {
      let user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        user = await User.create({
          name,
          email,
          password,
          role,
          partnerName,
          customerRef
        });
        console.log(`🔑 Seeded ${role} User (${email})`);
      }
    };

    await seedUser('System Administrator', 'admin@anujayaglobal.lk', 'admin123', 'Admin');
    await seedUser('Partner Representative (Anujaya)', 'anujaya@anujayaglobal.lk', 'partner123', 'Partner', 'Anujaya');
    await seedUser('Partner Representative (Global)', 'global@anujayaglobal.lk', 'partner123', 'Partner', 'Global');
    await seedUser('MAS Apparel Client Portal', 'mas@apparel.lk', 'client123', 'Client', '', masCustomer._id);
    await seedUser('Brandix Client Portal', 'brandix@apparel.lk', 'client123', 'Client', '', brandixCustomer._id);

    // 4. Machinery Master Sample Inventory
    const sampleMachines = [
      {
        sku: 'JK-DDL-8700',
        serialNumber: 'SN-8700-01',
        brand: 'Juki',
        model: 'DDL-8700',
        modelSpecs: 'Single Needle High Speed Lockstitch Sewing Machine',
        initialBatchSets: 30,
        dispatchedCounts: 8,
        unit: 'Set',
        fobUsd: 420,
        customsDutyLkr: 18500,
        landedCostLkr: Math.round(420 * 330 + 18500),
        wholesaleBenchmarkLkr: 195000,
        retailBenchmarkLkr: 225000,
        serialNumbers: ['SN-8700-01', 'SN-8700-02', 'SN-8700-03', 'SN-8700-04'],
        partnerShare: 'Consortium',
        status: 'Available'
      },
      {
        sku: 'JK-MO-6814S',
        serialNumber: 'SN-6814-01',
        brand: 'Juki',
        model: 'MO-6814S',
        modelSpecs: '4-Thread High Speed Overlock Sewing Machine',
        initialBatchSets: 20,
        dispatchedCounts: 5,
        unit: 'Set',
        fobUsd: 680,
        customsDutyLkr: 24500,
        landedCostLkr: Math.round(680 * 330 + 24500),
        wholesaleBenchmarkLkr: 298000,
        retailBenchmarkLkr: 335000,
        serialNumbers: ['SN-6814-01', 'SN-6814-02', 'SN-6814-03'],
        partnerShare: 'Anujaya',
        status: 'Available'
      },
      {
        sku: 'BR-S-7250A',
        serialNumber: 'SN-7250-01',
        brand: 'Brother',
        model: 'S-7250A Nexio',
        modelSpecs: 'Direct Drive Lockstitcher with Electronic Feeding',
        initialBatchSets: 15,
        dispatchedCounts: 2,
        unit: 'Set',
        fobUsd: 750,
        customsDutyLkr: 28000,
        landedCostLkr: Math.round(750 * 330 + 28000),
        wholesaleBenchmarkLkr: 330000,
        retailBenchmarkLkr: 375000,
        serialNumbers: ['SN-7250-01', 'SN-7250-02'],
        partnerShare: 'Global',
        status: 'Available'
      },
      {
        sku: 'SR-747F',
        serialNumber: 'SN-747F-01',
        brand: 'Siruba',
        model: '747F-514M2',
        modelSpecs: 'Super High Speed Overlock Machine',
        initialBatchSets: 25,
        dispatchedCounts: 10,
        unit: 'Set',
        fobUsd: 520,
        customsDutyLkr: 21000,
        landedCostLkr: Math.round(520 * 330 + 21000),
        wholesaleBenchmarkLkr: 235000,
        retailBenchmarkLkr: 268000,
        serialNumbers: ['SN-747F-01', 'SN-747F-02'],
        partnerShare: 'Consortium',
        status: 'Available'
      }
    ];

    for (const m of sampleMachines) {
      const exists = await Machine.findOne({ sku: m.sku });
      if (!exists) {
        await Machine.create({
          machineId: `MAC-2026-${Math.floor(1000 + Math.random() * 9000)}`,
          ...m
        });
        console.log(`✅ Seeded Machinery Master SKU: ${m.sku} (${m.brand} ${m.model})`);
      }
    }

    // 5. Initial Sample Sales Dispatch & Capital Draw Entry
    const salesCount = await SalesLedger.countDocuments();
    if (salesCount === 0) {
      const itemMachine = await Machine.findOne({ sku: 'JK-DDL-8700' });
      await SalesLedger.create({
        invoiceNo: 'INV-2026-0001',
        customer: masCustomer._id,
        customerDetails: {
          name: masCustomer.name,
          factoryName: masCustomer.factoryName,
          email: masCustomer.email,
          phone: masCustomer.phone,
          address: masCustomer.address
        },
        items: [
          {
            machine: itemMachine ? itemMachine._id : null,
            sku: 'JK-DDL-8700',
            brand: 'Juki',
            model: 'DDL-8700',
            qty: 3,
            unitPriceLkr: 225000,
            totalLkr: 675000,
            serialsTracked: ['SN-8700-01', 'SN-8700-02', 'SN-8700-03'],
            cogsLkr: 471300
          }
        ],
        subtotalLkr: 675000,
        vatRate: 18,
        vatAmountLkr: 121500,
        grandTotalLkr: 796500,
        totalCogsLkr: 471300,
        realizedNetLkr: 325200,
        paymentStatus: 'Paid',
        amountPaidLkr: 796500,
        outstandingBalanceLkr: 0,
        partnerSplit: {
          anujayaNet: 162600,
          globalNet: 162600
        },
        paymentLogs: [
          {
            amount: 796500,
            date: new Date(),
            paymentMethod: 'Bank Wire',
            reference: 'SLIPS-992019',
            notes: 'Full payment received upon dispatch delivery'
          }
        ]
      });
      console.log('✅ Seeded Initial POS Sales Dispatch: INV-2026-0001');
    }

    const partnerLedgerCount = await PartnerLedger.countDocuments();
    if (partnerLedgerCount === 0) {
      await PartnerLedger.create({
        partnerName: 'Anujaya',
        type: 'Capital Draw',
        amountLkr: 50000,
        date: new Date(),
        paymentReference: 'BANK-WIRE-REF-1002',
        paymentMethod: 'Bank Wire',
        notes: 'Monthly partner dividend disbursement'
      });
      await PartnerLedger.create({
        partnerName: 'Global',
        type: 'Capital Draw',
        amountLkr: 50000,
        date: new Date(),
        paymentReference: 'SLIPS-REF-9921',
        paymentMethod: 'SLIPS',
        notes: 'Monthly partner dividend disbursement'
      });
      console.log('✅ Seeded Initial Partner Capital Draws');
    }

    console.log('🎉 ANUJAYA & GLOBAL ENTERPRISES ERP Seeding Complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();

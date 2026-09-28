const dotenv = require('dotenv');
const connectDB = require('./config/db');
const User = require('./models/User');
const CompanySettings = require('./models/CompanySettings');

dotenv.config();

const seedData = async () => {
  try {
    await connectDB();

    console.log('Seeding database...');

    // 1. Seed Admin User
    const adminExists = await User.findOne({ email: 'admin@juki.lk' });
    if (!adminExists) {
      await User.create({
        name: 'System Administrator',
        email: 'admin@juki.lk',
        password: 'admin123',
        role: 'Admin'
      });
      console.log('✅ Default Admin user created: admin@juki.lk / admin123');
    } else {
      console.log('ℹ️ Admin user (admin@juki.lk) already exists in database');
    }

    // 2. Seed Staff User
    const staffExists = await User.findOne({ email: 'staff@juki.lk' });
    if (!staffExists) {
      await User.create({
        name: 'Operation Staff',
        email: 'staff@juki.lk',
        password: 'staff123',
        role: 'Staff'
      });
      console.log('✅ Default Staff user created: staff@juki.lk / staff123');
    } else {
      console.log('ℹ️ Staff user (staff@juki.lk) already exists in database');
    }

    // 3. Seed Company Settings
    const settingsExists = await CompanySettings.findOne();
    if (!settingsExists) {
      await CompanySettings.create({
        companyName: 'Juki Sewing Machine Centre (Pvt) Ltd',
        address: 'No. 145, Main Street, Colombo 11, Sri Lanka',
        phone: '+94 11 234 5678',
        email: 'sales@jukirentals.lk',
        registrationNumber: 'PV-98765-SL',
        taxDetails: {
          taxId: 'TIN-100293847',
          vatNumber: 'VAT-99201',
          taxRatePercentage: 18
        }
      });
      console.log('✅ Default Company Settings seeded');
    } else {
      console.log('ℹ️ Company settings already exist');
    }

    console.log('🎉 Seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
    process.exit(1);
  }
};

seedData();

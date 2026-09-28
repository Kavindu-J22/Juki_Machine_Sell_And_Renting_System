const mongoose = require('mongoose');

const autoSeedIfEmpty = async () => {
  try {
    const User = require('../models/User');
    const CompanySettings = require('../models/CompanySettings');

    // 1. Seed Admin User if none exists
    const adminExists = await User.findOne({ email: 'admin@juki.lk' });
    if (!adminExists) {
      await User.create({
        name: 'System Administrator',
        email: 'admin@juki.lk',
        password: 'admin123',
        role: 'Admin'
      });
      console.log('🔑 Auto-Seeded Admin Account: admin@juki.lk / admin123');
    }

    // 2. Seed Staff User if none exists
    const staffExists = await User.findOne({ email: 'staff@juki.lk' });
    if (!staffExists) {
      await User.create({
        name: 'Operation Staff',
        email: 'staff@juki.lk',
        password: 'staff123',
        role: 'Staff'
      });
      console.log('🔑 Auto-Seeded Staff Account: staff@juki.lk / staff123');
    }

    // 3. Seed Company Settings if none exists
    const settingsExists = await CompanySettings.findOne();
    if (!settingsExists) {
      await CompanySettings.create({
        companyName: 'Juki Sewing Machine Centre (Pvt) Ltd',
        address: 'No. 145, Main Street, Colombo 11, Sri Lanka',
        phone: '+94 11 234 5678',
        email: 'sales@jukirentals.lk',
        registrationNumber: 'PV-98765-SL'
      });
      console.log('🏢 Auto-Seeded Company Settings profile');
    }
  } catch (err) {
    console.error('Auto-seed check notice:', err.message);
  }
};

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 5000
    });
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    await autoSeedIfEmpty();
  } catch (error) {
    console.error(`\n❌ MongoDB Connection Error: ${error.message}`);
    if (error.message.includes('bad auth')) {
      console.error(
        `\n⚠️  AUTHENTICATION NOTICE:\n` +
        `The MongoDB connection string in 'backend/.env' returned 'bad auth'.\n` +
        `Please verify your MongoDB Atlas username and password in backend/.env:\n` +
        `MONGO_URI=mongodb+srv://<USERNAME>:<PASSWORD>@cluster0.tjydxot.mongodb.net/juki_rental_db\n`
      );
    }
  }
};

module.exports = connectDB;

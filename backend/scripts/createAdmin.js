// backend/scripts/createAdmin.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../src/models/User.model');
require('dotenv').config();

const createAdminUser = async () => {
  try {
    console.log('MONGODB_URI:', process.env.MONGODB_URI);

    const options = {
      autoIndex: process.env.NODE_ENV !== 'production',
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      dbName: process.env.DB_NAME || 'ecommerce'
    };
    
    await mongoose.connect(process.env.MONGODB_URI, options);
    
    
    // Fetch all users from the CURRENT database
    const users = await User.find({});

    if (users.length === 0) {
      console.log('No users found in this database');
    } else {
      users.forEach(user => {
        console.log(`${user.email} | Role: ${user.role} | Admin: ${user.isAdmin}`);
      });
    }
    console.log('═'.repeat(60) + '\n');

    // Check if admin already exists in THIS database
    const adminEmail = 'omaryasir1110@gmail.com';
    const existingAdmin = await User.findOne({ email: adminEmail });
    
    if (existingAdmin) {
      console.log(`Email: ${existingAdmin.email}`);
      console.log(`Name: ${existingAdmin.name}`);
      console.log(`Role: ${existingAdmin.role}`);
      process.exit(0);
    }
    
    // Create admin user in THIS database

    const password = '0100389194';
    const admin = new User({
      name: 'Super Admin',
      email: adminEmail,
      password,
      role: 'admin',
      isAdmin: true,
      isEmailVerified: true,
      adminSince: new Date(),
      authProvider: 'local'
    });
    
    await admin.save();
    
    console.log('\n Admin user created successfully!');
    console.log('═'.repeat(60));
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: ${password}`);
    console.log('Name: Super Admin');
    console.log('Role: Administrator');
    console.log('═'.repeat(60));
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating admin:', error.message);
    if (error.message.includes('ECONNREFUSED')) {
      console.error(' Make sure MongoDB is running!');
    }
    process.exit(1);
  }
};

createAdminUser();
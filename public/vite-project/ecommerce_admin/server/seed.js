require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Admin = require('./models/Admin');

const uri = process.env.MONGODB_URI || 'mongodb://sholoksell1_db_user:s9X1N6Y57l9nWQHK@ac-fz20gv0-shard-00-00.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-01.9crcrtz.mongodb.net:27017,ac-fz20gv0-shard-00-02.9crcrtz.mongodb.net:27017/sholok_ecommerce?ssl=true&replicaSet=atlas-4utwyx-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0';

async function seedDefaultAdmin() {
  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      family: 4,
    });
    console.log('✅ MongoDB Connected');

    // Check if admin already exists
    const existingAdmin = await Admin.findOne({ email: 'bishal@admin.com' });

    if (existingAdmin) {
      console.log('ℹ️  Default admin exists, resetting password...');
      const salt = await bcrypt.genSalt(10);
      existingAdmin.password = await bcrypt.hash('123456', salt);
      await existingAdmin.save();

      console.log('✅ Password reset (or user confirmed)!');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('📧 Email: bishal@admin.com');
      console.log('🔑 Password: 123456');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

      await mongoose.connection.close();
      return;
    }

    // Create default admin
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('bishal@123456', salt);

    const defaultAdmin = new Admin({
      name: 'Bishal',
      email: 'bishal@admin.com',
      password: hashedPassword,
      role: 'super_admin',
      isActive: true,
    });

    await defaultAdmin.save();

    console.log('✅ Default admin created successfully!');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📧 Email: bishal@admin.com');
    console.log('👤 Username: bishal');
    console.log('🔑 Password: bishal@123456');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    await mongoose.connection.close();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

seedDefaultAdmin();

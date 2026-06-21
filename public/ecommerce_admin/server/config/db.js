'use strict';
const dns = require('dns');
const mongoose = require('mongoose');

// Force Google + Cloudflare DNS — prevents querySrv ECONNREFUSED on
// any ISP/router/VPN that blocks SRV record lookups.
dns.setServers(['8.8.8.8', '1.1.1.1', '8.8.4.4', '1.0.0.1']);

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI environment variable is not set');
}

const OPTS = {
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS:          45000,
  connectTimeoutMS:         30000,
  heartbeatFrequencyMS:     10000,
  family: 4,
};

let retries = 0;

const connectDB = async () => {
  mongoose.set('strictQuery', false);
  mongoose.set('bufferTimeoutMS', 45000);
  try {
    await mongoose.connect(MONGODB_URI, OPTS);
    console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
    retries = 0;
  } catch (err) {
    retries++;
    const delay = Math.min(5000 * retries, 30000);
    console.error(`❌ MongoDB Error (attempt ${retries}): ${err.message}`);
    console.log(`⏳ Retrying in ${delay / 1000}s...`);
    setTimeout(connectDB, delay);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected — reconnecting...');
  setTimeout(connectDB, 5000);
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

module.exports = connectDB;

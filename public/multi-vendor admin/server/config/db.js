'use strict';
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MULTIVENDOR_MONGODB_URI || process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('MULTIVENDOR_MONGODB_URI environment variable is not set');
}

const OPTS = {
  serverSelectionTimeoutMS: 20000,
  socketTimeoutMS:          45000,
  connectTimeoutMS:         20000,
  maxPoolSize: 5,
};

mongoose.set('strictQuery', false);
mongoose.set('bufferCommands', false);

let connectionPromise = null;

const connectDB = () => {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose.connection);
  }
  if (!connectionPromise) {
    connectionPromise = mongoose.connect(MONGODB_URI, OPTS)
      .then((conn) => {
        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
        return conn.connection;
      })
      .catch((err) => {
        connectionPromise = null;
        console.error(`❌ MongoDB connection failed: ${err.message}`);
        throw err;
      });
  }
  return connectionPromise;
};

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected');
  connectionPromise = null;
});

mongoose.connection.on('error', (err) => {
  console.error('❌ MongoDB connection error:', err.message);
});

module.exports = connectDB;

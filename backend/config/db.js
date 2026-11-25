const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  try {
    const connStr = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/smartexpense';
    const conn = await mongoose.connect(connStr, {
      serverSelectionTimeoutMS: 2000, // Fast 2-second timeout for instant startup
    });
    isConnected = true;
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    return true;
  } catch (error) {
    console.warn(`⚠️ MongoDB not reachable at 127.0.0.1:27017 (${error.message})`);
    console.warn('ℹ️ SmartExpense-AI running in graceful high-speed in-memory persistence mode.');
    isConnected = false;
    return false;
  }
};

const getIsConnected = () => isConnected;

module.exports = { connectDB, getIsConnected };

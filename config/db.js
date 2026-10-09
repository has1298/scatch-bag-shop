// MongoDB connection
const mongoose = require('mongoose');
const env = require('./env');

const dns = require('dns');
if (!env.isProduction) dns.setServers(['8.8.8.8', '1.1.1.1']);

async function connectDB() {
  mongoose.set('strictQuery', true);
  await mongoose.connect(env.MONGODB_URI);
  console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);

  mongoose.connection.on('error', (err) => console.error('MongoDB error:', err.message));
  mongoose.connection.on('disconnected', () => console.warn('  MongoDB disconnected'));
}

module.exports = connectDB;

const dns = require('dns');
const mongoose = require('mongoose');
const env = require('./env');

if (!env.isProduction) dns.setServers(['8.8.8.8', '1.1.1.1']);

let connecting = null;

async function connectDB() {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!connecting) {
    mongoose.set('strictQuery', true);
    connecting = mongoose
      .connect(env.MONGODB_URI, { serverSelectionTimeoutMS: 10000 })
      .then(() => {
        console.log(`MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);
        return mongoose.connection;
      })
      .catch((err) => {
        connecting = null; 
        throw err;
      });
  }

  return connecting;
}

module.exports = connectDB;

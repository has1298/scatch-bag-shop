
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const REQUIRED = ['MONGODB_URI', 'JWT_KEY', 'SESSION_SECRET'];

const missing = REQUIRED.filter((key) => !process.env[key]);
if (missing.length) {
  console.error(`\n In .env file this value is missing: ${missing.join(', ')}`);
  
  process.exit(1);
}

const env = {
  PORT: Number(process.env.PORT) || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  isProduction: process.env.NODE_ENV === 'production',
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_KEY: process.env.JWT_KEY,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  SESSION_SECRET: process.env.SESSION_SECRET,
  OWNER_NAME: process.env.OWNER_NAME || 'Scatch Owner',
  OWNER_EMAIL: process.env.OWNER_EMAIL,
  OWNER_PASSWORD: process.env.OWNER_PASSWORD,
  CURRENCY: process.env.CURRENCY || 'Rs.',
  PLATFORM_FEE: Number(process.env.PLATFORM_FEE ?? 20),
};

module.exports = env;

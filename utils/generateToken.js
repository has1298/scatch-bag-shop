
const jwt = require('jsonwebtoken');
const env = require('../config/env');

function generateToken(account, role) {
  return jwt.sign({ id: account._id.toString(), email: account.email, role }, env.JWT_KEY, {
    expiresIn: env.JWT_EXPIRES_IN,
  });
}

function verifyToken(token) {
  return jwt.verify(token, env.JWT_KEY);
}

module.exports = { generateToken, verifyToken };

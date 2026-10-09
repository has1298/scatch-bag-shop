
const env = require('../config/env');

const TOKEN_COOKIE = 'token';
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000;

const baseOptions = {
  httpOnly: true, 
  sameSite: 'lax', 
  secure: env.isProduction, 
  path: '/',
};

function setAuthCookie(res, token) {
  res.cookie(TOKEN_COOKIE, token, { ...baseOptions, maxAge: SEVEN_DAYS });
}

function clearAuthCookie(res) {
  res.clearCookie(TOKEN_COOKIE, baseOptions);
}

module.exports = { TOKEN_COOKIE, setAuthCookie, clearAuthCookie };

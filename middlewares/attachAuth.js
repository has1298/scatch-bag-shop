
const { verifyToken } = require('../utils/generateToken');
const { TOKEN_COOKIE, clearAuthCookie } = require('../utils/cookie');

module.exports = function attachAuth(req, res, next) {
  req.auth = null;
  res.locals.authRole = null;

  const token = req.cookies[TOKEN_COOKIE];
  if (token) {
    try {
      const decoded = verifyToken(token);
      req.auth = decoded; 
      res.locals.authRole = decoded.role;
    } catch {
      clearAuthCookie(res); 
    }
  }
  next();
};

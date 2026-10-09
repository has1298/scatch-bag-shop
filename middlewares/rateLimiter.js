const rateLimit = require('express-rate-limit');
const backUrl = require('../utils/safeRedirect');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minute
  limit: 20, // Only 20 attempts allowed every 15 minutes per IP address
  standardHeaders: 'draft-7',
  legacyHeaders: false,
  handler: (req, res) => {
    req.flash('error', `Too many attempts. Please try again after 15 minutes.`);
    res.redirect(backUrl(req, '/'));
  },
});

module.exports = { authLimiter };

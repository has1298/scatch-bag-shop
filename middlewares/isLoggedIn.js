const User = require('../models/user.model');
const { clearAuthCookie } = require('../utils/cookie');

module.exports = async function isLoggedIn(req, res, next) {
  try {
    if (req.auth && req.auth.role === 'owner') {
      req.flash('error', '`Please log in with a customer account to access the shop/cart (you are currently logged in as an owner).`');
      return res.redirect('/owners/admin');
    }
    if (!req.auth || req.auth.role !== 'user') {
      req.flash('error', 'Login first');
      return res.redirect('/');
    }

    const user = await User.findById(req.auth.id);
    if (!user) {
      clearAuthCookie(res);
      req.flash('error', 'Account not found. Please login again.');
      return res.redirect('/');
    }

    req.user = user;
    res.locals.user = user;
    res.locals.cartCount = user.cartCount;
    return next();
  } catch (err) {
    return next(err);
  }
};

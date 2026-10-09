
const Owner = require('../models/owner.model');
const { clearAuthCookie } = require('../utils/cookie');

module.exports = async function isOwner(req, res, next) {
  try {
    if (!req.auth || req.auth.role !== 'owner') {
      req.flash('error', 'this page only for owner, login as a owner');
      return res.redirect('/owners/login');
    }

    const owner = await Owner.findById(req.auth.id);
    if (!owner) {
      clearAuthCookie(res);
      req.flash('error', 'Owner account not founded');
      return res.redirect('/owners/login');
    }

    req.owner = owner;
    res.locals.owner = owner;
    return next();
  } catch (err) {
    return next(err);
  }
};

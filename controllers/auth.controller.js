const User = require('../models/user.model');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken } = require('../utils/generateToken');

const { setAuthCookie, clearAuthCookie } = require('../utils/cookie');
const { validateRegister, validateLogin } = require('../utils/validators');


exports.registerUser = asyncHandler(async (req, res) => {
  const { data, errors } = validateRegister(req.body);
  if (errors.length) {
    req.flash('error', errors);
    return res.redirect('/?tab=register');
  }

  const exists = await User.exists({ email: data.email });
  if (exists) {
    req.flash('error', 'Already have an account, Please login');
    return res.redirect('/');
  }


  let user;
  try {
    user = await User.create(data);
  } catch (err) {
    if (err.code === 11000) {
      req.flash('error', 'Already have an account, Please login');
      return res.redirect('/');
    }
    throw err;
  }

  setAuthCookie(res, generateToken(user, 'user'));
  req.flash('success', `Welcome ${user.fullname}! your account is created`);
  return res.redirect('/shop');
});


exports.loginUser = asyncHandler(async (req, res) => {
  const { data, errors } = validateLogin(req.body);
  if (errors.length) {
    req.flash('error', errors);
    return res.redirect('/');
  }

  const user = await User.findOne({ email: data.email }).select('+password');
  const ok = user && (await user.comparePassword(data.password));
  if (!ok) {
    req.flash('error', 'Email or Password is incorrect');
    return res.redirect('/');
  }

  setAuthCookie(res, generateToken(user, 'user'));
  req.flash('success', `Welcome back, ${user.fullname}`);
  return res.redirect('/shop');
});


exports.logoutUser = (req, res) => {
  clearAuthCookie(res);
  req.flash('success', 'You logged out');
  res.redirect('/');
};

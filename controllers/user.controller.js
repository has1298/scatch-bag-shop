
const User = require('../models/user.model');
const Order = require('../models/order.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const setOrderStatus = require('../utils/orderStatus');
const { generateToken } = require('../utils/generateToken');
const { setAuthCookie } = require('../utils/cookie');
const { validateProfile } = require('../utils/validators');
const { COUNTRIES } = require('../utils/constants');


exports.profilePage = asyncHandler(async (req, res) => {
  const orderCount = await Order.countDocuments({ user: req.user._id });
  res.render('profile', { title: 'My profile', orderCount, countries: COUNTRIES, active: 'profile' });
});


exports.updateProfile = asyncHandler(async (req, res) => {
  const { data, errors } = validateProfile(req.body);
  if (errors.length) {
    req.flash('error', errors);
    return res.redirect('/users/profile');
  }

  const user = req.user;
  if (data.email !== user.email) {
    const taken = await User.exists({ email: data.email, _id: { $ne: user._id } });
    if (taken) {
      req.flash('error', 'This email already has an account.');
      return res.redirect('/users/profile');
    }
  }

  user.fullname = data.fullname;
  user.email = data.email;
  user.contact = data.contact;
  user.address = data.address;
  try {
    await user.save();
  } catch (err) {
    if (err.code === 11000) {
      req.flash('error', 'This email already has an account.');
      return res.redirect('/users/profile');
    }
    throw err;
  }


  setAuthCookie(res, generateToken(user, 'user'));
  req.flash('success', 'Profile saved');
  return res.redirect('/users/profile');
});


exports.myOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ user: req.user._id })
    .populate('items.product', 'bgcolor updatedAt')
    .sort({ createdAt: -1 });
  res.render('my-orders', { title: 'My orders', orders, active: 'orders' });
});


exports.cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) throw new AppError('Order not founded', 404);

  if (order.status !== 'placed') {
    req.flash('error', 'Only orders that have not shipped yet can be cancelled.');
    return res.redirect('/users/orders');
  }

  await setOrderStatus(order, 'cancelled');
  req.flash('success', `Order #${order.code} canceled`);
  return res.redirect('/users/orders');
});


const Owner = require('../models/owner.model');
const Product = require('../models/product.model');
const Order = require('../models/order.model');
const asyncHandler = require('../utils/asyncHandler');
const { generateToken } = require('../utils/generateToken');
const { setAuthCookie, clearAuthCookie } = require('../utils/cookie');
const { validateLogin } = require('../utils/validators');
const setOrderStatus = require('../utils/orderStatus');
const AppError = require('../utils/AppError');
const { ORDER_STATUSES, STATUS_LABELS, PAYMENT_METHODS } = require('../utils/constants');


exports.loginPage = (req, res) => {
  if (req.auth && req.auth.role === 'owner') return res.redirect('/owners/admin');
  return res.render('owner-login', { title: 'Owner Login' });
};


exports.loginOwner = asyncHandler(async (req, res) => {
  const { data, errors } = validateLogin(req.body);
  if (errors.length) {
    req.flash('error', errors);
    return res.redirect('/owners/login');
  }

  const owner = await Owner.findOne({ email: data.email }).select('+password');
  const ok = owner && (await owner.comparePassword(data.password));
  if (!ok) {
    req.flash('error', 'Email or Password incorrect');
    return res.redirect('/owners/login');
  }

  setAuthCookie(res, generateToken(owner, 'owner'));
  req.flash('success', `Welcome ${owner.fullname}`);
  return res.redirect('/owners/admin');
});


exports.logoutOwner = (req, res) => {
  clearAuthCookie(res);
  req.flash('success', 'Owner logout');
  res.redirect('/owners/login');
};


exports.adminPanel = asyncHandler(async (req, res) => {
  const products = await Product.find().select('-image').sort({ createdAt: -1 });

  const [orderStats] = await Order.aggregate([
    { $group: { _id: null, orders: { $sum: 1 }, revenue: { $sum: '$totals.total' } } },
  ]);

  const stats = {
    totalProducts: products.length,
    inStock: products.filter((p) => p.stock > 0).length,
    soldOut: products.filter((p) => p.stock <= 0).length,
    itemsSold: products.reduce((sum, p) => sum + (p.soldCount || 0), 0),
    orders: orderStats ? orderStats.orders : 0,
    revenue: orderStats ? orderStats.revenue : 0,
  };

  res.render('admin', { title: 'Dashboard', products, stats, active: 'dashboard' });
});


exports.ordersPage = asyncHandler(async (req, res) => {
  const status = ORDER_STATUSES.includes(req.query.status) ? req.query.status : 'all';
  const query = status === 'all' ? {} : { status };

  const [orders, counts] = await Promise.all([
    Order.find(query).populate('user', 'fullname email').sort({ createdAt: -1 }).limit(200),
    Order.aggregate([{ $group: { _id: '$status', n: { $sum: 1 } } }]),
  ]);
  const statusCounts = Object.fromEntries(counts.map((c) => [c._id, c.n]));

  res.render('orders', {
    title: 'Orders',
    orders,
    status,
    statusCounts,
    statuses: ORDER_STATUSES,
    statusLabels: STATUS_LABELS,
    paymentMethods: PAYMENT_METHODS,
    active: 'orders',
  });
});

// PATCH /owners/orders/:id/status
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) throw new AppError('Order not found', 404);

  const { status } = req.body;
  const back = `/owners/orders${req.query.from ? `?status=${encodeURIComponent(req.query.from)}` : ''}`;

  if (!ORDER_STATUSES.includes(status)) {
    req.flash('error', 'Wrong status');
    return res.redirect(back);
  }
  if (order.status === 'cancelled') {
    req.flash('error', 'The status of a cancelled order cannot be changed.');
    return res.redirect(back);
  }
  if (order.status === status) return res.redirect(back);

  await setOrderStatus(order, status);
  req.flash('success', `Order #${order.code} ab "${STATUS_LABELS[status]}" hai`);
  return res.redirect(back);
});

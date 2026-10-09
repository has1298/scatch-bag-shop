const Product = require('../models/product.model');
const Order = require('../models/order.model');
const asyncHandler = require('../utils/asyncHandler');
const calcCartTotals = require('../utils/cartTotals');
const backUrl = require('../utils/safeRedirect');
const { validateCheckout } = require('../utils/validators');
const { COUNTRIES, PAYMENT_METHODS } = require('../utils/constants');

async function loadCart(user) {
  await user.populate({ path: 'cart.product', select: '-image' });
  const validItems = user.cart.filter((item) => item.product);
  if (validItems.length !== user.cart.length) {
    user.cart = validItems;
    await user.save();
    await user.populate({ path: 'cart.product', select: '-image' });
  }
  return user.cart;
}

// GET 
exports.viewCart = asyncHandler(async (req, res) => {
  const items = await loadCart(req.user);
  const totals = calcCartTotals(items);
  res.render('cart', { title: 'Cart', items, totals, active: 'cart' });
});


exports.addToCart = asyncHandler(async (req, res) => {
  const redirectTo = backUrl(req, '/shop');
  const product = await Product.findById(req.params.id).select('name stock');
  if (!product) {
    req.flash('error', 'Product not found');
    return res.redirect(redirectTo);
  }
  if (product.stock <= 0) {
    req.flash('error', `"${product.name}" sold out`);
    return res.redirect(redirectTo);
  }

  const user = req.user;
  const item = user.cart.find((i) => i.product.equals(product._id));
  if (item) {
    if (item.quantity + 1 > product.stock) {
      req.flash('error', `Only "${product.stock}" pieces of "${product.name}" left in stock`);
      return res.redirect(redirectTo);
    }
    item.quantity += 1;
  } else {
    user.cart.push({ product: product._id, quantity: 1 });
  }
  await user.save();

  req.flash('success', `"${product.name}" added to card`);
  return res.redirect(redirectTo);
});

exports.increaseQty = asyncHandler(async (req, res) => {
  const user = req.user;
  const item = user.cart.find((i) => i.product.equals(req.params.id));
  if (!item) return res.redirect('/cart');

  const product = await Product.findById(req.params.id).select('name stock');
  if (!product) {
    user.cart = user.cart.filter((i) => !i.product.equals(req.params.id));
    await user.save();
    req.flash('error', 'This product are not available');
    return res.redirect('/cart');
  }
  if (item.quantity + 1 > product.stock) {
    req.flash('error', `Only "${product.stock}" items of "${product.name}" left in stock.`);
    return res.redirect('/cart');
  }

  item.quantity += 1;
  await user.save();
  return res.redirect('/cart');
});

exports.decreaseQty = asyncHandler(async (req, res) => {
  const user = req.user;
  const item = user.cart.find((i) => i.product.equals(req.params.id));
  if (!item) return res.redirect('/cart');

  if (item.quantity > 1) item.quantity -= 1;
  else user.cart = user.cart.filter((i) => !i.product.equals(req.params.id));

  await user.save();
  return res.redirect('/cart');
});


exports.removeFromCart = asyncHandler(async (req, res) => {
  const user = req.user;
  user.cart = user.cart.filter((i) => !i.product.equals(req.params.id));
  await user.save();
  req.flash('success', 'Item removed from card');
  return res.redirect('/cart');
});


exports.checkoutPage = asyncHandler(async (req, res) => {
  const user = req.user;
  const items = await loadCart(user);
  if (!items.length) {
    req.flash('error', 'Your cart is empty. Add items to checkout.');
    return res.redirect('/shop');
  }

  const previous = req.session.checkoutForm;
  delete req.session.checkoutForm;
  const address = user.address || {};
  const form = previous || {
    fullname: user.fullname,
    phone: user.contact || '',
    line: address.line || '',
    city: address.city || '',
    postalCode: address.postalCode || '',
    country: address.country || 'Pakistan',
    paymentMethod: 'cod',
    saveAddress: true,
  };

  return res.render('checkout', {
    title: 'Checkout',
    items,
    totals: calcCartTotals(items),
    form,
    countries: COUNTRIES,
    paymentMethods: PAYMENT_METHODS,
    active: 'cart',
  });
});


exports.placeOrder = asyncHandler(async (req, res) => {
  const user = req.user;

  const { data, errors } = validateCheckout(req.body);
  if (errors.length) {
    req.session.checkoutForm = data;
    req.flash('error', errors);
    return res.redirect('/cart/checkout');
  }

  const items = await loadCart(user);
  if (!items.length) {
    req.flash('error', 'Cart is empty');
    return res.redirect('/shop');
  }


  const shortItem = items.find((i) => i.quantity > i.product.stock);
  if (shortItem) {
    const left = shortItem.product.stock;
    req.flash(
      'error',
      left > 0
        ? `Only ${left} pieces of "${shortItem.product.name}" left in stock, please reduce quantity`
        : `"${shortItem.product.name}" is sold out, please remove it from cart`
    );
    return res.redirect('/cart');
  }


  const done = [];
  for (const item of items) {
    const result = await Product.updateOne(
      { _id: item.product._id, stock: { $gte: item.quantity } },
      { $inc: { stock: -item.quantity, soldCount: item.quantity } }
    );
    if (result.modifiedCount === 0) {
      await Promise.all(
        done.map((d) =>
          Product.updateOne({ _id: d.product._id }, { $inc: { stock: d.quantity, soldCount: -d.quantity } })
        )
      );
      req.flash('error', `"${item.product.name}" just sold out, please check your cart`);
      return res.redirect('/cart');
    }
    done.push(item);
  }

  
  const totals = calcCartTotals(items);
  const order = await Order.create({
    user: user._id,
    items: items.map((i) => ({
      product: i.product._id,
      name: i.product.name,
      price: i.product.price,
      discount: i.product.discount || 0,
      quantity: i.quantity,
    })),
    shipping: {
      fullname: data.fullname,
      phone: data.phone,
      email: user.email,
      line: data.line,
      city: data.city,
      postalCode: data.postalCode,
      country: data.country,
    },
    paymentMethod: data.paymentMethod,
    totals: {
      mrp: totals.mrp,
      discount: totals.discount,
      platformFee: totals.platformFee,
      shipping: totals.shipping,
      total: totals.total,
    },
  });


  user.cart = [];
  user.orders.push(order._id);
  if (data.saveAddress) {
    user.contact = data.phone;
    user.address = { line: data.line, city: data.city, postalCode: data.postalCode, country: data.country };
  }
  await user.save();

  req.flash('success', `Order #${order.code} placed successfully! Payment will be collected in cash upon delivery.`);
  return res.redirect('/users/orders');
});

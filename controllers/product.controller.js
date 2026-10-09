
const Product = require('../models/product.model');
const User = require('../models/user.model');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const { validateProduct } = require('../utils/validators');


exports.createPage = (req, res) => {
  res.render('createproducts', { title: 'Create Product', active: 'create' });
};


exports.createProduct = asyncHandler(async (req, res) => {
  const { data, errors } = validateProduct(req.body);
  if (!req.file) errors.unshift('Select product image');
  if (errors.length) {
    req.flash('error', errors);
    return res.redirect('/products/create');
  }

  const product = await Product.create({
    ...data,
    image: req.file.buffer,
    imageType: req.file.mimetype,
    createdBy: req.owner._id,
  });

  req.flash('success', `"${product.name}" created`);
  return res.redirect('/products/create');
});


exports.productImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).select('+image');
  if (!product || !product.image) throw new AppError('Image not found', 404);

  res.set('Content-Type', product.imageType || 'image/png');
  
  res.set('Cache-Control', req.query.v ? 'public, max-age=31536000, immutable' : 'public, max-age=300');
  return res.send(product.image);
});


exports.editPage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).select('-image');
  if (!product) throw new AppError('Product not found', 404);
  res.render('edit-product', { title: `Edit ${product.name}`, product, active: 'dashboard' });
});


exports.updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id).select('-image');
  if (!product) throw new AppError('Product not found', 404);

  const { data, errors } = validateProduct(req.body);
  if (errors.length) {
    req.flash('error', errors);
    return res.redirect(`/products/${product._id}/edit`);
  }

  const update = { ...data };
  if (req.file) {
    update.image = req.file.buffer;
    update.imageType = req.file.mimetype;
  }
  await Product.updateOne({ _id: product._id }, { $set: update }, { runValidators: true });

  req.flash('success', `"${data.name}" updated`);
  return res.redirect('/owners/admin');
});


exports.markSoldOut = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, { $set: { stock: 0 } }, { new: true }).select('name');
  if (!product) throw new AppError('Product nahi mila', 404);
  req.flash('success', `"${product.name}" sold out marked`);
  return res.redirect('/owners/admin');
});


exports.deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findByIdAndDelete(req.params.id).select('name');
  if (!product) throw new AppError('Product not found', 404);

  await User.updateMany({ 'cart.product': product._id }, { $pull: { cart: { product: product._id } } });

  req.flash('success', `"${product.name}" deleted`);
  return res.redirect('/owners/admin');
});


exports.deleteAllProducts = asyncHandler(async (req, res) => {
  const { deletedCount } = await Product.deleteMany({});
  await User.updateMany({}, { $set: { cart: [] } });
  req.flash('success', `${deletedCount} products deleted`);
  return res.redirect('/owners/admin');
});

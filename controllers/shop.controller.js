
const asyncHandler = require('../utils/asyncHandler');
const { SORT_OPTIONS, FILTER_OPTIONS, listProducts } = require('../utils/productQuery');

exports.home = (req, res) => {
  if (req.auth && req.auth.role === 'user') return res.redirect('/shop');
  if (req.auth && req.auth.role === 'owner') return res.redirect('/owners/admin');
  return res.render('index', { title: 'Welcome', tab: req.query.tab === 'register' ? 'register' : 'login' });
};


exports.shop = asyncHandler(async (req, res) => {
  const { products, sortby, filter } = await listProducts({
    sortby: req.query.sortby,
    filter: req.query.filter,
  });

  res.render('shop', {
    title: 'Shop',
    products,
    sortby,
    filter,
    sortOptions: SORT_OPTIONS,
    filterOptions: FILTER_OPTIONS,
    active: 'shop',
  });
});

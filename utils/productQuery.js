
const Product = require('../models/product.model');

const NEW_COLLECTION_DAYS = 30;

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest', sort: { createdAt: -1 } },
  { value: 'popular', label: 'Popular', sort: { soldCount: -1, createdAt: -1 } },
  { value: 'price-low', label: 'Price: Low to High', sort: { finalPrice: 1, createdAt: -1 } },
  { value: 'price-high', label: 'Price: High to Low', sort: { finalPrice: -1, createdAt: -1 } },
];

const FILTER_OPTIONS = [
  { value: 'all', label: 'All bags', match: () => ({}) },
  {
    value: 'new',
    label: 'New collection',
    match: () => ({ createdAt: { $gte: new Date(Date.now() - NEW_COLLECTION_DAYS * 24 * 60 * 60 * 1000) } }),
  },
  { value: 'discounted', label: 'On sale', match: () => ({ discount: { $gt: 0 } }) },
  { value: 'available', label: 'In stock', match: () => ({ stock: { $gt: 0 } }) },
];

function resolveSort(value) {
  return SORT_OPTIONS.find((o) => o.value === value) || SORT_OPTIONS[0];
}

function resolveFilter(value) {
  return FILTER_OPTIONS.find((o) => o.value === value) || FILTER_OPTIONS[0];
}


async function listProducts({ sortby, filter }) {
  const sortOpt = resolveSort(sortby);
  const filterOpt = resolveFilter(filter);

  const products = await Product.aggregate([
    { $match: filterOpt.match() },
    { $project: { image: 0 } },
    { $addFields: { finalPrice: { $max: [0, { $subtract: ['$price', { $ifNull: ['$discount', 0] }] }] } } },
    { $sort: sortOpt.sort },
  ]);

  return { products, sortby: sortOpt.value, filter: filterOpt.value };
}

module.exports = { SORT_OPTIONS, FILTER_OPTIONS, listProducts };

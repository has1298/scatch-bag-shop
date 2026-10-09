
const env = require('../config/env');

function formatPrice(amount) {
  const n = Number(amount) || 0;
  return `${env.CURRENCY} ${n.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

function formatDate(date) {
  return new Date(date).toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function productImageUrl(product) {
  const v = product.updatedAt ? new Date(product.updatedAt).getTime() : '';
  return `/products/${product._id}/image?v=${v}`;
}

module.exports = { formatPrice, formatDate, productImageUrl };

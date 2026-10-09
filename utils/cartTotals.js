
const env = require('../config/env');

function calcCartTotals(items) {
  let mrp = 0;
  let discount = 0;
  let count = 0;

  items.forEach(({ product, quantity }) => {
    if (!product) return;
    mrp += product.price * quantity;
    discount += (product.discount || 0) * quantity;
    count += quantity;
  });

  const platformFee = count > 0 ? env.PLATFORM_FEE : 0;
  const shipping = 0; // FREE
  const total = mrp - discount + platformFee + shipping;

  return { mrp, discount, platformFee, shipping, total, count };
}

module.exports = calcCartTotals;

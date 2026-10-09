// Order ka status badalna. Cancel hone par stock wapas products me chala jata hai.
const Product = require('../models/product.model');

async function setOrderStatus(order, status) {
  if (status === 'cancelled' && order.status !== 'cancelled') {
    await Promise.all(
      order.items
        .filter((item) => item.product)
        .map((item) =>
          Product.updateOne(
            { _id: item.product._id || item.product },
            { $inc: { stock: item.quantity, soldCount: -item.quantity } }
          )
        )
    );
  }

  order.status = status;
  // COD: delivery par paisa mil jata hai
  if (status === 'delivered') order.paymentStatus = 'paid';
  await order.save();
  return order;
}

module.exports = setOrderStatus;

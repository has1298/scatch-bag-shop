const mongoose = require('mongoose');
const { ORDER_STATUSES, PAYMENT_METHODS } = require('../utils/constants');

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
    name: { type: String, required: true },
    price: { type: Number, required: true },
    discount: { type: Number, default: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);


const shippingSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    email: { type: String, trim: true },
    line: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    postalCode: { type: String, trim: true, default: '' },
    country: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: { type: [orderItemSchema], required: true },
    shipping: { type: shippingSchema, required: true },
    paymentMethod: { type: String, enum: Object.keys(PAYMENT_METHODS), default: 'cod' },
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    totals: {
      mrp: { type: Number, required: true },
      discount: { type: Number, required: true },
      platformFee: { type: Number, required: true },
      shipping: { type: Number, required: true },
      total: { type: Number, required: true },
    },
    status: { type: String, enum: ORDER_STATUSES, default: 'placed' },
  },
  { timestamps: true }
);


orderSchema.virtual('code').get(function code() {
  return this._id.toString().slice(-8).toUpperCase();
});

orderSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, default: 1, min: 1 },
  },
  { _id: false }
);

const addressSchema = new mongoose.Schema(
  {
    line: { type: String, trim: true, maxlength: 200, default: '' },
    city: { type: String, trim: true, maxlength: 60, default: '' },
    postalCode: { type: String, trim: true, maxlength: 12, default: '' },
    country: { type: String, trim: true, maxlength: 60, default: 'Pakistan' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    fullname: { type: String, required: true, trim: true, minlength: 3, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    
    password: { type: String, required: true, select: false },
    contact: { type: String, trim: true, default: '' },
    address: { type: addressSchema, default: () => ({}) },
    cart: { type: [cartItemSchema], default: [] },
    orders: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Order' }],
    picture: { type: String },
  },
  { timestamps: true }
);


userSchema.pre('save', async function hashPassword() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});


userSchema.methods.comparePassword = function comparePassword(plain) {
  return bcrypt.compare(plain, this.password);
};


userSchema.virtual('cartCount').get(function cartCount() {
  return (this.cart || []).reduce((sum, item) => sum + item.quantity, 0);
});


userSchema.virtual('initial').get(function initial() {
  return (this.fullname || '?').trim().charAt(0).toUpperCase();
});

module.exports = mongoose.model('User', userSchema);

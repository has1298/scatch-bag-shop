const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    
    image: { type: Buffer, required: true, select: false },
    imageType: { type: String, default: 'image/png' },

    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0, min: 0 }, 
    stock: { type: Number, default: 10, min: 0 }, 
    soldCount: { type: Number, default: 0, min: 0 },

    bgcolor: { type: String, default: '#f4f4f5' },
    panelcolor: { type: String, default: '#e4e4e7' },
    textcolor: { type: String, default: '#18181b' },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Owner' },
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } }
);

productSchema.virtual('finalPrice').get(function finalPrice() {
  return Math.max(0, this.price - (this.discount || 0));
});

productSchema.virtual('isAvailable').get(function isAvailable() {
  return this.stock > 0;
});

productSchema.index({ createdAt: -1 });
productSchema.index({ soldCount: -1 });

module.exports = mongoose.model('Product', productSchema);

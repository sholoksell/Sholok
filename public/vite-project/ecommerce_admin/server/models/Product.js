const mongoose = require('mongoose');

const variantSchema = new mongoose.Schema({
  name: String,
  sku: String,
  price: Number,
  salePrice: Number,
  stock: Number,
  attributes: {
    type: Map,
    of: String,
  },
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  description: {
    type: String,
    default: '',
  },
  shortDescription: {
    type: String,
    default: '',
  },
  categoryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true,
  },
  regularPrice: {
    type: Number,
    required: true,
  },
  salePrice: {
    type: Number,
    default: null,
  },
  sku: {
    type: String,
    required: true,
    unique: true,
  },
  stock: {
    type: Number,
    default: 0,
  },
  images: [{
    type: String,
  }],
  thumbnail: {
    type: String,
    default: '',
  },
  variants: [variantSchema],
  status: {
    type: String,
    enum: ['active', 'draft', 'out_of_stock', 'published', 'archived'],
    default: 'active',
  },
  featured: {
    type: Boolean,
    default: false,
  },
  isNew: {
    type: Boolean,
    default: false,
  },
  onSale: {
    type: Boolean,
    default: false,
  },
  tags: [{
    type: String,
  }],
  scheduledPublishDate: {
    type: Date,
    default: null,
  },
  availabilityDate: {
    type: Date,
    default: null,
  },
  shippingClass: {
    type: String,
    enum: ['standard', 'express', 'free', 'heavy', 'fragile', 'custom'],
    default: 'standard',
  },
  shippingCharge: {
    type: Number,
    default: 0,
  },
  visibility: {
    type: String,
    enum: ['visible', 'hidden'],
    default: 'visible',
  },
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  upsellProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  crossSellProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  lowStockThreshold: {
    type: Number,
    default: 5,
  },
}, {
  timestamps: true,
  suppressReservedKeysWarning: true,
});

module.exports = mongoose.models.Product || mongoose.model('Product', productSchema);

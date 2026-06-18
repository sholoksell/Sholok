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
  nameBn: {
    type: String,
    default: '',
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
  descriptionBn: {
    type: String,
    default: '',
  },
  shortDescription: {
    type: String,
    default: '',
  },
  shortDescriptionBn: {
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
    required: true,
    default: 0,
  },
  images: [{
    type: String,
  }],
  thumbnail: {
    type: String,
    default: '',
  },
  brand: {
    type: String,
    default: '',
  },
  unit: {
    type: String,
    default: 'pcs',
  },
  weight: {
    type: String,
    default: '',
  },
  variants: [variantSchema],
  tags: [{
    type: String,
  }],
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isNewArrival: {
    type: Boolean,
    default: false,
  },
  isBestSeller: {
    type: Boolean,
    default: false,
  },
  isDeal: {
    type: Boolean,
    default: false,
  },
  dealEndDate: {
    type: Date,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'out_of_stock'],
    default: 'active',
  },
  nutritionInfo: {
    type: Map,
    of: String,
  },
  viewCount: {
    type: Number,
    default: 0,
  },
  soldCount: {
    type: Number,
    default: 0,
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  reviewCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

// Text index covering both EN and BN fields for full-text search
productSchema.index({
  name: 'text', nameBn: 'text',
  description: 'text', descriptionBn: 'text',
  brand: 'text', tags: 'text',
});

// Individual field indexes for regex-based partial matching
productSchema.index({ name: 1 });
productSchema.index({ nameBn: 1 });
productSchema.index({ brand: 1 });
productSchema.index({ status: 1, isFeatured: -1, soldCount: -1, rating: -1 });

module.exports = mongoose.model('Product', productSchema);

const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
  },
  description: {
    type: String,
    required: true,
  },
  discountType: {
    type: String,
    enum: ['percentage', 'fixed', 'free_delivery'],
    required: true,
  },
  discountValue: {
    type: Number,
    required: true,
  },
  minPurchaseAmount: {
    type: Number,
    default: 0,
  },
  maxDiscountAmount: {
    type: Number,
  },
  startDate: {
    type: Date,
    required: true,
  },
  endDate: {
    type: Date,
    required: true,
  },
  usageLimit: {
    type: Number,
    default: null, // null means unlimited
  },
  usedCount: {
    type: Number,
    default: 0,
  },
  usagePerCustomer: {
    type: Number,
    default: 1,
  },
  applicableCategories: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
  }],
  applicableProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Coupon', couponSchema);

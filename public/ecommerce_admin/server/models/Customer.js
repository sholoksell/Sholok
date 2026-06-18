const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
  phone: {
    type: String,
    default: '',
  },
  password: {
    type: String,
    default: null,
  },
  address: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  addresses: [{
    label: { type: String, default: 'Home' },
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: { type: String, default: 'Bangladesh' },
    type: { type: String, enum: ['billing', 'shipping', 'both'], default: 'both' },
    isDefault: { type: Boolean, default: false },
  }],
  totalOrders: {
    type: Number,
    default: 0,
  },
  totalSpent: {
    type: Number,
    default: 0,
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'blocked'],
    default: 'active',
  },
  group: {
    type: String,
    enum: ['regular', 'wholesale', 'vip', 'dealer'],
    default: 'regular',
  },
  groupDiscount: {
    type: Number,
    default: 0,
  },
  rewardPoints: {
    type: Number,
    default: 0,
  },
  totalPointsEarned: {
    type: Number,
    default: 0,
  },
  totalPointsRedeemed: {
    type: Number,
    default: 0,
  },
  pointsHistory: [{
    type: { type: String, enum: ['earned', 'redeemed', 'bonus', 'adjusted'] },
    points: Number,
    description: String,
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    date: { type: Date, default: Date.now },
  }],
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  lastLoginDate: {
    type: Date,
    default: null,
  },
  lastLoginIp: {
    type: String,
    default: '',
  },
  loginHistory: [{
    ip: String,
    device: String,
    date: { type: Date, default: Date.now },
  }],
  passwordResetToken: { type: String, default: null },
  passwordResetExpires: { type: Date, default: null },
  activationToken: { type: String, default: null },
  isActivated: { type: Boolean, default: false },
  suspendedUntil: {
    type: Date,
    default: null,
  },
  notifications: [{
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['info', 'promo', 'warning', 'account'], default: 'info' },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.models.Customer || mongoose.model('Customer', customerSchema);

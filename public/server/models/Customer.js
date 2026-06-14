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
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  addresses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
  }],
  defaultAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
  },
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
  avatar: {
    type: String,
    default: '',
  },
  wishlist: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  lastLogin: {
    type: Date,
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
  pointsHistory: [{
    type: { type: String, enum: ['earned', 'redeemed', 'bonus', 'adjusted'] },
    points: Number,
    description: String,
    orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
    date: { type: Date, default: Date.now },
  }],
  lastLoginIp: {
    type: String,
    default: '',
  },
  loginHistory: [{
    ip: String,
    device: String,
    date: { type: Date, default: Date.now },
  }],
}, {
  timestamps: true,
});

module.exports = mongoose.model('Customer', customerSchema);

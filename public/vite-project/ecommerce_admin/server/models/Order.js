const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  productName: String,
  productImage: String,
  variantId: String,
  variantName: String,
  quantity: {
    type: Number,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  total: {
    type: Number,
    required: true,
  },
});

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  items: [orderItemSchema],
  subtotal: {
    type: Number,
    required: true,
  },
  tax: {
    type: Number,
    default: 0,
  },
  shipping: {
    type: Number,
    default: 0,
  },
  deliveryCharge: {
    type: Number,
    default: 0,
  },
  discount: {
    type: Number,
    default: 0,
  },
  couponCode: String,
  total: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'refunded'],
    default: 'pending',
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending',
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'cash_on_delivery', 'online_payment', 'card', 'mobile_banking'],
  },
  shippingAddress: {
    name: String,
    phone: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String,
  },
  deliveryAddress: {
    fullName: String,
    phone: String,
    addressLine1: String,
    addressLine2: String,
    city: String,
    area: String,
    postalCode: String,
    landmark: String,
    deliveryInstructions: String,
  },
  deliverySlot: {
    date: Date,
    timeSlot: String,
  },
  estimatedDeliveryDate: Date,
  deliveredAt: Date,
  cancelledAt: Date,
  cancellationReason: String,
  trackingNumber: { type: String, default: '' },
  courierName: { type: String, default: '' },
  adminNote: { type: String, default: '' },
  notes: {
    type: String,
    default: '',
  },
  statusHistory: [{
    status: String,
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    note: String,
  }],
}, {
  timestamps: true,
  strict: false,
});

module.exports = mongoose.models.Order || mongoose.model('Order', orderSchema);

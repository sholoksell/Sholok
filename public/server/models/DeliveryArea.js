const mongoose = require('mongoose');

const deliveryAreaSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  postalCodes: [{
    type: String,
  }],
  deliveryCharge: {
    type: Number,
    required: true,
    default: 0,
  },
  freeDeliveryThreshold: {
    type: Number,
    default: 0, // Free delivery if order above this amount
  },
  estimatedDeliveryDays: {
    type: Number,
    default: 1,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('DeliveryArea', deliveryAreaSchema);

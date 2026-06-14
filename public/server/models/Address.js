const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  addressLine1: {
    type: String,
    required: true,
  },
  addressLine2: {
    type: String,
    default: '',
  },
  city: {
    type: String,
    required: true,
  },
  area: {
    type: String,
    required: true,
  },
  postalCode: {
    type: String,
    required: true,
  },
  addressType: {
    type: String,
    enum: ['home', 'office', 'other'],
    default: 'home',
  },
  isDefault: {
    type: Boolean,
    default: false,
  },
  deliveryInstructions: {
    type: String,
    default: '',
  },
  landmark: {
    type: String,
    default: '',
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Address', addressSchema);

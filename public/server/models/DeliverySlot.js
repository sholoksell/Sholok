const mongoose = require('mongoose');

const deliverySlotSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  startTime: {
    type: String,
    required: true, // Format: "09:00"
  },
  endTime: {
    type: String,
    required: true, // Format: "12:00"
  },
  daysAvailable: [{
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
  }],
  maxOrders: {
    type: Number,
    default: 50,
  },
  currentOrders: {
    type: Number,
    default: 0,
  },
  deliveryCharge: {
    type: Number,
    default: 0,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('DeliverySlot', deliverySlotSchema);

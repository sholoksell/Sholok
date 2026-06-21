const mongoose = require('mongoose');

const deliveryZoneSchema = new mongoose.Schema({
  city: { type: String, required: true },
  areas: [{ type: String }],
  charge: { type: Number, required: true, default: 60 },
  estimatedDays: { type: Number, required: true, default: 3 },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.models.DeliveryZone || mongoose.model('DeliveryZone', deliveryZoneSchema);

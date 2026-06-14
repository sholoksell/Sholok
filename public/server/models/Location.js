const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  nameBn: {
    type: String,
    default: '',
  },
  lat: {
    type: Number,
    required: true,
  },
  lng: {
    type: Number,
    required: true,
  },
  category: {
    type: String,
    enum: ['restaurant', 'cafe', 'bank', 'hotel', 'hospital', 'school', 'mosque', 'market', 'park', 'other'],
    default: 'other',
  },
  address: {
    type: String,
    default: '',
  },
  description: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
});

locationSchema.index({ lat: 1, lng: 1 });
locationSchema.index({ category: 1, isActive: 1 });

module.exports = mongoose.model('Location', locationSchema);

const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  subtitle: {
    type: String,
    default: '',
  },
  image: {
    type: String,
    required: true,
  },
  mobileImage: {
    type: String,
  },
  link: {
    type: String,
    default: '',
  },
  linkType: {
    type: String,
    enum: ['category', 'product', 'external', 'none'],
    default: 'none',
  },
  position: {
    type: String,
    enum: ['hero', 'middle', 'sidebar', 'footer'],
    default: 'hero',
  },
  order: {
    type: Number,
    default: 0,
  },
  startDate: {
    type: Date,
    default: Date.now,
  },
  endDate: {
    type: Date,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  clickCount: {
    type: Number,
    default: 0,
  },
}, {
  timestamps: true,
});

module.exports = mongoose.model('Banner', bannerSchema);

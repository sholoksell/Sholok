const mongoose = require('mongoose');

const bannerSchema = new mongoose.Schema({
  // ── Multilingual title: { en: 'Special Offer', bn: 'বিশেষ অফার' } ─────────
  title: {
    en: { type: String, required: true, default: '' },
    bn: { type: String, default: '' },
  },
  // ── Multilingual subtitle ────────────────────────────────────────────────
  subtitle: {
    en: { type: String, default: '' },
    bn: { type: String, default: '' },
  },
  // ── Multilingual description ─────────────────────────────────────────────
  description: {
    en: { type: String, default: '' },
    bn: { type: String, default: '' },
  },
  image: {
    type: String,
    required: true
  },
  imageMobile: {
    type: String,
    default: ''
  },
  linkUrl: {
    type: String,
    default: ''
  },
  // ── Multilingual CTA button text ─────────────────────────────────────────
  linkText: {
    en: { type: String, default: 'Shop Now' },
    bn: { type: String, default: 'কিনুন' },
  },
  backgroundColor: {
    type: String,
    default: '#ffffff'
  },
  textColor: {
    type: String,
    default: '#000000'
  },
  buttonColor: {
    type: String,
    default: '#E31E24'
  },
  order: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  startDate: {
    type: Date,
    default: null
  },
  endDate: {
    type: Date,
    default: null
  },
  position: {
    type: String,
    enum: ['hero', 'middle', 'footer'],
    default: 'hero'
  }
}, {
  timestamps: true
});

// Index for quick queries
bannerSchema.index({ isActive: 1, order: 1 });
bannerSchema.index({ position: 1, isActive: 1 });

module.exports = mongoose.models.Banner || mongoose.model('Banner', bannerSchema);

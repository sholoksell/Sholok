const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  // ── Multilingual name: { en: 'Mobile', bn: 'মোবাইল' } ────────────────────
  name: {
    en: { type: String, required: true, default: '' },
    bn: { type: String, default: '' },
  },
  slug: {
    type: String,
    required: true,
    unique: true,
  },
  // ── Multilingual description ───────────────────────────────────────────────
  description: {
    en: { type: String, default: '' },
    bn: { type: String, default: '' },
  },
  image: {
    type: String,
    default: '',
  },
  banner: {
    type: String,
    default: '',
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    default: null,
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  featured: {
    type: Boolean,
    default: false,
  },
  order: {
    type: Number,
    default: 0,
  },
  icon: {
    type: String,
    default: '',
  },
  metaTitle: {
    type: String,
    default: '',
  },
  metaDescription: {
    type: String,
    default: '',
  },
  showOnMenu: {
    type: Boolean,
    default: true,
  },
  showOnHomepage: {
    type: Boolean,
    default: true,
  },
  showInSearch: {
    type: Boolean,
    default: true,
  },
}, {
  timestamps: true,
  bufferTimeoutMS: 45000,
});

module.exports = mongoose.models.Category || mongoose.model('Category', categorySchema);

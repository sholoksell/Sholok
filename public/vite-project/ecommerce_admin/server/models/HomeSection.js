const mongoose = require('mongoose');

// One product card inside a Home Page Section.
// We embed the product data directly so the storefront only needs ONE
// API call per page load (no extra populate). Optionally `productId`
// can reference the canonical Product collection for advanced flows.
const homeSectionItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
    },
    name: { type: String, required: true, trim: true },
    nameBn: { type: String, default: '' },
    slug: { type: String, default: '' },
    image: { type: String, default: '' },
    price: { type: Number, default: 0 },
    comparePrice: { type: Number, default: 0 },
    unit: { type: String, default: '' }, // "1 kg", "500 ml", etc.
    badge: { type: String, default: '' }, // "New", "-20%", etc.
    minQty: { type: Number, default: 0 },
    description: { type: String, default: '' }, // rich HTML
    descriptionBn: { type: String, default: '' },
    link: { type: String, default: '' }, // optional override URL
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const homeSectionSchema = new mongoose.Schema(
  {
    // Stable identifier used by the storefront (e.g. "recommended-for-you")
    key: { type: String, required: true, unique: true, trim: true },
    title: { type: String, required: true, trim: true },
    titleBn: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    subtitleBn: { type: String, default: '' },
    description: { type: String, default: '' }, // rich HTML
    descriptionBn: { type: String, default: '' },
    icon: { type: String, default: '' }, // emoji like "🔥", "🍪"
    // Visual layout the storefront should use to render this section
    layout: {
      type: String,
      enum: ['grid', 'carousel'],
      default: 'carousel',
    },
    // Theme color for header / accents (hex)
    accentColor: { type: String, default: '' },
    backgroundColor: { type: String, default: '' },
    // Optional banner image shown on the section header
    bannerImage: { type: String, default: '' },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    products: { type: [homeSectionItemSchema], default: [] },
  },
  { timestamps: true }
);

homeSectionSchema.index({ isActive: 1, order: 1 });

module.exports =
  mongoose.models.HomeSection ||
  mongoose.model('HomeSection', homeSectionSchema);

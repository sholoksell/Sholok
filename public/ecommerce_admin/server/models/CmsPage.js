/**
 * CMS Page model — fully multilingual.
 *
 * Both title and content are stored as { en, bn } objects.
 * When the selected language value is missing, the frontend
 * falls back to the other language via translateField().
 */
const mongoose = require('mongoose');

const cmsPageSchema = new mongoose.Schema(
  {
    slug: { type: String, required: true, unique: true, trim: true },
    title: {
      en: { type: String, default: '' },
      bn: { type: String, default: '' },
    },
    content: {
      en: { type: String, default: '' },
      bn: { type: String, default: '' },
    },
    excerpt: {
      en: { type: String, default: '' },
      bn: { type: String, default: '' },
    },
    metaTitle: {
      en: { type: String, default: '' },
      bn: { type: String, default: '' },
    },
    metaDescription: {
      en: { type: String, default: '' },
      bn: { type: String, default: '' },
    },
    featuredImage: { type: String, default: '' },
    isActive: { type: Boolean, default: true },
    template: {
      type: String,
      enum: ['default', 'about', 'contact', 'faq', 'landing'],
      default: 'default',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('CmsPage', cmsPageSchema);

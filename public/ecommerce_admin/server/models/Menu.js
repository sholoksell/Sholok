/**
 * Menu model — fully multilingual.
 *
 * Each menu item title is stored as { en, bn }.
 * Sub-items can be nested via the children array.
 */
const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  title: {
    en: { type: String, default: '' },
    bn: { type: String, default: '' },
  },
  url: { type: String, default: '' },
  icon: { type: String, default: '' },
  order: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  openInNewTab: { type: Boolean, default: false },
  // Self-referencing children
  children: [{ type: mongoose.Schema.Types.ObjectId, ref: 'MenuItem' }],
});

const menuSchema = new mongoose.Schema(
  {
    // Menu location / name identifier (e.g. 'header', 'footer', 'sidebar')
    location: { type: String, required: true, unique: true },
    label: {
      en: { type: String, default: '' },
      bn: { type: String, default: '' },
    },
    items: [menuItemSchema],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Menu', menuSchema);

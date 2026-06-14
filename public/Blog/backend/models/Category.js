const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '' },
    color: { type: String, default: '#6366f1' },
    image: { type: String, default: '' },
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SholokBlogCategory',
      default: null,
    },
    subcategories: [
      {
        name: String,
        slug: String,
        icon: String,
      },
    ],
    isActive: { type: Boolean, default: true },
    order: { type: Number, default: 0 },
    postCount: { type: Number, default: 0 },
    group: {
      type: String,
      enum: ['entertainment', 'lifestyle', 'hobbies', 'knowledge'],
      required: true,
    },
  },
  { timestamps: true, collection: 'sholokblogs_categories' }
);

module.exports = mongoose.model('SholokBlogCategory', categorySchema);

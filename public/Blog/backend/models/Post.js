const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 200 },
    titleBn: { type: String, trim: true, maxlength: 200, default: '' },
    titleEn: { type: String, trim: true, maxlength: 200, default: '' },
    slug: { type: String, unique: true, lowercase: true },
    content: { type: String, required: true },
    contentBn: { type: String, default: '' },
    contentEn: { type: String, default: '' },
    excerpt: { type: String, maxlength: 500 },
    excerptBn: { type: String, maxlength: 500, default: '' },
    excerptEn: { type: String, maxlength: 500, default: '' },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SholokBlogUser',
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SholokBlogCategory',
      required: true,
    },
    subcategory: { type: String, default: '' },
    tags: [{ type: String, lowercase: true, trim: true }],
    featuredImage: { type: String, default: '' },
    images: [{ type: String }],
    videos: [
      {
        url: String,
        thumbnail: String,
        title: String,
        isShortClip: { type: Boolean, default: false },
      },
    ],
    location: { type: String, default: '' },
    status: {
      type: String,
      enum: ['draft', 'published', 'scheduled', 'deleted'],
      default: 'draft',
    },
    scheduledAt: { type: Date },
    publishedAt: { type: Date },
    views: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 },
    viewHistory: [
      {
        ip: String,
        viewedAt: Date,
      },
    ],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SholokBlogUser' }],
    isFeatured: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    seoTitle: { type: String, maxlength: 70 },
    seoDescription: { type: String, maxlength: 160 },
    readTime: { type: Number, default: 0 }, // minutes
    language: { type: String, default: 'en' },
  },
  { timestamps: true, collection: 'sholokblogs_posts' }
);

// Calculate read time before save
postSchema.pre('save', function (next) {
  if (this.isModified('content')) {
    const wordsPerMinute = 200;
    const wordCount = this.content.replace(/<[^>]*>/g, '').split(/\s+/).length;
    this.readTime = Math.ceil(wordCount / wordsPerMinute);
  }
  if (this.isModified('content') && !this.excerpt) {
    const plainText = this.content.replace(/<[^>]*>/g, '').trim();
    this.excerpt = plainText.substring(0, 200) + (plainText.length > 200 ? '...' : '');
  }
  next();
});

// Index for text search
postSchema.index({ title: 'text', content: 'text', tags: 'text' });
postSchema.index({ author: 1, status: 1 });
postSchema.index({ category: 1, status: 1 });
postSchema.index({ createdAt: -1 });
postSchema.index({ views: -1 });

module.exports = mongoose.model('SholokBlogPost', postSchema);

const mongoose = require('mongoose');

const analyticsSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SholokBlogPost',
      required: true,
    },
    date: { type: Date, required: true },
    views: { type: Number, default: 0 },
    uniqueViews: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    reactions: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 },
    avgReadTime: { type: Number, default: 0 }, // seconds
    deviceBreakdown: {
      desktop: { type: Number, default: 0 },
      mobile: { type: Number, default: 0 },
      tablet: { type: Number, default: 0 },
    },
    referrers: [
      {
        source: String,
        count: Number,
      },
    ],
  },
  { timestamps: true, collection: 'sholokblogs_analytics' }
);

analyticsSchema.index({ post: 1, date: -1 });
analyticsSchema.index({ date: -1 });

module.exports = mongoose.model('SholokBlogAnalytics', analyticsSchema);

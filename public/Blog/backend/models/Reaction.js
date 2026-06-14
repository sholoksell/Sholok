const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SholokBlogPost',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SholokBlogUser',
      required: true,
    },
    type: {
      type: String,
      enum: ['like', 'heart', 'funny', 'amazing', 'sad', 'angry', 'support'],
      required: true,
    },
  },
  { timestamps: true, collection: 'sholokblogs_reactions' }
);

// One reaction per user per post
reactionSchema.index({ post: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('SholokBlogReaction', reactionSchema);

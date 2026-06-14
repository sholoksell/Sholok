const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SholokBlogPost',
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SholokBlogUser',
      required: true,
    },
    content: { type: String, required: true, maxlength: 2000 },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SholokBlogComment',
      default: null,
    },
    replies: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SholokBlogComment' }],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'SholokBlogUser' }],
    isDeleted: { type: Boolean, default: false },
    isSpam: { type: Boolean, default: false },
  },
  { timestamps: true, collection: 'sholokblogs_comments' }
);

commentSchema.index({ post: 1, createdAt: -1 });
commentSchema.index({ parentComment: 1 });

module.exports = mongoose.model('SholokBlogComment', commentSchema);

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SholokBlogUser',
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SholokBlogUser',
    },
    type: {
      type: String,
      enum: [
        'new_comment',
        'new_reaction',
        'new_follower',
        'new_post',
        'comment_reply',
        'neighbor_request',
        'neighbor_accepted',
        'post_featured',
        'system',
      ],
      required: true,
    },
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SholokBlogPost',
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SholokBlogComment',
    },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    link: { type: String, default: '' },
  },
  { timestamps: true, collection: 'sholokblogs_notifications' }
);

notificationSchema.index({ recipient: 1, isRead: 1, createdAt: -1 });

module.exports = mongoose.model('SholokBlogNotification', notificationSchema);

const express = require('express');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

const sendNotification = async (io, data) => {
  try {
    const notification = await Notification.create(data);
    await notification.populate('sender', 'username displayName avatar');
    io.to(data.recipient.toString()).emit('notification', notification);
  } catch (_) {}
};

// GET /api/comments/:postId
router.get('/:postId', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [comments, total] = await Promise.all([
      Comment.find({ post: req.params.postId, parentComment: null, isDeleted: false })
        .populate('author', 'username displayName avatar')
        .populate({ path: 'replies', match: { isDeleted: false }, populate: { path: 'author', select: 'username displayName avatar' }, options: { sort: { createdAt: 1 } } })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Comment.countDocuments({ post: req.params.postId, parentComment: null, isDeleted: false }),
    ]);

    res.json({ success: true, comments, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/comments/:postId
router.post('/:postId', protect, async (req, res) => {
  try {
    const { content, parentComment } = req.body;
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }
    if (content.length > 2000) {
      return res.status(400).json({ success: false, message: 'Comment too long (max 2000 characters)' });
    }

    const post = await Post.findById(req.params.postId);
    if (!post || post.isDeleted) return res.status(404).json({ success: false, message: 'Post not found' });

    const comment = await Comment.create({
      post: req.params.postId,
      author: req.user._id,
      content: content.trim(),
      parentComment: parentComment || null,
    });

    if (parentComment) {
      await Comment.findByIdAndUpdate(parentComment, { $push: { replies: comment._id } });
    }

    await comment.populate('author', 'username displayName avatar');

    const io = req.app.get('io');
    // Notify post author
    if (post.author.toString() !== req.user._id.toString()) {
      await sendNotification(io, {
        recipient: post.author, sender: req.user._id, type: 'new_comment',
        post: post._id, comment: comment._id,
        message: `${req.user.displayName} commented on your post "${post.title}"`,
        link: `/blog/${post.slug}`,
      });
    }
    // Notify parent comment author on reply
    if (parentComment) {
      const parent = await Comment.findById(parentComment);
      if (parent && parent.author.toString() !== req.user._id.toString()) {
        await sendNotification(io, {
          recipient: parent.author, sender: req.user._id, type: 'comment_reply',
          post: post._id, comment: comment._id,
          message: `${req.user.displayName} replied to your comment`,
          link: `/blog/${post.slug}`,
        });
      }
    }

    res.status(201).json({ success: true, comment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/comments/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });
    if (comment.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    comment.isDeleted = true;
    comment.content = '[Comment deleted]';
    await comment.save();
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/comments/:id/like
router.post('/:id/like', protect, async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);
    if (!comment) return res.status(404).json({ success: false, message: 'Comment not found' });

    const likedIndex = comment.likes.indexOf(req.user._id);
    if (likedIndex > -1) {
      comment.likes.splice(likedIndex, 1);
    } else {
      comment.likes.push(req.user._id);
    }
    await comment.save();
    res.json({ success: true, likes: comment.likes.length, liked: likedIndex === -1 });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

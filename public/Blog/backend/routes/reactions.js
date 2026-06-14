const express = require('express');
const Reaction = require('../models/Reaction');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

// GET /api/reactions/:postId
router.get('/:postId', optionalAuth, async (req, res) => {
  try {
    const reactions = await Reaction.find({ post: req.params.postId });
    const summary = { like: 0, heart: 0, funny: 0, amazing: 0, sad: 0, angry: 0, support: 0, total: 0 };
    reactions.forEach((r) => { summary[r.type] = (summary[r.type] || 0) + 1; summary.total++; });

    let userReaction = null;
    if (req.user) {
      const r = reactions.find((r) => r.user.toString() === req.user._id.toString());
      if (r) userReaction = r.type;
    }

    res.json({ success: true, summary, userReaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/reactions/:postId
router.post('/:postId', protect, async (req, res) => {
  try {
    const { type } = req.body;
    const validTypes = ['like', 'heart', 'funny', 'amazing', 'sad', 'angry', 'support'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid reaction type' });
    }

    const post = await Post.findById(req.params.postId);
    if (!post || post.isDeleted) return res.status(404).json({ success: false, message: 'Post not found' });

    const existing = await Reaction.findOne({ post: req.params.postId, user: req.user._id });

    if (existing) {
      if (existing.type === type) {
        // Remove reaction (toggle off)
        await Reaction.deleteOne({ _id: existing._id });
        const reactions = await Reaction.find({ post: req.params.postId });
        const summary = { like: 0, heart: 0, funny: 0, amazing: 0, sad: 0, angry: 0, support: 0, total: 0 };
        reactions.forEach((r) => { summary[r.type]++; summary.total++; });
        return res.json({ success: true, summary, userReaction: null, removed: true });
      } else {
        existing.type = type;
        await existing.save();
      }
    } else {
      await Reaction.create({ post: req.params.postId, user: req.user._id, type });
      // Notify post author
      if (post.author.toString() !== req.user._id.toString()) {
        try {
          const notification = await Notification.create({
            recipient: post.author, sender: req.user._id, type: 'new_reaction',
            post: post._id,
            message: `${req.user.displayName} reacted to your post "${post.title}"`,
            link: `/blog/${post.slug}`,
          });
          const io = req.app.get('io');
          io.to(post.author.toString()).emit('notification', notification);
        } catch (_) {}
      }
    }

    const reactions = await Reaction.find({ post: req.params.postId });
    const summary = { like: 0, heart: 0, funny: 0, amazing: 0, sad: 0, angry: 0, support: 0, total: 0 };
    reactions.forEach((r) => { summary[r.type]++; summary.total++; });

    res.json({ success: true, summary, userReaction: type });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

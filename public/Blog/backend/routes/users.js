const express = require('express');
const User = require('../models/User');
const Post = require('../models/Post');
const Notification = require('../models/Notification');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// GET /api/users - Popular/Top bloggers
router.get('/', async (req, res) => {
  try {
    const { page = 1, limit = 12, sort = 'followers' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);
    let sortObj = {};
    if (sort === 'followers') sortObj = { 'followers.length': -1 };
    else if (sort === 'new') sortObj = { createdAt: -1 };

    const users = await User.aggregate([
      { $match: { isActive: true, role: 'user' } },
      { $addFields: { followerCount: { $size: '$followers' } } },
      { $sort: { followerCount: -1 } },
      { $skip: skip },
      { $limit: parseInt(limit) },
      { $project: { password: 0 } },
    ]);

    const total = await User.countDocuments({ isActive: true, role: 'user' });
    res.json({ success: true, users, total, pages: Math.ceil(total / parseInt(limit)) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/:username - Profile
router.get('/:username', optionalAuth, async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username, isActive: true })
      .populate('followers', 'username displayName avatar')
      .populate('following', 'username displayName avatar')
      .lean();

    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const [posts, totalPosts] = await Promise.all([
      Post.find({ author: user._id, status: 'published', isDeleted: false })
        .populate('category', 'name slug color')
        .sort({ publishedAt: -1 })
        .limit(10)
        .lean(),
      Post.countDocuments({ author: user._id, status: 'published', isDeleted: false }),
    ]);

    const isFollowing = req.user ? user.followers.some((f) => f._id.toString() === req.user._id.toString()) : false;
    const hasPendingRequest = req.user ? user.neighborRequests.some((r) => r.toString() === req.user._id.toString()) : false;

    res.json({ success: true, user: { ...user, password: undefined }, posts, totalPosts, isFollowing, hasPendingRequest });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/users/profile - Update profile
router.put('/profile', protect, upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'coverImage', maxCount: 1 }]), async (req, res) => {
  try {
    const { displayName, bio, website, location, interests } = req.body;
    const updates = {};
    if (displayName) updates.displayName = displayName;
    if (bio !== undefined) updates.bio = bio;
    if (website !== undefined) updates.website = website;
    if (location !== undefined) updates.location = location;
    if (interests) updates.interests = JSON.parse(interests);
    if (req.files?.avatar) updates.avatar = `/uploads/avatars/${req.files.avatar[0].filename}`;
    if (req.files?.coverImage) updates.coverImage = `/uploads/avatars/${req.files.coverImage[0].filename}`;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/users/:id/follow
router.post('/:id/follow', protect, async (req, res) => {
  try {
    if (req.params.id === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'You cannot follow yourself' });
    }
    const targetUser = await User.findById(req.params.id);
    if (!targetUser || !targetUser.isActive) return res.status(404).json({ success: false, message: 'User not found' });

    const isFollowing = targetUser.followers.includes(req.user._id);
    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(req.params.id, { $pull: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $pull: { following: req.params.id } });
      return res.json({ success: true, following: false, message: 'Unfollowed successfully' });
    } else {
      // Follow
      await User.findByIdAndUpdate(req.params.id, { $addToSet: { followers: req.user._id } });
      await User.findByIdAndUpdate(req.user._id, { $addToSet: { following: req.params.id } });
      // Notify
      const io = req.app.get('io');
      try {
        const notification = await Notification.create({
          recipient: req.params.id, sender: req.user._id, type: 'new_follower',
          message: `${req.user.displayName} started following you`,
          link: `/profile/${req.user.username}`,
        });
        io.to(req.params.id).emit('notification', notification);
      } catch (_) {}
      return res.json({ success: true, following: true, message: 'Following successfully' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/:id/followers
router.get('/:id/followers', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('followers', 'username displayName avatar bio').lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, followers: user.followers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/users/:id/following
router.get('/:id/following', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('following', 'username displayName avatar bio').lean();
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, following: user.following });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/users/:id/save-post
router.post('/:id/save-post', protect, async (req, res) => {
  try {
    const { postId } = req.body;
    const user = await User.findById(req.user._id);
    const isSaved = user.savedPosts.includes(postId);
    if (isSaved) {
      user.savedPosts.pull(postId);
    } else {
      user.savedPosts.push(postId);
    }
    await user.save();
    res.json({ success: true, saved: !isSaved });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

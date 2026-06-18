const express = require('express');
const slugify = require('slugify');
const Post = require('../models/Post');
const Category = require('../models/Category');
const Notification = require('../models/Notification');
const Analytics = require('../models/Analytics');
const { protect, optionalAuth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// Helper: create unique slug
const createSlug = async (title) => {
  let slug = slugify(title, { lower: true, strict: true });
  const exists = await Post.findOne({ slug });
  if (exists) slug = `${slug}-${Date.now()}`;
  return slug;
};

// Helper: send notification
const sendNotification = async (io, data) => {
  try {
    const notification = await Notification.create(data);
    await notification.populate('sender', 'username displayName avatar');
    io.to(data.recipient.toString()).emit('notification', notification);
  } catch (_) {}
};

// GET /api/posts - Get all published posts (with filters)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 12, category, tag, author, sort = 'latest', status = 'published' } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const filter = { isDeleted: false };
    if (status === 'published') filter.status = 'published';
    if (category) filter.category = category;
    if (tag) filter.tags = { $in: [tag.toLowerCase()] };
    if (author) filter.author = author;

    let sortObj = { createdAt: -1 };
    if (sort === 'popular') sortObj = { views: -1 };
    if (sort === 'trending') sortObj = { likes: -1, views: -1 };

    const [posts, total] = await Promise.all([
      Post.find(filter)
        .populate('author', 'username displayName avatar')
        .populate('category', 'name nameBn nameEn slug color icon')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Post.countDocuments(filter),
    ]);

    res.json({
      success: true,
      posts,
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/posts/trending
router.get('/trending', async (req, res) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const posts = await Post.find({ status: 'published', isDeleted: false, publishedAt: { $gte: since } })
      .populate('author', 'username displayName avatar')
      .populate('category', 'name nameBn nameEn slug color')
      .sort({ views: -1, likes: -1 })
      .limit(10)
      .lean();
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/posts/featured
router.get('/featured', async (req, res) => {
  try {
    const posts = await Post.find({ status: 'published', isDeleted: false, isFeatured: true })
      .populate('author', 'username displayName avatar')
      .populate('category', 'name nameBn nameEn slug color')
      .sort({ publishedAt: -1 })
      .limit(5)
      .lean();
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/posts/short-clips
router.get('/short-clips', async (req, res) => {
  try {
    const posts = await Post.find({
      status: 'published',
      isDeleted: false,
      'videos.isShortClip': true,
    })
      .populate('author', 'username displayName avatar')
      .populate('category', 'name nameBn nameEn slug')
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    res.json({ success: true, posts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/posts/my-posts (auth required)
router.get('/my-posts', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const filter = { author: req.user._id, isDeleted: false };
    if (status) filter.status = status;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [posts, total] = await Promise.all([
      Post.find(filter).populate('category', 'name nameBn nameEn slug color').sort({ updatedAt: -1 }).skip(skip).limit(parseInt(limit)).lean(),
      Post.countDocuments(filter),
    ]);

    res.json({ success: true, posts, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/posts/:slug
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const post = await Post.findOne({ slug: req.params.slug, isDeleted: false })
      .populate('author', 'username displayName avatar bio followers')
      .populate('category', 'name nameBn nameEn slug color icon');

    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.status !== 'published' && (!req.user || req.user._id.toString() !== post.author._id.toString())) {
      return res.status(403).json({ success: false, message: 'Post not available' });
    }

    // Track view (simple IP tracking)
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
    const viewedBefore = post.viewHistory.some((v) => v.ip === clientIP);
    post.views += 1;
    if (!viewedBefore) {
      post.uniqueViews += 1;
      post.viewHistory.push({ ip: clientIP, viewedAt: new Date() });
    }
    await post.save();

    // Log analytics
    const today = new Date(); today.setHours(0, 0, 0, 0);
    await Analytics.findOneAndUpdate(
      { post: post._id, date: today },
      { $inc: { views: 1, ...(viewedBefore ? {} : { uniqueViews: 1 }) } },
      { upsert: true, new: true }
    );

    // Related posts
    const related = await Post.find({
      category: post.category._id,
      status: 'published',
      isDeleted: false,
      _id: { $ne: post._id },
    })
      .populate('author', 'username displayName avatar')
      .sort({ views: -1 })
      .limit(4)
      .lean();

    res.json({ success: true, post, related });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/posts - Create post
router.post('/', protect, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'videos', maxCount: 5 }, { name: 'featuredImage', maxCount: 1 }]), async (req, res) => {
  try {
    const { title, titleBn, titleEn, content, contentBn, contentEn, excerptBn, excerptEn, category, tags, status, scheduledAt, seoTitle, seoDescription, location, subcategory } = req.body;

    const slug = await createSlug(title);
    const featuredImage = req.files?.featuredImage ? `/uploads/images/${req.files.featuredImage[0].filename}` : '';
    const images = req.files?.images ? req.files.images.map((f) => `/uploads/images/${f.filename}`) : [];
    const videos = req.files?.videos ? req.files.videos.map((f) => ({ url: `/uploads/videos/${f.filename}`, isShortClip: false })) : [];

    const post = await Post.create({
      title, titleBn, titleEn, content, contentBn, contentEn, excerptBn, excerptEn, slug, author: req.user._id, category, subcategory,
      tags: tags ? JSON.parse(tags) : [],
      status: status || 'draft',
      scheduledAt: scheduledAt || null,
      publishedAt: status === 'published' ? new Date() : null,
      featuredImage, images, videos, seoTitle, seoDescription, location,
    });

    await Category.findByIdAndUpdate(category, { $inc: { postCount: 1 } });

    // Notify followers if published
    if (status === 'published') {
      const io = req.app.get('io');
      const author = await require('../models/User').findById(req.user._id);
      for (const followerId of author.followers) {
        await sendNotification(io, {
          recipient: followerId, sender: req.user._id, type: 'new_post', post: post._id,
          message: `${req.user.displayName} published a new post: "${title}"`,
          link: `/blog/${slug}`,
        });
      }
    }

    await post.populate(['author', 'category']);
    res.status(201).json({ success: true, message: 'Post created successfully', post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/posts/:id - Update post
router.put('/:id', protect, upload.fields([{ name: 'images', maxCount: 10 }, { name: 'videos', maxCount: 5 }, { name: 'featuredImage', maxCount: 1 }]), async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const { title, titleBn, titleEn, content, contentBn, contentEn, excerptBn, excerptEn, category, tags, status, scheduledAt, seoTitle, seoDescription, location, subcategory } = req.body;

    if (title && title !== post.title) post.slug = await createSlug(title);
    if (title) post.title = title;
    if (titleBn !== undefined) post.titleBn = titleBn;
    if (titleEn !== undefined) post.titleEn = titleEn;
    if (content) post.content = content;
    if (contentBn !== undefined) post.contentBn = contentBn;
    if (contentEn !== undefined) post.contentEn = contentEn;
    if (excerptBn !== undefined) post.excerptBn = excerptBn;
    if (excerptEn !== undefined) post.excerptEn = excerptEn;
    if (category) post.category = category;
    if (subcategory) post.subcategory = subcategory;
    if (tags) post.tags = JSON.parse(tags);
    if (status) {
      if (status === 'published' && post.status !== 'published') post.publishedAt = new Date();
      post.status = status;
    }
    if (scheduledAt) post.scheduledAt = scheduledAt;
    if (seoTitle) post.seoTitle = seoTitle;
    if (seoDescription) post.seoDescription = seoDescription;
    if (location) post.location = location;
    if (req.files?.featuredImage) post.featuredImage = `/uploads/images/${req.files.featuredImage[0].filename}`;
    if (req.files?.images) post.images = [...post.images, ...req.files.images.map((f) => `/uploads/images/${f.filename}`)];
    if (req.files?.videos) post.videos = [...post.videos, ...req.files.videos.map((f) => ({ url: `/uploads/videos/${f.filename}`, isShortClip: false }))];

    await post.save();
    await post.populate(['author', 'category']);
    res.json({ success: true, message: 'Post updated successfully', post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/posts/:id - Soft delete
router.delete('/:id', protect, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) return res.status(404).json({ success: false, message: 'Post not found' });
    if (post.author.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    post.isDeleted = true;
    post.status = 'deleted';
    await post.save();
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

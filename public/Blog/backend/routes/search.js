const express = require('express');
const Post = require('../models/Post');
const User = require('../models/User');

const router = express.Router();

// GET /api/search?q=keyword&type=posts|users&category=&tag=&page=1
router.get('/', async (req, res) => {
  try {
    const { q, type = 'posts', category, tag, sort = 'relevance', page = 1, limit = 12 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    if (!q || q.trim().length < 2) {
      return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters' });
    }

    const searchTerm = q.trim();

    if (type === 'users') {
      const userFilter = {
        isActive: true,
        $or: [
          { username: { $regex: searchTerm, $options: 'i' } },
          { displayName: { $regex: searchTerm, $options: 'i' } },
          { bio: { $regex: searchTerm, $options: 'i' } },
        ],
      };
      const [users, total] = await Promise.all([
        User.find(userFilter).select('username displayName avatar bio followers').skip(skip).limit(parseInt(limit)).lean(),
        User.countDocuments(userFilter),
      ]);
      return res.json({ success: true, users, total, pages: Math.ceil(total / parseInt(limit)) });
    }

    // Posts search
    const postFilter = {
      status: 'published',
      isDeleted: false,
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { content: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } },
        { excerpt: { $regex: searchTerm, $options: 'i' } },
      ],
    };
    if (category) postFilter.category = category;
    if (tag) postFilter.tags = { $in: [tag.toLowerCase()] };

    let sortObj = { views: -1, createdAt: -1 };
    if (sort === 'latest') sortObj = { createdAt: -1 };
    if (sort === 'popular') sortObj = { views: -1 };

    const [posts, total] = await Promise.all([
      Post.find(postFilter)
        .populate('author', 'username displayName avatar')
        .populate('category', 'name nameBn nameEn slug color')
        .sort(sortObj)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(),
      Post.countDocuments(postFilter),
    ]);

    // Get auto-suggestions for similar queries
    const suggestions = await Post.distinct('tags', {
      status: 'published',
      tags: { $regex: searchTerm, $options: 'i' },
    }).then((tags) => tags.slice(0, 10));

    res.json({ success: true, posts, total, pages: Math.ceil(total / parseInt(limit)), suggestions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/search/suggestions?q=
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 1) return res.json({ success: true, suggestions: [] });

    const [tagSuggestions, titleSuggestions] = await Promise.all([
      Post.distinct('tags', { tags: { $regex: q, $options: 'i' }, status: 'published' }).then((t) => t.slice(0, 5)),
      Post.find({ title: { $regex: q, $options: 'i' }, status: 'published', isDeleted: false })
        .select('title slug')
        .limit(5)
        .lean(),
    ]);

    res.json({ success: true, suggestions: { tags: tagSuggestions, posts: titleSuggestions } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

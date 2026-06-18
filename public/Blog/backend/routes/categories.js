const express = require('express');
const Category = require('../models/Category');
const slugify = require('slugify');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

// Seed default categories
const defaultCategories = [
  { name: 'Entertainment', slug: 'entertainment', group: 'entertainment', icon: '🎨', color: '#e91e63', order: 1, subcategories: [{ name: 'Literature', slug: 'literature' }, { name: 'Movies', slug: 'movies' }, { name: 'Art/Design', slug: 'art-design' }, { name: 'Music', slug: 'music' }, { name: 'TV Shows', slug: 'tv-shows' }, { name: 'Celebrities', slug: 'celebrities' }, { name: 'Animation', slug: 'animation' }] },
  { name: 'Lifestyle', slug: 'lifestyle', group: 'lifestyle', icon: '🛍️', color: '#9c27b0', order: 2, subcategories: [{ name: 'Daily Lifestyle', slug: 'daily-lifestyle' }, { name: 'Fashion & Beauty', slug: 'fashion-beauty' }, { name: 'Interior/DIY', slug: 'interior-diy' }, { name: 'Cooking/Recipes', slug: 'cooking-recipes' }, { name: 'Restaurants', slug: 'restaurants' }, { name: 'Pets', slug: 'pets' }, { name: 'Product Reviews', slug: 'product-reviews' }, { name: 'Gardening', slug: 'gardening' }] },
  { name: 'Hobbies & Travel', slug: 'hobbies-travel', group: 'hobbies', icon: '🧭', color: '#2196f3', order: 3, subcategories: [{ name: 'Games', slug: 'games' }, { name: 'Sports', slug: 'sports' }, { name: 'Photography', slug: 'photography' }, { name: 'Cars', slug: 'cars' }, { name: 'Domestic Travel', slug: 'domestic-travel' }, { name: 'Overseas Travel', slug: 'overseas-travel' }] },
  { name: 'Knowledge', slug: 'knowledge', group: 'knowledge', icon: '🧠', color: '#009688', order: 4, subcategories: [{ name: 'IT & Computers', slug: 'it-computers' }, { name: 'Society & Politics', slug: 'society-politics' }, { name: 'Healthcare', slug: 'healthcare' }, { name: 'Business & Economics', slug: 'business-economics' }, { name: 'Languages', slug: 'languages' }, { name: 'Education', slug: 'education' }] },
];

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    let categories = await Category.find({ isActive: true, parent: null }).sort({ order: 1 }).lean();
    if (categories.length === 0) {
      await Category.insertMany(defaultCategories);
      categories = await Category.find({ isActive: true, parent: null }).sort({ order: 1 }).lean();
    }
    res.json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/categories/:slug
router.get('/:slug', async (req, res) => {
  try {
    const category = await Category.findOne({ slug: req.params.slug, isActive: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/categories (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, nameBn, nameEn, description, icon, color, image, parent, group, order, subcategories } = req.body;
    const slug = slugify(name, { lower: true, strict: true });
    const category = await Category.create({ name, nameBn, nameEn, slug, description, icon, color, image, parent, group, order, subcategories });
    res.status(201).json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/categories/:id (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!category) return res.status(404).json({ success: false, message: 'Category not found' });
    res.json({ success: true, category });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/categories/:id (admin)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Category.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ success: true, message: 'Category deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

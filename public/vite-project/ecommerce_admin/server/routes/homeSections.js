const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const HomeSection = require('../models/HomeSection');
const authMiddleware = require('../middleware/auth');

// Build a URL-friendly slug from arbitrary text
const slugify = (text) => {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
};

// Ensure a product item has a non-empty slug; tries slug -> slugify(name) -> id
const ensureItemSlug = (item) => {
  if (!item) return item;
  if (!item.slug) {
    item.slug = slugify(item.name) || (item._id ? String(item._id) : '');
  }
  return item;
};

// ─── PUBLIC ROUTES (storefront) ───────────────────────────────────────────────

// GET /api/home-sections/item/:slugOrId — find any product item across all
// active sections by slug or sub-document id. Used by the storefront product
// detail page when the slug doesn't match a real Product.
router.get('/item/:slugOrId', async (req, res) => {
  try {
    const { slugOrId } = req.params;
    const sections = await HomeSection.find({ isActive: true });
    for (const section of sections) {
      for (const item of section.products) {
        const matchesId =
          mongoose.isValidObjectId(slugOrId) && String(item._id) === slugOrId;
        const matchesSlug = item.slug && item.slug === slugOrId;
        if (matchesId || matchesSlug) {
          return res.json({
            item,
            section: { _id: section._id, key: section.key, title: section.title },
          });
        }
      }
    }
    res.status(404).json({ message: 'Item not found' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/home-sections — list all active sections sorted by order
// (admin can pass ?all=true to receive inactive sections as well)
router.get('/', async (req, res) => {
  try {
    const { all } = req.query;
    const query = all === 'true' ? {} : { isActive: true };
    const sections = await HomeSection.find(query).sort({ order: 1, createdAt: 1 });

    // For storefront responses, also strip inactive products
    const cleaned = sections.map((s) => {
      const obj = s.toObject();
      if (all !== 'true') {
        obj.products = (obj.products || [])
          .filter((p) => p.isActive !== false)
          .sort((a, b) => (a.order || 0) - (b.order || 0));
      }
      return obj;
    });

    res.json({ sections: cleaned, data: cleaned });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/home-sections/key/:key — fetch a single section by stable key
router.get('/key/:key', async (req, res) => {
  try {
    const section = await HomeSection.findOne({ key: req.params.key });
    if (!section) return res.status(404).json({ message: 'Section not found' });
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /api/home-sections/:id — fetch by Mongo id (admin convenience)
router.get('/:id', async (req, res) => {
  try {
    const section = await HomeSection.findById(req.params.id);
    if (!section) return res.status(404).json({ message: 'Section not found' });
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

// Create a new section
router.post('/', authMiddleware, async (req, res) => {
  try {
    const section = new HomeSection(req.body);
    const saved = await section.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update section meta and/or products array
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await HomeSection.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Section not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a section
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await HomeSection.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Section not found' });
    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add a product to a section
router.post('/:id/products', authMiddleware, async (req, res) => {
  try {
    const section = await HomeSection.findById(req.params.id);
    if (!section) return res.status(404).json({ message: 'Section not found' });
    const item = ensureItemSlug({ ...req.body });
    section.products.push(item);
    await section.save();
    res.status(201).json(section);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update a product inside a section (by sub-document id)
router.put('/:id/products/:productId', authMiddleware, async (req, res) => {
  try {
    const section = await HomeSection.findById(req.params.id);
    if (!section) return res.status(404).json({ message: 'Section not found' });
    const item = section.products.id(req.params.productId);
    if (!item) return res.status(404).json({ message: 'Product item not found' });
    Object.assign(item, req.body);
    ensureItemSlug(item);
    await section.save();
    res.json(section);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Remove a product from a section
router.delete('/:id/products/:productId', authMiddleware, async (req, res) => {
  try {
    const section = await HomeSection.findById(req.params.id);
    if (!section) return res.status(404).json({ message: 'Section not found' });
    const item = section.products.id(req.params.productId);
    if (!item) return res.status(404).json({ message: 'Product item not found' });
    item.deleteOne();
    await section.save();
    res.json(section);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Seed/ensure all default sections exist (admin only). Safe to call repeatedly.
router.post('/seed-defaults', authMiddleware, async (req, res) => {
  try {
    const defaults = [
      { key: 'festival-banner', title: 'Festival Special Offers!', titleBn: 'উৎসব বিশেষ অফার!', subtitle: 'Save up to 50% on fresh groceries & more', icon: '🎉', layout: 'grid', order: -2, accentColor: '#ffffff', backgroundColor: 'linear-gradient(to right, #E31E24, #b9151a)' },
      { key: 'quick-category-buttons', title: 'Quick Categories', icon: '', layout: 'grid', order: -1, accentColor: '#000000', backgroundColor: '#ffffff' },
      { key: 'recommended-for-you', title: 'Recommended For You', icon: '', layout: 'carousel', order: 1 },
      { key: 'trending-products', title: 'Trending Products', icon: '🔥', layout: 'carousel', order: 2 },
      { key: 'bread-and-more', title: 'Bread & More', icon: '', layout: 'carousel', order: 3 },
      { key: 'unilever-week', title: 'Unilever Week', icon: '', layout: 'carousel', order: 4 },
      { key: 'unilever-mega-sale', title: 'UNILEVER MEGA SALE', icon: '🔥', layout: 'carousel', order: 5 },
      { key: 'weekday-deals', title: 'Weekday Deals!!!', icon: '', layout: 'carousel', order: 6 },
      { key: 'cleaning-essentials', title: 'Everyday Cleaning Essentials', icon: '', layout: 'carousel', order: 7 },
      { key: 'snacks-sweets', title: 'Snacks & Sweets', icon: '🍪', layout: 'carousel', order: 8 },
      { key: 'todays-featured-finds', title: "Today's Featured Finds", icon: '', layout: 'grid', order: 9 },
      { key: 'spice-up-cooking', title: 'Spice Up Your Cooking Game', icon: '🌶️', layout: 'grid', order: 10 },
      { key: 'happy-hour', title: 'Happy Hour', icon: '', layout: 'carousel', order: 11 },
      { key: 'fresh-vegetables-fruits', title: 'Fresh Vegetables & Fruits', icon: '🥬', layout: 'carousel', order: 12 },
      { key: 'beverages', title: 'Beverages', icon: '🥤', layout: 'carousel', order: 13 },
      { key: 'frozen-foods', title: 'Frozen Foods', icon: '🧊', layout: 'carousel', order: 14 },
      { key: 'gadgets-electronics', title: 'Gadgets & Electronics', icon: '📱', layout: 'carousel', order: 15 },
    ];

    // Keys whose order should always be force-pinned to the seed value
    // (so the festival banner + quick category buttons stay at the very top).
    const pinnedKeys = new Set(['festival-banner', 'quick-category-buttons']);
    const results = [];
    for (const def of defaults) {
      const existing = await HomeSection.findOne({ key: def.key });
      if (!existing) {
        const created = await HomeSection.create(def);
        results.push({ key: def.key, status: 'created', id: created._id });
      } else if (pinnedKeys.has(def.key)) {
        existing.order = def.order;
        if (def.title && !existing.title) existing.title = def.title;
        if (def.subtitle && !existing.subtitle) existing.subtitle = def.subtitle;
        await existing.save();
        results.push({ key: def.key, status: 'pinned', id: existing._id });
      } else {
        results.push({ key: def.key, status: 'exists', id: existing._id });
      }
    }
    res.json({ message: 'Default sections ensured', results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Bulk reorder — accepts [{ _id, order }, ...] and updates each section's order.
router.post('/reorder', authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) {
      return res.status(400).json({ message: 'items must be an array' });
    }
    await Promise.all(
      items.map((it) =>
        HomeSection.updateOne({ _id: it._id }, { $set: { order: it.order } })
      )
    );
    res.json({ message: 'Order updated', count: items.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

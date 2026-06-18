const express = require('express');
const router = express.Router();
const Banner = require('../models/Banner');
const authMiddleware = require('../middleware/auth');

// ─── PUBLIC ROUTES (storefront) ───────────────────────────────────────────────

// GET /api/banners?active=true&position=hero
// Returns banners as an array AND wrapped { banners, data } for compatibility.
router.get('/', async (req, res) => {
  try {
    const { active, position } = req.query;
    const query = {};

    // Default to active-only for storefront calls; if `active=false` is passed
    // (admin), return all banners.
    if (active === 'false') {
      // no filter
    } else {
      query.isActive = true;
    }
    if (position) query.position = position;

    const now = new Date();
    const banners = await Banner.find(query).sort({ order: 1, createdAt: -1 });

    // Filter by date range if set
    const visible = banners.filter(b => {
      if (b.startDate && new Date(b.startDate) > now) return false;
      if (b.endDate && new Date(b.endDate) < now) return false;
      return true;
    });

    // Return both shapes so any caller works
    res.json({ banners: visible, data: visible });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single banner by id (public)
router.get('/:id', async (req, res) => {
  try {
    const banner = await Banner.findById(req.params.id);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    res.json(banner);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── ADMIN ROUTES ─────────────────────────────────────────────────────────────

router.post('/', authMiddleware, async (req, res) => {
  try {
    const banner = new Banner(req.body);
    const saved = await banner.save();
    res.status(201).json(saved);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const updated = await Banner.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!updated) return res.status(404).json({ message: 'Banner not found' });
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const deleted = await Banner.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Banner not found' });
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

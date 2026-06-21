const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// GET /search?q=&limit= — full product search results
router.get('/', async (req, res) => {
  try {
    const { q = '', limit = 10 } = req.query;
    if (!q.trim()) return res.json({ products: [] });

    const regex = new RegExp(q.trim(), 'i');
    const products = await Product.find({
      status: { $in: ['active', 'published'] },
      $or: [{ name: regex }, { 'name.en': regex }, { 'name.bn': regex }, { description: regex }],
    })
      .limit(Number(limit))
      .select('name slug price regularPrice salePrice thumbnail images stock');

    res.json({ products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /search/suggestions?q= — lightweight name-only suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { q = '' } = req.query;
    if (!q.trim()) return res.json({ suggestions: [] });

    const regex = new RegExp(q.trim(), 'i');
    const products = await Product.find({
      status: { $in: ['active', 'published'] },
      $or: [{ name: regex }, { 'name.en': regex }, { 'name.bn': regex }],
    })
      .limit(8)
      .select('name slug thumbnail');

    res.json({ suggestions: products });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

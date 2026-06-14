const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// Search products
router.get('/', async (req, res) => {
  try {
    const { q, limit = 10 } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    const products = await Product.find({
      $text: { $search: q },
      status: 'active',
    })
      .select('name slug thumbnail regularPrice salePrice')
      .limit(Number(limit))
      .sort({ score: { $meta: 'textScore' } });

    res.json(products);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
});

// Autocomplete suggestions
router.get('/suggestions', async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.json([]);
    }

    const products = await Product.find({
      name: new RegExp(q, 'i'),
      status: 'active',
    })
      .select('name slug')
      .limit(10);

    const suggestions = products.map(p => ({
      name: p.name,
      slug: p.slug,
    }));

    res.json(suggestions);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching suggestions', error: error.message });
  }
});

module.exports = router;

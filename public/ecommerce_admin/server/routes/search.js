const express = require('express');
const router = express.Router();
const Product = require('../models/Product');

// This collection mixes docs from two schemas (a legacy/shared one with flat
// "name"/"price"/"isActive", and the newer {name:{en,bn}, regularPrice,
// status} one) — .lean() + manual field fallback avoids Mongoose silently
// casting/blanking the legacy shape.
function formatProduct(product) {
  const name = typeof product.name === 'string' ? product.name : (product.name?.en || product.name?.bn || '');
  const basePrice = (typeof product.price === 'number' && product.price > 0)
    ? product.price
    : (product.regularPrice ?? 0);
  const price = product.salePrice && product.salePrice > 0 ? product.salePrice : basePrice;
  return {
    _id: product._id,
    name,
    slug: product.slug,
    price,
    thumbnail: product.thumbnail || (product.images && product.images[0]) || '',
    stock: product.stock,
  };
}

const VISIBLE = { $or: [{ status: { $in: ['active', 'published'] } }, { isActive: true }] };

// GET /search?q=&limit= — full product search results
router.get('/', async (req, res) => {
  try {
    const { q = '', limit = 10 } = req.query;
    if (!q.trim()) return res.json({ products: [] });

    const regex = new RegExp(q.trim(), 'i');
    const products = await Product.find({
      $and: [
        VISIBLE,
        { $or: [{ name: regex }, { 'name.en': regex }, { 'name.bn': regex }, { description: regex }] },
      ],
    })
      .limit(Number(limit))
      .select('name slug price regularPrice salePrice thumbnail images stock isActive status')
      .lean();

    res.json({ products: products.map(formatProduct) });
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
      $and: [
        VISIBLE,
        { $or: [{ name: regex }, { 'name.en': regex }, { 'name.bn': regex }] },
      ],
    })
      .limit(8)
      .select('name slug thumbnail price regularPrice salePrice isActive status')
      .lean();

    res.json({ suggestions: products.map(formatProduct) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

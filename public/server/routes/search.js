const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const Category = require('../models/Category');

/** Escape all regex special characters to prevent injection */
function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Build a $or query for ONE search term across all bilingual fields.
 */
function buildProductQuery(q) {
  const r = new RegExp(escapeRegex(q), 'i');
  return {
    status: 'active',
    $or: [
      { name: r }, { nameBn: r },
      { description: r }, { descriptionBn: r },
      { shortDescription: r }, { shortDescriptionBn: r },
      { brand: r }, { tags: r },
    ],
  };
}

function buildCategoryQuery(q) {
  const r = new RegExp(escapeRegex(q), 'i');
  return {
    isActive: true,
    $or: [{ name: r }, { nameBn: r }, { description: r }, { descriptionBn: r }],
  };
}

/**
 * Merge two $or queries with an outer $or so either term matches.
 * Used when both a Bangla term (q) and the original English (qEn) are provided.
 */
function mergeQueries(qA, qB) {
  return { $or: [qA, qB] };
}

/**
 * GET /api/search?q=...&limit=20&page=1
 * Full bilingual product + category search.
 * Returns both EN and BN fields — the frontend chooses which to display
 * based on the currently selected website language (NOT the query language).
 */
router.get('/', async (req, res) => {
  try {
    const { q, qEn, limit = 20, page = 1 } = req.query;

    if (!q || q.trim().length < 1) {
      return res.json({ products: [], categories: [], total: 0, page: 1, limit: 20 });
    }

    const trimmed   = q.trim();
    const trimmedEn = qEn?.trim() || '';

    if (trimmed.length > 100 || trimmedEn.length > 100) {
      return res.status(400).json({ message: 'Query too long' });
    }

    const pageNum  = Math.max(1, Number(page));
    const limitNum = Math.min(50, Math.max(1, Number(limit)));
    const skip     = (pageNum - 1) * limitNum;

    // If an English fallback term is also supplied, search with both
    const pQuery = trimmedEn
      ? mergeQueries(buildProductQuery(trimmed), buildProductQuery(trimmedEn))
      : buildProductQuery(trimmed);
    const cQuery = trimmedEn
      ? mergeQueries(buildCategoryQuery(trimmed), buildCategoryQuery(trimmedEn))
      : buildCategoryQuery(trimmed);

    const [products, categories, total] = await Promise.all([
      Product.find(pQuery)
        .select('name nameBn slug thumbnail regularPrice salePrice brand rating reviewCount isFeatured')
        .populate('categoryId', 'name nameBn slug')
        .lean()
        .skip(skip)
        .limit(limitNum)
        .sort({ isFeatured: -1, soldCount: -1, rating: -1 }),

      Category.find(cQuery)
        .select('name nameBn slug icon image')
        .lean()
        .limit(6),

      Product.countDocuments(pQuery),
    ]);

    res.json({ products, categories, total, page: pageNum, limit: limitNum });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Search failed', error: error.message });
  }
});

/**
 * GET /api/search/suggestions?q=...
 * Autocomplete — returns top matches across products and categories.
 * Both `name` (EN) and `nameBn` (BN) are included so the frontend can
 * render in whichever language the site is currently set to.
 */
router.get('/suggestions', async (req, res) => {
  try {
    const { q, qEn } = req.query;

    if (!q || q.trim().length < 1) return res.json([]);

    const trimmed   = q.trim();
    const trimmedEn = qEn?.trim() || '';
    if (trimmed.length > 100) return res.json([]);

    const rBn = new RegExp(escapeRegex(trimmed), 'i');
    const rEn = trimmedEn ? new RegExp(escapeRegex(trimmedEn), 'i') : null;

    // Match either the Bangla term OR the English term
    const productOr = rEn
      ? { $or: [{ name: rBn }, { nameBn: rBn }, { brand: rBn },
                 { name: rEn }, { nameBn: rEn }, { brand: rEn }] }
      : { $or: [{ name: rBn }, { nameBn: rBn }, { brand: rBn }] };
    const categoryOr = rEn
      ? { $or: [{ name: rBn }, { nameBn: rBn }, { name: rEn }, { nameBn: rEn }] }
      : { $or: [{ name: rBn }, { nameBn: rBn }] };

    const [products, categories] = await Promise.all([
      Product.find({ ...productOr, status: 'active' })
        .select('name nameBn slug thumbnail regularPrice salePrice brand')
        .lean()
        .limit(6)
        .sort({ soldCount: -1, isFeatured: -1 }),

      Category.find({ ...categoryOr, isActive: true })
        .select('name nameBn slug icon')
        .lean()
        .limit(3),
    ]);

    const suggestions = [
      ...products.map(p => ({
        type: 'product',
        name:   p.name   || '',
        nameBn: p.nameBn || p.name || '',   // fallback to EN if no BN
        slug:   p.slug,
        thumbnail:    p.thumbnail || '',
        regularPrice: p.regularPrice,
        salePrice:    p.salePrice ?? null,
      })),
      ...categories.map(c => ({
        type: 'category',
        name:   c.name   || '',
        nameBn: c.nameBn || c.name || '',
        slug:   c.slug,
        icon:   c.icon || '',
      })),
    ];

    res.json(suggestions);
  } catch (error) {
    console.error('Suggestions error:', error);
    res.status(500).json({ message: 'Suggestion error', error: error.message });
  }
});

module.exports = router;


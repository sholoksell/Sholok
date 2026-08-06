const express = require('express');
const router = express.Router();
const pool = require('../db');

// Full text search across products, categories, brands, stores, tags
// GET /api/search?q=...&category=...&brand=...&vendor=...&minPrice=...&maxPrice=...&rating=...&inStock=...&onSale=...&sort=...&page=...&limit=...
router.get('/', async (req, res) => {
  try {
    const {
      q = '', category, brand, vendor, minPrice, maxPrice,
      rating, inStock, onSale, sort = 'relevance', page = 1, limit = 24,
      colors, sizes, deliveryType, tags
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];

    // Track search query
    if (q.trim()) {
      const normalized = q.trim().toLowerCase();
      pool.query(
        `INSERT INTO search_queries (query, query_normalized, results_count) VALUES (?, ?, 0) ON DUPLICATE KEY UPDATE query=query`,
        [q.trim(), normalized]
      ).catch(() => {});

      pool.query(
        `INSERT INTO popular_searches (query, search_count, last_searched) VALUES (?, 1, NOW())
         ON DUPLICATE KEY UPDATE search_count = search_count + 1, last_searched = NOW()`,
        [normalized]
      ).catch(() => {});
    }

    let where = [`p.status = 'active' AND p.visibility = 1`];

    // Search term - searches name, sku, meta_keywords, tags, brand name, store name
    if (q.trim()) {
      const term = `%${q.trim()}%`;
      where.push(`(
        p.name LIKE ? OR
        p.sku LIKE ? OR
        p.meta_keywords LIKE ? OR
        EXISTS (SELECT 1 FROM product_tags pt WHERE pt.product_id = p.id AND pt.tag LIKE ?) OR
        b.name LIKE ? OR
        v.store_name LIKE ?
      )`);
      params.push(term, term, term, term, term, term);
    }

    if (category) {
      // Include subcategories
      where.push(`p.category_id IN (
        SELECT id FROM categories WHERE id = ? OR parent_id = ?
        OR parent_id IN (SELECT id FROM categories WHERE parent_id = ?)
      )`);
      params.push(category, category, category);
    }

    if (brand) {
      where.push(`p.brand_id = ?`);
      params.push(brand);
    }

    if (vendor) {
      where.push(`p.vendor_id = ?`);
      params.push(vendor);
    }

    if (minPrice) {
      where.push(`COALESCE(p.sale_price, p.regular_price) >= ?`);
      params.push(minPrice);
    }

    if (maxPrice) {
      where.push(`COALESCE(p.sale_price, p.regular_price) <= ?`);
      params.push(maxPrice);
    }

    if (inStock === '1' || inStock === 'true') {
      where.push(`p.stock > 0`);
    }

    if (onSale === '1' || onSale === 'true') {
      where.push(`p.on_sale = 1`);
    }

    if (tags) {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      if (tagList.length > 0) {
        where.push(`EXISTS (SELECT 1 FROM product_tags pt WHERE pt.product_id = p.id AND pt.tag IN (${tagList.map(() => '?').join(',')}))`);
        params.push(...tagList);
      }
    }

    if (colors) {
      const colorList = colors.split(',').map(c => c.trim()).filter(Boolean);
      if (colorList.length > 0) {
        where.push(`JSON_UNQUOTE(JSON_EXTRACT(p.attributes, '$.color')) IN (${colorList.map(() => '?').join(',')})`);
        params.push(...colorList);
      }
    }

    if (sizes) {
      const sizeList = sizes.split(',').map(s => s.trim()).filter(Boolean);
      if (sizeList.length > 0) {
        where.push(`JSON_UNQUOTE(JSON_EXTRACT(p.attributes, '$.size')) IN (${sizeList.map(() => '?').join(',')})`);
        params.push(...sizeList);
      }
    }

    const whereSQL = `WHERE ${where.join(' AND ')}`;

    // Sort
    let orderSQL = 'ORDER BY p.featured DESC, p.id DESC';
    if (sort === 'price_asc') orderSQL = 'ORDER BY COALESCE(p.sale_price, p.regular_price) ASC';
    else if (sort === 'price_desc') orderSQL = 'ORDER BY COALESCE(p.sale_price, p.regular_price) DESC';
    else if (sort === 'newest') orderSQL = 'ORDER BY p.created_at DESC';
    else if (sort === 'name_asc') orderSQL = 'ORDER BY p.name ASC';
    else if (sort === 'discount') orderSQL = 'ORDER BY (p.compare_price - COALESCE(p.sale_price, p.regular_price)) DESC';

    // baseFromSQL has all JOINs but NO WHERE — WHERE is appended separately
    const baseFromSQL = `
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN vendors v ON p.vendor_id = v.id
      LEFT JOIN product_tags pt ON p.id = pt.product_id
    `;

    const [countRows] = await pool.query(
      `SELECT COUNT(DISTINCT p.id) as total ${baseFromSQL} ${whereSQL}`,
      params
    );
    const total = countRows[0].total;

    const [products] = await pool.query(`
      SELECT
        p.id, p.name, p.slug, p.sku, p.thumbnail,
        p.regular_price, p.sale_price, p.compare_price, p.stock,
        p.on_sale, p.featured, p.is_new, p.shipping_charge, p.product_type,
        p.attributes,
        c.id as category_id, c.name as category_name, c.slug as category_slug,
        b.id as brand_id, b.name as brand_name, b.slug as brand_slug,
        v.id as vendor_id, v.store_name, v.slug as vendor_slug, v.rating as vendor_rating,
        GROUP_CONCAT(DISTINCT pt.tag) as tags
      ${baseFromSQL}
      ${whereSQL}
      GROUP BY p.id
      ${orderSQL}
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    // Facet queries use a simpler FROM without product_tags
    const facetFromSQL = `
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b ON p.brand_id = b.id
      LEFT JOIN vendors v ON p.vendor_id = v.id
    `;

    // Get facets for filters
    const [categoryFacets] = await pool.query(`
      SELECT c.id, c.name, c.name_bn AS nameBn, c.slug, COUNT(*) as count
      ${facetFromSQL}
      ${whereSQL}
      AND c.id IS NOT NULL
      GROUP BY c.id, c.name, c.name_bn, c.slug
      ORDER BY count DESC LIMIT 20
    `, params);

    const [brandFacets] = await pool.query(`
      SELECT b.id, b.name, b.slug, b.logo, COUNT(*) as count
      ${facetFromSQL}
      ${whereSQL}
      AND b.id IS NOT NULL
      GROUP BY b.id, b.name, b.slug, b.logo
      ORDER BY count DESC LIMIT 20
    `, params);

    const [vendorFacets] = await pool.query(`
      SELECT v.id, v.store_name, v.slug, v.store_logo, COUNT(*) as count
      ${facetFromSQL}
      ${whereSQL}
      AND v.id IS NOT NULL
      GROUP BY v.id, v.store_name, v.slug, v.store_logo
      ORDER BY count DESC LIMIT 10
    `, params);

    const [priceRange] = await pool.query(`
      SELECT MIN(COALESCE(p.sale_price, p.regular_price)) as min_price,
             MAX(COALESCE(p.sale_price, p.regular_price)) as max_price
      ${facetFromSQL}
      ${whereSQL}
    `, params);

    const [colorFacets] = await pool.query(`
      SELECT JSON_UNQUOTE(JSON_EXTRACT(p.attributes, '$.color')) as value, COUNT(*) as count
      ${facetFromSQL}
      ${whereSQL}
      AND p.attributes IS NOT NULL
      AND JSON_EXTRACT(p.attributes, '$.color') IS NOT NULL
      GROUP BY value ORDER BY count DESC LIMIT 20
    `, params);

    const [sizeFacets] = await pool.query(`
      SELECT JSON_UNQUOTE(JSON_EXTRACT(p.attributes, '$.size')) as value, COUNT(*) as count
      ${facetFromSQL}
      ${whereSQL}
      AND p.attributes IS NOT NULL
      AND JSON_EXTRACT(p.attributes, '$.size') IS NOT NULL
      GROUP BY value ORDER BY count DESC LIMIT 20
    `, params);

    res.json({
      products: products.map(p => ({
        ...p,
        tags: p.tags ? p.tags.split(',') : [],
        attributes: p.attributes ? (typeof p.attributes === 'string' ? JSON.parse(p.attributes) : p.attributes) : null,
        regular_price: Number(p.regular_price),
        sale_price: p.sale_price ? Number(p.sale_price) : null,
        compare_price: p.compare_price ? Number(p.compare_price) : null,
        vendor_rating: p.vendor_rating ? Number(p.vendor_rating) : null,
      })),
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
      facets: {
        categories: categoryFacets,
        brands: brandFacets,
        vendors: vendorFacets,
        priceRange: {
          min: Number(priceRange[0]?.min_price || 0),
          max: Number(priceRange[0]?.max_price || 0)
        },
        colors: colorFacets.filter(r => r.value),
        sizes: sizeFacets.filter(r => r.value),
      }
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/search/suggestions?q=...
router.get('/suggestions', async (req, res) => {
  try {
    const { q = '', limit = 8 } = req.query;
    if (!q.trim()) return res.json({ suggestions: [], products: [] });

    const term = `%${q.trim()}%`;

    // Product name suggestions
    const [products] = await pool.query(
      `SELECT id, name, slug, thumbnail, regular_price, sale_price, sku
       FROM products WHERE status = 'active' AND visibility = 1 AND (name LIKE ? OR sku LIKE ?)
       ORDER BY featured DESC, stock DESC LIMIT ?`,
      [term, term, parseInt(limit)]
    );

    // Category suggestions — search both English and Bangla names
    const [categories] = await pool.query(
      `SELECT id, name, name_bn AS nameBn, slug FROM categories WHERE is_active = 1 AND (name LIKE ? OR name_bn LIKE ?) LIMIT 3`,
      [term, term]
    );

    // Brand suggestions
    const [brands] = await pool.query(
      `SELECT id, name, slug, logo FROM brands WHERE is_active = 1 AND name LIKE ? LIMIT 3`,
      [term]
    );

    // Popular search suggestions
    const [popular] = await pool.query(
      `SELECT query, search_count FROM popular_searches WHERE query LIKE ? ORDER BY search_count DESC LIMIT 5`,
      [term]
    );

    res.json({
      products: products.map(p => ({
        ...p,
        regular_price: Number(p.regular_price),
        sale_price: p.sale_price ? Number(p.sale_price) : null,
      })),
      categories,
      brands,
      popularSearches: popular.map(p => p.query),
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/search/popular - popular and trending searches
router.get('/popular', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    const [popular] = await pool.query(
      `SELECT query, search_count, trend_score FROM popular_searches
       ORDER BY search_count DESC LIMIT ?`,
      [parseInt(limit)]
    );

    const [trending] = await pool.query(
      `SELECT query_normalized as query, COUNT(*) as count
       FROM search_queries WHERE created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
       GROUP BY query_normalized ORDER BY count DESC LIMIT ?`,
      [parseInt(limit)]
    );

    res.json({
      popular: popular.map(p => p.query),
      trending: trending.map(t => t.query),
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /api/search/history - save search for logged-in customer
router.post('/history', async (req, res) => {
  try {
    const { query, customerId, sessionId } = req.body;
    if (!query?.trim()) return res.json({ ok: true });

    const normalized = query.trim().toLowerCase();
    await pool.query(
      `INSERT INTO search_queries (query, query_normalized, customer_id, session_id) VALUES (?, ?, ?, ?)`,
      [query.trim(), normalized, customerId || null, sessionId || null]
    );

    await pool.query(
      `INSERT INTO popular_searches (query, search_count, last_searched) VALUES (?, 1, NOW())
       ON DUPLICATE KEY UPDATE search_count = search_count + 1, last_searched = NOW()`,
      [normalized]
    );

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/search/history/:customerId - get customer's recent searches
router.get('/history/:customerId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT query_normalized as query, MAX(created_at) as searched_at
       FROM search_queries WHERE customer_id = ?
       GROUP BY query_normalized ORDER BY searched_at DESC LIMIT 10`,
      [req.params.customerId]
    );
    res.json({ history: rows.map(r => r.query) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;

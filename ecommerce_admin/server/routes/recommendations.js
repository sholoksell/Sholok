const express = require('express');
const router = express.Router();
const pool = require('../db');

// POST /api/recommendations/view - track product view
router.post('/view', async (req, res) => {
  try {
    const { productId, customerId, sessionId, vendorId, categoryId } = req.body;
    if (!productId || !sessionId) return res.json({ ok: true });

    // Log raw view
    await pool.query(
      `INSERT INTO product_views (product_id, customer_id, session_id, vendor_id, category_id) VALUES (?, ?, ?, ?, ?)`,
      [productId, customerId || null, sessionId, vendorId || null, categoryId || null]
    );

    // Update recently viewed for logged-in users
    if (customerId) {
      await pool.query(
        `INSERT INTO recently_viewed (customer_id, product_id, viewed_at, view_count) VALUES (?, ?, NOW(), 1)
         ON DUPLICATE KEY UPDATE viewed_at = NOW(), view_count = view_count + 1`,
        [customerId, productId]
      );
      // Keep only last 20 per customer
      await pool.query(
        `DELETE FROM recently_viewed WHERE customer_id = ? AND product_id NOT IN (
           SELECT product_id FROM (
             SELECT product_id FROM recently_viewed WHERE customer_id = ? ORDER BY viewed_at DESC LIMIT 20
           ) t
         )`,
        [customerId, customerId]
      );
    }

    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/recommendations/recently-viewed?customerId=...&sessionId=...&limit=...
router.get('/recently-viewed', async (req, res) => {
  try {
    const { customerId, sessionId, limit = 10 } = req.query;
    let products = [];

    if (customerId) {
      const [rows] = await pool.query(
        `SELECT p.id, p.name, p.slug, p.thumbnail, p.regular_price, p.sale_price, p.stock,
                rv.viewed_at, rv.view_count
         FROM recently_viewed rv
         JOIN products p ON p.id = rv.product_id
         WHERE rv.customer_id = ? AND p.status = 'active'
         ORDER BY rv.viewed_at DESC LIMIT ?`,
        [customerId, parseInt(limit)]
      );
      products = rows;
    } else if (sessionId) {
      const [rows] = await pool.query(
        `SELECT DISTINCT p.id, p.name, p.slug, p.thumbnail, p.regular_price, p.sale_price, p.stock,
                MAX(pv.created_at) as viewed_at
         FROM product_views pv
         JOIN products p ON p.id = pv.product_id
         WHERE pv.session_id = ? AND p.status = 'active'
         GROUP BY p.id, p.name, p.slug, p.thumbnail, p.regular_price, p.sale_price, p.stock
         ORDER BY viewed_at DESC LIMIT ?`,
        [sessionId, parseInt(limit)]
      );
      products = rows;
    }

    res.json({
      products: products.map(p => ({
        ...p,
        regular_price: Number(p.regular_price),
        sale_price: p.sale_price ? Number(p.sale_price) : null
      }))
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/recommendations/similar/:productId - similar products (same category + brand)
router.get('/similar/:productId', async (req, res) => {
  try {
    const { limit = 8 } = req.query;
    const [[product]] = await pool.query('SELECT * FROM products WHERE id = ?', [req.params.productId]);
    if (!product) return res.json({ products: [] });

    const [products] = await pool.query(
      `SELECT p.id, p.name, p.slug, p.thumbnail, p.regular_price, p.sale_price, p.stock, p.on_sale
       FROM products p
       WHERE p.id != ? AND p.status = 'active' AND p.visibility = 1
         AND (p.category_id = ? OR p.brand_id = ?)
       ORDER BY (p.category_id = ? AND p.brand_id = ?) DESC, p.featured DESC, p.stock DESC
       LIMIT ?`,
      [product.id, product.category_id, product.brand_id, product.category_id, product.brand_id, parseInt(limit)]
    );

    res.json({
      products: products.map(p => ({
        ...p,
        regular_price: Number(p.regular_price),
        sale_price: p.sale_price ? Number(p.sale_price) : null
      }))
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/recommendations/trending?limit=...&period=24h|7d|30d
router.get('/trending', async (req, res) => {
  try {
    const { limit = 12, period = '7d' } = req.query;
    const hours = period === '24h' ? 24 : period === '7d' ? 168 : 720;

    const [products] = await pool.query(
      `SELECT p.id, p.name, p.slug, p.thumbnail, p.regular_price, p.sale_price, p.stock, p.on_sale,
              COUNT(pv.id) as view_count
       FROM product_views pv
       JOIN products p ON p.id = pv.product_id
       WHERE pv.created_at > DATE_SUB(NOW(), INTERVAL ? HOUR) AND p.status = 'active' AND p.visibility = 1
       GROUP BY p.id, p.name, p.slug, p.thumbnail, p.regular_price, p.sale_price, p.stock, p.on_sale
       ORDER BY view_count DESC
       LIMIT ?`,
      [hours, parseInt(limit)]
    );

    // Fallback to featured products if not enough views
    if (products.length < 8) {
      const [fallback] = await pool.query(
        `SELECT p.id, p.name, p.slug, p.thumbnail, p.regular_price, p.sale_price, p.stock, p.on_sale, 0 as view_count
         FROM products p WHERE p.status = 'active' AND p.visibility = 1 AND p.featured = 1
         ORDER BY p.stock DESC LIMIT ?`,
        [parseInt(limit)]
      );
      const existingIds = new Set(products.map(p => p.id));
      products.push(...fallback.filter(p => !existingIds.has(p.id)));
    }

    res.json({
      products: products.slice(0, parseInt(limit)).map(p => ({
        ...p,
        regular_price: Number(p.regular_price),
        sale_price: p.sale_price ? Number(p.sale_price) : null
      }))
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/recommendations/new-arrivals?limit=...&days=...
router.get('/new-arrivals', async (req, res) => {
  try {
    const { limit = 12, days = 30, category } = req.query;
    let where = `p.status = 'active' AND p.visibility = 1 AND p.created_at > DATE_SUB(NOW(), INTERVAL ? DAY)`;
    const params = [parseInt(days)];

    if (category) {
      where += ` AND p.category_id = ?`;
      params.push(category);
    }

    const [products] = await pool.query(
      `SELECT p.id, p.name, p.slug, p.thumbnail, p.regular_price, p.sale_price, p.stock, p.on_sale, p.created_at,
              c.name as category_name, v.store_name
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN vendors v ON p.vendor_id = v.id
       WHERE ${where}
       ORDER BY p.created_at DESC LIMIT ?`,
      [...params, parseInt(limit)]
    );

    res.json({
      products: products.map(p => ({
        ...p,
        regular_price: Number(p.regular_price),
        sale_price: p.sale_price ? Number(p.sale_price) : null
      }))
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/recommendations/best-sellers?limit=...&category=...
router.get('/best-sellers', async (req, res) => {
  try {
    const { limit = 12, category } = req.query;
    let where = `p.status = 'active' AND p.visibility = 1`;
    const params = [];

    if (category) {
      where += ` AND p.category_id = ?`;
      params.push(category);
    }

    const [products] = await pool.query(
      `SELECT p.id, p.name, p.slug, p.thumbnail, p.regular_price, p.sale_price, p.stock, p.on_sale,
              SUM(oi.quantity) as units_sold
       FROM products p
       LEFT JOIN order_items oi ON p.id = oi.product_id
       LEFT JOIN orders o ON oi.order_id = o.id AND o.status NOT IN ('cancelled','refunded')
       WHERE ${where}
       GROUP BY p.id, p.name, p.slug, p.thumbnail, p.regular_price, p.sale_price, p.stock, p.on_sale
       ORDER BY units_sold DESC, p.featured DESC LIMIT ?`,
      [...params, parseInt(limit)]
    );

    res.json({
      products: products.map(p => ({
        ...p,
        regular_price: Number(p.regular_price),
        sale_price: p.sale_price ? Number(p.sale_price) : null,
        units_sold: Number(p.units_sold || 0)
      }))
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/recommendations/for-you?customerId=...&limit=...
router.get('/for-you', async (req, res) => {
  try {
    const { customerId, limit = 12 } = req.query;

    if (!customerId) {
      // Return featured products for guests
      const [products] = await pool.query(
        `SELECT p.id, p.name, p.slug, p.thumbnail, p.regular_price, p.sale_price, p.stock, p.on_sale
         FROM products p WHERE p.status = 'active' AND p.visibility = 1 AND p.featured = 1
         ORDER BY RAND() LIMIT ?`,
        [parseInt(limit)]
      );
      return res.json({
        products: products.map(p => ({
          ...p,
          regular_price: Number(p.regular_price),
          sale_price: p.sale_price ? Number(p.sale_price) : null
        }))
      });
    }

    // Get customer's viewed category IDs
    const [viewedCategories] = await pool.query(
      `SELECT DISTINCT p.category_id FROM recently_viewed rv
       JOIN products p ON p.id = rv.product_id
       WHERE rv.customer_id = ? AND p.category_id IS NOT NULL
       ORDER BY rv.viewed_at DESC LIMIT 5`,
      [customerId]
    );

    // Get already-seen product IDs
    const [seenIds] = await pool.query(
      `SELECT product_id FROM recently_viewed WHERE customer_id = ?`,
      [customerId]
    );
    const seenSet = seenIds.map(r => r.product_id);

    let products = [];
    if (viewedCategories.length > 0) {
      const catIds = viewedCategories.map(r => r.category_id);
      const excludeClause = seenSet.length ? `AND p.id NOT IN (${seenSet.map(() => '?').join(',')})` : '';

      const [rows] = await pool.query(
        `SELECT p.id, p.name, p.slug, p.thumbnail, p.regular_price, p.sale_price, p.stock, p.on_sale
         FROM products p
         WHERE p.status = 'active' AND p.visibility = 1
           AND p.category_id IN (${catIds.map(() => '?').join(',')})
           ${excludeClause}
         ORDER BY p.featured DESC, p.stock DESC LIMIT ?`,
        [...catIds, ...seenSet, parseInt(limit)]
      );
      products = rows;
    }

    // Fill up with featured if needed
    if (products.length < parseInt(limit)) {
      const exclude = [...seenSet, ...products.map(p => p.id)];
      const excludeClause = exclude.length ? `AND p.id NOT IN (${exclude.map(() => '?').join(',')})` : '';
      const [fill] = await pool.query(
        `SELECT p.id, p.name, p.slug, p.thumbnail, p.regular_price, p.sale_price, p.stock, p.on_sale
         FROM products p WHERE p.status = 'active' AND p.visibility = 1 ${excludeClause}
         ORDER BY p.featured DESC LIMIT ?`,
        [...exclude, parseInt(limit) - products.length]
      );
      products.push(...fill);
    }

    res.json({
      products: products.map(p => ({
        ...p,
        regular_price: Number(p.regular_price),
        sale_price: p.sale_price ? Number(p.sale_price) : null
      }))
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/recommendations/frequently-bought/:productId
router.get('/frequently-bought/:productId', async (req, res) => {
  try {
    const productId = parseInt(req.params.productId, 10);
    if (!productId) return res.json({ products: [], source: 'category' });

    // Step 1: Find co-purchased products from order history
    const [coProducts] = await pool.query(
      `SELECT oi2.product_id as id, p.name, p.slug, p.thumbnail, p.regular_price, p.sale_price,
              COUNT(*) as co_count
       FROM order_items oi1
       JOIN order_items oi2 ON oi1.order_id = oi2.order_id AND oi2.product_id != oi1.product_id
       JOIN products p ON p.id = oi2.product_id
       WHERE oi1.product_id = ? AND p.status = 'active'
       GROUP BY oi2.product_id, p.name, p.slug, p.thumbnail, p.regular_price, p.sale_price
       ORDER BY co_count DESC
       LIMIT 6`,
      [productId]
    );

    let products = coProducts;
    let source = coProducts.length > 0 ? 'orders' : 'category';

    // Step 2: If fewer than 3 results, fill up with same-category products
    if (products.length < 3) {
      const [[mainProduct]] = await pool.query(
        'SELECT category_id FROM products WHERE id = ?',
        [productId]
      );

      if (mainProduct?.category_id) {
        const foundIds = products.map(p => p.id);
        const excludeIds = [productId, ...foundIds];
        const placeholders = excludeIds.map(() => '?').join(',');
        const needed = 6 - products.length;

        const [catProducts] = await pool.query(
          `SELECT p.id, p.name, p.slug, p.thumbnail, p.regular_price, p.sale_price, 0 as co_count
           FROM products p
           WHERE p.category_id = ? AND p.id NOT IN (${placeholders}) AND p.status = 'active'
           ORDER BY p.featured DESC, p.stock DESC
           LIMIT ?`,
          [mainProduct.category_id, ...excludeIds, needed]
        );

        products = [...products, ...catProducts];
        if (coProducts.length === 0) source = 'category';
      }
    }

    res.json({
      products: products.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        thumbnail: p.thumbnail,
        regular_price: Number(p.regular_price),
        sale_price: p.sale_price ? Number(p.sale_price) : null,
        price: p.sale_price ? Number(p.sale_price) : Number(p.regular_price),
      })),
      source,
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;

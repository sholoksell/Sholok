const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

/* ─────────────────────── helpers ─────────────────────── */

function isActive(row) {
  const today = new Date().toISOString().slice(0, 10);
  if (!row.is_active) return false;
  if (row.start_date && row.start_date > today) return false;
  if (row.end_date && row.end_date < today) return false;
  if (row.usage_limit > 0 && row.used_count >= row.usage_limit) return false;
  return true;
}

function fmtOffer(row) {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    offer_type: row.offer_type,
    buy_product_id: row.buy_product_id,
    get_product_id: row.get_product_id,
    buy_quantity: row.buy_quantity,
    get_quantity: row.get_quantity,
    get_discount_percent: parseFloat(row.get_discount_percent) || 100,
    bundle_products: row.bundle_products
      ? (typeof row.bundle_products === 'string'
          ? JSON.parse(row.bundle_products)
          : row.bundle_products)
      : null,
    bundle_price: row.bundle_price != null ? parseFloat(row.bundle_price) : null,
    discount_type: row.discount_type,
    discount_value: parseFloat(row.discount_value) || 0,
    min_cart_value: parseFloat(row.min_cart_value) || 0,
    start_date: row.start_date,
    end_date: row.end_date,
    is_active: !!row.is_active,
    usage_limit: row.usage_limit,
    used_count: row.used_count,
    vendor_id: row.vendor_id,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

async function resolveProductInfo(pool, productId) {
  if (!productId) return null;
  try {
    const [rows] = await pool.query(
      'SELECT id, name, price, thumbnail_url, slug FROM products WHERE id = ? LIMIT 1',
      [productId]
    );
    return rows[0] || null;
  } catch {
    return null;
  }
}

/* ─────────────────────── GET / — public active offers ─────────────────────── */

router.get('/', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [rows] = await pool.query(
      `SELECT * FROM bundle_offers
       WHERE is_active = 1
         AND (start_date IS NULL OR start_date <= ?)
         AND (end_date IS NULL OR end_date >= ?)
         AND (usage_limit = 0 OR used_count < usage_limit)
       ORDER BY created_at DESC`,
      [today, today]
    );
    res.json(rows.map(fmtOffer));
  } catch (err) {
    console.error('bundleOffers GET /:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ─────────────────────── GET /active — public with product details ─────────────────────── */

router.get('/active', async (req, res) => {
  try {
    const today = new Date().toISOString().slice(0, 10);
    const [rows] = await pool.query(
      `SELECT * FROM bundle_offers
       WHERE is_active = 1
         AND (start_date IS NULL OR start_date <= ?)
         AND (end_date IS NULL OR end_date >= ?)
         AND (usage_limit = 0 OR used_count < usage_limit)
       ORDER BY created_at DESC`,
      [today, today]
    );

    const enriched = await Promise.all(
      rows.map(async (row) => {
        const offer = fmtOffer(row);

        // Resolve buy/get products
        offer.buy_product = await resolveProductInfo(pool, offer.buy_product_id);
        offer.get_product = await resolveProductInfo(pool, offer.get_product_id);

        // Resolve bundle products array
        if (offer.bundle_products && Array.isArray(offer.bundle_products)) {
          offer.bundle_products_detail = await Promise.all(
            offer.bundle_products.map(async (bp) => {
              const prod = await resolveProductInfo(pool, bp.product_id);
              return { ...bp, product: prod };
            })
          );
        }

        return offer;
      })
    );

    res.json(enriched);
  } catch (err) {
    console.error('bundleOffers GET /active:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ─────────────────────── GET /admin — admin, all offers ─────────────────────── */

router.get('/admin', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM bundle_offers ORDER BY created_at DESC'
    );
    res.json(rows.map(fmtOffer));
  } catch (err) {
    console.error('bundleOffers GET /admin:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ─────────────────────── POST / — admin, create offer ─────────────────────── */

router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      name, description, offer_type, buy_product_id, get_product_id,
      buy_quantity, get_quantity, get_discount_percent, bundle_products,
      bundle_price, discount_type, discount_value, min_cart_value,
      start_date, end_date, is_active, usage_limit, vendor_id,
    } = req.body;

    if (!name || !offer_type) {
      return res.status(400).json({ message: 'name and offer_type are required' });
    }

    const bundleProductsJson = bundle_products
      ? JSON.stringify(bundle_products)
      : null;

    const [result] = await pool.query(
      `INSERT INTO bundle_offers
         (name, description, offer_type, buy_product_id, get_product_id,
          buy_quantity, get_quantity, get_discount_percent, bundle_products,
          bundle_price, discount_type, discount_value, min_cart_value,
          start_date, end_date, is_active, usage_limit, vendor_id)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        description || null,
        offer_type,
        buy_product_id || null,
        get_product_id || null,
        buy_quantity || 1,
        get_quantity || 1,
        get_discount_percent != null ? get_discount_percent : 100,
        bundleProductsJson,
        bundle_price || null,
        discount_type || 'percentage',
        discount_value || 0,
        min_cart_value || 0,
        start_date || null,
        end_date || null,
        is_active != null ? (is_active ? 1 : 0) : 1,
        usage_limit || 0,
        vendor_id || null,
      ]
    );

    const [newRows] = await pool.query('SELECT * FROM bundle_offers WHERE id = ?', [result.insertId]);
    res.status(201).json(fmtOffer(newRows[0]));
  } catch (err) {
    console.error('bundleOffers POST /:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ─────────────────────── PUT /:id — admin, update offer ─────────────────────── */

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      name, description, offer_type, buy_product_id, get_product_id,
      buy_quantity, get_quantity, get_discount_percent, bundle_products,
      bundle_price, discount_type, discount_value, min_cart_value,
      start_date, end_date, is_active, usage_limit, vendor_id,
    } = req.body;

    const bundleProductsJson = bundle_products != null
      ? JSON.stringify(bundle_products)
      : null;

    await pool.query(
      `UPDATE bundle_offers SET
         name = ?, description = ?, offer_type = ?,
         buy_product_id = ?, get_product_id = ?,
         buy_quantity = ?, get_quantity = ?,
         get_discount_percent = ?, bundle_products = ?,
         bundle_price = ?, discount_type = ?, discount_value = ?,
         min_cart_value = ?, start_date = ?, end_date = ?,
         is_active = ?, usage_limit = ?, vendor_id = ?
       WHERE id = ?`,
      [
        name,
        description || null,
        offer_type,
        buy_product_id || null,
        get_product_id || null,
        buy_quantity || 1,
        get_quantity || 1,
        get_discount_percent != null ? get_discount_percent : 100,
        bundleProductsJson,
        bundle_price || null,
        discount_type || 'percentage',
        discount_value || 0,
        min_cart_value || 0,
        start_date || null,
        end_date || null,
        is_active != null ? (is_active ? 1 : 0) : 1,
        usage_limit || 0,
        vendor_id || null,
        id,
      ]
    );

    const [rows] = await pool.query('SELECT * FROM bundle_offers WHERE id = ?', [id]);
    if (!rows.length) return res.status(404).json({ message: 'Offer not found' });
    res.json(fmtOffer(rows[0]));
  } catch (err) {
    console.error('bundleOffers PUT /:id:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ─────────────────────── DELETE /:id — admin ─────────────────────── */

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const [result] = await pool.query('DELETE FROM bundle_offers WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ message: 'Offer not found' });
    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    console.error('bundleOffers DELETE /:id:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

/* ─────────────────────── POST /check-cart — public, check applicable offers ─────────────────────── */

router.post('/check-cart', async (req, res) => {
  try {
    const { items } = req.body; // [{productId, quantity}]
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.json({ applicable: [] });
    }

    const today = new Date().toISOString().slice(0, 10);
    const [offers] = await pool.query(
      `SELECT * FROM bundle_offers
       WHERE is_active = 1
         AND (start_date IS NULL OR start_date <= ?)
         AND (end_date IS NULL OR end_date >= ?)
         AND (usage_limit = 0 OR used_count < usage_limit)`,
      [today, today]
    );

    const cartMap = {};
    items.forEach(({ productId, quantity }) => {
      const key = String(productId);
      cartMap[key] = (cartMap[key] || 0) + quantity;
    });

    // Fetch product prices from DB for discount calculation
    const productIds = items.map(i => i.productId);
    let productPriceMap = {};
    if (productIds.length > 0) {
      try {
        const placeholders = productIds.map(() => '?').join(',');
        const [prodRows] = await pool.query(
          `SELECT id, price FROM products WHERE id IN (${placeholders})`,
          productIds
        );
        prodRows.forEach(p => { productPriceMap[String(p.id)] = parseFloat(p.price) || 0; });
      } catch { /* ignore price lookup errors */ }
    }

    const applicable = [];

    for (const row of offers) {
      const offer = fmtOffer(row);

      if (offer.offer_type === 'bogo' || offer.offer_type === 'buy_x_get_y') {
        const buyId = String(offer.buy_product_id);
        const getId = String(offer.get_product_id);
        const buyQtyInCart = cartMap[buyId] || 0;

        if (buyQtyInCart >= offer.buy_quantity) {
          // How many times the offer applies
          const times = Math.floor(buyQtyInCart / offer.buy_quantity);
          const getPrice = productPriceMap[getId] || 0;
          const discountPct = parseFloat(offer.get_discount_percent) || 100;
          const discountAmount = getPrice * offer.get_quantity * times * (discountPct / 100);

          applicable.push({
            ...offer,
            discount_amount: discountAmount,
            applied_times: times,
          });
        }
      } else if (offer.offer_type === 'bundle') {
        // Check if all bundle products are in cart with sufficient quantities
        const bundleProds = Array.isArray(offer.bundle_products) ? offer.bundle_products : [];
        if (bundleProds.length === 0) continue;

        const allPresent = bundleProds.every(bp => {
          const inCart = cartMap[String(bp.product_id)] || 0;
          return inCart >= (bp.quantity || 1);
        });

        if (allPresent) {
          // Calculate regular total vs bundle price
          let regularTotal = 0;
          bundleProds.forEach(bp => {
            const price = productPriceMap[String(bp.product_id)] || 0;
            regularTotal += price * (bp.quantity || 1);
          });

          let discountAmount = 0;
          if (offer.bundle_price != null && offer.bundle_price < regularTotal) {
            discountAmount = regularTotal - offer.bundle_price;
          } else if (offer.discount_type === 'percentage' && offer.discount_value > 0) {
            discountAmount = regularTotal * (offer.discount_value / 100);
          } else if (offer.discount_type === 'fixed' && offer.discount_value > 0) {
            discountAmount = offer.discount_value;
          }

          applicable.push({
            ...offer,
            discount_amount: discountAmount,
            regular_total: regularTotal,
          });
        }
      }
    }

    res.json({ applicable });
  } catch (err) {
    console.error('bundleOffers POST /check-cart:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;

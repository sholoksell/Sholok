const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/price-comparison/:productId
// Find same/similar products from other vendors for price comparison
router.get('/:productId', async (req, res) => {
  try {
    const [[base]] = await pool.query(
      `SELECT p.*, b.name as brand_name, c.name as category_name, v.store_name, v.rating as vendor_rating, v.slug as vendor_slug
       FROM products p
       LEFT JOIN brands b ON p.brand_id = b.id
       LEFT JOIN categories c ON p.category_id = c.id
       LEFT JOIN vendors v ON p.vendor_id = v.id
       WHERE p.id = ? AND p.status = 'active'`,
      [req.params.productId]
    );

    if (!base) return res.status(404).json({ message: 'Product not found' });

    // Find comparable products: same SKU prefix, same brand+category, or exact name match from different vendors
    const [comparable] = await pool.query(
      `SELECT p.id, p.name, p.slug, p.sku, p.thumbnail, p.regular_price, p.sale_price, p.compare_price,
              p.stock, p.shipping_charge, p.on_sale, p.featured,
              v.id as vendor_id, v.store_name, v.slug as vendor_slug, v.rating as vendor_rating, v.rating_count,
              v.store_logo, v.district,
              (SELECT estimated_days_min FROM shipping_policies WHERE is_active=1 LIMIT 1) as est_days_min
       FROM products p
       JOIN vendors v ON p.vendor_id = v.id
       WHERE p.status = 'active' AND p.visibility = 1
         AND p.id != ?
         AND (
           (p.brand_id = ? AND p.category_id = ?) OR
           p.name = ? OR
           (p.sku IS NOT NULL AND p.sku != '' AND LEFT(p.sku, 6) = LEFT(?, 6) AND LENGTH(?) >= 6)
         )
       ORDER BY COALESCE(p.sale_price, p.regular_price) ASC
       LIMIT 10`,
      [base.id, base.brand_id, base.category_id, base.name, base.sku || '', base.sku || '']
    );

    const format = (p) => ({
      ...p,
      regular_price: Number(p.regular_price),
      sale_price: p.sale_price ? Number(p.sale_price) : null,
      compare_price: p.compare_price ? Number(p.compare_price) : null,
      effective_price: Number(p.sale_price || p.regular_price),
      shipping_charge: Number(p.shipping_charge || 0),
      total_price: Number(p.sale_price || p.regular_price) + Number(p.shipping_charge || 0),
      vendor_rating: p.vendor_rating ? Number(p.vendor_rating) : null,
    });

    const baseFormatted = format({
      ...base,
      vendor_id: base.vendor_id,
      store_name: base.store_name,
      vendor_slug: base.vendor_slug,
      vendor_rating: base.vendor_rating,
      rating_count: base.rating_count,
    });

    const allOffers = [baseFormatted, ...comparable.map(format)];
    const lowestPrice = Math.min(...allOffers.map(p => p.effective_price));
    const highestPrice = Math.max(...allOffers.map(p => p.effective_price));

    res.json({
      base: baseFormatted,
      offers: allOffers.map(p => ({
        ...p,
        is_lowest: p.effective_price === lowestPrice,
        is_highest: p.effective_price === highestPrice,
        savings_vs_highest: highestPrice - p.effective_price,
      })),
      summary: {
        vendor_count: allOffers.length,
        lowest_price: lowestPrice,
        highest_price: highestPrice,
        max_savings: highestPrice - lowestPrice,
      }
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;

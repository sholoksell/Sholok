const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

/* ─────────────────────────── formatters ─────────────────────────── */

function fmtCoupon(row) {
  if (!row) return null;
  return {
    _id:                  row.id,
    code:                 row.code,
    description:          row.description,
    discountType:         row.discount_type,
    discountValue:        row.discount_value,
    minPurchaseAmount:    row.min_purchase_amount,
    maxDiscountAmount:    row.max_discount_amount,
    startDate:            row.start_date,
    endDate:              row.end_date,
    usageLimit:           row.usage_limit,
    usedCount:            row.used_count,
    usagePerCustomer:     row.usage_per_customer,
    isActive:             !!row.is_active,
    createdAt:            row.created_at,
    updatedAt:            row.updated_at,
  };
}

function fmtFlashSale(row) {
  if (!row) return null;
  return {
    _id:               row.id,
    title:             row.title,
    description:       row.description,
    discountType:      row.discount_type,
    discountValue:     row.discount_value,
    startDate:         row.start_date,
    endDate:           row.end_date,
    minPurchaseAmount: row.min_purchase_amount,
    badge:             row.badge,
    isActive:          !!row.is_active,
    createdAt:         row.created_at,
    updatedAt:         row.updated_at,
  };
}

function fmtCampaign(row) {
  if (!row) return null;
  return {
    _id:         row.id,
    title:       row.title,
    subject:     row.subject,
    body:        row.body,
    audience:    row.audience,
    status:      row.status,
    scheduledAt: row.scheduled_at,
    sentAt:      row.sent_at,
    sentCount:   row.sent_count,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
  };
}

function fmtBanner(row) {
  if (!row) return null;
  return {
    _id:             row.id,
    title:           row.title,
    titleBn:         row.title_bn,
    subtitle:        row.subtitle,
    description:     row.description,
    image:           row.image,
    imageMobile:     row.image_mobile,
    link:            row.link_url,
    linkUrl:         row.link_url,
    linkText:        row.link_text,
    backgroundColor: row.background_color,
    textColor:       row.text_color,
    buttonColor:     row.button_color,
    isActive:        !!row.is_active,
    startDate:       row.start_date,
    endDate:         row.end_date,
    position:        row.position,
    order:           row.sort_order,
    createdAt:       row.created_at,
    updatedAt:       row.updated_at,
  };
}

/* ─────────────────────────── STATS ──────────────────────────────── */

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const now = new Date();
    const [[{ totalCoupons }]]  = await pool.query('SELECT COUNT(*) AS totalCoupons FROM coupons');
    const [[{ activeCoupons }]] = await pool.query(
      'SELECT COUNT(*) AS activeCoupons FROM coupons WHERE is_active = 1 AND end_date >= ?', [now]
    );
    const [[{ totalBanners }]]  = await pool.query('SELECT COUNT(*) AS totalBanners FROM banners');
    const [[{ activeBanners }]] = await pool.query('SELECT COUNT(*) AS activeBanners FROM banners WHERE is_active = 1');
    const [[{ activeFlashSales }]] = await pool.query(
      'SELECT COUNT(*) AS activeFlashSales FROM flash_sales WHERE is_active = 1 AND end_date >= ?', [now]
    );
    const [[{ totalRedemptions }]] = await pool.query('SELECT COALESCE(SUM(used_count), 0) AS totalRedemptions FROM coupons');

    res.json({ totalCoupons, activeCoupons, totalBanners, activeBanners, activeFlashSales, totalRedemptions });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ─────────────────────────── COUPONS ────────────────────────────── */

// GET /coupons
router.get('/coupons', authMiddleware, async (req, res) => {
  try {
    const { active, search } = req.query;
    const conditions = [];
    const params = [];
    if (active === 'true') { conditions.push('is_active = 1'); }
    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const [rows] = await pool.query(`SELECT * FROM coupons ${where} ORDER BY created_at DESC`, params);
    let result = rows.map(fmtCoupon);
    if (search) {
      const s = search.toUpperCase();
      result = result.filter(c => (c.code || '').toUpperCase().includes(s) || (c.description || '').includes(search));
    }
    res.json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /coupons/active — public, returns active non-expired coupons for frontend display
router.get('/coupons/active', async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 12, 50);
    const [rows] = await pool.query(
      `SELECT id, code, description, discount_type, discount_value, min_purchase_amount, end_date
       FROM coupons
       WHERE is_active = 1 AND (end_date IS NULL OR end_date >= CURDATE())
         AND (usage_limit = 0 OR used_count < usage_limit)
       ORDER BY created_at DESC LIMIT ?`,
      [limit]
    );
    res.json({ coupons: rows });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /coupons/validate/:code — public
router.get('/coupons/validate/:code', async (req, res) => {
  try {
    const [[coupon]] = await pool.query(
      'SELECT * FROM coupons WHERE code = ? AND is_active = 1 LIMIT 1',
      [req.params.code.toUpperCase()]
    );
    if (!coupon) return res.status(404).json({ message: 'Coupon not found or inactive' });

    const now = new Date();
    if (new Date(coupon.start_date) > now) return res.status(400).json({ message: 'Coupon not yet active' });
    if (new Date(coupon.end_date) < now)   return res.status(400).json({ message: 'Coupon expired' });
    if (coupon.usage_limit !== null && coupon.used_count >= coupon.usage_limit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    res.json({ valid: true, coupon: fmtCoupon(coupon) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /coupons/:id
router.get('/coupons/:id', authMiddleware, async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM coupons WHERE id = ? LIMIT 1', [req.params.id]);
    if (!row) return res.status(404).json({ message: 'Coupon not found' });
    res.json(fmtCoupon(row));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /coupons
router.post('/coupons', authMiddleware, async (req, res) => {
  try {
    const {
      code, description = '', discountType, discountValue,
      minPurchaseAmount = 0, maxDiscountAmount = null,
      startDate, endDate,
      usageLimit = null, usagePerCustomer = 1, isActive = true,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO coupons (code, description, discount_type, discount_value, min_purchase_amount, max_discount_amount, start_date, end_date, usage_limit, usage_per_customer, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [code.toUpperCase(), description, discountType, discountValue, minPurchaseAmount, maxDiscountAmount, startDate, endDate, usageLimit, usagePerCustomer, isActive ? 1 : 0]
    );
    const [[saved]] = await pool.query('SELECT * FROM coupons WHERE id = ?', [result.insertId]);
    res.status(201).json(fmtCoupon(saved));
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Coupon code already exists' });
    res.status(400).json({ message: error.message });
  }
});

// PUT /coupons/:id
router.put('/coupons/:id', authMiddleware, async (req, res) => {
  try {
    const { code, description, discountType, discountValue, minPurchaseAmount, maxDiscountAmount, startDate, endDate, usageLimit, usagePerCustomer, isActive } = req.body;
    const fields = {};
    if (code !== undefined)               fields.code                  = code.toUpperCase();
    if (description !== undefined)        fields.description           = description;
    if (discountType !== undefined)       fields.discount_type         = discountType;
    if (discountValue !== undefined)      fields.discount_value        = discountValue;
    if (minPurchaseAmount !== undefined)  fields.min_purchase_amount   = minPurchaseAmount;
    if (maxDiscountAmount !== undefined)  fields.max_discount_amount   = maxDiscountAmount;
    if (startDate !== undefined)          fields.start_date            = startDate;
    if (endDate !== undefined)            fields.end_date              = endDate;
    if (usageLimit !== undefined)         fields.usage_limit           = usageLimit;
    if (usagePerCustomer !== undefined)   fields.usage_per_customer    = usagePerCustomer;
    if (isActive !== undefined)           fields.is_active             = isActive ? 1 : 0;

    if (Object.keys(fields).length) {
      const setClauses = Object.keys(fields).map(k => `${k} = ?`).join(', ');
      await pool.query(`UPDATE coupons SET ${setClauses} WHERE id = ?`, [...Object.values(fields), req.params.id]);
    }

    const [[saved]] = await pool.query('SELECT * FROM coupons WHERE id = ? LIMIT 1', [req.params.id]);
    if (!saved) return res.status(404).json({ message: 'Coupon not found' });
    res.json(fmtCoupon(saved));
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Coupon code already exists' });
    res.status(400).json({ message: error.message });
  }
});

// DELETE /coupons/:id
router.delete('/coupons/:id', authMiddleware, async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT id FROM coupons WHERE id = ? LIMIT 1', [req.params.id]);
    if (!row) return res.status(404).json({ message: 'Coupon not found' });
    await pool.query('DELETE FROM coupons WHERE id = ?', [req.params.id]);
    res.json({ message: 'Coupon deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ─────────────────────────── FLASH SALES ────────────────────────── */

// GET /flash-sales
router.get('/flash-sales', authMiddleware, async (req, res) => {
  try {
    const { active } = req.query;
    const now = new Date();
    let where = '';
    const params = [];
    if (active === 'true') {
      where = 'WHERE is_active = 1 AND end_date >= ?';
      params.push(now);
    }
    const [rows] = await pool.query(`SELECT * FROM flash_sales ${where} ORDER BY created_at DESC`, params);
    res.json(rows.map(fmtFlashSale));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /flash-sales/active — public
router.get('/flash-sales/active', async (req, res) => {
  try {
    const now = new Date();
    const [rows] = await pool.query(
      'SELECT * FROM flash_sales WHERE is_active = 1 AND start_date <= ? AND end_date >= ? ORDER BY created_at DESC',
      [now, now]
    );
    res.json(rows.map(fmtFlashSale));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /flash-sales/:id
router.get('/flash-sales/:id', authMiddleware, async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM flash_sales WHERE id = ? LIMIT 1', [req.params.id]);
    if (!row) return res.status(404).json({ message: 'Flash sale not found' });
    res.json(fmtFlashSale(row));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /flash-sales
router.post('/flash-sales', authMiddleware, async (req, res) => {
  try {
    const {
      title, description = '', discountType = 'percentage', discountValue,
      startDate, endDate, minPurchaseAmount = 0, badge = '', isActive = true,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO flash_sales (title, description, discount_type, discount_value, start_date, end_date, min_purchase_amount, badge, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, description, discountType, discountValue, startDate, endDate, minPurchaseAmount, badge, isActive ? 1 : 0]
    );
    const [[saved]] = await pool.query('SELECT * FROM flash_sales WHERE id = ?', [result.insertId]);
    res.status(201).json(fmtFlashSale(saved));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /flash-sales/:id
router.put('/flash-sales/:id', authMiddleware, async (req, res) => {
  try {
    const { title, description, discountType, discountValue, startDate, endDate, minPurchaseAmount, badge, isActive } = req.body;
    const fields = {};
    if (title !== undefined)              fields.title               = title;
    if (description !== undefined)        fields.description         = description;
    if (discountType !== undefined)       fields.discount_type       = discountType;
    if (discountValue !== undefined)      fields.discount_value      = discountValue;
    if (startDate !== undefined)          fields.start_date          = startDate;
    if (endDate !== undefined)            fields.end_date            = endDate;
    if (minPurchaseAmount !== undefined)  fields.min_purchase_amount = minPurchaseAmount;
    if (badge !== undefined)              fields.badge               = badge;
    if (isActive !== undefined)           fields.is_active           = isActive ? 1 : 0;

    if (Object.keys(fields).length) {
      const setClauses = Object.keys(fields).map(k => `${k} = ?`).join(', ');
      await pool.query(`UPDATE flash_sales SET ${setClauses} WHERE id = ?`, [...Object.values(fields), req.params.id]);
    }

    const [[saved]] = await pool.query('SELECT * FROM flash_sales WHERE id = ? LIMIT 1', [req.params.id]);
    if (!saved) return res.status(404).json({ message: 'Flash sale not found' });
    res.json(fmtFlashSale(saved));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /flash-sales/:id
router.delete('/flash-sales/:id', authMiddleware, async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT id FROM flash_sales WHERE id = ? LIMIT 1', [req.params.id]);
    if (!row) return res.status(404).json({ message: 'Flash sale not found' });
    await pool.query('DELETE FROM flash_sales WHERE id = ?', [req.params.id]);
    res.json({ message: 'Flash sale deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ─────────────────────── EMAIL CAMPAIGNS ────────────────────────── */

// GET /email-campaigns
router.get('/email-campaigns', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM email_campaigns ORDER BY created_at DESC');
    res.json(rows.map(fmtCampaign));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /email-campaigns/:id
router.get('/email-campaigns/:id', authMiddleware, async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM email_campaigns WHERE id = ? LIMIT 1', [req.params.id]);
    if (!row) return res.status(404).json({ message: 'Campaign not found' });
    res.json(fmtCampaign(row));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /email-campaigns
router.post('/email-campaigns', authMiddleware, async (req, res) => {
  try {
    const {
      title, subject, body, audience = 'all',
      status = 'draft', scheduledAt = null,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO email_campaigns (title, subject, body, audience, status, scheduled_at)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [title, subject, body, audience, status, scheduledAt || null]
    );
    const [[saved]] = await pool.query('SELECT * FROM email_campaigns WHERE id = ?', [result.insertId]);
    res.status(201).json(fmtCampaign(saved));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /email-campaigns/:id
router.put('/email-campaigns/:id', authMiddleware, async (req, res) => {
  try {
    const { title, subject, body, audience, status, scheduledAt, sentAt, sentCount } = req.body;
    const fields = {};
    if (title !== undefined)       fields.title        = title;
    if (subject !== undefined)     fields.subject      = subject;
    if (body !== undefined)        fields.body         = body;
    if (audience !== undefined)    fields.audience     = audience;
    if (status !== undefined)      fields.status       = status;
    if (scheduledAt !== undefined) fields.scheduled_at = scheduledAt || null;
    if (sentAt !== undefined)      fields.sent_at      = sentAt || null;
    if (sentCount !== undefined)   fields.sent_count   = sentCount;

    if (Object.keys(fields).length) {
      const setClauses = Object.keys(fields).map(k => `${k} = ?`).join(', ');
      await pool.query(`UPDATE email_campaigns SET ${setClauses} WHERE id = ?`, [...Object.values(fields), req.params.id]);
    }

    const [[saved]] = await pool.query('SELECT * FROM email_campaigns WHERE id = ? LIMIT 1', [req.params.id]);
    if (!saved) return res.status(404).json({ message: 'Campaign not found' });
    res.json(fmtCampaign(saved));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /email-campaigns/:id
router.delete('/email-campaigns/:id', authMiddleware, async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT id FROM email_campaigns WHERE id = ? LIMIT 1', [req.params.id]);
    if (!row) return res.status(404).json({ message: 'Campaign not found' });
    await pool.query('DELETE FROM email_campaigns WHERE id = ?', [req.params.id]);
    res.json({ message: 'Campaign deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /email-campaigns/:id/send — mark as sent
router.post('/email-campaigns/:id/send', authMiddleware, async (req, res) => {
  try {
    const { sentCount = 0 } = req.body;
    await pool.query(
      "UPDATE email_campaigns SET status = 'sent', sent_at = NOW(), sent_count = ? WHERE id = ?",
      [sentCount, req.params.id]
    );
    const [[saved]] = await pool.query('SELECT * FROM email_campaigns WHERE id = ? LIMIT 1', [req.params.id]);
    if (!saved) return res.status(404).json({ message: 'Campaign not found' });
    res.json(fmtCampaign(saved));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

/* ─────────────────── FLASH SALE PRODUCTS ────────────────────────── */

// GET /flash-sales/:id/products
router.get('/flash-sales/:id/products', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.slug, p.price, p.sale_price,
              (SELECT image_url FROM product_images WHERE product_id = p.id ORDER BY sort_order LIMIT 1) AS image
       FROM flash_sale_products fsp
       JOIN products p ON fsp.product_id = p.id
       WHERE fsp.flash_sale_id = ?
       ORDER BY p.name ASC`,
      [req.params.id]
    );
    res.json({ products: rows });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /flash-sales/:id/products  — replaces the entire product list
router.post('/flash-sales/:id/products', authMiddleware, async (req, res) => {
  try {
    const { productIds = [] } = req.body;
    const flashId = req.params.id;

    await pool.query('DELETE FROM flash_sale_products WHERE flash_sale_id = ?', [flashId]);

    if (productIds.length > 0) {
      const values = productIds.map((pid) => [flashId, pid]);
      await pool.query(
        'INSERT INTO flash_sale_products (flash_sale_id, product_id) VALUES ?',
        [values]
      );
    }

    res.json({ ok: true, count: productIds.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ─────────────────────── BANNERS (marketing proxy) ──────────────── */

// The main banners CRUD lives in banners.js
// These routes proxy into the banners table for the /api/marketing/banners path

router.get('/banners', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM banners ORDER BY sort_order ASC, created_at DESC');
    res.json(rows.map(fmtBanner));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/banners', authMiddleware, async (req, res) => {
  try {
    const {
      title = '', titleBn = '', subtitle = '', description = '',
      image = '', imageMobile = '', link = '', linkText = 'Shop Now',
      backgroundColor = '#ffffff', textColor = '#000000', buttonColor = '#E31E24',
      isActive = true, startDate = null, endDate = null,
      position = 'hero', order: sortOrder = 0,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO banners (title, title_bn, subtitle, description, image, image_mobile, link_url, link_text, background_color, text_color, button_color, is_active, start_date, end_date, position, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, titleBn, subtitle, description, image, imageMobile, link, linkText, backgroundColor, textColor, buttonColor, isActive ? 1 : 0, startDate, endDate, position, sortOrder]
    );
    const [[saved]] = await pool.query('SELECT * FROM banners WHERE id = ?', [result.insertId]);
    res.status(201).json(fmtBanner(saved));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.put('/banners/:id', authMiddleware, async (req, res) => {
  try {
    const { title, titleBn, subtitle, description, image, imageMobile, link, linkText, backgroundColor, textColor, buttonColor, isActive, startDate, endDate, position, order: sortOrder } = req.body;
    const fields = {};
    if (title !== undefined)           fields.title            = title;
    if (titleBn !== undefined)         fields.title_bn         = titleBn;
    if (subtitle !== undefined)        fields.subtitle         = subtitle;
    if (description !== undefined)     fields.description      = description;
    if (image !== undefined)           fields.image            = image;
    if (imageMobile !== undefined)     fields.image_mobile     = imageMobile;
    if (link !== undefined)            fields.link_url         = link;
    if (linkText !== undefined)        fields.link_text        = linkText;
    if (backgroundColor !== undefined) fields.background_color = backgroundColor;
    if (textColor !== undefined)       fields.text_color       = textColor;
    if (buttonColor !== undefined)     fields.button_color     = buttonColor;
    if (isActive !== undefined)        fields.is_active        = isActive ? 1 : 0;
    if (startDate !== undefined)       fields.start_date       = startDate || null;
    if (endDate !== undefined)         fields.end_date         = endDate || null;
    if (position !== undefined)        fields.position         = position;
    if (sortOrder !== undefined)       fields.sort_order       = sortOrder;

    if (Object.keys(fields).length) {
      const setClauses = Object.keys(fields).map(k => `${k} = ?`).join(', ');
      await pool.query(`UPDATE banners SET ${setClauses} WHERE id = ?`, [...Object.values(fields), req.params.id]);
    }
    const [[saved]] = await pool.query('SELECT * FROM banners WHERE id = ? LIMIT 1', [req.params.id]);
    if (!saved) return res.status(404).json({ message: 'Banner not found' });
    res.json(fmtBanner(saved));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.delete('/banners/:id', authMiddleware, async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT id FROM banners WHERE id = ? LIMIT 1', [req.params.id]);
    if (!row) return res.status(404).json({ message: 'Banner not found' });
    await pool.query('DELETE FROM banners WHERE id = ?', [req.params.id]);
    res.json({ message: 'Banner deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

/* ─────────────────────── FLASH SALE PRODUCTS ────────────────────── */

// GET /api/marketing/flash-sales/:id/products
router.get('/flash-sales/:id/products', async (req, res) => {
  try {
    const [products] = await pool.query(
      `SELECT p.id, p.name, p.slug, p.thumbnail, p.regular_price, p.sale_price, p.stock, p.on_sale
       FROM flash_sale_products fsp
       JOIN products p ON fsp.product_id = p.id
       WHERE fsp.flash_sale_id = ?`,
      [req.params.id]
    );
    res.json({ products });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// POST /api/marketing/flash-sales/:id/products - assign products
router.post('/flash-sales/:id/products', async (req, res) => {
  try {
    const { productIds } = req.body;
    if (!Array.isArray(productIds)) return res.status(400).json({ message: 'productIds must be array' });

    await pool.query('DELETE FROM flash_sale_products WHERE flash_sale_id = ?', [req.params.id]);
    if (productIds.length > 0) {
      const values = productIds.map(pid => [req.params.id, pid]);
      await pool.query('INSERT IGNORE INTO flash_sale_products (flash_sale_id, product_id) VALUES ?', [values]);
    }
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// GET /api/marketing/flash-sale-products/active - products with flash sale pricing applied
router.get('/flash-sale-products/active', async (req, res) => {
  try {
    const [sales] = await pool.query(
      `SELECT fs.*, p.id as product_id, p.name, p.slug, p.thumbnail, p.regular_price, p.sale_price
       FROM flash_sales fs
       JOIN flash_sale_products fsp ON fsp.flash_sale_id = fs.id
       JOIN products p ON p.id = fsp.product_id
       WHERE fs.is_active = 1 AND fs.start_date <= NOW() AND fs.end_date > NOW()
         AND p.status = 'active'
       ORDER BY fs.end_date ASC LIMIT 50`
    );

    const products = sales.map(row => {
      const basePrice = Number(row.sale_price || row.regular_price);
      const discountedPrice = row.discount_type === 'percentage'
        ? basePrice * (1 - Number(row.discount_value) / 100)
        : basePrice - Number(row.discount_value);

      return {
        product_id: row.product_id, name: row.name, slug: row.slug, thumbnail: row.thumbnail,
        regular_price: Number(row.regular_price), sale_price: Number(row.sale_price || row.regular_price),
        flash_price: Math.max(0, discountedPrice),
        flash_sale_id: row.id, flash_sale_title: row.title, flash_end: row.end_date,
        discount_type: row.discount_type, discount_value: Number(row.discount_value)
      };
    });

    res.json({ products });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;

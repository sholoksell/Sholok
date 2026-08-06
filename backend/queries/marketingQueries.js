const pool = require('../db');

// =====================================================================
// Coupons
// =====================================================================

function fmtCoupon(row, { categories = [], products = [] } = {}) {
  if (!row) return null;
  return {
    _id:                row.id,
    code:               row.code,
    description:        row.description,
    discountType:       row.discount_type,
    discountValue:      Number(row.discount_value),
    minPurchaseAmount:  Number(row.min_purchase_amount),
    maxDiscountAmount:  Number(row.max_discount_amount),
    startDate:          row.start_date,
    endDate:            row.end_date,
    usageLimit:         row.usage_limit,
    usedCount:          row.used_count,
    usagePerCustomer:   row.usage_per_customer,
    isActive:           !!row.is_active,
    applicableCategories: categories,
    applicableProducts:   products,
    createdAt:          row.created_at,
    updatedAt:          row.updated_at,
  };
}

async function _getCouponCategories(couponId) {
  const [rows] = await pool.query('SELECT category_id FROM coupon_categories WHERE coupon_id = ?', [couponId]);
  return rows.map(r => r.category_id);
}

async function _getCouponProducts(couponId) {
  const [rows] = await pool.query('SELECT product_id FROM coupon_products WHERE coupon_id = ?', [couponId]);
  return rows.map(r => r.product_id);
}

async function findAllCoupons({ page = 1, limit = 20, search, isActive } = {}) {
  const conditions = [];
  const params = [];
  if (search)    { conditions.push('code LIKE ?'); params.push(`%${search}%`); }
  if (isActive !== undefined) { conditions.push('is_active = ?'); params.push(isActive ? 1 : 0); }
  const where  = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(`SELECT * FROM coupons ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
  const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM coupons ${where}`, params);
  const coupons = await Promise.all(rows.map(async r => fmtCoupon(r, {
    categories: await _getCouponCategories(r.id),
    products:   await _getCouponProducts(r.id),
  })));
  return { coupons, total: countRows[0].total };
}

async function findCouponById(id) {
  const [rows] = await pool.query('SELECT * FROM coupons WHERE id = ? LIMIT 1', [id]);
  if (!rows[0]) return null;
  return fmtCoupon(rows[0], { categories: await _getCouponCategories(id), products: await _getCouponProducts(id) });
}

async function findCouponByCode(code) {
  const [rows] = await pool.query('SELECT * FROM coupons WHERE code = ? LIMIT 1', [code]);
  if (!rows[0]) return null;
  return fmtCoupon(rows[0], { categories: await _getCouponCategories(rows[0].id), products: await _getCouponProducts(rows[0].id) });
}

async function createCoupon(data) {
  const [result] = await pool.query(
    `INSERT INTO coupons
       (code, description, discount_type, discount_value, min_purchase_amount, max_discount_amount,
        start_date, end_date, usage_limit, usage_per_customer, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.code.toUpperCase(), data.description || '', data.discountType, data.discountValue,
      data.minPurchaseAmount || 0, data.maxDiscountAmount || 0,
      data.startDate || null, data.endDate || null,
      data.usageLimit || 0, data.usagePerCustomer || 1, data.isActive !== false ? 1 : 0,
    ]
  );
  const couponId = result.insertId;
  await _syncCouponRelations(couponId, data.applicableCategories, data.applicableProducts);
  return findCouponById(couponId);
}

async function updateCoupon(id, data) {
  const colMap = {
    code: 'code', description: 'description', discountType: 'discount_type', discountValue: 'discount_value',
    minPurchaseAmount: 'min_purchase_amount', maxDiscountAmount: 'max_discount_amount',
    startDate: 'start_date', endDate: 'end_date', usageLimit: 'usage_limit',
    usagePerCustomer: 'usage_per_customer', isActive: 'is_active', usedCount: 'used_count',
  };
  const sets = [];
  const vals = [];
  for (const [js, col] of Object.entries(colMap)) {
    if (data[js] !== undefined) { sets.push(`${col} = ?`); vals.push(js === 'isActive' ? (data[js] ? 1 : 0) : data[js]); }
  }
  if (sets.length) { vals.push(id); await pool.query(`UPDATE coupons SET ${sets.join(', ')} WHERE id = ?`, vals); }
  if (data.applicableCategories !== undefined || data.applicableProducts !== undefined) {
    await _syncCouponRelations(id, data.applicableCategories, data.applicableProducts);
  }
  return findCouponById(id);
}

async function _syncCouponRelations(couponId, categories, products) {
  if (categories !== undefined) {
    await pool.query('DELETE FROM coupon_categories WHERE coupon_id = ?', [couponId]);
    if (categories?.length) {
      await pool.query('INSERT INTO coupon_categories (coupon_id, category_id) VALUES ?', [categories.map(c => [couponId, c])]);
    }
  }
  if (products !== undefined) {
    await pool.query('DELETE FROM coupon_products WHERE coupon_id = ?', [couponId]);
    if (products?.length) {
      await pool.query('INSERT INTO coupon_products (coupon_id, product_id) VALUES ?', [products.map(p => [couponId, p])]);
    }
  }
}

async function deleteCoupon(id) {
  await pool.query('DELETE FROM coupons WHERE id = ?', [id]);
}

async function incrementCouponUsage(id) {
  await pool.query('UPDATE coupons SET used_count = used_count + 1 WHERE id = ?', [id]);
}

// =====================================================================
// Flash Sales
// =====================================================================

function fmtFlashSale(row, { products = [], categories = [] } = {}) {
  if (!row) return null;
  return {
    _id:                row.id,
    title:              row.title,
    description:        row.description,
    discountType:       row.discount_type,
    discountValue:      Number(row.discount_value),
    startDate:          row.start_date,
    endDate:            row.end_date,
    minPurchaseAmount:  Number(row.min_purchase_amount),
    badge:              row.badge,
    isActive:           !!row.is_active,
    applicableProducts:   products,
    applicableCategories: categories,
    createdAt:          row.created_at,
    updatedAt:          row.updated_at,
  };
}

async function findAllFlashSales({ page = 1, limit = 20, isActive } = {}) {
  const where  = isActive !== undefined ? 'WHERE is_active = ?' : '';
  const params = isActive !== undefined ? [isActive ? 1 : 0] : [];
  const offset = (page - 1) * limit;
  const [rows] = await pool.query(`SELECT * FROM flash_sales ${where} ORDER BY start_date DESC LIMIT ? OFFSET ?`, [...params, limit, offset]);
  const [countRows] = await pool.query(`SELECT COUNT(*) AS total FROM flash_sales ${where}`, params);
  const sales = await Promise.all(rows.map(async r => fmtFlashSale(r, {
    products:   (await pool.query('SELECT product_id FROM flash_sale_products WHERE flash_sale_id = ?', [r.id]))[0].map(x => x.product_id),
    categories: (await pool.query('SELECT category_id FROM flash_sale_categories WHERE flash_sale_id = ?', [r.id]))[0].map(x => x.category_id),
  })));
  return { flashSales: sales, total: countRows[0].total };
}

async function findFlashSaleById(id) {
  const [rows] = await pool.query('SELECT * FROM flash_sales WHERE id = ? LIMIT 1', [id]);
  if (!rows[0]) return null;
  const [products, categories] = await Promise.all([
    pool.query('SELECT product_id FROM flash_sale_products WHERE flash_sale_id = ?', [id]),
    pool.query('SELECT category_id FROM flash_sale_categories WHERE flash_sale_id = ?', [id]),
  ]);
  return fmtFlashSale(rows[0], { products: products[0].map(x => x.product_id), categories: categories[0].map(x => x.category_id) });
}

async function createFlashSale(data) {
  const [result] = await pool.query(
    `INSERT INTO flash_sales (title, description, discount_type, discount_value, start_date, end_date, min_purchase_amount, badge, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [data.title, data.description || '', data.discountType, data.discountValue,
     data.startDate, data.endDate, data.minPurchaseAmount || 0, data.badge || '', data.isActive !== false ? 1 : 0]
  );
  const saleId = result.insertId;
  await _syncFlashSaleRelations(saleId, data.applicableProducts, data.applicableCategories);
  return findFlashSaleById(saleId);
}

async function updateFlashSale(id, data) {
  const colMap = {
    title: 'title', description: 'description', discountType: 'discount_type', discountValue: 'discount_value',
    startDate: 'start_date', endDate: 'end_date', minPurchaseAmount: 'min_purchase_amount',
    badge: 'badge', isActive: 'is_active',
  };
  const sets = [];
  const vals = [];
  for (const [js, col] of Object.entries(colMap)) {
    if (data[js] !== undefined) { sets.push(`${col} = ?`); vals.push(js === 'isActive' ? (data[js] ? 1 : 0) : data[js]); }
  }
  if (sets.length) { vals.push(id); await pool.query(`UPDATE flash_sales SET ${sets.join(', ')} WHERE id = ?`, vals); }
  await _syncFlashSaleRelations(id, data.applicableProducts, data.applicableCategories);
  return findFlashSaleById(id);
}

async function _syncFlashSaleRelations(saleId, products, categories) {
  if (products !== undefined) {
    await pool.query('DELETE FROM flash_sale_products WHERE flash_sale_id = ?', [saleId]);
    if (products?.length) await pool.query('INSERT INTO flash_sale_products (flash_sale_id, product_id) VALUES ?', [products.map(p => [saleId, p])]);
  }
  if (categories !== undefined) {
    await pool.query('DELETE FROM flash_sale_categories WHERE flash_sale_id = ?', [saleId]);
    if (categories?.length) await pool.query('INSERT INTO flash_sale_categories (flash_sale_id, category_id) VALUES ?', [categories.map(c => [saleId, c])]);
  }
}

async function deleteFlashSale(id) {
  await pool.query('DELETE FROM flash_sales WHERE id = ?', [id]);
}

// =====================================================================
// Email Campaigns
// =====================================================================

function fmtCampaign(row) {
  if (!row) return null;
  return {
    _id: row.id, title: row.title, subject: row.subject, body: row.body,
    audience: row.audience, status: row.status, scheduledAt: row.scheduled_at,
    sentAt: row.sent_at, sentCount: row.sent_count,
    createdAt: row.created_at, updatedAt: row.updated_at,
  };
}

async function findAllCampaigns({ page = 1, limit = 20 } = {}) {
  const offset = (page - 1) * limit;
  const [rows] = await pool.query('SELECT * FROM email_campaigns ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
  const [countRows] = await pool.query('SELECT COUNT(*) AS total FROM email_campaigns');
  return { campaigns: rows.map(fmtCampaign), total: countRows[0].total };
}

async function findCampaignById(id) {
  const [rows] = await pool.query('SELECT * FROM email_campaigns WHERE id = ? LIMIT 1', [id]);
  return fmtCampaign(rows[0]);
}

async function createCampaign(data) {
  const [result] = await pool.query(
    'INSERT INTO email_campaigns (title, subject, body, audience, status, scheduled_at) VALUES (?, ?, ?, ?, ?, ?)',
    [data.title, data.subject, data.body, data.audience || 'all', data.status || 'draft', data.scheduledAt || null]
  );
  return findCampaignById(result.insertId);
}

async function updateCampaign(id, data) {
  const colMap = {
    title: 'title', subject: 'subject', body: 'body', audience: 'audience',
    status: 'status', scheduledAt: 'scheduled_at', sentAt: 'sent_at', sentCount: 'sent_count',
  };
  const sets = [];
  const vals = [];
  for (const [js, col] of Object.entries(colMap)) {
    if (data[js] !== undefined) { sets.push(`${col} = ?`); vals.push(data[js]); }
  }
  if (sets.length) { vals.push(id); await pool.query(`UPDATE email_campaigns SET ${sets.join(', ')} WHERE id = ?`, vals); }
  return findCampaignById(id);
}

async function deleteCampaign(id) {
  await pool.query('DELETE FROM email_campaigns WHERE id = ?', [id]);
}

async function getMarketingStats() {
  const [[coupons], [activeSales], [campaigns]] = await Promise.all([
    pool.query('SELECT COUNT(*) AS total, SUM(used_count) AS totalUsed FROM coupons WHERE is_active = 1'),
    pool.query('SELECT COUNT(*) AS count FROM flash_sales WHERE is_active = 1 AND start_date <= NOW() AND end_date >= NOW()'),
    pool.query('SELECT status, COUNT(*) AS count FROM email_campaigns GROUP BY status'),
  ]);
  return { coupons: coupons[0], activeFlashSales: activeSales[0].count, campaigns: campaigns[0] };
}

module.exports = {
  findAllCoupons, findCouponById, findCouponByCode, createCoupon, updateCoupon, deleteCoupon, incrementCouponUsage,
  findAllFlashSales, findFlashSaleById, createFlashSale, updateFlashSale, deleteFlashSale,
  findAllCampaigns, findCampaignById, createCampaign, updateCampaign, deleteCampaign,
  getMarketingStats,
};

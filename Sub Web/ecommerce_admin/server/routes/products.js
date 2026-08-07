const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// ─── HELPERS ─────────────────────────────────────────────────────────────────

async function getProductImages(productId) {
  const [rows] = await pool.query(
    'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC',
    [productId]
  );
  return rows.map(r => r.image_url);
}

async function getProductTags(productId) {
  const [rows] = await pool.query('SELECT tag FROM product_tags WHERE product_id = ?', [productId]);
  return rows.map(r => r.tag);
}

async function fmtProduct(row, fetchExtras = true) {
  if (!row) return null;
  const images = fetchExtras ? await getProductImages(row.id) : [];
  const tags   = fetchExtras ? await getProductTags(row.id)   : [];
  return {
    _id:           row.id,
    name:          row.name,
    nameBn:        row.name_bn || null,
    slug:          row.slug,
    description:   row.description,
    descriptionBn: row.description_bn || null,
    shortDescription: row.short_description,
    shortDescriptionBn: row.short_description_bn || null,
    categoryId:    row.category_id ? { _id: String(row.category_id), name: row.category_name || null, slug: row.category_slug || null } : null,
    categorySlug:  row.category_slug || null,
    regularPrice:  row.regular_price,
    salePrice:     row.sale_price,
    price:         row.regular_price,
    sku:           row.sku,
    stock:         row.stock,
    thumbnail:     row.thumbnail,
    images,
    tags,
    attributes:    row.attributes ? (typeof row.attributes === 'string' ? JSON.parse(row.attributes) : row.attributes) : null,
    status:        row.status,
    featured:      !!row.featured,
    isNew:         !!row.is_new,
    onSale:        !!row.on_sale,
    shippingClass: row.shipping_class,
    shippingCharge: row.shipping_charge,
    visibility:    row.visibility,
    lowStockThreshold: row.low_stock_threshold,
    createdAt:     row.created_at,
    updatedAt:     row.updated_at,
  };
}

async function getUniqueSlug(baseSlug, excludeId = null) {
  let slug = baseSlug, counter = 1;
  while (true) {
    const sql    = excludeId
      ? 'SELECT id FROM products WHERE slug = ? AND id != ? LIMIT 1'
      : 'SELECT id FROM products WHERE slug = ? LIMIT 1';
    const params = excludeId ? [slug, excludeId] : [slug];
    const [rows] = await pool.query(sql, params);
    if (!rows.length) return slug;
    slug = `${baseSlug}-${counter++}`;
  }
}

async function getUniqueSku(baseSku, excludeId = null) {
  let sku = baseSku, counter = 1;
  while (true) {
    const sql    = excludeId
      ? 'SELECT id FROM products WHERE sku = ? AND id != ? LIMIT 1'
      : 'SELECT id FROM products WHERE sku = ? LIMIT 1';
    const params = excludeId ? [sku, excludeId] : [sku];
    const [rows] = await pool.query(sql, params);
    if (!rows.length) return sku;
    sku = `${baseSku}-${counter++}`;
  }
}

function normaliseStatus(status) {
  if (status === 'published') return 'active';
  if (status === 'archived')  return 'draft';
  return status;
}

async function saveImages(conn, productId, images) {
  await conn.query('DELETE FROM product_images WHERE product_id = ?', [productId]);
  if (images && images.length) {
    const vals = images.map((url, i) => [productId, url, i]);
    await conn.query('INSERT INTO product_images (product_id, image_url, sort_order) VALUES ?', [vals]);
  }
}

async function saveTags(conn, productId, tags) {
  await conn.query('DELETE FROM product_tags WHERE product_id = ?', [productId]);
  if (tags && tags.length) {
    const vals = [...new Set(tags)].map(t => [productId, t]);
    await conn.query('INSERT INTO product_tags (product_id, tag) VALUES ?', [vals]);
  }
}

// ─── PUBLIC ROUTES ────────────────────────────────────────────────────────────

router.get('/public', async (req, res) => {
  try {
    const { category, search, featured, limit = 50, page = 1, sort = '-createdAt', onSale } = req.query;
    const conditions = ["p.status IN ('active','published')"];
    const params = [];

    if (category) {
      const [[cat]] = await pool.query('SELECT id FROM categories WHERE slug = ? LIMIT 1', [category]);
      if (!cat) {
        return res.json({ products: [], pagination: { total: 0, page: 1, pages: 0 } });
      }
      // Recursively collect all descendant category IDs
      const [allDesc] = await pool.query(
        `WITH RECURSIVE subtree AS (
           SELECT id FROM categories WHERE id = ?
           UNION ALL
           SELECT c.id FROM categories c INNER JOIN subtree s ON c.parent_id = s.id
         ) SELECT id FROM subtree`,
        [cat.id]
      );
      const catIds = allDesc.map(r => r.id);
      conditions.push(`p.category_id IN (${catIds.map(() => '?').join(',')})`);
      params.push(...catIds);
    }

    if (search) {
      conditions.push('(p.name LIKE ? OR p.name_bn LIKE ? OR EXISTS (SELECT 1 FROM product_tags pt WHERE pt.product_id = p.id AND pt.tag LIKE ?))');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (featured === 'true') { conditions.push('p.featured = 1'); }
    if (onSale === 'true')   { conditions.push('p.sale_price IS NOT NULL AND p.sale_price > 0'); }

    const where = 'WHERE ' + conditions.join(' AND ');

    const sortMap = {
      '-createdAt':  'p.created_at DESC',
      'price_asc':   'p.regular_price ASC',
      'price_desc':  'p.regular_price DESC',
      'name':        'p.name ASC',
    };
    const orderBy = sortMap[sort] || 'p.created_at DESC';

    const pageNum  = parseInt(page);
    const limitNum = parseInt(limit);
    const offset   = (pageNum - 1) * limitNum;

    const [products] = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
       ${where} ORDER BY ${orderBy} LIMIT ? OFFSET ?`,
      [...params, limitNum, offset]
    );

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM products p ${where}`, params
    );

    const formatted = [];
    for (const p of products) {
      formatted.push(await fmtProduct(p, true));
    }

    res.json({
      products: formatted,
      pagination: { total, page: pageNum, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/public/slug/:slug', async (req, res) => {
  try {
    const [[row]] = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.slug = ? AND p.status IN ('active','published') LIMIT 1`,
      [req.params.slug]
    );
    if (!row) return res.status(404).json({ message: 'Product not found' });

    const product = await fmtProduct(row, true);

    // Related / upsell / crosssell
    const [relRows] = await pool.query(
      `SELECT p.id, p.name, p.slug, p.regular_price, p.sale_price, p.thumbnail
       FROM product_related pr JOIN products p ON p.id = pr.related_product_id
       WHERE pr.product_id = ?`, [row.id]
    );
    const [upRows] = await pool.query(
      `SELECT p.id, p.name, p.slug, p.regular_price, p.sale_price, p.thumbnail
       FROM product_upsell pu JOIN products p ON p.id = pu.upsell_product_id
       WHERE pu.product_id = ?`, [row.id]
    );
    const [csRows] = await pool.query(
      `SELECT p.id, p.name, p.slug, p.regular_price, p.sale_price, p.thumbnail
       FROM product_crosssell pc JOIN products p ON p.id = pc.crosssell_product_id
       WHERE pc.product_id = ?`, [row.id]
    );

    product.relatedProducts    = relRows.map(r => ({ _id: r.id, name: r.name, slug: r.slug, regularPrice: r.regular_price, salePrice: r.sale_price, thumbnail: r.thumbnail }));
    product.upsellProducts     = upRows.map(r => ({ _id: r.id, name: r.name, slug: r.slug, regularPrice: r.regular_price, salePrice: r.sale_price, thumbnail: r.thumbnail }));
    product.crossSellProducts  = csRows.map(r => ({ _id: r.id, name: r.name, slug: r.slug, regularPrice: r.regular_price, salePrice: r.sale_price, thumbnail: r.thumbnail }));

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

async function publicList(res, extraWhere = '', extraParams = [], sort = 'p.created_at DESC', limit = 12) {
  try {
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug
       FROM products p LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.status IN ('active','published') ${extraWhere}
       ORDER BY ${sort} LIMIT ?`,
      [...extraParams, parseInt(limit)]
    );
    const products = [];
    for (const r of rows) products.push(await fmtProduct(r, true));
    return products;
  } catch (error) {
    res.status(500).json({ message: error.message });
    return null;
  }
}

router.get('/featured/list', async (req, res) => {
  const products = await publicList(res, 'AND p.featured = 1', [], 'p.created_at DESC', req.query.limit || 12);
  if (products) res.json({ products });
});

router.get('/best-sellers/list', async (req, res) => {
  const products = await publicList(res, '', [], 'p.featured DESC, p.created_at DESC', req.query.limit || 12);
  if (products) res.json({ products });
});

router.get('/deals/list', async (req, res) => {
  const products = await publicList(res, 'AND p.sale_price IS NOT NULL AND p.sale_price > 0', [], 'p.created_at DESC', req.query.limit || 12);
  if (products) res.json({ products });
});

router.get('/new-arrivals/list', async (req, res) => {
  const products = await publicList(res, '', [], 'p.created_at DESC', req.query.limit || 12);
  if (products) res.json({ products });
});

// ─── AUTHENTICATED ADMIN ROUTES ───────────────────────────────────────────────

router.get('/', authMiddleware, async (req, res) => {
  try {
    const { category, status, search } = req.query;
    const conditions = [];
    const params = [];

    if (category) { conditions.push('p.category_id = ?'); params.push(category); }
    if (status)   { conditions.push('p.status = ?');      params.push(status); }
    if (search) {
      conditions.push('(p.name LIKE ? OR p.name_bn LIKE ? OR p.sku LIKE ?)');
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const [rows] = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       ${where} ORDER BY p.created_at DESC`,
      params
    );

    const formatted = [];
    for (const r of rows) formatted.push(await fmtProduct(r, true));
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [[row]] = await pool.query(
      `SELECT p.*, c.name AS category_name, c.slug AS category_slug FROM products p
       LEFT JOIN categories c ON c.id = p.category_id
       WHERE p.id = ? LIMIT 1`,
      [req.params.id]
    );
    if (!row) return res.status(404).json({ message: 'Product not found' });
    res.json(await fmtProduct(row, true));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/', authMiddleware, async (req, res) => {
  try {
    let { name, nameBn = '', slug, description = '', descriptionBn = '', shortDescription = '', shortDescriptionBn = '', categoryId, regularPrice, salePrice, sku, stock = 0, thumbnail = '', images = [], tags = [], attributes, status = 'active', featured = false, isNew = false, onSale = false, shippingClass = 'standard', shippingCharge = 0, visibility = 'visible', lowStockThreshold = 5 } = req.body;

    if (!name) return res.status(400).json({ message: 'Product name is required.' });
    if (!sku)  return res.status(400).json({ message: 'SKU is required.' });
    if (!categoryId) return res.status(400).json({ message: 'Category is required.' });

    if (!slug) slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    if (slug) slug = await getUniqueSlug(slug);
    if (sku)  sku  = await getUniqueSku(sku);
    if (status) status = normaliseStatus(status);
    if (!thumbnail && images.length) thumbnail = images[0];
    const attributesJSON = attributes ? JSON.stringify(attributes) : null;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const [result] = await conn.query(
        `INSERT INTO products (name, name_bn, slug, description, description_bn, short_description, short_description_bn, category_id, regular_price, sale_price, sku, stock, thumbnail, attributes, status, featured, is_new, on_sale, shipping_class, shipping_charge, visibility, low_stock_threshold)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, nameBn || null, slug, description, descriptionBn || null, shortDescription, shortDescriptionBn || null, categoryId || null, regularPrice || 0, salePrice || null, sku, stock, thumbnail, attributesJSON, status, featured ? 1 : 0, isNew ? 1 : 0, onSale ? 1 : 0, shippingClass, shippingCharge, visibility, lowStockThreshold]
      );

      await saveImages(conn, result.insertId, images);
      await saveTags(conn, result.insertId, tags);
      await conn.commit();

      const [[saved]] = await pool.query(
        'SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = ?',
        [result.insertId]
      );
      res.status(201).json(await fmtProduct(saved, true));
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const field = error.message.includes('slug') ? 'slug' : 'sku';
      return res.status(400).json({ message: `Duplicate value for ${field}. Please use a different value.` });
    }
    res.status(400).json({ message: error.message });
  }
});

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    let { name, nameBn, slug, description, descriptionBn, shortDescription, shortDescriptionBn, categoryId, regularPrice, salePrice, sku, stock, thumbnail, images, tags, attributes, status, featured, isNew, onSale, shippingClass, shippingCharge, visibility, lowStockThreshold } = req.body;

    if (slug)   slug   = await getUniqueSlug(slug, req.params.id);
    if (sku)    sku    = await getUniqueSku(sku, req.params.id);
    if (status) status = normaliseStatus(status);
    if (!thumbnail && images && images.length) thumbnail = images[0];

    const fields = {};
    if (name !== undefined)              fields.name              = name;
    if (nameBn !== undefined)            fields.name_bn           = nameBn || null;
    if (slug !== undefined)              fields.slug              = slug;
    if (description !== undefined)       fields.description       = description;
    if (descriptionBn !== undefined)     fields.description_bn    = descriptionBn || null;
    if (shortDescription !== undefined)  fields.short_description = shortDescription;
    if (shortDescriptionBn !== undefined) fields.short_description_bn = shortDescriptionBn || null;
    if (categoryId !== undefined)        fields.category_id       = categoryId || null;
    if (regularPrice !== undefined)      fields.regular_price     = regularPrice;
    if (salePrice !== undefined)         fields.sale_price        = salePrice || null;
    if (sku !== undefined)               fields.sku               = sku;
    if (stock !== undefined)             fields.stock             = stock;
    if (thumbnail !== undefined)         fields.thumbnail         = thumbnail;
    if (attributes !== undefined)        fields.attributes        = attributes ? JSON.stringify(attributes) : null;
    if (status !== undefined)            fields.status            = status;
    if (featured !== undefined)          fields.featured          = featured ? 1 : 0;
    if (isNew !== undefined)             fields.is_new            = isNew ? 1 : 0;
    if (onSale !== undefined)            fields.on_sale           = onSale ? 1 : 0;
    if (shippingClass !== undefined)     fields.shipping_class    = shippingClass;
    if (shippingCharge !== undefined)    fields.shipping_charge   = shippingCharge;
    if (visibility !== undefined)        fields.visibility        = visibility;
    if (lowStockThreshold !== undefined) fields.low_stock_threshold = lowStockThreshold;

    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      if (Object.keys(fields).length) {
        const setClauses = Object.keys(fields).map(k => `${k} = ?`).join(', ');
        await conn.query(`UPDATE products SET ${setClauses} WHERE id = ?`, [...Object.values(fields), req.params.id]);
      }

      if (Array.isArray(images)) await saveImages(conn, req.params.id, images);
      if (Array.isArray(tags))   await saveTags(conn, req.params.id, tags);

      await conn.commit();
    } catch (err) {
      await conn.rollback();
      throw err;
    } finally {
      conn.release();
    }

    const [[saved]] = await pool.query(
      'SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = ?',
      [req.params.id]
    );
    if (!saved) return res.status(404).json({ message: 'Product not found' });
    res.json(await fmtProduct(saved, true));
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') {
      const field = error.message.includes('slug') ? 'slug' : 'sku';
      return res.status(400).json({ message: `Duplicate value for ${field}. Please use a different value.` });
    }
    res.status(400).json({ message: error.message });
  }
});

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [[prod]] = await pool.query('SELECT id FROM products WHERE id = ? LIMIT 1', [req.params.id]);
    if (!prod) return res.status(404).json({ message: 'Product not found' });
    await pool.query('DELETE FROM products WHERE id = ?', [req.params.id]);
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/bulk-delete', authMiddleware, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ message: 'No ids provided' });
    const placeholders = ids.map(() => '?').join(',');
    await pool.query(`DELETE FROM products WHERE id IN (${placeholders})`, ids);
    res.json({ message: `${ids.length} products deleted` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/bulk-update', authMiddleware, async (req, res) => {
  try {
    const { ids, status } = req.body;
    if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ message: 'No ids provided' });
    const placeholders = ids.map(() => '?').join(',');
    await pool.query(`UPDATE products SET status = ? WHERE id IN (${placeholders})`, [status, ...ids]);
    res.json({ message: `${ids.length} products updated` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.patch('/:id/stock', authMiddleware, async (req, res) => {
  try {
    const { stock } = req.body;
    await pool.query('UPDATE products SET stock = ? WHERE id = ?', [stock, req.params.id]);
    const [[saved]] = await pool.query(
      'SELECT p.*, c.name AS category_name FROM products p LEFT JOIN categories c ON c.id = p.category_id WHERE p.id = ?',
      [req.params.id]
    );
    if (!saved) return res.status(404).json({ message: 'Product not found' });
    res.json(await fmtProduct(saved, true));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;

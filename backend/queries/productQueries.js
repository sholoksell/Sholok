const pool = require('../db');

function fmt(row, { images = [], tags = [], variants = [] } = {}) {
  if (!row) return null;
  return {
    _id:                  row.id,
    name:                 row.name,
    slug:                 row.slug,
    description:          row.description,
    shortDescription:     row.short_description,
    categoryId:           row.category_id,
    regularPrice:         Number(row.regular_price),
    salePrice:            row.sale_price != null ? Number(row.sale_price) : null,
    sku:                  row.sku,
    stock:                row.stock,
    images,
    thumbnail:            row.thumbnail,
    variants,
    status:               row.status,
    featured:             !!row.featured,
    isNew:                !!row.is_new,
    onSale:               !!row.on_sale,
    tags,
    scheduledPublishDate: row.scheduled_publish_date,
    availabilityDate:     row.availability_date,
    shippingClass:        row.shipping_class,
    shippingCharge:       Number(row.shipping_charge),
    visibility:           row.visibility,
    lowStockThreshold:    row.low_stock_threshold,
    createdAt:            row.created_at,
    updatedAt:            row.updated_at,
  };
}

async function _getImages(productId) {
  const [rows] = await pool.query(
    'SELECT image_url FROM product_images WHERE product_id = ? ORDER BY sort_order ASC',
    [productId]
  );
  return rows.map(r => r.image_url);
}

async function _getTags(productId) {
  const [rows] = await pool.query(
    'SELECT tag FROM product_tags WHERE product_id = ?',
    [productId]
  );
  return rows.map(r => r.tag);
}

async function _getVariants(productId) {
  const [variants] = await pool.query(
    'SELECT * FROM product_variants WHERE product_id = ?',
    [productId]
  );
  for (const v of variants) {
    const [attrs] = await pool.query(
      'SELECT attr_key, attr_value FROM variant_attributes WHERE variant_id = ?',
      [v.id]
    );
    v.attributes = Object.fromEntries(attrs.map(a => [a.attr_key, a.attr_value]));
  }
  return variants.map(v => ({
    _id: v.id, name: v.name, sku: v.sku,
    price: v.price != null ? Number(v.price) : null,
    salePrice: v.sale_price != null ? Number(v.sale_price) : null,
    stock: v.stock, attributes: v.attributes,
  }));
}

async function _loadRelations(productId) {
  const [images, tags, variants] = await Promise.all([
    _getImages(productId), _getTags(productId), _getVariants(productId),
  ]);
  return { images, tags, variants };
}

async function findAll({
  page = 1, limit = 20, search, categoryId, status, featured, onSale, visibility, sort = 'created_at', order = 'DESC',
} = {}) {
  const conditions = [];
  const params = [];

  if (search)     { conditions.push('(p.name LIKE ? OR p.sku LIKE ? OR p.slug LIKE ?)'); params.push(`%${search}%`, `%${search}%`, `%${search}%`); }
  if (categoryId) { conditions.push('p.category_id = ?'); params.push(categoryId); }
  if (status)     { conditions.push('p.status = ?'); params.push(status); }
  if (featured !== undefined) { conditions.push('p.featured = ?'); params.push(featured ? 1 : 0); }
  if (onSale !== undefined)   { conditions.push('p.on_sale = ?'); params.push(onSale ? 1 : 0); }
  if (visibility) { conditions.push('p.visibility = ?'); params.push(visibility); }

  const where  = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const offset = (page - 1) * limit;
  const safeSort  = ['name','regular_price','sale_price','stock','created_at','updated_at'].includes(sort) ? sort : 'created_at';
  const safeOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  const [rows] = await pool.query(
    `SELECT p.* FROM products p ${where} ORDER BY p.${safeSort} ${safeOrder} LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM products p ${where}`, params
  );

  const products = await Promise.all(rows.map(async row => {
    const rel = await _loadRelations(row.id);
    return fmt(row, rel);
  }));

  return { products, total: countRows[0].total };
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM products WHERE id = ? LIMIT 1', [id]);
  if (!rows[0]) return null;
  const rel = await _loadRelations(rows[0].id);
  return fmt(rows[0], rel);
}

async function findBySlug(slug) {
  const [rows] = await pool.query('SELECT * FROM products WHERE slug = ? LIMIT 1', [slug]);
  if (!rows[0]) return null;
  const rel = await _loadRelations(rows[0].id);
  return fmt(rows[0], rel);
}

async function findFeatured(limit = 12) {
  const [rows] = await pool.query(
    'SELECT * FROM products WHERE featured = 1 AND status = "active" AND visibility = "visible" ORDER BY created_at DESC LIMIT ?',
    [limit]
  );
  return Promise.all(rows.map(async row => fmt(row, await _loadRelations(row.id))));
}

async function findBestSellers(limit = 12) {
  const [rows] = await pool.query(
    `SELECT p.*, COALESCE(SUM(oi.quantity), 0) AS sold
     FROM products p
     LEFT JOIN order_items oi ON oi.product_id = p.id
     WHERE p.status = 'active' AND p.visibility = 'visible'
     GROUP BY p.id ORDER BY sold DESC LIMIT ?`,
    [limit]
  );
  return Promise.all(rows.map(async row => fmt(row, await _loadRelations(row.id))));
}

async function findDeals(limit = 12) {
  const [rows] = await pool.query(
    'SELECT * FROM products WHERE on_sale = 1 AND status = "active" AND visibility = "visible" ORDER BY created_at DESC LIMIT ?',
    [limit]
  );
  return Promise.all(rows.map(async row => fmt(row, await _loadRelations(row.id))));
}

async function findNewArrivals(limit = 12) {
  const [rows] = await pool.query(
    'SELECT * FROM products WHERE is_new = 1 AND status = "active" AND visibility = "visible" ORDER BY created_at DESC LIMIT ?',
    [limit]
  );
  return Promise.all(rows.map(async row => fmt(row, await _loadRelations(row.id))));
}

async function create(data) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [result] = await conn.query(
      `INSERT INTO products
         (name, slug, description, short_description, category_id,
          regular_price, sale_price, sku, stock, thumbnail, status,
          featured, is_new, on_sale, scheduled_publish_date, availability_date,
          shipping_class, shipping_charge, visibility, low_stock_threshold)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.name, data.slug, data.description || '', data.shortDescription || '',
        data.categoryId, data.regularPrice, data.salePrice ?? null,
        data.sku, data.stock ?? 0, data.thumbnail || '',
        data.status || 'active', data.featured ? 1 : 0, data.isNew ? 1 : 0, data.onSale ? 1 : 0,
        data.scheduledPublishDate || null, data.availabilityDate || null,
        data.shippingClass || 'standard', data.shippingCharge ?? 0,
        data.visibility || 'visible', data.lowStockThreshold ?? 5,
      ]
    );
    const productId = result.insertId;

    if (data.images?.length) {
      await conn.query(
        'INSERT INTO product_images (product_id, image_url, sort_order) VALUES ?',
        [data.images.map((url, i) => [productId, url, i])]
      );
    }
    if (data.tags?.length) {
      await conn.query(
        'INSERT INTO product_tags (product_id, tag) VALUES ?',
        [data.tags.map(t => [productId, t])]
      );
    }
    if (data.variants?.length) {
      for (const v of data.variants) {
        const [vRes] = await conn.query(
          'INSERT INTO product_variants (product_id, name, sku, price, sale_price, stock) VALUES (?, ?, ?, ?, ?, ?)',
          [productId, v.name, v.sku || null, v.price || null, v.salePrice || null, v.stock || 0]
        );
        if (v.attributes && Object.keys(v.attributes).length) {
          const attrRows = Object.entries(v.attributes).map(([k, val]) => [vRes.insertId, k, val]);
          await conn.query('INSERT INTO variant_attributes (variant_id, attr_key, attr_value) VALUES ?', [attrRows]);
        }
      }
    }

    await conn.commit();
    return findById(productId);
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

async function update(id, data) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const colMap = {
      name: 'name', slug: 'slug', description: 'description', shortDescription: 'short_description',
      categoryId: 'category_id', regularPrice: 'regular_price', salePrice: 'sale_price',
      sku: 'sku', stock: 'stock', thumbnail: 'thumbnail', status: 'status',
      featured: 'featured', isNew: 'is_new', onSale: 'on_sale',
      scheduledPublishDate: 'scheduled_publish_date', availabilityDate: 'availability_date',
      shippingClass: 'shipping_class', shippingCharge: 'shipping_charge',
      visibility: 'visibility', lowStockThreshold: 'low_stock_threshold',
    };
    const boolFields = new Set(['featured', 'isNew', 'onSale']);
    const sets = [];
    const vals = [];

    for (const [jsKey, dbCol] of Object.entries(colMap)) {
      if (data[jsKey] !== undefined) {
        sets.push(`${dbCol} = ?`);
        vals.push(boolFields.has(jsKey) ? (data[jsKey] ? 1 : 0) : data[jsKey]);
      }
    }
    if (sets.length) {
      vals.push(id);
      await conn.query(`UPDATE products SET ${sets.join(', ')} WHERE id = ?`, vals);
    }

    if (data.images !== undefined) {
      await conn.query('DELETE FROM product_images WHERE product_id = ?', [id]);
      if (data.images.length) {
        await conn.query(
          'INSERT INTO product_images (product_id, image_url, sort_order) VALUES ?',
          [data.images.map((url, i) => [id, url, i])]
        );
      }
    }
    if (data.tags !== undefined) {
      await conn.query('DELETE FROM product_tags WHERE product_id = ?', [id]);
      if (data.tags.length) {
        await conn.query('INSERT INTO product_tags (product_id, tag) VALUES ?', [data.tags.map(t => [id, t])]);
      }
    }
    if (data.variants !== undefined) {
      await conn.query('DELETE FROM product_variants WHERE product_id = ?', [id]);
      for (const v of data.variants) {
        const [vRes] = await conn.query(
          'INSERT INTO product_variants (product_id, name, sku, price, sale_price, stock) VALUES (?, ?, ?, ?, ?, ?)',
          [id, v.name, v.sku || null, v.price || null, v.salePrice || null, v.stock || 0]
        );
        if (v.attributes && Object.keys(v.attributes).length) {
          const attrRows = Object.entries(v.attributes).map(([k, val]) => [vRes.insertId, k, val]);
          await conn.query('INSERT INTO variant_attributes (variant_id, attr_key, attr_value) VALUES ?', [attrRows]);
        }
      }
    }

    await conn.commit();
    return findById(id);
  } catch (e) {
    await conn.rollback();
    throw e;
  } finally {
    conn.release();
  }
}

async function updateStock(id, stock) {
  await pool.query('UPDATE products SET stock = ? WHERE id = ?', [stock, id]);
  return findById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM products WHERE id = ?', [id]);
}

async function bulkDelete(ids) {
  if (!ids.length) return;
  const ph = ids.map(() => '?').join(', ');
  await pool.query(`DELETE FROM products WHERE id IN (${ph})`, ids);
}

module.exports = {
  findAll, findById, findBySlug, findFeatured, findBestSellers,
  findDeals, findNewArrivals, create, update, updateStock, remove, bulkDelete,
};

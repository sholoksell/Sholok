const pool = require('../db');

function fmtItem(row) {
  return {
    _id:           row.id,
    productId:     row.product_id,
    name:          row.name,
    nameBn:        row.name_bn,
    slug:          row.slug,
    image:         row.image,
    price:         Number(row.price),
    comparePrice:  Number(row.compare_price),
    unit:          row.unit,
    badge:         row.badge,
    minQty:        row.min_qty,
    description:   row.description,
    descriptionBn: row.description_bn,
    link:          row.link,
    order:         row.sort_order,
    isActive:      !!row.is_active,
  };
}

function fmt(row, products = []) {
  if (!row) return null;
  return {
    _id:             row.id,
    key:             row.section_key,
    title:           row.title,
    titleBn:         row.title_bn,
    subtitle:        row.subtitle,
    subtitleBn:      row.subtitle_bn,
    description:     row.description,
    descriptionBn:   row.description_bn,
    icon:            row.icon,
    layout:          row.layout,
    accentColor:     row.accent_color,
    backgroundColor: row.background_color,
    bannerImage:     row.banner_image,
    order:           row.sort_order,
    isActive:        !!row.is_active,
    products,
    createdAt:       row.created_at,
    updatedAt:       row.updated_at,
  };
}

async function _getItems(sectionId) {
  const [rows] = await pool.query(
    'SELECT * FROM home_section_items WHERE section_id = ? ORDER BY sort_order ASC',
    [sectionId]
  );
  return rows.map(fmtItem);
}

async function findAll() {
  const [rows] = await pool.query('SELECT * FROM home_sections ORDER BY sort_order ASC');
  return Promise.all(rows.map(async r => fmt(r, await _getItems(r.id))));
}

async function findActive() {
  const [rows] = await pool.query(
    'SELECT * FROM home_sections WHERE is_active = 1 ORDER BY sort_order ASC'
  );
  return Promise.all(rows.map(async r => fmt(r, await _getItems(r.id))));
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM home_sections WHERE id = ? LIMIT 1', [id]);
  if (!rows[0]) return null;
  return fmt(rows[0], await _getItems(rows[0].id));
}

async function findByKey(key) {
  const [rows] = await pool.query('SELECT * FROM home_sections WHERE section_key = ? LIMIT 1', [key]);
  if (!rows[0]) return null;
  return fmt(rows[0], await _getItems(rows[0].id));
}

async function findItemBySlugOrId(slugOrId) {
  const [rows] = await pool.query(
    'SELECT * FROM home_section_items WHERE id = ? OR slug = ? LIMIT 1',
    [isNaN(slugOrId) ? 0 : slugOrId, slugOrId]
  );
  return rows[0] ? fmtItem(rows[0]) : null;
}

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO home_sections
       (section_key, title, title_bn, subtitle, subtitle_bn, description, description_bn,
        icon, layout, accent_color, background_color, banner_image, sort_order, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.key, data.title, data.titleBn || '', data.subtitle || '', data.subtitleBn || '',
      data.description || '', data.descriptionBn || '', data.icon || '',
      data.layout || 'carousel', data.accentColor || '', data.backgroundColor || '',
      data.bannerImage || '', data.order ?? 0, data.isActive !== false ? 1 : 0,
    ]
  );
  const sectionId = result.insertId;
  if (data.products?.length) await _upsertItems(sectionId, data.products);
  return findById(sectionId);
}

async function update(id, data) {
  const colMap = {
    key: 'section_key', title: 'title', titleBn: 'title_bn', subtitle: 'subtitle',
    subtitleBn: 'subtitle_bn', description: 'description', descriptionBn: 'description_bn',
    icon: 'icon', layout: 'layout', accentColor: 'accent_color', backgroundColor: 'background_color',
    bannerImage: 'banner_image', order: 'sort_order', isActive: 'is_active',
  };
  const sets = [];
  const vals = [];
  for (const [js, col] of Object.entries(colMap)) {
    if (data[js] !== undefined) {
      sets.push(`${col} = ?`);
      vals.push(js === 'isActive' ? (data[js] ? 1 : 0) : data[js]);
    }
  }
  if (sets.length) { vals.push(id); await pool.query(`UPDATE home_sections SET ${sets.join(', ')} WHERE id = ?`, vals); }
  return findById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM home_sections WHERE id = ?', [id]);
}

async function _upsertItems(sectionId, items) {
  if (!items.length) return;
  const rows = items.map((item, i) => [
    sectionId, item.productId || null, item.name, item.nameBn || '', item.slug || '',
    item.image || '', item.price || 0, item.comparePrice || 0, item.unit || '',
    item.badge || '', item.minQty || 0, item.description || '', item.descriptionBn || '',
    item.link || '', item.order ?? i, item.isActive !== false ? 1 : 0,
  ]);
  await pool.query(
    `INSERT INTO home_section_items
       (section_id, product_id, name, name_bn, slug, image, price, compare_price, unit,
        badge, min_qty, description, description_bn, link, sort_order, is_active)
     VALUES ?`,
    [rows]
  );
}

async function addProducts(sectionId, products) {
  await _upsertItems(sectionId, products);
  return findById(sectionId);
}

async function updateItem(sectionId, itemId, data) {
  const colMap = {
    productId: 'product_id', name: 'name', nameBn: 'name_bn', slug: 'slug', image: 'image',
    price: 'price', comparePrice: 'compare_price', unit: 'unit', badge: 'badge',
    minQty: 'min_qty', description: 'description', descriptionBn: 'description_bn',
    link: 'link', order: 'sort_order', isActive: 'is_active',
  };
  const sets = [];
  const vals = [];
  for (const [js, col] of Object.entries(colMap)) {
    if (data[js] !== undefined) {
      sets.push(`${col} = ?`);
      vals.push(js === 'isActive' ? (data[js] ? 1 : 0) : data[js]);
    }
  }
  if (sets.length) {
    vals.push(itemId, sectionId);
    await pool.query(`UPDATE home_section_items SET ${sets.join(', ')} WHERE id = ? AND section_id = ?`, vals);
  }
  return findById(sectionId);
}

async function removeItem(sectionId, itemId) {
  await pool.query('DELETE FROM home_section_items WHERE id = ? AND section_id = ?', [itemId, sectionId]);
}

async function reorder(items) {
  for (const { id, order } of items) {
    await pool.query('UPDATE home_sections SET sort_order = ? WHERE id = ?', [order, id]);
  }
}

module.exports = {
  findAll, findActive, findById, findByKey, findItemBySlugOrId,
  create, update, remove, addProducts, updateItem, removeItem, reorder,
};

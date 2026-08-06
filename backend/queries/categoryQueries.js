const pool = require('../db');

function fmt(row) {
  if (!row) return null;
  return {
    _id:             row.id,
    name:            row.name,
    slug:            row.slug,
    description:     row.description,
    image:           row.image,
    banner:          row.banner,
    parentId:        row.parent_id,
    isActive:        !!row.is_active,
    featured:        !!row.featured,
    order:           row.sort_order,
    icon:            row.icon,
    metaTitle:       row.meta_title,
    metaDescription: row.meta_description,
    showOnMenu:      !!row.show_on_menu,
    showOnHomepage:  !!row.show_on_homepage,
    showInSearch:    !!row.show_in_search,
    createdAt:       row.created_at,
    updatedAt:       row.updated_at,
  };
}

async function findAll({ page = 1, limit = 20, search, isActive, featured, parentId } = {}) {
  const conditions = [];
  const params = [];

  if (search) { conditions.push('(name LIKE ? OR slug LIKE ?)'); params.push(`%${search}%`, `%${search}%`); }
  if (isActive !== undefined) { conditions.push('is_active = ?'); params.push(isActive ? 1 : 0); }
  if (featured !== undefined) { conditions.push('featured = ?'); params.push(featured ? 1 : 0); }
  if (parentId !== undefined) {
    conditions.push(parentId === null ? 'parent_id IS NULL' : 'parent_id = ?');
    if (parentId !== null) params.push(parentId);
  }

  const where  = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const offset = (page - 1) * limit;

  const [rows] = await pool.query(
    `SELECT * FROM categories ${where} ORDER BY sort_order ASC, name ASC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [countRows] = await pool.query(
    `SELECT COUNT(*) AS total FROM categories ${where}`, params
  );
  return { categories: rows.map(fmt), total: countRows[0].total };
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM categories WHERE id = ? LIMIT 1', [id]);
  return fmt(rows[0]);
}

async function findBySlug(slug) {
  const [rows] = await pool.query('SELECT * FROM categories WHERE slug = ? LIMIT 1', [slug]);
  return fmt(rows[0]);
}

async function findFeatured() {
  const [rows] = await pool.query(
    'SELECT * FROM categories WHERE featured = 1 AND is_active = 1 ORDER BY sort_order ASC'
  );
  return rows.map(fmt);
}

async function findAllPublic() {
  const [rows] = await pool.query(
    'SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, name ASC'
  );
  return rows.map(fmt);
}

async function create(data) {
  const {
    name, slug, description = '', image = '', banner = '', parentId = null,
    isActive = true, featured = false, order = 0, icon = '',
    metaTitle = '', metaDescription = '',
    showOnMenu = true, showOnHomepage = true, showInSearch = true,
  } = data;

  const [result] = await pool.query(
    `INSERT INTO categories
       (name, slug, description, image, banner, parent_id, is_active, featured,
        sort_order, icon, meta_title, meta_description, show_on_menu, show_on_homepage, show_in_search)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [name, slug, description, image, banner, parentId, isActive ? 1 : 0, featured ? 1 : 0,
     order, icon, metaTitle, metaDescription, showOnMenu ? 1 : 0, showOnHomepage ? 1 : 0, showInSearch ? 1 : 0]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const map = {
    name: 'name', slug: 'slug', description: 'description', image: 'image', banner: 'banner',
    parentId: 'parent_id', isActive: 'is_active', featured: 'featured', order: 'sort_order',
    icon: 'icon', metaTitle: 'meta_title', metaDescription: 'meta_description',
    showOnMenu: 'show_on_menu', showOnHomepage: 'show_on_homepage', showInSearch: 'show_in_search',
  };
  const boolFields = new Set(['isActive', 'featured', 'showOnMenu', 'showOnHomepage', 'showInSearch']);
  const setClauses = [];
  const values = [];

  for (const [jsKey, dbCol] of Object.entries(map)) {
    if (data[jsKey] !== undefined) {
      setClauses.push(`${dbCol} = ?`);
      values.push(boolFields.has(jsKey) ? (data[jsKey] ? 1 : 0) : data[jsKey]);
    }
  }
  if (!setClauses.length) return findById(id);
  values.push(id);
  await pool.query(`UPDATE categories SET ${setClauses.join(', ')} WHERE id = ?`, values);
  return findById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM categories WHERE id = ?', [id]);
}

async function bulkDelete(ids) {
  if (!ids.length) return;
  const placeholders = ids.map(() => '?').join(', ');
  await pool.query(`DELETE FROM categories WHERE id IN (${placeholders})`, ids);
}

module.exports = { findAll, findById, findBySlug, findFeatured, findAllPublic, create, update, remove, bulkDelete };

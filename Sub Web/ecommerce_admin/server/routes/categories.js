const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

// ─── HELPERS ────────────────────────────────────────────────────────────────

function makeSlug(str) {
  return str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function collectSubtreeIds(rootIds) {
  const ids = (Array.isArray(rootIds) ? rootIds : [rootIds]).filter(Boolean).map(Number);
  if (!ids.length) return [];
  const ph = ids.map(() => '?').join(',');
  const [rows] = await pool.query(
    `WITH RECURSIVE subtree AS (
       SELECT id FROM categories WHERE id IN (${ph}) AND deleted_at IS NULL
       UNION ALL
       SELECT c.id FROM categories c
         INNER JOIN subtree s ON c.parent_id = s.id
         WHERE c.deleted_at IS NULL
     )
     SELECT id FROM subtree`,
    ids
  );
  return rows.map(r => r.id);
}

function fmtCategory(row) {
  if (!row) return null;
  return {
    _id:             String(row.id),
    name:            row.name || '',
    nameBn:          row.name_bn || '',
    slug:            row.slug || '',
    description:     row.description || '',
    image:           row.image || '',
    banner:          row.banner || '',
    icon:            row.icon || '',
    parentId:        row.parent_id ? String(row.parent_id) : null,
    parent:          row.parent_name ? { _id: String(row.parent_id), name: row.parent_name } : null,
    level:           Number(row.level) || 1,
    isActive:        !!row.is_active,
    featured:        !!row.featured,
    order:           Number(row.sort_order) || 0,
    keywords:        row.keywords || '',
    metaTitle:       row.meta_title || '',
    metaDescription: row.meta_description || '',
    showOnMenu:      row.show_on_menu !== undefined ? !!row.show_on_menu : true,
    showOnHomepage:  row.show_on_homepage !== undefined ? !!row.show_on_homepage : true,
    showInSearch:    row.show_in_search !== undefined ? !!row.show_in_search : true,
    productCount:    Number(row.product_count) || 0,
    deletedAt:       row.deleted_at || null,
    createdAt:       row.created_at,
    updatedAt:       row.updated_at,
  };
}

function buildTree(rows) {
  const map = {};
  rows.forEach(r => { map[r.id] = { ...fmtCategory(r), children: [] }; });
  const roots = [];
  rows.forEach(r => {
    if (r.parent_id && map[r.parent_id]) {
      map[r.parent_id].children.push(map[r.id]);
    } else if (!r.parent_id) {
      roots.push(map[r.id]);
    }
  });
  return roots;
}

// ─── PUBLIC ROUTES ──────────────────────────────────────────────────────────

router.get('/public/slug/:slug', async (req, res) => {
  try {
    const [[cat]] = await pool.query(
      `SELECT c.*, p.name AS parent_name, p.slug AS parent_slug
       FROM categories c LEFT JOIN categories p ON p.id = c.parent_id
       WHERE c.slug = ? AND c.is_active = 1 AND c.deleted_at IS NULL LIMIT 1`,
      [req.params.slug]
    );
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    const [subs] = await pool.query(
      'SELECT * FROM categories WHERE parent_id = ? AND is_active = 1 AND deleted_at IS NULL ORDER BY sort_order ASC, name ASC',
      [cat.id]
    );
    res.json({ category: fmtCategory(cat), subcategories: subs.map(fmtCategory) });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/public/all', async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM categories WHERE is_active = 1 AND deleted_at IS NULL ORDER BY sort_order ASC, level ASC, name ASC'
    );
    res.json(buildTree(rows));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/public/featured', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, (SELECT COUNT(*) FROM products WHERE category_id = c.id) AS product_count
       FROM categories c
       WHERE c.is_active = 1 AND c.featured = 1 AND c.deleted_at IS NULL
       ORDER BY c.sort_order ASC, c.name ASC`
    );
    res.json(rows.map(fmtCategory));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.get('/public/shop-by-category', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, (SELECT COUNT(*) FROM products WHERE category_id = c.id) AS product_count
       FROM categories c
       WHERE c.is_active = 1 AND c.deleted_at IS NULL
       ORDER BY c.sort_order ASC, c.level ASC, c.name ASC`
    );
    res.json(buildTree(rows));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── ADMIN: TREE VIEW ────────────────────────────────────────────────────────
// MUST be defined BEFORE /:id

router.get('/tree', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, p.name AS parent_name,
              (SELECT COUNT(*) FROM products WHERE category_id = c.id) AS product_count
       FROM categories c LEFT JOIN categories p ON p.id = c.parent_id
       WHERE c.deleted_at IS NULL
       ORDER BY c.sort_order ASC, c.level ASC, c.name ASC`
    );
    res.json(buildTree(rows));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── ADMIN: STATS ────────────────────────────────────────────────────────────

router.get('/stats', authMiddleware, async (req, res) => {
  try {
    const [[{ total }]]    = await pool.query('SELECT COUNT(*) AS total FROM categories WHERE deleted_at IS NULL');
    const [[{ active }]]   = await pool.query('SELECT COUNT(*) AS active FROM categories WHERE is_active = 1 AND deleted_at IS NULL');
    const [[{ inactive }]] = await pool.query('SELECT COUNT(*) AS inactive FROM categories WHERE is_active = 0 AND deleted_at IS NULL');
    const [[{ deleted }]]  = await pool.query('SELECT COUNT(*) AS deleted FROM categories WHERE deleted_at IS NOT NULL');
    const [[{ featured }]] = await pool.query('SELECT COUNT(*) AS featured FROM categories WHERE featured = 1 AND deleted_at IS NULL');
    res.json({
      total: Number(total), active: Number(active), inactive: Number(inactive),
      deleted: Number(deleted), featured: Number(featured),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── ADMIN: DELETED (TRASH) ──────────────────────────────────────────────────

router.get('/deleted', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT c.*, p.name AS parent_name FROM categories c
       LEFT JOIN categories p ON p.id = c.parent_id
       WHERE c.deleted_at IS NOT NULL
       ORDER BY c.deleted_at DESC`
    );
    res.json(rows.map(fmtCategory));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── ADMIN: BULK OPS (must be before /:id) ───────────────────────────────────

router.post('/bulk-delete', authMiddleware, async (req, res) => {
  try {
    const { ids, permanent = false } = req.body;
    if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ message: 'No ids provided' });

    const subtreeIds = await collectSubtreeIds(ids);
    const ph = subtreeIds.map(() => '?').join(',');

    if (permanent) {
      const [[{ cnt }]] = await pool.query(
        `SELECT COUNT(*) AS cnt FROM products WHERE category_id IN (${ph})`, subtreeIds
      );
      if (Number(cnt) > 0) {
        return res.status(400).json({ message: `Cannot permanently delete: ${cnt} products still assigned. Move products first.` });
      }
      await pool.query(`DELETE FROM categories WHERE id IN (${ph})`, subtreeIds);
      return res.json({ message: `${subtreeIds.length} categories permanently deleted`, deletedCount: subtreeIds.length });
    }

    await pool.query(`UPDATE categories SET deleted_at = NOW() WHERE id IN (${ph})`, subtreeIds);
    res.json({ message: `${subtreeIds.length} categories moved to trash`, deletedCount: subtreeIds.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.post('/bulk-update', authMiddleware, async (req, res) => {
  try {
    const { ids, isActive } = req.body;
    if (!Array.isArray(ids) || !ids.length) return res.status(400).json({ message: 'No ids provided' });
    const ph = ids.map(() => '?').join(',');
    await pool.query(
      `UPDATE categories SET is_active = ? WHERE id IN (${ph}) AND deleted_at IS NULL`,
      [isActive ? 1 : 0, ...ids]
    );
    res.json({ message: `${ids.length} categories updated` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── ADMIN: RESTORE ──────────────────────────────────────────────────────────

router.patch('/restore/:id', authMiddleware, async (req, res) => {
  try {
    const [[cat]] = await pool.query('SELECT id FROM categories WHERE id = ? AND deleted_at IS NOT NULL LIMIT 1', [req.params.id]);
    if (!cat) return res.status(404).json({ message: 'Not in trash or not found' });
    await pool.query('UPDATE categories SET deleted_at = NULL WHERE id = ?', [req.params.id]);
    const [[restored]] = await pool.query(
      'SELECT c.*, p.name AS parent_name FROM categories c LEFT JOIN categories p ON p.id = c.parent_id WHERE c.id = ?',
      [req.params.id]
    );
    res.json(fmtCategory(restored));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── ADMIN: STATUS TOGGLE ─────────────────────────────────────────────────────

router.patch('/status/:id', authMiddleware, async (req, res) => {
  try {
    const { isActive } = req.body;
    await pool.query(
      'UPDATE categories SET is_active = ? WHERE id = ? AND deleted_at IS NULL',
      [isActive ? 1 : 0, req.params.id]
    );
    const [[cat]] = await pool.query(
      'SELECT c.*, p.name AS parent_name FROM categories c LEFT JOIN categories p ON p.id = c.parent_id WHERE c.id = ?',
      [req.params.id]
    );
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    res.json(fmtCategory(cat));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── ADMIN: SORT ORDER ────────────────────────────────────────────────────────

router.patch('/sort', authMiddleware, async (req, res) => {
  try {
    const { items } = req.body; // [{ id, sort_order }]
    if (!Array.isArray(items) || !items.length) return res.status(400).json({ message: 'No items' });
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();
      for (const { id, sort_order } of items) {
        await conn.query('UPDATE categories SET sort_order = ? WHERE id = ?', [sort_order, id]);
      }
      await conn.commit();
    } catch (e) {
      await conn.rollback();
      throw e;
    } finally {
      conn.release();
    }
    res.json({ message: `${items.length} categories reordered` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── ADMIN: LIST (flat, paginated, filterable) ────────────────────────────────

router.get('/', authMiddleware, async (req, res) => {
  try {
    const {
      search = '', status, parent, level,
      featured, include_deleted, limit = 1000, page = 1,
    } = req.query;

    const conds = [];
    const params = [];

    if (include_deleted !== 'true') conds.push('c.deleted_at IS NULL');
    if (search) {
      conds.push('(c.name LIKE ? OR c.name_bn LIKE ? OR c.slug LIKE ?)');
      const q = `%${search}%`;
      params.push(q, q, q);
    }
    if (status === 'active')   conds.push('c.is_active = 1');
    if (status === 'inactive') conds.push('c.is_active = 0');
    if (parent === 'root')     conds.push('c.parent_id IS NULL');
    else if (parent && parent !== 'all') { conds.push('c.parent_id = ?'); params.push(parent); }
    if (level)                 { conds.push('c.level = ?'); params.push(Number(level)); }
    if (featured === 'true')   conds.push('c.featured = 1');

    const where  = conds.length ? 'WHERE ' + conds.join(' AND ') : '';
    const offset = (Number(page) - 1) * Number(limit);

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM categories c ${where}`, params
    );

    const [rows] = await pool.query(
      `SELECT c.*, p.name AS parent_name,
              (SELECT COUNT(*) FROM products WHERE category_id = c.id) AS product_count
       FROM categories c
       LEFT JOIN categories p ON p.id = c.parent_id
       ${where}
       ORDER BY c.sort_order ASC, c.level ASC, c.name ASC
       LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );

    res.json({
      categories: rows.map(fmtCategory),
      total: Number(total),
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(Number(total) / Number(limit)),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── ADMIN: GET SINGLE ───────────────────────────────────────────────────────

router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [[row]] = await pool.query(
      `SELECT c.*, p.name AS parent_name,
              (SELECT COUNT(*) FROM products WHERE category_id = c.id) AS product_count
       FROM categories c LEFT JOIN categories p ON p.id = c.parent_id
       WHERE c.id = ? LIMIT 1`,
      [req.params.id]
    );
    if (!row) return res.status(404).json({ message: 'Category not found' });
    res.json(fmtCategory(row));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ─── ADMIN: CREATE ───────────────────────────────────────────────────────────

router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      name, nameBn = '', slug: rawSlug = '',
      description = '', image = '', banner = '', icon = '',
      parentId = null, isActive = true, featured = false,
      order: sortOrder = 0, keywords = '',
      metaTitle = '', metaDescription = '',
      showOnMenu = true, showOnHomepage = true, showInSearch = true,
    } = req.body;

    if (!name || !name.trim()) return res.status(400).json({ message: 'Name is required' });

    const finalSlug = rawSlug.trim() || makeSlug(name);

    // Slug uniqueness (exclude soft-deleted)
    const [[dup]] = await pool.query(
      'SELECT id FROM categories WHERE slug = ? AND deleted_at IS NULL LIMIT 1', [finalSlug]
    );
    if (dup) return res.status(400).json({ message: 'Slug already exists. Please use a different slug.' });

    // Level from parent
    let level = 1;
    if (parentId) {
      const [[parent]] = await pool.query('SELECT level FROM categories WHERE id = ? AND deleted_at IS NULL LIMIT 1', [parentId]);
      if (parent) level = Number(parent.level) + 1;
    }

    const [result] = await pool.query(
      `INSERT INTO categories
         (name, name_bn, slug, description, image, banner, icon,
          parent_id, level, is_active, featured, sort_order, keywords,
          meta_title, meta_description, show_on_menu, show_on_homepage, show_in_search)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name.trim(), nameBn.trim(), finalSlug,
       description, image, banner, icon,
       parentId || null, level,
       isActive ? 1 : 0, featured ? 1 : 0, sortOrder, keywords,
       metaTitle, metaDescription,
       showOnMenu ? 1 : 0, showOnHomepage ? 1 : 0, showInSearch ? 1 : 0]
    );

    const [[cat]] = await pool.query(
      'SELECT c.*, p.name AS parent_name FROM categories c LEFT JOIN categories p ON p.id = c.parent_id WHERE c.id = ?',
      [result.insertId]
    );
    res.status(201).json(fmtCategory(cat));
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Slug already exists' });
    res.status(400).json({ message: error.message });
  }
});

// ─── ADMIN: UPDATE ───────────────────────────────────────────────────────────

router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const {
      name, nameBn, slug: rawSlug, description, image, banner, icon,
      parentId, isActive, featured, order: sortOrder, keywords,
      metaTitle, metaDescription, showOnMenu, showOnHomepage, showInSearch,
    } = req.body;

    const fields = {};
    if (name !== undefined)            fields.name = name.trim ? name.trim() : name;
    if (nameBn !== undefined)          fields.name_bn = (nameBn || '').trim ? (nameBn || '').trim() : (nameBn || '');
    if (rawSlug !== undefined && rawSlug !== null) fields.slug = rawSlug.trim ? rawSlug.trim() : rawSlug;
    if (description !== undefined)     fields.description = description;
    if (image !== undefined)           fields.image = image;
    if (banner !== undefined)          fields.banner = banner;
    if (icon !== undefined)            fields.icon = icon;
    if (parentId !== undefined) {
      fields.parent_id = parentId || null;
      if (parentId) {
        const [[parent]] = await pool.query('SELECT level FROM categories WHERE id = ? LIMIT 1', [parentId]);
        if (parent) fields.level = Number(parent.level) + 1;
      } else {
        fields.level = 1;
      }
    }
    if (isActive !== undefined)        fields.is_active = isActive ? 1 : 0;
    if (featured !== undefined)        fields.featured = featured ? 1 : 0;
    if (sortOrder !== undefined)       fields.sort_order = sortOrder;
    if (keywords !== undefined)        fields.keywords = keywords;
    if (metaTitle !== undefined)       fields.meta_title = metaTitle;
    if (metaDescription !== undefined) fields.meta_description = metaDescription;
    if (showOnMenu !== undefined)      fields.show_on_menu = showOnMenu ? 1 : 0;
    if (showOnHomepage !== undefined)  fields.show_on_homepage = showOnHomepage ? 1 : 0;
    if (showInSearch !== undefined)    fields.show_in_search = showInSearch ? 1 : 0;

    if (!Object.keys(fields).length) return res.status(400).json({ message: 'No fields to update' });

    // Slug uniqueness check
    if (fields.slug) {
      const [[dup]] = await pool.query(
        'SELECT id FROM categories WHERE slug = ? AND id != ? AND deleted_at IS NULL LIMIT 1',
        [fields.slug, req.params.id]
      );
      if (dup) return res.status(400).json({ message: 'Slug already exists. Please use a different slug.' });
    }

    const setClauses = Object.keys(fields).map(k => `\`${k}\` = ?`).join(', ');
    await pool.query(
      `UPDATE categories SET ${setClauses} WHERE id = ?`,
      [...Object.values(fields), req.params.id]
    );

    const [[cat]] = await pool.query(
      'SELECT c.*, p.name AS parent_name FROM categories c LEFT JOIN categories p ON p.id = c.parent_id WHERE c.id = ?',
      [req.params.id]
    );
    if (!cat) return res.status(404).json({ message: 'Category not found' });
    res.json(fmtCategory(cat));
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ message: 'Slug already exists' });
    res.status(400).json({ message: error.message });
  }
});

// ─── ADMIN: SOFT DELETE ──────────────────────────────────────────────────────

router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [[cat]] = await pool.query('SELECT id FROM categories WHERE id = ? AND deleted_at IS NULL LIMIT 1', [req.params.id]);
    if (!cat) return res.status(404).json({ message: 'Category not found' });

    const subtreeIds = await collectSubtreeIds(req.params.id);
    const ph = subtreeIds.map(() => '?').join(',');
    await pool.query(`UPDATE categories SET deleted_at = NOW() WHERE id IN (${ph})`, subtreeIds);

    res.json({ message: 'Category moved to trash', deletedCount: subtreeIds.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

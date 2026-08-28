const express  = require('express');
const slugify  = require('slugify');
const { pool } = require('../config/db');
const { protect, adminOnly } = require('../middleware/auth');

const router = express.Router();

const defaultCategories = [
  { name: 'Entertainment',   slug: 'entertainment', group: 'entertainment', icon: '🎨', color: '#e91e63', order: 1,
    subs: [['Literature','literature'],['Movies','movies'],['Art/Design','art-design'],['Music','music'],['TV Shows','tv-shows'],['Celebrities','celebrities'],['Animation','animation']] },
  { name: 'Lifestyle',       slug: 'lifestyle',     group: 'lifestyle',     icon: '🛍️', color: '#9c27b0', order: 2,
    subs: [['Daily Lifestyle','daily-lifestyle'],['Fashion & Beauty','fashion-beauty'],['Interior/DIY','interior-diy'],['Cooking/Recipes','cooking-recipes'],['Restaurants','restaurants'],['Pets','pets'],['Product Reviews','product-reviews'],['Gardening','gardening']] },
  { name: 'Hobbies & Travel',slug: 'hobbies-travel',group: 'hobbies',      icon: '🧭', color: '#2196f3', order: 3,
    subs: [['Games','games'],['Sports','sports'],['Photography','photography'],['Cars','cars'],['Domestic Travel','domestic-travel'],['Overseas Travel','overseas-travel']] },
  { name: 'Knowledge',       slug: 'knowledge',     group: 'knowledge',     icon: '🧠', color: '#009688', order: 4,
    subs: [['IT & Computers','it-computers'],['Society & Politics','society-politics'],['Healthcare','healthcare'],['Business & Economics','business-economics'],['Languages','languages'],['Education','education']] },
];

const buildCategory = (r, subs = []) => ({
  _id:           String(r.id),
  name:          r.name,
  nameBn:        r.name_bn       || '',
  nameEn:        r.name_en       || '',
  slug:          r.slug,
  description:   r.description   || '',
  icon:          r.icon          || '',
  color:         r.color         || '',
  image:         r.image         || '',
  isActive:      Boolean(r.is_active),
  order:         r.order_num,
  postCount:     r.post_count,
  group:         r.group,
  parentId:      r.parent_id ? String(r.parent_id) : null,
  createdAt:     r.created_at,
  updatedAt:     r.updated_at,
  subcategories: subs.map((s) => ({ _id: String(s.id), name: s.name, slug: s.slug, icon: s.icon || '' })),
});

const seedCategories = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    for (const cat of defaultCategories) {
      const [r] = await conn.execute(
        "INSERT IGNORE INTO categories (name, slug, icon, color, `group`, is_active, order_num) VALUES (?,?,?,?,?,1,?)",
        [cat.name, cat.slug, cat.icon, cat.color, cat.group, cat.order]
      );
      const catId = r.insertId || null;
      if (catId && cat.subs.length) {
        const subValues = cat.subs.map(([n, s]) => [catId, n, s, '']);
        await conn.query('INSERT IGNORE INTO category_subcategories (category_id, name, slug, icon) VALUES ?', [subValues]);
      }
    }
    await conn.commit();
  } catch {
    await conn.rollback();
  } finally {
    conn.release();
  }
};

// GET /api/categories
router.get('/', async (req, res) => {
  try {
    let [cats] = await pool.execute(
      "SELECT * FROM categories WHERE is_active = 1 AND parent_id IS NULL ORDER BY order_num ASC"
    );

    if (cats.length === 0) {
      await seedCategories();
      [cats] = await pool.execute(
        "SELECT * FROM categories WHERE is_active = 1 AND parent_id IS NULL ORDER BY order_num ASC"
      );
    }

    const catIds = cats.map((c) => c.id);
    let subs = [];
    if (catIds.length) {
      [subs] = await pool.query(
        'SELECT * FROM category_subcategories WHERE category_id IN (?)',
        [catIds]
      );
    }

    const subsByCategory = {};
    subs.forEach((s) => {
      if (!subsByCategory[s.category_id]) subsByCategory[s.category_id] = [];
      subsByCategory[s.category_id].push(s);
    });

    res.json({
      success: true,
      categories: cats.map((c) => buildCategory(c, subsByCategory[c.id] || [])),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/categories/:slug
router.get('/:slug', async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT * FROM categories WHERE slug = ? AND is_active = 1 LIMIT 1',
      [req.params.slug]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    const [subs] = await pool.execute(
      'SELECT * FROM category_subcategories WHERE category_id = ?',
      [rows[0].id]
    );
    res.json({ success: true, category: buildCategory(rows[0], subs) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/categories (admin)
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const { name, nameBn, nameEn, description, icon, color, image, parent, group, order, subcategories } = req.body;
    const slug = slugify(name, { lower: true, strict: true });

    const [result] = await pool.execute(
      "INSERT INTO categories (name, name_bn, name_en, slug, description, icon, color, image, parent_id, `group`, order_num) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
      [name, nameBn || '', nameEn || '', slug, description || '', icon || '', color || '#6366f1', image || '', parent || null, group, order || 0]
    );
    const catId = result.insertId;

    let subs = [];
    if (subcategories && subcategories.length) {
      const subValues = subcategories.map((s) => [catId, s.name, s.slug || slugify(s.name, { lower: true, strict: true }), s.icon || '']);
      await pool.query('INSERT INTO category_subcategories (category_id, name, slug, icon) VALUES ?', [subValues]);
      [subs] = await pool.execute('SELECT * FROM category_subcategories WHERE category_id = ?', [catId]);
    }

    const [catRows] = await pool.execute('SELECT * FROM categories WHERE id = ?', [catId]);
    res.status(201).json({ success: true, category: buildCategory(catRows[0], subs) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/categories/:id (admin)
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const { name, nameBn, nameEn, description, icon, color, image, group, order, isActive } = req.body;
    const updates = [];
    const vals    = [];

    if (name        !== undefined) { updates.push('name = ?');        vals.push(name);        }
    if (nameBn      !== undefined) { updates.push('name_bn = ?');     vals.push(nameBn);      }
    if (nameEn      !== undefined) { updates.push('name_en = ?');     vals.push(nameEn);      }
    if (description !== undefined) { updates.push('description = ?'); vals.push(description); }
    if (icon        !== undefined) { updates.push('icon = ?');        vals.push(icon);        }
    if (color       !== undefined) { updates.push('color = ?');       vals.push(color);       }
    if (image       !== undefined) { updates.push('image = ?');       vals.push(image);       }
    if (group       !== undefined) { updates.push('`group` = ?');     vals.push(group);       }
    if (order       !== undefined) { updates.push('order_num = ?');   vals.push(order);       }
    if (isActive    !== undefined) { updates.push('is_active = ?');   vals.push(isActive ? 1 : 0); }

    if (!updates.length) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }

    const [result] = await pool.execute(
      `UPDATE categories SET ${updates.join(', ')} WHERE id = ?`,
      [...vals, req.params.id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'Category not found' });
    }
    const [rows] = await pool.execute('SELECT * FROM categories WHERE id = ?', [req.params.id]);
    const [subs] = await pool.execute('SELECT * FROM category_subcategories WHERE category_id = ?', [req.params.id]);
    res.json({ success: true, category: buildCategory(rows[0], subs) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/categories/:id (admin — soft deactivate)
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await pool.execute('UPDATE categories SET is_active = 0 WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Category deactivated' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

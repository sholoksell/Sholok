const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

function slugify(s) { return s.toLowerCase().replace(/[^\w\s-]/g,'').replace(/\s+/g,'-').trim(); }

// GET /categories
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM news_categories ORDER BY sort_order ASC, id ASC');
    res.json(rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /categories
router.post('/', auth, async (req, res) => {
  try {
    const { name_en, name_bn, slug, description_en, description_bn, color, sort_order, meta_title, meta_description } = req.body;
    if (!name_en) return res.status(400).json({ message: 'English name required' });
    const finalSlug = slug || slugify(name_en);
    const [r] = await pool.query(
      'INSERT INTO news_categories (name_en,name_bn,slug,description_en,description_bn,color,sort_order,meta_title,meta_description) VALUES (?,?,?,?,?,?,?,?,?)',
      [name_en, name_bn||null, finalSlug, description_en||null, description_bn||null, color||'#5D0096', sort_order||0, meta_title||null, meta_description||null]
    );
    const [[row]] = await pool.query('SELECT * FROM news_categories WHERE id=?', [r.insertId]);
    res.status(201).json(row);
  } catch (e) {
    if (e.code==='ER_DUP_ENTRY') return res.status(409).json({ message: 'Slug already exists' });
    res.status(500).json({ message: e.message });
  }
});

// PUT /categories/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const { name_en, name_bn, slug, description_en, description_bn, color, sort_order, is_active, meta_title, meta_description } = req.body;
    await pool.query(
      `UPDATE news_categories SET
       name_en=COALESCE(?,name_en), name_bn=COALESCE(?,name_bn), slug=COALESCE(?,slug),
       description_en=COALESCE(?,description_en), description_bn=COALESCE(?,description_bn),
       color=COALESCE(?,color), sort_order=COALESCE(?,sort_order),
       is_active=COALESCE(?,is_active), meta_title=COALESCE(?,meta_title), meta_description=COALESCE(?,meta_description)
       WHERE id=?`,
      [name_en, name_bn, slug, description_en, description_bn, color, sort_order, is_active, meta_title, meta_description, req.params.id]
    );
    const [[row]] = await pool.query('SELECT * FROM news_categories WHERE id=?', [req.params.id]);
    res.json(row);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /categories/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const [[{ count }]] = await pool.query('SELECT COUNT(*) as count FROM news_articles WHERE category_id=?', [req.params.id]);
    if (count > 0) return res.status(409).json({ message: `Cannot delete — ${count} articles use this category. Deactivate it instead.` });
    await pool.query('DELETE FROM news_categories WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;

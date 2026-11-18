const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

function slugify(s) { return s.toLowerCase().replace(/[^\w\s-]/g,'').replace(/\s+/g,'-').trim(); }

router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await pool.query(`
      SELECT a.*, COUNT(n.id) as article_count
      FROM news_authors a
      LEFT JOIN news_articles n ON n.author_id=a.id AND n.status='published'
      GROUP BY a.id ORDER BY a.name ASC`);
    res.json(rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/', auth, async (req, res) => {
  try {
    const { name, email, bio, designation, facebook, twitter, avatar } = req.body;
    if (!name) return res.status(400).json({ message: 'Name required' });
    const slug = slugify(name) + '-' + Date.now();
    const [r] = await pool.query(
      'INSERT INTO news_authors (name,slug,email,bio,designation,facebook,twitter,avatar) VALUES (?,?,?,?,?,?,?,?)',
      [name, slug, email||null, bio||null, designation||null, facebook||null, twitter||null, avatar||null]
    );
    const [[row]] = await pool.query('SELECT * FROM news_authors WHERE id=?', [r.insertId]);
    res.status(201).json(row);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { name, email, bio, designation, facebook, twitter, avatar, is_active } = req.body;
    await pool.query(
      'UPDATE news_authors SET name=COALESCE(?,name), email=COALESCE(?,email), bio=COALESCE(?,bio), designation=COALESCE(?,designation), facebook=COALESCE(?,facebook), twitter=COALESCE(?,twitter), avatar=COALESCE(?,avatar), is_active=COALESCE(?,is_active) WHERE id=?',
      [name, email, bio, designation, facebook, twitter, avatar, is_active, req.params.id]
    );
    const [[row]] = await pool.query('SELECT * FROM news_authors WHERE id=?', [req.params.id]);
    res.json(row);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const [[{ count }]] = await pool.query('SELECT COUNT(*) as count FROM news_articles WHERE author_id=?', [req.params.id]);
    if (count > 0) return res.status(409).json({ message: `${count} articles use this author. Deactivate instead.` });
    await pool.query('DELETE FROM news_authors WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;

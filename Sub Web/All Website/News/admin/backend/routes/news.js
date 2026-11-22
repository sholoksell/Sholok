const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');

function slugify(s) {
  return s.toLowerCase()
    .replace(/[^ঀ-৿\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
    .substring(0, 200);
}

async function uniqueSlug(base, excludeId = null) {
  let slug = base, i = 1;
  while (true) {
    const q = excludeId
      ? 'SELECT id FROM news_articles WHERE slug=? AND id<>?'
      : 'SELECT id FROM news_articles WHERE slug=?';
    const params = excludeId ? [slug, excludeId] : [slug];
    const [[row]] = await pool.query(q, params);
    if (!row) return slug;
    slug = `${base}-${i++}`;
  }
}

// GET /news — list with filters
router.get('/', auth, async (req, res) => {
  try {
    const { status, category, search, page = 1, limit = 20, is_featured, is_breaking, is_political } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    let where = [], params = [];
    if (status) { where.push('a.status=?'); params.push(status); }
    if (category) { where.push('a.category_id=?'); params.push(category); }
    if (is_featured === '1') { where.push('a.is_featured=1'); }
    if (is_breaking === '1') { where.push('a.is_breaking=1'); }
    if (is_political === '1') { where.push('a.is_political=1'); }
    if (is_political === '0') { where.push('(a.is_political IS NULL OR a.is_political=0)'); }
    if (search) {
      where.push('(a.title_en LIKE ? OR a.title_bn LIKE ?)');
      params.push(`%${search}%`, `%${search}%`);
    }
    const whereStr = where.length ? 'WHERE ' + where.join(' AND ') : '';
    const [rows] = await pool.query(`
      SELECT a.id, a.title_en, a.title_bn, a.slug, a.status, a.is_featured,
             a.is_breaking, a.is_political, a.view_count, a.created_at, a.publish_at,
             c.name_en as category_name, au.name as author_name, a.featured_image
      FROM news_articles a
      LEFT JOIN news_categories c ON a.category_id=c.id
      LEFT JOIN news_authors au ON a.author_id=au.id
      ${whereStr}
      ORDER BY a.created_at DESC
      LIMIT ? OFFSET ?`, [...params, parseInt(limit), offset]);
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM news_articles a ${whereStr}`, params);
    res.json({ articles: rows, total, page: parseInt(page), limit: parseInt(limit) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /news/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const [[article]] = await pool.query(`
      SELECT a.*, c.name_en as category_name, c.name_bn as category_name_bn,
             au.name as author_name, s.name as source_name
      FROM news_articles a
      LEFT JOIN news_categories c ON a.category_id=c.id
      LEFT JOIN news_authors au ON a.author_id=au.id
      LEFT JOIN news_sources s ON a.source_id=s.id
      WHERE a.id=?`, [req.params.id]);
    if (!article) return res.status(404).json({ message: 'Not found' });
    const [tags] = await pool.query(`
      SELECT t.id, t.name, t.slug FROM news_tags t
      JOIN news_article_tags at ON t.id=at.tag_id
      WHERE at.article_id=?`, [article.id]);
    res.json({ article, tags });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /news
router.post('/', auth, async (req, res) => {
  try {
    const {
      title_en, title_bn, summary_en, summary_bn, body_en, body_bn,
      featured_image, category_id, author_id, source_id, source_url, source_credit,
      status, is_featured, is_breaking, is_political, publish_at,
      meta_title, meta_description, meta_keywords, tags,
      slug: slugInput,
    } = req.body;
    if (!title_en) return res.status(400).json({ message: 'English title required' });
    const baseSlug = slugInput ? slugify(slugInput) : slugify(title_en);
    const slug = await uniqueSlug(baseSlug);
    const pubAt = status === 'published' ? (publish_at || new Date()) : (publish_at || null);
    const [r] = await pool.query(
      `INSERT INTO news_articles
       (title_en,title_bn,slug,summary_en,summary_bn,body_en,body_bn,
        featured_image,category_id,author_id,source_id,source_url,source_credit,
        status,is_featured,is_breaking,is_political,publish_at,
        meta_title,meta_description,meta_keywords,created_by,updated_by)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      [title_en, title_bn||null, slug, summary_en||null, summary_bn||null, body_en||null, body_bn||null,
       featured_image||null, category_id||null, author_id||null, source_id||null, source_url||null, source_credit||null,
       status||'draft', is_featured?1:0, is_breaking?1:0, is_political?1:0, pubAt,
       meta_title||null, meta_description||null, meta_keywords||null,
       req.admin.id, req.admin.id]
    );
    if (tags && tags.length > 0) await saveTags(r.insertId, tags);
    const [[article]] = await pool.query('SELECT * FROM news_articles WHERE id=?', [r.insertId]);
    res.status(201).json(article);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /news/:id
router.put('/:id', auth, async (req, res) => {
  try {
    const id = req.params.id;
    const {
      title_en, title_bn, summary_en, summary_bn, body_en, body_bn,
      featured_image, category_id, author_id, source_id, source_url, source_credit,
      status, is_featured, is_breaking, is_political, publish_at,
      meta_title, meta_description, meta_keywords, tags, slug: slugInput,
    } = req.body;

    let newSlug = null;
    if (slugInput) newSlug = await uniqueSlug(slugify(slugInput), id);

    const pubAt = status === 'published' ? (publish_at || new Date()) : publish_at;

    await pool.query(
      `UPDATE news_articles SET
       title_en=COALESCE(?,title_en), title_bn=COALESCE(?,title_bn),
       slug=COALESCE(?,slug),
       summary_en=COALESCE(?,summary_en), summary_bn=COALESCE(?,summary_bn),
       body_en=COALESCE(?,body_en), body_bn=COALESCE(?,body_bn),
       featured_image=COALESCE(?,featured_image),
       category_id=COALESCE(?,category_id), author_id=COALESCE(?,author_id),
       source_id=COALESCE(?,source_id), source_url=COALESCE(?,source_url),
       source_credit=COALESCE(?,source_credit), status=COALESCE(?,status),
       is_featured=COALESCE(?,is_featured), is_breaking=COALESCE(?,is_breaking),
       is_political=COALESCE(?,is_political),
       publish_at=COALESCE(?,publish_at),
       meta_title=COALESCE(?,meta_title), meta_description=COALESCE(?,meta_description),
       meta_keywords=COALESCE(?,meta_keywords), updated_by=?
       WHERE id=?`,
      [title_en, title_bn, newSlug, summary_en, summary_bn, body_en, body_bn,
       featured_image, category_id, author_id, source_id, source_url, source_credit,
       status, is_featured != null ? (is_featured?1:0) : null,
       is_breaking != null ? (is_breaking?1:0) : null,
       is_political != null ? (is_political?1:0) : null,
       pubAt, meta_title, meta_description, meta_keywords,
       req.admin.id, id]
    );
    if (tags !== undefined) await saveTags(id, tags);
    const [[article]] = await pool.query('SELECT * FROM news_articles WHERE id=?', [id]);
    res.json(article);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PATCH /news/:id/political — toggle is_political flag
router.patch('/:id/political', auth, async (req, res) => {
  try {
    const { is_political } = req.body;
    if (typeof is_political === 'undefined') return res.status(400).json({ message: 'is_political required' });
    await pool.query('UPDATE news_articles SET is_political=?, updated_by=? WHERE id=?',
      [is_political ? 1 : 0, req.admin.id, req.params.id]);
    const [[article]] = await pool.query(
      'SELECT id, title_en, is_political FROM news_articles WHERE id=?', [req.params.id]);
    if (!article) return res.status(404).json({ message: 'Not found' });
    res.json(article);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /news/:id
router.delete('/:id', auth, async (req, res) => {
  try {
    await pool.query('DELETE FROM news_articles WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /news/:id/publish
router.post('/:id/publish', auth, async (req, res) => {
  try {
    await pool.query("UPDATE news_articles SET status='published', publish_at=COALESCE(publish_at,NOW()) WHERE id=?", [req.params.id]);
    res.json({ message: 'Published' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /news/:id/unpublish
router.post('/:id/unpublish', auth, async (req, res) => {
  try {
    await pool.query("UPDATE news_articles SET status='draft' WHERE id=?", [req.params.id]);
    res.json({ message: 'Unpublished' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

async function saveTags(articleId, tags) {
  await pool.query('DELETE FROM news_article_tags WHERE article_id=?', [articleId]);
  for (const tagName of tags) {
    if (!tagName.trim()) continue;
    const slug = slugify(tagName);
    let [[tag]] = await pool.query('SELECT id FROM news_tags WHERE slug=?', [slug]);
    if (!tag) {
      const [r] = await pool.query('INSERT IGNORE INTO news_tags (name, slug) VALUES (?,?)', [tagName.trim(), slug]);
      tag = { id: r.insertId };
    }
    if (tag.id) await pool.query('INSERT IGNORE INTO news_article_tags (article_id,tag_id) VALUES (?,?)', [articleId, tag.id]);
  }
}

module.exports = router;

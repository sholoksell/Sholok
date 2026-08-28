const express  = require('express');
const slugify  = require('slugify');
const { pool } = require('../config/db');
const { protect, optionalAuth } = require('../middleware/auth');
const upload   = require('../middleware/upload');

const router = express.Router();

// ── helpers ────────────────────────────────────────────────

const createSlug = async (title) => {
  let slug = slugify(title, { lower: true, strict: true });
  const [rows] = await pool.execute('SELECT id FROM posts WHERE slug = ? LIMIT 1', [slug]);
  if (rows.length) slug = `${slug}-${Date.now()}`;
  return slug;
};

const computeReadTime = (content) =>
  Math.ceil((content || '').split(/\s+/).filter(Boolean).length / 200) || 1;

const computeExcerpt = (content) =>
  (content || '').replace(/<[^>]+>/g, '').substring(0, 300).trim();

const buildAuthor = (r) => ({
  _id:         String(r.author_id),
  username:    r.author_username,
  displayName: r.author_display_name,
  avatar:      r.author_avatar || '',
  bio:         r.author_bio    || '',
});

const buildCategory = (r) => ({
  _id:    String(r.category_id),
  name:   r.category_name,
  nameBn: r.category_name_bn || '',
  nameEn: r.category_name_en || '',
  slug:   r.category_slug,
  color:  r.category_color   || '',
  icon:   r.category_icon    || '',
});

const buildPost = (r) => ({
  _id:           String(r.id),
  id:            r.id,
  title:         r.title,
  titleBn:       r.title_bn       || '',
  titleEn:       r.title_en       || '',
  slug:          r.slug,
  excerpt:       r.excerpt        || '',
  excerptBn:     r.excerpt_bn     || '',
  excerptEn:     r.excerpt_en     || '',
  featuredImage: r.featured_image || '',
  status:        r.status,
  views:         r.views,
  uniqueViews:   r.unique_views,
  isFeatured:    Boolean(r.is_featured),
  isDeleted:     Boolean(r.is_deleted),
  readTime:      r.read_time,
  language:      r.language       || 'en',
  location:      r.location       || '',
  subcategory:   r.subcategory    || '',
  seoTitle:      r.seo_title      || '',
  seoDescription:r.seo_description|| '',
  publishedAt:   r.published_at,
  scheduledAt:   r.scheduled_at,
  createdAt:     r.created_at,
  updatedAt:     r.updated_at,
  author:        buildAuthor(r),
  category:      buildCategory(r),
  tags:          r.tags_str  ? r.tags_str.split(',')  : [],
  likes:         r.likes_str ? r.likes_str.split(',') : [],
});

const POST_SELECT = `
  SELECT p.id, p.title, p.title_bn, p.title_en, p.slug, p.excerpt, p.excerpt_bn, p.excerpt_en,
         p.featured_image, p.status, p.views, p.unique_views, p.is_featured, p.is_deleted,
         p.read_time, p.language, p.location, p.subcategory, p.seo_title, p.seo_description,
         p.published_at, p.scheduled_at, p.created_at, p.updated_at,
         u.id AS author_id, u.username AS author_username,
         u.display_name AS author_display_name, u.avatar AS author_avatar, u.bio AS author_bio,
         c.id AS category_id, c.name AS category_name, c.name_bn AS category_name_bn,
         c.name_en AS category_name_en, c.slug AS category_slug,
         c.color AS category_color, c.icon AS category_icon,
         GROUP_CONCAT(DISTINCT pt.tag ORDER BY pt.tag SEPARATOR ',') AS tags_str,
         GROUP_CONCAT(DISTINCT CAST(pl.user_id AS CHAR) SEPARATOR ',') AS likes_str
  FROM posts p
  JOIN users u ON u.id = p.author_id
  JOIN categories c ON c.id = p.category_id
  LEFT JOIN post_tags pt ON pt.post_id = p.id
  LEFT JOIN post_likes pl ON pl.post_id = p.id
`;

const sendNotification = async (io, data) => {
  try {
    const [result] = await pool.execute(
      `INSERT INTO notifications (recipient_id, sender_id, type, post_id, comment_id, message, link)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.recipient, data.sender || null, data.type, data.post || null, data.comment || null, data.message, data.link || '']
    );
    const [rows] = await pool.execute(
      `SELECT n.*, u.username AS sender_username, u.display_name AS sender_display_name, u.avatar AS sender_avatar
       FROM notifications n LEFT JOIN users u ON u.id = n.sender_id WHERE n.id = ?`,
      [result.insertId]
    );
    if (rows.length) {
      const n = rows[0];
      const notif = { ...n, _id: String(n.id), sender: n.sender_id ? { _id: String(n.sender_id), username: n.sender_username, displayName: n.sender_display_name, avatar: n.sender_avatar || '' } : null };
      io.to(String(data.recipient)).emit('notification', notif);
    }
  } catch (_) {}
};

// GET /api/posts
router.get('/', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 12, category, tag, author, sort = 'latest', status = 'published' } = req.query;
    const skip   = (parseInt(page) - 1) * parseInt(limit);
    const params = [];
    const where  = ['p.is_deleted = 0'];

    if (status === 'published') { where.push('p.status = ?'); params.push('published'); }
    if (category)               { where.push('p.category_id = ?'); params.push(parseInt(category)); }
    if (author)                 { where.push('p.author_id = ?');   params.push(parseInt(author));   }
    if (tag)                    { where.push('EXISTS (SELECT 1 FROM post_tags pt2 WHERE pt2.post_id = p.id AND pt2.tag = ?)'); params.push(tag.toLowerCase()); }

    const orderMap = { popular: 'p.views DESC', trending: 'p.views DESC, created_at DESC', latest: 'p.created_at DESC' };
    const order    = orderMap[sort] || 'p.created_at DESC';

    const sql = `${POST_SELECT} WHERE ${where.join(' AND ')} GROUP BY p.id ORDER BY ${order} LIMIT ? OFFSET ?`;
    const [posts] = await pool.execute(sql, [...params, parseInt(limit), skip]);

    const [countRows] = await pool.execute(
      `SELECT COUNT(DISTINCT p.id) AS total FROM posts p WHERE ${where.join(' AND ')}`,
      params
    );
    const total = countRows[0].total;

    res.json({
      success: true,
      posts: posts.map(buildPost),
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/posts/trending
router.get('/trending', async (req, res) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 19).replace('T', ' ');
    const [posts] = await pool.execute(
      `${POST_SELECT} WHERE p.status = 'published' AND p.is_deleted = 0 AND p.published_at >= ?
       GROUP BY p.id ORDER BY p.views DESC, p.created_at DESC LIMIT 10`,
      [since]
    );
    res.json({ success: true, posts: posts.map(buildPost) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/posts/featured
router.get('/featured', async (req, res) => {
  try {
    const [posts] = await pool.execute(
      `${POST_SELECT} WHERE p.status = 'published' AND p.is_deleted = 0 AND p.is_featured = 1
       GROUP BY p.id ORDER BY p.published_at DESC LIMIT 5`
    );
    res.json({ success: true, posts: posts.map(buildPost) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/posts/short-clips
router.get('/short-clips', async (req, res) => {
  try {
    const [posts] = await pool.execute(
      `${POST_SELECT}
       JOIN post_videos pv ON pv.post_id = p.id AND pv.is_short_clip = 1
       WHERE p.status = 'published' AND p.is_deleted = 0
       GROUP BY p.id ORDER BY p.created_at DESC LIMIT 20`
    );
    res.json({ success: true, posts: posts.map(buildPost) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/posts/recommended?categoryId=&excludeId=&limit=
router.get('/recommended', optionalAuth, async (req, res) => {
  try {
    const { categoryId, excludeId, limit = 6 } = req.query;
    const params = [];
    const where  = ["p.status = 'published'", 'p.is_deleted = 0'];
    if (excludeId) { where.push('p.id != ?'); params.push(parseInt(excludeId)); }
    if (categoryId) { where.push('p.category_id = ?'); params.push(parseInt(categoryId)); }
    const [posts] = await pool.execute(
      `${POST_SELECT} WHERE ${where.join(' AND ')}
       GROUP BY p.id ORDER BY (p.views * 0.4 + p.unique_views * 0.6) DESC, p.published_at DESC
       LIMIT ?`,
      [...params, parseInt(limit)]
    );
    // If not enough in same category, fill from other categories
    if (posts.length < parseInt(limit) && categoryId) {
      const fallbackWhere = ["p.status = 'published'", 'p.is_deleted = 0'];
      const fallbackParams = [];
      if (excludeId) { fallbackWhere.push('p.id != ?'); fallbackParams.push(parseInt(excludeId)); }
      fallbackWhere.push('p.category_id != ?'); fallbackParams.push(parseInt(categoryId));
      const need = parseInt(limit) - posts.length;
      const [extras] = await pool.execute(
        `${POST_SELECT} WHERE ${fallbackWhere.join(' AND ')}
         GROUP BY p.id ORDER BY p.views DESC LIMIT ?`,
        [...fallbackParams, need]
      );
      posts.push(...extras);
    }
    res.json({ success: true, posts: posts.map(buildPost) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/posts/my-posts
router.get('/my-posts', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const skip   = (parseInt(page) - 1) * parseInt(limit);
    const params = [req.user.id];
    const where  = ['p.author_id = ?', 'p.is_deleted = 0'];
    if (status) { where.push('p.status = ?'); params.push(status); }

    const [posts] = await pool.execute(
      `${POST_SELECT} WHERE ${where.join(' AND ')} GROUP BY p.id ORDER BY p.updated_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), skip]
    );
    const [countRows] = await pool.execute(
      `SELECT COUNT(*) AS total FROM posts p WHERE ${where.join(' AND ')}`,
      params
    );
    const total = countRows[0].total;

    res.json({
      success: true,
      posts: posts.map(buildPost),
      pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/posts/:slug
router.get('/:slug', optionalAuth, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      `${POST_SELECT}
       WHERE p.slug = ? AND p.is_deleted = 0
       GROUP BY p.id LIMIT 1`,
      [req.params.slug]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    const r    = rows[0];
    const post = buildPost(r);

    if (r.status !== 'published' && (!req.user || String(req.user.id) !== String(r.author_id))) {
      return res.status(403).json({ success: false, message: 'Post not available' });
    }

    // Track view
    const clientIP    = (req.headers['x-forwarded-for'] || req.socket.remoteAddress || '').split(',')[0].trim();
    const [viewCheck] = await pool.execute(
      'SELECT id FROM post_view_history WHERE post_id = ? AND ip = ? LIMIT 1',
      [r.id, clientIP]
    );
    const isUniqueView = viewCheck.length === 0;

    if (isUniqueView) {
      await pool.execute('INSERT INTO post_view_history (post_id, ip) VALUES (?, ?)', [r.id, clientIP]);
      await pool.execute(
        'UPDATE posts SET views = views + 1, unique_views = unique_views + 1 WHERE id = ?',
        [r.id]
      );
    } else {
      await pool.execute('UPDATE posts SET views = views + 1 WHERE id = ?', [r.id]);
    }

    // Analytics upsert
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dateStr = today.toISOString().slice(0, 10);
    await pool.execute(
      `INSERT INTO analytics (post_id, date, views, unique_views)
       VALUES (?, ?, 1, ?)
       ON DUPLICATE KEY UPDATE views = views + 1, unique_views = unique_views + ?`,
      [r.id, dateStr, isUniqueView ? 1 : 0, isUniqueView ? 1 : 0]
    );

    // Fetch content + media separately for full detail response
    const [contentRow] = await pool.execute(
      'SELECT content, content_bn, content_en FROM posts WHERE id = ? LIMIT 1',
      [r.id]
    );
    const [images]  = await pool.execute('SELECT url FROM post_images WHERE post_id = ? ORDER BY sort_order', [r.id]);
    const [videos]  = await pool.execute('SELECT url, thumbnail, title, is_short_clip FROM post_videos WHERE post_id = ?', [r.id]);

    // Author follower count for profile card
    const [followerCount] = await pool.execute(
      'SELECT COUNT(*) AS cnt FROM user_follows WHERE followed_id = ?',
      [r.author_id]
    );

    // Related posts
    const [related] = await pool.execute(
      `${POST_SELECT}
       WHERE p.category_id = ? AND p.status = 'published' AND p.is_deleted = 0 AND p.id != ?
       GROUP BY p.id ORDER BY p.views DESC LIMIT 4`,
      [r.category_id, r.id]
    );

    res.json({
      success: true,
      post: {
        ...post,
        content:   contentRow[0]?.content    || '',
        contentBn: contentRow[0]?.content_bn || '',
        contentEn: contentRow[0]?.content_en || '',
        images:    images.map((i) => i.url),
        videos:    videos.map((v) => ({ url: v.url, thumbnail: v.thumbnail || '', title: v.title || '', isShortClip: Boolean(v.is_short_clip) })),
        author:    { ...post.author, followerCount: followerCount[0]?.cnt || 0 },
        likes:     post.likes,
        views:     r.views + 1,
        uniqueViews: isUniqueView ? r.unique_views + 1 : r.unique_views,
      },
      related: related.map(buildPost),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/posts
router.post(
  '/',
  protect,
  upload.fields([
    { name: 'images',       maxCount: 10 },
    { name: 'videos',       maxCount: 5  },
    { name: 'featuredImage',maxCount: 1  },
  ]),
  async (req, res) => {
    const conn = await pool.getConnection();
    try {
      await conn.beginTransaction();

      const {
        title, titleBn, titleEn, content, contentBn, contentEn,
        excerptBn, excerptEn, category, tags, status, scheduledAt,
        seoTitle, seoDescription, location, subcategory,
      } = req.body;

      const slug          = await createSlug(title);
      const readTime      = computeReadTime(content);
      const excerpt       = computeExcerpt(content);
      const featuredImage = req.files?.featuredImage ? `/uploads/images/${req.files.featuredImage[0].filename}` : '';
      const postStatus    = status || 'draft';
      const publishedAt   = postStatus === 'published' ? new Date() : null;

      const [postResult] = await conn.execute(
        `INSERT INTO posts
         (title, title_bn, title_en, slug, content, content_bn, content_en,
          excerpt, excerpt_bn, excerpt_en, author_id, category_id, subcategory,
          featured_image, status, scheduled_at, published_at,
          seo_title, seo_description, location, read_time)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
        [
          title, titleBn || '', titleEn || '', slug,
          content, contentBn || '', contentEn || '',
          excerpt, excerptBn || '', excerptEn || '',
          req.user.id, parseInt(category), subcategory || '',
          featuredImage, postStatus, scheduledAt || null, publishedAt,
          seoTitle || '', seoDescription || '', location || '', readTime,
        ]
      );
      const postId = postResult.insertId;

      // Tags
      const parsedTags = tags ? JSON.parse(tags) : [];
      if (parsedTags.length) {
        const tagValues = parsedTags.map((t) => [postId, t.toLowerCase().trim()]);
        await conn.query('INSERT IGNORE INTO post_tags (post_id, tag) VALUES ?', [tagValues]);
      }

      // Images
      if (req.files?.images) {
        const imgValues = req.files.images.map((f, i) => [postId, `/uploads/images/${f.filename}`, i]);
        await conn.query('INSERT INTO post_images (post_id, url, sort_order) VALUES ?', [imgValues]);
      }

      // Videos
      if (req.files?.videos) {
        const vidValues = req.files.videos.map((f) => [postId, `/uploads/videos/${f.filename}`, '', '', 0]);
        await conn.query('INSERT INTO post_videos (post_id, url, thumbnail, title, is_short_clip) VALUES ?', [vidValues]);
      }

      // Increment category post_count
      await conn.execute('UPDATE categories SET post_count = post_count + 1 WHERE id = ?', [parseInt(category)]);

      await conn.commit();

      // Notify followers if published
      if (postStatus === 'published') {
        const io = req.app.get('io');
        const [followers] = await pool.execute(
          'SELECT follower_id FROM user_follows WHERE followed_id = ?',
          [req.user.id]
        );
        for (const f of followers) {
          await sendNotification(io, {
            recipient: f.follower_id,
            sender:    req.user.id,
            type:      'new_post',
            post:      postId,
            message:   `${req.user.displayName} published a new post: "${title}"`,
            link:      `/blog/${slug}`,
          });
        }
      }

      // Return full post
      const [postRows] = await pool.execute(
        `${POST_SELECT} WHERE p.id = ? GROUP BY p.id LIMIT 1`,
        [postId]
      );
      const [contentRow] = await pool.execute(
        'SELECT content, content_bn, content_en FROM posts WHERE id = ?',
        [postId]
      );

      res.status(201).json({
        success: true,
        message: 'Post created successfully',
        post: {
          ...buildPost(postRows[0]),
          content:   contentRow[0]?.content    || '',
          contentBn: contentRow[0]?.content_bn || '',
          contentEn: contentRow[0]?.content_en || '',
          images:    req.files?.images ? req.files.images.map((f) => `/uploads/images/${f.filename}`) : [],
          videos:    req.files?.videos ? req.files.videos.map((f) => ({ url: `/uploads/videos/${f.filename}`, isShortClip: false })) : [],
        },
      });
    } catch (error) {
      await conn.rollback();
      res.status(500).json({ success: false, message: error.message });
    } finally {
      conn.release();
    }
  }
);

// PUT /api/posts/:id
router.put(
  '/:id',
  protect,
  upload.fields([
    { name: 'images',       maxCount: 10 },
    { name: 'videos',       maxCount: 5  },
    { name: 'featuredImage',maxCount: 1  },
  ]),
  async (req, res) => {
    const conn = await pool.getConnection();
    try {
      const [existing] = await conn.execute(
        'SELECT id, author_id, slug, status FROM posts WHERE id = ? AND is_deleted = 0 LIMIT 1',
        [req.params.id]
      );
      if (!existing.length) {
        conn.release();
        return res.status(404).json({ success: false, message: 'Post not found' });
      }
      const post = existing[0];
      if (String(post.author_id) !== String(req.user.id) && req.user.role !== 'admin') {
        conn.release();
        return res.status(403).json({ success: false, message: 'Not authorized' });
      }

      await conn.beginTransaction();

      const {
        title, titleBn, titleEn, content, contentBn, contentEn,
        excerptBn, excerptEn, category, tags, status, scheduledAt,
        seoTitle, seoDescription, location, subcategory,
      } = req.body;

      const updates  = [];
      const vals     = [];

      if (title) {
        if (title !== post.title) {
          const newSlug = await createSlug(title);
          updates.push('slug = ?'); vals.push(newSlug);
        }
        updates.push('title = ?'); vals.push(title);
      }
      if (titleBn  !== undefined) { updates.push('title_bn = ?');  vals.push(titleBn); }
      if (titleEn  !== undefined) { updates.push('title_en = ?');  vals.push(titleEn); }
      if (content) {
        updates.push('content = ?');   vals.push(content);
        updates.push('read_time = ?'); vals.push(computeReadTime(content));
      }
      if (contentBn  !== undefined) { updates.push('content_bn = ?');  vals.push(contentBn);  }
      if (contentEn  !== undefined) { updates.push('content_en = ?');  vals.push(contentEn);  }
      if (excerptBn  !== undefined) { updates.push('excerpt_bn = ?');  vals.push(excerptBn);  }
      if (excerptEn  !== undefined) { updates.push('excerpt_en = ?');  vals.push(excerptEn);  }
      if (category)    { updates.push('category_id = ?');   vals.push(parseInt(category)); }
      if (subcategory) { updates.push('subcategory = ?');   vals.push(subcategory); }
      if (status) {
        updates.push('status = ?'); vals.push(status);
        if (status === 'published' && post.status !== 'published') {
          updates.push('published_at = NOW()');
        }
      }
      if (scheduledAt)    { updates.push('scheduled_at = ?');    vals.push(scheduledAt);    }
      if (seoTitle)       { updates.push('seo_title = ?');       vals.push(seoTitle);       }
      if (seoDescription) { updates.push('seo_description = ?'); vals.push(seoDescription); }
      if (location)       { updates.push('location = ?');        vals.push(location);       }
      if (req.files?.featuredImage) {
        updates.push('featured_image = ?');
        vals.push(`/uploads/images/${req.files.featuredImage[0].filename}`);
      }

      if (updates.length) {
        await conn.execute(`UPDATE posts SET ${updates.join(', ')} WHERE id = ?`, [...vals, post.id]);
      }

      // Tags — replace entirely if provided
      if (tags) {
        const parsed = JSON.parse(tags);
        await conn.execute('DELETE FROM post_tags WHERE post_id = ?', [post.id]);
        if (parsed.length) {
          const tagValues = parsed.map((t) => [post.id, t.toLowerCase().trim()]);
          await conn.query('INSERT IGNORE INTO post_tags (post_id, tag) VALUES ?', [tagValues]);
        }
      }

      // Append new images/videos
      if (req.files?.images) {
        const [maxOrder] = await conn.execute('SELECT IFNULL(MAX(sort_order),0)+1 AS next FROM post_images WHERE post_id = ?', [post.id]);
        const start = maxOrder[0].next;
        const imgValues = req.files.images.map((f, i) => [post.id, `/uploads/images/${f.filename}`, start + i]);
        await conn.query('INSERT INTO post_images (post_id, url, sort_order) VALUES ?', [imgValues]);
      }
      if (req.files?.videos) {
        const vidValues = req.files.videos.map((f) => [post.id, `/uploads/videos/${f.filename}`, '', '', 0]);
        await conn.query('INSERT INTO post_videos (post_id, url, thumbnail, title, is_short_clip) VALUES ?', [vidValues]);
      }

      await conn.commit();

      const [postRows] = await pool.execute(`${POST_SELECT} WHERE p.id = ? GROUP BY p.id LIMIT 1`, [post.id]);
      const [contentRow] = await pool.execute('SELECT content, content_bn, content_en FROM posts WHERE id = ?', [post.id]);
      const [images]  = await pool.execute('SELECT url FROM post_images WHERE post_id = ? ORDER BY sort_order', [post.id]);
      const [videos]  = await pool.execute('SELECT url, thumbnail, title, is_short_clip FROM post_videos WHERE post_id = ?', [post.id]);

      res.json({
        success: true,
        message: 'Post updated successfully',
        post: {
          ...buildPost(postRows[0]),
          content:   contentRow[0]?.content    || '',
          contentBn: contentRow[0]?.content_bn || '',
          contentEn: contentRow[0]?.content_en || '',
          images:    images.map((i) => i.url),
          videos:    videos.map((v) => ({ url: v.url, thumbnail: v.thumbnail || '', title: v.title || '', isShortClip: Boolean(v.is_short_clip) })),
        },
      });
    } catch (error) {
      await conn.rollback();
      res.status(500).json({ success: false, message: error.message });
    } finally {
      conn.release();
    }
  }
);

// DELETE /api/posts/:id (soft delete)
router.delete('/:id', protect, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, author_id FROM posts WHERE id = ? AND is_deleted = 0 LIMIT 1',
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    if (String(rows[0].author_id) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await pool.execute(
      "UPDATE posts SET is_deleted = 1, status = 'deleted' WHERE id = ?",
      [rows[0].id]
    );
    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

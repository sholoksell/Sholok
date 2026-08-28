const express  = require('express');
const { pool } = require('../config/db');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

const VALID_TYPES = ['like', 'heart', 'funny', 'amazing', 'sad', 'angry', 'support'];

const summarise = (rows) => {
  const summary = { like: 0, heart: 0, funny: 0, amazing: 0, sad: 0, angry: 0, support: 0, total: 0 };
  rows.forEach((r) => { summary[r.type] = (summary[r.type] || 0) + 1; summary.total++; });
  return summary;
};

// GET /api/reactions/:postId
router.get('/:postId', optionalAuth, async (req, res) => {
  try {
    const postId  = parseInt(req.params.postId);
    const [rows]  = await pool.execute('SELECT type, user_id FROM reactions WHERE post_id = ?', [postId]);
    const summary = summarise(rows);

    let userReaction = null;
    if (req.user) {
      const mine = rows.find((r) => String(r.user_id) === String(req.user.id));
      if (mine) userReaction = mine.type;
    }

    res.json({ success: true, summary, userReaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/reactions/:postId
router.post('/:postId', protect, async (req, res) => {
  try {
    const { type } = req.body;
    if (!VALID_TYPES.includes(type)) {
      return res.status(400).json({ success: false, message: 'Invalid reaction type' });
    }

    const postId = parseInt(req.params.postId);
    const [postRows] = await pool.execute(
      'SELECT id, author_id, title, slug, is_deleted FROM posts WHERE id = ? LIMIT 1',
      [postId]
    );
    if (!postRows.length || postRows[0].is_deleted) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    const post = postRows[0];

    const [existing] = await pool.execute(
      'SELECT id, type FROM reactions WHERE post_id = ? AND user_id = ? LIMIT 1',
      [postId, req.user.id]
    );

    let removed = false;
    if (existing.length) {
      if (existing[0].type === type) {
        await pool.execute('DELETE FROM reactions WHERE id = ?', [existing[0].id]);
        removed = true;
      } else {
        await pool.execute('UPDATE reactions SET type = ? WHERE id = ?', [type, existing[0].id]);
      }
    } else {
      await pool.execute(
        'INSERT INTO reactions (post_id, user_id, type) VALUES (?, ?, ?)',
        [postId, req.user.id, type]
      );
      // Notify post author on new reaction
      if (String(post.author_id) !== String(req.user.id)) {
        try {
          const [notifResult] = await pool.execute(
            `INSERT INTO notifications (recipient_id, sender_id, type, post_id, message, link)
             VALUES (?, ?, 'new_reaction', ?, ?, ?)`,
            [post.author_id, req.user.id, postId, `${req.user.displayName} reacted to your post "${post.title}"`, `/blog/${post.slug}`]
          );
          const io = req.app.get('io');
          io.to(String(post.author_id)).emit('notification', { _id: String(notifResult.insertId), type: 'new_reaction' });
        } catch (_) {}
      }
    }

    const [allRows] = await pool.execute('SELECT type FROM reactions WHERE post_id = ?', [postId]);
    const summary   = summarise(allRows);

    res.json({ success: true, summary, userReaction: removed ? null : type, removed });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

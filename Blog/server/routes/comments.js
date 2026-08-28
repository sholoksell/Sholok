const express  = require('express');
const { pool } = require('../config/db');
const { protect, optionalAuth } = require('../middleware/auth');

const router = express.Router();

const sendNotification = async (io, data) => {
  try {
    const [result] = await pool.execute(
      `INSERT INTO notifications (recipient_id, sender_id, type, post_id, comment_id, message, link)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [data.recipient, data.sender || null, data.type, data.post || null, data.comment || null, data.message, data.link || '']
    );
    const [rows] = await pool.execute(
      `SELECT n.*, u.username AS su, u.display_name AS sdn, u.avatar AS sa
       FROM notifications n LEFT JOIN users u ON u.id = n.sender_id WHERE n.id = ?`,
      [result.insertId]
    );
    if (rows.length) {
      const n = rows[0];
      io.to(String(data.recipient)).emit('notification', {
        ...n, _id: String(n.id),
        sender: n.sender_id ? { _id: String(n.sender_id), username: n.su, displayName: n.sdn, avatar: n.sa || '' } : null,
      });
    }
  } catch (_) {}
};

const buildComment = (r, replies = []) => ({
  _id:       String(r.id),
  id:        r.id,
  postId:    String(r.post_id),
  content:   r.content,
  isDeleted: Boolean(r.is_deleted),
  isSpam:    Boolean(r.is_spam),
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  author: {
    _id:         String(r.author_id),
    username:    r.author_username,
    displayName: r.author_display_name,
    avatar:      r.author_avatar || '',
  },
  likes:      r.likes_str ? r.likes_str.split(',') : [],
  likesCount: r.likes_str ? r.likes_str.split(',').length : 0,
  replies,
  parentComment: r.parent_comment_id ? String(r.parent_comment_id) : null,
});

const COMMENT_SELECT = `
  SELECT c.id, c.post_id, c.author_id, c.content, c.parent_comment_id,
         c.is_deleted, c.is_spam, c.created_at, c.updated_at,
         u.username AS author_username, u.display_name AS author_display_name, u.avatar AS author_avatar,
         GROUP_CONCAT(DISTINCT CAST(cl.user_id AS CHAR) SEPARATOR ',') AS likes_str
  FROM comments c
  JOIN users u ON u.id = c.author_id
  LEFT JOIN comment_likes cl ON cl.comment_id = c.id
`;

// GET /api/comments/:postId
router.get('/:postId', optionalAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip    = (parseInt(page) - 1) * parseInt(limit);
    const postId  = parseInt(req.params.postId);

    // Top-level comments
    const [topLevel] = await pool.execute(
      `${COMMENT_SELECT}
       WHERE c.post_id = ? AND c.parent_comment_id IS NULL AND c.is_deleted = 0
       GROUP BY c.id ORDER BY c.created_at DESC LIMIT ? OFFSET ?`,
      [postId, parseInt(limit), skip]
    );

    const [[{ total }]] = await pool.execute(
      'SELECT COUNT(*) AS total FROM comments WHERE post_id = ? AND parent_comment_id IS NULL AND is_deleted = 0',
      [postId]
    );

    // Replies for each top-level comment
    const topIds = topLevel.map((c) => c.id);
    let replyMap = {};
    if (topIds.length) {
      const [replies] = await pool.query(
        `${COMMENT_SELECT}
         WHERE c.post_id = ? AND c.parent_comment_id IN (?) AND c.is_deleted = 0
         GROUP BY c.id ORDER BY c.created_at ASC`,
        [postId, topIds]
      );
      replies.forEach((r) => {
        if (!replyMap[r.parent_comment_id]) replyMap[r.parent_comment_id] = [];
        replyMap[r.parent_comment_id].push(buildComment(r));
      });
    }

    res.json({
      success: true,
      comments: topLevel.map((c) => buildComment(c, replyMap[c.id] || [])),
      total,
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/comments/:postId
router.post('/:postId', protect, async (req, res) => {
  try {
    const { content, parentComment } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ success: false, message: 'Comment content is required' });
    }
    if (content.length > 2000) {
      return res.status(400).json({ success: false, message: 'Comment too long (max 2000 characters)' });
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

    const [result] = await pool.execute(
      'INSERT INTO comments (post_id, author_id, content, parent_comment_id) VALUES (?, ?, ?, ?)',
      [postId, req.user.id, content.trim(), parentComment ? parseInt(parentComment) : null]
    );
    const commentId = result.insertId;

    const [commentRows] = await pool.execute(
      `${COMMENT_SELECT} WHERE c.id = ? GROUP BY c.id`,
      [commentId]
    );

    const io = req.app.get('io');

    // Notify post author
    if (String(post.author_id) !== String(req.user.id)) {
      await sendNotification(io, {
        recipient: post.author_id,
        sender:    req.user.id,
        type:      'new_comment',
        post:      postId,
        comment:   commentId,
        message:   `${req.user.displayName} commented on your post "${post.title}"`,
        link:      `/blog/${post.slug}`,
      });
    }

    // Notify parent comment author on reply
    if (parentComment) {
      const [parentRows] = await pool.execute(
        'SELECT author_id FROM comments WHERE id = ? LIMIT 1',
        [parseInt(parentComment)]
      );
      if (parentRows.length && String(parentRows[0].author_id) !== String(req.user.id)) {
        await sendNotification(io, {
          recipient: parentRows[0].author_id,
          sender:    req.user.id,
          type:      'comment_reply',
          post:      postId,
          comment:   commentId,
          message:   `${req.user.displayName} replied to your comment`,
          link:      `/blog/${post.slug}`,
        });
      }
    }

    res.status(201).json({ success: true, comment: buildComment(commentRows[0]) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/comments/:id (soft delete)
router.delete('/:id', protect, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      'SELECT id, author_id FROM comments WHERE id = ? LIMIT 1',
      [req.params.id]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }
    if (String(rows[0].author_id) !== String(req.user.id) && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    await pool.execute(
      "UPDATE comments SET is_deleted = 1, content = '[Comment deleted]' WHERE id = ?",
      [rows[0].id]
    );
    res.json({ success: true, message: 'Comment deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// POST /api/comments/:id/like (toggle)
router.post('/:id/like', protect, async (req, res) => {
  try {
    const commentId = parseInt(req.params.id);
    const [rows] = await pool.execute(
      'SELECT id FROM comments WHERE id = ? LIMIT 1',
      [commentId]
    );
    if (!rows.length) {
      return res.status(404).json({ success: false, message: 'Comment not found' });
    }

    const [existing] = await pool.execute(
      'SELECT 1 FROM comment_likes WHERE comment_id = ? AND user_id = ? LIMIT 1',
      [commentId, req.user.id]
    );

    if (existing.length) {
      await pool.execute('DELETE FROM comment_likes WHERE comment_id = ? AND user_id = ?', [commentId, req.user.id]);
    } else {
      await pool.execute('INSERT INTO comment_likes (comment_id, user_id) VALUES (?, ?)', [commentId, req.user.id]);
    }

    const [[{ cnt }]] = await pool.execute(
      'SELECT COUNT(*) AS cnt FROM comment_likes WHERE comment_id = ?',
      [commentId]
    );

    res.json({ success: true, likes: cnt, liked: !existing.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

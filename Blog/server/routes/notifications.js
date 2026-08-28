const express  = require('express');
const { pool } = require('../config/db');
const { protect } = require('../middleware/auth');

const router = express.Router();

const buildNotification = (r) => ({
  _id:       String(r.id),
  type:      r.type,
  message:   r.message,
  isRead:    Boolean(r.is_read),
  link:      r.link      || '',
  createdAt: r.created_at,
  updatedAt: r.updated_at,
  sender:    r.sender_id ? { _id: String(r.sender_id), username: r.su, displayName: r.sdn, avatar: r.sa || '' } : null,
  post:      r.post_id   ? { _id: String(r.post_id),  title: r.post_title, slug: r.post_slug } : null,
});

const NOTIF_SELECT = `
  SELECT n.id, n.type, n.message, n.is_read, n.link, n.created_at, n.updated_at,
         n.sender_id, n.post_id, n.comment_id,
         u.username AS su, u.display_name AS sdn, u.avatar AS sa,
         p.title AS post_title, p.slug AS post_slug
  FROM notifications n
  LEFT JOIN users u ON u.id = n.sender_id
  LEFT JOIN posts p ON p.id  = n.post_id
`;

// GET /api/notifications
router.get('/', protect, async (req, res) => {
  try {
    const { page = 1, limit = 20, unreadOnly } = req.query;
    const skip   = (parseInt(page) - 1) * parseInt(limit);
    const where  = ['n.recipient_id = ?'];
    const params = [req.user.id];

    if (unreadOnly === 'true') { where.push('n.is_read = 0'); }

    const [notifications] = await pool.execute(
      `${NOTIF_SELECT} WHERE ${where.join(' AND ')} ORDER BY n.created_at DESC LIMIT ? OFFSET ?`,
      [...params, parseInt(limit), skip]
    );
    const [[{ total }]] = await pool.execute(
      `SELECT COUNT(*) AS total FROM notifications n WHERE ${where.join(' AND ')}`,
      params
    );
    const [[{ unreadCount }]] = await pool.execute(
      'SELECT COUNT(*) AS unreadCount FROM notifications WHERE recipient_id = ? AND is_read = 0',
      [req.user.id]
    );

    res.json({
      success: true,
      notifications: notifications.map(buildNotification),
      total,
      unreadCount,
      pages: Math.ceil(total / parseInt(limit)),
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/notifications/read-all
router.put('/read-all', protect, async (req, res) => {
  try {
    await pool.execute(
      'UPDATE notifications SET is_read = 1 WHERE recipient_id = ? AND is_read = 0',
      [req.user.id]
    );
    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// PUT /api/notifications/:id/read
router.put('/:id/read', protect, async (req, res) => {
  try {
    const [result] = await pool.execute(
      'UPDATE notifications SET is_read = 1 WHERE id = ? AND recipient_id = ?',
      [req.params.id, req.user.id]
    );
    if (!result.affectedRows) {
      return res.status(404).json({ success: false, message: 'Notification not found' });
    }
    const [rows] = await pool.execute(
      `${NOTIF_SELECT} WHERE n.id = ? LIMIT 1`,
      [req.params.id]
    );
    res.json({ success: true, notification: buildNotification(rows[0]) });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// DELETE /api/notifications/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await pool.execute(
      'DELETE FROM notifications WHERE id = ? AND recipient_id = ?',
      [req.params.id, req.user.id]
    );
    res.json({ success: true, message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET /api/notifications/unread-count
router.get('/unread-count', protect, async (req, res) => {
  try {
    const [[{ count }]] = await pool.execute(
      'SELECT COUNT(*) AS count FROM notifications WHERE recipient_id = ? AND is_read = 0',
      [req.user.id]
    );
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;

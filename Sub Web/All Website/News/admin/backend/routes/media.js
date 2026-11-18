const router = require('express').Router();
const pool = require('../db');
const auth = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const UPLOAD_DIR = process.env.UPLOAD_DIR || path.join(__dirname, '..', 'uploads', 'news');
if (!fs.existsSync(UPLOAD_DIR)) fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    const allowed = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
    cb(allowed.includes(file.mimetype) ? null : new Error('Invalid file type'), allowed.includes(file.mimetype));
  },
});

const BASE_URL = process.env.BASE_URL || '';

router.get('/', auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 30;
    const offset = (page - 1) * limit;
    const [rows] = await pool.query('SELECT * FROM news_media ORDER BY created_at DESC LIMIT ? OFFSET ?', [limit, offset]);
    const [[{ total }]] = await pool.query('SELECT COUNT(*) as total FROM news_media');
    res.json({ items: rows, total, page, limit });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/upload', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    const url = `${BASE_URL}/news-uploads/${req.file.filename}`;
    const [r] = await pool.query(
      'INSERT INTO news_media (filename, original_name, mime_type, size, url, alt_text, title, uploaded_by) VALUES (?,?,?,?,?,?,?,?)',
      [req.file.filename, req.file.originalname, req.file.mimetype, req.file.size, url, req.body.alt_text||'', req.body.title||'', req.admin.id]
    );
    const [[row]] = await pool.query('SELECT * FROM news_media WHERE id=?', [r.insertId]);
    res.status(201).json(row);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const { alt_text, title } = req.body;
    await pool.query('UPDATE news_media SET alt_text=?, title=? WHERE id=?', [alt_text||'', title||'', req.params.id]);
    const [[row]] = await pool.query('SELECT * FROM news_media WHERE id=?', [req.params.id]);
    res.json(row);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM news_media WHERE id=?', [req.params.id]);
    if (!row) return res.status(404).json({ message: 'Not found' });
    const filepath = path.join(UPLOAD_DIR, row.filename);
    if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
    await pool.query('DELETE FROM news_media WHERE id=?', [req.params.id]);
    res.json({ message: 'Deleted' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;

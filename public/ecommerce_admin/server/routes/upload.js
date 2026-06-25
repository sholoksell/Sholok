const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');

// Use memory storage — Vercel filesystem is read-only
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(file.originalname.toLowerCase().split('.').pop());
  const mimetype = allowedTypes.test(file.mimetype);
  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter,
});

const toDataUrl = (file) =>
  `data:${file.mimetype};base64,${file.buffer.toString('base64')}`;

// Upload single image
router.post('/single', auth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
    res.json({
      message: 'File uploaded successfully',
      url: toDataUrl(req.file),
      filename: req.file.originalname,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
});

// Upload multiple images
router.post('/multiple', auth, upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0)
      return res.status(400).json({ message: 'No files uploaded' });
    res.json({
      message: 'Files uploaded successfully',
      urls: req.files.map(toDataUrl),
      count: req.files.length,
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
});

// Delete image — data URLs have no server-side file, just acknowledge
router.delete('/:filename', auth, (req, res) => {
  res.json({ message: 'File removed' });
});

module.exports = router;

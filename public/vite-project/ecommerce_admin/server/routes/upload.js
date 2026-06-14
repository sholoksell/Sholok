const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Convert any text into an SEO-friendly slug
const slugify = (text) => {
  if (!text) return '';
  return String(text)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 80);
};

// Build a unique, SEO-friendly filename for an upload
const buildSeoFilename = (req, file) => {
  const ext = path.extname(file.originalname).toLowerCase() || '.jpg';
  const baseSlug = slugify(req.body.name) || slugify(path.basename(file.originalname, ext)) || 'image';

  // Prefer plain `slug.ext`; if it exists, append -2, -3, ... until a free name is found
  let candidate = `${baseSlug}${ext}`;
  let counter = 2;
  while (fs.existsSync(path.join(uploadDir, candidate))) {
    candidate = `${baseSlug}-${counter}${ext}`;
    counter += 1;
    if (counter > 9999) {
      // Safety fallback to avoid infinite loop
      candidate = `${baseSlug}-${Date.now()}${ext}`;
      break;
    }
  }
  return candidate;
};

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    try {
      cb(null, buildSeoFilename(req, file));
    } catch (err) {
      cb(err);
    }
  }
});

// File filter to accept only images
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'));
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: fileFilter
});

// Upload single image
router.post('/single', auth, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const imageUrl = `/uploads/${req.file.filename}`;
    res.json({
      message: 'File uploaded successfully',
      url: imageUrl,
      filename: req.file.filename
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
});

// Upload multiple images
router.post('/multiple', auth, upload.array('images', 10), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const imageUrls = req.files.map(file => `/uploads/${file.filename}`);
    res.json({
      message: 'Files uploaded successfully',
      urls: imageUrls,
      count: req.files.length
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'File upload failed', error: error.message });
  }
});

// Delete image
router.delete('/:filename', auth, (req, res) => {
  try {
    const filename = req.params.filename;
    const filePath = path.join(uploadDir, filename);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ message: 'File not found' });
    }
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'File deletion failed', error: error.message });
  }
});

module.exports = router;

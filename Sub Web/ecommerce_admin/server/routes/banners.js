const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

function fmtBanner(row) {
  if (!row) return null;
  return {
    _id:             row.id,
    title:           row.title,
    titleBn:         row.title_bn,
    subtitle:        row.subtitle,
    description:     row.description,
    image:           row.image,
    imageMobile:     row.image_mobile,
    link:            row.link_url,
    linkUrl:         row.link_url,
    linkText:        row.link_text,
    backgroundColor: row.background_color,
    textColor:       row.text_color,
    buttonColor:     row.button_color,
    isActive:        !!row.is_active,
    startDate:       row.start_date,
    endDate:         row.end_date,
    position:        row.position,
    order:           row.sort_order,
    createdAt:       row.created_at,
    updatedAt:       row.updated_at,
  };
}

// GET / — public (storefront) + admin
router.get('/', async (req, res) => {
  try {
    const { active, position } = req.query;
    const conditions = [];
    const params = [];

    if (active !== 'false') {
      conditions.push('is_active = 1');
    }
    if (position) {
      conditions.push('position = ?');
      params.push(position);
    }

    const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
    const [banners] = await pool.query(
      `SELECT * FROM banners ${where} ORDER BY sort_order ASC, created_at DESC`, params
    );

    const now = new Date();
    const visible = banners.filter(b => {
      if (b.start_date && new Date(b.start_date) > now) return false;
      if (b.end_date   && new Date(b.end_date)   < now) return false;
      return true;
    });

    const formatted = visible.map(fmtBanner);
    res.json({ banners: formatted, data: formatted });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /:id
router.get('/:id', async (req, res) => {
  try {
    const [[banner]] = await pool.query('SELECT * FROM banners WHERE id = ? LIMIT 1', [req.params.id]);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    res.json(fmtBanner(banner));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      title = '', titleBn = '', subtitle = '', description = '',
      image = '', imageMobile = '', link = '', linkText = 'Shop Now',
      backgroundColor = '#ffffff', textColor = '#000000', buttonColor = '#E31E24',
      isActive = true, startDate, endDate, position = 'hero', order: sortOrder = 0,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO banners (title, title_bn, subtitle, description, image, image_mobile, link_url, link_text, background_color, text_color, button_color, is_active, start_date, end_date, position, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, titleBn, subtitle, description, image, imageMobile, link, linkText, backgroundColor, textColor, buttonColor, isActive ? 1 : 0, startDate || null, endDate || null, position, sortOrder]
    );

    const [[saved]] = await pool.query('SELECT * FROM banners WHERE id = ?', [result.insertId]);
    res.status(201).json(fmtBanner(saved));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const {
      title, titleBn, subtitle, description, image, imageMobile,
      link, linkText, backgroundColor, textColor, buttonColor,
      isActive, startDate, endDate, position, order: sortOrder,
    } = req.body;

    const fields = {};
    if (title !== undefined)           fields.title            = title;
    if (titleBn !== undefined)         fields.title_bn         = titleBn;
    if (subtitle !== undefined)        fields.subtitle         = subtitle;
    if (description !== undefined)     fields.description      = description;
    if (image !== undefined)           fields.image            = image;
    if (imageMobile !== undefined)     fields.image_mobile     = imageMobile;
    if (link !== undefined)            fields.link_url         = link;
    if (linkText !== undefined)        fields.link_text        = linkText;
    if (backgroundColor !== undefined) fields.background_color = backgroundColor;
    if (textColor !== undefined)       fields.text_color       = textColor;
    if (buttonColor !== undefined)     fields.button_color     = buttonColor;
    if (isActive !== undefined)        fields.is_active        = isActive ? 1 : 0;
    if (startDate !== undefined)       fields.start_date       = startDate || null;
    if (endDate !== undefined)         fields.end_date         = endDate || null;
    if (position !== undefined)        fields.position         = position;
    if (sortOrder !== undefined)       fields.sort_order       = sortOrder;

    if (Object.keys(fields).length) {
      const setClauses = Object.keys(fields).map(k => `${k} = ?`).join(', ');
      await pool.query(`UPDATE banners SET ${setClauses} WHERE id = ?`, [...Object.values(fields), req.params.id]);
    }

    const [[saved]] = await pool.query('SELECT * FROM banners WHERE id = ? LIMIT 1', [req.params.id]);
    if (!saved) return res.status(404).json({ message: 'Banner not found' });
    res.json(fmtBanner(saved));
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [[banner]] = await pool.query('SELECT id FROM banners WHERE id = ? LIMIT 1', [req.params.id]);
    if (!banner) return res.status(404).json({ message: 'Banner not found' });
    await pool.query('DELETE FROM banners WHERE id = ?', [req.params.id]);
    res.json({ message: 'Banner deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

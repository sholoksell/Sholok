const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const slugify = (text) => {
  if (!text) return '';
  return String(text).toLowerCase().normalize('NFKD')
    .replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '').substring(0, 80);
};

function fmtItem(row) {
  return {
    _id:          row.id,
    productId:    row.product_id,
    slug:         row.slug,
    name:         row.name,
    nameBn:       row.name_bn,
    image:        row.image,
    price:        row.price,
    salePrice:    row.compare_price,
    comparePrice: row.compare_price,
    unit:         row.unit,
    badge:        row.badge,
    minQty:       row.min_qty,
    description:  row.description,
    link:         row.link,
    order:        row.sort_order,
    isActive:     row.is_active !== 0,
  };
}

function fmtSection(row, items = []) {
  return {
    _id:             row.id,
    key:             row.section_key,
    title:           row.title,
    titleBn:         row.title_bn,
    subtitle:        row.subtitle,
    icon:            row.icon,
    layout:          row.layout,
    accentColor:     row.accent_color,
    backgroundColor: row.background_color,
    bannerImage:     row.banner_image,
    order:           row.sort_order,
    isActive:        !!row.is_active,
    products:        items.map(fmtItem),
    createdAt:       row.created_at,
    updatedAt:       row.updated_at,
  };
}

async function fetchSectionWithItems(id) {
  const [[row]] = await pool.query('SELECT * FROM home_sections WHERE id = ? LIMIT 1', [id]);
  if (!row) return null;
  const [items] = await pool.query('SELECT * FROM home_section_items WHERE section_id = ? ORDER BY sort_order ASC', [id]);
  return fmtSection(row, items);
}

// GET /item/:slugOrId — find item across all active sections
router.get('/item/:slugOrId', async (req, res) => {
  try {
    const { slugOrId } = req.params;

    // Try by id first, then slug
    let [items] = await pool.query(
      `SELECT hsi.*, hs.id AS section_id, hs.section_key AS section_key, hs.title AS section_title
       FROM home_section_items hsi
       JOIN home_sections hs ON hs.id = hsi.section_id
       WHERE hs.is_active = 1 AND (hsi.id = ? OR hsi.slug = ?)
       LIMIT 1`,
      [isNaN(slugOrId) ? 0 : parseInt(slugOrId), slugOrId]
    );

    if (!items.length) return res.status(404).json({ message: 'Item not found' });
    const item = items[0];

    res.json({
      item: fmtItem(item),
      section: { _id: item.section_id, key: item.section_key, title: item.section_title },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET / — list sections
router.get('/', async (req, res) => {
  try {
    const { all } = req.query;
    const where = all === 'true' ? '' : 'WHERE is_active = 1';
    const [rows] = await pool.query(`SELECT * FROM home_sections ${where} ORDER BY sort_order ASC, created_at ASC`);

    const sections = [];
    for (const row of rows) {
      let itemWhere = 'WHERE section_id = ?';
      if (all !== 'true') itemWhere += ' AND is_active = 1';
      const [items] = await pool.query(`SELECT * FROM home_section_items ${itemWhere} ORDER BY sort_order ASC`, [row.id]);
      sections.push(fmtSection(row, items));
    }

    res.json({ sections, data: sections });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /key/:key
router.get('/key/:key', async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM home_sections WHERE section_key = ? LIMIT 1', [req.params.key]);
    if (!row) return res.status(404).json({ message: 'Section not found' });
    const [items] = await pool.query('SELECT * FROM home_section_items WHERE section_id = ? ORDER BY sort_order ASC', [row.id]);
    res.json(fmtSection(row, items));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET /:id
router.get('/:id', async (req, res) => {
  try {
    const section = await fetchSectionWithItems(req.params.id);
    if (!section) return res.status(404).json({ message: 'Section not found' });
    res.json(section);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /
router.post('/', authMiddleware, async (req, res) => {
  try {
    const {
      key, title = '', titleBn = '', subtitle = '', icon = '',
      layout = 'carousel', accentColor = '', backgroundColor = '',
      bannerImage = '', order: sortOrder = 0, isActive = true,
    } = req.body;

    const [result] = await pool.query(
      `INSERT INTO home_sections (section_key, title, title_bn, subtitle, icon, layout, accent_color, background_color, banner_image, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [key, title, titleBn, subtitle, icon, layout, accentColor, backgroundColor, bannerImage, sortOrder, isActive ? 1 : 0]
    );

    const section = await fetchSectionWithItems(result.insertId);
    res.status(201).json(section);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { key, title, titleBn, subtitle, icon, layout, accentColor, backgroundColor, bannerImage, order: sortOrder, isActive, products } = req.body;

    const fields = {};
    if (key !== undefined)             fields.section_key       = key;
    if (title !== undefined)           fields.title             = title;
    if (titleBn !== undefined)         fields.title_bn          = titleBn;
    if (subtitle !== undefined)        fields.subtitle          = subtitle;
    if (icon !== undefined)            fields.icon              = icon;
    if (layout !== undefined)          fields.layout            = layout;
    if (accentColor !== undefined)     fields.accent_color      = accentColor;
    if (backgroundColor !== undefined) fields.background_color  = backgroundColor;
    if (bannerImage !== undefined)     fields.banner_image      = bannerImage;
    if (sortOrder !== undefined)       fields.sort_order        = sortOrder;
    if (isActive !== undefined)        fields.is_active         = isActive ? 1 : 0;

    if (Object.keys(fields).length) {
      const setClauses = Object.keys(fields).map(k => `${k} = ?`).join(', ');
      await pool.query(`UPDATE home_sections SET ${setClauses} WHERE id = ?`, [...Object.values(fields), req.params.id]);
    }

    // If products array is sent, replace all items
    if (Array.isArray(products)) {
      await pool.query('DELETE FROM home_section_items WHERE section_id = ?', [req.params.id]);
      for (let i = 0; i < products.length; i++) {
        const item = products[i];
        if (!item.slug && item.name) item.slug = slugify(item.name);
        await pool.query(
          `INSERT INTO home_section_items (section_id, product_id, name, name_bn, slug, image, price, compare_price, unit, badge, min_qty, description, link, sort_order, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [req.params.id, item.productId || null, item.name || '', item.nameBn || '', item.slug || '', item.image || '', item.price || 0, item.salePrice || item.comparePrice || 0, item.unit || '', item.badge || '', item.minQty || 0, item.description || '', item.link || '', item.order ?? i, item.isActive !== false ? 1 : 0]
        );
      }
    }

    const section = await fetchSectionWithItems(req.params.id);
    if (!section) return res.status(404).json({ message: 'Section not found' });
    res.json(section);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /:id
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [[s]] = await pool.query('SELECT id FROM home_sections WHERE id = ? LIMIT 1', [req.params.id]);
    if (!s) return res.status(404).json({ message: 'Section not found' });
    await pool.query('DELETE FROM home_sections WHERE id = ?', [req.params.id]);
    res.json({ message: 'Section deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /:id/products — add item to section
router.post('/:id/products', authMiddleware, async (req, res) => {
  try {
    const [[section]] = await pool.query('SELECT id FROM home_sections WHERE id = ? LIMIT 1', [req.params.id]);
    if (!section) return res.status(404).json({ message: 'Section not found' });

    const item = { ...req.body };
    if (!item.slug && item.name) item.slug = slugify(item.name);

    const [[{ maxOrder }]] = await pool.query('SELECT COALESCE(MAX(sort_order), -1) AS maxOrder FROM home_section_items WHERE section_id = ?', [req.params.id]);

    await pool.query(
      `INSERT INTO home_section_items (section_id, product_id, name, name_bn, slug, image, price, compare_price, unit, badge, min_qty, description, link, sort_order, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.params.id, item.productId || null, item.name || '', item.nameBn || '', item.slug || '', item.image || '', item.price || 0, item.salePrice || 0, item.unit || '', item.badge || '', item.minQty || 0, item.description || '', item.link || '', maxOrder + 1, 1]
    );

    const s = await fetchSectionWithItems(req.params.id);
    res.status(201).json(s);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// PUT /:id/products/:productId — update item
router.put('/:id/products/:productId', authMiddleware, async (req, res) => {
  try {
    const [[item]] = await pool.query('SELECT id FROM home_section_items WHERE id = ? AND section_id = ? LIMIT 1', [req.params.productId, req.params.id]);
    if (!item) return res.status(404).json({ message: 'Product item not found' });

    const body = { ...req.body };
    if (!body.slug && body.name) body.slug = slugify(body.name);

    const fields = {};
    if (body.productId !== undefined)    fields.product_id   = body.productId;
    if (body.name !== undefined)         fields.name         = body.name;
    if (body.nameBn !== undefined)       fields.name_bn      = body.nameBn;
    if (body.slug !== undefined)         fields.slug         = body.slug;
    if (body.image !== undefined)        fields.image        = body.image;
    if (body.price !== undefined)        fields.price        = body.price;
    if (body.salePrice !== undefined)    fields.compare_price = body.salePrice;
    if (body.comparePrice !== undefined) fields.compare_price = body.comparePrice;
    if (body.unit !== undefined)         fields.unit         = body.unit;
    if (body.badge !== undefined)        fields.badge        = body.badge;
    if (body.minQty !== undefined)       fields.min_qty      = body.minQty;
    if (body.description !== undefined)  fields.description  = body.description;
    if (body.link !== undefined)         fields.link         = body.link;
    if (body.order !== undefined)        fields.sort_order   = body.order;
    if (body.isActive !== undefined)     fields.is_active    = body.isActive ? 1 : 0;

    if (Object.keys(fields).length) {
      const setClauses = Object.keys(fields).map(k => `${k} = ?`).join(', ');
      await pool.query(`UPDATE home_section_items SET ${setClauses} WHERE id = ?`, [...Object.values(fields), req.params.productId]);
    }

    const s = await fetchSectionWithItems(req.params.id);
    res.json(s);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /:id/products/:productId — remove item
router.delete('/:id/products/:productId', authMiddleware, async (req, res) => {
  try {
    const [[item]] = await pool.query('SELECT id FROM home_section_items WHERE id = ? AND section_id = ? LIMIT 1', [req.params.productId, req.params.id]);
    if (!item) return res.status(404).json({ message: 'Product item not found' });
    await pool.query('DELETE FROM home_section_items WHERE id = ?', [req.params.productId]);
    const s = await fetchSectionWithItems(req.params.id);
    res.json(s);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /seed-defaults
router.post('/seed-defaults', authMiddleware, async (req, res) => {
  try {
    const defaults = [
      { key: 'festival-banner',          title: 'Festival Special Offers!',         icon: '🎉', layout: 'grid',     order: -2, accentColor: '#ffffff', backgroundColor: 'linear-gradient(to right, #E31E24, #b9151a)' },
      { key: 'quick-category-buttons',   title: 'Quick Categories',                  icon: '',   layout: 'grid',     order: -1, accentColor: '#000000', backgroundColor: '#ffffff' },
      { key: 'recommended-for-you',      title: 'Recommended For You',               icon: '',   layout: 'carousel', order: 1 },
      { key: 'trending-products',        title: 'Trending Products',                 icon: '🔥', layout: 'carousel', order: 2 },
      { key: 'bread-and-more',           title: 'Bread & More',                      icon: '',   layout: 'carousel', order: 3 },
      { key: 'unilever-week',            title: 'Unilever Week',                     icon: '',   layout: 'carousel', order: 4 },
      { key: 'unilever-mega-sale',       title: 'UNILEVER MEGA SALE',                icon: '🔥', layout: 'carousel', order: 5 },
      { key: 'weekday-deals',            title: 'Weekday Deals!!!',                  icon: '',   layout: 'carousel', order: 6 },
      { key: 'cleaning-essentials',      title: 'Everyday Cleaning Essentials',      icon: '',   layout: 'carousel', order: 7 },
      { key: 'snacks-sweets',            title: 'Snacks & Sweets',                   icon: '🍪', layout: 'carousel', order: 8 },
      { key: 'todays-featured-finds',    title: "Today's Featured Finds",            icon: '',   layout: 'grid',     order: 9 },
      { key: 'spice-up-cooking',         title: 'Spice Up Your Cooking Game',        icon: '🌶️', layout: 'grid',     order: 10 },
      { key: 'happy-hour',               title: 'Happy Hour',                        icon: '',   layout: 'carousel', order: 11 },
      { key: 'fresh-vegetables-fruits',  title: 'Fresh Vegetables & Fruits',         icon: '🥬', layout: 'carousel', order: 12 },
      { key: 'beverages',                title: 'Beverages',                         icon: '🥤', layout: 'carousel', order: 13 },
      { key: 'frozen-foods',             title: 'Frozen Foods',                      icon: '🧊', layout: 'carousel', order: 14 },
      { key: 'gadgets-electronics',      title: 'Gadgets & Electronics',             icon: '📱', layout: 'carousel', order: 15 },
    ];

    const pinnedKeys = new Set(['festival-banner', 'quick-category-buttons']);
    const results = [];

    for (const def of defaults) {
      const [[existing]] = await pool.query('SELECT id, sort_order FROM home_sections WHERE section_key = ? LIMIT 1', [def.key]);

      if (!existing) {
        const [r] = await pool.query(
          `INSERT INTO home_sections (section_key, title, icon, layout, sort_order, accent_color, background_color)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [def.key, def.title, def.icon || '', def.layout, def.order, def.accentColor || '', def.backgroundColor || '']
        );
        results.push({ key: def.key, status: 'created', id: r.insertId });
      } else if (pinnedKeys.has(def.key)) {
        await pool.query('UPDATE home_sections SET sort_order = ? WHERE id = ?', [def.order, existing.id]);
        results.push({ key: def.key, status: 'pinned', id: existing.id });
      } else {
        results.push({ key: def.key, status: 'exists', id: existing.id });
      }
    }

    res.json({ message: 'Default sections ensured', results });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /reorder
router.post('/reorder', authMiddleware, async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ message: 'items must be an array' });
    for (const it of items) {
      await pool.query('UPDATE home_sections SET sort_order = ? WHERE id = ?', [it.order, it._id]);
    }
    res.json({ message: 'Order updated', count: items.length });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

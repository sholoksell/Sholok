const pool = require('../db');

function fmt(row) {
  if (!row) return null;
  return {
    _id:             row.id,
    title:           row.title,
    titleBn:         row.title_bn,
    subtitle:        row.subtitle,
    subtitleBn:      row.subtitle_bn,
    description:     row.description,
    descriptionBn:   row.description_bn,
    image:           row.image,
    imageMobile:     row.image_mobile,
    linkUrl:         row.link_url,
    linkText:        row.link_text,
    linkTextBn:      row.link_text_bn,
    backgroundColor: row.background_color,
    textColor:       row.text_color,
    buttonColor:     row.button_color,
    order:           row.sort_order,
    isActive:        !!row.is_active,
    startDate:       row.start_date,
    endDate:         row.end_date,
    position:        row.position,
    createdAt:       row.created_at,
    updatedAt:       row.updated_at,
  };
}

async function findAll({ position, isActive } = {}) {
  const conditions = [];
  const params = [];
  if (position !== undefined) { conditions.push('position = ?'); params.push(position); }
  if (isActive !== undefined) { conditions.push('is_active = ?'); params.push(isActive ? 1 : 0); }
  const where = conditions.length ? 'WHERE ' + conditions.join(' AND ') : '';
  const [rows] = await pool.query(`SELECT * FROM banners ${where} ORDER BY sort_order ASC`, params);
  return rows.map(fmt);
}

async function findActive(position = null) {
  const params = [1];
  let cond = 'is_active = ?';
  if (position) { cond += ' AND position = ?'; params.push(position); }
  const [rows] = await pool.query(`SELECT * FROM banners WHERE ${cond} ORDER BY sort_order ASC`, params);
  return rows.map(fmt);
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM banners WHERE id = ? LIMIT 1', [id]);
  return fmt(rows[0]);
}

async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO banners
       (title, title_bn, subtitle, subtitle_bn, description, description_bn,
        image, image_mobile, link_url, link_text, link_text_bn,
        background_color, text_color, button_color, sort_order, is_active,
        start_date, end_date, position)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.title, data.titleBn || '', data.subtitle || '', data.subtitleBn || '',
      data.description || '', data.descriptionBn || '',
      data.image, data.imageMobile || '', data.linkUrl || '', data.linkText || 'Shop Now', data.linkTextBn || '',
      data.backgroundColor || '#ffffff', data.textColor || '#000000', data.buttonColor || '#E31E24',
      data.order ?? 0, data.isActive !== false ? 1 : 0,
      data.startDate || null, data.endDate || null, data.position || 'hero',
    ]
  );
  return findById(result.insertId);
}

async function update(id, data) {
  const colMap = {
    title: 'title', titleBn: 'title_bn', subtitle: 'subtitle', subtitleBn: 'subtitle_bn',
    description: 'description', descriptionBn: 'description_bn',
    image: 'image', imageMobile: 'image_mobile', linkUrl: 'link_url',
    linkText: 'link_text', linkTextBn: 'link_text_bn',
    backgroundColor: 'background_color', textColor: 'text_color', buttonColor: 'button_color',
    order: 'sort_order', isActive: 'is_active', startDate: 'start_date', endDate: 'end_date', position: 'position',
  };
  const sets = [];
  const vals = [];
  for (const [js, col] of Object.entries(colMap)) {
    if (data[js] !== undefined) {
      sets.push(`${col} = ?`);
      vals.push(js === 'isActive' ? (data[js] ? 1 : 0) : data[js]);
    }
  }
  if (sets.length) { vals.push(id); await pool.query(`UPDATE banners SET ${sets.join(', ')} WHERE id = ?`, vals); }
  return findById(id);
}

async function remove(id) {
  await pool.query('DELETE FROM banners WHERE id = ?', [id]);
}

module.exports = { findAll, findActive, findById, create, update, remove };

const pool = require('../db');

// ---- Delivery Areas ----

function fmtArea(row, postalCodes = []) {
  if (!row) return null;
  return {
    _id:                   row.id,
    name:                  row.name,
    city:                  row.city,
    postalCodes,
    deliveryCharge:        Number(row.delivery_charge),
    freeDeliveryThreshold: Number(row.free_delivery_threshold),
    estimatedDeliveryDays: row.estimated_delivery_days,
    isActive:              !!row.is_active,
    createdAt:             row.created_at,
    updatedAt:             row.updated_at,
  };
}

async function _getPostalCodes(areaId) {
  const [rows] = await pool.query(
    'SELECT postal_code FROM delivery_area_postal_codes WHERE delivery_area_id = ?', [areaId]
  );
  return rows.map(r => r.postal_code);
}

async function findAllAreas() {
  const [rows] = await pool.query('SELECT * FROM delivery_areas ORDER BY name ASC');
  return Promise.all(rows.map(async r => fmtArea(r, await _getPostalCodes(r.id))));
}

async function findAreaById(id) {
  const [rows] = await pool.query('SELECT * FROM delivery_areas WHERE id = ? LIMIT 1', [id]);
  if (!rows[0]) return null;
  return fmtArea(rows[0], await _getPostalCodes(rows[0].id));
}

async function createArea(data) {
  const [result] = await pool.query(
    `INSERT INTO delivery_areas (name, city, delivery_charge, free_delivery_threshold, estimated_delivery_days, is_active)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [data.name, data.city || '', data.deliveryCharge || 0, data.freeDeliveryThreshold || 0,
     data.estimatedDeliveryDays || 1, data.isActive !== false ? 1 : 0]
  );
  const areaId = result.insertId;
  if (data.postalCodes?.length) {
    await pool.query(
      'INSERT INTO delivery_area_postal_codes (delivery_area_id, postal_code) VALUES ?',
      [data.postalCodes.map(pc => [areaId, pc])]
    );
  }
  return findAreaById(areaId);
}

async function updateArea(id, data) {
  const colMap = {
    name: 'name', city: 'city', deliveryCharge: 'delivery_charge',
    freeDeliveryThreshold: 'free_delivery_threshold', estimatedDeliveryDays: 'estimated_delivery_days',
    isActive: 'is_active',
  };
  const sets = [];
  const vals = [];
  for (const [js, col] of Object.entries(colMap)) {
    if (data[js] !== undefined) {
      sets.push(`${col} = ?`);
      vals.push(js === 'isActive' ? (data[js] ? 1 : 0) : data[js]);
    }
  }
  if (sets.length) { vals.push(id); await pool.query(`UPDATE delivery_areas SET ${sets.join(', ')} WHERE id = ?`, vals); }

  if (data.postalCodes !== undefined) {
    await pool.query('DELETE FROM delivery_area_postal_codes WHERE delivery_area_id = ?', [id]);
    if (data.postalCodes.length) {
      await pool.query(
        'INSERT INTO delivery_area_postal_codes (delivery_area_id, postal_code) VALUES ?',
        [data.postalCodes.map(pc => [id, pc])]
      );
    }
  }
  return findAreaById(id);
}

async function deleteArea(id) {
  await pool.query('DELETE FROM delivery_areas WHERE id = ?', [id]);
}

// ---- Shipping Methods ----

function fmtMethod(row) {
  if (!row) return null;
  return {
    _id:             row.id,
    name:            row.name,
    description:     row.description,
    type:            row.type,
    price:           Number(row.price),
    minOrderAmount:  Number(row.min_order_amount),
    deliveryDays:    row.delivery_days,
    isActive:        !!row.is_active,
    createdAt:       row.created_at,
    updatedAt:       row.updated_at,
  };
}

async function findAllMethods() {
  const [rows] = await pool.query('SELECT * FROM shipping_methods ORDER BY name ASC');
  return rows.map(fmtMethod);
}

async function findMethodById(id) {
  const [rows] = await pool.query('SELECT * FROM shipping_methods WHERE id = ? LIMIT 1', [id]);
  return fmtMethod(rows[0]);
}

async function createMethod(data) {
  const [result] = await pool.query(
    `INSERT INTO shipping_methods (name, description, type, price, min_order_amount, delivery_days, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [data.name, data.description || '', data.type || 'flat', data.price || 0,
     data.minOrderAmount || 0, data.deliveryDays || 1, data.isActive !== false ? 1 : 0]
  );
  return findMethodById(result.insertId);
}

async function updateMethod(id, data) {
  const colMap = {
    name: 'name', description: 'description', type: 'type', price: 'price',
    minOrderAmount: 'min_order_amount', deliveryDays: 'delivery_days', isActive: 'is_active',
  };
  const sets = [];
  const vals = [];
  for (const [js, col] of Object.entries(colMap)) {
    if (data[js] !== undefined) {
      sets.push(`${col} = ?`);
      vals.push(js === 'isActive' ? (data[js] ? 1 : 0) : data[js]);
    }
  }
  if (sets.length) { vals.push(id); await pool.query(`UPDATE shipping_methods SET ${sets.join(', ')} WHERE id = ?`, vals); }
  return findMethodById(id);
}

async function deleteMethod(id) {
  await pool.query('DELETE FROM shipping_methods WHERE id = ?', [id]);
}

async function getStats() {
  const [[areas], [methods], [ordersWithShipping]] = await Promise.all([
    pool.query('SELECT COUNT(*) AS count FROM delivery_areas WHERE is_active = 1'),
    pool.query('SELECT COUNT(*) AS count FROM shipping_methods WHERE is_active = 1'),
    pool.query("SELECT COUNT(*) AS count, SUM(shipping) AS totalShipping FROM orders WHERE shipping > 0"),
  ]);
  return { activeAreas: areas[0].count, activeMethods: methods[0].count, shipping: ordersWithShipping[0] };
}

module.exports = {
  findAllAreas, findAreaById, createArea, updateArea, deleteArea,
  findAllMethods, findMethodById, createMethod, updateMethod, deleteMethod,
  getStats,
};

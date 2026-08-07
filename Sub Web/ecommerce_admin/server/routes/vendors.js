const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

function fmt(r) {
  return {
    _id: r.id, name: r.name, businessName: r.business_name,
    email: r.email, phone: r.phone, avatar: r.avatar,
    division: r.division, district: r.district, upazila: r.upazila,
    address: r.address, status: r.status, isVerified: !!r.is_verified,
    codEnabled: !!r.cod_enabled, minSecurityBalance: Number(r.min_security_balance),
    createdAt: r.created_at, updatedAt: r.updated_at,
  };
}

// GET /api/vendors
router.get('/', authMiddleware, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    let where = '1=1';
    const params = [];
    if (status) { where += ' AND v.status = ?'; params.push(status); }
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM vendors v WHERE ${where}`, params);
    const [rows] = await pool.query(
      `SELECT v.*, vw.current_balance, vw.pending_settlement, vw.hold_amount
       FROM vendors v LEFT JOIN vendor_wallets vw ON vw.vendor_id = v.id
       WHERE ${where} ORDER BY v.created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );
    res.json({ vendors: rows.map(r => ({ ...fmt(r), wallet: { currentBalance: Number(r.current_balance || 0), pendingSettlement: Number(r.pending_settlement || 0), holdAmount: Number(r.hold_amount || 0) } })), total, page: Number(page), limit: Number(limit) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/vendors/:id
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [[vendor]] = await pool.query(
      `SELECT v.*, vw.current_balance, vw.total_deposit, vw.total_cod_collected, vw.pending_settlement, vw.hold_amount
       FROM vendors v LEFT JOIN vendor_wallets vw ON vw.vendor_id = v.id WHERE v.id = ?`, [req.params.id]
    );
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    res.json({ ...fmt(vendor), wallet: { currentBalance: Number(vendor.current_balance || 0), totalDeposit: Number(vendor.total_deposit || 0), totalCodCollected: Number(vendor.total_cod_collected || 0), pendingSettlement: Number(vendor.pending_settlement || 0), holdAmount: Number(vendor.hold_amount || 0) } });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/vendors
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { name, business_name, email, phone, division, district, upazila, address, status = 'active' } = req.body;
    if (!name || !email) return res.status(400).json({ message: 'Name and email required' });
    const [result] = await pool.query(
      `INSERT INTO vendors (name, business_name, email, phone, password_hash, division, district, upazila, address, status, is_verified) VALUES (?,?,?,?,?,?,?,?,?,'active',1)`,
      [name, business_name || null, email, phone || null, '', division || null, district || null, upazila || null, address || null]
    );
    const vendorId = result.insertId;
    await pool.query('INSERT INTO vendor_wallets (vendor_id) VALUES (?)', [vendorId]);
    const [[created]] = await pool.query('SELECT * FROM vendors WHERE id = ?', [vendorId]);
    res.status(201).json(fmt(created));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/vendors/:id
router.put('/:id', authMiddleware, async (req, res) => {
  try {
    const { name, business_name, email, phone, division, district, upazila, address, status, is_verified, cod_enabled, min_security_balance } = req.body;
    await pool.query(
      `UPDATE vendors SET name=COALESCE(?,name), business_name=COALESCE(?,business_name), email=COALESCE(?,email),
       phone=COALESCE(?,phone), division=COALESCE(?,division), district=COALESCE(?,district), upazila=COALESCE(?,upazila),
       address=COALESCE(?,address), status=COALESCE(?,status), is_verified=COALESCE(?,is_verified),
       cod_enabled=COALESCE(?,cod_enabled), min_security_balance=COALESCE(?,min_security_balance) WHERE id=?`,
      [name, business_name, email, phone, division, district, upazila, address, status, is_verified != null ? is_verified : null, cod_enabled != null ? cod_enabled : null, min_security_balance, req.params.id]
    );
    const [[updated]] = await pool.query('SELECT * FROM vendors WHERE id = ?', [req.params.id]);
    res.json(fmt(updated));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// DELETE /api/vendors/:id  (soft delete via status)
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    await pool.query("UPDATE vendors SET status='inactive' WHERE id=?", [req.params.id]);
    res.json({ message: 'Vendor deactivated' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/vendors/:id/wallet/deposit — record security deposit
router.post('/:id/wallet/deposit', authMiddleware, async (req, res) => {
  try {
    const { amount, note } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ message: 'Valid amount required' });
    const [[w]] = await pool.query('SELECT * FROM vendor_wallets WHERE vendor_id = ?', [req.params.id]);
    if (!w) return res.status(404).json({ message: 'Wallet not found' });
    const newBalance = Number(w.current_balance) + Number(amount);
    await pool.query('UPDATE vendor_wallets SET current_balance=?, total_deposit=total_deposit+? WHERE vendor_id=?', [newBalance, amount, req.params.id]);
    await pool.query(
      `INSERT INTO vendor_wallet_transactions (vendor_id, type, amount, balance_before, balance_after, note, created_by)
       VALUES (?, 'deposit', ?, ?, ?, ?, ?)`,
      [req.params.id, amount, w.current_balance, newBalance, note || 'Security deposit', req.user?.id]
    );
    res.json({ message: 'Deposit recorded', newBalance });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/vendors/:id/wallet/transactions
router.get('/:id/wallet/transactions', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM vendor_wallet_transactions WHERE vendor_id=? ORDER BY created_at DESC LIMIT 100',
      [req.params.id]
    );
    res.json(rows);
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;

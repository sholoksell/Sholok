const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

/* ── COD Transactions ── */

router.get('/cod', authMiddleware, async (req, res) => {
  try {
    const { vendor_id, status, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    let where = '1=1';
    const params = [];
    if (vendor_id) { where += ' AND vendor_id=?'; params.push(vendor_id); }
    if (status) { where += ' AND status=?'; params.push(status); }
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM cod_transactions WHERE ${where}`, params);
    const [rows] = await pool.query(`SELECT * FROM cod_transactions WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, Number(limit), offset]);
    res.json({ transactions: rows, total, page: Number(page), limit: Number(limit) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/cod/:id/collect', authMiddleware, async (req, res) => {
  try {
    const [[row]] = await pool.query('SELECT * FROM cod_transactions WHERE id=?', [req.params.id]);
    if (!row) return res.status(404).json({ message: 'Not found' });
    await pool.query("UPDATE cod_transactions SET status='collected', collected_at=NOW() WHERE id=?", [req.params.id]);
    if (row.vendor_id) {
      const [[w]] = await pool.query('SELECT * FROM vendor_wallets WHERE vendor_id=?', [row.vendor_id]);
      if (w) {
        const newBalance = Number(w.current_balance) + Number(row.amount);
        await pool.query('UPDATE vendor_wallets SET current_balance=?, total_cod_collected=total_cod_collected+? WHERE vendor_id=?', [newBalance, row.amount, row.vendor_id]);
        await pool.query("INSERT INTO vendor_wallet_transactions (vendor_id, type, amount, balance_before, balance_after, reference_id, note) VALUES (?, 'cod_hold', ?, ?, ?, ?, 'COD collected')",
          [row.vendor_id, row.amount, w.current_balance, newBalance, `COD-${row.id}`]);
      }
    }
    res.json({ message: 'COD marked as collected' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

/* ── Settlement Records ── */

router.get('/settlements', authMiddleware, async (req, res) => {
  try {
    const { vendor_id, status, page = 1, limit = 20 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);
    let where = '1=1';
    const params = [];
    if (vendor_id) { where += ' AND sr.vendor_id=?'; params.push(vendor_id); }
    if (status) { where += ' AND sr.status=?'; params.push(status); }
    const [[{ total }]] = await pool.query(`SELECT COUNT(*) as total FROM settlement_records sr WHERE ${where}`, params);
    const [rows] = await pool.query(
      `SELECT sr.*, v.name as vendor_name FROM settlement_records sr LEFT JOIN vendors v ON v.id=sr.vendor_id WHERE ${where} ORDER BY sr.created_at DESC LIMIT ? OFFSET ?`,
      [...params, Number(limit), offset]
    );
    res.json({ settlements: rows.map(r => ({
      _id: r.id, vendorId: r.vendor_id, vendorName: r.vendor_name,
      periodStart: r.period_start, periodEnd: r.period_end,
      totalAmount: Number(r.total_amount), codAmount: Number(r.cod_amount),
      platformFee: Number(r.platform_fee), netAmount: Number(r.net_amount),
      status: r.status, paymentMethod: r.payment_method, paymentRef: r.payment_ref,
      processedAt: r.processed_at, notes: r.notes, createdAt: r.created_at
    })), total, page: Number(page), limit: Number(limit) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.post('/settlements', authMiddleware, async (req, res) => {
  try {
    const { vendor_id, period_start, period_end, total_amount, cod_amount = 0, platform_fee = 0, net_amount, notes } = req.body;
    if (!vendor_id || !period_start || !period_end) return res.status(400).json({ message: 'vendor_id, period_start, period_end required' });
    const net = net_amount ?? (Number(total_amount) - Number(platform_fee));
    const [r] = await pool.query(
      'INSERT INTO settlement_records (vendor_id, period_start, period_end, total_amount, cod_amount, platform_fee, net_amount, notes) VALUES (?,?,?,?,?,?,?,?)',
      [vendor_id, period_start, period_end, total_amount, cod_amount, platform_fee, net, notes || null]
    );
    res.status(201).json({ _id: r.insertId, message: 'Settlement created' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

router.put('/settlements/:id/process', authMiddleware, async (req, res) => {
  try {
    const { payment_method, payment_ref } = req.body;
    const [[row]] = await pool.query('SELECT * FROM settlement_records WHERE id=?', [req.params.id]);
    if (!row) return res.status(404).json({ message: 'Not found' });
    await pool.query("UPDATE settlement_records SET status='processed', payment_method=?, payment_ref=?, processed_by=?, processed_at=NOW() WHERE id=?",
      [payment_method || null, payment_ref || null, req.user?.id, req.params.id]);
    const [[w]] = await pool.query('SELECT * FROM vendor_wallets WHERE vendor_id=?', [row.vendor_id]);
    if (w) {
      const newBalance = Math.max(0, Number(w.current_balance) - Number(row.net_amount));
      await pool.query('UPDATE vendor_wallets SET current_balance=?, pending_settlement=GREATEST(0,pending_settlement-?) WHERE vendor_id=?', [newBalance, row.net_amount, row.vendor_id]);
      await pool.query("INSERT INTO vendor_wallet_transactions (vendor_id, type, amount, balance_before, balance_after, reference_id, note) VALUES (?, 'settlement', ?, ?, ?, ?, 'Settlement processed')",
        [row.vendor_id, row.net_amount, w.current_balance, newBalance, `SR-${row.id}`]);
    }
    res.json({ message: 'Settlement processed' });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

module.exports = router;

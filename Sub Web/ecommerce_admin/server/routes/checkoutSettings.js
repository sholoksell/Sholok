const express = require('express');
const router = express.Router();
const pool = require('../db');
const authMiddleware = require('../middleware/auth');

const DEFAULT_PAYMENT_METHODS = [
  { key: 'cod',    label: 'Cash on Delivery',     description: 'Pay when your order arrives', enabled: true,  icon: 'cod'    },
  { key: 'bkash',  label: 'bKash',                description: 'Mobile financial service',    enabled: true,  icon: 'bkash'  },
  { key: 'nagad',  label: 'Nagad',                description: 'Mobile financial service',    enabled: true,  icon: 'nagad'  },
  { key: 'card',   label: 'Card / Online Payment', description: 'Debit or credit card',       enabled: true,  icon: 'card'   },
];

async function ensureDefaults() {
  try {
    const [[row]] = await pool.query(
      "SELECT id FROM settings WHERE group_name='checkout' AND setting_key='payment_methods' LIMIT 1"
    );
    if (!row) {
      await pool.query(
        "INSERT INTO settings (group_name, setting_key, value) VALUES ('checkout','payment_methods',?)",
        [JSON.stringify(DEFAULT_PAYMENT_METHODS)]
      );
    }
  } catch {}
}
ensureDefaults();

// GET /api/checkout-settings — public, used by checkout page
router.get('/', async (req, res) => {
  try {
    const [[row]] = await pool.query(
      "SELECT value FROM settings WHERE group_name='checkout' AND setting_key='payment_methods' LIMIT 1"
    );
    const methods = row ? JSON.parse(row.value) : DEFAULT_PAYMENT_METHODS;
    res.json({ paymentMethods: methods });
  } catch (e) {
    res.json({ paymentMethods: DEFAULT_PAYMENT_METHODS });
  }
});

// PUT /api/checkout-settings — admin only
router.put('/', authMiddleware, async (req, res) => {
  try {
    const { paymentMethods } = req.body;
    if (!Array.isArray(paymentMethods)) return res.status(400).json({ message: 'paymentMethods array required' });

    const [[existing]] = await pool.query(
      "SELECT id FROM settings WHERE group_name='checkout' AND setting_key='payment_methods' LIMIT 1"
    );
    if (existing) {
      await pool.query(
        "UPDATE settings SET value=? WHERE group_name='checkout' AND setting_key='payment_methods'",
        [JSON.stringify(paymentMethods)]
      );
    } else {
      await pool.query(
        "INSERT INTO settings (group_name, setting_key, value) VALUES ('checkout','payment_methods',?)",
        [JSON.stringify(paymentMethods)]
      );
    }
    res.json({ message: 'Checkout settings saved', paymentMethods });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;

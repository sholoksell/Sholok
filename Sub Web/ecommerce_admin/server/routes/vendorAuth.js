const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'sholok_vendor_jwt_secret_2024';
const JWT_EXPIRES = '7d';

function slugify(str) {
  return str.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').trim();
}

function fmtVendor(v) {
  return {
    _id: v.id, name: v.name, businessName: v.business_name, email: v.email,
    phone: v.phone, slug: v.slug, storeName: v.store_name, storeLogo: v.store_logo,
    storeBanner: v.store_banner, storeDescription: v.store_description,
    storePolicies: v.store_policies,
    division: v.division, district: v.district, upazila: v.upazila, address: v.address,
    city: v.city, postalCode: v.postal_code, country: v.country || 'Bangladesh',
    businessType: v.business_type, ownerName: v.owner_name,
    bankName: v.bank_name, bankAccount: v.bank_account ? '****' + String(v.bank_account).slice(-4) : null,
    bankRouting: v.bank_routing,
    commissionRate: Number(v.commission_rate || 10),
    status: v.status, isVerified: !!v.is_verified, codEnabled: !!v.cod_enabled,
    rating: v.rating ? Number(v.rating) : null, ratingCount: v.rating_count,
    totalOrders: v.total_orders, totalSales: Number(v.total_sales || 0),
    createdAt: v.created_at,
  };
}

// POST /api/vendor-auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, business_name, email, phone, password, division, district, upazila, address, store_name } = req.body;
    if (!name || !email || !password) return res.status(400).json({ message: 'Name, email and password required' });

    const [[existing]] = await pool.query('SELECT id FROM vendors WHERE email=?', [email]);
    if (existing) return res.status(409).json({ message: 'Email already registered' });

    const passwordHash = await bcrypt.hash(password, 10);
    const baseSlug = slugify(store_name || business_name || name);
    let slug = baseSlug;
    let counter = 1;
    while (true) {
      const [[s]] = await pool.query('SELECT id FROM vendors WHERE slug=?', [slug]);
      if (!s) break;
      slug = `${baseSlug}-${counter++}`;
    }

    const storeName = store_name || business_name || name;
    const [r] = await pool.query(
      `INSERT INTO vendors (name, business_name, email, phone, password_hash, slug, store_name, division, district, upazila, address, status)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,'pending')`,
      [name, business_name || null, email, phone || null, passwordHash, slug, storeName, division || null, district || null, upazila || null, address || null]
    );
    await pool.query('INSERT INTO vendor_wallets (vendor_id) VALUES (?)', [r.insertId]);

    // Notify admin
    await pool.query(
      "INSERT INTO notifications (user_id, user_type, title, message, type) VALUES (1,'admin',?,?,?)",
      ['New Vendor Registration', `${name} (${email}) has applied to become a vendor`, 'vendor']
    ).catch(() => {});

    res.status(201).json({ message: 'Registration submitted. Awaiting admin approval.', vendorId: r.insertId });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// POST /api/vendor-auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    const [[vendor]] = await pool.query('SELECT * FROM vendors WHERE email=?', [email]);
    if (!vendor) return res.status(401).json({ message: 'Invalid credentials' });
    if (vendor.status === 'pending') return res.status(403).json({ message: 'Your application is pending approval' });
    if (vendor.status === 'rejected') return res.status(403).json({ message: 'Your application was rejected' });
    if (vendor.status === 'suspended') return res.status(403).json({ message: 'Your account is suspended' });

    const valid = await bcrypt.compare(password, vendor.password_hash);
    if (!valid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: vendor.id, type: 'vendor' }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
    res.json({ token, vendor: fmtVendor(vendor) });
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// GET /api/vendor-auth/me (requires vendor token)
router.get('/me', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: 'No token' });
    const token = header.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);
    const [[vendor]] = await pool.query('SELECT * FROM vendors WHERE id=?', [decoded.id]);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    const [[wallet]] = await pool.query('SELECT * FROM vendor_wallets WHERE vendor_id=?', [vendor.id]);
    res.json({ ...fmtVendor(vendor), wallet: wallet ? { currentBalance: Number(wallet.current_balance), pendingSettlement: Number(wallet.pending_settlement), holdAmount: Number(wallet.hold_amount) } : null });
  } catch (e) { res.status(401).json({ message: 'Invalid token' }); }
});

// PUT /api/vendor-auth/profile (requires vendor token)
router.put('/profile', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: 'No token' });
    const token = header.replace('Bearer ', '');
    const decoded = jwt.verify(token, JWT_SECRET);

    const { name, business_name, business_type, owner_name, phone,
      store_name, store_description, store_policies, store_logo, store_banner,
      division, district, upazila, address, city, postal_code, country,
      bank_name, bank_account, bank_routing } = req.body;
    await pool.query(
      `UPDATE vendors SET
       name=COALESCE(?,name), business_name=COALESCE(?,business_name),
       business_type=COALESCE(?,business_type), owner_name=COALESCE(?,owner_name),
       phone=COALESCE(?,phone),
       store_name=COALESCE(?,store_name), store_description=COALESCE(?,store_description),
       store_policies=COALESCE(?,store_policies),
       store_logo=COALESCE(?,store_logo), store_banner=COALESCE(?,store_banner),
       division=COALESCE(?,division), district=COALESCE(?,district),
       upazila=COALESCE(?,upazila), address=COALESCE(?,address),
       city=COALESCE(?,city), postal_code=COALESCE(?,postal_code), country=COALESCE(?,country),
       bank_name=COALESCE(?,bank_name), bank_account=COALESCE(?,bank_account),
       bank_routing=COALESCE(?,bank_routing)
       WHERE id=?`,
      [name, business_name, business_type, owner_name, phone,
       store_name, store_description, store_policies, store_logo, store_banner,
       division, district, upazila, address, city, postal_code, country,
       bank_name, bank_account, bank_routing, decoded.id]
    );
    const [[updated]] = await pool.query('SELECT * FROM vendors WHERE id=?', [decoded.id]);
    res.json(fmtVendor(updated));
  } catch (e) { res.status(500).json({ message: e.message }); }
});

// PUT /api/vendor-auth/change-password
router.put('/change-password', async (req, res) => {
  try {
    const header = req.headers.authorization;
    if (!header) return res.status(401).json({ message: 'No token' });
    const decoded = jwt.verify(header.replace('Bearer ', ''), JWT_SECRET);
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) return res.status(400).json({ message: 'Both passwords required' });
    if (newPassword.length < 6) return res.status(400).json({ message: 'New password must be at least 6 characters' });
    const [[vendor]] = await pool.query('SELECT * FROM vendors WHERE id=?', [decoded.id]);
    if (!vendor) return res.status(404).json({ message: 'Vendor not found' });
    const valid = await bcrypt.compare(currentPassword, vendor.password_hash);
    if (!valid) return res.status(401).json({ message: 'Current password is incorrect' });
    await pool.query('UPDATE vendors SET password_hash=? WHERE id=?', [await bcrypt.hash(newPassword, 10), decoded.id]);
    res.json({ message: 'Password changed successfully' });
  } catch (e) { res.status(401).json({ message: 'Invalid token' }); }
});

module.exports = router;

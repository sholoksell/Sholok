const express = require('express');
const router = express.Router();
const pool = require('../db');

// ─── Banglish → Bengali/English transliteration dictionary ───────────────────
// Maps common Banglish romanisations to Bengali script + English equivalents
// so a query like "fol" finds both ফল and "fruit" products in MySQL.
const BANGLISH_DICT = {
  'fol':     { bn: ['ফল'],         en: ['fruit', 'fruits'] },
  'foler':   { bn: ['ফলের'],       en: ['fruit', 'fruits'] },
  'apel':    { bn: ['আপেল'],       en: ['apple'] },
  'komola':  { bn: ['কমলা'],       en: ['orange'] },
  'kola':    { bn: ['কলা'],        en: ['banana'] },
  'am':      { bn: ['আম'],         en: ['mango'] },
  'aam':     { bn: ['আম'],         en: ['mango'] },
  'mach':    { bn: ['মাছ'],        en: ['fish'] },
  'macher':  { bn: ['মাছের'],      en: ['fish'] },
  'murgi':   { bn: ['মুরগি'],      en: ['chicken', 'poultry'] },
  'chal':    { bn: ['চাল'],        en: ['rice'] },
  'sobji':   { bn: ['সবজি'],       en: ['vegetable', 'vegetables', 'veggie'] },
  'shobji':  { bn: ['সবজি'],       en: ['vegetable', 'vegetables'] },
  'mobile':  { bn: ['মোবাইল'],     en: ['mobile', 'phone', 'smartphone'] },
  'mobail':  { bn: ['মোবাইল'],     en: ['mobile', 'phone', 'smartphone'] },
  'jama':    { bn: ['জামা'],       en: ['shirt', 'clothes', 'clothing'] },
  'jamar':   { bn: ['জামার'],      en: ['shirt', 'clothes'] },
  'cha':     { bn: ['চা'],         en: ['tea'] },
  'dudh':    { bn: ['দুধ'],        en: ['milk'] },
  'dim':     { bn: ['ডিম'],        en: ['egg', 'eggs'] },
  'ruti':    { bn: ['রুটি'],       en: ['bread'] },
  'pani':    { bn: ['পানি'],       en: ['water'] },
  'morich':  { bn: ['মরিচ'],       en: ['pepper', 'chili', 'chilli'] },
  'begun':   { bn: ['বেগুন'],      en: ['eggplant', 'brinjal', 'aubergine'] },
  'alu':     { bn: ['আলু'],        en: ['potato'] },
  'peyaj':   { bn: ['পেঁয়াজ'],    en: ['onion'] },
  'piyaj':   { bn: ['পেঁয়াজ'],    en: ['onion'] },
  'roshun':  { bn: ['রসুন'],       en: ['garlic'] },
  'rosun':   { bn: ['রসুন'],       en: ['garlic'] },
  'ada':     { bn: ['আদা'],        en: ['ginger'] },
  'tel':     { bn: ['তেল'],        en: ['oil', 'cooking oil'] },
  'lebu':    { bn: ['লেবু'],       en: ['lemon', 'lime', 'citrus'] },
  'morog':   { bn: ['মোরগ'],       en: ['chicken', 'rooster'] },
  'gorur':   { bn: ['গরুর'],       en: ['beef', 'cow', 'cattle'] },
  'khasi':   { bn: ['খাসি'],       en: ['mutton', 'goat'] },
  'chingri': { bn: ['চিংড়ি'],     en: ['prawn', 'shrimp'] },
  'ilish':   { bn: ['ইলিশ'],       en: ['hilsa', 'fish'] },
  'kapor':   { bn: ['কাপড়'],       en: ['clothes', 'fabric', 'clothing'] },
  'juta':    { bn: ['জুতা'],       en: ['shoes', 'footwear', 'sandal'] },
  'ghori':   { bn: ['ঘড়ি'],        en: ['watch', 'clock'] },
  'bag':     { bn: ['ব্যাগ'],      en: ['bag', 'purse', 'backpack'] },
  'boi':     { bn: ['বই'],         en: ['book'] },
  'kalam':   { bn: ['কলম'],        en: ['pen'] },
  'gari':    { bn: ['গাড়ি'],       en: ['car', 'vehicle', 'automobile'] },
  'phone':   { bn: ['ফোন'],        en: ['phone', 'mobile', 'smartphone'] },
  'laptop':  { bn: ['ল্যাপটপ'],    en: ['laptop', 'computer', 'notebook'] },
  'tv':      { bn: ['টিভি'],       en: ['television', 'tv', 'monitor'] },
  'fridge':  { bn: ['ফ্রিজ'],      en: ['refrigerator', 'fridge'] },
  'ac':      { bn: ['এসি'],        en: ['air conditioner', 'ac', 'cooling'] },
  'narikel': { bn: ['নারকেল'],     en: ['coconut'] },
  'anar':    { bn: ['আনার'],       en: ['pomegranate'] },
  'angur':   { bn: ['আঙুর'],       en: ['grape', 'grapes'] },
  'tarbuj':  { bn: ['তরমুজ'],      en: ['watermelon'] },
  'samsung': { bn: ['স্যামসাং'],   en: ['samsung'] },
  'moja':    { bn: ['মোজা'],       en: ['socks'] },
  'shirt':   { bn: ['শার্ট'],      en: ['shirt'] },
  'pant':    { bn: ['প্যান্ট'],    en: ['pants', 'trousers'] },
  'sari':    { bn: ['শাড়ি'],       en: ['sari', 'saree'] },
  'sharee':  { bn: ['শাড়ি'],       en: ['sari', 'saree'] },
  'salwar':  { bn: ['সালোয়ার'],    en: ['salwar', 'kameez'] },
  'panjabi': { bn: ['পাঞ্জাবি'],   en: ['panjabi', 'punjabi', 'kurta'] },
  'chaddar': { bn: ['চাদর'],       en: ['blanket', 'sheet', 'shawl'] },
  'toshok':  { bn: ['তোশক'],       en: ['mattress', 'cushion'] },
  'bালিশ':  { bn: ['বালিশ'],      en: ['pillow', 'cushion'] },
  'balish':  { bn: ['বালিশ'],      en: ['pillow', 'cushion'] },
  'ghee':    { bn: ['ঘি'],         en: ['ghee', 'clarified butter'] },
  'ghi':     { bn: ['ঘি'],         en: ['ghee', 'clarified butter'] },
  'mishti':  { bn: ['মিষ্টি'],     en: ['sweet', 'sweets', 'dessert'] },
  'mishri':  { bn: ['মিশরি'],      en: ['sugar candy', 'rock sugar'] },
  'chini':   { bn: ['চিনি'],       en: ['sugar'] },
  'lal':     { bn: ['লাল'],        en: ['red'] },
  'neel':    { bn: ['নীল'],        en: ['blue'] },
  'holud':   { bn: ['হলুদ'],       en: ['yellow', 'turmeric'] },
  'sada':    { bn: ['সাদা'],       en: ['white'] },
  'kalo':    { bn: ['কালো'],       en: ['black'] },
  'shuji':   { bn: ['সুজি'],       en: ['semolina', 'suji'] },
  'daler':   { bn: ['ডালের'],      en: ['lentil', 'dal'] },
  'dal':     { bn: ['ডাল'],        en: ['lentil', 'dal', 'pulse'] },
  'payesh':  { bn: ['পায়েস'],      en: ['rice pudding', 'payesh'] },
  'halua':   { bn: ['হালুয়া'],     en: ['halwa', 'halua', 'pudding'] },
  'ros':     { bn: ['রস'],         en: ['juice'] },
  'juice':   { bn: ['জুস'],        en: ['juice'] },
};

function getBanglishExpansions(q) {
  const lower = q.toLowerCase().trim();
  const bnSet = new Set();
  const enSet = new Set();

  // If already contains Bengali characters, treat as Bengali
  if (/[ঀ-৿]/.test(q)) {
    bnSet.add(q);
    return { bnTerms: [...bnSet], enTerms: [] };
  }

  // Exact key match
  const exact = BANGLISH_DICT[lower];
  if (exact) {
    exact.bn.forEach(t => bnSet.add(t));
    exact.en.forEach(t => enSet.add(t));
  }

  // Prefix key matches (e.g. "fol" → also expose "foler" bn terms)
  for (const [key, val] of Object.entries(BANGLISH_DICT)) {
    if (key !== lower && key.startsWith(lower)) {
      val.bn.forEach(t => bnSet.add(t));
    }
  }

  return { bnTerms: [...bnSet], enTerms: [...enSet] };
}

// ─── GET /api/search/suggestions?q=...&limit=8 ────────────────────────────────
// Fast autocomplete: returns products + categories + brands.
// Handles Banglish automatically (no client-side transliteration needed).
router.get('/suggestions', async (req, res) => {
  try {
    const { q = '', limit = 8 } = req.query;
    const trimmed = q.trim();
    if (!trimmed) return res.json({ products: [], categories: [], brands: [] });

    const lim = Math.min(parseInt(limit) || 8, 20);
    const { bnTerms, enTerms } = getBanglishExpansions(trimmed);

    // All English-space terms: original query + any transliterated English equivalents
    const enSearchTerms = [...new Set([trimmed, ...enTerms])];
    // Bengali terms derived from transliteration
    const bnSearchTerms = bnTerms.length > 0 ? [...new Set([...bnTerms])] : [];

    // ── Products ────────────────────────────────────────────────────────────
    const pConds = [];
    const pParams = [];

    for (const t of enSearchTerms) {
      pConds.push('p.name LIKE ?');
      pParams.push(`%${t}%`);
    }
    for (const t of bnSearchTerms) {
      pConds.push('p.name_bn LIKE ?');
      pParams.push(`%${t}%`);
    }
    // SKU exact prefix match (for barcode / product-code lookups)
    pConds.push('p.sku LIKE ?');
    pParams.push(`${trimmed}%`);

    const [products] = await pool.query(`
      SELECT
        p.id, p.name, p.name_bn, p.slug, p.thumbnail,
        p.regular_price, p.sale_price, p.stock,
        c.name AS category_name, c.name_bn AS category_name_bn, c.slug AS category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'active' AND p.visibility = 1 AND p.stock > 0
        AND (${pConds.join(' OR ')})
      ORDER BY p.featured DESC, p.is_new DESC, p.stock DESC
      LIMIT ?
    `, [...pParams, lim]);

    // ── Categories ──────────────────────────────────────────────────────────
    const cConds = [];
    const cParams = [];

    for (const t of enSearchTerms) {
      cConds.push('name LIKE ?');
      cParams.push(`%${t}%`);
    }
    for (const t of bnSearchTerms) {
      cConds.push('name_bn LIKE ?');
      cParams.push(`%${t}%`);
    }
    if (cConds.length === 0) { cConds.push('1=0'); }

    const [categories] = await pool.query(`
      SELECT id, name, name_bn AS nameBn, slug
      FROM categories
      WHERE is_active = 1 AND (${cConds.join(' OR ')})
      LIMIT 4
    `, cParams);

    // ── Brands ──────────────────────────────────────────────────────────────
    const bConds = enSearchTerms.map(() => 'name LIKE ?');
    if (bConds.length === 0) { bConds.push('1=0'); }

    const [brands] = await pool.query(`
      SELECT id, name, slug, logo
      FROM brands
      WHERE is_active = 1 AND (${bConds.join(' OR ')})
      LIMIT 3
    `, enSearchTerms.map(t => `%${t}%`));

    res.json({
      products: products.map(p => ({
        id:               p.id,
        name:             p.name,
        nameBn:           p.name_bn || p.name,
        slug:             p.slug,
        thumbnail:        p.thumbnail,
        regular_price:    p.regular_price != null ? Number(p.regular_price) : null,
        sale_price:       p.sale_price    != null ? Number(p.sale_price)    : null,
        stock:            p.stock,
        category_name:    p.category_name,
        category_name_bn: p.category_name_bn,
        category_slug:    p.category_slug,
      })),
      categories,
      brands,
    });
  } catch (e) {
    console.error('[/api/search/suggestions]', e.message);
    res.status(500).json({ message: e.message });
  }
});

// ─── GET /api/search?q=...&category=...&sort=...&page=...&limit=... ───────────
// Full product search with filters + facets (used by the Search Results page).
router.get('/', async (req, res) => {
  try {
    const {
      q = '', category, brand, vendor, minPrice, maxPrice,
      rating, inStock, onSale, sort = 'relevance', page = 1, limit = 24,
      colors, sizes, deliveryType, tags,
    } = req.query;

    const offset = (parseInt(page) - 1) * parseInt(limit);
    const params = [];

    // Non-blocking analytics writes — crash here must not break search
    if (q.trim()) {
      const normalized = q.trim().toLowerCase();
      pool.query(
        `INSERT IGNORE INTO search_queries (query, query_normalized, results_count) VALUES (?, ?, 0)`,
        [q.trim(), normalized],
      ).catch(() => {});
    }

    let where = [`p.status = 'active' AND p.visibility = 1`];

    if (q.trim()) {
      const { bnTerms, enTerms } = getBanglishExpansions(q.trim());
      const enAll = [...new Set([q.trim(), ...enTerms])];
      const conds = [];
      for (const t of enAll) {
        const pct = `%${t}%`;
        conds.push(`p.name LIKE ? OR p.sku LIKE ? OR p.meta_keywords LIKE ?`);
        params.push(pct, pct, pct);
      }
      for (const t of bnTerms) {
        conds.push(`p.name_bn LIKE ?`);
        params.push(`%${t}%`);
      }
      // Also tag + brand + store search using original term only
      const orig = `%${q.trim()}%`;
      conds.push(`EXISTS (SELECT 1 FROM product_tags pt WHERE pt.product_id = p.id AND pt.tag LIKE ?)`);
      params.push(orig);
      conds.push(`b.name LIKE ?`);
      params.push(orig);
      conds.push(`v.store_name LIKE ?`);
      params.push(orig);
      where.push(`(${conds.join(' OR ')})`);
    }

    if (category) {
      where.push(`p.category_id IN (
        SELECT id FROM categories WHERE id = ? OR parent_id = ?
        OR parent_id IN (SELECT id FROM categories WHERE parent_id = ?)
      )`);
      params.push(category, category, category);
    }
    if (brand)    { where.push(`p.brand_id = ?`);  params.push(brand);    }
    if (vendor)   { where.push(`p.vendor_id = ?`); params.push(vendor);   }
    if (minPrice) { where.push(`COALESCE(p.sale_price, p.regular_price) >= ?`); params.push(minPrice); }
    if (maxPrice) { where.push(`COALESCE(p.sale_price, p.regular_price) <= ?`); params.push(maxPrice); }
    if (inStock === '1' || inStock === 'true') { where.push(`p.stock > 0`); }
    if (onSale  === '1' || onSale  === 'true') { where.push(`p.on_sale = 1`); }

    if (tags) {
      const tagList = tags.split(',').map(t => t.trim()).filter(Boolean);
      if (tagList.length > 0) {
        where.push(`EXISTS (SELECT 1 FROM product_tags pt WHERE pt.product_id = p.id AND pt.tag IN (${tagList.map(() => '?').join(',')}))`);
        params.push(...tagList);
      }
    }
    if (colors) {
      const colorList = colors.split(',').map(c => c.trim()).filter(Boolean);
      if (colorList.length > 0) {
        where.push(`JSON_UNQUOTE(JSON_EXTRACT(p.attributes, '$.color')) IN (${colorList.map(() => '?').join(',')})`);
        params.push(...colorList);
      }
    }
    if (sizes) {
      const sizeList = sizes.split(',').map(s => s.trim()).filter(Boolean);
      if (sizeList.length > 0) {
        where.push(`JSON_UNQUOTE(JSON_EXTRACT(p.attributes, '$.size')) IN (${sizeList.map(() => '?').join(',')})`);
        params.push(...sizeList);
      }
    }

    const whereSQL = `WHERE ${where.join(' AND ')}`;
    let orderSQL = 'ORDER BY p.featured DESC, p.id DESC';
    if (sort === 'price_asc')  orderSQL = 'ORDER BY COALESCE(p.sale_price, p.regular_price) ASC';
    if (sort === 'price_desc') orderSQL = 'ORDER BY COALESCE(p.sale_price, p.regular_price) DESC';
    if (sort === 'newest')     orderSQL = 'ORDER BY p.created_at DESC';
    if (sort === 'name_asc')   orderSQL = 'ORDER BY p.name ASC';
    if (sort === 'discount')   orderSQL = 'ORDER BY (p.compare_price - COALESCE(p.sale_price, p.regular_price)) DESC';

    const baseFromSQL = `
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b     ON p.brand_id     = b.id
      LEFT JOIN vendors v    ON p.vendor_id    = v.id
      LEFT JOIN product_tags pt ON p.id = pt.product_id
    `;

    const [[{ total }]] = await pool.query(
      `SELECT COUNT(DISTINCT p.id) as total ${baseFromSQL} ${whereSQL}`,
      params,
    );

    const [products] = await pool.query(`
      SELECT
        p.id, p.name, p.name_bn, p.slug, p.sku, p.thumbnail,
        p.regular_price, p.sale_price, p.compare_price, p.stock,
        p.on_sale, p.featured, p.is_new, p.shipping_charge, p.product_type,
        p.attributes,
        c.id as category_id, c.name as category_name, c.slug as category_slug,
        b.id as brand_id, b.name as brand_name, b.slug as brand_slug,
        v.id as vendor_id, v.store_name, v.slug as vendor_slug, v.rating as vendor_rating,
        GROUP_CONCAT(DISTINCT pt.tag) as tags
      ${baseFromSQL}
      ${whereSQL}
      GROUP BY p.id
      ${orderSQL}
      LIMIT ? OFFSET ?
    `, [...params, parseInt(limit), offset]);

    const facetFromSQL = `
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      LEFT JOIN brands b     ON p.brand_id     = b.id
      LEFT JOIN vendors v    ON p.vendor_id    = v.id
    `;

    const [[categoryFacets], [brandFacets], [vendorFacets], [priceRange]] = await Promise.all([
      pool.query(`SELECT c.id, c.name, c.name_bn AS nameBn, c.slug, COUNT(*) as count ${facetFromSQL} ${whereSQL} AND c.id IS NOT NULL GROUP BY c.id, c.name, c.name_bn, c.slug ORDER BY count DESC LIMIT 20`, params),
      pool.query(`SELECT b.id, b.name, b.slug, b.logo, COUNT(*) as count ${facetFromSQL} ${whereSQL} AND b.id IS NOT NULL GROUP BY b.id, b.name, b.slug, b.logo ORDER BY count DESC LIMIT 20`, params),
      pool.query(`SELECT v.id, v.store_name, v.slug, v.store_logo, COUNT(*) as count ${facetFromSQL} ${whereSQL} AND v.id IS NOT NULL GROUP BY v.id, v.store_name, v.slug, v.store_logo ORDER BY count DESC LIMIT 10`, params),
      pool.query(`SELECT MIN(COALESCE(p.sale_price, p.regular_price)) as min_price, MAX(COALESCE(p.sale_price, p.regular_price)) as max_price ${facetFromSQL} ${whereSQL}`, params),
    ]);

    res.json({
      products: products.map(p => ({
        ...p,
        tags:         p.tags ? p.tags.split(',') : [],
        attributes:   p.attributes ? (typeof p.attributes === 'string' ? JSON.parse(p.attributes) : p.attributes) : null,
        regular_price: Number(p.regular_price),
        sale_price:    p.sale_price    ? Number(p.sale_price)    : null,
        compare_price: p.compare_price ? Number(p.compare_price) : null,
        vendor_rating: p.vendor_rating ? Number(p.vendor_rating) : null,
      })),
      total,
      page:  parseInt(page),
      limit: parseInt(limit),
      pages: Math.ceil(total / parseInt(limit)),
      facets: {
        categories: categoryFacets,
        brands:     brandFacets,
        vendors:    vendorFacets,
        priceRange: {
          min: Number(priceRange[0]?.min_price || 0),
          max: Number(priceRange[0]?.max_price || 0),
        },
      },
    });
  } catch (e) {
    console.error('[/api/search]', e.message);
    res.status(500).json({ message: e.message });
  }
});

// ─── GET /api/search/popular ──────────────────────────────────────────────────
router.get('/popular', async (req, res) => {
  try {
    // Return hardcoded trending searches as a safe fallback
    // (popular_searches table may not exist yet)
    const trending = ['mobile', 'shirt', 'rice', 'fish', 'vegetables', 'laptop', 'shoes'];
    res.json({ popular: trending, trending });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ─── POST /api/search/history ─────────────────────────────────────────────────
router.post('/history', async (req, res) => {
  try {
    const { query, customerId, sessionId } = req.body;
    if (!query?.trim()) return res.json({ ok: true });
    const normalized = query.trim().toLowerCase();
    pool.query(
      `INSERT INTO search_queries (query, query_normalized, customer_id, session_id) VALUES (?, ?, ?, ?)`,
      [query.trim(), normalized, customerId || null, sessionId || null],
    ).catch(() => {});
    res.json({ ok: true });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ─── GET /api/search/history/:customerId ─────────────────────────────────────
router.get('/history/:customerId', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT DISTINCT query_normalized as query, MAX(created_at) as searched_at
       FROM search_queries WHERE customer_id = ?
       GROUP BY query_normalized ORDER BY searched_at DESC LIMIT 10`,
      [req.params.customerId],
    );
    res.json({ history: rows.map(r => r.query) });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

module.exports = router;

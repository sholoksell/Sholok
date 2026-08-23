#!/usr/bin/env node
/**
 * One-time patch: adds POST /api/search/image to the ecommerce_backend search router.
 * Run once on the server:
 *   node ~/Sholok/deploy/patch_image_search.js
 * Then restart the Node.js backend (cPanel > Node.js Apps > Restart).
 */
const fs   = require('fs');
const path = require('path');
const os   = require('os');

const SEARCH_JS = path.join(os.homedir(), 'ecommerce_backend', 'routes', 'search.js');

if (!fs.existsSync(SEARCH_JS)) {
  console.error('ERROR: Cannot find', SEARCH_JS);
  process.exit(1);
}

const content = fs.readFileSync(SEARCH_JS, 'utf8');

if (content.includes("router.post('/image'") || content.includes('router.post("/image"')) {
  console.log('Image search route already exists — nothing to patch.');
  process.exit(0);
}

const ROUTE = `
// ─── POST /api/search/image ─────────────────────────────────────────────────
// Accepts { imageBase64, mimeType } JSON (image pre-resized to ≤400px by frontend).
// Calls Gemini Flash Vision to extract keywords, then searches MySQL products.
// Requires GEMINI_API_KEY in ~/ecommerce_backend/.env
router.post('/image', require('express').json({ limit: '5mb' }), async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/jpeg' } = req.body || {};
    if (!imageBase64) {
      return res.status(400).json({ success: false, message: 'No image data' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.json({
        success: false,
        message: 'Image search API not configured (GEMINI_API_KEY missing in .env)',
        configError: true,
      });
    }

    // Call Gemini 1.5 Flash vision — free tier: 15 req/min, 1500/day
    const geminiResult = await callGeminiVision(apiKey, imageBase64, mimeType);
    if (!geminiResult.ok) {
      console.error('[image-search] Gemini error:', geminiResult.error);
      return res.json({ success: false, message: 'Image recognition failed. Try again.' });
    }

    const rawText  = geminiResult.text || '';
    const keywords = rawText
      .split(/[,\\n]+/)
      .map(k => k.replace(/[^a-zA-Z0-9 ]/g, '').trim().toLowerCase())
      .filter(k => k.length > 1)
      .slice(0, 5);

    if (keywords.length === 0) {
      return res.json({ success: false, message: 'Could not identify a product in the image.' });
    }

    // Search MySQL using the extracted keywords (same pattern as suggestions route)
    const pConds  = keywords.map(() => 'p.name LIKE ?');
    const pParams = keywords.map(k => \`%\${k}%\`);

    const [products] = await pool.query(\`
      SELECT
        p.id, p.name, p.name_bn, p.slug, p.thumbnail,
        p.regular_price, p.sale_price,
        c.name AS category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'active' AND p.visibility = 1
        AND (\${pConds.join(' OR ')})
      ORDER BY p.featured DESC, p.stock DESC
      LIMIT 8
    \`, pParams);

    res.json({
      success:  products.length > 0,
      query:    keywords[0],
      keywords,
      message:  products.length === 0 ? 'No matching products found for this image.' : undefined,
      products: products.map(p => ({
        type:         'product',
        name:         p.name,
        nameBn:       p.name_bn || p.name,
        slug:         p.slug,
        thumbnail:    p.thumbnail,
        regularPrice: p.regular_price ? Number(p.regular_price) : undefined,
        salePrice:    p.sale_price    ? Number(p.sale_price)    : null,
        categoryName: p.category_name,
      })),
    });
  } catch (e) {
    console.error('[/api/search/image]', e.message);
    res.status(500).json({ success: false, message: 'Image search error: ' + e.message });
  }
});

// Calls Gemini 1.5 Flash Vision via Node built-in https (works on any Node version)
function callGeminiVision(apiKey, imageBase64, mimeType) {
  return new Promise((resolve) => {
    const https = require('https');
    const body  = JSON.stringify({
      contents: [{
        parts: [
          {
            text: 'Identify this product for an online store search. Reply with ONLY 3-5 comma-separated English keywords that best describe the product (example: "lawn fabric, printed dress, women clothing"). No explanation, punctuation, or extra text — just the keywords.'
          },
          { inline_data: { mime_type: mimeType, data: imageBase64 } },
        ],
      }],
      generationConfig: { maxOutputTokens: 60, temperature: 0.1 },
    });

    const opts = {
      hostname: 'generativelanguage.googleapis.com',
      path:     \`/v1beta/models/gemini-1.5-flash:generateContent?key=\${apiKey}\`,
      method:   'POST',
      headers:  { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body) },
    };

    const req = https.request(opts, (resp) => {
      let raw = '';
      resp.on('data', c => raw += c);
      resp.on('end', () => {
        try {
          const data = JSON.parse(raw);
          const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
          resolve({ ok: true, text });
        } catch {
          resolve({ ok: false, error: 'JSON parse failed: ' + raw.slice(0, 100) });
        }
      });
    });
    req.on('error', err => resolve({ ok: false, error: err.message }));
    req.setTimeout(20000, () => { req.destroy(); resolve({ ok: false, error: 'Timeout' }); });
    req.write(body);
    req.end();
  });
}

`;

const patched = content.replace('module.exports = router;', ROUTE + '\nmodule.exports = router;');
fs.writeFileSync(SEARCH_JS, patched, 'utf8');
console.log('✅ Image search route added to', SEARCH_JS);
console.log('');
console.log('Next steps:');
console.log('  1. Get a FREE Gemini API key: https://aistudio.google.com/apikey');
console.log('  2. Add to backend: echo "GEMINI_API_KEY=your_key_here" >> ~/ecommerce_backend/.env');
console.log('  3. Restart backend via cPanel > Node.js Apps > Restart');

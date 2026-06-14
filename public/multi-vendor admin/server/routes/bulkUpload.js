const router  = require("express").Router();
const multer  = require("multer");
const fs      = require("fs");
const Product = require("../models/Product");
const Store   = require("../models/Store");
const Category= require("../models/Category");
const { protect, authorize } = require("../middleware/auth");

// Memory upload — keep CSV in RAM
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

/**
 * Parse a single CSV line respecting double-quotes.
 */
function parseCsvLine(line) {
  const out = [];
  let cur = "", inQ = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"' && line[i+1] === '"') { cur += '"'; i++; continue; }
    if (ch === '"') { inQ = !inQ; continue; }
    if (ch === "," && !inQ) { out.push(cur); cur = ""; continue; }
    cur += ch;
  }
  out.push(cur);
  return out.map((c) => c.trim());
}

/**
 * POST /api/v1/products/bulk-upload
 * Multipart form with field "file" — CSV with header:
 *   name,description,price,originalPrice,categoryName,stock,images,badge,seasonalFor,tags
 *   images / seasonalFor / tags are pipe-separated lists ("a|b|c")
 */
router.post("/", protect, authorize("seller", "admin"), upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, message: "CSV file required (field name: file)" });

  const store = await Store.findOne({ owner: req.user.id });
  if (!store) return res.status(400).json({ success: false, message: "You do not own a Smart Store" });

  const text = req.file.buffer.toString("utf8");
  const lines = text.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return res.status(400).json({ success: false, message: "CSV must have header + at least one row" });

  const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());
  const required = ["name", "price"];
  for (const r of required) if (!headers.includes(r))
    return res.status(400).json({ success: false, message: `Missing required column: ${r}` });

  // Cache categories
  const categories = await Category.find();
  const catByName = Object.fromEntries(categories.map((c) => [c.name.toLowerCase(), c._id]));

  const created = [];
  const errors  = [];

  for (let i = 1; i < lines.length; i++) {
    try {
      const cols = parseCsvLine(lines[i]);
      const row = Object.fromEntries(headers.map((h, j) => [h, cols[j] || ""]));

      if (!row.name || !row.price) { errors.push({ line: i+1, error: "missing name/price" }); continue; }

      const categoryName = row.categoryname || row.category || "General";
      const categoryId   = catByName[categoryName.toLowerCase()] || categories[0]?._id;

      const doc = await Product.create({
        store:        store._id,
        seller:       req.user.id,
        name:         row.name,
        description:  row.description || "",
        price:        Number(row.price),
        originalPrice:Number(row.originalprice || 0) || undefined,
        category:     categoryId,
        categoryName,
        stock:        Number(row.stock || 0),
        images:       (row.images || "").split("|").filter(Boolean),
        badge:        row.badge || "",
        seasonalFor:  (row.seasonalfor || "").split("|").filter(Boolean),
        tags:         (row.tags        || "").split("|").filter(Boolean),
      });
      created.push({ id: doc._id, name: doc.name });
    } catch (e) {
      errors.push({ line: i+1, error: e.message });
    }
  }

  res.json({
    success: true,
    message: `Imported ${created.length} of ${lines.length - 1} rows.`,
    created, errors,
  });
});

module.exports = router;

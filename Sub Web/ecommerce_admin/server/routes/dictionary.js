const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET /api/dictionary/suggest?q=...&limit=...
// Returns words matching the query from the dictionary table (if it exists).
// Falls back to empty array so callers always get a valid JSON response.
router.get('/suggest', async (req, res) => {
  const { q = '', limit = 5 } = req.query;
  if (!q.trim()) return res.json([]);
  try {
    const [rows] = await pool.query(
      `SELECT word_en AS en, word_bn AS bn, definition_bn AS definitionBn
       FROM dictionary_words
       WHERE word_en LIKE ? OR word_bn LIKE ?
       ORDER BY CHAR_LENGTH(word_en) ASC
       LIMIT ?`,
      [`%${q.trim()}%`, `%${q.trim()}%`, parseInt(limit)]
    );
    res.json(rows);
  } catch {
    // Table may not exist yet — return empty array gracefully
    res.json([]);
  }
});

module.exports = router;

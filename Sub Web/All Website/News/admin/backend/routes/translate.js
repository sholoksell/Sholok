const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();

const LANG_MAP = { en: 'en', bn: 'bn-BD' };

router.post('/', auth, async (req, res) => {
  const { text, from, to } = req.body;
  if (!text || !from || !to) return res.status(400).json({ message: 'text, from, to required' });

  const langPair = `${LANG_MAP[from] || from}|${LANG_MAP[to] || to}`;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${langPair}`;

  try {
    const r = await fetch(url);
    const data = await r.json();
    if (data.responseStatus !== 200) {
      return res.status(502).json({ message: data.responseDetails || 'Translation failed' });
    }
    res.json({ translation: data.responseData.translatedText });
  } catch (err) {
    res.status(502).json({ message: 'Translation service unavailable' });
  }
});

module.exports = router;

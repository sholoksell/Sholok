/**
 * Universal multilingual field resolver.
 *
 * Handles all multilingual data formats:
 *  ① Nested object  { en: "Laptop",  bn: "ল্যাপটপ" }   ← new DB format
 *  ② Legacy flat    "Laptop"  (plain string, returned as-is)
 *  ③ null / undefined  → returns fallback (default '')
 *
 * Fallback chain:
 *   requested language → Bengali (default) → English → fallback
 *
 * @param {Object|string|null} field
 * @param {'en'|'bn'} language
 * @param {string} [fallback='']
 * @returns {string}
 */
export function translateField(field, language, fallback = '') {
  if (!field) return fallback;
  if (typeof field === 'string') return field || fallback;
  // Nested multilingual object
  return field[language] || field.bn || field.en || fallback;
}

/**
 * Extract a localized value from legacy flat objects.
 * Reads `fieldNameBn` for Bengali, `fieldName` for English.
 *
 * @param {Object|null} obj
 * @param {string} fieldName   base field name  e.g. 'title'
 * @param {'en'|'bn'} language
 * @param {string} [fallback='']
 * @returns {string}
 */
export function getLocalizedFlat(obj, fieldName, language, fallback = '') {
  if (!obj) return fallback;
  if (language === 'bn') {
    return obj[`${fieldName}Bn`] || obj[fieldName] || fallback;
  }
  return obj[fieldName] || obj[`${fieldName}Bn`] || fallback;
}

/**
 * Build the standard multilingual nested object from individual strings.
 *
 * @param {string} en
 * @param {string} bn
 * @returns {{ en: string, bn: string }}
 */
export function buildI18nField(en, bn) {
  return { en: en || '', bn: bn || '' };
}

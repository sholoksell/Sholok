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
 */
export function translateField(
  field: { en?: string; bn?: string } | string | null | undefined,
  language: 'en' | 'bn',
  fallback = ''
): string {
  if (!field) return fallback;
  if (typeof field === 'string') return field || fallback;
  // Nested multilingual object
  return field[language] || field.bn || field.en || fallback;
}

/**
 * Extract a localized value from legacy flat objects that use
 * `fieldName` (EN) and `fieldNameBn` (BN) properties.
 *
 * @example
 *   getLocalizedFlat(product, 'name', 'bn')
 *   // → product.nameBn || product.name || ''
 */
export function getLocalizedFlat(
  obj: Record<string, any> | null | undefined,
  fieldName: string,
  language: 'en' | 'bn',
  fallback = ''
): string {
  if (!obj) return fallback;
  if (language === 'bn') {
    return obj[`${fieldName}Bn`] || obj[fieldName] || fallback;
  }
  return obj[fieldName] || obj[`${fieldName}Bn`] || fallback;
}

/**
 * Build the standard multilingual nested object from individual strings.
 * Used when saving data to the DB.
 */
export function buildI18nField(en: string, bn: string): { en: string; bn: string } {
  return { en: en || '', bn: bn || '' };
}

/**
 * Safely extract a nested multilingual object from a Mongoose document
 * that may have either nested or flat structure.
 * Returns a normalised { en, bn } object regardless of input shape.
 */
export function normaliseI18nField(
  raw: { en?: string; bn?: string } | string | null | undefined,
  legacyEn?: string,
  legacyBn?: string
): { en: string; bn: string } {
  if (raw && typeof raw === 'object') {
    return { en: raw.en || legacyEn || '', bn: raw.bn || legacyBn || '' };
  }
  if (typeof raw === 'string' && raw) {
    return { en: raw, bn: legacyBn || '' };
  }
  return { en: legacyEn || '', bn: legacyBn || '' };
}

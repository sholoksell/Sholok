/**
 * Universal multilingual field resolver for the Home Portal.
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
  language: 'EN' | 'BN' | 'en' | 'bn',
  fallback = ''
): string {
  if (!field) return fallback;
  if (typeof field === 'string') return field || fallback;

  // Normalise language to lowercase for nested object lookup
  const lang = language.toLowerCase() as 'en' | 'bn';
  return field[lang] || field.bn || field.en || fallback;
}

/**
 * Extract a localized value from legacy flat objects.
 * Reads `fieldNameBn` for Bengali, `fieldName` for English.
 */
export function getLocalizedFlat(
  obj: Record<string, any> | null | undefined,
  fieldName: string,
  language: 'EN' | 'BN' | 'en' | 'bn',
  fallback = ''
): string {
  if (!obj) return fallback;
  const lang = language.toLowerCase();
  if (lang === 'bn') {
    return obj[`${fieldName}Bn`] || obj[fieldName] || fallback;
  }
  return obj[fieldName] || obj[`${fieldName}Bn`] || fallback;
}

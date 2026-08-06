-- ============================================================
-- CATEGORY TABLE MIGRATION
-- Run this ONCE in phpMyAdmin or MySQL CLI on sholok_ecommerce
-- MariaDB 10.4+ supports ADD COLUMN IF NOT EXISTS
-- ============================================================

USE sholok_ecommerce;

ALTER TABLE categories
  ADD COLUMN IF NOT EXISTS name_bn      VARCHAR(255) NOT NULL DEFAULT '' AFTER name,
  ADD COLUMN IF NOT EXISTS level        TINYINT UNSIGNED NOT NULL DEFAULT 1 AFTER parent_id,
  ADD COLUMN IF NOT EXISTS keywords     TEXT AFTER meta_description,
  ADD COLUMN IF NOT EXISTS deleted_at   TIMESTAMP NULL DEFAULT NULL AFTER updated_at;

-- Add indexes if missing
ALTER TABLE categories
  ADD INDEX IF NOT EXISTS idx_categories_level   (level),
  ADD INDEX IF NOT EXISTS idx_categories_deleted (deleted_at);

-- Compute level for any existing rows
UPDATE categories SET level = 1 WHERE parent_id IS NULL;

-- Level 2 subcategories (parent has no parent)
UPDATE categories c
  JOIN categories p ON p.id = c.parent_id AND p.parent_id IS NULL
  SET c.level = 2
  WHERE c.parent_id IS NOT NULL;

-- Level 3+ (parent is already level 2+)
UPDATE categories c
  JOIN categories p ON p.id = c.parent_id AND p.level >= 2
  SET c.level = p.level + 1
  WHERE c.parent_id IS NOT NULL AND c.level = 1;

SELECT 'Migration complete' AS status;

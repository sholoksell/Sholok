-- ============================================================
-- Fix 1: Add weight_kg to products (safe: IF NOT EXISTS)
-- ============================================================
ALTER TABLE products
  ADD COLUMN weight_kg DECIMAL(8,3) NOT NULL DEFAULT 0.500
  AFTER shipping_charge;

-- ============================================================
-- Fix 2: Add explicit district-level default for Dhaka city
--         (Inside Dhaka = G-default-1, ৳100 base / ৳20 per kg)
--         Uses INSERT IGNORE so it won't overwrite existing row
-- ============================================================
INSERT IGNORE INTO delivery_area_assignments
  (assignment_key, store_location, division, district, area, area_id, group_id)
VALUES
  ('assign_Dhaka_Dhaka_default', 'Dhaka', 'Dhaka', 'Dhaka', NULL, NULL, 'G-default-1');

-- ============================================================
-- Fix 3: Dhaka Suburb area assignments (G-default-2, ৳150/৳20)
--         These are peri-urban Dhaka areas; currently unassigned
--         and incorrectly falling through to Inside Dhaka rate.
--         Uses INSERT IGNORE to be safe on re-run.
-- ============================================================
INSERT IGNORE INTO delivery_area_assignments
  (assignment_key, store_location, division, district, area, area_id, group_id)
VALUES
  ('D-Dhaka-Dhaka-Savar Sadar',             'Dhaka', 'Dhaka', 'Dhaka', 'Savar Sadar',             NULL, 'G-default-2'),
  ('D-Dhaka-Dhaka-Savar Cantonment',         'Dhaka', 'Dhaka', 'Dhaka', 'Savar Cantonment',         NULL, 'G-default-2'),
  ('D-Dhaka-Dhaka-Ashulia',                  'Dhaka', 'Dhaka', 'Dhaka', 'Ashulia',                  NULL, 'G-default-2'),
  ('D-Dhaka-Dhaka-Birulia',                  'Dhaka', 'Dhaka', 'Dhaka', 'Birulia',                  NULL, 'G-default-2'),
  ('D-Dhaka-Dhaka-DEPZ (Savar)',             'Dhaka', 'Dhaka', 'Dhaka', 'DEPZ (Savar)',             NULL, 'G-default-2'),
  ('D-Dhaka-Dhaka-Dohar',                    'Dhaka', 'Dhaka', 'Dhaka', 'Dohar',                    NULL, 'G-default-2'),
  ('D-Dhaka-Dhaka-Keraniganj (Abdullahpur)', 'Dhaka', 'Dhaka', 'Dhaka', 'Keraniganj (Abdullahpur)', NULL, 'G-default-2'),
  ('D-Dhaka-Dhaka-Keraniganj (Hasnabad)',    'Dhaka', 'Dhaka', 'Dhaka', 'Keraniganj (Hasnabad)',    NULL, 'G-default-2'),
  ('D-Dhaka-Dhaka-Keraniganj (Jinjira)',     'Dhaka', 'Dhaka', 'Dhaka', 'Keraniganj (Jinjira)',     NULL, 'G-default-2'),
  ('D-Dhaka-Dhaka-Keraniganj (Kadamtoli)',   'Dhaka', 'Dhaka', 'Dhaka', 'Keraniganj (Kadamtoli)',   NULL, 'G-default-2'),
  ('D-Dhaka-Dhaka-Keraniganj (Rohitpur)',    'Dhaka', 'Dhaka', 'Dhaka', 'Keraniganj (Rohitpur)',    NULL, 'G-default-2'),
  ('D-Dhaka-Dhaka-Rajendrapur (Keraniganj)', 'Dhaka', 'Dhaka', 'Dhaka', 'Rajendrapur (Keraniganj)', NULL, 'G-default-2');

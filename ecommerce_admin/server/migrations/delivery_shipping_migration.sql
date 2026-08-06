-- ============================================================
-- Sholok Shopping — Delivery & Shipping Management Migration
-- Run this SQL against sholok_ecommerce database
-- ============================================================

SET foreign_key_checks = 0;

-- ─── 1. Modify products table ────────────────────────────────────
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS vendor_id         INT          DEFAULT NULL AFTER category_id,
  ADD COLUMN IF NOT EXISTS ownership_type    VARCHAR(20)  NOT NULL DEFAULT 'sholok' AFTER vendor_id,
  ADD COLUMN IF NOT EXISTS product_type      VARCHAR(30)  NOT NULL DEFAULT 'non_perishable' AFTER ownership_type,
  ADD COLUMN IF NOT EXISTS weight_kg         DECIMAL(8,3) DEFAULT 0.500 AFTER product_type;

-- ─── 2. Modify orders table ──────────────────────────────────────
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS grocery_delivery_date    DATE         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS grocery_delivery_slot_id INT          DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS has_grocery_items        TINYINT(1)   NOT NULL DEFAULT 0;

-- ─── 3. Vendors ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendors (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  name                 VARCHAR(191) NOT NULL,
  business_name        VARCHAR(191) DEFAULT NULL,
  email                VARCHAR(191) NOT NULL,
  phone                VARCHAR(30)  DEFAULT NULL,
  password_hash        VARCHAR(255) NOT NULL DEFAULT '',
  avatar               VARCHAR(500) DEFAULT NULL,
  division             VARCHAR(100) DEFAULT NULL,
  district             VARCHAR(100) DEFAULT NULL,
  upazila              VARCHAR(100) DEFAULT NULL,
  address              TEXT         DEFAULT NULL,
  status               VARCHAR(30)  NOT NULL DEFAULT 'pending',
  is_verified          TINYINT(1)   NOT NULL DEFAULT 0,
  cod_enabled          TINYINT(1)   NOT NULL DEFAULT 0,
  min_security_balance DECIMAL(12,2) NOT NULL DEFAULT 20000.00,
  created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 4. Vendor Wallets ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS vendor_wallets (
  id                   INT AUTO_INCREMENT PRIMARY KEY,
  vendor_id            INT          NOT NULL,
  current_balance      DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_deposit        DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  total_cod_collected  DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  pending_settlement   DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  hold_amount          DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  created_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at           DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_vw_vendor (vendor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 5. Vendor Wallet Transactions ───────────────────────────────
CREATE TABLE IF NOT EXISTS vendor_wallet_transactions (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  vendor_id       INT          NOT NULL,
  type            VARCHAR(50)  NOT NULL,
  amount          DECIMAL(12,2) NOT NULL,
  balance_before  DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  balance_after   DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  reference_id    VARCHAR(100) DEFAULT NULL,
  note            TEXT         DEFAULT NULL,
  created_by      INT          DEFAULT NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_vwt_vendor (vendor_id),
  INDEX idx_vwt_type   (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 6. Warehouses ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS warehouses (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(191) NOT NULL,
  code          VARCHAR(50)  DEFAULT NULL,
  address       TEXT         DEFAULT NULL,
  division      VARCHAR(100) DEFAULT NULL,
  district      VARCHAR(100) DEFAULT NULL,
  upazila       VARCHAR(100) DEFAULT NULL,
  city          VARCHAR(100) DEFAULT NULL,
  is_active     TINYINT(1)   NOT NULL DEFAULT 1,
  is_default    TINYINT(1)   NOT NULL DEFAULT 0,
  contact_name  VARCHAR(191) DEFAULT NULL,
  contact_phone VARCHAR(30)  DEFAULT NULL,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO warehouses (id, name, code, division, district, city, is_active, is_default)
VALUES (1, 'Dhaka Main Warehouse', 'DHK-MAIN', 'Dhaka', 'Dhaka', 'Dhaka', 1, 1);

-- ─── 7. Couriers ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS couriers (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  code        VARCHAR(50)  DEFAULT NULL,
  logo        VARCHAR(500) DEFAULT NULL,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,
  tracking_url_template VARCHAR(500) DEFAULT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO couriers (name, code, is_active) VALUES
  ('REDX', 'redx', 1),
  ('Pathao', 'pathao', 1),
  ('Steadfast', 'steadfast', 1),
  ('Sundarban', 'sundarban', 1),
  ('Paperfly', 'paperfly', 1),
  ('eCourier', 'ecourier', 1);

-- ─── 8. Grocery Delivery Districts ───────────────────────────────
CREATE TABLE IF NOT EXISTS grocery_delivery_districts (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(191) NOT NULL,
  name_bn     VARCHAR(191) DEFAULT NULL,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order  INT          NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS grocery_delivery_areas (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  district_id INT          NOT NULL,
  name        VARCHAR(191) NOT NULL,
  name_bn     VARCHAR(191) DEFAULT NULL,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order  INT          NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_gda_district (district_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO grocery_delivery_districts (id, name, name_bn, is_active) VALUES
  (1, 'Dhaka North City Corporation (DNCC)', 'ঢাকা উত্তর সিটি কর্পোরেশন', 1),
  (2, 'Dhaka South City Corporation (DSCC)', 'ঢাকা দক্ষিণ সিটি কর্পোরেশন', 1);

INSERT IGNORE INTO grocery_delivery_areas (district_id, name, is_active, sort_order) VALUES
  (1,'Banasree',1,1),(1,'West Uttara',1,2),(1,'East Uttara',1,3),(1,'Mirpur',1,4),
  (1,'Uttarkhan',1,5),(1,'Dakshinkhan',1,6),(1,'Airport',1,7),(1,'Khilkhet',1,8),
  (1,'Bashundhara',1,9),(1,'Vatara',1,10),(1,'Badda',1,11),(1,'Baridhara',1,12),
  (1,'Rampura',1,13),(1,'Hatirjheel',1,14),(1,'Tejgaon',1,15),(1,'Mohammadpur',1,16),
  (1,'Adabor',1,17),(1,'Pallabi',1,18),(1,'Gulshan',1,19),(1,'Banani',1,20),
  (1,'Dhanmondi North',1,21);

INSERT IGNORE INTO grocery_delivery_areas (district_id, name, is_active, sort_order) VALUES
  (2,'Bangshal',1,1),(2,'Chawkbazar',1,2),(2,'Dhanmondi South',1,3),(2,'Gandaria',1,4),
  (2,'Hazaribagh',1,5),(2,'Jatrabari',1,6),(2,'Kalabagan',1,7),(2,'Kamrangirchar',1,8),
  (2,'Khilgaon',1,9),(2,'Kotwali',1,10),(2,'Lalbagh',1,11),(2,'Maghbazar',1,12),
  (2,'Malibagh',1,13),(2,'Motijheel',1,14),(2,'Mugda',1,15),(2,'New Market',1,16),
  (2,'Paltan',1,17),(2,'Ramna',1,18),(2,'Sabujbagh',1,19),(2,'Shahbagh',1,20),
  (2,'Shahjahanpur',1,21),(2,'Shyampur',1,22),(2,'Sutrapur',1,23),(2,'Wari',1,24);

-- ─── 9. Nationwide Delivery Hierarchy ────────────────────────────
CREATE TABLE IF NOT EXISTS delivery_divisions (
  id        INT AUTO_INCREMENT PRIMARY KEY,
  name      VARCHAR(100) NOT NULL,
  name_bn   VARCHAR(100) DEFAULT NULL,
  is_active TINYINT(1)   NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS delivery_districts (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  division_id INT          NOT NULL,
  name        VARCHAR(100) NOT NULL,
  name_bn     VARCHAR(100) DEFAULT NULL,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,
  INDEX idx_dd_division (division_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS delivery_upazilas (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  district_id INT          NOT NULL,
  name        VARCHAR(100) NOT NULL,
  name_bn     VARCHAR(100) DEFAULT NULL,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,
  INDEX idx_du_district (district_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO delivery_divisions (id, name, name_bn) VALUES
  (1,'Dhaka','ঢাকা'),(2,'Chattogram','চট্টগ্রাম'),(3,'Rajshahi','রাজশাহী'),
  (4,'Khulna','খুলনা'),(5,'Sylhet','সিলেট'),(6,'Barisal','বরিশাল'),
  (7,'Rangpur','রংপুর'),(8,'Mymensingh','ময়মনসিংহ');

INSERT IGNORE INTO delivery_districts (id, division_id, name, name_bn) VALUES
  (1,1,'Dhaka','ঢাকা'),(2,1,'Narayanganj','নারায়ণগঞ্জ'),(3,1,'Gazipur','গাজীপুর'),
  (4,1,'Manikganj','মানিকগঞ্জ'),(5,1,'Narsingdi','নরসিংদী'),
  (10,2,'Chattogram','চট্টগ্রাম'),(11,2,'Coxsbazar','কক্সবাজার'),
  (20,3,'Rajshahi','রাজশাহী'),(21,3,'Bogura','বগুড়া'),
  (30,4,'Khulna','খুলনা'),(31,4,'Jessore','যশোর'),
  (40,5,'Sylhet','সিলেট'),(41,5,'Habiganj','হবিগঞ্জ'),
  (50,6,'Barisal','বরিশাল'),
  (60,7,'Rangpur','রংপুর'),
  (70,8,'Mymensingh','ময়মনসিংহ');

-- ─── 10. Shipping Policies ───────────────────────────────────────
CREATE TABLE IF NOT EXISTS shipping_policies (
  id                      INT AUTO_INCREMENT PRIMARY KEY,
  source_type             VARCHAR(20)  NOT NULL DEFAULT 'sholok',
  source_id               INT          DEFAULT NULL,
  division_id             INT          DEFAULT NULL,
  district_id             INT          DEFAULT NULL,
  area_name               VARCHAR(191) DEFAULT NULL,
  is_inside_city          TINYINT(1)   NOT NULL DEFAULT 0,
  base_weight_kg          DECIMAL(8,3) NOT NULL DEFAULT 1.000,
  base_charge             DECIMAL(10,2) NOT NULL DEFAULT 100.00,
  extra_charge_per_kg     DECIMAL(10,2) NOT NULL DEFAULT 30.00,
  estimated_days_min      INT          NOT NULL DEFAULT 1,
  estimated_days_max      INT          NOT NULL DEFAULT 3,
  free_delivery_threshold DECIMAL(10,2) DEFAULT NULL,
  is_active               TINYINT(1)   NOT NULL DEFAULT 1,
  created_at              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_sp_source   (source_type, source_id),
  INDEX idx_sp_district (district_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO shipping_policies (source_type, source_id, division_id, district_id, area_name, is_inside_city, base_weight_kg, base_charge, extra_charge_per_kg, estimated_days_min, estimated_days_max) VALUES
  ('sholok', 1, 1, 1,  'Dhaka City',      1, 1.0, 100.00, 30.00, 1, 3),
  ('sholok', 1, 2, 10, 'Chattogram City', 0, 1.0, 150.00, 40.00, 3, 7),
  ('sholok', 1, 3, 20, 'Rajshahi City',   0, 1.0, 150.00, 40.00, 3, 7),
  ('sholok', 1, 4, 30, 'Khulna City',     0, 1.0, 150.00, 40.00, 3, 7),
  ('sholok', 1, 5, 40, 'Sylhet City',     0, 1.0, 150.00, 40.00, 3, 7),
  ('sholok', 1, 6, 50, 'Barisal City',    0, 1.0, 150.00, 40.00, 3, 7),
  ('sholok', 1, 7, 60, 'Rangpur City',    0, 1.0, 150.00, 40.00, 3, 7),
  ('sholok', 1, 8, 70, 'Mymensingh City', 0, 1.0, 150.00, 40.00, 3, 7);

-- ─── 11. Grocery Delivery Slots ──────────────────────────────────
CREATE TABLE IF NOT EXISTS grocery_delivery_slots (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  label      VARCHAR(100) NOT NULL,
  start_time TIME         NOT NULL,
  end_time   TIME         NOT NULL,
  max_orders INT          DEFAULT NULL,
  is_active  TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order INT          NOT NULL DEFAULT 0,
  created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO grocery_delivery_slots (label, start_time, end_time, sort_order) VALUES
  ('Morning (9 AM – 11 AM)',  '09:00:00', '11:00:00', 1),
  ('Midday (11 AM – 1 PM)',   '11:00:00', '13:00:00', 2),
  ('Afternoon (1 PM – 3 PM)', '13:00:00', '15:00:00', 3),
  ('Evening (3 PM – 5 PM)',   '15:00:00', '17:00:00', 4),
  ('Evening (5 PM – 7 PM)',   '17:00:00', '19:00:00', 5),
  ('Night (7 PM – 9 PM)',     '19:00:00', '21:00:00', 6);

-- ─── 12. Shipments ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shipments (
  id                    INT AUTO_INCREMENT PRIMARY KEY,
  shipment_number       VARCHAR(50)  NOT NULL,
  order_id              INT          NOT NULL,
  source_type           VARCHAR(20)  NOT NULL DEFAULT 'sholok',
  source_id             INT          DEFAULT NULL,
  source_label          VARCHAR(191) DEFAULT NULL,
  status                VARCHAR(50)  NOT NULL DEFAULT 'pending',
  courier_id            INT          DEFAULT NULL,
  courier_name          VARCHAR(100) DEFAULT NULL,
  tracking_number       VARCHAR(200) DEFAULT NULL,
  dispatch_date         DATE         DEFAULT NULL,
  estimated_delivery_date DATE       DEFAULT NULL,
  estimated_days_min    INT          DEFAULT NULL,
  estimated_days_max    INT          DEFAULT NULL,
  total_weight_kg       DECIMAL(8,3) DEFAULT NULL,
  delivery_charge       DECIMAL(10,2) DEFAULT 0.00,
  delivery_date         DATE         DEFAULT NULL,
  delivery_slot_id      INT          DEFAULT NULL,
  notes                 TEXT         DEFAULT NULL,
  delivered_at          DATETIME     DEFAULT NULL,
  cancelled_at          DATETIME     DEFAULT NULL,
  created_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at            DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_shipments_order  (order_id),
  INDEX idx_shipments_status (status),
  INDEX idx_shipments_number (shipment_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 13. Shipment Items ──────────────────────────────────────────
CREATE TABLE IF NOT EXISTS shipment_items (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  shipment_id   INT          NOT NULL,
  order_item_id INT          DEFAULT NULL,
  product_id    INT          DEFAULT NULL,
  product_name  VARCHAR(500) DEFAULT NULL,
  quantity      INT          NOT NULL DEFAULT 1,
  weight_kg     DECIMAL(8,3) DEFAULT 0.500,
  created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_si_shipment (shipment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 14. Shipment Tracking Events ────────────────────────────────
CREATE TABLE IF NOT EXISTS shipment_tracking_events (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  shipment_id  INT          NOT NULL,
  status       VARCHAR(100) NOT NULL,
  description  TEXT         DEFAULT NULL,
  location     VARCHAR(191) DEFAULT NULL,
  created_by   INT          DEFAULT NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_ste_shipment (shipment_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 15. COD Transactions ────────────────────────────────────────
CREATE TABLE IF NOT EXISTS cod_transactions (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  shipment_id  INT          NOT NULL,
  order_id     INT          NOT NULL,
  vendor_id    INT          DEFAULT NULL,
  amount       DECIMAL(12,2) NOT NULL,
  status       VARCHAR(30)  NOT NULL DEFAULT 'pending',
  collected_at DATETIME     DEFAULT NULL,
  settled_at   DATETIME     DEFAULT NULL,
  note         TEXT         DEFAULT NULL,
  created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cod_shipment (shipment_id),
  INDEX idx_cod_vendor   (vendor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 16. Settlement Records ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS settlement_records (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  vendor_id      INT          NOT NULL,
  period_start   DATE         NOT NULL,
  period_end     DATE         NOT NULL,
  total_amount   DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  cod_amount     DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  platform_fee   DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  net_amount     DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  status         VARCHAR(30)  NOT NULL DEFAULT 'pending',
  payment_method VARCHAR(100) DEFAULT NULL,
  payment_ref    VARCHAR(200) DEFAULT NULL,
  processed_by   INT          DEFAULT NULL,
  processed_at   DATETIME     DEFAULT NULL,
  notes          TEXT         DEFAULT NULL,
  created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_sr_vendor (vendor_id),
  INDEX idx_sr_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 17. Grocery Settings (into existing settings table) ─────────
INSERT IGNORE INTO settings (setting_key, value, group_name, description) VALUES
  ('grocery_min_prep_hours',     '2',    'grocery',  'Minimum Preparation Time (hours)'),
  ('grocery_delivery_days',      '2',    'grocery',  'Delivery Days Available (today+tomorrow=2)'),
  ('grocery_delivery_enabled',   '1',    'grocery',  'Grocery Delivery Enabled'),
  ('free_delivery_threshold',    '1000', 'shipping', 'Free Delivery Minimum Order Amount'),
  ('sholok_inside_city_charge',  '100',  'shipping', 'Inside City Delivery Charge (BDT)'),
  ('sholok_outside_city_charge', '150',  'shipping', 'Outside City Delivery Charge (BDT)');

SET foreign_key_checks = 1;

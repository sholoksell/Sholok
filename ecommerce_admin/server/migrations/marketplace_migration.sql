-- ============================================================
-- Multi-Vendor Marketplace — Phase 2 Migration
-- ============================================================
SET foreign_key_checks = 0;

-- ─── 1. Brands ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS brands (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(191) NOT NULL,
  name_bn     VARCHAR(191) DEFAULT NULL,
  slug        VARCHAR(191) NOT NULL UNIQUE,
  logo        VARCHAR(500) DEFAULT NULL,
  banner      VARCHAR(500) DEFAULT NULL,
  description TEXT         DEFAULT NULL,
  website     VARCHAR(500) DEFAULT NULL,
  is_active   TINYINT(1)   NOT NULL DEFAULT 1,
  sort_order  INT          NOT NULL DEFAULT 0,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 2. Add brand_id + barcode + dimensions + compare_price to products ──
ALTER TABLE products
  ADD COLUMN IF NOT EXISTS brand_id       INT          DEFAULT NULL AFTER category_id,
  ADD COLUMN IF NOT EXISTS compare_price  DECIMAL(12,2) DEFAULT NULL AFTER regular_price,
  ADD COLUMN IF NOT EXISTS barcode        VARCHAR(100) DEFAULT NULL AFTER sku,
  ADD COLUMN IF NOT EXISTS length_cm      DECIMAL(8,2) DEFAULT NULL AFTER weight_kg,
  ADD COLUMN IF NOT EXISTS width_cm       DECIMAL(8,2) DEFAULT NULL AFTER length_cm,
  ADD COLUMN IF NOT EXISTS height_cm      DECIMAL(8,2) DEFAULT NULL AFTER width_cm,
  ADD COLUMN IF NOT EXISTS meta_title     VARCHAR(255) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS meta_description TEXT        DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS meta_keywords  TEXT         DEFAULT NULL;

-- ─── 3. Add vendor_id to order_items ─────────────────────────
ALTER TABLE order_items
  ADD COLUMN IF NOT EXISTS vendor_id     INT     DEFAULT NULL AFTER product_id,
  ADD COLUMN IF NOT EXISTS vendor_name   VARCHAR(191) DEFAULT NULL AFTER vendor_id,
  ADD COLUMN IF NOT EXISTS return_status VARCHAR(30) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS return_reason TEXT    DEFAULT NULL;

-- ─── 4. Return / Refund Requests ─────────────────────────────
CREATE TABLE IF NOT EXISTS return_requests (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  return_number   VARCHAR(50)  NOT NULL UNIQUE,
  order_id        INT          NOT NULL,
  order_item_id   INT          DEFAULT NULL,
  customer_id     INT          NOT NULL,
  vendor_id       INT          DEFAULT NULL,
  reason          TEXT         NOT NULL,
  description     TEXT         DEFAULT NULL,
  images          TEXT         DEFAULT NULL,
  status          VARCHAR(30)  NOT NULL DEFAULT 'pending',
  type            VARCHAR(20)  NOT NULL DEFAULT 'return',
  refund_amount   DECIMAL(12,2) DEFAULT NULL,
  refund_method   VARCHAR(100) DEFAULT NULL,
  admin_note      TEXT         DEFAULT NULL,
  resolved_at     DATETIME     DEFAULT NULL,
  created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_ret_order    (order_id),
  INDEX idx_ret_customer (customer_id),
  INDEX idx_ret_status   (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 5. Audit / Activity Logs ────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT          DEFAULT NULL,
  user_type   VARCHAR(20)  DEFAULT NULL,
  action      VARCHAR(100) NOT NULL,
  resource    VARCHAR(100) DEFAULT NULL,
  resource_id INT          DEFAULT NULL,
  old_value   LONGTEXT     DEFAULT NULL,
  new_value   LONGTEXT     DEFAULT NULL,
  ip_address  VARCHAR(50)  DEFAULT NULL,
  user_agent  VARCHAR(500) DEFAULT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_al_user     (user_id, user_type),
  INDEX idx_al_resource (resource, resource_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 6. Vendor Refresh Tokens ────────────────────────────────
CREATE TABLE IF NOT EXISTS vendor_refresh_tokens (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  vendor_id   INT          NOT NULL,
  token       VARCHAR(512) NOT NULL,
  expires_at  DATETIME     NOT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_vrt_vendor (vendor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 7. Vendor store fields ───────────────────────────────────
ALTER TABLE vendors
  ADD COLUMN IF NOT EXISTS slug            VARCHAR(191) DEFAULT NULL UNIQUE AFTER email,
  ADD COLUMN IF NOT EXISTS store_name      VARCHAR(191) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS store_banner    VARCHAR(500) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS store_logo      VARCHAR(500) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS store_description TEXT       DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS store_policies  TEXT         DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS bank_name       VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS bank_account    VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS bank_routing    VARCHAR(100) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS total_sales     DECIMAL(14,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS total_orders    INT          NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS rating          DECIMAL(3,2) DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS rating_count    INT          NOT NULL DEFAULT 0;

-- ─── 8. Vendor Store Reviews ─────────────────────────────────
CREATE TABLE IF NOT EXISTS vendor_reviews (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  vendor_id   INT          NOT NULL,
  customer_id INT          NOT NULL,
  order_id    INT          DEFAULT NULL,
  rating      TINYINT      NOT NULL DEFAULT 5,
  comment     TEXT         DEFAULT NULL,
  status      VARCHAR(20)  NOT NULL DEFAULT 'approved',
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_vr_vendor   (vendor_id),
  INDEX idx_vr_customer (customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 9. Vendor Store Followers ────────────────────────────────
CREATE TABLE IF NOT EXISTS vendor_followers (
  vendor_id   INT NOT NULL,
  customer_id INT NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (vendor_id, customer_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 10. Product Compare (session-based on frontend, but log here) ──
-- (Compare is handled client-side via localStorage, no table needed)

-- ─── 11. Notifications for vendors ───────────────────────────
CREATE TABLE IF NOT EXISTS vendor_notifications (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  vendor_id   INT          NOT NULL,
  title       VARCHAR(255) NOT NULL,
  message     TEXT         DEFAULT NULL,
  type        VARCHAR(50)  NOT NULL DEFAULT 'info',
  is_read     TINYINT(1)   NOT NULL DEFAULT 0,
  link        VARCHAR(500) DEFAULT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_vn_vendor (vendor_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 12. Inventory Movements ─────────────────────────────────
CREATE TABLE IF NOT EXISTS inventory_movements (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  product_id  INT          NOT NULL,
  vendor_id   INT          DEFAULT NULL,
  type        VARCHAR(30)  NOT NULL,
  quantity    INT          NOT NULL,
  stock_before INT         NOT NULL DEFAULT 0,
  stock_after  INT         NOT NULL DEFAULT 0,
  reference   VARCHAR(100) DEFAULT NULL,
  note        TEXT         DEFAULT NULL,
  created_by  INT          DEFAULT NULL,
  created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_im_product (product_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ─── 13. Generate vendor slugs for existing vendors ──────────
UPDATE vendors SET slug = CONCAT('vendor-', id) WHERE slug IS NULL;

SET foreign_key_checks = 1;

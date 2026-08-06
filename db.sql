-- =============================================================
-- Sholok Ecommerce — Complete MySQL Schema
-- MongoDB -> MySQL Migration | Normalized to 3NF
-- mysql2 only | No Prisma | No Sequelize
-- Total: 40 tables
-- Import: phpMyAdmin > Import > Select this file > Go
-- =============================================================

DROP DATABASE IF EXISTS sholok_ecommerce;

CREATE DATABASE sholok_ecommerce
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE sholok_ecommerce;

SET FOREIGN_KEY_CHECKS = 0;
SET sql_mode = 'NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------------
-- 1. admins
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS admins (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name       VARCHAR(255) NOT NULL,
  email      VARCHAR(255) NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  role       ENUM('super_admin','admin','manager') NOT NULL DEFAULT 'admin',
  is_active  TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_admins_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 2. categories  (self-referential parent_id)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(255) NOT NULL,
  slug             VARCHAR(255) NOT NULL UNIQUE,
  description      TEXT,
  image            VARCHAR(500) DEFAULT '',
  banner           VARCHAR(500) DEFAULT '',
  parent_id        INT UNSIGNED DEFAULT NULL,
  is_active        TINYINT(1) NOT NULL DEFAULT 1,
  featured         TINYINT(1) NOT NULL DEFAULT 0,
  sort_order       INT NOT NULL DEFAULT 0,
  icon             VARCHAR(255) DEFAULT '',
  meta_title       VARCHAR(255) DEFAULT '',
  meta_description TEXT,
  show_on_menu     TINYINT(1) NOT NULL DEFAULT 1,
  show_on_homepage TINYINT(1) NOT NULL DEFAULT 1,
  show_in_search   TINYINT(1) NOT NULL DEFAULT 1,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_categories_parent   (parent_id),
  INDEX idx_categories_active   (is_active),
  INDEX idx_categories_featured (featured),
  CONSTRAINT fk_categories_parent
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 3. products
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
  id                     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name                   VARCHAR(255) NOT NULL,
  slug                   VARCHAR(255) NOT NULL UNIQUE,
  description            LONGTEXT,
  short_description      TEXT,
  category_id            INT UNSIGNED NOT NULL,
  regular_price          DECIMAL(12,2) NOT NULL,
  sale_price             DECIMAL(12,2) DEFAULT NULL,
  sku                    VARCHAR(255) NOT NULL UNIQUE,
  stock                  INT NOT NULL DEFAULT 0,
  thumbnail              VARCHAR(500) DEFAULT '',
  status                 ENUM('active','draft','out_of_stock','published','archived') NOT NULL DEFAULT 'active',
  featured               TINYINT(1) NOT NULL DEFAULT 0,
  is_new                 TINYINT(1) NOT NULL DEFAULT 0,
  on_sale                TINYINT(1) NOT NULL DEFAULT 0,
  scheduled_publish_date TIMESTAMP NULL DEFAULT NULL,
  availability_date      TIMESTAMP NULL DEFAULT NULL,
  shipping_class         ENUM('standard','express','free','heavy','fragile','custom') NOT NULL DEFAULT 'standard',
  shipping_charge        DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  visibility             ENUM('visible','hidden') NOT NULL DEFAULT 'visible',
  low_stock_threshold    INT NOT NULL DEFAULT 5,
  created_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_products_category   (category_id),
  INDEX idx_products_status     (status),
  INDEX idx_products_featured   (featured),
  INDEX idx_products_on_sale    (on_sale),
  INDEX idx_products_visibility (visibility),
  CONSTRAINT fk_products_category
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 4. product_images
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_images (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  image_url  VARCHAR(500) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  INDEX idx_product_images_product (product_id),
  CONSTRAINT fk_product_images_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 5. product_tags
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_tags (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  tag        VARCHAR(100) NOT NULL,
  INDEX idx_product_tags_product (product_id),
  INDEX idx_product_tags_tag     (tag),
  CONSTRAINT fk_product_tags_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 6. product_variants
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_variants (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id INT UNSIGNED NOT NULL,
  name       VARCHAR(255) NOT NULL,
  sku        VARCHAR(255) DEFAULT NULL,
  price      DECIMAL(12,2) DEFAULT NULL,
  sale_price DECIMAL(12,2) DEFAULT NULL,
  stock      INT NOT NULL DEFAULT 0,
  INDEX idx_product_variants_product (product_id),
  CONSTRAINT fk_product_variants_product
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 7. variant_attributes  (normalizes Map<String,String>)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS variant_attributes (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  variant_id INT UNSIGNED NOT NULL,
  attr_key   VARCHAR(100) NOT NULL,
  attr_value VARCHAR(255) NOT NULL,
  INDEX idx_variant_attributes_variant (variant_id),
  CONSTRAINT fk_variant_attributes_variant
    FOREIGN KEY (variant_id) REFERENCES product_variants(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 8-10. product cross-reference tables
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_related (
  product_id         INT UNSIGNED NOT NULL,
  related_product_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (product_id, related_product_id),
  CONSTRAINT fk_pr_product FOREIGN KEY (product_id)         REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_pr_related FOREIGN KEY (related_product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_upsell (
  product_id        INT UNSIGNED NOT NULL,
  upsell_product_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (product_id, upsell_product_id),
  CONSTRAINT fk_pu_product FOREIGN KEY (product_id)        REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_pu_upsell  FOREIGN KEY (upsell_product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS product_crosssell (
  product_id           INT UNSIGNED NOT NULL,
  crosssell_product_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (product_id, crosssell_product_id),
  CONSTRAINT fk_pc_product   FOREIGN KEY (product_id)           REFERENCES products(id) ON DELETE CASCADE,
  CONSTRAINT fk_pc_crosssell FOREIGN KEY (crosssell_product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 11. customers
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS customers (
  id                     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name                   VARCHAR(255) NOT NULL,
  email                  VARCHAR(255) NOT NULL UNIQUE,
  phone                  VARCHAR(50) DEFAULT '',
  password               VARCHAR(255) DEFAULT NULL,
  total_orders           INT NOT NULL DEFAULT 0,
  total_spent            DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  status                 ENUM('active','inactive','blocked') NOT NULL DEFAULT 'active',
  customer_group         ENUM('regular','wholesale','vip','dealer') NOT NULL DEFAULT 'regular',
  group_discount         DECIMAL(5,2) NOT NULL DEFAULT 0.00,
  reward_points          INT NOT NULL DEFAULT 0,
  total_points_earned    INT NOT NULL DEFAULT 0,
  total_points_redeemed  INT NOT NULL DEFAULT 0,
  last_login_date        TIMESTAMP NULL DEFAULT NULL,
  last_login_ip          VARCHAR(100) DEFAULT '',
  password_reset_token   VARCHAR(255) DEFAULT NULL,
  password_reset_expires TIMESTAMP NULL DEFAULT NULL,
  activation_token       VARCHAR(255) DEFAULT NULL,
  is_activated           TINYINT(1) NOT NULL DEFAULT 0,
  suspended_until        TIMESTAMP NULL DEFAULT NULL,
  created_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at             TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_customers_status (status),
  INDEX idx_customers_group  (customer_group)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 12. customer_addresses
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_addresses (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id INT UNSIGNED NOT NULL,
  label       VARCHAR(100) DEFAULT 'Home',
  name        VARCHAR(255) DEFAULT '',
  phone       VARCHAR(50)  DEFAULT '',
  street      VARCHAR(500) DEFAULT '',
  city        VARCHAR(100) DEFAULT '',
  state       VARCHAR(100) DEFAULT '',
  zip_code    VARCHAR(20)  DEFAULT '',
  country     VARCHAR(100) DEFAULT 'Bangladesh',
  type        ENUM('billing','shipping','both') NOT NULL DEFAULT 'both',
  is_default  TINYINT(1) NOT NULL DEFAULT 0,
  INDEX idx_customer_addresses_customer (customer_id),
  CONSTRAINT fk_customer_addresses_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 13. customer_login_history
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_login_history (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id INT UNSIGNED NOT NULL,
  ip          VARCHAR(100) DEFAULT '',
  device      VARCHAR(255) DEFAULT '',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_login_history_customer (customer_id),
  CONSTRAINT fk_login_history_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 14. customer_notifications
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_notifications (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id INT UNSIGNED NOT NULL,
  title       VARCHAR(255) NOT NULL,
  message     TEXT NOT NULL,
  type        ENUM('info','promo','warning','account') NOT NULL DEFAULT 'info',
  is_read     TINYINT(1) NOT NULL DEFAULT 0,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_cust_notif_customer (customer_id),
  INDEX idx_cust_notif_read     (is_read),
  CONSTRAINT fk_cust_notif_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 15. customer_wishlist  (many-to-many)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_wishlist (
  customer_id INT UNSIGNED NOT NULL,
  product_id  INT UNSIGNED NOT NULL,
  added_at    TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (customer_id, product_id),
  CONSTRAINT fk_wishlist_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT fk_wishlist_product  FOREIGN KEY (product_id)  REFERENCES products(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 16. orders
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_number            VARCHAR(100) NOT NULL UNIQUE,
  customer_id             INT UNSIGNED NOT NULL,
  subtotal                DECIMAL(12,2) NOT NULL,
  tax                     DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  shipping                DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  delivery_charge         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  discount                DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  coupon_code             VARCHAR(100) DEFAULT NULL,
  total                   DECIMAL(12,2) NOT NULL,
  status                  ENUM('pending','confirmed','processing','shipped','out_for_delivery','delivered','cancelled','refunded') NOT NULL DEFAULT 'pending',
  payment_status          ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  payment_method          ENUM('credit_card','debit_card','paypal','bank_transfer','cash_on_delivery','online_payment','card','mobile_banking') DEFAULT NULL,
  shipping_name           VARCHAR(255) DEFAULT '',
  shipping_phone          VARCHAR(50)  DEFAULT '',
  shipping_street         VARCHAR(500) DEFAULT '',
  shipping_city           VARCHAR(100) DEFAULT '',
  shipping_state          VARCHAR(100) DEFAULT '',
  shipping_zip_code       VARCHAR(20)  DEFAULT '',
  shipping_country        VARCHAR(100) DEFAULT '',
  delivery_full_name      VARCHAR(255) DEFAULT '',
  delivery_phone          VARCHAR(50)  DEFAULT '',
  delivery_address_line1  VARCHAR(500) DEFAULT '',
  delivery_address_line2  VARCHAR(500) DEFAULT '',
  delivery_city           VARCHAR(100) DEFAULT '',
  delivery_area           VARCHAR(100) DEFAULT '',
  delivery_postal_code    VARCHAR(20)  DEFAULT '',
  delivery_landmark       VARCHAR(255) DEFAULT '',
  delivery_instructions   TEXT,
  delivery_slot_date      DATE DEFAULT NULL,
  delivery_time_slot      VARCHAR(100) DEFAULT NULL,
  estimated_delivery_date DATE DEFAULT NULL,
  delivered_at            TIMESTAMP NULL DEFAULT NULL,
  cancelled_at            TIMESTAMP NULL DEFAULT NULL,
  cancellation_reason     TEXT,
  tracking_number         VARCHAR(255) DEFAULT '',
  courier_name            VARCHAR(255) DEFAULT '',
  admin_note              TEXT,
  notes                   TEXT,
  created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_orders_customer       (customer_id),
  INDEX idx_orders_status         (status),
  INDEX idx_orders_payment_status (payment_status),
  INDEX idx_orders_created        (created_at),
  CONSTRAINT fk_orders_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 17. order_items
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_items (
  id            INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id      INT UNSIGNED NOT NULL,
  product_id    INT UNSIGNED NOT NULL,
  product_name  VARCHAR(255) NOT NULL DEFAULT '',
  product_image VARCHAR(500) DEFAULT '',
  variant_id    VARCHAR(100) DEFAULT NULL,
  variant_name  VARCHAR(255) DEFAULT NULL,
  quantity      INT NOT NULL,
  price         DECIMAL(12,2) NOT NULL,
  total         DECIMAL(12,2) NOT NULL,
  INDEX idx_order_items_order   (order_id),
  INDEX idx_order_items_product (product_id),
  CONSTRAINT fk_order_items_order   FOREIGN KEY (order_id)   REFERENCES orders(id)  ON DELETE CASCADE,
  CONSTRAINT fk_order_items_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 18. order_status_history
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS order_status_history (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id   INT UNSIGNED NOT NULL,
  status     VARCHAR(50) NOT NULL,
  note       TEXT,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_status_history_order (order_id),
  CONSTRAINT fk_status_history_order
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 19. customer_reward_history
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS customer_reward_history (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  customer_id INT UNSIGNED NOT NULL,
  type        ENUM('earned','redeemed','bonus','adjusted') NOT NULL,
  points      INT NOT NULL,
  description VARCHAR(500) DEFAULT '',
  order_id    INT UNSIGNED DEFAULT NULL,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_reward_history_customer (customer_id),
  CONSTRAINT fk_reward_history_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT fk_reward_history_order
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 20. payments
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  order_id         INT UNSIGNED NOT NULL,
  transaction_id   VARCHAR(255) NOT NULL UNIQUE,
  amount           DECIMAL(12,2) NOT NULL,
  method           ENUM('credit_card','debit_card','paypal','bank_transfer','cash_on_delivery','bkash','nagad','rocket','sslcommerz','stripe') NOT NULL,
  status           ENUM('pending','completed','failed','refunded','partially_refunded') NOT NULL DEFAULT 'pending',
  gateway          VARCHAR(100) DEFAULT '',
  gateway_response JSON DEFAULT NULL,
  notes            TEXT,
  verified         TINYINT(1) NOT NULL DEFAULT 0,
  proof_image      VARCHAR(500) DEFAULT '',
  refund_amount    DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  refund_type      ENUM('full','partial','') NOT NULL DEFAULT '',
  refund_reason    TEXT,
  refund_to        VARCHAR(255) DEFAULT '',
  refunded_at      TIMESTAMP NULL DEFAULT NULL,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_payments_order  (order_id),
  INDEX idx_payments_status (status),
  INDEX idx_payments_method (method),
  CONSTRAINT fk_payments_order
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 21. reviews
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS reviews (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id  INT UNSIGNED NOT NULL,
  customer_id INT UNSIGNED NOT NULL,
  rating      TINYINT UNSIGNED NOT NULL,
  title       VARCHAR(255) DEFAULT '',
  comment     TEXT,
  status      ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_reviews_product  (product_id),
  INDEX idx_reviews_customer (customer_id),
  INDEX idx_reviews_status   (status),
  CONSTRAINT fk_reviews_product  FOREIGN KEY (product_id)  REFERENCES products(id)  ON DELETE CASCADE,
  CONSTRAINT fk_reviews_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  CONSTRAINT chk_reviews_rating  CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 22. banners
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS banners (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title            VARCHAR(255) NOT NULL,
  title_bn         VARCHAR(255) DEFAULT '',
  subtitle         VARCHAR(500) DEFAULT '',
  subtitle_bn      VARCHAR(500) DEFAULT '',
  description      TEXT,
  description_bn   TEXT,
  image            VARCHAR(500) NOT NULL,
  image_mobile     VARCHAR(500) DEFAULT '',
  link_url         VARCHAR(500) DEFAULT '',
  link_text        VARCHAR(100) DEFAULT 'Shop Now',
  link_text_bn     VARCHAR(100) DEFAULT '',
  background_color VARCHAR(20)  DEFAULT '#ffffff',
  text_color       VARCHAR(20)  DEFAULT '#000000',
  button_color     VARCHAR(20)  DEFAULT '#E31E24',
  sort_order       INT NOT NULL DEFAULT 0,
  is_active        TINYINT(1) NOT NULL DEFAULT 1,
  start_date       TIMESTAMP NULL DEFAULT NULL,
  end_date         TIMESTAMP NULL DEFAULT NULL,
  position         ENUM('hero','middle','footer') NOT NULL DEFAULT 'hero',
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_banners_active   (is_active),
  INDEX idx_banners_position (position),
  INDEX idx_banners_order    (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 23. home_sections
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS home_sections (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  section_key      VARCHAR(100) NOT NULL UNIQUE,
  title            VARCHAR(255) NOT NULL,
  title_bn         VARCHAR(255) DEFAULT '',
  subtitle         VARCHAR(500) DEFAULT '',
  subtitle_bn      VARCHAR(500) DEFAULT '',
  description      TEXT,
  description_bn   TEXT,
  icon             VARCHAR(255) DEFAULT '',
  layout           ENUM('grid','carousel') NOT NULL DEFAULT 'carousel',
  accent_color     VARCHAR(20)  DEFAULT '',
  background_color VARCHAR(20)  DEFAULT '',
  banner_image     VARCHAR(500) DEFAULT '',
  sort_order       INT NOT NULL DEFAULT 0,
  is_active        TINYINT(1) NOT NULL DEFAULT 1,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_home_sections_active (is_active),
  INDEX idx_home_sections_order  (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 24. home_section_items
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS home_section_items (
  id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  section_id     INT UNSIGNED NOT NULL,
  product_id     INT UNSIGNED DEFAULT NULL,
  name           VARCHAR(255) NOT NULL,
  name_bn        VARCHAR(255) DEFAULT '',
  slug           VARCHAR(255) DEFAULT '',
  image          VARCHAR(500) DEFAULT '',
  price          DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  compare_price  DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  unit           VARCHAR(50)  DEFAULT '',
  badge          VARCHAR(100) DEFAULT '',
  min_qty        INT NOT NULL DEFAULT 0,
  description    TEXT,
  description_bn TEXT,
  link           VARCHAR(500) DEFAULT '',
  sort_order     INT NOT NULL DEFAULT 0,
  is_active      TINYINT(1) NOT NULL DEFAULT 1,
  INDEX idx_hs_items_section (section_id),
  INDEX idx_hs_items_product (product_id),
  CONSTRAINT fk_hs_items_section FOREIGN KEY (section_id) REFERENCES home_sections(id) ON DELETE CASCADE,
  CONSTRAINT fk_hs_items_product FOREIGN KEY (product_id) REFERENCES products(id)      ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 25. delivery_areas
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS delivery_areas (
  id                      INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name                    VARCHAR(255) NOT NULL,
  city                    VARCHAR(100) DEFAULT '',
  delivery_charge         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  free_delivery_threshold DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  estimated_delivery_days INT NOT NULL DEFAULT 1,
  is_active               TINYINT(1) NOT NULL DEFAULT 1,
  created_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at              TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 26. delivery_area_postal_codes
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS delivery_area_postal_codes (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  delivery_area_id INT UNSIGNED NOT NULL,
  postal_code      VARCHAR(20) NOT NULL,
  INDEX idx_dapc_area        (delivery_area_id),
  INDEX idx_dapc_postal_code (postal_code),
  CONSTRAINT fk_dapc_area
    FOREIGN KEY (delivery_area_id) REFERENCES delivery_areas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 27. shipping_methods
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS shipping_methods (
  id               INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name             VARCHAR(255) NOT NULL,
  description      TEXT,
  type             ENUM('flat','weight','free','cod','express') NOT NULL DEFAULT 'flat',
  price            DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  min_order_amount DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  delivery_days    INT NOT NULL DEFAULT 1,
  is_active        TINYINT(1) NOT NULL DEFAULT 1,
  created_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at       TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 28. coupons
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupons (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  code                VARCHAR(100) NOT NULL UNIQUE,
  description         TEXT,
  discount_type       ENUM('percentage','fixed') NOT NULL,
  discount_value      DECIMAL(10,2) NOT NULL,
  min_purchase_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  max_discount_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  start_date          TIMESTAMP NULL DEFAULT NULL,
  end_date            TIMESTAMP NULL DEFAULT NULL,
  usage_limit         INT NOT NULL DEFAULT 0,
  used_count          INT NOT NULL DEFAULT 0,
  usage_per_customer  INT NOT NULL DEFAULT 1,
  is_active           TINYINT(1) NOT NULL DEFAULT 1,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_coupons_code   (code),
  INDEX idx_coupons_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 29-30. coupon join tables
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS coupon_categories (
  coupon_id   INT UNSIGNED NOT NULL,
  category_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (coupon_id, category_id),
  CONSTRAINT fk_cc_coupon   FOREIGN KEY (coupon_id)   REFERENCES coupons(id)    ON DELETE CASCADE,
  CONSTRAINT fk_cc_category FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS coupon_products (
  coupon_id  INT UNSIGNED NOT NULL,
  product_id INT UNSIGNED NOT NULL,
  PRIMARY KEY (coupon_id, product_id),
  CONSTRAINT fk_cp_coupon  FOREIGN KEY (coupon_id)  REFERENCES coupons(id)  ON DELETE CASCADE,
  CONSTRAINT fk_cp_product FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 31. flash_sales
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS flash_sales (
  id                  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title               VARCHAR(255) NOT NULL,
  description         TEXT,
  discount_type       ENUM('percentage','fixed') NOT NULL,
  discount_value      DECIMAL(10,2) NOT NULL,
  start_date          DATETIME NOT NULL,
  end_date            DATETIME NOT NULL,
  min_purchase_amount DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  badge               VARCHAR(100) DEFAULT '',
  is_active           TINYINT(1) NOT NULL DEFAULT 1,
  created_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at          TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_flash_sales_active (is_active),
  INDEX idx_flash_sales_dates  (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 32-33. flash sale join tables
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS flash_sale_products (
  flash_sale_id INT UNSIGNED NOT NULL,
  product_id    INT UNSIGNED NOT NULL,
  PRIMARY KEY (flash_sale_id, product_id),
  CONSTRAINT fk_fsp_sale    FOREIGN KEY (flash_sale_id) REFERENCES flash_sales(id) ON DELETE CASCADE,
  CONSTRAINT fk_fsp_product FOREIGN KEY (product_id)    REFERENCES products(id)    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS flash_sale_categories (
  flash_sale_id INT UNSIGNED NOT NULL,
  category_id   INT UNSIGNED NOT NULL,
  PRIMARY KEY (flash_sale_id, category_id),
  CONSTRAINT fk_fsc_sale     FOREIGN KEY (flash_sale_id) REFERENCES flash_sales(id) ON DELETE CASCADE,
  CONSTRAINT fk_fsc_category FOREIGN KEY (category_id)   REFERENCES categories(id)  ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 34. email_campaigns
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS email_campaigns (
  id           INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  title        VARCHAR(255) NOT NULL,
  subject      VARCHAR(500) NOT NULL,
  body         LONGTEXT NOT NULL,
  audience     VARCHAR(100) DEFAULT 'all',
  status       ENUM('draft','scheduled','sent','cancelled') NOT NULL DEFAULT 'draft',
  scheduled_at TIMESTAMP NULL DEFAULT NULL,
  sent_at      TIMESTAMP NULL DEFAULT NULL,
  sent_count   INT NOT NULL DEFAULT 0,
  created_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ===========================================================
-- PREVIOUSLY MISSING COLLECTIONS (from MongoDB)
-- ===========================================================

-- -----------------------------------------------------------
-- 35. notifications  (system-wide standalone collection)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS notifications (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  user_type  ENUM('admin','customer') NOT NULL DEFAULT 'customer',
  title      VARCHAR(255) NOT NULL,
  message    TEXT NOT NULL,
  type       VARCHAR(50) NOT NULL DEFAULT 'info',
  is_read    TINYINT(1) NOT NULL DEFAULT 0,
  data       JSON DEFAULT NULL,
  link       VARCHAR(500) DEFAULT '',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_notifications_user    (user_id, user_type),
  INDEX idx_notifications_is_read (is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 36. password_resets  (passwordresets collection)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS password_resets (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  user_type  ENUM('admin','customer') NOT NULL DEFAULT 'customer',
  token      VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  used       TINYINT(1) NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_password_resets_token (token),
  INDEX idx_password_resets_user  (user_id, user_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 37. refresh_tokens  (refreshtokens collection)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id    INT UNSIGNED NOT NULL,
  user_type  ENUM('admin','customer') NOT NULL DEFAULT 'customer',
  token      VARCHAR(512) NOT NULL UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_refresh_tokens_user  (user_id, user_type),
  INDEX idx_refresh_tokens_token (token(64))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 38. settings  (settings collection — key-value store)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS settings (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  value       LONGTEXT,
  group_name  VARCHAR(100) NOT NULL DEFAULT 'general',
  description VARCHAR(500) DEFAULT '',
  data_type   ENUM('string','number','boolean','json','array') NOT NULL DEFAULT 'string',
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_settings_group (group_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 39. subscriptions  (subscriptions collection)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS subscriptions (
  id         INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  email      VARCHAR(255) NOT NULL UNIQUE,
  name       VARCHAR(255) DEFAULT '',
  phone      VARCHAR(50)  DEFAULT '',
  status     ENUM('active','unsubscribed') NOT NULL DEFAULT 'active',
  type       VARCHAR(50) NOT NULL DEFAULT 'newsletter',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_subscriptions_status (status),
  INDEX idx_subscriptions_type   (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------
-- 40. questions  (questions collection — product Q&A)
-- -----------------------------------------------------------
CREATE TABLE IF NOT EXISTS questions (
  id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  product_id  INT UNSIGNED NOT NULL,
  customer_id INT UNSIGNED DEFAULT NULL,
  question    TEXT NOT NULL,
  answer      TEXT DEFAULT NULL,
  answered_by INT UNSIGNED DEFAULT NULL,
  status      ENUM('pending','answered','rejected') NOT NULL DEFAULT 'pending',
  is_public   TINYINT(1) NOT NULL DEFAULT 1,
  created_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_questions_product  (product_id),
  INDEX idx_questions_customer (customer_id),
  INDEX idx_questions_status   (status),
  CONSTRAINT fk_questions_product
    FOREIGN KEY (product_id)  REFERENCES products(id)  ON DELETE CASCADE,
  CONSTRAINT fk_questions_customer
    FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  CONSTRAINT fk_questions_admin
    FOREIGN KEY (answered_by) REFERENCES admins(id)    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
SET sql_mode = DEFAULT;

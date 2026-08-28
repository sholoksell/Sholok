-- ============================================================
--  Sholok Blog — MySQL Database Schema
--  Database: blog_db
--  Engine:   InnoDB | Charset: utf8mb4_unicode_ci
--
--  How to import:
--    phpMyAdmin  → Import → choose this file → Go
--    MySQL CLI   → mysql -u root -p < blog_db.sql
--    Workbench   → File → Run SQL Script → choose this file
-- ============================================================

CREATE DATABASE IF NOT EXISTS blog_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE blog_db;

-- ─────────────────────────────────────────────
--  1. users
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  username        VARCHAR(30)     NOT NULL,
  email           VARCHAR(255)    NOT NULL,
  password        VARCHAR(255)    NOT NULL,
  display_name    VARCHAR(50)     NOT NULL,
  bio             TEXT            NOT NULL DEFAULT '',
  avatar          VARCHAR(500)    NOT NULL DEFAULT '',
  cover_image     VARCHAR(500)    NOT NULL DEFAULT '',
  role            ENUM('user','admin') NOT NULL DEFAULT 'user',
  is_verified     TINYINT(1)      NOT NULL DEFAULT 0,
  is_active       TINYINT(1)      NOT NULL DEFAULT 1,
  website         VARCHAR(500)    NOT NULL DEFAULT '',
  location        VARCHAR(255)    NOT NULL DEFAULT '',
  total_views     INT UNSIGNED    NOT NULL DEFAULT 0,
  last_login      DATETIME        NULL     DEFAULT NULL,
  notif_email     TINYINT(1)      NOT NULL DEFAULT 1,
  notif_push      TINYINT(1)      NOT NULL DEFAULT 1,
  notif_new_post  TINYINT(1)      NOT NULL DEFAULT 1,
  notif_comments  TINYINT(1)      NOT NULL DEFAULT 1,
  notif_reactions TINYINT(1)      NOT NULL DEFAULT 1,
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_username (username),
  UNIQUE KEY uq_email    (email),
  INDEX idx_role (role),
  INDEX idx_is_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
--  2. categories  (self-referential parent_id)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  name        VARCHAR(100)    NOT NULL,
  name_bn     VARCHAR(100)    NOT NULL DEFAULT '',
  name_en     VARCHAR(100)    NOT NULL DEFAULT '',
  slug        VARCHAR(100)    NOT NULL,
  description TEXT            NOT NULL DEFAULT '',
  icon        VARCHAR(20)     NOT NULL DEFAULT '',
  color       VARCHAR(20)     NOT NULL DEFAULT '#6366f1',
  image       VARCHAR(500)    NOT NULL DEFAULT '',
  parent_id   INT UNSIGNED    NULL     DEFAULT NULL,
  is_active   TINYINT(1)      NOT NULL DEFAULT 1,
  order_num   INT             NOT NULL DEFAULT 0,
  post_count  INT UNSIGNED    NOT NULL DEFAULT 0,
  `group`     ENUM('entertainment','lifestyle','hobbies','knowledge') NOT NULL,
  created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_slug (slug),
  INDEX idx_is_active_order (is_active, order_num),
  CONSTRAINT fk_cat_parent FOREIGN KEY (parent_id)
    REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
--  3. category_subcategories
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS category_subcategories (
  id          INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  category_id INT UNSIGNED    NOT NULL,
  name        VARCHAR(100)    NOT NULL,
  slug        VARCHAR(100)    NOT NULL,
  icon        VARCHAR(20)     NOT NULL DEFAULT '',
  PRIMARY KEY (id),
  CONSTRAINT fk_subcat_cat FOREIGN KEY (category_id)
    REFERENCES categories(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
--  4. posts
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS posts (
  id              INT UNSIGNED    NOT NULL AUTO_INCREMENT,
  title           VARCHAR(200)    NOT NULL,
  title_bn        VARCHAR(200)    NOT NULL DEFAULT '',
  title_en        VARCHAR(200)    NOT NULL DEFAULT '',
  slug            VARCHAR(320)    NOT NULL,
  content         LONGTEXT        NOT NULL,
  content_bn      LONGTEXT        NOT NULL DEFAULT '',
  content_en      LONGTEXT        NOT NULL DEFAULT '',
  excerpt         VARCHAR(500)    NOT NULL DEFAULT '',
  excerpt_bn      VARCHAR(500)    NOT NULL DEFAULT '',
  excerpt_en      VARCHAR(500)    NOT NULL DEFAULT '',
  author_id       INT UNSIGNED    NOT NULL,
  category_id     INT UNSIGNED    NOT NULL,
  subcategory     VARCHAR(100)    NOT NULL DEFAULT '',
  featured_image  VARCHAR(500)    NOT NULL DEFAULT '',
  status          ENUM('draft','published','scheduled','deleted') NOT NULL DEFAULT 'draft',
  scheduled_at    DATETIME        NULL     DEFAULT NULL,
  published_at    DATETIME        NULL     DEFAULT NULL,
  views           INT UNSIGNED    NOT NULL DEFAULT 0,
  unique_views    INT UNSIGNED    NOT NULL DEFAULT 0,
  is_featured     TINYINT(1)      NOT NULL DEFAULT 0,
  is_deleted      TINYINT(1)      NOT NULL DEFAULT 0,
  seo_title       VARCHAR(70)     NOT NULL DEFAULT '',
  seo_description VARCHAR(160)    NOT NULL DEFAULT '',
  read_time       INT UNSIGNED    NOT NULL DEFAULT 0,
  language        VARCHAR(10)     NOT NULL DEFAULT 'en',
  location        VARCHAR(255)    NOT NULL DEFAULT '',
  created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_slug (slug),
  INDEX idx_author_status    (author_id, status),
  INDEX idx_category_status  (category_id, status),
  INDEX idx_created_at       (created_at DESC),
  INDEX idx_views            (views DESC),
  INDEX idx_is_deleted       (is_deleted, status),
  INDEX idx_is_featured      (is_featured),
  FULLTEXT INDEX ft_posts    (title, content),
  CONSTRAINT fk_post_author   FOREIGN KEY (author_id)
    REFERENCES users(id)      ON DELETE CASCADE  ON UPDATE CASCADE,
  CONSTRAINT fk_post_category FOREIGN KEY (category_id)
    REFERENCES categories(id) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
--  5. post_images
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_images (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  post_id    INT UNSIGNED NOT NULL,
  url        VARCHAR(500) NOT NULL,
  sort_order INT UNSIGNED NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  CONSTRAINT fk_img_post FOREIGN KEY (post_id)
    REFERENCES posts(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
--  6. post_videos
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_videos (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  post_id       INT UNSIGNED NOT NULL,
  url           VARCHAR(500) NOT NULL,
  thumbnail     VARCHAR(500) NOT NULL DEFAULT '',
  title         VARCHAR(200) NOT NULL DEFAULT '',
  is_short_clip TINYINT(1)  NOT NULL DEFAULT 0,
  PRIMARY KEY (id),
  INDEX idx_short_clip (is_short_clip),
  CONSTRAINT fk_vid_post FOREIGN KEY (post_id)
    REFERENCES posts(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
--  7. post_tags
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_tags (
  post_id INT UNSIGNED NOT NULL,
  tag     VARCHAR(100) NOT NULL,
  PRIMARY KEY (post_id, tag),
  INDEX idx_tag (tag),
  CONSTRAINT fk_tag_post FOREIGN KEY (post_id)
    REFERENCES posts(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
--  8. post_view_history  (IP-based unique view tracking)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_view_history (
  id        INT UNSIGNED NOT NULL AUTO_INCREMENT,
  post_id   INT UNSIGNED NOT NULL,
  ip        VARCHAR(45)  NOT NULL,
  viewed_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_post_ip (post_id, ip),
  CONSTRAINT fk_vh_post FOREIGN KEY (post_id)
    REFERENCES posts(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
--  9. post_likes  (separate from reactions; legacy MongoDB field)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS post_likes (
  post_id    INT UNSIGNED NOT NULL,
  user_id    INT UNSIGNED NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (post_id, user_id),
  CONSTRAINT fk_pl_post FOREIGN KEY (post_id)
    REFERENCES posts(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_pl_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
--  10. user_follows  (followers / following many-to-many)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_follows (
  follower_id INT UNSIGNED NOT NULL,
  followed_id INT UNSIGNED NOT NULL,
  created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (follower_id, followed_id),
  INDEX idx_followed (followed_id),
  CONSTRAINT fk_uf_follower FOREIGN KEY (follower_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_uf_followed FOREIGN KEY (followed_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
--  11. user_neighbor_requests
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_neighbor_requests (
  requester_id INT UNSIGNED NOT NULL,
  target_id    INT UNSIGNED NOT NULL,
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (requester_id, target_id),
  INDEX idx_target (target_id),
  CONSTRAINT fk_nr_requester FOREIGN KEY (requester_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_nr_target FOREIGN KEY (target_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
--  12. user_saved_posts
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_saved_posts (
  user_id    INT UNSIGNED NOT NULL,
  post_id    INT UNSIGNED NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (user_id, post_id),
  CONSTRAINT fk_sp_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_sp_post FOREIGN KEY (post_id)
    REFERENCES posts(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
--  13. user_interests
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS user_interests (
  id       INT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id  INT UNSIGNED NOT NULL,
  interest VARCHAR(100) NOT NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uq_user_interest (user_id, interest),
  CONSTRAINT fk_ui_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
--  14. comments  (threaded — self-referential)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comments (
  id                INT UNSIGNED NOT NULL AUTO_INCREMENT,
  post_id           INT UNSIGNED NOT NULL,
  author_id         INT UNSIGNED NOT NULL,
  content           TEXT         NOT NULL,
  parent_comment_id INT UNSIGNED NULL DEFAULT NULL,
  is_deleted        TINYINT(1)   NOT NULL DEFAULT 0,
  is_spam           TINYINT(1)   NOT NULL DEFAULT 0,
  created_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at        TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_post_created  (post_id, created_at DESC),
  INDEX idx_parent        (parent_comment_id),
  CONSTRAINT fk_cmt_post   FOREIGN KEY (post_id)           REFERENCES posts(id)    ON DELETE CASCADE  ON UPDATE CASCADE,
  CONSTRAINT fk_cmt_author FOREIGN KEY (author_id)         REFERENCES users(id)    ON DELETE CASCADE  ON UPDATE CASCADE,
  CONSTRAINT fk_cmt_parent FOREIGN KEY (parent_comment_id) REFERENCES comments(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
--  15. comment_likes
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS comment_likes (
  comment_id INT UNSIGNED NOT NULL,
  user_id    INT UNSIGNED NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (comment_id, user_id),
  CONSTRAINT fk_cl_comment FOREIGN KEY (comment_id)
    REFERENCES comments(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_cl_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
--  16. reactions  (7 emoji types; one per user per post)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS reactions (
  id         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  post_id    INT UNSIGNED NOT NULL,
  user_id    INT UNSIGNED NOT NULL,
  type       ENUM('like','heart','funny','amazing','sad','angry','support') NOT NULL,
  created_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_post_user (post_id, user_id),
  CONSTRAINT fk_rxn_post FOREIGN KEY (post_id)
    REFERENCES posts(id) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT fk_rxn_user FOREIGN KEY (user_id)
    REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
--  17. analytics  (one row per post per day)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS analytics (
  id            INT UNSIGNED NOT NULL AUTO_INCREMENT,
  post_id       INT UNSIGNED NOT NULL,
  date          DATE         NOT NULL,
  views         INT UNSIGNED NOT NULL DEFAULT 0,
  unique_views  INT UNSIGNED NOT NULL DEFAULT 0,
  clicks        INT UNSIGNED NOT NULL DEFAULT 0,
  reactions     INT UNSIGNED NOT NULL DEFAULT 0,
  comments      INT UNSIGNED NOT NULL DEFAULT 0,
  shares        INT UNSIGNED NOT NULL DEFAULT 0,
  avg_read_time INT UNSIGNED NOT NULL DEFAULT 0,
  device_desktop INT UNSIGNED NOT NULL DEFAULT 0,
  device_mobile  INT UNSIGNED NOT NULL DEFAULT 0,
  device_tablet  INT UNSIGNED NOT NULL DEFAULT 0,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_post_date (post_id, date),
  INDEX idx_date (date DESC),
  CONSTRAINT fk_anl_post FOREIGN KEY (post_id)
    REFERENCES posts(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ─────────────────────────────────────────────
--  18. notifications
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS notifications (
  id           INT UNSIGNED NOT NULL AUTO_INCREMENT,
  recipient_id INT UNSIGNED NOT NULL,
  sender_id    INT UNSIGNED NULL DEFAULT NULL,
  type         ENUM('new_comment','new_reaction','new_follower','new_post','comment_reply',
                    'neighbor_request','neighbor_accepted','post_featured','system') NOT NULL,
  post_id      INT UNSIGNED NULL DEFAULT NULL,
  comment_id   INT UNSIGNED NULL DEFAULT NULL,
  message      TEXT         NOT NULL,
  is_read      TINYINT(1)   NOT NULL DEFAULT 0,
  link         VARCHAR(500) NOT NULL DEFAULT '',
  created_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_recipient_read_created (recipient_id, is_read, created_at DESC),
  CONSTRAINT fk_notif_recipient FOREIGN KEY (recipient_id)
    REFERENCES users(id)    ON DELETE CASCADE  ON UPDATE CASCADE,
  CONSTRAINT fk_notif_sender    FOREIGN KEY (sender_id)
    REFERENCES users(id)    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_notif_post      FOREIGN KEY (post_id)
    REFERENCES posts(id)    ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT fk_notif_comment   FOREIGN KEY (comment_id)
    REFERENCES comments(id) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
--  SEED DATA — 4 default categories (auto-seeded on first
--  GET /api/categories if empty; also present here for
--  a fresh import)
-- ============================================================

INSERT IGNORE INTO categories (id, name, slug, icon, color, `group`, is_active, order_num) VALUES
(1, 'Entertainment',   'entertainment', '🎨', '#e91e63', 'entertainment', 1, 1),
(2, 'Lifestyle',       'lifestyle',     '🛍️', '#9c27b0', 'lifestyle',     1, 2),
(3, 'Hobbies & Travel','hobbies-travel','🧭', '#2196f3', 'hobbies',       1, 3),
(4, 'Knowledge',       'knowledge',     '🧠', '#009688', 'knowledge',     1, 4);

-- Entertainment subcategories
INSERT IGNORE INTO category_subcategories (category_id, name, slug) VALUES
(1,'Literature',     'literature'),
(1,'Movies',         'movies'),
(1,'Art/Design',     'art-design'),
(1,'Music',          'music'),
(1,'TV Shows',       'tv-shows'),
(1,'Celebrities',    'celebrities'),
(1,'Animation',      'animation');

-- Lifestyle subcategories
INSERT IGNORE INTO category_subcategories (category_id, name, slug) VALUES
(2,'Daily Lifestyle',   'daily-lifestyle'),
(2,'Fashion & Beauty',  'fashion-beauty'),
(2,'Interior/DIY',      'interior-diy'),
(2,'Cooking/Recipes',   'cooking-recipes'),
(2,'Restaurants',       'restaurants'),
(2,'Pets',              'pets'),
(2,'Product Reviews',   'product-reviews'),
(2,'Gardening',         'gardening');

-- Hobbies & Travel subcategories
INSERT IGNORE INTO category_subcategories (category_id, name, slug) VALUES
(3,'Games',           'games'),
(3,'Sports',          'sports'),
(3,'Photography',     'photography'),
(3,'Cars',            'cars'),
(3,'Domestic Travel', 'domestic-travel'),
(3,'Overseas Travel', 'overseas-travel');

-- Knowledge subcategories
INSERT IGNORE INTO category_subcategories (category_id, name, slug) VALUES
(4,'IT & Computers',       'it-computers'),
(4,'Society & Politics',   'society-politics'),
(4,'Healthcare',           'healthcare'),
(4,'Business & Economics', 'business-economics'),
(4,'Languages',            'languages'),
(4,'Education',            'education');

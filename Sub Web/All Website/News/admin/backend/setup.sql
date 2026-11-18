-- Sholok News Portal Database Setup
-- Run: mysql -u root < setup.sql

CREATE DATABASE IF NOT EXISTS sholok_news CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE sholok_news;

-- Admin users
CREATE TABLE IF NOT EXISTS news_admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('super_admin','editor','news_manager','author','moderator') DEFAULT 'editor',
  avatar VARCHAR(500) DEFAULT NULL,
  is_active TINYINT(1) DEFAULT 1,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Categories
CREATE TABLE IF NOT EXISTS news_categories (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name_en VARCHAR(100) NOT NULL,
  name_bn VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description_en TEXT,
  description_bn TEXT,
  image VARCHAR(500),
  color VARCHAR(20) DEFAULT '#5D0096',
  sort_order INT DEFAULT 0,
  is_active TINYINT(1) DEFAULT 1,
  meta_title VARCHAR(255),
  meta_description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Authors
CREATE TABLE IF NOT EXISTS news_authors (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255),
  bio TEXT,
  avatar VARCHAR(500),
  designation VARCHAR(100),
  facebook VARCHAR(500),
  twitter VARCHAR(500),
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- News sources (for attribution)
CREATE TABLE IF NOT EXISTS news_sources (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  url VARCHAR(500),
  rss_url VARCHAR(500),
  logo VARCHAR(500),
  is_active TINYINT(1) DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- News articles
CREATE TABLE IF NOT EXISTS news_articles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title_en VARCHAR(500) NOT NULL,
  title_bn VARCHAR(500),
  slug VARCHAR(500) NOT NULL UNIQUE,
  summary_en TEXT,
  summary_bn TEXT,
  body_en LONGTEXT,
  body_bn LONGTEXT,
  featured_image VARCHAR(500),
  category_id INT,
  author_id INT,
  source_id INT,
  source_url VARCHAR(500),
  source_credit VARCHAR(255),
  status ENUM('draft','pending','published','scheduled','archived') DEFAULT 'draft',
  is_featured TINYINT(1) DEFAULT 0,
  is_breaking TINYINT(1) DEFAULT 0,
  view_count INT DEFAULT 0,
  publish_at TIMESTAMP NULL,
  meta_title VARCHAR(255),
  meta_description TEXT,
  meta_keywords TEXT,
  created_by INT,
  updated_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES news_categories(id) ON DELETE SET NULL,
  FOREIGN KEY (author_id) REFERENCES news_authors(id) ON DELETE SET NULL,
  INDEX idx_status (status),
  INDEX idx_featured (is_featured),
  INDEX idx_breaking (is_breaking),
  INDEX idx_publish_at (publish_at),
  INDEX idx_category (category_id),
  FULLTEXT idx_search (title_en, title_bn, summary_en, summary_bn)
);

-- Tags
CREATE TABLE IF NOT EXISTS news_tags (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL UNIQUE,
  slug VARCHAR(100) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Article-tag pivot
CREATE TABLE IF NOT EXISTS news_article_tags (
  article_id INT NOT NULL,
  tag_id INT NOT NULL,
  PRIMARY KEY (article_id, tag_id),
  FOREIGN KEY (article_id) REFERENCES news_articles(id) ON DELETE CASCADE,
  FOREIGN KEY (tag_id) REFERENCES news_tags(id) ON DELETE CASCADE
);

-- Media library
CREATE TABLE IF NOT EXISTS news_media (
  id INT AUTO_INCREMENT PRIMARY KEY,
  filename VARCHAR(255) NOT NULL,
  original_name VARCHAR(255),
  mime_type VARCHAR(100),
  size INT,
  url VARCHAR(500) NOT NULL,
  alt_text VARCHAR(255),
  title VARCHAR(255),
  uploaded_by INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity log
CREATE TABLE IF NOT EXISTS news_activity_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  admin_id INT,
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id INT,
  details TEXT,
  ip VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Settings
CREATE TABLE IF NOT EXISTS news_settings (
  id INT AUTO_INCREMENT PRIMARY KEY,
  key_name VARCHAR(100) NOT NULL UNIQUE,
  value TEXT,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Seed default data
INSERT IGNORE INTO news_admin_users (name, email, password_hash, role)
VALUES ('Super Admin', 'admin@sholok.com', '$2a$10$rOHzXfJ2b6GHxcKqmDpbreqBVSaHv9d0Z8jE3bLdE4vqNVBkJPAdu', 'super_admin');
-- Default password: sholok@admin2024

INSERT IGNORE INTO news_categories (name_en, name_bn, slug, sort_order) VALUES
('Bangladesh', 'বাংলাদেশ', 'bangladesh', 1),
('International', 'আন্তর্জাতিক', 'international', 2),
('Business', 'ব্যবসা', 'business', 3),
('Economy', 'অর্থনীতি', 'economy', 4),
('Technology', 'প্রযুক্তি', 'technology', 5),
('Science', 'বিজ্ঞান', 'science', 6),
('Education', 'শিক্ষা', 'education', 7),
('Health', 'স্বাস্থ্য', 'health', 8),
('Sports', 'খেলাধুলা', 'sports', 9),
('Entertainment', 'বিনোদন', 'entertainment', 10),
('Lifestyle', 'জীবনযাত্রা', 'lifestyle', 11),
('Agriculture', 'কৃষি', 'agriculture', 12),
('Environment', 'পরিবেশ', 'environment', 13),
('Travel', 'ভ্রমণ', 'travel', 14);

INSERT IGNORE INTO news_authors (name, slug, designation) VALUES
('Sholok Desk', 'sholok-desk', 'News Desk');

INSERT IGNORE INTO news_settings (key_name, value) VALUES
('site_name', 'Sholok News'),
('breaking_news_enabled', '1'),
('moderation_required', '1'),
('articles_per_page', '10');

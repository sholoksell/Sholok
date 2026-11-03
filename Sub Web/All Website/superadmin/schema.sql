-- Sholok Super Admin Database Schema
-- Database: superadmin_db
-- SAFE: This schema does NOT touch sholok_ecommerce or blog_db

CREATE DATABASE IF NOT EXISTS superadmin_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE superadmin_db;

-- ============================================================
-- Super Admin accounts (who can log into this control center)
-- ============================================================
CREATE TABLE IF NOT EXISTS super_admins (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role        VARCHAR(80) NOT NULL DEFAULT 'Super Admin',
  is_active   TINYINT(1) NOT NULL DEFAULT 1,
  last_login  DATETIME NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Service Admins (staff who manage individual services)
-- ============================================================
CREATE TABLE IF NOT EXISTS service_admins (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  email       VARCHAR(150) NOT NULL UNIQUE,
  mobile      VARCHAR(20) NULL,
  role        VARCHAR(80) NOT NULL,
  status      ENUM('Active','Suspended','Pending') NOT NULL DEFAULT 'Active',
  joined      DATE NOT NULL,
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Service assignments for service admins
CREATE TABLE IF NOT EXISTS service_admin_services (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  admin_id    INT NOT NULL,
  service_name VARCHAR(80) NOT NULL,
  UNIQUE KEY uq_admin_service (admin_id, service_name),
  FOREIGN KEY (admin_id) REFERENCES service_admins(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Frontend Users (Sholok platform customers / registered users)
-- ============================================================
CREATE TABLE IF NOT EXISTS frontend_users (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  name         VARCHAR(100) NOT NULL,
  email        VARCHAR(150) NOT NULL UNIQUE,
  mobile       VARCHAR(20) NULL,
  account_type ENUM('Customer','Seller','Blogger','Freelancer','Employer','Job Seeker','Creator','Service') NOT NULL DEFAULT 'Customer',
  status       ENUM('Pending','Active','Suspended','Blocked','Rejected') NOT NULL DEFAULT 'Pending',
  created_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status),
  INDEX idx_type (account_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Platform Services
-- ============================================================
CREATE TABLE IF NOT EXISTS platform_services (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  name        VARCHAR(80) NOT NULL UNIQUE,
  description TEXT NULL,
  category    VARCHAR(60) NOT NULL,
  url         VARCHAR(255) NULL,
  status      ENUM('Active','Deactive','Maintenance') NOT NULL DEFAULT 'Active',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Platform Settings
-- ============================================================
CREATE TABLE IF NOT EXISTS platform_settings (
  setting_key   VARCHAR(80) NOT NULL PRIMARY KEY,
  setting_value TEXT NOT NULL,
  updated_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Security Alerts
-- ============================================================
CREATE TABLE IF NOT EXISTS security_alerts (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  type        ENUM('danger','warning','info') NOT NULL DEFAULT 'warning',
  title       VARCHAR(200) NOT NULL,
  description TEXT NULL,
  status      ENUM('Open','Review','Monitoring','Resolved') NOT NULL DEFAULT 'Open',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Audit Log
-- ============================================================
CREATE TABLE IF NOT EXISTS audit_log (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  actor_id    INT NULL,
  actor_email VARCHAR(150) NULL,
  action      TEXT NOT NULL,
  module      VARCHAR(80) NULL,
  category    ENUM('Access','Configuration','Content','Security') NOT NULL DEFAULT 'Configuration',
  created_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created (created_at),
  INDEX idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Roles & Permissions
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
  id    INT AUTO_INCREMENT PRIMARY KEY,
  name  VARCHAR(80) NOT NULL UNIQUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS role_permissions (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  role_name   VARCHAR(80) NOT NULL,
  module_name VARCHAR(100) NOT NULL,
  actions     TEXT NOT NULL,
  UNIQUE KEY uq_role_module (role_name, module_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================================
-- Seed: Default super admin
-- Password: Sholok@2026 (bcrypt hash, change on first login)
-- ============================================================
INSERT IGNORE INTO super_admins (name, email, password_hash, role)
VALUES (
  'Super Admin',
  'admin@sholok.com',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBpj5MmFWxZ3Aq',
  'Super Admin'
);

-- ============================================================
-- Seed: Platform services
-- ============================================================
INSERT IGNORE INTO platform_services (name, description, category, url, status) VALUES
('Cafe', 'Community groups, memberships, discussions and moderation', 'Community', 'https://cafe.sholok.com', 'Active'),
('Blog', 'Bloggers, articles, comments, categories and SEO', 'Publishing', 'https://blog.sholok.com', 'Active'),
('Shopping', 'Central marketplace for products, campaigns, orders and checkout', 'Commerce', 'https://shopping.sholok.com', 'Active'),
('News', 'Publisher accounts, editorial workflows and news distribution', 'Publishing', 'https://news.sholok.com', 'Active'),
('Smart Store', 'Seller public stores, listings, inventory, commissions and settlements', 'Commerce', 'https://smartstore.sholok.com', 'Active'),
('Map', 'Places, verified businesses, reviews and map data quality', 'Location', 'https://map.sholok.com', 'Active'),
('Knowledge', 'Questions, answers, experts and knowledge quality', 'Community', 'https://knowledge.sholok.com', 'Active'),
('Webtoon', 'Creators, digital comics, episodes, age ratings and copyright', 'Entertainment', 'https://webtoon.sholok.com', 'Active'),
('Series', 'Novels, eBooks, comics, release schedules and rights', 'Entertainment', 'https://series.sholok.com', 'Active'),
('TV / Videos', 'Video creators, channels, streaming and content safety', 'Entertainment', 'https://tv.sholok.com', 'Active'),
('Music', 'Artists, tracks, playlists, licensing and streaming', 'Entertainment', 'https://music.sholok.com', 'Active'),
('Translator', 'Translation services, supported languages and provider quality', 'Language', 'https://translate.sholok.com', 'Active'),
('Dictionary', 'Dictionary data, definitions, pronunciation and lookup', 'Language', 'https://dictionary.sholok.com', 'Active'),
('Finance', 'Financial information, data feeds, market insights and disclaimers', 'Data Services', 'https://finance.sholok.com', 'Active'),
('Sports', 'Leagues, fixtures, scores, statistics and live feeds', 'Data Services', 'https://sports.sholok.com', 'Active'),
('Weather', 'Forecasts, location coverage and severe weather alerts', 'Data Services', 'https://weather.sholok.com', 'Active'),
('Real Estate', 'Property listings, agents, locations and listing moderation', 'Marketplace', 'https://realestate.sholok.com', 'Active');

-- ============================================================
-- Seed: Default platform settings
-- ============================================================
INSERT IGNORE INTO platform_settings (setting_key, setting_value) VALUES
('maintenance', 'false'),
('signup', 'true'),
('moderation', 'true'),
('securityAlerts', 'true'),
('emailNotifications', 'true'),
('weeklyReport', 'false'),
('mfa', 'true'),
('sessionTimeout', 'true'),
('ipAllowlist', 'false'),
('backupAlerts', 'true'),
('publicSearch', 'true');

-- ============================================================
-- Seed: Initial security alerts
-- ============================================================
INSERT IGNORE INTO security_alerts (id, type, title, description, status) VALUES
(1, 'danger', 'Unusual sign-in activity', 'A sign-in attempt needs security review.', 'Open'),
(2, 'warning', 'Backup verification due', 'Review the latest backup restore test.', 'Review'),
(3, 'warning', 'Provider response time elevated', 'A connected data feed is responding slowly.', 'Monitoring');

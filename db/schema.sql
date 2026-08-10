-- Portfolio content schema (MySQL 8+)
-- Applied by `npm run db:seed` via TypeORM synchronize.

CREATE TABLE IF NOT EXISTS bio (
  id VARCHAR(32) PRIMARY KEY,
  photo_path VARCHAR(512) NOT NULL,
  photo_alt JSON NOT NULL,
  signature_path VARCHAR(512) NOT NULL,
  signature_alt JSON NOT NULL,
  cv_path VARCHAR(512) NULL,
  cv_path_en VARCHAR(512) NULL,
  text JSON NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS media_assets (
  id VARCHAR(36) PRIMARY KEY,
  path VARCHAR(512) NOT NULL,
  mime VARCHAR(128) NULL,
  width INT NULL,
  height INT NULL,
  original_name VARCHAR(255) NULL,
  byte_size INT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  INDEX idx_media_created (created_at),
  INDEX idx_media_path (path)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS inbox_items (
  id VARCHAR(36) PRIMARY KEY,
  path VARCHAR(512) NOT NULL,
  asset_id VARCHAR(36) NULL,
  original_name VARCHAR(255) NULL,
  mime VARCHAR(128) NULL,
  width INT NULL,
  height INT NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  INDEX idx_inbox_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS brands (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  logo_path VARCHAR(512) NULL,
  logo_asset_id VARCHAR(36) NULL,
  href VARCHAR(1024) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  published TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS named_list_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  kind VARCHAR(32) NOT NULL,
  label VARCHAR(255) NOT NULL,
  logo_path VARCHAR(512) NULL,
  brand_id VARCHAR(64) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  published TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  INDEX idx_named_kind_order (kind, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS testimonials (
  id VARCHAR(64) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  image_path VARCHAR(512) NOT NULL,
  quote JSON NOT NULL,
  role JSON NOT NULL,
  company_name VARCHAR(255) NOT NULL,
  company_logo_path VARCHAR(512) NULL,
  company_href VARCHAR(512) NULL,
  company_brand_id VARCHAR(64) NULL,
  link_label JSON NULL,
  hidden TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS graphic_items (
  id VARCHAR(128) PRIMARY KEY,
  section VARCHAR(32) NOT NULL,
  src_path VARCHAR(512) NOT NULL,
  src_asset_id VARCHAR(36) NULL,
  alt VARCHAR(512) NOT NULL,
  title JSON NULL,
  year VARCHAR(32) NULL,
  detail JSON NULL,
  href VARCHAR(1024) NULL,
  href_label JSON NULL,
  tags JSON NULL,
  fit VARCHAR(16) NULL,
  related_src_path VARCHAR(512) NULL,
  related_asset_id VARCHAR(36) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  published TINYINT(1) NOT NULL DEFAULT 1,
  INDEX idx_graphic_section_order (section, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS brand_manuals (
  id VARCHAR(64) PRIMARY KEY,
  cover_path VARCHAR(512) NOT NULL,
  pdf_path VARCHAR(512) NOT NULL,
  title JSON NOT NULL,
  year VARCHAR(32) NULL,
  meta JSON NULL,
  sort_order INT NOT NULL DEFAULT 0,
  published TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ui_projects (
  id VARCHAR(64) PRIMARY KEY,
  category VARCHAR(64) NOT NULL,
  title JSON NOT NULL,
  meta JSON NOT NULL,
  images JSON NOT NULL,
  prototype_url VARCHAR(1024) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  published TINYINT(1) NOT NULL DEFAULT 1,
  INDEX idx_ui_category_order (category, sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS ui_list_items (
  id VARCHAR(64) PRIMARY KEY,
  title JSON NOT NULL,
  logo_path VARCHAR(512) NULL,
  caption VARCHAR(255) NULL,
  wordmark VARCHAR(255) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  published TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tech_icons (
  id VARCHAR(64) PRIMARY KEY,
  src_path VARCHAR(512) NOT NULL,
  label VARCHAR(128) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  published TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(64) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  must_change_password TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tags (
  slug VARCHAR(64) PRIMARY KEY,
  label_es VARCHAR(128) NOT NULL,
  label_en VARCHAR(128) NOT NULL,
  is_nsfw TINYINT(1) NOT NULL DEFAULT 0,
  sort_order INT NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS site_settings (
  id VARCHAR(32) PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(64) NOT NULL,
  note_es TEXT NOT NULL,
  note_en TEXT NOT NULL,
  powered_by VARCHAR(255) NOT NULL,
  carousel_interval_ms INT NOT NULL DEFAULT 2000,
  graphic_preview_limit INT NOT NULL DEFAULT 7,
  interfaces_preview_limit INT NOT NULL DEFAULT 7,
  home_layout JSON NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS social_links (
  id VARCHAR(64) PRIMARY KEY,
  network VARCHAR(64) NOT NULL,
  label VARCHAR(128) NOT NULL,
  href VARCHAR(1024) NOT NULL,
  icon_path VARCHAR(512) NULL,
  sort_order INT NOT NULL DEFAULT 0,
  published TINYINT(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_audit_logs (
  id VARCHAR(36) PRIMARY KEY,
  user_id INT NOT NULL,
  username VARCHAR(64) NOT NULL,
  action VARCHAR(16) NOT NULL,
  entity_type VARCHAR(32) NOT NULL,
  entity_id VARCHAR(128) NOT NULL,
  summary VARCHAR(512) NOT NULL,
  before_json JSON NULL,
  after_json JSON NULL,
  undoable TINYINT(1) NOT NULL DEFAULT 1,
  undone_at DATETIME(6) NULL,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  INDEX idx_audit_created (created_at),
  INDEX idx_audit_entity (entity_type, entity_id, created_at),
  INDEX idx_audit_user (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

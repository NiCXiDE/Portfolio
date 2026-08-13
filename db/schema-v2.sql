-- Content Model V2 schema (MySQL 8+)
-- Applied additively by `npm run db:apply-v2` — does NOT alter legacy tables except
-- additive column `testimonials.entity_id`.

-- ---------------------------------------------------------------------------
-- entities
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS entities (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(128) NOT NULL,
  name VARCHAR(255) NOT NULL,
  short_name VARCHAR(128) NULL,
  type VARCHAR(32) NOT NULL,
  logo_path VARCHAR(512) NULL,
  logo_asset_id VARCHAR(36) NULL,
  href VARCHAR(1024) NULL,
  description JSON NULL,
  visible TINYINT(1) NOT NULL DEFAULT 1,
  page_enabled TINYINT(1) NOT NULL DEFAULT 0,
  show_on_home TINYINT(1) NOT NULL DEFAULT 0,
  home_order INT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  UNIQUE KEY uq_entities_slug (slug),
  INDEX idx_entities_home (show_on_home, home_order),
  INDEX idx_entities_visible (visible, page_enabled),
  CONSTRAINT fk_entities_logo_asset
    FOREIGN KEY (logo_asset_id) REFERENCES media_assets (id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- projects
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
  id VARCHAR(64) PRIMARY KEY,
  slug VARCHAR(128) NOT NULL,
  title JSON NOT NULL,
  summary JSON NULL,
  description JSON NULL,
  start_year SMALLINT NULL,
  start_month TINYINT NULL,
  end_year SMALLINT NULL,
  end_month TINYINT NULL,
  date_label JSON NULL,
  status VARCHAR(16) NOT NULL DEFAULT 'completed',
  type VARCHAR(64) NULL,
  cover_path VARCHAR(512) NULL,
  cover_asset_id VARCHAR(36) NULL,
  links JSON NULL,
  published TINYINT(1) NOT NULL DEFAULT 1,
  featured TINYINT(1) NOT NULL DEFAULT 0,
  case_study_enabled TINYINT(1) NOT NULL DEFAULT 0,
  show_on_home TINYINT(1) NOT NULL DEFAULT 0,
  home_order INT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  UNIQUE KEY uq_projects_slug (slug),
  INDEX idx_projects_status (status, published, sort_order),
  INDEX idx_projects_home (show_on_home, home_order),
  CONSTRAINT fk_projects_cover_asset
    FOREIGN KEY (cover_asset_id) REFERENCES media_assets (id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- project_areas
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_areas (
  project_id VARCHAR(64) NOT NULL,
  area VARCHAR(16) NOT NULL,
  PRIMARY KEY (project_id, area),
  CONSTRAINT fk_project_areas_project
    FOREIGN KEY (project_id) REFERENCES projects (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- project_roles
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_roles (
  project_id VARCHAR(64) NOT NULL,
  role VARCHAR(32) NOT NULL,
  PRIMARY KEY (project_id, role),
  CONSTRAINT fk_project_roles_project
    FOREIGN KEY (project_id) REFERENCES projects (id)
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- project_entities (N:M Project ↔ Entity)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_entities (
  project_id VARCHAR(64) NOT NULL,
  entity_id VARCHAR(64) NOT NULL,
  relation_role VARCHAR(32) NOT NULL,
  PRIMARY KEY (project_id, entity_id, relation_role),
  INDEX idx_project_entities_entity (entity_id),
  CONSTRAINT fk_project_entities_project
    FOREIGN KEY (project_id) REFERENCES projects (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_project_entities_entity
    FOREIGN KEY (entity_id) REFERENCES entities (id)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- pieces
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS pieces (
  id VARCHAR(128) PRIMARY KEY,
  slug VARCHAR(128) NULL,
  title JSON NULL,
  alt VARCHAR(512) NOT NULL,
  category VARCHAR(32) NOT NULL,
  origin VARCHAR(32) NULL,
  src_path VARCHAR(512) NOT NULL,
  src_asset_id VARCHAR(36) NULL,
  fit VARCHAR(16) NULL,
  year VARCHAR(32) NULL,
  detail JSON NULL,
  href VARCHAR(1024) NULL,
  href_label JSON NULL,
  project_id VARCHAR(64) NULL,
  published TINYINT(1) NOT NULL DEFAULT 1,
  sort_order INT NOT NULL DEFAULT 0,
  legacy_section VARCHAR(32) NULL COMMENT 'TEMPORAL: Fase 9 cleanup',
  legacy_gallery JSON NULL COMMENT 'TEMPORAL: Fase 9 cleanup',
  created_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  UNIQUE KEY uq_pieces_slug (slug),
  INDEX idx_pieces_project (project_id, published, sort_order),
  INDEX idx_pieces_category (category, published, sort_order),
  INDEX idx_pieces_legacy_section (legacy_section, published),
  CONSTRAINT fk_pieces_project
    FOREIGN KEY (project_id) REFERENCES projects (id)
    ON DELETE SET NULL,
  CONSTRAINT fk_pieces_src_asset
    FOREIGN KEY (src_asset_id) REFERENCES media_assets (id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- piece_resources
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS piece_resources (
  id VARCHAR(36) PRIMARY KEY,
  piece_id VARCHAR(128) NOT NULL,
  media_asset_id VARCHAR(36) NULL,
  path VARCHAR(512) NULL,
  kind VARCHAR(32) NULL,
  label JSON NULL,
  sort_order INT NOT NULL DEFAULT 0,
  INDEX idx_piece_resources_piece (piece_id, sort_order),
  CONSTRAINT fk_piece_resources_piece
    FOREIGN KEY (piece_id) REFERENCES pieces (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_piece_resources_asset
    FOREIGN KEY (media_asset_id) REFERENCES media_assets (id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- project_resources
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_resources (
  id VARCHAR(36) PRIMARY KEY,
  project_id VARCHAR(64) NOT NULL,
  media_asset_id VARCHAR(36) NULL,
  path VARCHAR(512) NULL,
  kind VARCHAR(32) NULL,
  frame VARCHAR(16) NULL,
  label JSON NULL,
  sort_order INT NOT NULL DEFAULT 0,
  INDEX idx_project_resources_project (project_id, sort_order),
  CONSTRAINT fk_project_resources_project
    FOREIGN KEY (project_id) REFERENCES projects (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_project_resources_asset
    FOREIGN KEY (media_asset_id) REFERENCES media_assets (id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- piece_tags (tags catalog unchanged)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS piece_tags (
  piece_id VARCHAR(128) NOT NULL,
  tag_slug VARCHAR(64) NOT NULL,
  PRIMARY KEY (piece_id, tag_slug),
  CONSTRAINT fk_piece_tags_piece
    FOREIGN KEY (piece_id) REFERENCES pieces (id)
    ON DELETE CASCADE,
  CONSTRAINT fk_piece_tags_tag
    FOREIGN KEY (tag_slug) REFERENCES tags (slug)
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- migration_map (idempotency + traceability)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS migration_map (
  id VARCHAR(36) PRIMARY KEY,
  source_table VARCHAR(64) NOT NULL,
  source_id VARCHAR(128) NOT NULL,
  target_type VARCHAR(32) NOT NULL,
  target_id VARCHAR(128) NULL,
  notes TEXT NULL,
  migrated_at DATETIME(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  UNIQUE KEY uq_migration_map_source (source_table, source_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ---------------------------------------------------------------------------
-- testimonials V2 prep (additive ALTER on legacy table)
-- ---------------------------------------------------------------------------
SET @col_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'testimonials'
    AND COLUMN_NAME = 'entity_id'
);
SET @ddl = IF(
  @col_exists = 0,
  'ALTER TABLE testimonials ADD COLUMN entity_id VARCHAR(64) NULL AFTER company_brand_id',
  'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

SET @fk_exists = (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'testimonials'
    AND CONSTRAINT_NAME = 'fk_testimonials_entity'
);
SET @fk_ddl = IF(
  @fk_exists = 0,
  'ALTER TABLE testimonials ADD CONSTRAINT fk_testimonials_entity FOREIGN KEY (entity_id) REFERENCES entities (id) ON DELETE SET NULL',
  'SELECT 1'
);
PREPARE stmt2 FROM @fk_ddl;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

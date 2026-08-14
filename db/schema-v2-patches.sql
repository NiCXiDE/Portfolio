-- Content Model V2 patches for tables already created (e.g. by TypeORM sync).
-- Idempotent: safe to re-run. Does NOT touch legacy content tables.

-- ---------------------------------------------------------------------------
-- Draft defaults (new V2 rows start unpublished / hidden)
-- ---------------------------------------------------------------------------
ALTER TABLE entities
  MODIFY visible TINYINT(1) NOT NULL DEFAULT 0,
  MODIFY page_enabled TINYINT(1) NOT NULL DEFAULT 0;

ALTER TABLE projects
  MODIFY published TINYINT(1) NOT NULL DEFAULT 0;

ALTER TABLE pieces
  MODIFY published TINYINT(1) NOT NULL DEFAULT 0;

-- ---------------------------------------------------------------------------
-- migration_map: allow multiple targets per legacy source
-- ---------------------------------------------------------------------------
SET @old_idx = (
  SELECT INDEX_NAME
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'migration_map'
    AND NON_UNIQUE = 0
    AND INDEX_NAME IN ('uq_migration_map_source', 'IDX_ca23be12e75886c8eee94f4f91')
  LIMIT 1
);
SET @new_idx_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'migration_map'
    AND INDEX_NAME = 'uq_migration_map_target'
);
SET @drop_ddl = IF(
  @old_idx IS NOT NULL AND @new_idx_exists = 0,
  CONCAT('ALTER TABLE migration_map DROP INDEX `', @old_idx, '`'),
  'SELECT 1'
);
PREPARE stmt_drop FROM @drop_ddl;
EXECUTE stmt_drop;
DEALLOCATE PREPARE stmt_drop;

SET @target_nullable = (
  SELECT IS_NULLABLE
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'migration_map'
    AND COLUMN_NAME = 'target_id'
);
SET @mod_ddl = IF(
  @target_nullable = 'YES',
  'ALTER TABLE migration_map MODIFY target_id VARCHAR(128) NOT NULL',
  'SELECT 1'
);
PREPARE stmt_mod FROM @mod_ddl;
EXECUTE stmt_mod;
DEALLOCATE PREPARE stmt_mod;

SET @new_idx_exists = (
  SELECT COUNT(*)
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'migration_map'
    AND INDEX_NAME = 'uq_migration_map_target'
);
SET @add_ddl = IF(
  @new_idx_exists = 0,
  'ALTER TABLE migration_map ADD UNIQUE KEY uq_migration_map_target (source_table, source_id, target_type, target_id)',
  'SELECT 1'
);
PREPARE stmt_add FROM @add_ddl;
EXECUTE stmt_add;
DEALLOCATE PREPARE stmt_add;

-- ---------------------------------------------------------------------------
-- CHECK constraints
-- ---------------------------------------------------------------------------
SET @chk = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'projects'
    AND CONSTRAINT_NAME = 'chk_projects_start_month'
);
SET @ddl = IF(@chk = 0,
  'ALTER TABLE projects ADD CONSTRAINT chk_projects_start_month CHECK (start_month IS NULL OR (start_month >= 1 AND start_month <= 12))',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @chk = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'projects'
    AND CONSTRAINT_NAME = 'chk_projects_end_month'
);
SET @ddl = IF(@chk = 0,
  'ALTER TABLE projects ADD CONSTRAINT chk_projects_end_month CHECK (end_month IS NULL OR (end_month >= 1 AND end_month <= 12))',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @chk = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'piece_resources'
    AND CONSTRAINT_NAME = 'chk_piece_resources_media'
);
SET @ddl = IF(@chk = 0,
  'ALTER TABLE piece_resources ADD CONSTRAINT chk_piece_resources_media CHECK (media_asset_id IS NOT NULL OR path IS NOT NULL)',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @chk = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'project_resources'
    AND CONSTRAINT_NAME = 'chk_project_resources_media'
);
SET @ddl = IF(@chk = 0,
  'ALTER TABLE project_resources ADD CONSTRAINT chk_project_resources_media CHECK (media_asset_id IS NOT NULL OR path IS NOT NULL)',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------------
-- projects.context (V2 empty at freeze — NOT NULL, no artificial default)
-- ---------------------------------------------------------------------------
SET @col_exists = (
  SELECT COUNT(*)
  FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'projects'
    AND COLUMN_NAME = 'context'
);
SET @ddl = IF(
  @col_exists = 0,
  'ALTER TABLE projects ADD COLUMN context VARCHAR(32) NOT NULL AFTER type',
  'SELECT 1'
);
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------------
-- piece_entities (N:M Piece <-> Entity)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS piece_entities (
  piece_id VARCHAR(128) NOT NULL,
  entity_id VARCHAR(64) NOT NULL,
  relation_role VARCHAR(32) NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  is_primary TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (piece_id, entity_id, relation_role),
  INDEX idx_piece_entities_entity (entity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

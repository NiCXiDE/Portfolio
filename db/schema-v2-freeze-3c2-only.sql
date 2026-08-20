-- Content Model V2 — Phase 3C.2 freeze schema (idempotent, scope-limited).
-- ONLY: projects.context + piece_entities + piece_entities FKs.
-- Does NOT touch legacy tables, defaults, migration_map, or other V2 FKs.

-- ---------------------------------------------------------------------------
-- A. projects.context (NOT NULL, no artificial default; V2 projects empty)
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
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- ---------------------------------------------------------------------------
-- B. piece_entities (N:M Piece <-> Entity)
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

-- ---------------------------------------------------------------------------
-- C. piece_entities foreign keys (guarded; safe after partial CREATE)
-- ---------------------------------------------------------------------------

-- piece_entities.piece_id -> pieces ON DELETE CASCADE
SET @fk_exists = (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'piece_entities'
    AND CONSTRAINT_NAME = 'fk_piece_entities_piece'
);
SET @ddl = IF(
  @fk_exists = 0,
  'ALTER TABLE piece_entities ADD CONSTRAINT fk_piece_entities_piece FOREIGN KEY (piece_id) REFERENCES pieces (id) ON DELETE CASCADE',
  'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- piece_entities.entity_id -> entities ON DELETE RESTRICT
SET @fk_exists = (
  SELECT COUNT(*)
  FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'piece_entities'
    AND CONSTRAINT_NAME = 'fk_piece_entities_entity'
);
SET @ddl = IF(
  @fk_exists = 0,
  'ALTER TABLE piece_entities ADD CONSTRAINT fk_piece_entities_entity FOREIGN KEY (entity_id) REFERENCES entities (id) ON DELETE RESTRICT',
  'SELECT 1'
);
PREPARE stmt FROM @ddl;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

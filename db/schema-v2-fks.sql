-- Content Model V2 foreign keys (idempotent ALTER)
-- Run after db/schema-v2.sql when tables exist without FK constraints.

-- entities.logo_asset_id -> media_assets
SET @fk_exists = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'entities'
    AND CONSTRAINT_NAME = 'fk_entities_logo_asset'
);
SET @ddl = IF(@fk_exists = 0,
  'ALTER TABLE entities ADD CONSTRAINT fk_entities_logo_asset FOREIGN KEY (logo_asset_id) REFERENCES media_assets (id) ON DELETE SET NULL',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- projects.cover_asset_id -> media_assets
SET @fk_exists = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'projects'
    AND CONSTRAINT_NAME = 'fk_projects_cover_asset'
);
SET @ddl = IF(@fk_exists = 0,
  'ALTER TABLE projects ADD CONSTRAINT fk_projects_cover_asset FOREIGN KEY (cover_asset_id) REFERENCES media_assets (id) ON DELETE SET NULL',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- project_areas.project_id -> projects CASCADE
SET @fk_exists = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'project_areas'
    AND CONSTRAINT_NAME = 'fk_project_areas_project'
);
SET @ddl = IF(@fk_exists = 0,
  'ALTER TABLE project_areas ADD CONSTRAINT fk_project_areas_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- project_roles.project_id -> projects CASCADE
SET @fk_exists = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'project_roles'
    AND CONSTRAINT_NAME = 'fk_project_roles_project'
);
SET @ddl = IF(@fk_exists = 0,
  'ALTER TABLE project_roles ADD CONSTRAINT fk_project_roles_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- project_entities.project_id -> projects CASCADE
SET @fk_exists = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'project_entities'
    AND CONSTRAINT_NAME = 'fk_project_entities_project'
);
SET @ddl = IF(@fk_exists = 0,
  'ALTER TABLE project_entities ADD CONSTRAINT fk_project_entities_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- project_entities.entity_id -> entities RESTRICT
SET @fk_exists = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'project_entities'
    AND CONSTRAINT_NAME = 'fk_project_entities_entity'
);
SET @ddl = IF(@fk_exists = 0,
  'ALTER TABLE project_entities ADD CONSTRAINT fk_project_entities_entity FOREIGN KEY (entity_id) REFERENCES entities (id) ON DELETE RESTRICT',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- pieces.project_id -> projects SET NULL
SET @fk_exists = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pieces'
    AND CONSTRAINT_NAME = 'fk_pieces_project'
);
SET @ddl = IF(@fk_exists = 0,
  'ALTER TABLE pieces ADD CONSTRAINT fk_pieces_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE SET NULL',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- pieces.src_asset_id -> media_assets SET NULL
SET @fk_exists = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'pieces'
    AND CONSTRAINT_NAME = 'fk_pieces_src_asset'
);
SET @ddl = IF(@fk_exists = 0,
  'ALTER TABLE pieces ADD CONSTRAINT fk_pieces_src_asset FOREIGN KEY (src_asset_id) REFERENCES media_assets (id) ON DELETE SET NULL',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- piece_resources.piece_id -> pieces CASCADE
SET @fk_exists = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'piece_resources'
    AND CONSTRAINT_NAME = 'fk_piece_resources_piece'
);
SET @ddl = IF(@fk_exists = 0,
  'ALTER TABLE piece_resources ADD CONSTRAINT fk_piece_resources_piece FOREIGN KEY (piece_id) REFERENCES pieces (id) ON DELETE CASCADE',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- piece_resources.media_asset_id -> media_assets SET NULL
SET @fk_exists = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'piece_resources'
    AND CONSTRAINT_NAME = 'fk_piece_resources_asset'
);
SET @ddl = IF(@fk_exists = 0,
  'ALTER TABLE piece_resources ADD CONSTRAINT fk_piece_resources_asset FOREIGN KEY (media_asset_id) REFERENCES media_assets (id) ON DELETE SET NULL',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- project_resources.project_id -> projects CASCADE
SET @fk_exists = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'project_resources'
    AND CONSTRAINT_NAME = 'fk_project_resources_project'
);
SET @ddl = IF(@fk_exists = 0,
  'ALTER TABLE project_resources ADD CONSTRAINT fk_project_resources_project FOREIGN KEY (project_id) REFERENCES projects (id) ON DELETE CASCADE',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- project_resources.media_asset_id -> media_assets SET NULL
SET @fk_exists = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'project_resources'
    AND CONSTRAINT_NAME = 'fk_project_resources_asset'
);
SET @ddl = IF(@fk_exists = 0,
  'ALTER TABLE project_resources ADD CONSTRAINT fk_project_resources_asset FOREIGN KEY (media_asset_id) REFERENCES media_assets (id) ON DELETE SET NULL',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- piece_tags.piece_id -> pieces CASCADE
SET @fk_exists = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'piece_tags'
    AND CONSTRAINT_NAME = 'fk_piece_tags_piece'
);
SET @ddl = IF(@fk_exists = 0,
  'ALTER TABLE piece_tags ADD CONSTRAINT fk_piece_tags_piece FOREIGN KEY (piece_id) REFERENCES pieces (id) ON DELETE CASCADE',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- piece_tags.tag_slug -> tags RESTRICT
SET @fk_exists = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'piece_tags'
    AND CONSTRAINT_NAME = 'fk_piece_tags_tag'
);
SET @ddl = IF(@fk_exists = 0,
  'ALTER TABLE piece_tags ADD CONSTRAINT fk_piece_tags_tag FOREIGN KEY (tag_slug) REFERENCES tags (slug) ON DELETE RESTRICT',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- testimonials.entity_id -> entities SET NULL
SET @fk_exists = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'testimonials'
    AND CONSTRAINT_NAME = 'fk_testimonials_entity'
);
SET @ddl = IF(@fk_exists = 0,
  'ALTER TABLE testimonials ADD CONSTRAINT fk_testimonials_entity FOREIGN KEY (entity_id) REFERENCES entities (id) ON DELETE SET NULL',
  'SELECT 1');
PREPARE stmt FROM @ddl; EXECUTE stmt; DEALLOCATE PREPARE stmt;

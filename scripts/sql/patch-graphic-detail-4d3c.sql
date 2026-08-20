-- 4D.3C Graphic detail patch — single transaction
-- Backup: backups/portfolio-v2-pre-graphic-detail-patch-20260816-0316.sql
SET NAMES utf8mb4;
START TRANSACTION;

-- A. tag catalog
INSERT INTO tags (slug, label_es, label_en, is_nsfw, sort_order)
VALUES ('manual', 'Manual', 'Manual', 0, 102);

-- B. Manual Piece
INSERT INTO pieces (
  id, slug, title, alt, category, origin, src_path, src_asset_id,
  fit, year, detail, href, href_label, project_id, published, sort_order,
  legacy_section, legacy_gallery
) VALUES (
  'citf-manual-2025',
  'citf-manual-2025',
  CAST('{"es":"Manual de Marca 2025 CITF","en":"Brand Manual 2025 CITF"}' AS JSON),
  'Manual de Marca 2025 CITF',
  'visual-identity',
  'client',
  '/assets/grafico/brand-manuals/citf-manual-2025-cover.png',
  NULL,
  'cover',
  '2025',
  CAST('{"es":"Clúster de Innovación Tecnológica Formosa","en":"Formosa Technology Innovation Cluster"}' AS JSON),
  NULL,
  NULL,
  'citf-identity-2025',
  1,
  2,
  NULL,
  NULL
);

INSERT INTO piece_entities (piece_id, entity_id, relation_role, sort_order, is_primary)
VALUES ('citf-manual-2025', 'citf', 'brand-owner', 0, 1);

-- C. tag link
INSERT INTO piece_tags (piece_id, tag_slug)
VALUES ('citf-manual-2025', 'manual');

-- D. PDF resource (kind matches existing LIVE piece_resources)
INSERT INTO piece_resources (id, piece_id, media_asset_id, path, kind, label, sort_order)
VALUES (
  'a1b2c3d4-4d3c-4001-8001-000000000001',
  'citf-manual-2025',
  NULL,
  '/assets/grafico/brand-manuals/citf-manual-2025.pdf',
  'piece_resource',
  CAST('{"es":"PDF","en":"PDF"}' AS JSON),
  0
);

-- E. Seyier Pieces (titles from legacy gallery labels)
INSERT INTO pieces (
  id, slug, title, alt, category, origin, src_path, src_asset_id,
  fit, year, detail, href, href_label, project_id, published, sort_order,
  legacy_section, legacy_gallery
) VALUES
(
  'seyier-inicio',
  'seyier-pantalla-inicio',
  CAST('{"es":"Pantalla de inicio","en":"Starting screen"}' AS JSON),
  'Pantalla de inicio',
  'visual-identity',
  'other',
  '/assets/grafico/logos/seyier/inicio.png',
  NULL,
  'cover',
  NULL,
  NULL,
  NULL,
  NULL,
  'seyier-visual-identity',
  1,
  1,
  NULL,
  NULL
),
(
  'seyier-portada',
  'seyier-portada',
  CAST('{"es":"Portada","en":"Stream cover"}' AS JSON),
  'Portada',
  'visual-identity',
  'other',
  '/assets/grafico/logos/seyier/portada-fondo.png',
  NULL,
  'cover',
  NULL,
  NULL,
  NULL,
  NULL,
  'seyier-visual-identity',
  1,
  2,
  NULL,
  NULL
),
(
  'seyier-overlay',
  'seyier-overlay',
  CAST('{"es":"Overlay","en":"Overlay example"}' AS JSON),
  'Overlay',
  'visual-identity',
  'other',
  '/assets/grafico/logos/seyier/overlay-ejemplo.png',
  NULL,
  'cover',
  NULL,
  NULL,
  NULL,
  NULL,
  'seyier-visual-identity',
  1,
  3,
  NULL,
  NULL
);

INSERT INTO piece_entities (piece_id, entity_id, relation_role, sort_order, is_primary) VALUES
('seyier-inicio', 'seyier', 'brand-owner', 0, 1),
('seyier-portada', 'seyier', 'brand-owner', 0, 1),
('seyier-overlay', 'seyier', 'brand-owner', 0, 1);

-- F. migration_map (additive; UNIQUE allows multiple targets per source)
INSERT INTO migration_map (id, source_table, source_id, target_type, target_id, notes) VALUES
('a1b2c3d4-4d3c-4002-8001-000000000001', 'brand_manuals', 'citf', 'piece', 'citf-manual-2025', '4D.3C: brand_manual → Piece citf-manual-2025'),
('a1b2c3d4-4d3c-4002-8002-000000000002', 'brand_manuals', 'citf', 'resource', 'a1b2c3d4-4d3c-4001-8001-000000000001', '4D.3C: brand_manual PDF → piece_resources'),
('a1b2c3d4-4d3c-4002-8003-000000000003', 'graphic_items', 'seyier', 'piece', 'seyier-inicio', '4D.3C: gallery frame → Piece (EXPECTED_SPLIT_INTO_PIECES)'),
('a1b2c3d4-4d3c-4002-8004-000000000004', 'graphic_items', 'seyier', 'piece', 'seyier-portada', '4D.3C: gallery frame → Piece (EXPECTED_SPLIT_INTO_PIECES)'),
('a1b2c3d4-4d3c-4002-8005-000000000005', 'graphic_items', 'seyier', 'piece', 'seyier-overlay', '4D.3C: gallery frame → Piece (EXPECTED_SPLIT_INTO_PIECES)');

COMMIT;

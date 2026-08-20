-- 4D.5B Seyier resource collapse — documentation SQL (runner is source of truth).
-- Backup: backups/portfolio-v2-pre-seyier-resource-fix-20260819-2101.sql
-- DO NOT RUN against LIVE until V2_SEYIER_RESOURCE_FIX_4D5B_APPROVED=1 via the TS runner.
SET NAMES utf8mb4;
START TRANSACTION;

-- A. PieceResources on principal Piece `seyier` (paths unchanged; no file copy)
INSERT INTO piece_resources (id, piece_id, media_asset_id, path, kind, label, sort_order)
VALUES
(
  '4d5b1001-5e91-4001-8001-000000000001',
  'seyier',
  NULL,
  '/assets/grafico/logos/seyier/inicio.png',
  'piece_resource',
  CAST('{"es":"Pantalla de inicio","en":"Starting screen"}' AS JSON),
  0
),
(
  '4d5b1001-5e91-4001-8001-000000000002',
  'seyier',
  NULL,
  '/assets/grafico/logos/seyier/portada-fondo.png',
  'piece_resource',
  CAST('{"es":"Portada","en":"Stream cover"}' AS JSON),
  1
),
(
  '4d5b1001-5e91-4001-8001-000000000003',
  'seyier',
  NULL,
  '/assets/grafico/logos/seyier/overlay-ejemplo.png',
  'piece_resource',
  CAST('{"es":"Overlay","en":"Overlay example"}' AS JSON),
  2
);

-- B. Lineage: keep 4D.3C migration_map row ids; retarget piece → resource
UPDATE migration_map
SET target_type = 'resource',
    target_id = '4d5b1001-5e91-4001-8001-000000000001',
    notes = '4D.5B: gallery frame → piece_resources of seyier (EXPECTED_RESOURCE_COLLAPSE)'
WHERE id = 'e0082537-dd04-4a1f-a2a4-e92125bb0e9b'
  AND source_table = 'graphic_items'
  AND source_id = 'seyier'
  AND target_type = 'piece'
  AND target_id = 'seyier-inicio';

UPDATE migration_map
SET target_type = 'resource',
    target_id = '4d5b1001-5e91-4001-8001-000000000002',
    notes = '4D.5B: gallery frame → piece_resources of seyier (EXPECTED_RESOURCE_COLLAPSE)'
WHERE id = '870b1e5a-8b74-401d-9521-560abcfa8166'
  AND source_table = 'graphic_items'
  AND source_id = 'seyier'
  AND target_type = 'piece'
  AND target_id = 'seyier-portada';

UPDATE migration_map
SET target_type = 'resource',
    target_id = '4d5b1001-5e91-4001-8001-000000000003',
    notes = '4D.5B: gallery frame → piece_resources of seyier (EXPECTED_RESOURCE_COLLAPSE)'
WHERE id = '643a9b85-884c-4167-833f-fdb68f6dca84'
  AND source_table = 'graphic_items'
  AND source_id = 'seyier'
  AND target_type = 'piece'
  AND target_id = 'seyier-overlay';

-- C. Junctions then Pieces created in 4D.3C only
DELETE FROM piece_entities
WHERE piece_id IN ('seyier-inicio', 'seyier-portada', 'seyier-overlay');

DELETE FROM piece_tags
WHERE piece_id IN ('seyier-inicio', 'seyier-portada', 'seyier-overlay');

DELETE FROM pieces
WHERE id IN ('seyier-inicio', 'seyier-portada', 'seyier-overlay');

COMMIT;

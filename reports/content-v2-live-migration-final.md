# Content Model V2 — Live Migration Final Freeze (3C.6)

**Status:** APPROVED AND CLOSED  
**Frozen at:** 2026-08-15T04:25:00-03:00  
**Confidential plaintext:** none in this report

---

## PRE-LIVE

| Asset | Value |
|-------|-------|
| Backup | `backups/portfolio-v2-final-pre-live-20260815-0411.sql` |
| Size | 75621 bytes |
| CREATE TABLE | 27 |
| Restore-test DB | `portfolio_v2_final_restore_test` |
| Restore-test | OK (legacy baseline + V2 empty + FK absent) |

---

## CONTENT APPLY LIVE

| Field | Value |
|-------|-------|
| Exit | `0` |
| Database | `portfolio` |
| Executions | **1** (no second apply) |
| Proposed = Actual | Yes |

| Metric | Count |
|--------|------:|
| entities | 33 |
| projects | 31 |
| pieces | 48 |
| project_resources | 26 |
| piece_resources | 2 |
| piece_src_mappings | 60 |
| project_entities | 43 |
| piece_entities | 17 |
| project_areas | 37 |
| project_roles | 67 |
| piece_tags | 49 |
| migration_map | 125 |
| tags | 11 |

Tags: 9 legacy preserved + `tdt` + `cover` (no extras).

---

## FK LIVE

| Field | Value |
|-------|-------|
| Exit | `0` |
| Executions | **1** |
| Constraint | `fk_testimonials_entity` |
| Child | `testimonials.entity_id` |
| Parent | `entities.id` |
| ON DELETE | `SET NULL` |
| Invalid refs | 0 |

Canonical testimonials: `facundo→push`, `ezequiel→aicore`, `joaquin→ludica`, `matias→orbita-l-b`.

---

## FINAL LIVE (post-FK)

| Check | Result |
|-------|--------|
| V2 counts | as above |
| orphans | 0 |
| invalid testimonial refs | 0 |
| legacy preserved | graphic_items 47, ui_projects 13, brands 7, brand_manuals 1, named_list_items 40, ui_list_items 8 |
| privacy | forbidden aliases 0; confidential sources sha256; no plaintext known confidential source ids |
| encoding | Unicode HEX OK (`ú`/`Ó`/`Δ` U+0394); no 0x3F substitution on known brands |

---

## POST-MIGRATION BACKUP

| Field | Value |
|-------|-------|
| Path | `backups/portfolio-v2-post-migration-20260815-0425.sql` |
| Size | 136485 bytes |
| CREATE TABLE | 27 |
| Restore-test DB | `portfolio_v2_post_migration_restore_test` |
| Restore-test | OK — content/legacy/FK/orphans/testimonials/Unicode match LIVE |

---

## ROLLBACK ASSETS

1. **Pre-live:** `backups/portfolio-v2-final-pre-live-20260815-0411.sql`  
2. **Post-migration:** `backups/portfolio-v2-post-migration-20260815-0425.sql`

---

## Explicit state

- Legacy tables **NOT** deleted  
- Runtime / frontend / admin / public routes **NOT** migrated  
- Cutover **NOT** performed  
- MySQL V2 content **is materialized** and ready for integration work  
- No second content apply; no second FK; no seed/sync/reset in this phase  

**Next (out of scope for 3C.6):** runtime/repository cutover when separately approved.

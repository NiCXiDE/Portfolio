# Graphic Detail Fix — Phase 4D.3C

**Status:** COMPLETE  
**Date:** 2026-08-16  
**DATABASE:** `portfolio`  
**Transaction:** `COMMIT` · `GRAPHIC_4D3C_EXIT=0`  
**shadow_ok:** `true` (ES + EN)  
**readiness:** `FULL_GRAPHIC_READY`

Public Graphic UI: still **legacy only** (no flag / no cutover).

---

## A. Backup

| Field | Value |
|-------|-------|
| File | `backups/portfolio-v2-pre-graphic-detail-patch-20260816-0316.sql` |
| Size | 180 189 bytes |
| CREATE TABLE | 27 |
| Restore-test | OK (isolated DB + Unicode HEX) |
| Note | LIVE snapshot **after** Home V2 — primary rollback for this patch |

---

## B. Preflight

Passed before write: Projects present; Manual/Seyier Pieces absent; assets on disk; tag `manual` absent; Seyier gallery titles from legacy labels (no invented titles).

---

## C. Manual Piece

| Field | Value |
|-------|-------|
| id | `citf-manual-2025` |
| project | `citf-identity-2025` |
| category | `visual-identity` |
| origin | `client` |
| src_path | cover PNG (resolvable) |
| year / title / detail | from legacy `brand_manuals.citf` |
| piece_entities | citf · brand-owner (new row only) |

---

## D. Manual tag / resource

| Field | Value |
|-------|-------|
| tags catalog | `manual` (label Manual/Manual, sort 102) → tags **12** |
| piece_tags | `citf-manual-2025` → `manual` |
| PieceResource | PDF path, kind=`piece_resource` (same as existing LIVE kinds) |

---

## E. Seyier Pieces

Project `seyier-visual-identity` now **4** Pieces:

1. `seyier` (unchanged logo)
2. `seyier-inicio` — Pantalla de inicio / Starting screen
3. `seyier-portada` — Portada / Stream cover
4. `seyier-overlay` — Overlay / Overlay example

No `piece_resources` gallery reconstruction. Assets resolvable.

---

## F. Lineage (`migration_map`)

Additive only (UNIQUE allows multi-target):

| Source | Targets |
|--------|---------|
| `brand_manuals:citf` | project `citf-identity-2025` (pre-existing) + piece `citf-manual-2025` + resource PDF |
| `graphic_items:seyier` | piece `seyier` + project (pre-existing) + pieces `seyier-inicio` / `portada` / `overlay` |

No overwrites of prior rows.

---

## G. Transaction

Runner: `scripts/patch-graphic-detail-4d3c.ts`  
Guards: `DATABASE_NAME=portfolio` + `V2_GRAPHIC_DETAIL_PATCH_4D3C_APPROVED=1`  
Connected DB printed: `portfolio`  
Result: **COMMIT** · exit **0** · single execution

---

## H. Counts before → after

| Metric | Before | After |
|--------|-------:|------:|
| Adapter regular Pieces | 44 | **47** |
| Adapter manuals[] | 0 | **1** |
| Conceptual public | 44 | **48** |
| Tags | 11 | **12** |
| DB published rows | 45 | 49 (+4; still includes filtered `microtime`) |

VI section items = **15** (includes 3 new Seyier views; manual excluded from sections).

---

## I. Adapter `manuals[]`

- tag `manual` → `manuals[]`
- excluded from `sections[]` / `pieces[]`
- cover + PDF + year + detail without reading `brand_manuals`
- `manualStatus=PRESENT` · `seyierGalleryGap=false`

---

## J. Shadow

`npm run inspect:graphic-shadow`:

- `shadow_es_ok=true` · `shadow_en_ok=true` · `shadow_ok=true`
- surviving 44 · discarded 3 · missing 0
- Manual gap **RESOLVED**
- Seyier **EXPECTED_SPLIT_INTO_PIECES** / gap closed
- overall **FULL_GRAPHIC_READY**

---

## K. Privacy

forbidden hits 0 · discarded leaks 0 · Sessions `CURRENT_PUBLIC_SAFE` · legacy `brand_manuals` / `graphic_items.seyier` intact

---

## L. Readiness final

| Classification | Result |
|----------------|--------|
| Listing | LISTING_READY_FOR_FLAG |
| Detail | DETAIL_READY |
| Overall | **FULL_GRAPHIC_READY** |

**4D.4 not started.** Hybrid runtime no longer required for Graphic detail gaps.

Evidence: `reports/_4d3c-postcheck.json`, `reports/_graphic-shadow-4d3-live.json`

### Verify

- postcheck ok
- inspect:graphic-v2 ok
- inspect:graphic-shadow ok
- unit tests 12+10
- tsc / build / lint (baseline)

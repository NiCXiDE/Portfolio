# Graphic Shadow Validation — Phase 4D.3

**Status:** COMPLETE  
**Date:** 2026-08-16  
**shadow_ok:** `true` (ES + EN)  
**Public Graphic:** still **legacy only** (no flag / no double-read)

Inspector: `npm run inspect:graphic-shadow`  
Live: `reports/_graphic-shadow-4d3-live.json`  
Module: `src/lib/content-v2/graphic-shadow.ts`

---

## A. Snapshot model

`GraphicShadowSnapshot` (semantic, not raw DTOs):

- items: key, displayTitle, section, hasMainImage, tags, hasGallery, brand context, detailId, year  
- manuals: key, hasCover, hasPdf  
- sections: id + count  

Normalizers:

- `normalizeLegacyGraphicSnapshot(content, locale)` from public `loadPortfolioContent` lists  
- `normalizeGraphicContentV2Snapshot(getGraphicContentV2(locale))`  

Comparer: `compareGraphicContentShadows`

---

## B. Mapping 47 → 44

| | Count |
|--|------:|
| Legacy graphic_items | **47** |
| V2 pieces | **44** |
| Surviving (MATCH + PROJECT_CONTEXT + GALLERY_GAP) | **44** |
| EXPECTED_DISCARDED | **3** |

`47 = 44 + 3` ✓ · UNEXPECTED_MISSING = **0** · UNEXPECTED_DUPLICATE = **0**

---

## C. Discarded 3

| Legacy id | Result |
|-----------|--------|
| buhoprofe | EXPECTED_DISCARDED |
| microtime | EXPECTED_DISCARDED |
| labcom | EXPECTED_DISCARDED |

---

## D. Project Pieces

17 items → `EXPECTED_PROJECT_CONTEXT_ADDED` (same visual Piece + optional project summary).  
No Project+Piece duplication.

---

## E. Taxonomy

| Legacy section | V2 category | Status |
|----------------|-------------|--------|
| logos | visual-identity | RENAMED |
| covers | illustration-artwork | MERGED |
| illustration | illustration-artwork | MERGED |
| personal | illustration-artwork | EXPECTED_REMOVAL (pieces survive via origin/tags) |
| banners | print | RENAMED |
| eventos | campaigns-communication | RENAMED |
| manuals | — | EXPECTED_REMOVAL (DETAIL_GAP) |

LIVE V2 section counts: VI 12 · IA 25 · campaigns 3 · print 4

---

## F. Assets

- V2 missing main image: **0**  
- Unexpected image substitutions: **0**  
- Gallery evaluated separately (Seyier)

---

## G. Detail capability

| Feature | Status |
|---------|--------|
| main image / title / description / tags / localization | READY |
| Project context | READY |
| Entity/brand context | MAPPING_REQUIRED |
| detail identifier (id\|slug) | MAPPING_REQUIRED |
| gallery | DETAIL_GAP |
| manual | DETAIL_GAP |

→ 4D.4 can ship a **listing mapper**; detail needs gaps closed or hybrid.

---

## H. Manual CITF — impact real

Legacy `brand_manuals` **citf** is a **first-class Graphic index section**:

- `GraphicLayer` → `#grafico-manuales` grid (cover + PDF expand/download)  
- Full page `/grafico/manuals` via `GraphicSectionView`  
- Also brand hub related manuals  

**Not** buried in Piece detail only.

Cutover without resolution → empty Manuales section + broken see-more manuals.  
Classified `EXPECTED_DETAIL_GAP_MANUAL` — **does not** set `shadow_ok=false`, but blocks **full** Graphic cutover.

---

## I. Seyier gallery — impact real

- List thumb: **OK** (main `src`)  
- Expand/detail gallery extras: **lost** until `piece_resources` backfill  
- `EXPECTED_DETAIL_GAP_GALLERY` · listing still counts as surviving

---

## J. Sessions

| Check | Result |
|-------|--------|
| Classification | **EXPECTED_PUBLIC** |
| Piece ids | `sessions` |
| Forbidden / confidential entity labels | **0** |
| published mutated | **no** |

---

## K. ES / EN

`shadow_es_ok=true` · `shadow_en_ok=true` · title fallback en→es approved.

---

## L. Sorting

`EXPECTED_ORDER_CHANGE` — V2 regroups by category + reader sort vs per-section legacy order. Perceptible, accepted.

---

## M. Filter readiness

V2 resolves category / tag / entity / project (counts: tags 34, entity 15, project 17).  
One-filter UX still future UI.

---

## N / O. Diff counts

- Expected differences: present (discards, project context, gallery gap, taxonomy, order, manual gap)  
- Unexpected: **0**

---

## P. Readiness classification

| Layer | Classification |
|-------|----------------|
| Listing (Pieces) | **LISTING_READY_FOR_FLAG** |
| Detail / manuals | **DETAIL_NOT_READY** |
| Full Graphic | **not ready** |

Evidence: piece shadow clean; Manuales is a listing section + Seyier/detail/route gaps remain.

---

## Q. Recommendation 4D.4

**OPCIÓN B (recommended):**

- Feature flag for **Piece-backed sections** from GraphicContentV2  
- Keep **`brand_manuals` from legacy shell** until CITF has a V2 semantic home (ProjectResource / dedicated model — not invent Piece)  
- Seyier detail: accept degraded gallery or leave logos detail on hybrid until resources exist  

**OPCIÓN A:** wait for all detail — safer, slower.  
**OPCIÓN C:** resolve manual + Seyier resources first — cleanest V2, blocks flag.

Do **not** implement yet.

---

## Success criteria

- [x] 44 V2 explained · 47 legacy classified · 3 discarded  
- [x] unexpected missing/duplicate = 0  
- [x] main image missing = 0  
- [x] privacy / forbidden = 0  
- [x] ES/EN OK  
- [x] DETAIL_GAPS visible without failing shadow_ok  
- [x] no public double-read  

# Graphic Readiness — Phase 4D.0

**Status:** COMPLETE (audit only)  
**Date:** 2026-08-16  
**Scope:** READ-ONLY shadow · **no UI** · **no flag** · **no DB writes** · Graphic runtime remains **legacy**

Inspector: `npm run inspect:graphic-shadow`  
Live dump: `reports/_graphic-shadow-4d0-live.json`  
Module: `src/lib/content-v2/graphic-shadow.ts`

**shadow_ok:** `true` (expected deltas only)

---

## A. Runtime actual

| Item | Detail |
|------|--------|
| Index | `/{locale}/grafico` via `LayerShell` → `GraphicLayer` (`grafico/page.tsx` is null placeholder) |
| Sections | `/{locale}/grafico/[section]` → `GraphicSectionView` |
| Detail logos | `/{locale}/grafico/logos/[id]` if gallery length > 0 |
| Detail eventos | `/{locale}/grafico/eventos/[id]` |
| Loader | `loadPortfolioContent` / `loadGraphicSection` from `src/lib/content.ts` |
| Tables | `graphic_items` + `brand_manuals` + `tags` + `brands` |
| V2 | `getPublicPiecesV2` exists — **not wired** to public Graphic |
| Home flag | Irrelevant to Graphic (still legacy shell graphics) |

**Sections (UI order):** covers → logos → manuals → illustration → eventos → banners → personal  

**UX patterns:** jump nav · `TagFilter` · `SortButtons` (year \| name) · `ExpandableArtGrid` expand + `ImageLightbox` · brand hub `/marcas/{id}` · preview limit `graphicPreviewLimit`

---

## B. Legacy inventory

| Surface | Count |
|---------|-------|
| **graphic_items (published public)** | **47** |
| brand_manuals | **1** |

| Section | Count |
|---------|-------|
| covers | 12 |
| logos | 15 |
| personal | 10 |
| illustration | 3 |
| banners | 5 |
| eventos | 2 |

Cada item: id, title/alt ES/EN, section, tags, src, gallery, brandId, sortOrder, published — vía `mapGraphic` / `bySection`.

---

## C. V2 inventory (`getPublicPiecesV2`)

| Metric | Count |
|--------|-------|
| **Public Pieces** | **44** |
| A. standalone | **27** |
| B. with Project | **17** |
| C. with Entity (visible) | **15** |
| D. with tags | **34** |
| E. with resources | **2** |
| F. with src | **44** |

| category | Count |
|----------|-------|
| illustration-artwork | 25 |
| visual-identity | 12 |
| print | 4 |
| campaigns-communication | 3 |

**Project groups (public):** bass-series (5), citf-identity-2025 (2), push-visual-identity (2), + 1 each: apsmm, concitar, expedicion-polo, futulab-visual-identity, juegos-provinciales, sessions, seyier-visual-identity, taily

---

## D. Item mapping (47 legacy → V2)

| Status | Count | Notes |
|--------|------:|-------|
| **MATCH** | 27 | Standalone public Piece (same id) |
| **REPLACED_BY_PROJECT_PIECE** | 17 | Piece under Project (Bass, CITF, PUSH, Seyier, …) |
| **DISCARDED** | 3 | `buhoprofe`, `microtime`, `labcom` (expected) |
| **BLOCKED** | 0 | — |
| **NEEDS_DATA_DECISION** | 0 | — |
| **MISSING_V2** | 0 | — |
| **Matched (MATCH+REPLACED)** | **44** | |

**Expected discards:**

| Legacy | Reason |
|--------|--------|
| buhoprofe | Not user branding Piece; resource-only → Syllabi |
| microtime | Piece exists; parent Project unpublished → not public |
| labcom | Migration `published=false` intentional |

**unexpected:** none · **shadow_ok:** true

---

## E. Taxonomy mapping

| Legacy section | Survives as UI section? | V2 category | Derivation |
|----------------|-------------------------|-------------|------------|
| covers | yes (rename later?) | illustration-artwork | category (+ tags cover/bass) |
| logos | yes | visual-identity | category |
| illustration | yes | illustration-artwork | category |
| personal | yes | illustration-artwork | **origin=personal** and/or tags |
| banners | yes | print | category |
| eventos | yes | campaigns-communication | category |
| manuals | yes (special) | — | **still `brand_manuals`** — not Pieces |

**Proposal (not implemented):** keep section UX labels; filter Pieces by `category` + `origin` + tags. Personal ≠ separate category in V2 — needs origin/tag rule.

---

## F. Project Pieces

Known consolidations present in public V2:

- Bass Series (5 covers)
- CITF Identity (`itf`, `banner-cluster`)
- PUSH identity (`push`, `banner-push`)
- Seyier, Futulab, APSMM, Expedición Polo, Juegos Provinciales
- Concitar, Taily (logos under published Projects)
- Sessions (logo Piece + Project **public**)

### How Graphic should behave (recommendation for later phases)

**Prefer A — show each Piece individually** in category/section grids (closest to current flat `graphic_items` lists).

Optional later: chip/label “Project: …” without a second card for the Project (avoids duplication).

**Avoid B-only** (Project as sole card) — would collapse Bass Series / multi-deliverable logos and break current density.

**C (both)** only if a future “Projects gallery” mode is explicit — not default for cutover.

---

## G. Standalone Pieces

27 public standalone Pieces cover:

- artworks / fan art / covers (personal & client)
- logos without Project (summit-holding, tdt, fablab, …)
- banners / print standalone
- personal work

**No artificial Projects required** for UI grouping — category + origin + tags suffice.

---

## H. Images / resources

| Check | Result |
|-------|--------|
| Legacy missing src | **0** |
| V2 public missing src | **0** |
| Legacy gallery without `piece_resources` | **1** — `seyier` |

Notes:

- Most galleries migrated into `src_path` + occasional resources; only **2** public Pieces have resources today.
- Logo detail pages currently need `gallery[]` — V2 must map `piece_resources` → gallery frames (gap for detail, not list cards).
- `brand_manuals` PDFs remain outside Pieces.

---

## I. Entity context

Legacy: `brandId` → `/marcas/{id}` + `relatedByBrand`.

V2: `piece_entities` (preferred) or project entities.

**Proposed public rule (not implemented):**

```
allow: client | collaborator | other
deny: employer | intermediary
require entity.visible
never invent /entidades routes
prefer piece_entities over project_entities for chip/link
```

Confidential placeholders must not appear (readers already filter `visible`).

---

## J. Privacy

| Check | Result |
|-------|--------|
| forbidden alias hits (syllabi/microtime/proxi/aml/…) | **0** |
| buhoprofe public Piece | **false** |
| microtime public Piece | **false** |
| sessions public Piece | **true** (Project `sessions` published) |

**Human note:** Sessions appears in **legacy Graphic logos** today and in **V2 public Pieces**. Confirm intentional for Graphic (Home still excludes Sessions from featured). Not a shadow failure.

---

## K. Filters

**Current:** per-section tag filter · sort year \| A–Z · NSFW blur.

**Future V2 proposal (not implemented):**

- One active filter at a time: `category` XOR `tag` XOR `entity` XOR `project`
- Sort: `az` \| `za` \| `newest` \| `oldest` (already in `getPublicPiecesV2`)
- NSFW via tag catalog `isNsfw`

---

## L. Detail behavior

| Mechanism | Legacy | V2 readiness |
|-----------|--------|--------------|
| Expand + lightbox | yes | Piece `srcUrl` + resources OK for basic |
| Logo route `/grafico/logos/[id]` | gallery required | Need resources→gallery + slug/id strategy |
| Evento route | always | Piece by slug + category campaigns |
| Manual PDF | brand_manuals | **out of Pieces** — keep legacy table or later model |
| Fields | title, detail, year, tags, brand, href | `PublicPieceSummary` covers most; frame labels on resources |

**Gaps for detail cutover:** resource gallery mapping · route key (id vs slug) · manuals · brand-related section from piece/project entities.

---

## M. ES / EN

- Legacy: `LocalizedString` on title/detail/hrefLabel via `t()`.
- V2: `pickLocalized` / `mapLocalized` with en→es fallback.
- Audit: no content translation in 4D.0; expect same fallback behavior as Home.
- Some EN titles may fall back to ES (data, not adapter).

---

## N. Shadow results

```
legacy=47
v2_public=44
matched=44
discarded=3
blocked=0
missing=0
unexpected=0
shadow_ok=true
```

---

## O. Blockers / decisions (no auto-fix)

1. **Sessions public** — confirm OK for Graphic V2 (parity with legacy logo).
2. **seyier** — gallery→`piece_resources` for detail page parity.
3. **brand_manuals** — remain legacy through early 4D or scope a manuals adapter.
4. **Section “personal”** — define origin/tag rule before UI mapping.
5. **Project label UX** — optional chip only (see F).

**No DB migration required for list-level cutover readiness** beyond optional resource backfill for seyier (and any detail galleries).  
**Data patch:** optional / small — **not blocking 4D.2 adapter design**.

---

## P. Plan 4D.1+

| Phase | Goal |
|-------|------|
| **4D.1** | Optional data readiness: seyier resources; confirm Sessions publish intent; personal/section mapping rules; manuals strategy |
| **4D.2** | `GraphicContentV2` adapter (Pieces → section lists for `GraphicLayer` contract) — still unused by pages |
| **4D.3** | Expand shadow tests + ES/EN parity checks |
| **4D.4** | `GRAPHIC_CONTENT_SOURCE` flag (default legacy) — branch before load, no double-read |
| **4D.5** | Visual validation |
| **4D.6** | Cutover default V2 + legacy rollback |

If 4D.1 finds no required patch after human confirms Sessions + manuals stay legacy → skip straight to **4D.2**.

---

## Explicit non-goals (honored)

- No public Graphic runtime change  
- No feature flag yet  
- No Admin / Interfaces / Home / DB writes  
- Legacy not retired  

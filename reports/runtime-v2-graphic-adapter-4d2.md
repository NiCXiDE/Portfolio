# Graphic Content V2 Adapter — Phase 4D.2

**Status:** COMPLETE  
**Date:** 2026-08-16  
**Commit target:** `feat(content): add v2 graphic content adapter`  
**Public Graphic runtime:** still **100% legacy** (no flag, no wiring)

---

## A. GraphicContentV2

Module: `src/lib/content-v2/graphic.ts`

| API | Role |
|-----|------|
| `getGraphicContentV2(locale, filters?)` | Full Graphic payload |
| `buildGraphicContentV2(locale, pieces)` | Pure assembly (tests) |
| `getGraphicPieceDetailV2(locale, idOrSlug)` | Detail DTO (no routes) |

```ts
GraphicContentV2 {
  locale
  sections: GraphicSectionV2[]  // by category
  pieces: GraphicPieceItemV2[]  // flat, individual
  manuals: []                   // DETAIL_GAP
  meta: { counts, manualStatus, seyierGalleryGap, sessionsReview, ... }
}
```

Uses only `getPublicPiecesV2` / `getPublicPieceBySlugV2` — never `graphic_items`.

---

## B. UI contract mapping

| UI NEED | LEGACY FIELD | V2 SOURCE | TRANSITION |
|---------|--------------|-----------|------------|
| section | `graphic_items.section` | `pieces.category` → section id | MAPPING |
| title | title \| alt | `pickLocalized(title) \|\| alt` | DIRECT |
| src / thumb | srcPath | `resolvePieceMainImage` | MAPPING |
| gallery | galleryPaths | `piece_resources` → detail.gallery | GAP (seyier) |
| brand/entity | brandId | safe piece_entities | MAPPING |
| tags | tags[] | piece_tags + catalog | DIRECT |
| detail id | id | id \| slug | MAPPING |
| manual | brand_manuals | none | GAP DETAIL_GAP |
| personal | section=personal | origin/tags (not category) | MAPPING later |
| year sort | year | reader sort newest/oldest | DIRECT |

Exported as `GRAPHIC_UI_CONTRACT_4D2`.

---

## C. Sections

Derived from category (no `personal` category):

| Section id | Label ES | Label EN | LIVE n |
|------------|----------|----------|--------|
| visual-identity | Logotipos/Wordmarks | Logos/Wordmarks | 12 |
| illustration-artwork | Ilustración y artwork | Illustration & artwork | 25 |
| campaigns-communication | Eventos | Events | 3 |
| print | Banners / print | Banners / print | 4 |
| other | Otros | Other | 0 (omitted when empty) |

Personal work stays `origin` / tags inside illustration-artwork.

---

## D. Piece mapping

Each `GraphicPieceItemV2`: id, slug, localized title, category, origin, tags, imageUrl, fit, year, detail, href, project?, entity?, resourceCount, sortOrder.

---

## E. Project Pieces

17 pieces appear **individually** with optional `project: { id, slug, title }`.  
No Project-as-folder item. No Project+Piece duplication.

---

## F. Standalone

27 pieces with `project: null`. No artificial Projects.

---

## G. Image strategy

1. non-empty `srcUrl`  
2. else first resource whose `kind` hints cover/thumb/primary/main  
3. else `null`  

Gallery ≠ cover: resources only enter `GraphicPieceDetailV2.gallery`.

LIVE: **missingMainImage = 0**

---

## H. Seyier gap

- List image: OK (`src_path` → svg)  
- `piece_resources`: **empty** → `meta.seyierGalleryGap = true`  
- Adapter does **not** read legacy `graphic_items` gallery  
- Detail gallery parity deferred

---

## I. Manual resolution

Legacy: `brand_manuals.id=citf` (cover + PDF).

V2 audit: no Piece, no PieceResource PDF, no ProjectResource PDF on `citf-identity-2025`.

**Decision:** `manuals: []` · `meta.manualStatus = DETAIL_GAP`  
Do **not** invent a Piece to mimic legacy. Resolve semantically in a later phase (ProjectResource or dedicated model).

---

## J. Entity context

Allow: `client` \| `brand-owner` \| `responsible` \| `collaborator`  
Deny: `employer` \| `intermediary`  
Require visible Entity; prefer primary then sortOrder.  
Else `entity: null`.

LIVE: **15** pieces with safe entity context.

---

## K. Sessions review

| Item | Value |
|------|-------|
| Visible | `sessions` Piece under Project `sessions` |
| Public label | piece title (localized) |
| Entity | sanitized via safe roles only |
| Classification | **CURRENT_PUBLIC_SAFE** |

No data changes. Pre-cutover human confirm still recommended (4D.0 note).

---

## L. Filters / sorting

Filters prepared on `getGraphicContentV2`: category, tag, entityId, projectId.  
One-active-at-a-time = UI concern later.

Sort: `az` \| `za` \| `newest` \| `oldest` \| `default` via `getPublicPiecesV2`.  
Missing year → sorted to end (newest) / start (oldest) per reader.

---

## M. Detail DTO

`GraphicPieceDetailV2` = list item + `resources` + `gallery` (from resources only).  
Gaps: seyier gallery · manuals · route strategy id/slug · brand-related section.

No new routes.

---

## N. ES / EN

`pickLocalized` with en→es fallback. No auto-translate. No hardcoded content strings for missing copy (section labels are UI chrome only).

---

## O. Inspector results

`npm run inspect:graphic-v2` → **graphic_v2_ok=true**

```
pieces=44 standalone=27 projectLinked=17
missingMainImage=0 discardedLeaks=[] forbiddenHits=[]
```

---

## P. Privacy

| Check | Result |
|-------|--------|
| buhoprofe / microtime / labcom returned | **0** |
| forbidden aliases | **0** |
| employer/intermediary labels | **0** |
| unpublished parent leaks | **0** (reader + adapter) |

---

## Q. Gaps for 4D.3+

1. Seyier `piece_resources` backfill (optional data)  
2. Manual semantic model (not invent Piece)  
3. Sessions pre-cutover confirm  
4. UI mapping personal filter (origin)  
5. Shadow expand + mapper to GraphicLayer props (4D.3/4D.4)  
6. Detail routes  

**4D.1 omitted** — no required list data patch.

---

## Success criteria

- [x] GraphicContentV2 exists  
- [x] 44 public Pieces representable  
- [x] 27 + 17  
- [x] sections by category  
- [x] images listable  
- [x] no leaks  
- [x] safe Project/Entity context  
- [x] detail gaps documented  
- [x] public Graphic still legacy  
- [x] DB intact  

# Runtime V2 Read Model — Phase 4B

**Status:** COMPLETE — isolated readers only (no public cutover)  
**Date:** 2026-08-15  
**Database validated:** `portfolio` (LIVE)

---

## A. Archivos creados

| Path | Role |
|------|------|
| `src/lib/content-v2/types.ts` | Public DTOs |
| `src/lib/content-v2/visibility.ts` | Central visibility rules |
| `src/lib/content-v2/map.ts` | Localized + entity mapping |
| `src/lib/content-v2/entities.ts` | Entity readers |
| `src/lib/content-v2/projects.ts` | Project readers |
| `src/lib/content-v2/pieces.ts` | Piece readers |
| `src/lib/content-v2/testimonials.ts` | Testimonial readers |
| `src/lib/content-v2/index.ts` | Public barrel |
| `scripts/inspect-runtime-v2-read-model.ts` | READ-ONLY LIVE inspector |
| `reports/runtime-v2-read-model-4b.md` | This report |

**Not modified:** `src/lib/content.ts`, public pages, Admin, schema, DB.

---

## B. Arquitectura elegida

Single module tree: **`src/lib/content-v2/`** (not repositories + services).

TypeORM entities used as source rows; DTOs returned to callers. No UI imports yet.

### TypeORM vs conceptual schema (inspection)

| Conceptual | TypeORM class | tableName | Notes |
|------------|---------------|-----------|-------|
| Entity | `PortfolioEntity` | `entities` | schema name `"PortfolioEntity"` |
| Project | `ProjectEntity` | `projects` | schema name `"Project"` |
| ProjectArea | `ProjectAreaEntity` | `project_areas` | composite PK |
| ProjectRole | `ProjectRoleEntity` | `project_roles` | composite PK |
| ProjectEntity link | `ProjectEntityLinkEntity` | `project_entities` | no `isPrimary` column |
| Piece | `PieceEntity` | `pieces` | `slug` nullable; `published` boolean |
| PieceResource | `PieceResourceEntity` | `piece_resources` | |
| ProjectResource | `ProjectResourceEntity` | `project_resources` | |
| PieceTag | `PieceTagEntity` | `piece_tags` | |
| PieceEntity link | `PieceEntityLinkEntity` | `piece_entities` | has `isPrimary`, `sortOrder` |
| Tag | `TagEntity` (legacy file) | `tags` | shared catalog |
| Testimonial | `TestimonialEntity` (legacy) | `testimonials` | `entityId`, `hidden` |

All V2 schemas are registered in `portfolioV2Entities` → `portfolioEntities` / `getDataSource()`.

---

## C. DTOs

- `PublicEntitySummary`
- `PublicProjectSummary` (+ areas, roles, entity links, resources)
- `PublicPieceSummary` (+ tags, resources, entity links, optional parent project)
- `PublicTestimonial` (+ optional visible Entity; legacy company fallback)

Never exposed: `migration_map`, fingerprints, confidential placeholder entities, unpublished projects.

---

## D. Visibility rules (central)

| Surface | Rule |
|---------|------|
| Entity public | `visible === true` |
| Entity Home | `visible && showOnHome` |
| Entity page eligible | `visible && pageEnabled` (flag only; no route invented) |
| Project public | `published === true` **and** `status !== "archived"` |
| Project Home | public ∧ `showOnHome` |
| Piece public | `published === true` **and** (no parent **or** parent is public project) |

**Documented decision:** `archived` projects excluded from public readers until product says otherwise.

---

## E–H. Readers

| Reader | Behavior |
|--------|----------|
| `getHomeEntitiesV2` | Home entities, homeOrder NULLS LAST |
| `getPublicEntityBySlugV2` | visible only; exposes `pageEnabled` |
| `getPublicEntitiesV2` | all visible |
| `getHomeProjectsV2` | showOnHome public projects |
| `getPublicProjectsV2(filters?)` | published-only; filters area/entity/status/featured/showOnHome/sort |
| `getPublicProjectBySlugV2` | published-only |
| `getPublicPiecesV2(filters?)` | published + parent-safe; filters category/tag/entity/project/origin/standalone |
| `getPublicPieceBySlugV2` | same rules |
| `getPublicTestimonialsV2` | `hidden=false`; Entity preferred when visible |

Batch hydration uses `In(...)` to avoid N+1 for areas/roles/links/resources/tags.

---

## I. Locale strategy

V2 text fields are `LocalizedJson` `{ es, en }`.  
`pickLocalized(value, locale)` prefers locale then falls back to `es` (same idea as legacy `t()`).  
**No auto-translation.**

---

## J. Sorting

- Home: `homeOrder ASC NULLS LAST` → `sortOrder` → `id`
- Lists: `default` | `az` | `za` | `newest` | `oldest`
- Partial project dates: sort uses year/month integers only — **never** synthesizes `01/01/YYYY`

---

## K. LIVE validation counts (`inspect-runtime-v2-read-model.ts`)

| Check | Result |
|-------|--------|
| database | `portfolio` |
| Home entities | **6** (`aicore`, `apsmm`, `citf`, `ludica`, `orbita-l-b`, `push`) |
| Home projects | **0** (no row has `show_on_home=1` in LIVE today) |
| Public projects | **27** (0 unpublished leaks) |
| Public entities | **27** (0 `confidential-*`) |
| Public pieces | **44** (standalone 27 / project-linked 17) |
| Testimonials | **4** (all with Entity) |

---

## L. Privacy checks

- Invisible / confidential placeholder entities excluded from public entity lists  
- Unpublished projects never returned  
- Piece under unpublished parent excluded (`microtime` piece not leaked)  
- Related entity summaries only when `visible=true`

---

## M. Known cases

| Case | Result |
|------|--------|
| Syllabi public project | excluded |
| PROXI | excluded |
| MicroTime project | excluded |
| MicroTime piece leak | prevented |
| confidential-logistics-system | excluded |
| confidential Entities on Home | none |
| PUSH / AICORE / CITF / APSMM on Home | present |
| APSMM `pageEnabled` | `false` (no URL invented) |
| buhoprofe as Piece | absent |

### Data note (not a reader bug)

These projects are **`published=true`** in LIVE and therefore appear in `getPublicProjectsV2`:

- `aicore-inventariado`
- `asesor-financiero`
- `aml-casinos`
- `aml-general`

Client Entities remain invisible (`confidential-*`). Documented for product review; **4B did not change data**.

### Data note — Home projects

`show_on_home` is **0 for all projects** after migration apply (entities Home flags were set; project Home flags were not). `getHomeProjectsV2()` correctly returns `[]` until content/admin sets flags.

---

## N. Problems / differences found

1. TypeORM class names ≠ table names (`PortfolioEntity` / `Project`).  
2. `project_entities` has no `isPrimary` (unlike `piece_entities`).  
3. Home Projects empty in LIVE (data, not code).  
4. Some confidential **work** projects are published while clients stay invisible — reader respects `published` as specified.

---

## O. Touch in 4C (not now)

- Wire Home to `getHomeEntitiesV2` / testimonials V2 (feature flag evaluation)
- Possibly set/review project `showOnHome` content
- Still **do not** cut over Gráfico/Interfaces in 4C unless scoped

Legacy `src/lib/content.ts` remains the live public source until 4C+.

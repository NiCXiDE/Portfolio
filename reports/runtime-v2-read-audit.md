# Runtime V2 Read Audit — Phase 4A

**Status:** AUDIT ONLY — no code/DB changes  
**Date:** 2026-08-15  
**Prerequisite:** Phase 3C closed (MySQL V2 LIVE materialized; public runtime still legacy)

---

## A. Architecture actual

```
Public UI (Server Components + client layers)
        │
        ▼
src/lib/content.ts  ← ÚNICO aggregator de lecturas públicas de contenido
        │
        ▼
getDataSource() → TypeORM find/findOne
        │
        ▼
LEGACY tables only (brands, graphic_items, ui_projects, …)

V2 tables: registered in DataSource metadata, ZERO public/admin queries yet.
API route handlers for content: NONE (no app/**/route.ts content APIs).
```

**Locale:** `/{locale}/…` with `es` | `en` (middleware). Copy via dictionaries; CMS JSON fields via `t(value, locale)`.

**Force-dynamic:** layout loads content every request — no fixture fallback if DB fails.

---

## B. Inventory — Legacy runtime reads

| Table | EntitySchema | File | Runtime public | Runtime admin |
|-------|--------------|------|----------------|---------------|
| brands | BrandEntity | `src/db/entities.ts` | yes (`content.ts`) | yes |
| brand_manuals | BrandManualEntity | idem | yes | yes |
| graphic_items | GraphicItemEntity | idem | yes | yes |
| ui_projects | UiProjectEntity | idem | yes | yes |
| ui_list_items | UiListItemEntity | idem | yes | yes |
| named_list_items | NamedListItemEntity | idem | yes (Home marquees) | yes |
| testimonials | TestimonialEntity | idem | yes | yes |
| tags | TagEntity | idem | yes (Gráfico filters) | yes |

**TypeORM relations:** none declared (FK columns only).

**Central loader:** `loadPortfolioContent()` in `src/lib/content.ts` — parallel `find` on all of the above (+ bio, tech_icons, site_settings, social_links).

**Additional public helpers:**

| Function | Tables | Screens |
|----------|--------|---------|
| `loadGraphicSection(section)` | graphic_items | evento/logo detail |
| `relatedByBrand(brandId)` | graphic_items, ui_projects, brand_manuals | `/marcas/[id]`, related sections |
| `loadBrandById(id)` | brands | `/marcas/[id]` |
| `brandIdsWithRelatedWork` | graphics/ui/manuals | exported, **no public callers** |

---

## C. Inventory — V2 entities available (not wired)

| Table | EntitySchema | File | In DataSource | Queried by app? |
|-------|--------------|------|---------------|-----------------|
| entities | PortfolioEntity | `src/db/entities-v2.ts` | yes (portfolioEntities) | **no** |
| projects | ProjectEntity | idem | yes | **no** |
| project_areas | ProjectAreaEntity | idem | yes | **no** |
| project_roles | ProjectRoleEntity | idem | yes | **no** |
| project_entities | ProjectEntityLinkEntity | idem | yes | **no** |
| pieces | PieceEntity | idem | yes | **no** |
| piece_resources | PieceResourceEntity | idem | yes | **no** |
| project_resources | ProjectResourceEntity | idem | yes | **no** |
| piece_tags | PieceTagEntity | idem | yes | **no** |
| piece_entities | PieceEntityLinkEntity | idem | yes | **no** |
| migration_map | MigrationMapEntity | idem | yes | **no** |

**Types-only:** `src/lib/content-model-v2.ts` imports V2 types/enums for validators; consumed by test helper scripts, not public UI.

**Bridge already in DB:** `testimonials.entity_id` populated + `fk_testimonials_entity` — runtime still ignores `entityId` and uses company_* / brand fields.

---

## D. Matriz LEGACY → V2

| Legacy source | Current public use | V2 source propuesto | Transformaciones | Riesgo |
|---------------|--------------------|---------------------|------------------|--------|
| brands | Hub logos, marquees enrichment, Interfaces client logos | `entities` (`visible`, `logo_path`, `href`, `slug`) | Map brand.id → entity.id (often same); filter `visible` not only `published` | **MEDIUM** — hub eligibility rules differ |
| brand_manuals | Gráfico manuals section + brand hub | `pieces` and/or `project_resources` (citf manuals lineage) | Remap section “manuals”; preserve PDF/cover paths | **MEDIUM** |
| graphic_items | Gráfico grids + detalles + related | `pieces` (+ `piece_tags`, `piece_entities`, `piece_resources`); some → `project_resources` (e.g. buhoprofe) | Section→category/origin; gallery→piece_resources; `src_path`; drop discarded pieces; tag slugs via piece_tags | **HIGH** — section model ≠ V2 categories; filters/NSFW/tag UX |
| ui_projects | Interfaces cards + detail modal | `projects` + areas/roles/entities + `project_resources` | category→areas; client→project_entities; images→resources; enforce `published=true` | **HIGH** — card shape + related graphics coupling |
| ui_list_items | Interfaces orphan list strip | Unclear / possibly Entity or discard | Need product decision; may not map 1:1 | **HIGH** |
| named_list_items | Home marquees (company / past / current) | Entities/Projects with `showOnHome` (+ homeOrder) | **Stop using named_list as runtime source**; rebuild marquees from flags | **HIGH** — Home composition change |
| testimonials | Home quotes | `testimonials` + join `entities` | Prefer Entity logo/name/href; keep quote/role; honor `entity_id`; still `!hidden` | **LOW–MEDIUM** |
| tags | Gráfico tag filter labels | `tags` + `piece_tags` | Same catalog (+ tdt/cover); join via piece_tags not JSON array on graphic row | **MEDIUM** |
| graphic brandId links | Hub + related | `piece_entities` / `project_entities` | Replace brandId filters with entity relations | **MEDIUM** |

**Regla pública obligatoria (futuro):** `published=false` **nunca** en superficies públicas (Projects/Pieces).

---

## E. Home audit

**Route:** `/{locale}` → `HomeLayer` via `LayerShell` + content from layout `loadPortfolioContent()`.

| Need | Hoy | V2 propuesto |
|------|-----|--------------|
| Organizaciones/marcas marquee | `named_list_items` kind=`company` + brand logo enrichment | Entities with `visible && showOnHome` (ordered by `homeOrder`) |
| Past / current project marquees | `named_list_items` kinds `past_project` / `current_project` | Projects with `published && showOnHome` (+ status mapping) — **or** keep curated lists until product confirms |
| Testimonials | `testimonials` where `!hidden` | Same + resolve Entity for company presentation |
| Logos/images | brand.logoPath or named.logoPath | entity.logo_path |
| Hub links | `/marcas/{brandId}` if brand has published related work | `/entidades/{slug}` (canonical) with `/marcas/{slug}` compat later |
| Bio / settings / socials | bio, site_settings, social_links | unchanged (out of content-model V2) |

**Gap vs decisions:** Home today does **not** read `showOnHome` / `pageEnabled` (those exist only on V2 rows). Marquees are curated named lists, not derived from Entity/Project flags.

---

## F. Gráfico audit

**Routes:**

- `/{locale}/grafico` — `GraphicLayer` (previews)
- `/{locale}/grafico/{section}` — `GraphicSectionView`
- `/{locale}/grafico/eventos/{id}` — detail
- `/{locale}/grafico/logos/{id}` — detail (gallery required)

**Source hoy:** `graphic_items` by `section` + `published`; manuals from `brand_manuals`; tags from `tags`.

**Agrupación:** sections = covers | logos | personal | illustration | banners | eventos | manuals.

**Filtros/orden UI:** year / alpha; tag include; NSFW via `tags.isNsfw`; preview limit from settings.

**V2 propuesto:**

| Concepto | Lectura |
|----------|---------|
| Standalone art | `pieces` where `project_id IS NULL` + `published` |
| Project deliverables shown as art | `pieces` with `project_id` + published |
| Contextual assets (e.g. buhoprofe) | `project_resources` — **not** as Piece |
| Primary image | `pieces.src_path` |
| Gallery extras | `piece_resources` |
| Tags | `piece_tags` ⨝ `tags` |
| Client/org | `piece_entities` ⨝ `entities` |
| Event/project hubs | optionally group by `projects` |

**Riesgo HIGH:** UI still thinks in legacy `section`; V2 uses `category`/`origin`/tags — needs an explicit public grouping strategy in 4D (compatibility map or new taxonomy UX).

---

## G. Interfaces audit

**Routes:**

- `/{locale}/interfaces` — `InterfacesLayer`
- `/{locale}/interfaces/{category}` — filtered grid

**Source hoy:** `ui_projects` (`published`, `category`); related graphics by `brandId`; `ui_list_items`; brand logos.

**Categories:** preventas | sistemas-a-medida | apps-mobile | proyectos-personales | system-design.

**V2 propuesto:**

| Concepto | Lectura |
|----------|---------|
| Cards | `projects` where `published=true` (+ area filters via `project_areas`, e.g. `ux-ui`) |
| Roles / metadata | `project_roles`, title/summary JSON, date fields |
| Client/org | `project_entities` ⨝ `entities` |
| Covers / carousel images | `project_resources` / cover_path |
| Detail modal | same project + resources + related pieces |

**Regla:** solo Projects publicados.

**Riesgo HIGH:** category strings on ui_projects ≠ project_areas enums; need mapping table for public filters.

---

## H. Entity routes

| Existe hoy? | Path |
|-------------|------|
| **Sí** | `/{locale}/marcas/[id]` (`BrandHubPage`) — id = brand id (`citf`, `apsmm`, `seyier` static seeds; runtime any published brand with related work) |
| **No** | `/entidades/[slug]` |
| **No** | `/brands/[slug]` |

**Arquitectura aprobada (futuro, no crear en 4A):**

- Canonical: `/entidades/[slug]`
- Compat: `/marcas/[slug]` → same page or redirect

**Para página Entity:** `visible && pageEnabled` + related published Projects/Pieces via `project_entities` / `piece_entities`.

---

## I. Testimonials

**Hoy:** load all testimonials ordered; public filters `!hidden`; displays name, image, quote, role, companyName/logo/href (and brand enrichment indirectly via company fields).

**`entity_id`:** column populated on LIVE; **runtime does not join Entity**.

**Propuesto:**

```
testimonials (!hidden)
  LEFT JOIN entities ON entities.id = testimonials.entity_id
```

Prefer Entity for logo/name/href when present; keep testimonial quote/role/image; avoid duplicating company_* when Entity already supplies them (unless explicit override policy).

Riesgo: **LOW** once join is added.

---

## J. Fixtures / fallbacks

| Asset | Role | Classification |
|-------|------|----------------|
| `content/home/*.json` | seed/sync source | historical / seed-only |
| `content/grafico/*.json` | seed + **IDs only** for sitemap / `generateStaticParams` | active for route ID lists; **not** payload fallback |
| `content/interfaces/*.json` | seed/sync | historical / seed-only |
| `defaultSettings` in `content.ts` | in-code fallback if site_settings missing | active fallback (settings only) |
| Hardcoded hero assets (`/assets/inicio/...`) | decorative | active static assets |
| Fixture → DB body for public pages | — | **none** |

**Objetivo futuro:** MySQL única fuente operativa; static params should eventually come from DB IDs (pieces/projects), not JSON.

---

## K. Riesgos (top)

1. **HIGH — named_list_items Home:** product UX tied to curated lists; V2 flags may not reproduce marquees 1:1 without content review.  
2. **HIGH — Gráfico section taxonomy:** public UI sections vs Piece category/origin/tags.  
3. **HIGH — Interfaces categories:** ui_projects.category vs project_areas.  
4. **MEDIUM — Brand hub:** brand published + related-work heuristic vs Entity `pageEnabled` + relation graph.  
5. **MEDIUM — Dual model period:** risk of drift if Admin still edits legacy while public moves to V2.  
6. **LOW — Testimonials Entity join:** data already migrated.  
7. **MEDIUM — Confidential projects:** must never surface via accidental published/showOnHome mistakes (defense in query layer).

---

## L. Propuesta secuencia 4B+

| Step | Scope |
|------|-------|
| **4B** | Read-model / repositories V2 (`src/lib/content-v2/` or `src/repositories/`) — pure queries + DTO mappers; **no UI swap yet**. Optional feature flag `CONTENT_SOURCE=legacy\|v2`. |
| **4C** | Home reads → V2 (Entities/Projects showOnHome + testimonials+entity); keep dual-read/flag. |
| **4D** | Gráfico reads → pieces/piece_tags/piece_entities (+ project_resources exceptions). |
| **4E** | Interfaces → projects graph (+ published-only). |
| **4F** | Entity pages: `/entidades/[slug]` + `/marcas/[slug]` compat. |
| **4G** | Testimonials cleanup + remove named_list runtime dependency when marquees proven. |
| **4H** | Admin V2 (after public paths stable). |
| **4I** | Retire legacy public reads; keep legacy tables until Admin cutover complete. |

**Feature flag / dual-read:** **recomendado** for 4C–4E (compare payloads in staging; hard cut per surface).

### Archivos a tocar en 4B (propuesta; no implementar ahora)

- **Nuevos:** `src/repositories/v2/{entities,projects,pieces,testimonials}.ts` (o `src/lib/content-v2/*.ts`)
- **Tipos DTO:** `src/lib/content-v2/types.ts` (alineados a UI actual para facilitar swap)
- **Opcional:** `src/lib/content-source.ts` flag resolver
- **Tests:** `scripts/test-v2-read-model.ts` or unit tests comparing legacy vs V2 counts for published surfaces
- **NO en 4B:** `HomeLayer`, `GraphicLayer`, `InterfacesLayer`, admin, schema, migrations

### Archivos que consumen legacy hoy (cutover targets 4C+)

- `src/lib/content.ts` (hub)
- `src/app/[locale]/layout.tsx`
- `src/components/layers/{HomeLayer,GraphicLayer,GraphicSectionView,InterfacesLayer}.tsx`
- `src/components/{InterfacesCategoryGrid,BrandRelatedSection,InfiniteMarquee,UiProjectDetailModal}.tsx`
- `src/app/[locale]/grafico/**`, `interfaces/**`, `marcas/[id]/page.tsx`
- `src/app/sitemap.ts` (IDs from JSON → DB later)

---

## Public routes checklist

| Route | Legacy tables |
|-------|---------------|
| `/{locale}` Home | named_list_items, testimonials, brands, bio, settings |
| `/{locale}/grafico` | graphic_items, brand_manuals, tags |
| `/{locale}/grafico/[section]` | graphic_items / brand_manuals, tags |
| `/{locale}/grafico/eventos/[id]` | graphic_items (+ related) |
| `/{locale}/grafico/logos/[id]` | graphic_items (+ related) |
| `/{locale}/interfaces` | ui_projects, ui_list_items, brands, graphic_items |
| `/{locale}/interfaces/[category]` | ui_projects, brands, graphic_items |
| `/{locale}/marcas/[id]` | brands, graphic_items, ui_projects, brand_manuals |
| Sitemap | content JSON IDs only |

---

## Explicit non-actions (4A)

- No code changes · no DB writes · no cutover · no Admin V2 · no legacy deletion · no commit required for this audit file unless later approved

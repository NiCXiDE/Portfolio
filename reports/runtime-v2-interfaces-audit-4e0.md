# Interfaces V2 Runtime Audit — Phase 4E.0

**Status:** READ-ONLY COMPLETE  
**Date:** 2026-08-19  
**Database:** `portfolio` (LIVE, sin writes)  
**Clasificación readiness:** **`LISTING_READY_DETAIL_GAPS`** + decisión de privacidad requerida antes del runtime

---

## Resumen ejecutivo

| Métrica | Valor |
|---------|-------|
| Legacy `ui_projects` total | **13** |
| Legacy `ui_projects` public | **13** |
| Legacy `ui_list_items` total | **8** |
| V2 candidatos `area=ux-ui` | **24** |
| V2 public-safe (`published=true`, no `archived`) | **20** |
| V2 public-safe **Interfaces** (excl. confidential) | **15** |
| V2 mixed-area public (`ux-ui` + `graphic`) | **5** |
| `project_resources` en candidatos ux-ui | **26** recursos / **13** proyectos |
| Assets físicos faltantes | **0** |
| Mapping legacy `ui_projects` → V2 | **8 MATCH**, **5 PRIVACY_EXCLUDED** |

**Bloqueadores principales para 4E.1:**

1. **Privacidad:** 5 proyectos legacy públicos tienen `published=true` en V2 pero están marcados `confidential` — el adapter debe excluirlos explícitamente (no basta `isPublicProject()`).
2. **Resources:** 8 proyectos public-safe **no tienen** `project_resources` — el modal/carousel legacy no puede alimentarse solo desde V2.
3. **Taxonomía:** categorías UI legacy (`UiCategory`) no existen en V2 — hay que derivarlas de `type` + `context` sin inventar categorías Graphic.
4. **Superficie ui_list:** 4 ítems legacy descartados + 4 promovidos a Projects — la UI huérfana desaparece en V2.

---

## A. Rutas públicas

### Entrypoints App Router

| Ruta | Componente | Loader | Tablas legacy | Identificador |
|------|------------|--------|---------------|---------------|
| `/{locale}/interfaces` | `InterfacesLayer` (via `LayerShell`) | `loadPortfolioContentForLocale` → `loadPortfolioContent` | `ui_projects`, `ui_list_items`, `brands`, `site_settings` | Proyecto: **`id`**. Categoría: slug fijo en código |
| `/{locale}/interfaces/{category}` | `InterfacesCategoryGrid` + breadcrumbs | `loadPortfolioContent()` **directo** | `ui_projects` (+ gráficos para related) | Categoría: **slug**. Proyecto: **`id`** |
| Detalle proyecto | `UiProjectDetailModal` | Datos ya en memoria (client state) | — (no fetch) | **`id`** en state; **sin URL de detalle** |

**Categorías válidas** (hardcoded en `page.tsx`, `LayerShell`, `sitemap.ts`, `entities.ts`):

- `preventas`
- `sistemas-a-medida`
- `apps-mobile`
- `proyectos-personales`
- `system-design` (0 filas legacy)

**generateStaticParams:**

- `/[locale]/interfaces` — hereda `{ locale }` del layout
- `/[locale]/interfaces/[category]` — 5 categorías × locale
- **No existe** generateStaticParams por proyecto individual

**Metadata:**

- Hub: `interfacesLayerTitle` + `dict.meta.interfacesDescription`
- Categoría: `interfacesCategoryTitle` + canonical `/interfaces/{category}`
- Sitemap: hub + 5 categorías × locales

**Navegación prev/next:**

- Entre layers (`inicio ↔ grafico ↔ interfaces`) — deshabilitada en rutas catalog-detail
- Modal: prev/next de **slides/imágenes** solamente — **no** proyecto-a-proyecto

**Listados secundarios:**

| Ruta | Loader | Tabla | Notas |
|------|--------|-------|-------|
| `/{locale}/marcas/{id}` | `relatedByBrand(id)` | `ui_projects` WHERE `brand_id` | Link genérico a `/interfaces`, sin deep-link |
| `/{locale}/grafico/logos/{id}` | `relatedByBrand` | `ui_projects` | `BrandRelatedSection` → `/interfaces` |
| `/{locale}/grafico/eventos/{id}` | idem | idem | idem |

**Inconsistencia detectada:** hub usa `loadPortfolioContentForLocale`; página categoría usa `loadPortfolioContent` directo — gráficos related pueden diferir si flags V2 activos en Graphic.

**Interfaces y V2 flags:** `loadPortfolioContentForLocale` no overridea `uiProjects`/`uiList` — **100% legacy** hoy.

---

## B. Modelo legacy

### `ui_projects` (13 filas LIVE, todas `published=true`)

| Campo | Semántica |
|-------|-----------|
| `id` | PK string (slug estable) |
| `category` | `UiCategory` — 5 slugs fijos |
| `title`, `meta`, `summary`, `period`, `duration` | JSON i18n `{ es, en }` |
| `images` | Galería/carousel: `string[]` o `UiSlide[]` (`src` + `aspect: landscape\|portrait`) |
| `prototype_url`, `cta_kind` | URL externa + tipo CTA (`prototype` \| `visitor` \| `live`) |
| `client` | Texto libre (no FK) |
| `brand_id` | FK opcional → `brands.id` (solo **apsmm** en fixtures) |
| `sort_order` | Orden global DB |
| `published` | Filtro público en `loadPortfolioContent` |

**Por categoría (legacy public):**

| Categoría | n | IDs |
|-----------|---|-----|
| `sistemas-a-medida` | 7 | apsmm, aml-casinos, aml-general, clearwater, mikrobiol, casiba, proxi |
| `preventas` | 3 | adapto-pay, omnigroup, aicore-inventariado |
| `apps-mobile` | 2 | savil, asesor-financiero |
| `proyectos-personales` | 1 | cms-portfolio |
| `system-design` | 0 | — |

**Orden UI hub:** por categoría fija → sort cliente (`year` default desde regex en `meta`, o `alpha`).

**Sin tags** en `ui_projects`.

### `ui_list_items` (8 filas LIVE, todas `published=true`)

Lista ligera sin ficha completa: `title`, `logo_path`, `caption`, `wordmark`, `sort_order`.

| ID | Destino en migración V2 |
|----|-------------------------|
| carlitos | → `repuestos-carlitos` (Project) |
| simaas | → `simaas-marketplace` |
| templeton | → `templeton-digital-transformation-assessment` |
| cloronor-trading | → `cloronor-trading` |
| push-landing | **DISCARDED** — superficie list deprecated |
| orbita-landing | **DISCARDED** |
| ludica-landing | **DISCARDED** |
| b2b | **DISCARDED** (duplica concepto PROXI) |

**UI actual:** sección “orphan list” en `InterfacesLayer` — ítems cuyo `id` no coincide con un `ui_project.id` y `caption !== ui_project.id`. Con fixtures actuales, los **8** aparecen como huérfanos.

**`interfacesPreviewLimit`** en `site_settings`: cargado pero **no usado** en UI pública.

---

## C. Candidatos V2 (`project_areas.area = 'ux-ui'`)

**24 Projects** con área ux-ui en DB LIVE.

### Public-safe (20) — `published=true`, `status ≠ archived`

| id | title (ES) | status | context | type | areas | showOnHome | resources |
|----|------------|--------|---------|------|-------|------------|-----------|
| adapto-pay | Billetera Digital - ADAPTO PAY | completed | presale | mobile-app | ux-ui | yes | 3 |
| apsmm | Sistema de gestión — APSMM | completed | presale | custom-system | ux-ui, graphic | no | 3 |
| casiba | Sistema CASIBA | completed | presale | custom-system | ux-ui | yes | 1 |
| clearwater | CLEARWATER informes | completed | presale | custom-system | ux-ui | yes | 1 |
| cloronor-trading | Cloronor — Plataforma de inversión | completed | presale | web-app | ux-ui | yes | **0** |
| cms-portfolio | CMS portfolio | ongoing | personal | custom-system | ux-ui | no | 1 |
| concitar | Concitar | completed | internal-work | web-app | ux-ui, graphic | yes | **0** |
| mental-training-tech-24-5 | Mental Training Tech 24.5 | completed | presale | mobile-app | ux-ui | yes | **0** |
| mikrobiol | MIKROBIOL tienda | completed | presale | web-app | ux-ui | no | 1 |
| omnigroup | Omnigroup backoffice/tótem | completed | presale | custom-system | ux-ui | yes | 6 |
| repuestos-carlitos | Landing & Tienda Carlitos | completed | client-work | web-app | ux-ui, graphic | yes | **0** |
| savil | Savil | completed | presale | mobile-app | ux-ui | no | 3 |
| simaas-marketplace | Marketplace frutas/verduras | completed | presale | web-app | ux-ui | no | **0** |
| taily | Taily | ongoing | internal-work | mobile-app | ux-ui, graphic | yes | **0** |
| templeton-digital-transformation-assessment | Autodiagnóstico digital | completed | presale | custom-system | ux-ui | yes | **0** |

### Unpublished esperado (4)

| id | motivo |
|----|--------|
| confidential-logistics-system | `published=false`, confidential |
| microtime | `published=false`, deferred |
| proxi | `published=false`, deferred contractual |
| syllabi | `published=false` |

### Publicados pero PRIVACY_BLOCKED (5) — `published=true` + `confidential`

| id | legacy visible hoy | V2 debe excluir |
|----|-------------------|-----------------|
| aicore-inventariado | yes | **yes** |
| aml-casinos | yes | **yes** |
| aml-general | yes | **yes** |
| asesor-financiero | yes | **yes** |
| sessions | no (no en ui_projects) | **yes** |

### Mixed-area (`ux-ui` + `graphic`, public)

apsmm, concitar, repuestos-carlitos, sessions (blocked), taily

---

## D. Mapping legacy → V2

### `ui_projects` (13 filas)

| Legacy ID | V2 ID | Clasificación |
|-----------|-------|---------------|
| apsmm | apsmm | **MATCH** |
| adapto-pay | adapto-pay | **MATCH** |
| clearwater | clearwater | **MATCH** |
| mikrobiol | mikrobiol | **MATCH** |
| casiba | casiba | **MATCH** |
| cms-portfolio | cms-portfolio | **MATCH** |
| omnigroup | omnigroup | **MATCH** |
| savil | savil | **MATCH** |
| aml-casinos | aml-casinos | **PRIVACY_EXCLUDED** |
| aml-general | aml-general | **PRIVACY_EXCLUDED** |
| aicore-inventariado | aicore-inventariado | **PRIVACY_EXCLUDED** |
| asesor-financiero | asesor-financiero | **PRIVACY_EXCLUDED** |
| proxi | proxi | **PRIVACY_EXCLUDED** (V2 `published=false`; legacy aún public) |

**Totales:** MATCH **8** · PRIVACY_EXCLUDED **5** · MISSING **0** · AMBIGUOUS **0**

### `ui_list_items` (8 filas)

| Legacy ID | V2 ID | Clasificación |
|-----------|-------|---------------|
| carlitos | repuestos-carlitos | **REPLACED_BY_V2_PROJECT** |
| simaas | simaas-marketplace | **REPLACED_BY_V2_PROJECT** |
| templeton | templeton-digital-transformation-assessment | **REPLACED_BY_V2_PROJECT** |
| cloronor-trading | cloronor-trading | **REPLACED_BY_V2_PROJECT** |
| push-landing | — | **EXPECTED_DISCARDED** |
| orbita-landing | — | **EXPECTED_DISCARDED** |
| ludica-landing | — | **EXPECTED_DISCARDED** |
| b2b | — | **EXPECTED_DISCARDED** |

---

## E. `ui_list_items` — semántica V2

| Información legacy | Destino V2 |
|--------------------|------------|
| title ES/EN | `projects.title` |
| logo_path | `projects.coverPath` o Entity logo |
| caption / wordmark | No equivalente directo — derivable de summary o descartado |
| sort_order | `projects.sortOrder` |
| Sin carousel | `project_resources[]` cuando hay screenshots |

**Conclusión:** 4 ítems promovidos a Projects completos; 4 descartados (landings + B2B duplicado). La sección orphan list **no tiene equivalente V2** — esos trabajos o son Projects con ficha o desaparecen de Interfaces.

---

## F. `project_resources` (screenshots)

**26 recursos** repartidos en **13** proyectos ux-ui (de 24 candidatos).

| Proyecto | n | Notas |
|----------|---|-------|
| omnigroup | 6 | mayor galería |
| adapto-pay, apsmm, asesor-financiero, savil | 3 c/u | |
| aml-*, aicore-inventariado, casiba, clearwater, cms-portfolio, mikrobiol | 1 c/u | |
| syllabi | 1 | unpublished; path apunta a asset gráfico |

**Proyectos public-safe SIN resources (8):**

cloronor-trading, concitar, mental-training-tech-24-5, repuestos-carlitos, simaas-marketplace, taily, templeton-digital-transformation-assessment

**`frame`:** **null en todos** los recursos LIVE — legacy tenía `aspect: landscape|portrait` en `UiSlide`. Gap de datos para layout modal (`apps-mobile` side carousel).

**Regla respetada:** screenshots son `project_resources`, no Pieces.

---

## G. Assets físicos

Verificación READ-ONLY en `public/` para todos los paths de `project_resources` + covers.

**Resultado:** **0 missing assets** — todos los paths referenciados existen en disco.

---

## H. Detail capability (legacy modal vs V2)

| Campo legacy | Fuente V2 | Clasificación |
|--------------|-----------|---------------|
| title | `projects.title` | **READY** |
| meta (subtítulo + @mentions) | `summary` + entity links + `dateLabel` | **DERIVABLE** |
| summary (ficha larga) | `projects.description` | **READY** (mayoría null hoy) |
| images / carousel | `project_resources[]` + `frame` | **DATA_GAP** (8 proyectos sin resources; frame null) |
| cover (card) | `coverPath` o primer resource landscape | **DERIVABLE** |
| prototypeUrl + ctaKind | `projects.links` JSON | **DATA_GAP** (links no poblados en LIVE para la mayoría) |
| client (texto) | `project_entities` role=client | **DERIVABLE** |
| period / duration | `startYear/Month`, `endYear/Month`, `dateLabel` | **DERIVABLE** |
| category (UiCategory) | `type` + `context` | **DERIVABLE** (mapping table requerida) |
| brandId | `project_entities` brand-owner/client | **DERIVABLE** |
| relatedGraphics | loader Graphic separado | **READY** (sin cambio) |
| prev/next proyecto | — | **NOT_USED** (nunca existió) |
| prev/next slides | resources order | **READY** cuando hay resources |
| locale ES/EN | `pickLocalized` | **READY** |
| Project type / status / roles | campos V2 nativos | **READY** (UI no los muestra hoy) |
| Entity context | `project_entities` + visible filter | **DERIVABLE** (filtrar employer/intermediary) |

---

## I. Taxonomía

### Legacy (UI actual)

Agrupación por **`UiCategory` slug** hardcodeado — 5 categorías, orden fijo en hub.

### V2

- **`project_areas`:** `ux-ui` (filtro de dominio Interfaces)
- **`projects.type`:** `custom-system`, `mobile-app`, `web-app`, …
- **`projects.context`:** `presale`, `client-work`, `personal`, `internal-work`, …
- **`projects.status`:** `ongoing`, `completed`, `archived`
- **Sin categoría Graphic** — no reutilizar `piece` categories

### Mapping propuesto (sin inventar categorías nuevas)

| Legacy `UiCategory` | Señales V2 |
|---------------------|------------|
| `preventas` | `context = presale` |
| `sistemas-a-medida` | `type ∈ {custom-system, web-app}` AND `context ∈ {client-work, presale}` |
| `apps-mobile` | `type = mobile-app` |
| `proyectos-personales` | `context = personal` |
| `system-design` | reservado — 0 filas; no poblar hasta decisión humana |

**Orden:** legacy usa `sort_order` global + sort cliente por año en `meta`. V2 tiene `sortOrder` + años estructurados — **EXPECTED_ORDER_CHANGE** posible.

---

## J. Entities (contexto público)

**Roles en DB para proyectos ux-ui:** client, employer, intermediary, brand-owner, responsible.

**Entidades confidenciales (`visible=0`):** confidential-*-client — no deben mostrarse en UI.

**Regla propuesta (paridad Graphic):**

- **Mostrar:** client, brand-owner, responsible, collaborator (si visible)
- **Ocultar:** employer, intermediary (salvo decisión explícita)
- **No links** a `/marcas` o `/entidades` en 4E.1

**Casos sensibles LIVE:**

| Proyecto | employer visible | client confidencial |
|----------|------------------|---------------------|
| aml-*, aicore-inventariado | aicore (visible) | confidential-* (hidden) |
| asesor-financiero | — | confidential-asesor-client (hidden) |
| sessions | push (visible) | confidential-sessions-client (hidden) |
| proxi | aicore | proxi entity `visible=0` |

---

## K. Roles (`project_roles`)

Disponibles en DB para ux-ui: **ux**, **ui**, **graphic-design**, **visual-direction**, **frontend**, **branding**, **other**.

**UI legacy:** no muestra roles explícitamente — solo meta/summary.

**Paridad:** roles existen en V2; **NOT_USED** en UI actual — disponibles para ficha futura sin bloquear runtime.

---

## L. Publication / privacy

| Bucket | Proyectos ux-ui |
|--------|-----------------|
| **PUBLIC_SAFE** | 15 (listables en Interfaces V2) |
| **PRIVACY_BLOCKED** | 5 (published=true pero confidential — **excluir en adapter**) |
| **UNPUBLISHED_EXPECTED** | 4 (proxi, microtime, syllabi, confidential-logistics) |

**Riesgo crítico:** `getPublicProjectsV2({ area: 'ux-ui' })` devuelve hoy los 5 PRIVACY_BLOCKED porque `published=true`. Interfaces V2 **debe** añadir capa tipo `GRAPHIC_NEVER_RETURN_IDS` + filtro `confidential` del manifest.

**Legacy expone hoy 5 proyectos confidenciales** que V2 debería ocultar — mejora de privacidad intencional, no regresión.

**Sessions:** public-safe en Graphic (`CURRENT_PUBLIC_SAFE`); **blocked** en Interfaces por confidential.

---

## M. Counts — legacy vs V2

| Superficie | Count | Notas |
|------------|-------|-------|
| Legacy ui_projects public | **13** | incluye 5 confidenciales + proxi |
| Legacy ui_list public | **8** | orphan list |
| Legacy superficie total Interfaces | **21** ítems UI | sin deduplicar conceptos |
| V2 ux-ui candidates | **24** | incluye home/named_list promovidos |
| V2 public-safe raw | **20** | `isPublicProject()` |
| V2 Interfaces listing target | **15** | public-safe − confidential |
| V2 mixed-area public | **5** | mismo Project canónico Graphic+Interfaces |

**Diferencias explicadas:**

- **−5** confidenciales legacy visibles → ocultos en V2
- **−1** proxi unpublished en V2
- **−4** ui_list descartados (landings/B2B)
- **+7** Projects nuevos en V2 (list items promovidos + named_list/home: concitar, taily, mental-training, etc.)
- **No buscar paridad 13=15** — el modelo V2 es más correcto semánticamente

---

## N. Home interaction (sin tocar Home)

**10 Projects ux-ui** con `showOnHome=true` en LIVE:

adapto-pay, casiba, clearwater, cloronor-trading, concitar, mental-training-tech-24-5, omnigroup, repuestos-carlitos, taily, templeton-digital-transformation-assessment

Home V2 ya consume estos via `getHomeProjectsV2()` — **mismo Project canónico** que Interfaces V2 usaría. No duplicar Projects.

---

## O. Readiness

### Clasificación: **`LISTING_READY_DETAIL_GAPS`**

| Área | Estado |
|------|--------|
| Listing con screenshots | **Parcial** — 7/15 public-safe tienen resources |
| Detail modal / carousel | **Gaps** — 8 proyectos sin galería; frame null |
| Privacy | **`PRIVACY_DECISION_REQUIRED`** — definir exclusion list antes de flag |
| Taxonomy | **`MODEL_DECISION_REQUIRED`** — mapping type/context → UiCategory |
| ui_list orphan surface | Decisión tomada en migración — UI cambia en V2 |
| Assets on disk | **READY** |
| Reader genérico | **READY** — `getPublicProjectsV2({ area: 'ux-ui' })` |
| Runtime / flag / adapter | **Not started** (4E.1) |

**No es FULL_INTERFACES_READY** hasta:

1. Adapter privacy layer (confidential exclusion)
2. Resources backfill o aceptación de fichas sin carousel para 8 proyectos
3. `frame` population o inferencia landscape/portrait
4. `projects.links` para prototype CTA donde aplique
5. Taxonomy mapper legacy category ↔ V2

---

## P. Contrato adapter propuesto (sin implementar)

```typescript
/** Payload Interfaces V2 — no imitar ui_projects row-for-row */
export type InterfacesContentV2 = {
  locale: Locale;
  /** Proyectos ux-ui public-safe, ya filtrados privacy */
  projects: InterfacesProjectTileV2[];
  /** Categorías derivadas — mismos 5 slugs legacy para UI actual */
  categories: InterfacesCategoryMetaV2[];
  meta: {
    sessionsReview?: "CURRENT_PUBLIC_SAFE"; // si aplica cross-check Graphic
  };
};

export type InterfacesProjectTileV2 = {
  id: string;
  slug: string;
  /** Slug legacy para filtros / URLs /[category] */
  category: UiCategory;
  title: LocalizedString;
  meta: LocalizedString;        // línea secundaria derivada
  coverSlide: UiSlide | null;   // coverPath o primer resource
  imageCount: number;
  brandId: string | null;       // entidad client/brand-owner safe
  sortKey: { year: number | null; title: string };
};

/** Detalle modal — alimentado desde PublicProjectSummary + derivaciones */
export type InterfacesProjectDetailV2 = {
  tile: InterfacesProjectTileV2;
  summary: LocalizedString | null;
  description: LocalizedString | null;
  slides: UiSlide[];            // project_resources → normalizeUiSlides
  prototypeUrl: string | null;  // desde projects.links
  ctaKind: "prototype" | "visitor" | "live" | null;
  client: string | null;        // entidad client visible o null
  period: LocalizedString | null;
  duration: LocalizedString | null;
  relatedGraphics?: Array<{ href: string; label: string }>;
  roles: ProjectRole[];         // disponible, no render obligatorio
  status: ProjectStatus;
  context: ProjectContext;
};
```

**Mapper:** `mapInterfacesContentV2ToCurrentUI()` → `UiProjectContent[]` + `UiListItemContent[]` (lista vacía en V2).

**Flag (4E.1, no ahora):** `INTERFACES_CONTENT_SOURCE=legacy|v2` — patrón Graphic.

---

## Q. Recomendación exacta para 4E.1

1. **Definir `INTERFACES_NEVER_RETURN_IDS`** (mínimo: aicore-inventariado, aml-general, aml-casinos, asesor-financiero, sessions) + respetar `published=false`.
2. **Implementar adapter + UI mapper** (`interfaces.ts`, `interfaces-ui.ts`) — reutilizar `getPublicProjectsV2({ area: 'ux-ui' })`.
3. **Taxonomy mapper** type/context → `UiCategory` (tabla sección I).
4. **Entity role filter** — copiar patrón Graphic (`employer`/`intermediary` hidden).
5. **Decisión humana sobre 8 proyectos sin resources:** backfill DB (fase posterior) vs. listing con cover-only / placeholder modal.
6. **Shadow compare** legacy 13+8 vs V2 15 — expect discarded confidenciales + ui_list.
7. **No tocar** Home, Graphic, Admin, DB en 4E.1 hasta decisión resources/privacy firmada.

---

## Herramienta de audit

Script READ-ONLY ejecutado contra LIVE:

```bash
npx tsx scripts/inspect-interfaces-audit-4e0.ts
```

Output: `reports/_interfaces-audit-4e0-live.json` (artefacto local, no commitear).

---

**DETENIDO en 4E.0 — no se inició 4E.1.**

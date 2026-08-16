# Graphic Detail Gap Resolution Audit — Phase 4D.3B

**Status:** AUDIT COMPLETE (read-only)  
**Date:** 2026-08-16  
**Database:** `portfolio` LIVE  
**No DB writes · No UI · No flag · No cutover**

Evidence: `scripts/audit-graphic-detail-gaps-4d3b.ts` → `reports/_graphic-detail-gaps-4d3b-live.json`  
Approved content: `reports/content-v2-phase-3b-decisions.md` §3B.3 / §3B.4

---

## A. Manual CITF lineage

| Layer | Finding |
|-------|---------|
| **LEGACY MANUAL** | `brand_manuals.id=citf` · title «Manual de Marca 2025 CITF» · year `2025` · brand `citf` · published |
| **V2 PROJECT** | `citf-identity-2025` exists · published · branding / client-work / completed |
| **V2 PIECE (manual)** | **NO existe** |
| Pieces on project today | `itf` (visual-identity), `banner-cluster` (print) only |
| PDF V2 | **no** (0 `project_resources`, 0 `piece_resources` on project) |
| cover V2 | **no** as manual deliverable (cover only on legacy row) |
| **migration lineage** | `brand_manuals:citf` → `project:citf-identity-2025` only. **No** `target_type=piece` for the manual |

### Decisión aprobada (3B.3) vs LIVE

3B.3 aprobó explícitamente:

> Pieces: `itf`, **manual `brand_manuals:citf` (cover+PDF = PieceResources)**, `banner-cluster`  
> **NO** Project separado `citf-manual-2025`

LIVE materializó Project + `itf` + `banner-cluster`, pero **omitió la Piece del manual**.  
El concepto pertenece al Project; **no** hay Piece duplicable — hay que **crear la Piece faltante** (no inventar otro Project).

`invent-citf-2026` sigue prohibido (correcto).

---

## B. Manual assets

| Role | Path | Physical |
|------|------|----------|
| Cover / card thumb | `/assets/grafico/brand-manuals/citf-manual-2025-cover.png` | **exists** (~66 KB) |
| PDF | `/assets/grafico/brand-manuals/citf-manual-2025.pdf` | **exists** (~12.8 MB) |

Mismos paths en fixture `content/grafico/brand-manuals.json` y fila LIVE `brand_manuals`.  
Pueden enlazarse a una Piece V2 nueva vía `src_path` (cover) + `piece_resources` (PDF). **No inventar assets.**

---

## C. Manual UI requirements

### UX actual

| Surface | Behavior |
|---------|----------|
| `#grafico-manuales` | Sección first-class en `GraphicLayer`: card con **cover**, expand con **preview PDF**, download PDF |
| `/grafico/manuals` | `GraphicSectionView` lista `brandManuals` igual (cover + `previewKind=pdf` + `downloadHref`) |
| Click | Expand / preview PDF in-grid; download link; **no** route de Piece detail |
| Brand hub `/marcas/[id]` | `related.manuals` puede listar el mismo manual |

Campos UI: `cover`, `title`, `year`, `meta`, `pdf`, `brandId`.

### Matriz LEGACY UI → V2

| LEGACY UI NEED | V2 FIELD/RESOURCE | Status |
|----------------|-------------------|--------|
| Card cover | Piece.`src_path` = cover | **GAP** (falta Piece) |
| Title ES/EN | Piece.`title` | **GAP** |
| Year | Piece.`year` | **GAP** |
| Meta / subtitle | Piece.`detail` | **GAP** |
| PDF open/download | PieceResource `kind=pdf` (path) | **GAP** |
| Preview PDF in expand | Adapter lee resource pdf → `previewKind` | **MAPPING_REQUIRED** (código 4D.4) |
| Sección Manuales en índice | `GraphicContentV2.manuals[]` (hoy siempre `[]`) | **MAPPING_REQUIRED** |
| brand hub related | Piece↔Entity `citf` + filter manual | **MAPPING_REQUIRED** |
| Category catalog | Schema LIVE: no enum `manual` (`visual-identity`…`other`) | **NEEDS_HUMAN** (categoría) |

**Mínimo para paridad funcional V2:** 1 Piece + PDF resource + mapper que alimente sección Manuales (no basta con data sola).

---

## D. Seyier lineage

| Layer | Finding |
|-------|---------|
| Legacy | `graphic_items.seyier` · section logos · src SVG · gallery **3** frames |
| V2 Project | `seyier-visual-identity` · published |
| V2 Pieces | **solo** `seyier` (logotipo) |
| `piece_resources` | **0** |
| `project_resources` | **0** |
| `legacy_gallery` on Piece | **3 paths** parked (campo temporal Fase 9) |
| migration_map | `graphic_items:seyier` → piece `seyier` + project `seyier-visual-identity` |

---

## E. Seyier missing gallery exacta

| LEGACY ASSET | Label | V2 Piece existente | PieceResource | Asset físico | Autoría |
|--------------|-------|--------------------|---------------|--------------|---------|
| `/assets/grafico/logos/seyier.svg` | Logotipo (main) | **seyier** | n/a (src) | yes | yes (3B.4 voluntario / origin other) |
| `/assets/grafico/logos/seyier/inicio.png` | Pantalla de inicio | **ninguna** | no | yes | yes (mismo item legacy) |
| `/assets/grafico/logos/seyier/portada-fondo.png` | Portada | **ninguna** | no | yes | yes |
| `/assets/grafico/logos/seyier/overlay-ejemplo.png` | Overlay | **ninguna** | no | yes | yes |

Paths también en `pieces.legacy_gallery` de `seyier` — evidencia de intención migratoria incompleta, no de assets perdidos.

---

## F. Piece vs Resource classification

### Manual CITF

Aprobado 3B.3: **Piece** del Project + **PieceResources** (cover como main / PDF como resource).  
No ProjectResource-only. No colgar el PDF de `itf`.

### Seyier

3B.4: *«logo+3 gallery → **Pieces**»* (mismo patrón que Juegos Provinciales: gallery → Pieces).  
Dry-run histórico propuso `seyier-logo` + `seyier-screen-1..3`.

**Clasificación según decisión aprobada: A — entregables distintos → Pieces.**

Migración LIVE contradice: 1 Piece + `legacy_gallery` (ni Pieces ni PieceResources).

| Opción | Alineación 3B | Efecto UX listado |
|--------|---------------|-------------------|
| **A. 3 Pieces nuevas** (screens) | Alineada | 4 cards en visual-identity (≠ 1 card expand) |
| **B. 3 PieceResources** en `seyier` | Desvía 3B.4 | Resta expand gallery legacy |

→ Si se prioriza texto 3B.4: **A**.  
→ Si se prioriza paridad UX del expand actual: **B**, pero eso es **NEEDS_HUMAN_DECISION** (override explícito).

**No asumir B por conveniencia técnica.**

---

## G. Proposed data patch (NO ejecutado)

### Preferencia usuario («solo PieceResources»)

**No alcanza** para cerrar ambos gaps:

1. Manual: **no hay Piece padre** → no se pueden insertar resources del manual.
2. Seyier: resources-only **contradiciría** 3B.4 salvo override humano.

### Patch mínimo alineado a 3B (propuesto, no aplicado)

#### 1) CITF — **requiere NEW Piece** (aprobación humana de id/categoría)

```
Piece:
  id:          citf-manual-2025          # propuesto; aprobar id
  project_id:  citf-identity-2025
  title:       { es: "Manual de Marca 2025 CITF", en: "Brand Manual 2025 CITF" }
  alt:         Manual de Marca 2025 CITF
  category:    ???                       # NEEDS_HUMAN: no existe enum `manual`
                                         # candidatos: other | visual-identity | ampliar schema
  origin:      client
  src_path:    /assets/grafico/brand-manuals/citf-manual-2025-cover.png
  year:        2025
  detail:      meta legacy CITF
  published:   1                         # mirror legacy brand_manuals.published
  sort_order:  (aprobar)

piece_entities:
  citf-manual-2025 ↔ citf (brand-owner, primary)

PieceResource:
  id:        (uuid)
  piece_id:  citf-manual-2025
  path:      /assets/grafico/brand-manuals/citf-manual-2025.pdf
  kind:      pdf
  sortOrder: 0
```

Cover = `src_path` (no duplicar cover como resource salvo necesidad UI).

#### 2) Seyier — **si se confirma A (Pieces)**

```
Piece seyier-inicio:
  project_id: seyier-visual-identity
  src_path:   /assets/grafico/logos/seyier/inicio.png
  category:   visual-identity
  title:      Pantalla de inicio / Starting screen
  published:  1

Piece seyier-portada:
  src_path:   /assets/grafico/logos/seyier/portada-fondo.png
  …

Piece seyier-overlay:
  src_path:   /assets/grafico/logos/seyier/overlay-ejemplo.png
  …
```

No alterar Piece `seyier` (logo) salvo limpiar `legacy_gallery` en fase cleanup.  
`piece_entities` → `seyier` brand-owner.

#### 2′) Seyier — **si humano override a B (Resources)**

```
piece_resources ×3 → piece_id=seyier
  path: inicio / portada-fondo / overlay-ejemplo
  kind: gallery | image
  sortOrder: 0..2
  label: from legacy gallery labels
```

Sin nuevas Pieces.

---

## H. migration_map implications

| Source | Proposed target | Notes |
|--------|-----------------|-------|
| `brand_manuals:citf` | **add** `piece:citf-manual-2025` (mantener project map) | Lineage incompleto hoy |
| `graphic_items:seyier` | Si A: add `piece:seyier-inicio` etc. (mismo source_id, múltiples pieces — ya usado en dry-run) | |
| `graphic_items:seyier` | Si B: add `target_type=resource` por cada gallery path | |

Sin plaintext confidencial.

---

## I. Readiness classification

| Code | Verdict |
|------|---------|
| **A. FULL_GRAPHIC_READY_AFTER_RESOURCE_PATCH** | **No** — resources-only insuficiente (manual sin Piece; Seyier según 3B = Pieces) |
| **B. NEEDS_NEW_PIECES** | **Sí** — Manual CITF Piece faltante (3B.3). Seyier: 3 Pieces faltantes si se confirma A |
| **C. NEEDS_HUMAN_CONTENT_DECISION** | **Sí** — (1) categoría Piece del manual; (2) Seyier Pieces vs Resources / UX listado; (3) ids exactos |
| **D. HYBRID_RUNTIME_STILL_REQUIRED** | **No obligatorio** si se resuelven Pieces + mapper Manuales. Sigue siendo *atajo* si se corta listing antes |

**Clasificación final del audit:**  
**`C. NEEDS_HUMAN_CONTENT_DECISION`** (bloquea ejecución limpia)  
con dependencia clara de **`B. NEEDS_NEW_PIECES`** una vez aprobados id/categoría/modelo Seyier.

Tras decisiones humanas + patch Pieces/resources + mapper sección Manuales → camino a cutover **full V2** sin `brand_manuals` en runtime nuevo.

---

## J. Safety plan (si se aprueba patch — no ejecutar ahora)

1. **Backup LIVE actual** (mysqldump o copia nombrada del día) — **no** reusar solo el backup post-migration original (LIVE ya tiene Home V2 / órdenes / flags posteriores).
2. Transaction explícita: inserts Piece(s) → piece_entities → piece_resources → migration_map.
3. Post-check: counts pieces/resources; `getGraphicContentV2`; shadow; manual cover/PDF paths resolubles; Seyier gallery/pieces; Sessions privacy intacta; `published` sin cambios colaterales.
4. Restore-test: recuperar backup del paso 1 en DB efímera y verificar integridad.
5. Rollback: DELETE por ids insertados (o restore dump) — sin tocar legacy `brand_manuals` / `graphic_items`.

---

## Git / artefactos (estado)

No mezclado en esta auditoría:

- `reports/runtime-v2-home-cutover-4c6.md` dirty (ajeno)
- JPG untracked / logs `_4c5-cold-*` / `_*-live.json` (incl. evidencia 4d3b) — no commit
- Script audit: `scripts/audit-graphic-detail-gaps-4d3b.ts` (nuevo, no committed)

---

## Decisiones humanas pendientes (checklist)

1. Id Piece manual: ¿`citf-manual-2025`?
2. Category: ¿ampliar schema `manual` vs usar `other` / `visual-identity`?
3. Seyier: ¿3 Pieces (3B.4) o 3 PieceResources (paridad expand)?
4. ¿Aprobar creación de Pieces faltantes y luego patch?

**No se ejecutó patch. No se inicia 4D.4.**

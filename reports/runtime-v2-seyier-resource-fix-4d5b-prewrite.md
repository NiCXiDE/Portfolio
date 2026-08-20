# 4D.5B — Seyier resource collapse — PRE-WRITE

Estado: **NO EJECUTADO**. Backup creado. Patch listo. Esperando aprobación humana.

Backup: `backups/portfolio-v2-pre-seyier-resource-fix-20260819-2101.sql`  
(posterior a 4D.3C `...-20260816-0316.sql`)

## 1. Schema real involucrado

`piece_resources` (LIVE):

| Columna | Contrato |
|---|---|
| `id` | PK `varchar(36)` |
| `piece_id` | `varchar(128)` NOT NULL · FK → `pieces.id` **ON DELETE CASCADE** |
| `media_asset_id` | nullable · FK → `media_assets` ON DELETE RESTRICT |
| `path` | nullable `varchar(512)` |
| `kind` | nullable `varchar(32)` |
| `label` | JSON nullable |
| `sort_order` | int NOT NULL default 0 |
| CHECK | `media_asset_id IS NOT NULL OR path IS NOT NULL` |
| Índice | (`piece_id`, `sort_order`) |

Kinds LIVE existentes: **solo** `piece_resource` (3 filas: CITF PDF + 2 event covers). El patch usa el mismo `kind`.

`migration_map.target_type` admite `resource` (ya usado por CITF PDF). Unique: `(source_table, source_id, target_type, target_id)`. Sin FK a pieces.

FKs hacia `pieces`:

- `piece_entities.piece_id` CASCADE
- `piece_tags.piece_id` CASCADE
- `piece_resources.piece_id` CASCADE

Únicas columnas `piece_id` en `portfolio`: esas tres tablas. No hay readers en `src/` que nombren los IDs hermanos.

## 2. Referencias actuales de las 3 Pieces

Todas creadas en 4D.3C (`origin=other`, `category=visual-identity`, `project_id=seyier-visual-identity`, `published=1`).

| id | slug | title ES/EN | src_path | tags | resources | piece_entities |
|---|---|---|---|---|---|---|
| `seyier-inicio` | `seyier-pantalla-inicio` | Pantalla de inicio / Starting screen | `.../seyier/inicio.png` | 0 | 0 | `seyier` brand-owner |
| `seyier-portada` | `seyier-portada` | Portada / Stream cover | `.../seyier/portada-fondo.png` | 0 | 0 | `seyier` brand-owner |
| `seyier-overlay` | `seyier-overlay` | Overlay / Overlay example | `.../seyier/overlay-ejemplo.png` | 0 | 0 | `seyier` brand-owner |

Piece principal **no se altera**:

- `seyier` · slug `seyier-logotipo` · visual-identity · published · parent `seyier-visual-identity` · src `/assets/grafico/logos/seyier.svg` · tag `vector` · `piece_resources` actuales = **0**
- `legacy_gallery` JSON ya lista los 3 paths (intención migratoria). El runtime público usa `piece_resources`, no ese JSON. **No se toca la row.**

Sin hits en: `graphic_items` (solo legacy `seyier`), `media_assets`, `project_resources`, `ui_list_items`, `named_list_items`.  
Project `seyier-visual-identity` y Entity `seyier`: **no se tocan**.  
Manual CITF: **no se toca**.  
Assets físicos: existen y **no se duplican ni se mueven**.

## 3. PieceResources que se crearán

Todos `piece_id=seyier`, `kind=piece_resource`, `media_asset_id=NULL`.

| id | path | label | sort_order |
|---|---|---|---|
| `4d5b1001-5e91-4001-8001-000000000001` | `/assets/grafico/logos/seyier/inicio.png` | Pantalla de inicio / Starting screen | 0 |
| `4d5b1001-5e91-4001-8001-000000000002` | `/assets/grafico/logos/seyier/portada-fondo.png` | Portada / Stream cover | 1 |
| `4d5b1001-5e91-4001-8001-000000000003` | `/assets/grafico/logos/seyier/overlay-ejemplo.png` | Overlay / Overlay example | 2 |

Detalle Graphic **ya soporta** `piece_resources` → `gallery` → `LogoResourceGallery`. Tras el write, `/es/grafico/logos/seyier` dejará de hacer `notFound()` por gallery vacía (comportamiento existente; no es rediseño). Las URLs de las 3 Pieces hermanas pasarán a 404: `EXPECTED_RESOURCE_COLLAPSE`.

## 4. Rows exactas que se eliminarán

1. `piece_entities` donde `piece_id IN (seyier-inicio, seyier-portada, seyier-overlay)` — 3 rows (`seyier` / brand-owner). **No** se borra el link de la Piece principal.
2. `piece_tags` para esos 3 IDs — 0 rows esperadas (DELETE no-op guardado).
3. `pieces` `seyier-inicio`, `seyier-portada`, `seyier-overlay`.

No DELETE de `piece_resources` ajenos. No unpublish: eliminación controlada porque **no existían como contenido V2 canónico** antes de 4D.3C.

## 5. Estrategia `migration_map`

**No** se insertan rows nuevas. **No** se tocan mappings históricos.

Se **retargetean in-place** las 3 rows 4D.3C (mismos `id`):

| id (conservado) | before | after |
|---|---|---|
| `e0082537-dd04-4a1f-a2a4-e92125bb0e9b` | `piece` / `seyier-inicio` | `resource` / `4d5b1001-…0001` |
| `870b1e5a-8b74-401d-9521-560abcfa8166` | `piece` / `seyier-portada` | `resource` / `4d5b1001-…0002` |
| `643a9b85-884c-4167-833f-fdb68f6dca84` | `piece` / `seyier-overlay` | `resource` / `4d5b1001-…0003` |

Notes → `4D.5B: gallery frame → piece_resources of seyier (EXPECTED_RESOURCE_COLLAPSE)`

**Intocados:**

- `graphic_items:seyier` → `piece:seyier` (`a2d5a6f9-…`, `lane=MANUAL_DECISION_MIGRATED`)
- `graphic_items:seyier` → `project:seyier-visual-identity`
- `brands:seyier` → `entity:seyier`
- mappings CITF / resto

Unique `(source_table, source_id, target_type, target_id)` no colisiona: CITF `resource` tiene otro `source_table`.

## 6. Counts before / after

| | before | after |
|---|---|---|
| pieces (DB) | 52 | 49 |
| published (DB) | 49 | 46 |
| Graphic regular público | 47 | **44** |
| manuals | 1 | **1** |
| conceptual public | 48 | **45** |
| Seyier listing | 4 | **1** |
| `piece_resources` | 3 | 6 |
| `migration_map` | 130 | 130 (retarget, no insert/delete) |

El −3 **no** es contenido perdido: `EXPECTED_RESOURCE_COLLAPSE`.

## 7. Backup

| | |
|---|---|
| Archivo | `backups/portfolio-v2-pre-seyier-resource-fix-20260819-2101.sql` |
| Procedimiento | mysqldump **dentro** del container · utf8mb4 · `docker cp` · sin pipes PowerShell |
| Size | 182914 > 0 |
| CREATE TABLE | 27 |
| Restore-test | DB aislada `p_v2_seyier_fix_restore_202608192101` · pieces 52 · published 49 · entities 33 · projects 31 · migration_map 130 · graphic_items 47 |
| Unicode | `Lúdica` HEX `4CC3BA…` · `Órbita LΔB` HEX `C393…CE94…` · no `3F` |
| Restore-test DB | **DROP** después de verificar (LIVE intacta) |

## 8. Guards (abort)

- `DATABASE()` ≠ `portfolio`
- `seyier` no existe exactamente 1 vez, o category/project/src/published no coinciden
- cualquiera de las 3 Pieces origen ≠ 1, o `src_path` distinto al esperado
- `piece_resources` ya en `seyier`, o paths destino ya ocupados, o UUIDs planificados ya existen
- maps 4D.3C ausentes o `id` distinto
- tags en las 3 hermanas (nada que preservar hoy; abort si aparecen)
- tablas extra con columna `piece_id`
- approval env ≠ `1`

## 9. Transaction / rollback

Una sola transacción en `scripts/patch-seyier-resource-fix-4d5b.ts`:

1. INSERT 3 `piece_resources`
2. UPDATE 3 `migration_map` (verificar retarget por SELECT)
3. DELETE junctions de las 3 Pieces
4. DELETE 3 Pieces (verificar 0 remaining)
5. COMMIT · cualquier error → **ROLLBACK**

## 10. Comando exacto (requiere aprobación)

Preflight (read-only, ya listo para correr):

```powershell
npx tsx scripts/preflight-seyier-resource-fix-4d5b.ts
```

Write (**no ejecutar todavía**):

```powershell
$env:DATABASE_NAME='portfolio'
$env:V2_SEYIER_RESOURCE_FIX_4D5B_APPROVED='1'
npx tsx scripts/patch-seyier-resource-fix-4d5b.ts
```

Postcheck (después del write):

```powershell
npx tsx scripts/postcheck-seyier-resource-fix-4d5b.ts
```

## Adapter / shadow (después del write, no ahora)

El listing público caerá a 44 Pieces en cuanto existan los DELETE, **sin** cambiar código.

Hay que actualizar expectativas **después** del apply:

- `seyierGalleryGap`: cerrar cuando `seyier` tenga los 3 resources (hoy exige 4 Pieces hermanas; si no se cambia, el flag volverá a `true`)
- `graphic-shadow`: `EXPECTED_SPLIT_INTO_PIECES` → `EXPECTED_RESOURCE_COLLAPSE`
- inspect/tests 4D.2/4D.4: regular 47→44, Seyier 4→1

No se aplican esos cambios en este pre-write.

## Fuera de alcance

Home · Interfaces · Admin · otras Pieces · Project/Entity Seyier · Manual CITF · assets · schema · UX/QOL · 4D.6 · cutover (`GRAPHIC_CONTENT_SOURCE` default sigue `legacy`).

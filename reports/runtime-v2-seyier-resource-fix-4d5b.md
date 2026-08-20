# 4D.5B — Seyier resource collapse — LIVE APPLY

Estado: **CERRADA** · write ejecutado una sola vez · `GRAPHIC_CONTENT_SOURCE` default sigue **legacy** · no 4D.6.

## Write

| | |
|---|---|
| Runner | `scripts/patch-seyier-resource-fix-4d5b.ts` |
| Approval | `V2_SEYIER_RESOURCE_FIX_4D5B_APPROVED=1` |
| DB | `portfolio` |
| Resultado | `SEYIER_4D5B_EXIT=0` · `COMMIT` |
| Backup previo | `backups/portfolio-v2-pre-seyier-resource-fix-20260819-2101.sql` |

### Cambios aplicados

1. **INSERT** 3 `piece_resources` en Piece `seyier` (paths legacy sin duplicar archivos).
2. **UPDATE** 3 rows `migration_map` 4D.3C: `target_type=piece` → `resource` (mismos `id`).
3. **DELETE** `piece_entities` ×3 + Pieces `seyier-inicio` / `seyier-portada` / `seyier-overlay`.

Piece principal `seyier`: **sin alterar** (src SVG, category, project, published).

Clasificación del delta 47→44 regular: **`EXPECTED_RESOURCE_COLLAPSE`** (no contenido perdido).

## Post-check LIVE

| Check | Resultado |
|---|---|
| `seyier` ×1 publicada | OK |
| Siblings retiradas | 0 rows |
| `piece_resources` de `seyier` | 3 · sort 0/1/2 · paths OK |
| `migration_map` total | 130 · 3 retarget `resource` |
| DB `pieces` | 49 |
| Graphic regular | 44 |
| Manuals | 1 |
| `piece_resources` total | 6 |
| Orphans piece_entities / piece_resources | 0 |
| Manual CITF + PDF | intacto |
| `graphic_items` legacy | 47 |

Postcheck script: `scripts/postcheck-seyier-resource-fix-4d5b.ts` → **ok=true**.

## Adapter / shadow

Actualizado para expectativa post-4D.5B:

- regular **44** · manuals **1**
- Seyier listing **1** · gallery **3 resources**
- shadow: `EXPECTED_RESOURCE_COLLAPSE` (reemplaza split 4D.3C en LIVE)
- `seyierGalleryGap=false` cuando `seyier.resourceCount >= 3`

| Comando | Resultado |
|---|---|
| `npm run inspect:graphic-v2` | `graphic_v2_ok=true` pieces=44 |
| `npm run inspect:graphic-shadow` | `shadow_ok=true` surviving=44 discarded=3 |
| `npm run test:graphic-v2-adapter` | 12/12 |
| `npm run test:graphic-shadow` | 10/10 |
| `npm run test:graphic-flag-4d4` | 6/6 |
| `npx tsc --noEmit` | OK |
| `npm run build` | OK |
| `npm run lint` | pre-existing repo errors (no introducidos por 4D.5B) |

## Runtime V2 (`GRAPHIC_CONTENT_SOURCE=v2`, puerto 3020)

| Ruta | HTTP |
|---|---|
| `/es/grafico/logos` | 200 |
| `/en/grafico/logos` | 200 |
| `/es/grafico/logos/seyier` | 200 |
| `/en/grafico/logos/seyier` | 200 |

Observado:

- Listing: **0** hits `seyier-inicio` (no duplicados en grid).
- Detail Seyier: gallery con `inicio.png`, `portada-fondo.png`, `overlay-ejemplo.png`.
- Sin runtime errors en server log.

## 4D.5 revisión humana — cierre

Hallazgo Seyier (`UX_ISSUE` + `CONTENT_MODEL_ADJUSTMENT`): **resuelto** por 4D.5B.

Resto de Gráfico confirmado OK en 4D.5 — sin otros cambios.

## Artefactos

- `reports/_4d5b-preflight.json`
- `reports/_4d5b-patch-result.json`
- `reports/_4d5b-postcheck.json`
- `reports/_graphic-shadow-4d3-live.json` (regenerado)
- `reports/runtime-v2-graphic-visual-validation-4d5.md`
- `reports/runtime-v2-seyier-resource-fix-4d5b-prewrite.md` (plan pre-write)

## No hecho

- Cutover default Graphic → v2
- 4D.6
- Admin / Interfaces / Home / UX-QOL

## Recomendación

Graphic V2 sigue listo bajo flag (`FULL_GRAPHIC_READY`, `shadow_ok=true`). Cutover default permanece decisión humana separada (4D.6+).

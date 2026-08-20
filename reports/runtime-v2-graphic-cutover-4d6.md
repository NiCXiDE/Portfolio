# Graphic V2 Cutover — Phase 4D.6

**Status:** COMPLETE — **`4D_GRAPHIC_CUTOVER_COMPLETE`**  
**Date:** 2026-08-19  
**Commit:** `664fc7a` — `feat(content): make v2 graphic runtime default`

---

## A. Default anterior

`GRAPHIC_CONTENT_SOURCE` unset → **legacy** (4D.4–4D.5)

## B. Default nuevo

`GRAPHIC_CONTENT_SOURCE` unset → **v2**

| Valor env | Resultado |
|-----------|-----------|
| (unset) | **v2** |
| `v2` | v2 |
| `legacy` | legacy (rollback explícito) |
| inválido / `""` | legacy (fallback seguro) |

## C. Resolver final

`src/lib/content-v2/graphic-source.ts` — único cambio de comportamiento:

- `undefined` → **v2**
- `"v2"` → v2
- `"legacy"` → legacy
- invalid / empty → legacy (+ warn en development)

Nombre del flag sin cambios: `GRAPHIC_CONTENT_SOURCE`.

## D. Smoke V2 default (HTTP)

**UNA** instancia `next start --port 3020`, **sin** `GRAPHIC_CONTENT_SOURCE`, **sin** `HOME_CONTENT_SOURCE`:

| Ruta | Status |
|------|--------|
| `/es/grafico` | **200** |
| `/en/grafico` | **200** |
| `/es/grafico/logos` | **200** |
| `/en/grafico/logos` | **200** |
| `/es/grafico/logos/seyier` | **200** |
| `/en/grafico/logos/seyier` | **200** |
| `/es/grafico/manuals` | **200** |
| `/en/grafico/manuals` | **200** |
| `/es/grafico/illustration` | **200** |
| `/en/grafico/illustration` | **200** |
| `/es/grafico/eventos` | **200** |
| `/en/grafico/eventos` | **200** |
| `/es/grafico/banners` | **200** |
| `/en/grafico/banners` | **200** |

Trace log (`GRAPHIC_CONTENT_LOAD_TRACE=1`):

```
[graphic-load] source=v2 loaders=v2-graphic
```

## E. Rollback legacy

Instancia separada (sin instancias Next simultáneas), `GRAPHIC_CONTENT_SOURCE=legacy`:

| Ruta | Status |
|------|--------|
| `/es/grafico` | **200** |
| `/en/grafico` | **200** |
| `/es/grafico/logos` | **200** |
| `/es/grafico/manuals` | **200** |

In-process: `source=legacy`, `loaders=legacy-graphic`, sin `v2-graphic`.

## F. Invalid fallback

`GRAPHIC_CONTENT_SOURCE=invalid` → **legacy** (resolver + inspector).

## G. No double-read

| Modo | Loaders graphic |
|------|-----------------|
| unset / v2 | `v2-graphic` only |
| legacy / invalid | `legacy-graphic` only |

Verificado en `scripts/test-graphic-flag-4d4.ts` (integration) y `scripts/inspect-graphic-flag.ts`.

Branch-before-query en `loadPortfolioContentForLocale` sin cambios.

## H. Counts canonical (V2 default)

| Superficie | Count |
|------------|-------|
| regular Pieces | **44** |
| manuals | **1** |

Legacy rollback conserva counts legacy (47 regular) — esperado.

## I. Seyier final

| Check | Result |
|-------|--------|
| Pieces públicos en grid logos | **1** (`seyier`) |
| PieceResources en detail | **3** |
| Gallery gap | **closed** (`EXPECTED_RESOURCE_COLLAPSE`) |

## J. Manual CITF

| Check | Result |
|-------|--------|
| Presente en `brandManuals[]` | yes |
| PDF resoluble | `/assets/grafico/brand-manuals/citf-manual-2025.pdf` |
| Excluido de grid logos | yes |

## K. ES / EN

Inspector + HTTP smoke: mismos counts ES/EN, rutas bilingües **200**.

## L. Privacy (default V2)

| Check | Result |
|-------|--------|
| forbidden alias hits | **0** |
| confidential placeholders | **0** |
| unpublished parent leaks | **0** |
| discarded legacy items leaked | **0** |
| Sessions review | **CURRENT_PUBLIC_SAFE** |

## M. Tests / build

| Command | Result |
|---------|--------|
| `npm run test:graphic-flag-4d4` | **10/10 pass** |
| `npm run test:graphic-v2-adapter` | **12/12 pass** |
| `npm run test:graphic-shadow` | **10/10 pass** |
| `npm run inspect:graphic-v2` | **ok** (44/1/seyier3) |
| `npm run inspect:graphic-shadow` | **ok** |
| `npm run inspect:graphic-flag` | **ok** (unset/v2/legacy/invalid) |
| `npx tsc --noEmit` | **pass** |
| `npm run build` | **pass** |
| `npm run lint` | **37 errors baseline** (sin nuevos) |

## N. Legacy todavía preservado

Sin eliminación ni cleanup:

- `GRAPHIC_CONTENT_SOURCE=legacy` rollback funcional
- tablas `graphic_items`, `brand_manuals`
- loaders / mappers legacy en `src/lib/content.ts`
- shadow compare legacy↔V2 intacto

## O. Estado final de 4D

| Flag unset | Fuente |
|------------|--------|
| **Home** | **V2** (4C.6) |
| **Graphic** | **V2** (4D.6) |
| **Interfaces** | legacy (sin cambio) |

**Clasificación:** `4D_GRAPHIC_CUTOVER_COMPLETE`

---

### Archivos tocados (4D.6)

- `src/lib/content-v2/graphic-source.ts` — default unset → v2
- `scripts/test-graphic-flag-4d4.ts` — resolver + loader integration tests
- `scripts/inspect-graphic-flag.ts` — inspector cutover unset/v2/legacy/invalid
- `reports/runtime-v2-graphic-cutover-4d6.md` — este reporte

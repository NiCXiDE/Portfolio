# Graphic Feature Flag + V2 Runtime — Phase 4D.4

**Status:** COMPLETE  
**Date:** 2026-08-16  
**Default:** `GRAPHIC_CONTENT_SOURCE` unset → **legacy**  
**Cutover:** **not** started (4D.5+)

Home remains V2 by default (`HOME_CONTENT_SOURCE` unset → v2).

---

## A. Routes / entrypoints

| ROUTE | Legacy loader | V2 replacement |
|-------|---------------|----------------|
| `/[locale]/grafico` (LayerShell → GraphicLayer) | `loadPortfolioContentForLocale` → graphic_items + brand_manuals | same loader → `getGraphicContentV2` + `mapGraphicContentV2ToCurrentUI` |
| `/[locale]/grafico/[section]` | was `loadPortfolioContent()` | now `loadPortfolioContentForLocale(locale)` (flag-aware) |
| `/[locale]/grafico/manuals` | section=`manuals` → brandManuals | manuals[] → brandManuals |
| `/[locale]/grafico/logos/[id]` | `loadGraphicSection("logos")` | `loadGraphicDetailItemForLocale` (Piece resources only) |
| `/[locale]/grafico/eventos/[id]` | `loadGraphicSection("eventos")` | same helper (campaigns Pieces) |
| `generateStaticParams` logos/eventos | JSON fixtures | **unchanged** (legacy build default) |
| sitemap | JSON fixtures | unchanged (navigation catalog; not runtime content) |

`/marcas` untouched (still legacy related reads).

---

## B. Flag

| | |
|--|--|
| Env | `GRAPHIC_CONTENT_SOURCE` |
| Values | `legacy` \| `v2` |
| Default | **legacy** (undefined / invalid → legacy) |
| Resolver | `getGraphicContentSource()` in `graphic-source.ts` |
| Surface | server-only (no `NEXT_PUBLIC_*`, no cookies/query) |

---

## C. Branching / no double-read

`loadPortfolioContentForLocale`:

- `graphic=v2` → `graphicLists: "omit"` (no graphic_items / brand_manuals) + `getGraphicContentV2`
- `graphic=legacy` → include legacy graphic queries; **no** V2 graphic reader

Trace: `getLastGraphicLoadTrace()` → `legacy-graphic` XOR `v2-graphic`.

Inspectors: legacy + v2 both `noDoubleRead=true`.

---

## D. UI mapper

`mapGraphicContentV2ToCurrentUI`:

- visual-identity → `logos`
- illustration-artwork → `illustration`
- campaigns-communication → `eventos`
- print → `banners`
- manuals[] → `brandManuals`
- covers/personal → `[]` (not recreated as categories)
- no artificial Seyier gallery
- no `/marcas` brandId wiring

---

## E. Sections

V2 index skips empty Portadas/Personal (nav + blocks). Labels remain dict.grafico (Logos, Ilustración, Eventos, Banners, Manuales).

---

## F. Regular Pieces

Inspect V2: **47** regular · manuals **1** · conceptual **48**.  
Manual not duplicated in logos grid.

---

## G. Seyier split

V2: 4 logos (`seyier`, `seyier-inicio`, `seyier-portada`, `seyier-overlay`).  
Legacy: 1 (`seyier` with gallery).  
No carousel rebuild.

---

## H. Manuals

V2: `citf-manual-2025` cover + PDF from PieceResource.  
`#grafico-manuales` + `/grafico/manuals` via `brandManuals` props.  
No `brand_manuals` table read when source=v2.

---

## I. Detail routing

- Logo detail: requires gallery/resources; Seyier V2 → no gallery page (404) — approved model.
- Event detail: resolves Piece by id under campaigns-communication.
- Static params kept from JSON for default-legacy builds.

---

## J. ES / EN

`getGraphicContentV2(locale)` uses route locale via layout/section loaders.

---

## K. Filters / sorting

Existing TagFilter + SortButtons unchanged. No new Project/Entity filters.

Order: V2 category sort vs legacy section order — `EXPECTED_ORDER_CHANGE` (documented in 4D.3).

---

## L. Privacy

Adapter still strips employer/intermediary; discarded ids filtered; Sessions public-safe.  
V2 related brand hub not loaded (avoids legacy relatedByBrand).

---

## M. Tests

- `npm run test:graphic-flag-4d4` — flag matrix + mapper
- existing graphic-v2 / shadow tests

---

## N. Runtime legacy

`inspect:graphic-flag` (unset): `source=legacy`, loaders=`legacy-graphic`, manuals present, ok.

---

## O. Runtime V2

`GRAPHIC_CONTENT_SOURCE=v2 npm run inspect:graphic-flag`:  
`source=v2`, loaders=`v2-graphic`, regular=47, manuals=1, seyier=4, PDF/cover ok, Home still v2 default.

---

## P. Visual gaps (accepted)

- No Portadas/Personal sections under V2
- No Seyier multi-image logo detail page
- No `/marcas` chips from Graphic V2 items
- Event related section empty under V2 (no legacy relatedByBrand)

---

## Q. Recommendation for 4D.5

Human visual smoke with `GRAPHIC_CONTENT_SOURCE=v2` on `/es/grafico`, `/en/grafico`, manuals, event details.  
If approved → cutover default to v2 (mirror Home 4C.6), keep `legacy` rollback.

**Do not change default in this phase.**

---

## Success criteria

- [x] Flag exists, default legacy  
- [x] V2 feeds full Graphic experience when set  
- [x] 47 + 1 manual  
- [x] Seyier split  
- [x] Manual PDF  
- [x] Details flag-aware  
- [x] ES/EN via locale  
- [x] No double-read  
- [x] Legacy rollback intact  
- [x] Home still V2 default  
- [x] DB untouched  

# Home data patch — Phase 4C.1

**Status:** APPLIED on LIVE `portfolio`  
**Date:** 2026-08-15  
**Guard:** `V2_HOME_DATA_PATCH_4C1_APPROVED=1`  
**Script:** `scripts/apply-home-data-patch-4c1.ts` (`npm run db:apply-home-data-patch-4c1`)  
**Post-check:** `scripts/inspect-home-data-patch-4c1.ts`  
**Source of truth for values:** `reports/runtime-v2-home-readiness-4c0.md` (§J / human 4C.0B decisions)

---

## A. Preflight (READ-ONLY, before UPDATE)

**Database:** `portfolio` ✓

### Entities (6) — all `visible=true`, `show_on_home=true`

| id | home_order before | page_enabled |
|----|------------------:|--------------|
| aicore | null | true |
| apsmm | null | false |
| citf | null | true |
| ludica | null | false |
| orbita-l-b | null | false |
| push | null | true |

### Projects to enable (12) — each exists once, `published=true`, expected status, `show_on_home=false`, `home_order=null`

| id | status | target home_order |
|----|--------|------------------:|
| adapto-pay | completed | 0 |
| casiba | completed | 1 |
| clearwater | completed | 2 |
| cloronor-trading | completed | 3 |
| expedicion-polo | completed | 4 |
| juegos-provinciales | completed | 5 |
| mental-training-tech-24-5 | completed | 6 |
| omnigroup | completed | 7 |
| concitar | completed | 8 |
| repuestos-carlitos | completed | 9 |
| templeton-digital-transformation-assessment | completed | 10 |
| taily | ongoing | 0 |

**Preflight result:** OK — no ABORT.

---

## B. Entities before → after

| id | home_order before | home_order after | other columns |
|----|------------------:|-----------------:|---------------|
| aicore | null | **0** | unchanged (visible/show_on_home/page_enabled) |
| apsmm | null | **1** | unchanged |
| citf | null | **2** | unchanged |
| ludica | null | **3** | unchanged |
| orbita-l-b | null | **4** | unchanged |
| push | null | **5** | unchanged |

Only column written: `entities.home_order`.

---

## C. Projects before → after

| id | show_on_home | home_order | published/status |
|----|--------------|------------|------------------|
| *(12 ids above)* | false → **true** | null → **approved** | **unchanged** |

Only columns written: `projects.show_on_home`, `projects.home_order`.

---

## D. Filas afectadas

| Statement set | changed/affected (first apply) |
|---------------|-------------------------------:|
| Entity `home_order` UPDATEs | **6** |
| Project `show_on_home` + `home_order` UPDATEs | **12** |

No mass `UPDATE projects SET show_on_home=false`. Explicit IDs only.

**Not enabled:** sessions, asesor-financiero, aicore-inventariado, aml-general, aml-casinos, confidential-logistics-system, microtime, syllabi, proxi.

---

## E. Transaction / commit

- Single transaction: BEGIN → entity UPDATEs → project UPDATEs → pre-commit asserts → **COMMIT**
- Pre-commit asserts: 6 entities orders; 12 projects final state; zero unpublished/archived/forbidden on Home among checks
- **transaction exit:** success (`commit_ok`)
- On assert failure path: ROLLBACK (not triggered)

---

## F. Home V2 counts post (`getHome*V2`)

| Reader | Count |
|--------|------:|
| `getHomeEntitiesV2()` | **6** |
| `getHomeProjectsV2()` | **12** |
| `getPublicTestimonialsV2()` | **4** |

### Entity order

0 aicore → 1 apsmm → 2 citf → 3 ludica → 4 orbita-l-b → 5 push

---

## G. Past / Current by status (not by homeOrder)

| Section rule | Count | IDs |
|--------------|------:|-----|
| PAST (`completed`) | **11** | adapto-pay … templeton-digital-transformation-assessment |
| CURRENT (`ongoing`) | **1** | **taily** only |

`home_order` does not encode section. Future adapter must filter by `status`.

Note: `getHomeProjectsV2()` currently returns a flat list sorted by global `homeOrder` (taily and adapto-pay both 0 interleave) — expected until 4C.2 adapter splits sections.

---

## H. Privacy / publication checks

| Check | Result |
|-------|--------|
| `show_on_home=1 AND published=0` | **0** |
| archived on Home | **0** |
| forbidden/NEEDS_REVIEW/BLOCK ids on Home | **0** |
| unpublished leaks via readers | **0** (public filter) |

---

## I. Legacy / runtime intact

| Surface | Status |
|---------|--------|
| `src/lib/content.ts` | untouched |
| HomeLayer / layout / public pages | untouched |
| Admin / `/marcas` / fixtures / seed / sync / schema | untouched |
| `named_list_items` | untouched |
| Feature flag | **not** added |
| Home public cutover | **not** done — Home still legacy |

---

## Validation

- `npx tsc --noEmit` → exit 0
- `npm run build` → exit 0

---

## Human decisions applied

- Concitar / Repuestos Carlitos → PAST via `status=completed` (status not changed)
- Taily → CURRENT via `status=ongoing`
- Sessions OFF; Syllabi OFF (`published=false`)
- Templeton → existing `templeton-digital-transformation-assessment`

---

## Next (not started)

**4C.2** — `HomeContentV2` adapter (section from status, order from homeOrder).

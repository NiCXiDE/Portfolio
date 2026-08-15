# Home Shadow Runtime Validation — Phase 4C.3

**Status:** COMPLETE — semantic shadow only; Home público sigue legacy  
**Date:** 2026-08-15  
**Database:** `portfolio` (LIVE, read-only)  
**Module:** `src/lib/content-v2/home-shadow.ts`  
**Inspector:** `npm run inspect:home-shadow`  
**Tests:** `npm run test:home-shadow` (7/7)

---

## A. Snapshot model

`HomeShadowSnapshot` — common semantic shape (not raw DTO equality):

- `entities[]` — key, displayName, order, hasLogo, clickable, hrefKind, futureEntityPageUnavailable  
- `pastProjects[]` / `currentProjects[]` — key, displayName, section, order, clickable, hrefKind + `coverRequired:false` / `projectRouteRequired:false`  
- `testimonials[]` — key, displayName, organization, hasAvatar, order, hasOrgLink, quote/role lengths  

`hrefKind`: `internal` | `external` | `none`

---

## B. Legacy normalization

`normalizeLegacyHome(slice, locale)` from `loadPortfolioContent()` **only inside the inspector** (not public Home).

- Companies → entities via `brandId` / label heuristics → canonical keys (`aicore`…) or `legacy-company:{id}`  
- Projects → `resolveLegacyProjectKey(label)` (Templeton → `templeton-digital-transformation-assessment`)  
- Testimonials → id + `t(quote/role, locale)` lengths; org from `company.name`  
- `hubHref` → internal if path, external if http(s)

`src/lib/content.ts` **unchanged**.

---

## C. V2 normalization

`normalizeHomeContentV2(getHomeContentV2(locale))`

- Entities/projects/testimonials from adapter only  
- No extra queries  
- No invented `/entidades` / `/marcas`

---

## D. Expected differences (whitelist)

| Kind | Meaning |
|------|---------|
| `EXPECTED_REMOVED_ENTITY` | Legacy marquee chip not among 6 Home Entities |
| `EXPECTED_REMOVED_PROJECT` | Discard / unpublished / review / optional (SIMAAS, etc.) |
| `EXPECTED_SECTION_CHANGE` | Concitar, Repuestos Carlitos: current → past |
| `EXPECTED_NO_INTERNAL_HREF` | Legacy `/marcas` hub dropped; V2 external or none |
| `EXPECTED_MODEL_RENAME` | logo↔logoUrl, hubHref↔href, company↔organization, … |
| `EXPECTED_COUNT_DELTA` | 18→6 entities, 16→11 past, 6→1 current |

Anything else → `UNEXPECTED` → `shadow_ok=false`.

---

## E. Unexpected differences

LIVE inspector: **0** unexpected (ES and EN).

---

## F. Links / hrefs (4C.4 matrix)

| item | legacy clickable | legacy kind | V2 clickable | V2 kind | 4C.4 action |
|------|------------------|---------------|--------------|---------|-------------|
| aicore | no | none | yes | external | logo→logoUrl; use external href |
| apsmm | no | none | no | none | null href; no `/entidades` |
| citf | yes | internal | no | none | drop `/marcas`; null until Entity page |
| ludica | no | none | yes | external | external href |
| orbita-l-b | no | none | yes | external | external href |
| push | no | none | yes | external | external href |

`pageEnabled=true` does **not** create `/entidades/[slug]` in this phase.

---

## G. Logos

Semantic `hasLogo` only. Survivor entities: no unexpected logo loss. V2 gaining logo where legacy chip had none → expected model note.

---

## H. Project sections

| Check | Result |
|-------|--------|
| V2 CURRENT | **taily** only |
| Concitar | PAST (`EXPECTED_SECTION_CHANGE`) |
| Repuestos Carlitos | PAST (`EXPECTED_SECTION_CHANGE`) |
| Covers / project routes | `NOT_REQUIRED_FOR_CURRENT_HOME` (text chips) |

---

## I. Templeton

Legacy `Templeton & Matthews` → `templeton-digital-transformation-assessment` in V2 PAST. Not missing/unexpected.

---

## J. Testimonials

4/4 both sides; same id sequence; avatars present; org non-empty on V2 (Entity-first via adapter).

---

## K. ES / EN

| Flag | Value |
|------|-------|
| `shadow_es_ok` | **true** |
| `shadow_en_ok` | **true** |
| `shadow_ok` | **true** |

---

## L. Shadow results (LIVE)

| | Legacy | V2 |
|--|-------:|---:|
| entities | 18 | 6 |
| past | 16 | 11 |
| current | 6 | 1 |
| testimonials | 4 | 4 |

Per locale ≈ **33** expected diffs, **0** unexpected.

---

## M. Exact mapping needed in 4C.4

| CURRENT HOME PROP | V2 SOURCE | MAPPING |
|-------------------|-----------|---------|
| `companies[].label` | `entities[].label` | direct |
| `companies[].logo` | `entities[].logoUrl` | rename |
| `companies[].hubHref` | `entities[].href` | external → `<a>`; null → chip; never invent hubs |
| `pastProjects` / `currentProjects` | same arrays | already split by status |
| `*.label` (projects) | `label` / `title` | localized string |
| project logo/hub | coverUrl/href | **not required** for current marquee |
| `testimonials[].image` | `imageUrl` | rename |
| `testimonials[].company` | `organization` | rename (+ logoUrl) |
| `brands` / bio / homeLayout | legacy | keep until later |

---

## N. Feature flag design (NOT implemented)

```
HOME_CONTENT_SOURCE=legacy|v2
default: legacy
scope: Home only (server-side)
no public query-param toggle
```

Constant: `HOME_CONTENT_SOURCE_FLAG_DESIGN` in `home-shadow.ts`.

---

## Explicit non-actions

No HomeLayer / layout / `content.ts` changes · no double-read on public Home · no DB · no Admin · no `/entidades` · no flag wiring · Home público 100% legacy

---

## Validation

- `npm run test:home-shadow` → 7/7  
- `npm run inspect:home-shadow` → shadow_ok=true  
- `npx tsc --noEmit` → 0  
- `npm run build` → 0  
- lint → existing baseline (no new content-v2 issues)

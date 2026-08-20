# Home Content V2 Adapter — Phase 4C.2

**Status:** COMPLETE — adapter isolated, **not** wired to UI  
**Date:** 2026-08-15  
**Database:** `portfolio` (LIVE, read-only for this phase)  
**Entry:** `getHomeContentV2(locale)` in `src/lib/content-v2/home.ts`  
**Inspector:** `npm run inspect:home-v2`  
**Tests:** `npm run test:home-v2-adapter`

---

## A. Consumer Home legacy actual

| Surface | Role |
|---------|------|
| `src/app/[locale]/layout.tsx` | `loadPortfolioContent()` → `LayerShell` |
| `HomeLayer` | Renders bio + `homeLayout.sectionOrder` marquees + testimonials |
| `InfiniteMarquee` | Consumes `NamedListItemContent[]` (`id`, `label`, `logo`, `hubHref`) |
| Testimonials block | `TestimonialContent` (`image`, `quote`/`role` via `t()`, `company.{logo,href,name,linkLabel}`) |

### Legacy field → UI → V2 source

| LEGACY FIELD | UI CONSUMER | V2 SOURCE |
|--------------|-------------|-----------|
| `companies[].label/logo/hubHref` | InfiniteMarquee (companies) | `getHomeEntitiesV2()` → `HomeContentV2.entities` |
| `pastProjects[]` | InfiniteMarquee (past) | `getHomeProjectsV2()` + `status=completed` |
| `currentProjects[]` | InfiniteMarquee (current) | `getHomeProjectsV2()` + `status=ongoing` |
| `testimonials[]` + `company` | HomeLayer articles | `getPublicTestimonialsV2()` → Entity-first org |
| `brands` (MentionedText) | quote/role mentions | unchanged for now (still legacy at cutover) |
| `settings.homeLayout` | section order / marquee config | still legacy settings |

---

## B. Arquitectura del adapter

```
getHomeEntitiesV2() ─┐
getHomeProjectsV2() ─┼─→ buildHomeContentV2(locale) → HomeContentV2
getPublicTestimonialsV2() ─┘
```

- No legacy SQL / `named_list_items` / fixtures
- Pure `buildHomeContentV2` + `splitHomeProjectsV2` for unit tests
- Async `getHomeContentV2(locale)` for shadow / future flag

---

## C. HomeContentV2 DTO

```ts
{
  locale,
  entities: HomeEntityItemV2[],      // marquee orgs
  pastProjects: HomeProjectItemV2[], // status=completed
  currentProjects: HomeProjectItemV2[], // status=ongoing
  testimonials: HomeTestimonialItemV2[],
}
```

Not a clone of `PortfolioContent`. Not a resurrection of `named_list_items`.  
4B base DTOs unchanged.

---

## D. Entity mapping

| Field | Behavior |
|-------|----------|
| label | `shortName` \|\| `name` |
| logoUrl | from Entity |
| href | **only** `https?://…` from Entity.href |
| pageEnabled | ignored for href (no `/entidades/[slug]`) |
| order | `homeOrder` via `compareHomeOrder` |

Shadow order: aicore → apsmm → citf → ludica → orbita-l-b → push.

---

## E. Project mapping

Chip-oriented (Home is text marquee today):

| Field | Behavior |
|-------|----------|
| label/title | `pickLocalized(title, locale)` |
| coverUrl | passthrough; **null if missing** (not invented) |
| href | first http(s) in `links[]` only; **no Project route** |
| clientLabel | visible `client` entity, else first visible related |

---

## F. Past / Current rule

| Section | Rule |
|---------|------|
| pastProjects | `status === "completed"` |
| currentProjects | `status === "ongoing"` |
| excluded | `archived` (and anything else) |

`homeOrder` sorts **within** section only.

Expected LIVE: past=**11**, current=**1** (`taily`). Concitar + Repuestos Carlitos in PAST.

---

## G. Testimonials mapping

- Entity metadata primary; `legacyCompany` fallback only
- Localized quote/role/linkLabel via `pickLocalized`
- Org href only if external http(s)
- linkLabel cleared when no href

---

## H. Locale

`getHomeContentV2("es" | "en")` — same strategy as 4B `pickLocalized` (prefer locale, fallback `es`). No auto-translation / hardcoded copy.

---

## I. href / image behavior

| Case | Result |
|------|--------|
| Entity pageEnabled without external href | `href=null` |
| `/entidades/*` or `/marcas/*` | never generated |
| Project without cover | `coverUrl=null` |
| Project without external link | `href=null` |

---

## J. Shadow counts (LIVE)

`npm run inspect:home-v2` → `shadow_ok=true`

| Locale | entities | past | current | testimonials |
|--------|---------:|-----:|--------:|-------------:|
| es | 6 | 11 | 1 (`taily`) | 4 |
| en | 6 | 11 | 1 (`taily`) | 4 |

Checks: duplicate IDs=0 · archived=0 · forbidden/confidential=0 · invented entity/marcas hrefs=0

---

## K. Legacy vs V2 UI matrix

| HOME UI NEED | LEGACY SHAPE | V2 ADAPTER FIELD | UI CHANGE REQUIRED? |
|--------------|--------------|------------------|---------------------|
| Company marquee label | `label` | `entities[].label` | **small** rename / map at wire |
| Company logo | `logo` | `logoUrl` | **yes** (field name) |
| Company hub | `hubHref` → `/${locale}/marcas/…` | `href` external or null | **yes** — no `/marcas` invent; Link vs `<a>` |
| Past/current chips | `NamedListItemContent` (numeric id) | `HomeProjectItemV2` (string id) | **yes** — id type + field names |
| Project logo | usually null | `coverUrl` (usually null) | no visual change |
| Testimonial image | `image` | `imageUrl` | **yes** rename |
| Testimonial company | `company.*` | `organization.*` | **yes** rename |
| MentionedText brands | `content.brands` | not in HomeContentV2 | **yes** at cutover — keep legacy brands or map entities |
| homeLayout / bio | settings + bio | out of adapter | no (stay legacy) |

Cutover is **not** transparent: needs a thin UI map or HomeLayer props adaptation in 4C.4 — not a drop-in `PortfolioContent`.

---

## L. Changes needed in 4C.3 / 4C.4

| Step | Work |
|------|------|
| **4C.3** | Shadow script comparing legacy Home marquees vs adapter counts/IDs (structural, not 1:1 content) |
| **4C.4** | Feature flag Home-only; map `HomeContentV2` → marquee/testimonial props; keep bio/settings/brands legacy until later |

---

## M. Riesgos pendientes

1. **Visual delta:** V2 entities=6 vs legacy companies=18 (by design).
2. **hubHref gone:** fewer clickable marquees until Entity pages exist.
3. **MentionedText** still needs brand list at cutover.
4. **InfiniteMarquee** typed to legacy `NamedListItemContent` — requires adapter-at-UI or type widen.
5. Flat `getHomeProjectsV2()` order ≠ sectioned order until this adapter (already correct here).

---

## Explicit non-actions

No DB writes · no feature flag · no HomeLayer/layout/`content.ts` changes · no Admin · no `/entidades` · no named_list deletion · Home público sigue legacy

# Home Feature Flag + V2 UI Integration — Phase 4C.4

**Status:** COMPLETE — default **legacy**; V2 opt-in via env  
**Date:** 2026-08-15  
**Flag:** `HOME_CONTENT_SOURCE=legacy|v2` (server-side only)

---

## A. Entrypoint modificado

| Before | After |
|--------|--------|
| `src/app/[locale]/layout.tsx` → `loadPortfolioContent()` | → `loadPortfolioContentForLocale(locale)` |

`LayerShell` / `HomeLayer` still receive `PortfolioContent`.  
Gráfico / Interfaces pages that call `loadPortfolioContent()` directly remain legacy-only (unchanged).

Home-relevant fields: `companies`, `pastProjects`, `currentProjects`, `testimonials` (+ shared bio/settings/brands for MentionedText).

---

## B. Feature flag

- Env: **`HOME_CONTENT_SOURCE`**
- **Not** `NEXT_PUBLIC_*`
- No query params / cookies

## C. Default / fallback

| Value | Result |
|-------|--------|
| unset | legacy |
| `legacy` | legacy |
| `v2` | v2 |
| anything else | legacy (+ dev warning) |

Resolver: `getHomeContentSource()` in `src/lib/content-v2/home-source.ts`.

---

## D. Branch without double-read

`loadPortfolioContentForLocale(locale)`:

- **legacy:** `loadPortfolioContent({ homeLists: "include" })` only → trace `legacy-full`
- **v2:** parallel `loadPortfolioContent({ homeLists: "omit" })` + `getHomeContentV2(locale)` → trace `legacy-shell,v2-home`

`homeLists: "omit"` skips **`named_list_items`** and legacy **testimonials** queries.  
Does **not** run both Home list sources.

---

## E. UI mapper

`mapHomeContentV2ToCurrentUI(home)` in `home-ui.ts`:

| V2 | Current UI |
|----|------------|
| `logoUrl` | `logo` |
| `href` | `hubHref` (external or null) |
| `label` | `label` |
| `organization` | `company` |
| `imageUrl` | `image` |

No domain recreation of `named_list_items`.

---

## F. Entities mapping

6 entities in `homeOrder`; no `/entidades` / `/marcas` invented.  
`InfiniteMarquee`: external `hubHref` uses `<a target=_blank>`; internal paths keep `Link`.

## G. Projects mapping

`pastProjects` / `currentProjects` from adapter as-is. Chips: `logo=null` (covers not required). Expected LIVE: **11 / 1 (`taily`)**.

## H. Testimonials mapping

4 items → legacy `TestimonialContent` shape for HomeLayer.

## I. Locale

`getHomeContentV2(locale)` with layout locale (`es` | `en`).

---

## J. Tests

`npm run test:home-flag-4c4` — 8/8 (flag + mapper).

`npm run inspect:home-flag` — `home_flag_ok=true` (loaders, counts, privacy hints).

---

## K. Legacy runtime check

`HOME_CONTENT_SOURCE=legacy` (default): loaders=`legacy-full`, counts 18/16/6/4.

## L. V2 runtime check

`HOME_CONTENT_SOURCE=v2`: loaders=`legacy-shell,v2-home`, counts **6/11/1/4**, current=Taily, no `/entidades`.

---

## M. Visual comparison

Automated browser pass **not** run in this environment.  
**Requires human review** locally:

```bash
# terminal A
HOME_CONTENT_SOURCE=legacy npm run dev
# open /es and /en — Home marquees + testimonials

# terminal B (restart)
HOME_CONTENT_SOURCE=v2 npm run dev
# same URLs — expect fewer chips, same layout chrome
```

## N. Marquee with 6 / 11 / 1

`InfiniteMarquee` already duplicates items presentationally (`[...items, ...items]`).  
**CURRENT with 1 item (`taily`)** may look sparse / animation-odd — **gap for human decision**, not auto-filled with legacy chips.

## O. Privacy

Readers remain the barrier; inspector V2 branch: forbidden Home project hints empty; unpublished not in Home lists.

## P. Differences / bugs found

| Item | Severity |
|------|----------|
| Content count delta (18→6, etc.) | Expected |
| citf loses internal `/marcas` hub under V2 | Expected (4C.3) |
| Single-item current marquee UX | Visual gap — decide in 4C.5 |
| External marquee links need `<a>` | Fixed in InfiniteMarquee |

## Q. Recommendation for 4C.5

1. Human visual QA ES/EN with `HOME_CONTENT_SOURCE=v2`  
2. Decide CURRENT=1 marquee UX (accept / copy tweak / later status change — not fake items)  
3. Only then consider default→v2 (separate approval)  
4. Keep flag reversible; do not delete named_list yet

---

## Explicit non-actions

Default remains **legacy** · no Admin/DB/Gráfico/Interfaces/`/marcas` cutover · no Entity pages · named_list retained

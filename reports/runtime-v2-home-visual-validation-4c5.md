# Home Visual Validation — Phase 4C.5 / 4C.5B

**Status:** 4C.5 human review completed · **4C.5B presentational fixes approved** · **4C.5C speed = 100 px/s**  
**Date:** 2026-08-16  
**Default remains `HOME_CONTENT_SOURCE=legacy`** · **no 4C.6** · **no cutover**

---

## 4C.5C — Marquee speed (microajuste)

Decisión humana: 200 px/s se percibía demasiado rápida.

| Antes | Después |
|-------|---------|
| 200 px/s | **100 px/s** |

Aplicado a Entities + Featured Projects vía `HOME_V2_MARQUEE_SPEED_PX_S` (mismo override V2).

Sin cambios: dirección, loop, spacing, duplicación, easing, contenido, orden, UI, DB.

### Backlog estético (solo registro — no bloquea cutover)

- Aumentar separación entre listas/marquees y Testimonials.
- Estudiar agrupar visualmente Empresas + Proyectos destacados en una zona/box común.
- Revisar jerarquía visual de Testimonials respecto de las listas.

---

## 4C.5B — Pre-cutover visual fixes (implemented)

### Decisión: Featured Projects (una sola sección)

| Antes | Después |
|-------|---------|
| Past (`completed`) + Current (`ongoing`) como secciones UI | Una sola sección **Proyectos destacados** / **Featured projects** |
| Orden por banda de status | Orden solo por `homeOrder` (completed + ongoing mezclados) |
| Taily solo en Current | Taily en Featured (`home_order=11`) |

Filtro de dominio (sin cambio de arquitectura de publication):

- `published=true`
- `showOnHome=true`
- `status != archived`

**No** se habilitaron proyectos nuevos (Bass Series, Portfolio/Admin, Nonna, etc.).

### homeOrder — colisión reportada y parche LIVE

Al unificar secciones, `adapto-pay` y `taily` compartían `home_order=0`.

| id | before | after |
|----|--------|-------|
| adapto-pay | 0 | 0 (sin cambio) |
| taily | 0 | **11** |

Script: `scripts/patch-taily-home-order-4c5b.ts`  
Orden Featured resultante (0→11): adapto-pay … templeton … **taily**.

### Current section

- **UI:** no se renderiza (`sectionOrder` sin `current_projects`; `HomeLayer` omite si `homeProjectsPresentation=featured`).
- **Datos:** `status`, `currentProjects` en read model / shadow, `showOnHome` **intactos**.
- Reversible sin CMS de secciones.

### InfiniteMarquee — loop + velocidad + cursor

| Fix | Detalle |
|-----|---------|
| Loop seamless | Flex `gap` rompía `-50%` (N gaps impar). Ahora trailing `margin-inline-end` + shift medido en px (`--marquee-shift` = offset del 2º set). |
| Velocidad | Entities + Featured: **100 px/s** (`HOME_V2_MARQUEE_SPEED_PX_S`, 4C.5C); duration = `shiftPx / speed`. |
| Cursor | Sin `cursor-grab`. Links → `cursor-nav` / pointer; chips sin href → default. |
| Duplicación | Solo presentacional en el componente (`[...items, ...items]`); dominio sin duplicar. |

### Links Home

| Superficie | Comportamiento 4C.5B |
|------------|----------------------|
| Entities marquee | `hubHref=null` en mapper UI (URLs siguen en read model) |
| Featured projects | Labels only; sin rutas inventadas ni externos |
| Testimonials | **Sin cambios** |

### Flag / cutover

- `.env` **no** define `HOME_CONTENT_SOURCE` → default **v2** (4C.6 cutover).
- Validación local con session `HOME_CONTENT_SOURCE=v2` únicamente.
- **No 4C.6.**

---

## Validación local 4C.5B

### In-process (`scripts/inspect-home-visual-4c5b.ts`)

| Check | ES | EN |
|-------|----|----|
| source / loaders | v2 · legacy-shell,v2-home | igual |
| presentation | featured | featured |
| sectionOrder | companies, past_projects, testimonials | igual |
| speeds | 100 / 100 | 100 / 100 |
| entities | 6 | 6 |
| featured (pastProjects slot) | **12** | **12** |
| current UI | **0** | **0** |
| Taily in featured | yes | yes |
| any company/project hubHref | **false** | **false** |
| unset flag → | legacy | — |

### HTTP (`next start` :3010, `HOME_CONTENT_SOURCE=v2`)

| Check | Result |
|-------|--------|
| `/es` `/en` | **200** |
| Título Featured ES/EN | presente en markup |
| Títulos past/current legacy | solo en dict serializado, no como sección Current |
| `cursor-grab` | **ausente** |
| `marquee-link` | **0** (sin nav en marquees) |
| `marquee-shift` | presente |
| Taily | presente |
| Trace | `[home-load] source=v2 loaders=legacy-shell,v2-home` |

`aicore.com` puede aparecer en HTML por brands/testimonials/assets — **no** vía marquee Entity links (`marquee-link=0`).

### Tooling

| Command | Result |
|---------|--------|
| `npm run test:home-v2-adapter` | pass (9) |
| `npm run test:home-flag-4c4` | pass (10) |
| `npm run test:home-shadow` | pass (7) |
| `npx tsc --noEmit` | pass |
| `npm run build` | pass |
| `npm run lint` | falla por errores **preexistentes** (admin/`any`/hooks); **sin** hallazgos nuevos en archivos 4C.5B |

---

## Pendientes explícitamente diferidos

- 4C.6 cutover / default=v2  
- Bass Series, Portfolio/Admin, Nonna `showOnHome`  
- logos/vectores pendientes  
- drag + click en marquee  
- buscador global  
- footer Exploración  
- navegación con flechas  
- Admin QOL/UX  
- project pages / entity pages  
- testimonials redesign (compacta, foto menor, etc.)  
- Gráfico / Interfaces runtime V2  

---

## Archivos tocados (código)

- `src/lib/content-v2/home.ts` — `featuredProjects` + `buildFeaturedHomeProjectsV2`
- `src/lib/content-v2/home-ui.ts` — mapper featured; hubHref Home = null
- `src/lib/content-v2/home-runtime.ts` — layout V2 + 100 px/s (4C.5C)
- `src/lib/content.ts` — `homeProjectsPresentation`
- `src/components/layers/HomeLayer.tsx` — título Featured; skip Current
- `src/i18n/dictionaries.ts` — `featuredProjectsTitle`
- `src/components/InfiniteMarquee.tsx` + `src/app/globals.css` — loop/cursor
- tests + `scripts/patch-taily-home-order-4c5b.ts` + `scripts/inspect-home-visual-4c5b.ts`

---

## 4C.5 (histórico — revisión humana)

Ver secciones A–H originales abajo: payload legacy-split (11 past + 1 current), cold-start 500 clasificado como DEV_COLD_START_TRANSIENT, production smoke OK. La decisión humana motivó 4C.5B (esta sección).

---

## A. Entorno usado (4C.5 original)

| Item | Value |
|------|--------|
| Flag | session-only `$env:HOME_CONTENT_SOURCE='v2'` (`.env` **not** modified) |
| Trace | `HOME_CONTENT_LOAD_TRACE=1` |
| Server | `npx next dev --port 3005` / luego `next start` |
| DB | `portfolio` LIVE (read) |

**Confirmación source=v2:** sí.

---

## Notas 4C.5 (pre-4C.5B)

- Past 11 + Current 1 (Taily) — **superseded** por Featured 12.
- Entity external hrefs en payload — **superseded**: Home UI ya no navega.
- Cold start 500 en `next dev` = DEV_COLD_START_TRANSIENT; `next start` PRODUCTION_SMOKE_OK.
